package models

import (
	"time"
)

type User struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string     `gorm:"size:255;not null" json:"name"`
	Email        *string    `gorm:"size:255;uniqueIndex" json:"email"`
	Phone        *string    `gorm:"size:32;uniqueIndex" json:"phone"`
	PasswordHash string     `gorm:"size:255" json:"-"`
	Role         string     `gorm:"size:32;default:'user'" json:"role"` // 'user', 'moderator', 'admin', 'superadmin'
	AvatarURL    string     `gorm:"default:'/avatars/default.png'" json:"avatar_url"`
	IsVIP        bool       `gorm:"column:is_vip;default:false" json:"is_vip"`
	VIPExpiresAt *time.Time `gorm:"column:vip_expires_at" json:"vip_expires_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type Genre struct {
	ID     uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	NameUz string `gorm:"size:100;not null" json:"name_uz"`
	NameEn string `gorm:"size:100;not null" json:"name_en"`
	NameRu string `gorm:"size:100;not null" json:"name_ru"`
	Slug   string `gorm:"size:100;uniqueIndex;not null" json:"slug"`
}

type Anime struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Title           string     `gorm:"size:255;not null" json:"title"`
	OriginalTitle   string     `gorm:"size:255" json:"original_title"`
	Slug            string     `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description     string     `gorm:"type:text" json:"description"`
	PosterURL       string     `gorm:"type:text;not null" json:"poster_url"`
	TrailerVideoURL string     `gorm:"type:text" json:"trailer_video_url"`
	Rating          float64    `gorm:"type:numeric(3,1);default:0.0" json:"rating"`
	ViewsCount      uint64     `gorm:"default:0" json:"views_count"`
	IsVIP           bool       `gorm:"column:is_vip;default:false" json:"is_vip"`
	FreeAt          *time.Time `gorm:"column:free_at" json:"free_at"`
	Status          string     `gorm:"size:32;default:'ongoing'" json:"status"`
	ReleaseYear     int        `gorm:"default:2024" json:"release_year"`
	Genres          []Genre    `gorm:"many2many:anime_genres;" json:"genres,omitempty"`
	Episodes        []Episode  `gorm:"foreignKey:AnimeID" json:"episodes,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type Episode struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	AnimeID         uint64    `gorm:"not null;index" json:"anime_id"`
	EpisodeNumber   int       `gorm:"not null" json:"episode_number"`
	Title           string    `gorm:"size:255" json:"title"`
	VideoURL        string    `gorm:"type:text;not null" json:"video_url"`
	ThumbnailURL    string    `gorm:"type:text" json:"thumbnail_url"`
	DurationSeconds int       `gorm:"default:1440" json:"duration_seconds"`
	CreatedAt       time.Time `json:"created_at"`
}

type Bookmark struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"not null;uniqueIndex:idx_user_anime_bm" json:"user_id"`
	AnimeID   uint64    `gorm:"not null;uniqueIndex:idx_user_anime_bm" json:"anime_id"`
	Anime     *Anime    `gorm:"foreignKey:AnimeID" json:"anime,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type Rating struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"not null;uniqueIndex:idx_user_anime_rt" json:"user_id"`
	AnimeID   uint64    `gorm:"not null;uniqueIndex:idx_user_anime_rt" json:"anime_id"`
	Score     int       `gorm:"not null" json:"score"`
	CreatedAt time.Time `json:"created_at"`
}

type ForumTopic struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint64    `gorm:"not null" json:"user_id"`
	User          *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	AnimeID       *uint64   `json:"anime_id"`
	Anime         *Anime    `gorm:"foreignKey:AnimeID" json:"anime,omitempty"`
	Title         string    `gorm:"size:255;not null" json:"title"`
	Content       string    `gorm:"type:text;not null" json:"content"`
	ImageURL      string    `gorm:"type:text" json:"image_url"`
	Category      string    `gorm:"size:64;default:'General'" json:"category"`
	LikesCount    int       `gorm:"default:0" json:"likes_count"`
	CommentsCount int       `gorm:"default:0" json:"comments_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Comment struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"not null" json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	AnimeID   *uint64   `json:"anime_id"`
	TopicID   *uint64   `json:"topic_id"`
	ParentID  *uint64   `json:"parent_id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	IsSpoiler bool      `gorm:"default:false" json:"is_spoiler"`
	CreatedAt time.Time `json:"created_at"`
}

type VIPPlan struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name     string `gorm:"size:100;not null" json:"name"`
	Days     int    `gorm:"not null" json:"days"`
	PriceUZS int64  `gorm:"column:price_uzs;not null" json:"price_uzs"`
	Badge    string `gorm:"size:50" json:"badge"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

type PaymentSetting struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CardNumber    string    `gorm:"size:32;not null" json:"card_number"`
	CardHolder    string    `gorm:"size:255;not null" json:"card_holder"`
	BankName      string    `gorm:"size:100;not null" json:"bank_name"`
	InstructionUz string    `gorm:"type:text" json:"instruction_uz"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type VIPPurchase struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uint64     `gorm:"not null" json:"user_id"`
	User            *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	PlanID          uint       `gorm:"not null" json:"plan_id"`
	Plan            *VIPPlan   `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	AmountUZS       int64      `gorm:"column:amount_uzs;not null" json:"amount_uzs"`
	ReceiptImageURL string     `gorm:"type:text;not null" json:"receipt_image_url"`
	Status          string     `gorm:"size:32;default:'pending'" json:"status"`
	AdminID         *uint64    `json:"admin_id"`
	AdminNote       string     `gorm:"type:text" json:"admin_note"`
	ReviewedAt      *time.Time `json:"reviewed_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

func (User) TableName() string           { return "users" }
func (Genre) TableName() string          { return "genres" }
func (Anime) TableName() string          { return "animes" }
func (Episode) TableName() string        { return "episodes" }
func (Bookmark) TableName() string       { return "bookmarks" }
func (Rating) TableName() string         { return "ratings" }
func (ForumTopic) TableName() string     { return "forum_topics" }
func (Comment) TableName() string        { return "comments" }
func (VIPPlan) TableName() string        { return "vip_plans" }
func (PaymentSetting) TableName() string { return "payment_settings" }
func (VIPPurchase) TableName() string    { return "vip_purchases" }
