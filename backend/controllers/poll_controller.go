package controllers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"pulsepoll/config"
	"pulsepoll/models"
	"pulsepoll/realtime"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CreateOptionInput struct {
	Text string `json:"text" binding:"required,min=1,max=150"`
}

type CreatePollInput struct {
	Title       string   `json:"title" binding:"required,min=3,max=200"`
	Description string   `json:"description" binding:"max=500"`
	Options     []string `json:"options" binding:"required,min=2,max=10"`
}

type VoteInput struct {
	OptionID string `json:"option_id" binding:"required"`
	VoterID  string `json:"voter_id"` // client fingerprint identifier (optional, fallback to IP)
}

// helper to format Redis key names
func pollVotesKey(pollID string) string {
	return fmt.Sprintf("poll:%s:votes", pollID)
}

func pollTotalKey(pollID string) string {
	return fmt.Sprintf("poll:%s:total", pollID)
}

func pollVotersKey(pollID string) string {
	return fmt.Sprintf("poll:%s:voters", pollID)
}

// CreatePoll handles poll creation by an authenticated user
func CreatePoll(c *gin.Context) {
	var input CreatePollInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation error: Title (min 3 chars) and at least 2 non-empty options required (max 10)"})
		return
	}

	cleanTitle := strings.TrimSpace(input.Title)
	if len(cleanTitle) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title must be at least 3 characters"})
		return
	}

	var pollOptions []models.PollOption
	for i, opt := range input.Options {
		optTrim := strings.TrimSpace(opt)
		if optTrim == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Option #%d cannot be blank", i+1)})
			return
		}
		pollOptions = append(pollOptions, models.PollOption{
			ID:    fmt.Sprintf("opt_%d", i+1),
			Text:  optTrim,
			Votes: 0,
		})
	}

	userID, _ := c.Get("userID")
	userName, _ := c.Get("userName")

	poll := models.Poll{
		ID:          primitive.NewObjectID(),
		Title:       cleanTitle,
		Description: strings.TrimSpace(input.Description),
		Options:     pollOptions,
		CreatorID:   userID.(primitive.ObjectID),
		CreatorName: userName.(string),
		TotalVotes:  0,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := config.DB.Collection("polls")
	if _, err := collection.InsertOne(ctx, poll); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to persist poll in MongoDB"})
		return
	}

	// Initialize Redis Hash for fast O(1) in-memory vote counters
	pipe := config.RDB.Pipeline()
	pipe.Del(ctx, pollVotesKey(poll.ID.Hex()))
	pipe.Set(ctx, pollTotalKey(poll.ID.Hex()), 0, 0)
	for _, opt := range poll.Options {
		pipe.HSet(ctx, pollVotesKey(poll.ID.Hex()), opt.ID, 0)
	}
	_, _ = pipe.Exec(ctx)

	c.JSON(http.StatusCreated, poll)
}

// GetPoll returns a single poll, syncing the latest vote counters directly from Redis
func GetPoll(c *gin.Context) {
	idHex := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Poll ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var poll models.Poll
	collection := config.DB.Collection("polls")
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&poll)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	// Enrich with real-time Redis data if available
	votesMap, err := config.RDB.HGetAll(ctx, pollVotesKey(idHex)).Result()
	if err == nil && len(votesMap) > 0 {
		var total int64
		for i := range poll.Options {
			if countStr, ok := votesMap[poll.Options[i].ID]; ok {
				count, _ := strconv.ParseInt(countStr, 10, 64)
				poll.Options[i].Votes = count
				total += count
			}
		}
		poll.TotalVotes = total
	}

	c.JSON(http.StatusOK, poll)
}

