package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetStats returns summary statistics for Admin Dashboard
func (h *AdminHandler) GetStats(c *gin.Context) {
	var totalAnimes int64
	var totalEpisodes int64
	var totalUsers int64
	var totalVIPUsers int64
	var pendingReceipts int64

	database.DB.Model(&models.Anime{}).Count(&totalAnimes)
	database.DB.Model(&models.Episode{}).Count(&totalEpisodes)
	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.User{}).Where("is_vip = ?", true).Count(&totalVIPUsers)
	database.DB.Model(&models.VIPPurchase{}).Where("status = ?", "pending").Count(&pendingReceipts)

	c.JSON(http.StatusOK, gin.H{
		"total_animes":     totalAnimes,
		"total_episodes":   totalEpisodes,
		"total_users":      totalUsers,
		"total_vip_users":  totalVIPUsers,
		"pending_receipts": pendingReceipts,
	})
}

// ================= ANIME MANAGEMENT =================

type SaveAnimeRequest struct {
	Title           string     `json:"title" binding:"required"`
	OriginalTitle   string     `json:"original_title"`
	Slug            string     `json:"slug"`
	Description     string     `json:"description"`
	PosterURL       string     `json:"poster_url" binding:"required"`
	TrailerVideoURL string     `json:"trailer_video_url"`
	Rating          float64    `json:"rating"`
	IsVIP           bool       `json:"is_vip"`
	FreeAt          *time.Time `json:"free_at"`
	Status          string     `json:"status"`
	ReleaseYear     int        `json:"release_year"`
	GenreIDs        []uint     `json:"genre_ids"`
}

func (h *AdminHandler) CreateAnime(c *gin.Context) {
	var req SaveAnimeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Anime nomi va poster rasmini kiritish shart"})
		return
	}

	slug := req.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(req.Title, " ", "-"))
		slug = strings.ReplaceAll(slug, ":", "")
		slug = strings.ReplaceAll(slug, "'", "")
		slug = strings.ReplaceAll(slug, "‘", "")
	}

	if req.Status == "" {
		req.Status = "ongoing"
	}
	if req.ReleaseYear == 0 {
		req.ReleaseYear = time.Now().Year()
	}

	anime := models.Anime{
		Title:           req.Title,
		OriginalTitle:   req.OriginalTitle,
		Slug:            slug,
		Description:     req.Description,
		PosterURL:       req.PosterURL,
		TrailerVideoURL: req.TrailerVideoURL,
		Rating:          req.Rating,
		IsVIP:           req.IsVIP,
		FreeAt:          req.FreeAt,
		Status:          req.Status,
		ReleaseYear:     req.ReleaseYear,
	}

	if err := database.DB.Create(&anime).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Animeni saqlashda xatolik yuz berdi"})
		return
	}

	// Link genres
	if len(req.GenreIDs) > 0 {
		var genres []models.Genre
		database.DB.Where("id IN ?", req.GenreIDs).Find(&genres)
		database.DB.Model(&anime).Association("Genres").Replace(genres)
	}

	database.DB.Preload("Genres").First(&anime, anime.ID)
	c.JSON(http.StatusCreated, gin.H{"anime": anime, "message": "Anime muvaffaqiyatli qo'shildi!"})
}

func (h *AdminHandler) UpdateAnime(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var anime models.Anime
	if err := database.DB.First(&anime, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime topilmadi"})
		return
	}

	var req SaveAnimeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ma'lumotlar noto'g'ri"})
		return
	}

	anime.Title = req.Title
	anime.OriginalTitle = req.OriginalTitle
	if req.Slug != "" {
		anime.Slug = req.Slug
	}
	anime.Description = req.Description
	anime.PosterURL = req.PosterURL
	anime.TrailerVideoURL = req.TrailerVideoURL
	anime.Rating = req.Rating
	anime.IsVIP = req.IsVIP
	anime.FreeAt = req.FreeAt
	anime.Status = req.Status
	anime.ReleaseYear = req.ReleaseYear

	database.DB.Save(&anime)

	if len(req.GenreIDs) > 0 {
		var genres []models.Genre
		database.DB.Where("id IN ?", req.GenreIDs).Find(&genres)
		database.DB.Model(&anime).Association("Genres").Replace(genres)
	}

	database.DB.Preload("Genres").First(&anime, anime.ID)
	c.JSON(http.StatusOK, gin.H{"anime": anime, "message": "Anime ma'lumotlari yangilandi!"})
}

