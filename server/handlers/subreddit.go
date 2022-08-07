package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"github.com/ikevinws/reddit-clone/common"
	"github.com/ikevinws/reddit-clone/models"
)

func CreateSubreddit(w http.ResponseWriter, r *http.Request) {
	var subreddit models.Subreddit
	if err := json.NewDecoder(r.Body).Decode(&subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if exists := models.FindSubredditByName(&models.Subreddit{}, subreddit.Name); exists {
		common.RespondError(w, http.StatusBadRequest, "Subreddit already exists")
		return
	}

	validate := validator.New()
	if err := validate.Struct(&subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if err := models.CreateSubreddit(&subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetSubreddits(w http.ResponseWriter, r *http.Request) {
	subreddits := []models.Subreddit{}
	err := models.GetSubreddits(&subreddits)
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, err.Error())
	}

	subredditsResponse := []models.SubRedditSerializer{}
	for _, subreddit := range subreddits {
		subredditResponse := CreateResponseSubreddit(&subreddit)
		subredditsResponse = append(subredditsResponse, subredditResponse)
	}

	common.RespondJSON(w, http.StatusOK, subredditsResponse)
}

func CreateResponseSubreddit(subreddit *models.Subreddit) models.SubRedditSerializer {
	return models.SubRedditSerializer{
		ID:   subreddit.ID,
		Name: subreddit.Name,
	}
}
