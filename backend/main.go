package main

import (
	"log"
	"net/http"
	"time"

	"pulsepoll/config"
	"pulsepoll/controllers"
	"pulsepoll/middleware"
	"pulsepoll/realtime"
	"pulsepoll/store"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	// Initialize local persistent fallback store
	if err := store.InitLocalStore("./data"); err != nil {
		log.Printf("[WARNING] Local store init: %v", err)
	}

	// Try MongoDB
	if err := config.InitMongo(); err != nil {
		log.Printf("[INFO] MongoDB offline, operating with local persistent engine: %v", err)
	}

	// Try Redis
	if err := config.InitRedis(); err != nil {
		log.Printf("[WARNING] Redis warning: %v", err)
	}

	realtime.InitHub()

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) {
		mongoStatus := "connected"
		if config.DB == nil {
			mongoStatus = "fallback_local_store"
		}
		redisStatus := "connected"
		if config.RDB == nil {
			redisStatus = "in_memory"
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"time":    time.Now().UTC(),
			"mongodb": mongoStatus,
			"redis":   redisStatus,
		})
	})

	router.GET("/ws/:id", realtime.HandleWebSocket)

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/me", middleware.AuthRequired(), controllers.GetMe)
		}

		polls := api.Group("/polls")
		{
			polls.GET("", controllers.ListPolls)
			polls.GET("/:id", controllers.GetPoll)
			polls.POST("/:id/vote", controllers.Vote)

			protected := polls.Group("")
			protected.Use(middleware.AuthRequired())
			{
				protected.POST("", controllers.CreatePoll)
				protected.GET("/user/mine", controllers.ListMyPolls)
				protected.PATCH("/:id/toggle", controllers.TogglePollStatus)
			}
		}
	}

	port := config.AppConfig.Port
	log.Printf("PulsePoll Backend listening on port :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server run error: %v", err)
	}
}