func (h *AdminHandler) DeleteAnime(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := database.DB.Delete(&models.Anime{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "O'chirishda xatolik"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Anime o'chirildi"})
}

// ================= EPISODE MANAGEMENT =================

type SaveEpisodeRequest struct {
	AnimeID         uint64 `json:"anime_id" binding:"required"`
	EpisodeNumber   int    `json:"episode_number" binding:"required"`
	Title           string `json:"title"`
	VideoURL        string `json:"video_url" binding:"required"`
	ThumbnailURL    string `json:"thumbnail_url"`
	DurationSeconds int    `json:"duration_seconds"`
}

func (h *AdminHandler) AddEpisode(c *gin.Context) {
	var req SaveEpisodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Anime ID, qism raqami va video URL talab qilinadi"})
		return
	}

	if req.DurationSeconds == 0 {
		req.DurationSeconds = 1440
	}

	episode := models.Episode{
		AnimeID:         req.AnimeID,
		EpisodeNumber:   req.EpisodeNumber,
		Title:           req.Title,
		VideoURL:        req.VideoURL,
		ThumbnailURL:    req.ThumbnailURL,
		DurationSeconds: req.DurationSeconds,
	}

	// Upsert episode
	var existing models.Episode
	if err := database.DB.Where("anime_id = ? AND episode_number = ?", req.AnimeID, req.EpisodeNumber).First(&existing).Error; err == nil {
		existing.Title = req.Title
		existing.VideoURL = req.VideoURL
		existing.ThumbnailURL = req.ThumbnailURL
		existing.DurationSeconds = req.DurationSeconds
		database.DB.Save(&existing)
		c.JSON(http.StatusOK, gin.H{"episode": existing, "message": fmt.Sprintf("%d-qism yangilandi!", req.EpisodeNumber)})
		return
	}

	if err := database.DB.Create(&episode).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Qismni qo'shishda xatolik"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"episode": episode, "message": fmt.Sprintf("%d-qism muvaffaqiyatli qo'shildi!", req.EpisodeNumber)})
}

func (h *AdminHandler) DeleteEpisode(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := database.DB.Delete(&models.Episode{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Qismni o'chirishda xatolik"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Qism o'chirildi"})
}

// ================= VIP REQUESTS & RECEIPTS QUEUE =================

func (h *AdminHandler) GetVIPRequests(c *gin.Context) {
	status := c.DefaultQuery("status", "all")

	query := database.DB.Model(&models.VIPPurchase{}).Preload("User").Preload("Plan")
	if status != "all" {
		query = query.Where("status = ?", status)
	}

	var requests []models.VIPPurchase
	if err := query.Order("id DESC").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "So'rovlarni yuklashda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"requests": requests})
}

func (h *AdminHandler) ApproveVIPRequest(c *gin.Context) {
	adminID := c.MustGet("userID").(uint64)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var purchase models.VIPPurchase
	if err := database.DB.Preload("Plan").Preload("User").First(&purchase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "To'lov so'rovi topilmadi"})
		return
	}

	if purchase.Status == "approved" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ushbu chek allaqachon tasdiqlangan"})
		return
	}

	// Calculate VIP duration
	days := 30
	if purchase.Plan != nil && purchase.Plan.Days > 0 {
		days = purchase.Plan.Days
	}

	now := time.Now()
	var newExpiresAt time.Time

	if purchase.User.IsVIP && purchase.User.VIPExpiresAt != nil && purchase.User.VIPExpiresAt.After(now) {
		newExpiresAt = purchase.User.VIPExpiresAt.AddDate(0, 0, days)
	} else {
		newExpiresAt = now.AddDate(0, 0, days)
	}

	// Update user to VIP
	database.DB.Model(&models.User{}).Where("id = ?", purchase.UserID).Updates(map[string]interface{}{
		"is_vip":         true,
		"vip_expires_at": newExpiresAt,
	})

	// Update purchase status
	nowPtr := &now
	purchase.Status = "approved"
	purchase.AdminID = &adminID
	purchase.ReviewedAt = nowPtr
	database.DB.Save(&purchase)

	c.JSON(http.StatusOK, gin.H{
		"message":        fmt.Sprintf("To'lov tasdiqlandi! Foydalanuvchiga %d kunlik VIP berildi.", days),
		"vip_expires_at": newExpiresAt,
		"purchase":       purchase,
	})
}

