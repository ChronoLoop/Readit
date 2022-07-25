package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi"
	chiMiddleware "github.com/go-chi/chi/middleware"
	"github.com/ikevinws/reddit-clone/db"
	"github.com/ikevinws/reddit-clone/routes"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	db.Initialize()

	r := chi.NewRouter()
	r.Use(chiMiddleware.Logger)
	r.Route("/api", func(r chi.Router) {
		routes.UserRouter(r)
	})

	http.ListenAndServe(":5000", r)
}
