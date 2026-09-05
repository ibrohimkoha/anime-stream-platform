package handlers

import (
	"net/http"
	"strconv"

	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ForumHandler struct{}

func NewForumHandler() *ForumHandler {
	return &ForumHandler{}
}

func (h *ForumHandler) GetTopics(c *gin.Context) {
	category := c.Query("category")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.ForumTopic{}).Preload("User").Preload("Anime")
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	var topics []models.ForumTopic
	if err := query.Order("id DESC").Limit(limit).Offset(offset).Find(&topics).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Mulohazalarni yuklab bo'lmadi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"topics": topics,
		"total":  total,
	})
}

func (h *ForumHandler) GetTopicByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var topic models.ForumTopic
	if err := database.DB.Preload("User").Preload("Anime").First(&topic, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mulohaza topilmadi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"topic": topic})
}

func (h *ForumHandler) CreateTopic(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)
	var req struct {
		Title    string  `json:"title" binding:"required"`
		Content  string  `json:"content" binding:"required"`
		Category string  `json:"category"`
		AnimeID  *uint64 `json:"anime_id"`
		ImageURL string  `json:"image_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sarlavha va matn kiritilishi shart"})
		return
	}

	if req.Category == "" {
		req.Category = "General"
	}

	topic := models.ForumTopic{
		UserID:   userID,
		AnimeID:  req.AnimeID,
		Title:    req.Title,
		Content:  req.Content,
		Category: req.Category,
		ImageURL: req.ImageURL,
	}

	if err := database.DB.Create(&topic).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Mulohaza yaratishda xatolik"})
		return
	}

	database.DB.Preload("User").First(&topic, topic.ID)
	c.JSON(http.StatusCreated, gin.H{"topic": topic})
}

func (h *ForumHandler) GetComments(c *gin.Context) {
	animeIDStr := c.Query("anime_id")
	topicIDStr := c.Query("topic_id")

	query := database.DB.Model(&models.Comment{}).Preload("User")

	if animeIDStr != "" {
		animeID, _ := strconv.ParseUint(animeIDStr, 10, 64)
		query = query.Where("anime_id = ?", animeID)
	} else if topicIDStr != "" {
		topicID, _ := strconv.ParseUint(topicIDStr, 10, 64)
		query = query.Where("topic_id = ?", topicID)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "anime_id yoki topic_id talab qilinadi"})
		return
	}

	var comments []models.Comment
	if err := query.Order("created_at ASC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Izohlarni yuklashda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

func (h *ForumHandler) AddComment(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)
	var req struct {
		AnimeID   *uint64 `json:"anime_id"`
		TopicID   *uint64 `json:"topic_id"`
		ParentID  *uint64 `json:"parent_id"`
		Content   string  `json:"content" binding:"required"`
		IsSpoiler bool    `json:"is_spoiler"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Izoh matnini kiriting"})
		return
	}

	comment := models.Comment{
		UserID:    userID,
		AnimeID:   req.AnimeID,
		TopicID:   req.TopicID,
		ParentID:  req.ParentID,
		Content:   req.Content,
		IsSpoiler: req.IsSpoiler,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Izoh saqlanmadi"})
		return
	}

	if req.TopicID != nil {
		database.DB.Model(&models.ForumTopic{}).Where("id = ?", *req.TopicID).UpdateColumn("comments_count", gorm.Expr("comments_count + ?", 1))
	}

	database.DB.Preload("User").First(&comment, comment.ID)
	c.JSON(http.StatusCreated, gin.H{"comment": comment})
}
