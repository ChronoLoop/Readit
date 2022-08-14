package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-playground/validator"
	"github.com/ikevinws/reddit-clone/common"
	"github.com/ikevinws/reddit-clone/middleware"
	"github.com/ikevinws/reddit-clone/models"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment models.PostComment

	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	AcceessTokenClaims := middleware.GetRequestAccessTokenClaims(r)
	issuer, err := strconv.Atoi(AcceessTokenClaims.Issuer)

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

	if err := models.CreatePostComment(&comment); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)

}

func GetComments(w http.ResponseWriter, r *http.Request) {
	postIdParam := r.URL.Query().Get("postId")
	if postIdParam == "" {
		common.RespondError(w, http.StatusBadRequest, "Could not get comments")
		return
	}

	postId, postIdErr := strconv.Atoi(postIdParam)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get comments")
		return
	}

	comments, commentsErr := models.GetPostComments(uint(postId))
	if commentsErr != nil {
		common.RespondError(w, http.StatusBadRequest, commentsErr.Error())
		return
	}

	commentsResponse := CreateResponseComments(&comments)
	common.RespondJSON(w, http.StatusOK, commentsResponse)
}

func CreateResponseComments(postComments *[]models.PostComment) []models.PostCommentSerializer {
	postCommentsResponse := []models.PostCommentSerializer{}
	for _, postComment := range *postComments {
		userSerialized := CreateResponseUser(&postComment.User)
		postCommentSerialized := models.PostCommentSerializer{
			ID:             postComment.ID,
			TotalVoteValue: postComment.TotalVoteValue,
			Text:           postComment.Text,
			CreatedAt:      postComment.CreatedAt,
			User:           userSerialized,
		}
		postCommentsResponse = append(postCommentsResponse, postCommentSerialized)
	}
	return postCommentsResponse
}
