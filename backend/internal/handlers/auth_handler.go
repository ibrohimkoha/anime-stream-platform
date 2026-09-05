package handlers

import (
	"net/http"
	"strings"
	"time"

	"anime-stream-backend/internal/config"
	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/middleware"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"` // email or phone
	Password   string `json:"password" binding:"required"`
}

type GoogleLoginRequest struct {
	Email     string `json:"email" binding:"required"`
	Name      string `json:"name" binding:"required"`
	AvatarURL string `json:"avatar_url"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Barcha maydonlarni to'g'ri to'ldiring"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Phone = strings.TrimSpace(req.Phone)

	if req.Email == "" && req.Phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email yoki telefon raqamini kiritish shart"})
		return
	}

	// Check if already exists
	var existing models.User
	query := database.DB
	if req.Email != "" && req.Phone != "" {
		query = query.Where("email = ? OR phone = ?", req.Email, req.Phone)
	} else if req.Email != "" {
		query = query.Where("email = ?", req.Email)
	} else {
		query = query.Where("phone = ?", req.Phone)
	}

	if err := query.First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ushbu email yoki telefon raqam allaqachon ro'yxatdan o'tgan"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Parolni shifrlashda xatolik yuz berdi"})
		return
	}

	user := models.User{
		Name:         req.Name,
		PasswordHash: string(hashedPassword),
		Role:         "user",
		AvatarURL:    "https://api.dicebear.com/7.x/bottts/svg?seed=" + req.Name,
	}
	if req.Email != "" {
		user.Email = &req.Email
	}
	if req.Phone != "" {
		user.Phone = &req.Phone
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Foydalanuvchini saqlashda xatolik"})
		return
	}

	token, err := middleware.GenerateToken(&user, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token yaratishda xatolik"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kirish ma'lumotlarini kiriting"})
		return
	}

	req.Identifier = strings.TrimSpace(req.Identifier)

	var user models.User
	if err := database.DB.Where("email = ? OR phone = ?", strings.ToLower(req.Identifier), req.Identifier).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email/telefon yoki parol noto'g'ri"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email/telefon yoki parol noto'g'ri"})
		return
	}

	// Check VIP expiration
	if user.IsVIP && user.VIPExpiresAt != nil && user.VIPExpiresAt.Before(time.Now()) {
		user.IsVIP = false
		database.DB.Model(&user).Update("is_vip", false)
	}

	token, err := middleware.GenerateToken(&user, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token yaratishda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google ma'lumotlari talab qilinadi"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Create new user
		user = models.User{
			Name:      req.Name,
			Email:     &req.Email,
			Role:      "user",
			AvatarURL: req.AvatarURL,
		}
		if user.AvatarURL == "" {
			user.AvatarURL = "https://api.dicebear.com/7.x/bottts/svg?seed=" + req.Name
		}
		database.DB.Create(&user)
	} else {
		// Update avatar if provided
		if req.AvatarURL != "" {
			user.AvatarURL = req.AvatarURL
			database.DB.Model(&user).Update("avatar_url", req.AvatarURL)
		}
	}

	token, err := middleware.GenerateToken(&user, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token yaratishda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userVal, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Avtorizatsiyadan o'tilmagan"})
		return
	}
	user := userVal.(*models.User)

	// Fetch fresh data
	database.DB.First(user, user.ID)

	var remainingDays int
	if user.IsVIP && user.VIPExpiresAt != nil && user.VIPExpiresAt.After(time.Now()) {
		remainingDays = int(time.Until(*user.VIPExpiresAt).Hours() / 24)
	}

	c.JSON(http.StatusOK, gin.H{
		"user":           user,
		"remaining_days": remainingDays,
	})
}
