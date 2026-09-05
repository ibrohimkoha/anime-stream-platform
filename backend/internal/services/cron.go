package services

import (
	"log"
	"time"

	"anime-stream-backend/internal/database"
)

func StartCronScheduler() {
	ticker := time.NewTicker(30 * time.Second)
	go func() {
		log.Println("⏰ Auto-Free Cron Scheduler started (interval: 30s)...")
		for range ticker.C {
			database.AutoFreeExpiredAnimes()
		}
	}()
}
