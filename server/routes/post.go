package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func PostRouter(r chi.Router) {
	r.Route("/post", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreatePost)
		r.Get("/", handlers.GetPosts)
		r.Get("/{id}", handlers.GetPost)
	})
}
