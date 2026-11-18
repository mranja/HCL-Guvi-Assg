package store

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"time"

	"pulsepoll/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type FileData struct {
	Users    []models.User   `json:"users"`
	Polls    []models.Poll   `json:"polls"`
	VoteLogs []models.VoteLog `json:"vote_logs"`
}

type LocalStore struct {
	mu       sync.RWMutex
	filePath string
	data     FileData
}

var DB *LocalStore

func InitLocalStore(dataDir string) error {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return err
	}

	fp := filepath.Join(dataDir, "data.json")
	store := &LocalStore{
		filePath: fp,
		data: FileData{
			Users:    []models.User{},
			Polls:    []models.Poll{},
			VoteLogs: []models.VoteLog{},
		},
	}

	if _, err := os.Stat(fp); err == nil {
		bytes, err := os.ReadFile(fp)
		if err == nil {
			_ = json.Unmarshal(bytes, &store.data)
		}
	}

	DB = store
	return nil
}

func (s *LocalStore) save() error {
	bytes, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath, bytes, 0644)
}

// User operations
func (s *LocalStore) FindUserByEmail(email string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, u := range s.data.Users {
		if u.Email == email {
			return &u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (s *LocalStore) CreateUser(name, email, password string) (*models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, u := range s.data.Users {
		if u.Email == email {
			return nil, errors.New("user already exists")
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := models.User{
		ID:        primitive.NewObjectID(),
		Email:     email,
		Password:  string(hashedPassword),
		Name:      name,
		CreatedAt: time.Now(),
	}

	s.data.Users = append(s.data.Users, user)
	_ = s.save()
	return &user, nil
}

// Poll operations
func (s *LocalStore) CreatePoll(poll models.Poll) (*models.Poll, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.Polls = append(s.data.Polls, poll)
	_ = s.save()
	return &poll, nil
}

func (s *LocalStore) GetPoll(id primitive.ObjectID) (*models.Poll, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, p := range s.data.Polls {
		if p.ID == id {
			return &p, nil
		}
	}
	return nil, errors.New("poll not found")
}

func (s *LocalStore) ListPolls() ([]models.Poll, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy
	res := make([]models.Poll, len(s.data.Polls))
	copy(res, s.data.Polls)
	// reverse to show newest first
	for i, j := 0, len(res)-1; i < j; i, j = i+1, j-1 {
		res[i], res[j] = res[j], res[i]
	}
	return res, nil
}

func (s *LocalStore) ListMyPolls(creatorID primitive.ObjectID) ([]models.Poll, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var res []models.Poll
	for i := len(s.data.Polls) - 1; i >= 0; i-- {
		if s.data.Polls[i].CreatorID == creatorID {
			res = append(res, s.data.Polls[i])
		}
	}
	return res, nil
}

func (s *LocalStore) IncrementVote(pollID primitive.ObjectID, optionID, voterKey string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.data.Polls {
		if s.data.Polls[i].ID == pollID {
			for j := range s.data.Polls[i].Options {
				if s.data.Polls[i].Options[j].ID == optionID {
					s.data.Polls[i].Options[j].Votes++
					s.data.Polls[i].TotalVotes++
					s.data.Polls[i].UpdatedAt = time.Now()
					break
				}
			}
			break
		}
	}

	s.data.VoteLogs = append(s.data.VoteLogs, models.VoteLog{
		ID:        primitive.NewObjectID(),
		PollID:    pollID,
		OptionID:  optionID,
		VoterKey:  voterKey,
		CreatedAt: time.Now(),
	})

	return s.save()
}

func (s *LocalStore) TogglePollStatus(pollID primitive.ObjectID, newStatus bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.data.Polls {
		if s.data.Polls[i].ID == pollID {
			s.data.Polls[i].IsActive = newStatus
			s.data.Polls[i].UpdatedAt = time.Now()
			return s.save()
		}
	}
	return errors.New("poll not found")
}
