package main

import (
	"log"
	"net/http"
	"strings"

	"anime-stream-backend/internal/config"
	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/handlers"
	"anime-stream-backend/internal/middleware"
	"anime-stream-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize DB
	database.ConnectDB(cfg)

	// Start Cron Job for Auto-Free release date checker
	services.StartCronScheduler()

	r := gin.Default()

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Admin-Secret"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// Serve uploaded static files
	r.Static("/uploads", cfg.UploadDir)

	// Initialize Handlers
	authH := handlers.NewAuthHandler(cfg)
	animeH := handlers.NewAnimeHandler()
	forumH := handlers.NewForumHandler()
	vipH := handlers.NewVIPHandler(cfg)
	adminH := handlers.NewAdminHandler()

	// Health Check
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "Anime Streaming API",
			"version": "1.0.0",
		})
	})

	api := r.Group("/api/v1")
	{
		// Auth routes
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", authH.Register)
			authGroup.POST("/login", authH.Login)
			authGroup.POST("/google", authH.GoogleLogin)
			authGroup.GET("/me", middleware.AuthMiddleware(cfg), authH.GetMe)
		}

		// Public Anime Catalog & Search routes
		animeGroup := api.Group("/animes")
		{
			animeGroup.GET("/trending", animeH.GetTrending)
			animeGroup.GET("/free", animeH.GetFreeAnimes)
			animeGroup.GET("/vip", animeH.GetVIPAnimes)
			animeGroup.GET("/top-rated", animeH.GetTopRated)
			animeGroup.GET("/genres", animeH.GetGenres)
			animeGroup.GET("/:slug", middleware.OptionalAuthMiddleware(cfg), animeH.GetAnimeBySlug)
		}

		// Bookmarks & Ratings (Protected)
		api.POST("/bookmarks/toggle", middleware.AuthMiddleware(cfg), animeH.ToggleBookmark)
		api.GET("/bookmarks", middleware.AuthMiddleware(cfg), animeH.GetBookmarks)
		api.POST("/ratings", middleware.AuthMiddleware(cfg), animeH.RateAnime)

		// Forum / Discussions routes
		forumGroup := api.Group("/forum")
		{
			forumGroup.GET("/topics", forumH.GetTopics)
			forumGroup.GET("/topics/:id", forumH.GetTopicByID)
			forumGroup.POST("/topics", middleware.AuthMiddleware(cfg), forumH.CreateTopic)
			forumGroup.GET("/comments", forumH.GetComments)
			forumGroup.POST("/comments", middleware.AuthMiddleware(cfg), forumH.AddComment)
		}

		// VIP & Payment routes
		vipGroup := api.Group("/vip")
		{
			vipGroup.GET("/info", vipH.GetVIPInfo)
			vipGroup.POST("/submit-receipt", middleware.AuthMiddleware(cfg), vipH.SubmitReceipt)
			vipGroup.GET("/my-purchases", middleware.AuthMiddleware(cfg), vipH.GetMyPurchases)
			vipGroup.POST("/upload", vipH.UploadFile)
		}

		// Admin Panel routes (Protected by Auth + Admin Role)
		adminGroup := api.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware(cfg), middleware.AdminMiddleware())
		{
			adminGroup.GET("/stats", adminH.GetStats)

			// Animes
			adminGroup.POST("/animes", adminH.CreateAnime)
			adminGroup.PUT("/animes/:id", adminH.UpdateAnime)
			adminGroup.DELETE("/animes/:id", adminH.DeleteAnime)

			// Episodes
			adminGroup.POST("/episodes", adminH.AddEpisode)
			adminGroup.DELETE("/episodes/:id", adminH.DeleteEpisode)

			// VIP Requests Queue
			adminGroup.GET("/vip-requests", adminH.GetVIPRequests)
			adminGroup.POST("/vip-requests/:id/approve", adminH.ApproveVIPRequest)
			adminGroup.POST("/vip-requests/:id/reject", adminH.RejectVIPRequest)

			// Pricing & Settings
			adminGroup.PUT("/payment-setting", adminH.UpdatePaymentSetting)
			adminGroup.PUT("/vip-plans/:id", adminH.UpdateVIPPlan)

			// Users & Role Management
			adminGroup.GET("/users", adminH.GetUsers)
			adminGroup.POST("/users/:id/role", adminH.SetUserRole)
		}
	}

	log.Printf("🚀 Anime Streaming Backend is running on port %s...", cfg.Port)
	if err := r.Run(":" + strings.TrimPrefix(cfg.Port, ":")); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
