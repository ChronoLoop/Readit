package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt"
)

const accessTokenClaimsContextKey string = "AccessTokenClaims"

func IsAuthorized(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		splitAuthHeader := strings.Split(authHeader, "Bearer ")
		if len(splitAuthHeader) != 2 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		authTokenStr := splitAuthHeader[1]

		token, err := jwt.ParseWithClaims(authTokenStr, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
			secretKey := os.Getenv("JWT_SECRET")
			return []byte(secretKey), nil
		})

		if err != nil {
			if err == jwt.ErrSignatureInvalid {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		claims := token.Claims.(*jwt.StandardClaims)

		ctx := context.WithValue(r.Context(), accessTokenClaimsContextKey, claims)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func GetRequestAccessTokenClaims(r *http.Request) *jwt.StandardClaims {
	return r.Context().Value(accessTokenClaimsContextKey).(*jwt.StandardClaims)
}
