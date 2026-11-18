package config

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct {
	Port        string
	MongoURI    string
	DBName      string
	RedisURI    string
	JWTSecret   string
	FrontendURL string
}

var (
	AppConfig *Config
	DB        *mongo.Database
	RDB       *redis.Client
)

func LoadConfig() {
	_ = godotenv.Load() // Loads .env if present

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("MONGODB_DB")
	if dbName == "" {
		dbName = "pulsepoll"
	}

	redisURI := os.Getenv("REDIS_URI")
	if redisURI == "" {
		redisURI = "redis://localhost:6379"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-pulsepoll-production-jwt-key"
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}

	AppConfig = &Config{
		Port:        port,
		MongoURI:    mongoURI,
		DBName:      dbName,
		RedisURI:    redisURI,
		JWTSecret:   jwtSecret,
		FrontendURL: frontendURL,
	}
}

func InitMongo() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(AppConfig.MongoURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping mongodb: %w", err)
	}

	DB = client.Database(AppConfig.DBName)
	log.Println("MongoDB connected successfully to database:", AppConfig.DBName)
	return nil
}

func InitRedis() error {
	opt, err := redis.ParseURL(AppConfig.RedisURI)
	if err != nil {
		// Fallback for simple host:port
		opt = &redis.Options{
			Addr: AppConfig.RedisURI,
		}
	}

	// Support rediss:// (SSL/TLS for managed providers like Upstash)
	if opt.TLSConfig == nil && len(AppConfig.RedisURI) >= 6 && AppConfig.RedisURI[:6] == "rediss" {
		opt.TLSConfig = &tls.Config{
			InsecureSkipVerify: false,
		}
	}

	RDB = redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := RDB.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to ping redis: %w", err)
	}

	log.Println("Redis connected successfully to:", opt.Addr)
	return nil
}
