package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

type CommentResponse struct {
	CommentId int64 `json:"commentId"`
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment models.PostComment

	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	comment.UserID = issuer

	validate := validator.New()
	if err := validate.Struct(&comment); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}
	newComment, err := models.CreatePostComment(comment.UserID, comment.PostID, comment.Text, comment.ParentID)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.CreatePostCommentVote(issuer, newComment.ID, 1); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	commentResponse := CommentResponse{CommentId: newComment.ID}

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

	comments, commentsErr := models.GetPostComments(postId)
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

func DeleteUserComment(w http.ResponseWriter, r *http.Request) {
	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	commentIdParam := chi.URLParam(r, "id")
	if commentIdParam == "" {
		common.RespondJSON(w, http.StatusBadRequest, "could not get comment")
		return
	}
	commentId, commentIdErr := strconv.ParseInt(commentIdParam, 10, 64)
	if commentIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "could not get comment")
		return
	}

	if _, err := models.FindPostCommentById(commentId); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.DeletePostComment(commentId, issuer); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusOK)
}

func createResponsePostComment(postComment *models.PostComment) models.PostCommentSerializer {
	userSerialized := CreateResponseUser(&postComment.User)
	postCommentSerialized := models.PostCommentSerializer{
		ID:        postComment.ID,
		Text:      postComment.Text,
		CreatedAt: postComment.CreatedAt,
		User:      &userSerialized,
		ParentID:  postComment.ParentID,
		PostID:    postComment.PostID,
	}
	if postComment.DeletedAt.Valid {
		postCommentSerialized.Text = "[deleted]"
		postCommentSerialized.User = nil
	}

	totalVoteValue, err := models.GetPostCommentTotalVoteValue(postComment.ID)
	if err == nil {
		postCommentSerialized.TotalVoteValue = totalVoteValue
	}
	return postCommentSerialized
}

func createResponseCommentWithUser(postComment *models.PostComment, userId int64) models.PostCommentSerializer {
	postResponse := createResponsePostComment(postComment)
	postVote, err := models.FindPostCommentVoteById(postResponse.ID, userId)
	if err == nil {
		postResponse.UserVote = &models.UserVoteSerializer{
			UserID: postVote.UserID,
			Value:  postVote.Value,
		}
	}
	return postResponse
}

func createResponseCommentsWithUser(postComments *[]models.PostComment, userId int64) []models.PostCommentSerializer {
	postCommentsResponse := []models.PostCommentSerializer{}
	for _, postComment := range *postComments {
		postCommentSerialized := createResponseCommentWithUser(&postComment, userId)
		postCommentsResponse = append(postCommentsResponse, postCommentSerialized)
	}
	return postCommentsResponse
}

func CreateResponseComments(postComments *[]models.PostComment) []models.PostCommentSerializer {
	postCommentsResponse := []models.PostCommentSerializer{}
	for _, postComment := range *postComments {
		postCommentSerialized := createResponsePostComment(&postComment)
		postCommentsResponse = append(postCommentsResponse, postCommentSerialized)
	}
	return postCommentsResponse
}
