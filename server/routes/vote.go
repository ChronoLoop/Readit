package routes

import (
	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/handlers"
	"github.com/ikevinws/readit/middleware"
)

func VoteRouter(r chi.Router) {
	r.Route("/vote", func(r chi.Router) {
		r.With(middleware.IsAuthorized).Post("/{voteType}", handlers.CreateVote)
		r.Get("/{voteType}", handlers.GetVote)
	})
}
