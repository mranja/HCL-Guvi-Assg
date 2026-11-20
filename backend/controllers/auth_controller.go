package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"pulsepoll/config"
	"pulsepoll/middleware"
	"pulsepoll/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=2,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid name, email address, and password (min 6 characters)"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
	cleanName := strings.TrimSpace(input.Name)

	usersColl := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	var existing models.User
	err := usersColl.FindOne(ctx, bson.M{"email": cleanEmail}).Decode(&existing)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "An account with this email address already exists. Please sign in."})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt credentials"})
		return
	}

	newUser := models.User{
		ID:         primitive.NewObjectID(),
		Email:      cleanEmail,
		Password:   string(hashedPassword),
		Name:       cleanName,
		IsVerified: true, // Direct sign-in without OTP blockers
		CreatedAt:  time.Now(),
	}

	_, err = usersColl.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user in MongoDB Atlas"})
		return
	}

	token, err := middleware.GenerateToken(newUser.ID, newUser.Email, newUser.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully!",
		"token":   token,
		"user": gin.H{
			"id":          newUser.ID.Hex(),
			"email":       newUser.Email,
			"name":        newUser.Name,
			"is_verified": true,
		},
	})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email and password required"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	usersColl := config.DB.Collection("users")
	var user models.User
	err := usersColl.FindOne(ctx, bson.M{"email": cleanEmail}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database lookup failed"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":          user.ID.Hex(),
			"email":       user.Email,
			"name":        user.Name,
			"is_verified": true,
		},
	})
}

func GetMe(c *gin.Context) {
	userID, _ := c.Get("userID")
	userEmail, _ := c.Get("userEmail")
	userName, _ := c.Get("userName")

	c.JSON(http.StatusOK, gin.H{
		"id":    userID,
		"email": userEmail,
		"name":  userName,
	})
}
