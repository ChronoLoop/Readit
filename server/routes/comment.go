package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
	"github.com/ikevinws/reddit-clone/middleware"
)

func CommentRouter(r chi.Router) {
	r.Route("/comment", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreateComment)
		r.Get("/", handlers.GetComments)
	})
}
