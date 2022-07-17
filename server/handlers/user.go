package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

type User struct {
	Name     string `json:"name"`
	Id       int    `json:"id"`
	Password string `json:"-"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	user := &User{Name: "Frank", Id: 1, Password: "12kjfisdjo"}
	w.Header().Set("content-type", "application/json")
	if err := json.NewEncoder(w).Encode(user); err != nil {
		log.Fatal(err)
	}
}

func Signin(w http.ResponseWriter, r *http.Request) {

}

func Signout(w http.ResponseWriter, r *http.Request) {

}
