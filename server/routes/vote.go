package routes

import (
	"github.com/go-chi/chi"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func VoteRouter(r chi.Router) {
	r.With(middleware.IsAuthorized).Route("/vote", func(r chi.Router) {
		r.Post("/{voteType}", handlers.CreateVote)
		r.Get("/{voteType}", handlers.GetVote)
	})
}
