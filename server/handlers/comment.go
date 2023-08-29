package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
	dbconnection "github.com/ikevinws/readit/db/sqlc"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

type CommentResponse struct {
	CommentId int64 `json:"commentId"`
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	type request struct {
		UserID   int64         `json:"userID" validate:"required"`
		Text     string        `json:"text" validate:"required,min=1"`
		PostID   int64         `json:"postId" validate:"required"`
		ParentID sql.NullInt64 `json:"parentId"`
	}
	var body request

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	body.UserID = int64(issuer)

	validate := validator.New()
	if err := validate.Struct(&body); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}
	ctx := context.Background()
	comment, err := db.Connection.CreatePostComment(ctx, dbconnection.CreatePostCommentParams{
		UserID:   body.UserID,
		Text:     body.Text,
		PostID:   body.PostID,
		ParentID: body.ParentID,
	})
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	commentResponse := CommentResponse{CommentId: comment.ID}

	common.RespondJSON(w, http.StatusCreated, commentResponse)
}

func GetComments(w http.ResponseWriter, r *http.Request) {
	postIdParam := r.URL.Query().Get("postId")
	issuer, issuerErr := GetAccessTokenIssuer(r)

	if postIdParam == "" {
		common.RespondError(w, http.StatusBadRequest, "Could not get comments")
		return
	}

	postId, postIdErr := strconv.ParseInt(postIdParam, 10, 64)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get comments")
		return
	}

	ctx := context.Background()
	comments, commentsErr := db.Connection.GetPostComments(ctx, postId)
	if commentsErr != nil {
		common.RespondError(w, http.StatusBadRequest, commentsErr.Error())
		return
	}
	if issuerErr == nil {
		postsResponse := createResponseCommentsWithUser(&comments, issuer)
		common.RespondJSON(w, http.StatusOK, postsResponse)
		return
	}

	commentsResponse := CreateResponseComments(&comments)
	common.RespondJSON(w, http.StatusOK, commentsResponse)
}

func createResponsePostComment(postComment *dbconnection.GetPostCommentsRow) models.PostCommentSerializer {
	userSerialized := CreateResponseUser(&postComment.User)
	postCommentSerialized := models.PostCommentSerializer{
		ID:        postComment.ID,
		Text:      postComment.Text,
		CreatedAt: postComment.CreatedAt,
		User:      userSerialized,
		ParentID:  postComment.ParentID,
		PostID:    postComment.PostID,
	}

	ctx := context.Background()
	totalVoteValue, err := db.Connection.GetPostCommentTotalVoteValue(ctx, postComment.ID)
	if err == nil {
		postCommentSerialized.TotalVoteValue = totalVoteValue
	}
	return postCommentSerialized
}

func createResponseCommentWithUser(postComment *dbconnection.GetPostCommentsRow, userId int64) models.PostCommentSerializer {
	postCommentResponse := createResponsePostComment(postComment)
	ctx := context.Background()
	postVote, err := db.Connection.FindPostCommentVoteById(ctx, dbconnection.FindPostCommentVoteByIdParams{UserID: userId, PostCommentID: postCommentResponse.ID})
	if err == nil {
		postCommentResponse.UserVote = &models.UserVoteSerializer{
			UserID: postVote.UserID,
			Value:  postVote.Value,
		}
	}
	return postCommentResponse
}
func createResponseCommentsWithUser(postComments *[]dbconnection.GetPostCommentsRow, userId int64) []models.PostCommentSerializer {
	postCommentsResponse := []models.PostCommentSerializer{}
	for _, postComment := range *postComments {
		postCommentSerialized := createResponseCommentWithUser(&postComment, userId)
		postCommentsResponse = append(postCommentsResponse, postCommentSerialized)
	}
	return postCommentsResponse
}

func CreateResponseComments(postComments *[]dbconnection.GetPostCommentsRow) []models.PostCommentSerializer {
	postCommentsResponse := []models.PostCommentSerializer{}
	for _, postComment := range *postComments {
		postCommentSerialized := createResponsePostComment(&postComment)
		postCommentsResponse = append(postCommentsResponse, postCommentSerialized)
	}
	return postCommentsResponse
}
