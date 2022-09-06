package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-playground/validator"
	"github.com/golang-jwt/jwt"
	"github.com/ikevinws/reddit-clone/common"
	"github.com/ikevinws/reddit-clone/middleware"
	"github.com/ikevinws/reddit-clone/models"
	"golang.org/x/crypto/bcrypt"
)

const refreshTokenCookieName string = "refresh_token"
const refreshTokenExpirationTimeDuration time.Duration = time.Hour * 24 * 7

func createJwtToken(secretKey string, issuer int, expirationTime time.Time) (string, error) {
	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    strconv.Itoa(issuer),
		ExpiresAt: expirationTime.Unix(),
	})
	return tokenClaims.SignedString([]byte(secretKey))
}

func generateAuthTokens(issuer int) (map[string]string, error) {
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

func sendTokens(w http.ResponseWriter, issuer int) {
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

	common.RespondJSON(w, http.StatusOK, map[string]string{
		"accessToken": authTokens["accessToken"],
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

	if err := models.CreateUser(&user); err != nil {
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

	sendTokens(w, int(dbUser.ID))
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
	refreshToken, err := jwt.ParseWithClaims(refreshCookie.Value, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
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
	claims := refreshToken.Claims.(*jwt.StandardClaims)
	issuer, err := strconv.Atoi(claims.Issuer)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if _, err := models.FindUserById(issuer); err != nil {
		http.SetCookie(w, &http.Cookie{
			Name:    refreshTokenCookieName,
			Value:   "",
			Expires: time.Now().Add(-time.Hour),
		})
		common.RespondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	sendTokens(w, issuer)
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
