package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
	"github.com/ikevinws/reddit-clone/middleware"
)

func SubredditRouter(r chi.Router) {
	r.Route("/subreddit", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/create", handlers.CreateSubreddit)
		r.Get("/", handlers.GetSubreddits)
	})
}
