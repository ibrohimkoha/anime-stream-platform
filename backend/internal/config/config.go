package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseDSN string
	JWTSecret   string
	UploadDir   string
	AppURL      string
	CorsOrigin  string
}

func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file not found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=anime_stream_db port=5432 sslmode=disable"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-anime-key-2026"
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:8090"
	}

	return &Config{
		Port:        port,
		DatabaseDSN: dsn,
		JWTSecret:   jwtSecret,
		UploadDir:   uploadDir,
		AppURL:      appURL,
		CorsOrigin:  os.Getenv("CORS_ORIGIN"),
	}
}
