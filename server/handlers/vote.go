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

func createPostVoteResponse(postVote *models.PostVote) models.PostVoteSerializer {
	return models.PostVoteSerializer{
		Value:  postVote.Value,
		UserID: postVote.UserID,
	}
}

func createPostCommentVoteResponse(postCommentVote *models.PostCommentVote) models.PostCommentVoteSerializer {
	return models.PostCommentVoteSerializer{
		Value:  postCommentVote.Value,
		UserID: postCommentVote.UserID,
	}
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
		issuer, err := middleware.GetJwtClaimsIssuer(r)

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

			w.WriteHeader(http.StatusCreated)
			return
		}

		if err := models.UpdatePostVoteValue(&prevPostVote, vote.Value); err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.WriteHeader(http.StatusCreated)
		return

	case "comment":
		comment, err := models.FindPostCommentById(vote.ID)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		issuer, err := middleware.GetJwtClaimsIssuer(r)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		prevCommentVote, prevCommentVoteErr := models.FindPostCommentVoteById(comment.ID, uint(issuer))
		if prevCommentVoteErr != nil {
			commentVote := models.PostCommentVote{
				Vote: models.Vote{
					UserID: uint(issuer),
					Value:  vote.Value,
				},
				PostCommentID: comment.ID,
			}

			if err := models.CreatePostCommentVote(&commentVote); err != nil {
				common.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}

			w.WriteHeader(http.StatusCreated)
			return
		}
		if err := models.UpdatePostCommentVoteValue(&prevCommentVote, vote.Value); err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.WriteHeader(http.StatusCreated)
		return

	default:
		common.RespondError(w, http.StatusBadRequest, "invalid vote type")
		return
	}
}

func GetVote(w http.ResponseWriter, r *http.Request) {
	voteType := chi.URLParam(r, "voteType")
	voteTypeIdParam := r.URL.Query().Get("id")

	if voteTypeIdParam == "" {
		common.RespondError(w, http.StatusBadRequest, "No vote id")
		return
	}

	voteTypeId, voteTypeIdErr := strconv.Atoi(voteTypeIdParam)
	if voteTypeIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get vote")
		return
	}

	issuer, issuerErr := GetAccessTokenIssuer(r)
	if issuerErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get vote")
		return
	}

	switch voteType {
	case "post":
		postVote, err := models.FindPostVoteById(uint(voteTypeId), uint(issuer))
		postVoteResponse := createPostVoteResponse(&postVote)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		common.RespondJSON(w, http.StatusOK, postVoteResponse)
		return

	case "comment":
		commentVote, err := models.FindPostCommentVoteById(uint(voteTypeId), uint(issuer))
		commentVoteResponse := createPostCommentVoteResponse(&commentVote)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		common.RespondJSON(w, http.StatusOK, commentVoteResponse)
		return

	default:
		common.RespondError(w, http.StatusBadRequest, "invalid vote type")
		return
	}
}
