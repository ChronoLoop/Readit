package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/ikevinws/readit/db"
	"github.com/ikevinws/readit/models"
	"github.com/ikevinws/readit/routes"
	"github.com/joho/godotenv"
)

func main() {
	ex, err := os.Executable()

	if err != nil {
		panic(err)
	}
	exPath := filepath.Dir(ex)

	godotenv.Load(filepath.Join(exPath, "../.env"))

	db.Initialize()
	// db.Connection.Migrator().DropTable(&models.User{}, &models.Subreadit{}, &models.Post{}, &models.PostVote{}, &models.PostCommentVote{}, &models.PostComment{}, &models.SubreaditUser{})
	db.Connection.AutoMigrate(&models.User{}, &models.Subreadit{}, &models.Post{}, &models.PostVote{}, &models.PostCommentVote{}, &models.PostComment{}, &models.SubreaditUser{}, &models.UserReadPost{})

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://readit.up.railway.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
	}))

	r.Use(middleware.Logger)
	r.Use(httprate.LimitAll(250, time.Minute))

	r.Route("/api", func(r chi.Router) {
		routes.UserRouter(r)
		routes.SubreaditRouter(r)
		routes.PostRouter(r)
		routes.VoteRouter(r)
		routes.CommentRouter(r)
		routes.UserProfileRouter(r)
	})

	clientBuildDir := http.Dir(filepath.Join(exPath, "../client/build"))
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(clientBuildDir))
		fs.ServeHTTP(w, r)
	})

	http.ListenAndServe(":"+os.Getenv("PORT"), r)
}