func (h *AdminHandler) RejectVIPRequest(c *gin.Context) {
	adminID := c.MustGet("userID").(uint64)
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)

	var purchase models.VIPPurchase
	if err := database.DB.First(&purchase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "To'lov so'rovi topilmadi"})
		return
	}

	now := time.Now()
	purchase.Status = "rejected"
	purchase.AdminID = &adminID
	purchase.AdminNote = req.Reason
	purchase.ReviewedAt = &now
	database.DB.Save(&purchase)

	c.JSON(http.StatusOK, gin.H{"message": "To'lov cheki rad etildi", "purchase": purchase})
}

// ================= VIP PRICING & PAYMENT SETTINGS =================

func (h *AdminHandler) UpdatePaymentSetting(c *gin.Context) {
	var req struct {
		CardNumber    string `json:"card_number" binding:"required"`
		CardHolder    string `json:"card_holder" binding:"required"`
		BankName      string `json:"bank_name" binding:"required"`
		InstructionUz string `json:"instruction_uz"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Barcha karta ma'lumotlarini to'ldiring"})
		return
	}

	var setting models.PaymentSetting
	if err := database.DB.First(&setting).Error; err != nil {
		setting = models.PaymentSetting{
			CardNumber:    req.CardNumber,
			CardHolder:    req.CardHolder,
			BankName:      req.BankName,
			InstructionUz: req.InstructionUz,
		}
		database.DB.Create(&setting)
	} else {
		setting.CardNumber = req.CardNumber
		setting.CardHolder = req.CardHolder
		setting.BankName = req.BankName
		setting.InstructionUz = req.InstructionUz
		setting.UpdatedAt = time.Now()
		database.DB.Save(&setting)
	}

	c.JSON(http.StatusOK, gin.H{"message": "To'lov karta ma'lumotlari yangilandi!", "setting": setting})
}

func (h *AdminHandler) UpdateVIPPlan(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var plan models.VIPPlan
	if err := database.DB.First(&plan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tarif topilmadi"})
		return
	}

	var req struct {
		Name     string `json:"name"`
		Days     int    `json:"days"`
		PriceUZS int64  `json:"price_uzs"`
		Badge    string `json:"badge"`
		IsActive *bool  `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ma'lumotlar xato"})
		return
	}

	if req.Name != "" {
		plan.Name = req.Name
	}
	if req.Days > 0 {
		plan.Days = req.Days
	}
	if req.PriceUZS > 0 {
		plan.PriceUZS = req.PriceUZS
	}
	plan.Badge = req.Badge
	if req.IsActive != nil {
		plan.IsActive = *req.IsActive
	}

	database.DB.Save(&plan)
	c.JSON(http.StatusOK, gin.H{"message": "VIP tarif yangilandi", "plan": plan})
}

// ================= USER & ADMIN ROLE MANAGEMENT =================

func (h *AdminHandler) GetUsers(c *gin.Context) {
	search := c.Query("q")
	query := database.DB.Model(&models.User{})

	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var users []models.User
	query.Order("id DESC").Limit(50).Find(&users)

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func (h *AdminHandler) SetUserRole(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Role string `json:"role" binding:"required"` // 'user', 'moderator', 'admin', 'superadmin'
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rol nomi talab qilinadi"})
		return
	}

	validRoles := map[string]bool{"user": true, "moderator": true, "admin": true, "superadmin": true}
	if !validRoles[req.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Noto'g'ri rol nomi"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Foydalanuvchi topilmadi"})
		return
	}

	user.Role = req.Role
	database.DB.Model(&user).Update("role", req.Role)

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Foydalanuvchi roli '%s' ga o'zgartirildi!", req.Role),
		"user":    user,
	})
}
