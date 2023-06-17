package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func UserRouter(r chi.Router) {
	r.Route("/user", func(r chi.Router) {
		r.Post("/register", handlers.RegisterUser)
		r.Post("/signin", handlers.SignIn)
		r.Get("/signout", handlers.SignOut)
		r.Get("/refresh", handlers.Refresh)
		r.With(middleware.IsAuthorized).Get("/me", handlers.UserMe)
	})
}
