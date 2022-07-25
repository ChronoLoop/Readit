package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ikevinws/reddit-clone/db"
	"github.com/ikevinws/reddit-clone/models"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := db.Connection.Create(&user).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte{})
}

func SignIn(w http.ResponseWriter, r *http.Request) {

}

func SignOut(w http.ResponseWriter, r *http.Request) {

}
