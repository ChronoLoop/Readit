package main

import (
	"net/http"
	"os"
	"path"
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

	//air runs executable in tmp
	if path.Base(exPath) == "tmp" {
		exPath = filepath.Join(exPath, "../")
	}
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
		fs := http.StripPrefix(pathPrefix, cacheControlHandler(http.FileServer(clientBuildDir)))
		fs.ServeHTTP(w, r)
	})

	http.ListenAndServe(":"+os.Getenv("PORT"), r)
}

// cacheControlHandler is a custom handler that sets the Cache-Control header
func cacheControlHandler(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the requested file path
		filePath := r.URL.Path

		// Check if the requested file is under the "client/build/static" directory
		if strings.HasPrefix(filePath, "/static/") {
			w.Header().Set("Cache-Control", "public, max-age=31536000")
		} else {
			w.Header().Set("Cache-Control", "no-cache")
		}

		h.ServeHTTP(w, r)
	}
}
