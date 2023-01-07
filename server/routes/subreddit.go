package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func SubreaditRouter(r chi.Router) {
	r.Route("/subreadit", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreateSubreadit)
		r.Get("/all", handlers.GetSubreadits)
		r.With(middleware.IsAuthorized).Get("/", handlers.GetUserSubreadits)
		r.With(middleware.IsAuthorized).Get("/me", handlers.GetSubreaditMe)
		r.With(middleware.IsAuthorized).Post("/join", handlers.JoinSubreadit)
		r.Get("/moderator", handlers.GetSubreaditModerators)
		r.With(middleware.IsAuthorized).Delete("/leave", handlers.LeaveSubreadit)
	})
}
