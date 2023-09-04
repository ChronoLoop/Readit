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

func createResponsePost(post *models.Post) models.PostSerializer {
	subreaditSerialized := CreateResponseSubreadit(&post.Subreadit)
	postSerialized := models.PostSerializer{
		ID:        post.ID,
		CreatedAt: post.CreatedAt,
		UpdatedAt: post.UpdatedAt,
		Subreadit: subreaditSerialized,
	}
	numberOfComments, err := models.GetPostCommentCount(post.ID)
	if err == nil {
		postSerialized.NumberOfComments = numberOfComments
	}
	totalVoteValue, err := models.GetPostTotalVoteValue(post.ID)
	if err == nil {
		postSerialized.TotalVoteValue = totalVoteValue
	}
	if !post.DeletedAt.Time.IsZero() {
		postSerialized.Title = "[deleted]"
		postSerialized.Text = []string{"[deleted]"}
		postSerialized.User = nil
	} else {
		userSerialized := CreateResponseUser(&post.User)
		postSerialized.User = &userSerialized
		postSerialized.Title = post.Title
		postSerialized.Text = common.SplitTextByNewLine(post.Text)
	}
	return postSerialized
}

func createResponsePostWithUser(post *models.Post, userId int64) models.PostSerializer {
	postResponse := createResponsePost(post)
	postVote, err := models.FindPostVoteById(postResponse.ID, userId)
	if err == nil {
		postResponse.UserVote = &models.UserVoteSerializer{
			UserID: postVote.UserID,
			Value:  postVote.Value,
		}
	}
	return postResponse
}

func createResponsePosts(posts *[]models.Post) []models.PostSerializer {
	postsResponse := []models.PostSerializer{}

	for _, post := range *posts {
		postSerialized := createResponsePost(&post)
		postsResponse = append(postsResponse, postSerialized)
	}
	return postsResponse
}

func createResponsePostsWithUser(posts *[]models.Post, userId int64) []models.PostSerializer {
	postsResponse := createResponsePosts(posts)
	for i, postResponse := range postsResponse {
		postVote, err := models.FindPostVoteById(postResponse.ID, userId)
		if err == nil {
			postsResponse[i].UserVote = &models.UserVoteSerializer{
				UserID: postVote.UserID,
				Value:  postVote.Value,
			}
		}
	}
	return postsResponse
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Title         string `json:"title"`
		Text          string `json:"text"`
		SubreaditName string `json:"subreaditName"`
	}
	var postRequestBody request
	if err := json.NewDecoder(r.Body).Decode(&postRequestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	subreadit, err := models.FindSubreaditByName(postRequestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, "Subreadit does not exist")
		return
	}

	post := models.Post{
		UserID:      issuer,
		Title:       postRequestBody.Title,
		SubreaditID: subreadit.ID,
		Text:        postRequestBody.Text,
	}

	validate := validator.New()
	if err := validate.Struct(&post); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}
	createdPostID, err := models.CreatePost(post.UserID, post.SubreaditID, post.Title, post.Text)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.RespondJSON(w, http.StatusOK, struct {
		ID int64 `json:"id"`
	}{ID: createdPostID})
}

