package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/handlers"
	"github.com/ikevinws/reddit-clone/middleware"
)

func VoteRouter(r chi.Router) {
	r.With(middleware.IsAuthorized).Route("/vote", func(r chi.Router) {
		r.Post("/{voteType}", handlers.CreateVote)
	})
}
