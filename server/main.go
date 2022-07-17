package main

import (
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/ikevinws/reddit-clone/routes"
	"net/http"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Route("/api", func(r chi.Router) {
		r.Route("/user", routes.UserRouter)
	})

	http.ListenAndServe(":5000", r)
}
