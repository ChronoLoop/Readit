package utils

import (
	"strconv"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/ikevinws/reddit-clone/models"
)

const REFRESH_TOKEN_EXPIRATION_TIME_DURATION time.Duration = time.Minute * 24 * 7

func createJwtToken(secretKey string, issuer int, expirationTime time.Time) (string, error) {
	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    strconv.Itoa(issuer),
		ExpiresAt: expirationTime.Unix(),
	})
	return tokenClaims.SignedString([]byte(secretKey))
}

func GenerateAccessToken(secretKey string, user *models.User) (string, error) {
	return createJwtToken(secretKey, int(user.ID), time.Now().Add(time.Minute*20))
}

func GenerateRefreshToken(secretKey string, user *models.User) (string, error) {
	return createJwtToken(secretKey, int(user.ID), time.Now().Add(REFRESH_TOKEN_EXPIRATION_TIME_DURATION))
}
