package middleware

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const accessTokenClaimsContextKey = contextKey("AccessTokenClaims")

func IsAuthorized(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		splitAuthHeader := strings.Split(authHeader, "Bearer ")
		if len(splitAuthHeader) != 2 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		authTokenStr := splitAuthHeader[1]

		token, err := jwt.ParseWithClaims(authTokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			secretKey := os.Getenv("JWT_SECRET")
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(*jwt.RegisteredClaims)

		ctx := context.WithValue(r.Context(), accessTokenClaimsContextKey, claims)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func GetRequestAccessTokenClaims(r *http.Request) *jwt.RegisteredClaims {
	return r.Context().Value(accessTokenClaimsContextKey).(*jwt.RegisteredClaims)
}

func GetJwtClaimsIssuer(r *http.Request) (int, error) {
	AcceessTokenClaims := GetRequestAccessTokenClaims(r)
	return strconv.Atoi(AcceessTokenClaims.Issuer)
}
