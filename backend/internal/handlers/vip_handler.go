package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"anime-stream-backend/internal/config"
	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type VIPHandler struct {
	cfg *config.Config
}

func NewVIPHandler(cfg *config.Config) *VIPHandler {
	return &VIPHandler{cfg: cfg}
}

// GetVIPInfo returns pricing plans and current payment card details
func (h *VIPHandler) GetVIPInfo(c *gin.Context) {
	var plans []models.VIPPlan
	database.DB.Where("is_active = ?", true).Order("price_uzs ASC").Find(&plans)

	var paymentSetting models.PaymentSetting
	database.DB.First(&paymentSetting)

	c.JSON(http.StatusOK, gin.H{
		"plans":           plans,
		"payment_setting": paymentSetting,
	})
}

// SubmitReceipt submits a new VIP purchase request with uploaded receipt
func (h *VIPHandler) SubmitReceipt(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)

	var req struct {
		PlanID          uint   `json:"plan_id" binding:"required"`
		ReceiptImageURL string `json:"receipt_image_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tarif va chek rasmini yuborish shart"})
		return
	}

	var plan models.VIPPlan
	if err := database.DB.First(&plan, req.PlanID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tanlangan tarif topilmadi"})
		return
	}

	purchase := models.VIPPurchase{
		UserID:          userID,
		PlanID:          plan.ID,
		AmountUZS:       plan.PriceUZS,
		ReceiptImageURL: req.ReceiptImageURL,
		Status:          "pending",
	}

	if err := database.DB.Create(&purchase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "To'lov so'rovini saqlashda xatolik"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "To'lov chekingiz muvaffaqiyatli qabul qilindi va administrator tomonidan ko'rib chiqilmoqda!",
		"purchase": purchase,
		"status":   "pending",
	})
}

// GetMyPurchases returns user's past receipts and their status
func (h *VIPHandler) GetMyPurchases(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)

	var purchases []models.VIPPurchase
	if err := database.DB.Preload("Plan").Where("user_id = ?", userID).Order("id DESC").Find(&purchases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ma'lumotlarni yuklab bo'lmadi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"purchases": purchases})
}

// UploadFile handles file upload (posters, trailers, receipts)
func (h *VIPHandler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fayl topilmadi"})
		return
	}

	folder := c.DefaultPostForm("type", "receipts")
	validFolders := map[string]bool{"receipts": true, "posters": true, "trailers": true, "episodes": true}
	if !validFolders[folder] {
		folder = "receipts"
	}

	targetDir := filepath.Join(h.cfg.UploadDir, folder)
	os.MkdirAll(targetDir, 0755)

	ext := strings.ToLower(filepath.Ext(file.Filename))
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String()[:8], time.Now().Unix(), ext)
	dst := filepath.Join(targetDir, filename)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Faylni saqlashda xatolik"})
		return
	}

	fileURL := fmt.Sprintf("%s/uploads/%s/%s", h.cfg.AppURL, folder, filename)
	c.JSON(http.StatusOK, gin.H{
		"url":      fileURL,
		"filename": filename,
	})
}
