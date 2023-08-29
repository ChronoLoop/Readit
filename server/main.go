package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
	"github.com/ikevinws/readit/routes"
	"github.com/joho/godotenv"
)

func main() {

	exPath := common.GetExePath()
	godotenv.Load(filepath.Join(exPath, "../.env"))

	db.Initialize()

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

	// Serve index.html for all other routes
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		filePath := r.URL.Path
		if strings.HasPrefix(filePath, "/static/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000")
			staticDir := http.Dir(filepath.Join(exPath, "../client/build"))
			http.FileServer(staticDir).ServeHTTP(w, r)
		} else {
			w.Header().Set("Cache-Control", "no-cache")
			http.ServeFile(w, r, filepath.Join(exPath, "../client/build/index.html"))
		}
	})

	http.ListenAndServe(":"+os.Getenv("PORT"), r)
}
