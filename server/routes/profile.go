package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/handlers"
)

func UserProfileRouter(r chi.Router) {
	r.Route("/profile", func(r chi.Router) {
		r.Get("/overview/{userName}", handlers.GetUserOverview)
	})
}
