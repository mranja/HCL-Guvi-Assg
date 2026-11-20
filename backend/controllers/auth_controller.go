package controllers

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
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

type VerifyInput struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func generateOTP() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(900000))
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid name, email, and password (min 6 chars)"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
	cleanName := strings.TrimSpace(input.Name)

	// Enforce Gmail validation requirement
	if !strings.HasSuffix(cleanEmail, "@gmail.com") && !strings.HasSuffix(cleanEmail, "@googlemail.com") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid Gmail account (@gmail.com) for verification."})
		return
	}

	usersColl := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	var existing models.User
	err := usersColl.FindOne(ctx, bson.M{"email": cleanEmail}).Decode(&existing)
	if err == nil {
		if existing.IsVerified {
			c.JSON(http.StatusConflict, gin.H{"error": "An account with this Gmail address already exists"})
			return
		}
		// If exists but not verified, generate new code and let them verify
		otp := generateOTP()
		codesColl := config.DB.Collection("verification_codes")
		_, _ = codesColl.DeleteMany(ctx, bson.M{"email": cleanEmail})
		_, _ = codesColl.InsertOne(ctx, models.VerificationCode{
			ID:        primitive.NewObjectID(),
			Email:     cleanEmail,
			Code:      otp,
			ExpiresAt: time.Now().Add(15 * time.Minute),
			CreatedAt: time.Now(),
		})

		c.JSON(http.StatusOK, gin.H{
			"message":           "Account pending verification. Your 6-digit verification code has been issued.",
			"email":             cleanEmail,
			"verification_code": otp, // Surfaced for frictionless interactive verification
			"requires_verify":   true,
		})
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
		IsVerified: false,
		CreatedAt:  time.Now(),
	}

	_, err = usersColl.InsertOne(ctx, newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user in MongoDB Atlas"})
		return
	}

	// Generate 6-digit OTP verification code
	otp := generateOTP()
	codesColl := config.DB.Collection("verification_codes")
	_, _ = codesColl.InsertOne(ctx, models.VerificationCode{
		ID:        primitive.NewObjectID(),
		Email:     cleanEmail,
		Code:      otp,
		ExpiresAt: time.Now().Add(15 * time.Minute),
		CreatedAt: time.Now(),
	})

	c.JSON(http.StatusCreated, gin.H{
		"message":           "Registration successful! Please verify your Gmail account.",
		"email":             cleanEmail,
		"verification_code": otp,
		"requires_verify":   true,
	})
}

func VerifyCode(c *gin.Context) {
	var input VerifyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email and 6-digit verification code required"})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))
	cleanCode := strings.TrimSpace(input.Code)

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	codesColl := config.DB.Collection("verification_codes")
	var record models.VerificationCode
	err := codesColl.FindOne(ctx, bson.M{
		"email":      cleanEmail,
		"code":       cleanCode,
		"expires_at": bson.M{"$gt": time.Now()},
	}).Decode(&record)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification code."})
		return
	}

	// Mark user verified
	usersColl := config.DB.Collection("users")
	var user models.User
	err = usersColl.FindOneAndUpdate(ctx,
		bson.M{"email": cleanEmail},
		bson.M{"$set": bson.M{"is_verified": true}},
	).Decode(&user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify account"})
		return
	}

	// Delete used code
	_, _ = codesColl.DeleteMany(ctx, bson.M{"email": cleanEmail})

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authorization token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Gmail account verified successfully!",
		"token":   token,
		"user": gin.H{
			"id":          user.ID.Hex(),
			"email":       user.Email,
			"name":        user.Name,
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

	if !user.IsVerified {
		otp := generateOTP()
		codesColl := config.DB.Collection("verification_codes")
		_, _ = codesColl.DeleteMany(ctx, bson.M{"email": cleanEmail})
		_, _ = codesColl.InsertOne(ctx, models.VerificationCode{
			ID:        primitive.NewObjectID(),
			Email:     cleanEmail,
			Code:      otp,
			ExpiresAt: time.Now().Add(15 * time.Minute),
			CreatedAt: time.Now(),
		})

		c.JSON(http.StatusForbidden, gin.H{
			"error":             "Gmail account not yet verified. Please enter the verification code.",
			"requires_verify":   true,
			"email":             cleanEmail,
			"verification_code": otp,
		})
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
			"is_verified": user.IsVerified,
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
