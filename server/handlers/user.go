package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
	"golang.org/x/crypto/bcrypt"
)

const refreshTokenCookieName string = "refresh_token"
const refreshTokenExpirationTimeDuration time.Duration = time.Hour * 24 * 7

func createJwtToken(secretKey string, issuer int64, expirationTime time.Time) (string, error) {
	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    strconv.FormatInt(issuer, 10),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	})
	return tokenClaims.SignedString([]byte(secretKey))
}

func generateAuthTokens(issuer int64) (map[string]string, error) {
	secretKey := os.Getenv("JWT_SECRET")

	accessToken, err := createJwtToken(secretKey, issuer, time.Now().Add(time.Minute*20))
	if err != nil {
		return nil, errors.New("could not login")
	}

	refreshTokenExpirationTime := time.Now().Add(refreshTokenExpirationTimeDuration)
	refreshToken, err := createJwtToken(secretKey, issuer, refreshTokenExpirationTime)
	if err != nil {
		return nil, errors.New("could not login")
	}

	return map[string]string{"refreshToken": refreshToken, "accessToken": accessToken}, nil
}

func sendTokens(w http.ResponseWriter, issuer int64, user *models.User) {
	authTokens, err := generateAuthTokens(issuer)
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, "Could not login")
	}

	http.SetCookie(w, &http.Cookie{
		Name:     refreshTokenCookieName,
		Value:    authTokens["refreshToken"],
		Expires:  time.Now().Add(refreshTokenExpirationTimeDuration),
		HttpOnly: true,
	})

	common.RespondJSON(w, http.StatusOK, struct {
		AccessToken string                `json:"accessToken"`
		User        models.UserSerializer `json:"user"`
	}{
		AccessToken: authTokens["accessToken"],
		User: models.UserSerializer{
			ID:       user.ID,
			Username: user.Username,
		},
	})

}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	validate := validator.New()
	if err := validate.Struct(&user); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if _, err := models.FindUserByName(user.Username); err == nil {
		common.RespondError(w, http.StatusBadRequest, "Username already exists")
		return
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	user.Password = string(password)

	if err := models.CreateUser(user.Username, user.Password); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func SignIn(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	dbUser, dbUserErr := models.FindUserByName(user.Username)

	if dbUserErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(user.Password)); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	sendTokens(w, dbUser.ID, &dbUser)
}

func SignOut(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    refreshTokenCookieName,
		Value:   "",
		Expires: time.Now().Add(-time.Hour),
	})
	w.WriteHeader(http.StatusNoContent)
}

func Refresh(w http.ResponseWriter, r *http.Request) {
	refreshCookie, err := r.Cookie(refreshTokenCookieName)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	refreshToken, err := jwt.ParseWithClaims(refreshCookie.Value, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
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
	if !refreshToken.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	claims := refreshToken.Claims.(*jwt.RegisteredClaims)
	issuer, err := strconv.ParseInt(claims.Issuer, 10, 64)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	user, err := models.FindUserById(issuer)
	if err != nil {
		http.SetCookie(w, &http.Cookie{
			Name:    refreshTokenCookieName,
			Value:   "",
			Expires: time.Now().Add(-time.Hour),
		})
		common.RespondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	sendTokens(w, issuer, &user)
}

func UserMe(w http.ResponseWriter, r *http.Request) {
	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, err := models.FindUserById(issuer)

	if err != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not find user")
		return
	}

	responseUser := CreateResponseUser(&user)
	common.RespondJSON(w, http.StatusOK, responseUser)
}

func CreateResponseUser(user *models.User) models.UserSerializer {
	return models.UserSerializer{
		ID:       user.ID,
		Username: user.Username,
	}
}

func GetAccessTokenIssuer(r *http.Request) (int64, error) {
	authHeader := r.Header.Get("Authorization")

	splitAuthHeader := strings.Split(authHeader, "Bearer ")
	if len(splitAuthHeader) != 2 {
		return 0, errors.New("could not find issuer")
	}
	authTokenStr := splitAuthHeader[1]

	token, err := jwt.ParseWithClaims(authTokenStr, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		secretKey := os.Getenv("JWT_SECRET")
		return []byte(secretKey), nil
	})

	if err != nil || !token.Valid {
		return 0, errors.New("claims invalid")
	}

	claims := token.Claims.(*jwt.RegisteredClaims)
	return strconv.ParseInt(claims.Issuer, 10, 64)
}
