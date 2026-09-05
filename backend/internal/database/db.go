package database

import (
	"log"

	"anime-stream-backend/internal/config"
	"anime-stream-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB(cfg *config.Config) *gorm.DB {
	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DatabaseDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	log.Println("✅ PostgreSQL connection established successfully!")
	return DB
}

func AutoFreeExpiredAnimes() {
	if DB == nil {
		return
	}
	// Animes whose free_at date has arrived and are still marked as VIP -> set is_vip = false
	res := DB.Model(&models.Anime{}).
		Where("is_vip = ? AND free_at IS NOT NULL AND free_at <= NOW()", true).
		Updates(map[string]interface{}{
			"is_vip": false,
		})
	if res.Error == nil && res.RowsAffected > 0 {
		log.Printf("🎉 AutoFree: %d animes transitioned from VIP to FREE!", res.RowsAffected)
	}
}
