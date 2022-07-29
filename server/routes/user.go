package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
)

func UserRouter(r chi.Router) {
	r.Route("/user", func(r chi.Router) {
		r.Post("/register", handlers.RegisterUser)
		r.Post("/signin", handlers.SignIn)
		r.Get("/signout", handlers.SignOut)
	})
}
