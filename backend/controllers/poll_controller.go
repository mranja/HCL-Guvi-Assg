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
	"pulsepoll/store"

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
	VoterID  string `json:"voter_id"` // client fingerprint identifier
}

func pollVotesKey(pollID string) string {
	return fmt.Sprintf("poll:%s:votes", pollID)
}

func pollTotalKey(pollID string) string {
	return fmt.Sprintf("poll:%s:total", pollID)
}

func pollVotersKey(pollID string) string {
	return fmt.Sprintf("poll:%s:voters", pollID)
}

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

	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		collection := config.DB.Collection("polls")
		if _, err := collection.InsertOne(ctx, poll); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to persist poll in MongoDB"})
			return
		}
	} else {
		_, _ = store.DB.CreatePoll(poll)
	}

	// Initialize Redis Hash for fast O(1) in-memory vote counters
	if config.RDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		pipe := config.RDB.Pipeline()
		pipe.Del(ctx, pollVotesKey(poll.ID.Hex()))
		pipe.Set(ctx, pollTotalKey(poll.ID.Hex()), 0, 0)
		for _, opt := range poll.Options {
			pipe.HSet(ctx, pollVotesKey(poll.ID.Hex()), opt.ID, 0)
		}
		_, _ = pipe.Exec(ctx)
	}

	c.JSON(http.StatusCreated, poll)
}

func GetPoll(c *gin.Context) {
	idHex := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Poll ID format"})
		return
	}

	var poll *models.Poll

	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var p models.Poll
		err = config.DB.Collection("polls").FindOne(ctx, bson.M{"_id": objID}).Decode(&p)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
			return
		}
		poll = &p
	} else {
		p, err := store.DB.GetPoll(objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
			return
		}
		poll = p
	}

	// Enrich with real-time Redis data if available
	if config.RDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

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
	}

	c.JSON(http.StatusOK, poll)
}

func ListPolls(c *gin.Context) {
	var polls []models.Poll

	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(30)
		cursor, err := config.DB.Collection("polls").Find(ctx, bson.M{}, findOptions)
		if err == nil {
			defer cursor.Close(ctx)
			_ = cursor.All(ctx, &polls)
		}
	} else {
		polls, _ = store.DB.ListPolls()
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	// Enrich from Redis
	if config.RDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

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
	}

	c.JSON(http.StatusOK, polls)
}

func ListMyPolls(c *gin.Context) {
	userID, _ := c.Get("userID")
	objUserID := userID.(primitive.ObjectID)

	var polls []models.Poll

	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
		cursor, err := config.DB.Collection("polls").Find(ctx, bson.M{"creator_id": objUserID}, findOptions)
		if err == nil {
			defer cursor.Close(ctx)
			_ = cursor.All(ctx, &polls)
		}
	} else {
		polls, _ = store.DB.ListMyPolls(objUserID)
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	if config.RDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

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
	}

	c.JSON(http.StatusOK, polls)
}

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

	var poll *models.Poll

	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var p models.Poll
		if err := config.DB.Collection("polls").FindOne(ctx, bson.M{"_id": objID}).Decode(&p); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll does not exist"})
			return
		}
		poll = &p
	} else {
		p, err := store.DB.GetPoll(objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll does not exist"})
			return
		}
		poll = p
	}

	if !poll.IsActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This poll is closed and no longer accepting votes"})
		return
	}

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

	voterRaw := input.VoterID
	if voterRaw == "" {
		voterRaw = c.ClientIP() + "-" + c.GetHeader("User-Agent")
	}
	hash := sha256.Sum256([]byte(voterRaw))
	voterHash := hex.EncodeToString(hash[:])

	// 2. Redis Set check: prevent duplicate voting using SADD
	if config.RDB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		votersKey := pollVotersKey(idHex)
		isNewVoter, err := config.RDB.SAdd(ctx, votersKey, voterHash).Result()
		if err == nil && isNewVoter == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "You have already cast your vote on this poll"})
			return
		}

		// Increment Redis Hash
		votesKey := pollVotesKey(idHex)
		totalKey := pollTotalKey(idHex)

		newOptionVotes, _ := config.RDB.HIncrBy(ctx, votesKey, input.OptionID, 1).Result()
		newTotalVotes, _ := config.RDB.Incr(ctx, totalKey).Result()

		// Refresh options list
		votesMap, _ := config.RDB.HGetAll(ctx, votesKey).Result()
		for i := range poll.Options {
			if val, ok := votesMap[poll.Options[i].ID]; ok {
				count, _ := strconv.ParseInt(val, 10, 64)
				poll.Options[i].Votes = count
			}
		}
		poll.TotalVotes = newTotalVotes

		// Persist update
		go func() {
			if config.DB != nil {
				bgCtx, bgCancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer bgCancel()

				_, _ = config.DB.Collection("polls").UpdateOne(bgCtx,
					bson.M{"_id": objID, "options.id": input.OptionID},
					bson.M{
						"$inc": bson.M{"options.$.votes": 1, "total_votes": 1},
						"$set": bson.M{"updated_at": time.Now()},
					},
				)
			} else {
				_ = store.DB.IncrementVote(objID, input.OptionID, voterHash)
			}
		}()

		// Realtime broadcast via Redis + WebSocket
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
		return
	}

	// In case Redis isn't initialized yet
	_ = store.DB.IncrementVote(objID, input.OptionID, voterHash)
	pUpdated, _ := store.DB.GetPoll(objID)

	realtimePayload := gin.H{
		"event":       "vote_cast",
		"poll_id":     idHex,
		"option_id":   input.OptionID,
		"total_votes": pUpdated.TotalVotes,
		"options":     pUpdated.Options,
	}
	_ = realtime.PublishPollUpdate(idHex, realtimePayload)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Vote cast successfully",
		"poll_id":     idHex,
		"option_id":   input.OptionID,
		"total_votes": pUpdated.TotalVotes,
		"options":     pUpdated.Options,
	})
}

func TogglePollStatus(c *gin.Context) {
	idHex := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Poll ID format"})
		return
	}

	userID, _ := c.Get("userID")

	var poll *models.Poll
	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var p models.Poll
		if err := config.DB.Collection("polls").FindOne(ctx, bson.M{"_id": objID}).Decode(&p); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
			return
		}
		poll = &p
	} else {
		p, err := store.DB.GetPoll(objID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
			return
		}
		poll = p
	}

	if poll.CreatorID != userID.(primitive.ObjectID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the creator of this poll can change its status"})
		return
	}

	newStatus := !poll.IsActive
	if config.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_, _ = config.DB.Collection("polls").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"is_active": newStatus, "updated_at": time.Now()}})
	} else {
		_ = store.DB.TogglePollStatus(objID, newStatus)
	}

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
