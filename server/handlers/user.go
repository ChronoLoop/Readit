package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-playground/validator"
	"github.com/golang-jwt/jwt"
	"github.com/ikevinws/reddit-clone/db"
	"github.com/ikevinws/reddit-clone/models"
	"golang.org/x/crypto/bcrypt"
)

func createJwtToken(secretKey string, issuer int, expirationTime time.Time) (string, error) {
	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    strconv.Itoa(issuer),
		ExpiresAt: expirationTime.Unix(), //1 day
	})
	return tokenClaims.SignedString([]byte(secretKey))
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	validate := validator.New()
	if err := validate.Struct(&user); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if _, userExists := models.FindUser(db.Connection, user.Username); userExists == true {
		respondError(w, http.StatusBadRequest, "Username already exists")
		return
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	user.Password = string(password)

	if err := models.CreateUser(db.Connection, &user); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func SignIn(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	dbUser, userExists := models.FindUser(db.Connection, user.Username)

	if userExists == false {
		respondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(dbUser.Password), []byte(user.Password)); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid Credentials")
		return
	}

	secretKey := os.Getenv("JWT_SECRET")

	accessToken, err := createJwtToken(secretKey, int(dbUser.ID), time.Now().Add(time.Hour*24))
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Could not login")
		return
	}

	refreshTokenExpirationTime := time.Now().Add(time.Hour * 24 * 7)
	refreshToken, err := createJwtToken(secretKey, int(dbUser.ID), refreshTokenExpirationTime)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Could not login")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Expires:  refreshTokenExpirationTime,
		HttpOnly: true,
	})

	respondJSON(w, http.StatusOK, map[string]string{
		"accessToken": accessToken,
	})
}

func SignOut(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    "refresh_token",
		Value:   "",
		Expires: time.Now().Add(-time.Hour),
	})
	w.WriteHeader(http.StatusNoContent)
}
