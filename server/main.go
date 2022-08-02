package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/ikevinws/reddit-clone/db"
	"github.com/ikevinws/reddit-clone/routes"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load("../.env")
	if os.Getenv("SERVER_ENV") == "development" && err != nil {
		log.Fatal("Error loading .env file")
	}

	db.Initialize()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Route("/api", func(r chi.Router) {
		routes.UserRouter(r)
		routes.SubredditRouter(r)
	})

	http.ListenAndServe(":5000", r)
}
