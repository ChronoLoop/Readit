package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
	"github.com/ikevinws/reddit-clone/middleware"
)

func PostRouter(r chi.Router) {
	r.Route("/post", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreatePost)
		r.Get("/", handlers.GetPosts)
	})
}
