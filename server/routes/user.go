package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
)

func UserRouter(r chi.Router) {
	r.Post("/register", handlers.CreateUser)
	r.Post("/signin", handlers.Signin)
	r.Get("/signout", handlers.Signout)

}
