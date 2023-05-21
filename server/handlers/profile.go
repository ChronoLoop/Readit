package handlers

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/models"
)

func GetUserOverview(w http.ResponseWriter, r *http.Request) {
	userName := chi.URLParam(r, "userName")

	user, err := models.FindUserByName(userName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	userPostsWithComments, err := models.GetUserOverviewPostsAndComments(user.ID)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	common.RespondJSON(w, http.StatusOK, userPostsWithComments)
}
