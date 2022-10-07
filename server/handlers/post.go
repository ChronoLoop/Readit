package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/go-playground/validator"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

func createResponsePost(post *models.Post) models.PostSerializer {
	userSerialized := CreateResponseUser(&post.User)
	subreaditSerialized := CreateResponseSubreadit(&post.Subreadit)
	postSerialized := models.PostSerializer{
		ID:        post.ID,
		Title:     post.Title,
		Text:      post.Text,
		CreatedAt: post.CreatedAt,
		User:      userSerialized,
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
	return postSerialized
}

func createResponsePostWithUser(post *models.Post, userId int) models.PostSerializer {
	postResponse := createResponsePost(post)
	postVote, err := models.FindPostVoteById(postResponse.ID, uint(userId))
	if err == nil {
		postResponse.UserVote = &models.PostVoteSerializer{
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

func createResponsePostsWithUser(posts *[]models.Post, userId int) []models.PostSerializer {
	postsResponse := createResponsePosts(posts)
	for i, postResponse := range postsResponse {
		postVote, err := models.FindPostVoteById(postResponse.ID, uint(userId))
		if err == nil {
			postsResponse[i].UserVote = &models.PostVoteSerializer{
				UserID: postVote.UserID,
				Value:  postVote.Value,
			}
		}
	}
	return postsResponse
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, err := middleware.GetJwtClaimsIssuer(r)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	post.UserID = issuer

	validate := validator.New()
	if err := validate.Struct(&post); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if err := models.CreatePost(&post); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
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
	}

	postId, postIdErr := strconv.Atoi(postIdParam)
	if postIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get post")
		return
	}

	post, err := models.FindPostById(uint(postId))
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	issuer, issuerErr := GetAccessTokenIssuer(r)
	if issuerErr == nil {
		postResponse := createResponsePostWithUser(&post, issuer)
		fmt.Printf("\nissuerErr == nil: %+v\n", postResponse)
		common.RespondJSON(w, http.StatusOK, postResponse)
		return
	}

	postResponse := createResponsePost(&post)
	fmt.Printf("\n%+v\n", postResponse)
	common.RespondJSON(w, http.StatusOK, postResponse)
}
