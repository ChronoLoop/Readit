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

func CreateResponsePosts(posts *[]models.Post) []models.PostSerializer {
	postsResponse := []models.PostSerializer{}

	for _, post := range *posts {
		userSerialized := CreateResponseUser(&post.User)
		subredditSerialized := CreateResponseSubreddit(&post.Subreddit)
		postSerialized := models.PostSerializer{
			ID:             post.ID,
			Title:          post.Title,
			TotalVoteValue: post.TotalVoteValue,
			Text:           post.Text,
			CreatedAt:      post.CreatedAt,
			User:           userSerialized,
			Subreddit:      subredditSerialized,
		}
		postsResponse = append(postsResponse, postSerialized)
	}
	return postsResponse
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	AcceessTokenClaims := middleware.GetRequestAccessTokenClaims(r)
	issuer, err := strconv.Atoi(AcceessTokenClaims.Issuer)

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
	subredditIdParam := r.URL.Query().Get("subredditId")
	if subredditIdParam == "" {
		common.RespondError(w, http.StatusBadRequest, "Could not get posts")
		return
	}

	subredditId, subredditIdErr := strconv.Atoi(subredditIdParam)
	if subredditIdErr != nil {
		common.RespondError(w, http.StatusBadRequest, "Could not get posts")
		return
	}

	subreddit := models.Subreddit{}
	if _, err := models.FindSubredditById(uint(subredditId)); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	posts, err := models.GetPostsBySubredditId(subreddit.ID)
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	postsResponse := CreateResponsePosts(&posts)
	common.RespondJSON(w, http.StatusOK, postsResponse)
}
