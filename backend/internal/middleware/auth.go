package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"anime-stream-backend/internal/config"
	"anime-stream-backend/internal/database"
	"anime-stream-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID uint64 `json:"user_id"`
	Role   string `json:"role"`
	IsVIP  bool   `json:"is_vip"`
	jwt.RegisteredClaims
}

func GenerateToken(user *models.User, cfg *config.Config) (string, error) {
	claims := JWTClaims{
		UserID: user.ID,
		Role:   user.Role,
		IsVIP:  user.IsVIP,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "anime-stream-platform",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var tokenString string

		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// Check cookie
			cookie, err := c.Cookie("auth_token")
			if err == nil {
				tokenString = cookie
			}
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Tizimga kirish talab qilinadi"})
			c.Abort()
			return
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Yaroqsiz yoki muddati o'tgan token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ma'lumotlarini o'qib bo'lmadi"})
			c.Abort()
			return
		}

		var user models.User
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Foydalanuvchi topilmadi"})
			c.Abort()
			return
		}

		// Update VIP status if expired
		if user.IsVIP && user.VIPExpiresAt != nil && user.VIPExpiresAt.Before(time.Now()) {
			user.IsVIP = false
			database.DB.Model(&user).Update("is_vip", false)
		}

		c.Set("user", &user)
		c.Set("userID", user.ID)
		c.Set("userRole", user.Role)
		c.Set("isVIP", user.IsVIP)

		c.Next()
	}
}

func OptionalAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		var tokenString string

		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			cookie, err := c.Cookie("auth_token")
			if err == nil {
				tokenString = cookie
			}
		}

		if tokenString != "" {
			token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWTSecret), nil
			})
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(*JWTClaims); ok {
					var user models.User
					if err := database.DB.First(&user, claims.UserID).Error; err == nil {
						if user.IsVIP && user.VIPExpiresAt != nil && user.VIPExpiresAt.Before(time.Now()) {
							user.IsVIP = false
							database.DB.Model(&user).Update("is_vip", false)
						}
						c.Set("user", &user)
						c.Set("userID", user.ID)
						c.Set("userRole", user.Role)
						c.Set("isVIP", user.IsVIP)
					}
				}
			}
		}

		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Avtorizatsiyadan o'tilmagan"})
			c.Abort()
			return
		}

		user := userVal.(*models.User)
		if user.Role != "admin" && user.Role != "superadmin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Ushbu amal uchun Administrator huquqi talab etiladi"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func SuperAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Avtorizatsiyadan o'tilmagan"})
			c.Abort()
			return
		}

		user := userVal.(*models.User)
		if user.Role != "superadmin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Faqat Super Administrator huquqi bilan bajarish mumkin"})
			c.Abort()
			return
		}

		c.Next()
	}
}
