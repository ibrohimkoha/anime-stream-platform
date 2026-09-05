package handlers

import (
	"net/http"
	"strconv"

	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AnimeHandler struct{}

func NewAnimeHandler() *AnimeHandler {
	return &AnimeHandler{}
}

// GetTrending returns top viewed animes for the Hero marquee
func (h *AnimeHandler) GetTrending(c *gin.Context) {
	var animes []models.Anime
	if err := database.DB.Preload("Genres").Order("views_count DESC").Limit(10).Find(&animes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ma'lumotlarni yuklab bo'lmadi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"animes": animes})
}

// GetFreeAnimes returns animes where is_vip = false
func (h *AnimeHandler) GetFreeAnimes(c *gin.Context) {
	genreSlug := c.Query("genre")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Anime{}).Preload("Genres").Where("is_vip = ?", false)

	if genreSlug != "" {
		query = query.Joins("JOIN anime_genres ag ON ag.anime_id = animes.id").
			Joins("JOIN genres g ON g.id = ag.genre_id").
			Where("g.slug = ?", genreSlug)
	}

	var total int64
	query.Count(&total)

	var animes []models.Anime
	if err := query.Order("id DESC").Limit(limit).Offset(offset).Find(&animes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Animelarni yuklashda xatolik"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"animes": animes,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

// GetVIPAnimes returns animes where is_vip = true (with countdown timer)
func (h *AnimeHandler) GetVIPAnimes(c *gin.Context) {
	var animes []models.Anime
	if err := database.DB.Preload("Genres").Where("is_vip = ?", true).Order("free_at ASC, id DESC").Find(&animes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "VIP animelarni yuklashda xatolik"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"animes": animes})
}

// GetTopRated returns highest rated animes
func (h *AnimeHandler) GetTopRated(c *gin.Context) {
	var animes []models.Anime
	if err := database.DB.Preload("Genres").Order("rating DESC, views_count DESC").Limit(20).Find(&animes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Reytingi yuqori animelarni yuklashda xatolik"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"animes": animes})
}

// GetGenres returns all available genres
func (h *AnimeHandler) GetGenres(c *gin.Context) {
	var genres []models.Genre
	if err := database.DB.Order("id ASC").Find(&genres).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Janrlarni yuklashda xatolik"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"genres": genres})
}

// GetAnimeBySlug returns anime details, episodes, trailer, bookmark status
func (h *AnimeHandler) GetAnimeBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var anime models.Anime
	if err := database.DB.Preload("Genres").Preload("Episodes", func(db *gorm.DB) *gorm.DB {
		return db.Order("episodes.episode_number ASC")
	}).Where("slug = ?", slug).First(&anime).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anime topilmadi"})
		return
	}

	// Increment view count asynchronously
	go func(id uint64) {
		database.DB.Model(&models.Anime{}).Where("id = ?", id).UpdateColumn("views_count", gorm.Expr("views_count + ?", 1))
	}(anime.ID)

	var isBookmarked bool
	var userRating int

	if userVal, exists := c.Get("user"); exists {
		user := userVal.(*models.User)
		var count int64
		database.DB.Model(&models.Bookmark{}).Where("user_id = ? AND anime_id = ?", user.ID, anime.ID).Count(&count)
		isBookmarked = count > 0

		var rating models.Rating
		if err := database.DB.Where("user_id = ? AND anime_id = ?", user.ID, anime.ID).First(&rating).Error; err == nil {
			userRating = rating.Score
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"anime":         anime,
		"is_bookmarked": isBookmarked,
		"user_rating":   userRating,
	})
}

// ToggleBookmark adds or removes anime from user's watchlist
func (h *AnimeHandler) ToggleBookmark(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)
	var req struct {
		AnimeID uint64 `json:"anime_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Anime ID talab qilinadi"})
		return
	}

	var bookmark models.Bookmark
	res := database.DB.Where("user_id = ? AND anime_id = ?", userID, req.AnimeID).First(&bookmark)
	if res.Error == nil {
		// Remove
		database.DB.Delete(&bookmark)
		c.JSON(http.StatusOK, gin.H{"is_bookmarked": false, "message": "Saqlanganlardan olib tashlandi"})
	} else {
		// Add
		newBookmark := models.Bookmark{
			UserID:  userID,
			AnimeID: req.AnimeID,
		}
		database.DB.Create(&newBookmark)
		c.JSON(http.StatusOK, gin.H{"is_bookmarked": true, "message": "Saqlanganlarga qo'shildi"})
	}
}

// GetBookmarks returns all saved animes for logged-in user
func (h *AnimeHandler) GetBookmarks(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)

	var bookmarks []models.Bookmark
	if err := database.DB.Preload("Anime.Genres").Where("user_id = ?", userID).Order("id DESC").Find(&bookmarks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Saqlanganlarni yuklashda xatolik"})
		return
	}

	animes := make([]models.Anime, 0, len(bookmarks))
	for _, b := range bookmarks {
		if b.Anime != nil {
			animes = append(animes, *b.Anime)
		}
	}

	c.JSON(http.StatusOK, gin.H{"animes": animes})
}

// RateAnime rates an anime from 1 to 10
func (h *AnimeHandler) RateAnime(c *gin.Context) {
	userID := c.MustGet("userID").(uint64)
	var req struct {
		AnimeID uint64 `json:"anime_id" binding:"required"`
		Score   int    `json:"score" binding:"required,min=1,max=10"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Baholash 1 dan 10 gacha bo'lishi kerak"})
		return
	}

	var rating models.Rating
	if err := database.DB.Where("user_id = ? AND anime_id = ?", userID, req.AnimeID).First(&rating).Error; err == nil {
		rating.Score = req.Score
		database.DB.Save(&rating)
	} else {
		rating = models.Rating{
			UserID:  userID,
			AnimeID: req.AnimeID,
			Score:   req.Score,
		}
		database.DB.Create(&rating)
	}

	// Recalculate average rating
	var avgScore float64
	database.DB.Model(&models.Rating{}).Where("anime_id = ?", req.AnimeID).Select("AVG(score)").Scan(&avgScore)

	database.DB.Model(&models.Anime{}).Where("id = ?", req.AnimeID).Update("rating", avgScore)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Baholandi!",
		"new_score": req.Score,
		"avg_score": avgScore,
	})
}
