package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

type VoteResponse struct {
	TotalVoteValue int64                      `json:"totalVoteValue"`
	ID             int64                      `json:"id"`
	UserVote       *models.UserVoteSerializer `json:"userVote"`
}

func checkVoteValue(voteValue int32) bool {
	validValues := []int32{-1, 0, 1}
	for _, value := range validValues {
		if voteValue == value {
			return true
		}
	}
	return false
}

func createPostVoteResponse(postVote *models.PostVote, totalVoteValue int64, postId int64) VoteResponse {
	var userVote *models.UserVoteSerializer = nil
	if postVote != nil {
		userVote = &models.UserVoteSerializer{
			Value:  postVote.Value,
			UserID: postVote.UserID,
		}
	}

	return VoteResponse{
		TotalVoteValue: totalVoteValue,
		ID:             postId,
		UserVote:       userVote,
	}
}

func createPostCommentVoteResponse(postCommentVote *models.PostCommentVote, totalVoteValue int64, commentId int64) VoteResponse {
	var userVote *models.UserVoteSerializer = nil

	if postCommentVote != nil {
		userVote = &models.UserVoteSerializer{
			Value:  postCommentVote.Value,
			UserID: postCommentVote.UserID,
		}
	}

	return VoteResponse{
		TotalVoteValue: totalVoteValue,
		ID:             commentId,
		UserVote:       userVote,
	}
}

func CreateVote(w http.ResponseWriter, r *http.Request) {
	voteType := chi.URLParam(r, "voteType")
	vote := struct {
		Value int32 `json:"value"`
		ID    int64 `json:"id"`
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

		prevPostVote, prevPostVoteErr := models.FindPostVoteById(post.ID, int64(issuer))
		if prevPostVoteErr != nil {
			postVote := models.PostVote{
				Vote: models.Vote{
					UserID: issuer,
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
		prevCommentVote, prevCommentVoteErr := models.FindPostCommentVoteById(comment.ID, int64(issuer))
		if prevCommentVoteErr != nil {
			if err := models.CreatePostCommentVote(issuer, comment.ID, int(vote.Value)); err != nil {
				common.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}

			w.WriteHeader(http.StatusCreated)
			return
		}
		if err := models.UpdatePostCommentVoteValue(models.UpdatePostCommentVoteValueParams{UserId: prevCommentVote.UserID, PostCommentId: prevCommentVote.PostCommentID, Val: vote.Value}); err != nil {
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

	switch voteType {
	case "post":
		totalVoteValue, err := models.GetPostTotalVoteValue(int64(voteTypeId))
		if err != nil {
			totalVoteValue = 0
		}
		if issuerErr == nil {
			postVote, err := models.FindPostVoteById(int64(voteTypeId), issuer)
			if err != nil {
				postVoteResponse := createPostVoteResponse(nil, totalVoteValue, int64(voteTypeId))
				common.RespondJSON(w, http.StatusOK, postVoteResponse)
				return
			}
			postVoteResponse := createPostVoteResponse(&postVote, totalVoteValue, int64(voteTypeId))
			common.RespondJSON(w, http.StatusOK, postVoteResponse)
			return
		}

		postVoteResponse := createPostVoteResponse(nil, totalVoteValue, int64(voteTypeId))
		common.RespondJSON(w, http.StatusOK, postVoteResponse)
		return

	case "comment":
		totalVoteValue, err := models.GetPostCommentTotalVoteValue(int64(voteTypeId))
		if err != nil {
			totalVoteValue = 0
			return
		}
		if issuerErr == nil {
			commentVote, err := models.FindPostCommentVoteById(int64(voteTypeId), issuer)
			if err != nil {
				commentVoteResponse := createPostCommentVoteResponse(&commentVote, totalVoteValue, int64(voteTypeId))
				common.RespondJSON(w, http.StatusOK, commentVoteResponse)
				return
			}
			commentVoteResponse := createPostCommentVoteResponse(&commentVote, totalVoteValue, int64(voteTypeId))
			common.RespondJSON(w, http.StatusOK, commentVoteResponse)
			return
		}
		commentVoteResponse := createPostCommentVoteResponse(nil, totalVoteValue, int64(voteTypeId))
		common.RespondJSON(w, http.StatusOK, commentVoteResponse)
		return

	default:
		common.RespondError(w, http.StatusBadRequest, "invalid vote type")
		return
	}
}
