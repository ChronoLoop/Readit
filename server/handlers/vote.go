package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
	dbconnection "github.com/ikevinws/readit/db/sqlc"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
	"golang.org/x/net/context"
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

func createPostVoteResponse(postVote *dbconnection.PostVote, totalVoteValue int64, postId int64) VoteResponse {
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

func createPostCommentVoteResponse(postCommentVote *dbconnection.PostCommentVote, totalVoteValue int64, commentId int64) VoteResponse {
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
		ctx := context.Background()
		post, err := db.Connection.FindPostById(ctx, vote.ID)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		issuer, err := middleware.GetJwtClaimsIssuer(r)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		prevPostVote, prevPostVoteErr := db.Connection.FindPostVoteById(ctx, dbconnection.FindPostVoteByIdParams{UserID: issuer, PostID: post.ID})
		if prevPostVoteErr != nil {
			postVote := dbconnection.PostVote{
				UserID: issuer,
				Value:  vote.Value,
				PostID: post.ID,
			}

			if err := db.Connection.CreatePostVote(ctx, dbconnection.CreatePostVoteParams{PostID: postVote.PostID, UserID: postVote.UserID, Value: postVote.Value}); err != nil {
				common.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}

			w.WriteHeader(http.StatusCreated)
			return
		}

		if err := db.Connection.UpdatePostVoteValue(ctx, dbconnection.UpdatePostVoteValueParams{Value: vote.Value, UserID: prevPostVote.UserID, PostID: prevPostVote.PostID}); err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		w.WriteHeader(http.StatusCreated)
		return

	case "comment":
		ctx := context.Background()
		comment, err := db.Connection.FindPostCommentById(ctx, vote.ID)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		issuer, err := middleware.GetJwtClaimsIssuer(r)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		prevCommentVote, prevCommentVoteErr := db.Connection.FindPostCommentVoteById(ctx, dbconnection.FindPostCommentVoteByIdParams{PostCommentID: comment.ID, UserID: issuer})
		if prevCommentVoteErr != nil {
			commentVote := dbconnection.PostCommentVote{
				UserID:        issuer,
				Value:         vote.Value,
				PostCommentID: comment.ID,
			}

			if err := db.Connection.CreatePostCommentVote(ctx, dbconnection.CreatePostCommentVoteParams{UserID: commentVote.UserID, Value: commentVote.Value, PostCommentID: commentVote.PostCommentID}); err != nil {
				common.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}

			w.WriteHeader(http.StatusCreated)
			return
		}
		if err := db.Connection.UpdatePostCommentVoteValue(ctx, dbconnection.UpdatePostCommentVoteValueParams{PostCommentID: prevCommentVote.PostCommentID, UserID: prevCommentVote.UserID, Value: vote.Value}); err != nil {
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

	voteTypeId, voteTypeIdErr := strconv.ParseInt(voteTypeIdParam, 10, 64)
	if voteTypeIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get vote")
		return
	}

	issuer, issuerErr := GetAccessTokenIssuer(r)

	switch voteType {
	case "post":
		ctx := context.Background()
		totalVoteValue, err := db.Connection.GetPostTotalVoteValue(ctx, voteTypeId)
		if err != nil {
			totalVoteValue = 0
		}
		if issuerErr == nil {
			postVote, err := db.Connection.FindPostVoteById(ctx, dbconnection.FindPostVoteByIdParams{UserID: issuer, PostID: voteTypeId})
			if err != nil {
				postVoteResponse := createPostVoteResponse(nil, totalVoteValue, voteTypeId)
				common.RespondJSON(w, http.StatusOK, postVoteResponse)
				return
			}
			postVoteResponse := createPostVoteResponse(&postVote, totalVoteValue, voteTypeId)
			common.RespondJSON(w, http.StatusOK, postVoteResponse)
			return
		}

		postVoteResponse := createPostVoteResponse(nil, totalVoteValue, voteTypeId)
		common.RespondJSON(w, http.StatusOK, postVoteResponse)
		return

	case "comment":
		ctx := context.Background()
		totalVoteValue, err := db.Connection.GetPostCommentTotalVoteValue(ctx, voteTypeId)
		if err != nil {
			totalVoteValue = 0
			return
		}
		if issuerErr == nil {
			commentVote, err := db.Connection.FindPostCommentVoteById(ctx, dbconnection.FindPostCommentVoteByIdParams{UserID: issuer, PostCommentID: voteTypeId})
			if err != nil {
				commentVoteResponse := createPostCommentVoteResponse(&commentVote, totalVoteValue, voteTypeId)
				common.RespondJSON(w, http.StatusOK, commentVoteResponse)
				return
			}
			commentVoteResponse := createPostCommentVoteResponse(&commentVote, totalVoteValue, voteTypeId)
			common.RespondJSON(w, http.StatusOK, commentVoteResponse)
			return
		}
		commentVoteResponse := createPostCommentVoteResponse(nil, totalVoteValue, voteTypeId)
		common.RespondJSON(w, http.StatusOK, commentVoteResponse)
		return

	default:
		common.RespondError(w, http.StatusBadRequest, "invalid vote type")
		return
	}
}
