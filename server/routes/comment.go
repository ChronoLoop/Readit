package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func CommentRouter(r chi.Router) {
	r.Route("/comment", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreateComment)
		r.Get("/", handlers.GetComments)
		r.With(middleware.IsAuthorized).Delete("/{id}", handlers.DeleteUserComment)
	})
}
