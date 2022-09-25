package main

import (
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/ikevinws/readit/db"
	"github.com/ikevinws/readit/models"
	"github.com/ikevinws/readit/routes"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../.env")

	db.Initialize()
	// db.Connection.Migrator().DropTable(&models.User{}, &models.Subreadit{}, &models.Post{}, &models.PostVote{}, &models.PostCommentVote{}, &models.PostComment{}, &models.SubreaditUser{})
	db.Connection.AutoMigrate(&models.User{}, &models.Subreadit{}, &models.Post{}, &models.PostVote{}, &models.PostCommentVote{}, &models.PostComment{}, &models.SubreaditUser{})

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Route("/api", func(r chi.Router) {
		routes.UserRouter(r)
		routes.SubreaditRouter(r)
		routes.PostRouter(r)
		routes.VoteRouter(r)
		routes.CommentRouter(r)
	})

	http.ListenAndServe(":"+os.Getenv("PORT"), r)
}
