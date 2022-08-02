package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"github.com/ikevinws/reddit-clone/common"
	"github.com/ikevinws/reddit-clone/db"
	"github.com/ikevinws/reddit-clone/models"
)

func CreateSubreddit(w http.ResponseWriter, r *http.Request) {
	var subreddit models.Subreddit
	if err := json.NewDecoder(r.Body).Decode(&subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, exists := models.FindSubredditByName(db.Connection, subreddit.Name); exists {
		common.RespondError(w, http.StatusBadRequest, "Subreddit already exists")
	}

	validate := validator.New()
	if err := validate.Struct(&subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	if err := models.CreateSubreddit(db.Connection, &subreddit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetSubreddits(w http.ResponseWriter, r *http.Request) {
	subreddits, err := models.GetSubreddits(db.Connection)
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, err.Error())
	}
	common.RespondJSON(w, http.StatusOK, subreddits)
}