// ListPolls returns recent active polls
func ListPolls(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(30)
	cursor, err := config.DB.Collection("polls").Find(ctx, bson.M{}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch polls"})
		return
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err = cursor.All(ctx, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse polls"})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	// Enrich each poll's counts from Redis
	for i := range polls {
		idHex := polls[i].ID.Hex()
		votesMap, err := config.RDB.HGetAll(ctx, pollVotesKey(idHex)).Result()
		if err == nil && len(votesMap) > 0 {
			var total int64
			for j := range polls[i].Options {
				if countStr, ok := votesMap[polls[i].Options[j].ID]; ok {
					count, _ := strconv.ParseInt(countStr, 10, 64)
					polls[i].Options[j].Votes = count
					total += count
				}
			}
			polls[i].TotalVotes = total
		}
	}

	c.JSON(http.StatusOK, polls)
}

// ListMyPolls returns polls created by the logged-in user
func ListMyPolls(c *gin.Context) {
	userID, _ := c.Get("userID")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := config.DB.Collection("polls").Find(ctx, bson.M{"creator_id": userID}, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch your polls"})
		return
	}
	defer cursor.Close(ctx)

	var polls []models.Poll
	if err = cursor.All(ctx, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse polls"})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	for i := range polls {
		idHex := polls[i].ID.Hex()
		votesMap, err := config.RDB.HGetAll(ctx, pollVotesKey(idHex)).Result()
		if err == nil && len(votesMap) > 0 {
			var total int64
			for j := range polls[i].Options {
				if countStr, ok := votesMap[polls[i].Options[j].ID]; ok {
					count, _ := strconv.ParseInt(countStr, 10, 64)
					polls[i].Options[j].Votes = count
					total += count
				}
			}
			polls[i].TotalVotes = total
		}
	}

	c.JSON(http.StatusOK, polls)
}

// Vote handles submitting a vote.
// Redis drives the high-performance atomic counters & duplicate voter set check,
// followed by Redis Pub/Sub broadcast to all connected WebSocket clients.
func Vote(c *gin.Context) {
	idHex := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Poll ID format"})
		return
	}

	var input VoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "option_id is required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Fetch Poll metadata from MongoDB
	var poll models.Poll
	collection := config.DB.Collection("polls")
	if err := collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&poll); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll does not exist"})
		return
	}

	if !poll.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This poll is closed and no longer accepting votes"})
		return
	}

	// Validate Option exists
	var validOption bool
	for _, opt := range poll.Options {
		if opt.ID == input.OptionID {
			validOption = true
			break
		}
	}
	if !validOption {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Selected option does not exist for this poll"})
		return
	}

	// Compute voter unique key for double-vote protection
	voterRaw := input.VoterID
	if voterRaw == "" {
		voterRaw = c.ClientIP() + "-" + c.GetHeader("User-Agent")
	}
	hash := sha256.Sum256([]byte(voterRaw))
	voterHash := hex.EncodeToString(hash[:])

	// 2. Redis Set check: prevent duplicate voting using SADD
	// Returns 1 if voter was added, 0 if voter already voted
	votersKey := pollVotersKey(idHex)
	isNewVoter, err := config.RDB.SAdd(ctx, votersKey, voterHash).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Redis operation failed"})
		return
	}

	if isNewVoter == 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already cast your vote on this poll"})
		return
	}

	// 3. Atomically increment option vote count in Redis Hash
	votesKey := pollVotesKey(idHex)
	totalKey := pollTotalKey(idHex)

	newOptionVotes, err := config.RDB.HIncrBy(ctx, votesKey, input.OptionID, 1).Result()
	if err != nil {
		// Rollback SAdd
		config.RDB.SRem(ctx, votersKey, voterHash)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to increment vote in Redis"})
		return
	}

	newTotalVotes, _ := config.RDB.Incr(ctx, totalKey).Result()

	// 4. Async sync/persist to MongoDB
	go func() {
		bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer bgCancel()

		// Update option vote count & total votes
		_, _ = collection.UpdateOne(bgCtx,
			bson.M{"_id": objID, "options.id": input.OptionID},
			bson.M{
				"$inc": bson.M{
					"options.$.votes": 1,
					"total_votes":     1,
				},
				"$set": bson.M{"updated_at": time.Now()},
			},
		)

		// Record vote audit log
		_, _ = config.DB.Collection("vote_logs").InsertOne(bgCtx, models.VoteLog{
			ID:        primitive.NewObjectID(),
			PollID:    objID,
			OptionID:  input.OptionID,
			VoterKey:  voterHash,
			CreatedAt: time.Now(),
		})
	}()

	// 5. Gather all updated options for real-time broadcast
	votesMap, _ := config.RDB.HGetAll(ctx, votesKey).Result()
	for i := range poll.Options {
		if val, ok := votesMap[poll.Options[i].ID]; ok {
			count, _ := strconv.ParseInt(val, 10, 64)
			poll.Options[i].Votes = count
		}
	}
	poll.TotalVotes = newTotalVotes

	// 6. Broadcast via Redis Pub/Sub -> WebSockets to all connected viewers in real time
	realtimePayload := gin.H{
		"event":       "vote_cast",
		"poll_id":     idHex,
		"option_id":   input.OptionID,
		"option_vote": newOptionVotes,
		"total_votes": newTotalVotes,
		"options":     poll.Options,
	}
	_ = realtime.PublishPollUpdate(idHex, realtimePayload)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Vote cast successfully",
		"poll_id":     idHex,
		"option_id":   input.OptionID,
		"total_votes": newTotalVotes,
		"options":     poll.Options,
	})
}

// TogglePollStatus allows the creator to open or close the poll
func TogglePollStatus(c *gin.Context) {
	idHex := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Poll ID format"})
		return
	}

	userID, _ := c.Get("userID")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var poll models.Poll
	collection := config.DB.Collection("polls")
	if err := collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&poll); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if poll.CreatorID != userID.(primitive.ObjectID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the creator of this poll can change its status"})
		return
	}

	newStatus := !poll.IsActive
	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"is_active": newStatus, "updated_at": time.Now()}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update poll status"})
		return
	}

	// Broadcast status change
	_ = realtime.PublishPollUpdate(idHex, gin.H{
		"event":     "status_changed",
		"poll_id":   idHex,
		"is_active": newStatus,
	})

	c.JSON(http.StatusOK, gin.H{
		"message":   "Poll status toggled",
		"is_active": newStatus,
	})
}
