package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/ikevinws/reddit-clone/common"
	"github.com/ikevinws/reddit-clone/middleware"
	"github.com/ikevinws/reddit-clone/models"
)

func checkVoteValue(voteValue int) bool {
	validValues := []int{-1, 0, 1}
	for _, value := range validValues {
		if voteValue == value {
			return true
		}
	}
	return false
}

func CreateVote(w http.ResponseWriter, r *http.Request) {
	voteType := chi.URLParam(r, "voteType")
	vote := struct {
		Value int  `json:"value"`
		ID    uint `json:"id"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&vote); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if !checkVoteValue(vote.Value) {
		common.RespondError(w, http.StatusBadRequest, "invalid vote value")
		return
	}

	switch voteType {
	case "post":
		post, err := models.FindPostById(vote.ID)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		AcceessTokenClaims := middleware.GetRequestAccessTokenClaims(r)
		issuer, err := strconv.Atoi(AcceessTokenClaims.Issuer)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		prevPostVote, prevPostVoteErr := models.FindPostVoteById(post.ID, uint(issuer))
		if prevPostVoteErr != nil {
			postVote := models.PostVote{
				Vote: models.Vote{
					UserID: uint(issuer),
					Value:  vote.Value,
				},
				PostID: post.ID,
			}

			if err := models.CreatePostVote(&postVote); err != nil {
				common.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}
			if err := models.UpdatePostTotalVoteValue(&post, vote.Value); err != nil {
				common.RespondError(w, http.StatusInternalServerError, err.Error())
				return
			}
			w.WriteHeader(http.StatusCreated)
			return
		}
		diffValue := vote.Value - prevPostVote.Value
		if err := models.UpdatePostVoteValue(&prevPostVote, vote.Value); err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if err := models.UpdatePostTotalVoteValue(&post, diffValue); err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.WriteHeader(http.StatusCreated)
		return

	// case "comment":
	// 	if err != nil {
	// 		common.RespondError(w, http.StatusBadRequest, err.Error())
	// 		return
	// 	}
	// 	return
	default:
		common.RespondError(w, http.StatusBadRequest, "invalid vote type")
		return
	}
}