func GetPosts(w http.ResponseWriter, r *http.Request) {
	subreaditName := r.URL.Query().Get("subreaditName")
	issuer, issuerErr := GetAccessTokenIssuer(r)

	if subreaditName == "" {
		posts, err := models.GetPosts()
		if err != nil {
			common.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if issuerErr == nil {
			postsResponse := createResponsePostsWithUser(&posts, issuer)
			common.RespondJSON(w, http.StatusOK, postsResponse)
			return
		}
		postsResponse := createResponsePosts(&posts)
		common.RespondJSON(w, http.StatusOK, postsResponse)
		return
	}

	if _, err := models.FindSubreaditByName(subreaditName); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	posts, err := models.GetPostsBySubreaditName(subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if issuerErr == nil {
		postsResponse := createResponsePostsWithUser(&posts, issuer)
		common.RespondJSON(w, http.StatusOK, postsResponse)
		return
	}

	postsResponse := createResponsePosts(&posts)
	common.RespondJSON(w, http.StatusOK, postsResponse)
}

func GetPost(w http.ResponseWriter, r *http.Request) {
	postIdParam := chi.URLParam(r, "id")

	if postIdParam == "" {
		common.RespondJSON(w, http.StatusBadRequest, "Could not get post")
		return
	}

	postId, postIdErr := strconv.ParseInt(postIdParam, 10, 64)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get post")
		return
	}

	post, err := models.FindPostById(postId)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, issuerErr := GetAccessTokenIssuer(r)
	if issuerErr == nil {
		postResponse := createResponsePostWithUser(&post, issuer)
		common.RespondJSON(w, http.StatusOK, postResponse)
		return
	}

	postResponse := createResponsePost(&post)
	common.RespondJSON(w, http.StatusOK, postResponse)
}

func CreateUserReadPost(w http.ResponseWriter, r *http.Request) {

	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	postIdParam := chi.URLParam(r, "id")

	if postIdParam == "" {
		common.RespondJSON(w, http.StatusBadRequest, "could not get post")
		return
	}

	postId, postIdErr := strconv.ParseInt(postIdParam, 10, 64)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "could not get post")
		return
	}

	post, err := models.FindPostById(postId)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := models.FindUserById(issuer)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, "could not find user")
		return
	}

	userReadPost := models.UserReadPost{
		UserID: user.ID,
		PostID: post.ID,
	}

	validate := validator.New()
	if err := validate.Struct(&userReadPost); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if err := models.CreateUserReadPost(userReadPost.UserID, userReadPost.PostID); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
}

func createUserReadPostResponse(userReadPost *models.UserReadPost) models.UserReadPostSerializer {
	return models.UserReadPostSerializer{
		CreatedAt: userReadPost.CreatedAt,
		PostID:    userReadPost.PostID,
		UserID:    userReadPost.UserID,
	}
}

func GetUserReadPost(w http.ResponseWriter, r *http.Request) {
	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	postIdParam := chi.URLParam(r, "id")

	if postIdParam == "" {
		common.RespondJSON(w, http.StatusBadRequest, "could not get post")
		return
	}
	postId, postIdErr := strconv.ParseInt(postIdParam, 10, 64)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "could not get post")
		return
	}

	userReadPost, err := models.GetUserReadPost(issuer, postId)

	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	userReadPostResponse := createUserReadPostResponse(&userReadPost)
	common.RespondJSON(w, http.StatusOK, userReadPostResponse)
}

func DeleteUserPost(w http.ResponseWriter, r *http.Request) {
	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	postIdParam := chi.URLParam(r, "id")
	if postIdParam == "" {
		common.RespondJSON(w, http.StatusBadRequest, "could not get post")
		return
	}
	postId, postIdErr := strconv.ParseInt(postIdParam, 10, 64)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "could not get post")
		return
	}

	post, err := models.FindPostById(postId)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	if post.UserID != issuer {
		common.RespondError(w, http.StatusBadRequest, "post belongs to another user")
		return
	}

	if err := models.DeletePost(postId, issuer); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetUserRecentReadPosts(w http.ResponseWriter, r *http.Request) {
	subreaditName := r.URL.Query().Get("subreaditName")
	issuer, err := middleware.GetJwtClaimsIssuer(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if subreaditName == "" {
		posts, err := models.GetUserRecentReadPosts(issuer)
		if err != nil {
			common.RespondError(w, http.StatusBadRequest, err.Error())
			return
		}
		postsResponse := createResponsePosts(&posts)
		common.RespondJSON(w, http.StatusOK, postsResponse)
		return
	}

	posts, err := models.GetUserRecentReadSubreaditPosts(issuer, subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	postsResponse := createResponsePosts(&posts)
	common.RespondJSON(w, http.StatusOK, postsResponse)
}
