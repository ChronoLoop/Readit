package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func PostRouter(r chi.Router) {
	r.Route("/post", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreatePost)
		r.Get("/", handlers.GetPosts)
		r.Get("/{id}", handlers.GetPost)
		r.With(middleware.IsAuthorized).Get("/read/recent", handlers.GetUserRecentReadPosts)
		r.With(middleware.IsAuthorized).Post("/read/{id}", handlers.CreateUserReadPost)
		r.With(middleware.IsAuthorized).Get("/read/{id}", handlers.GetUserReadPost)
		r.With(middleware.IsAuthorized).Delete("/{id}", handlers.DeleteUserPost)
	})
}
