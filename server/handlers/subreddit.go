package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

type SubreaditUserRequestBody struct {
	SubreaditName string `json:"subreaditName" validate:"required,min=1"`
}

func createResponseSubreaditUser(subreaditUser *models.SubreaditUser) models.SubreaditUserSerializer {
	subreaditUserResponse := models.SubreaditUserSerializer{
		ID:            subreaditUser.SubreaditID,
		Role:          subreaditUser.Role,
		Username:      subreaditUser.User.Username,
		SubreaditName: subreaditUser.Subreadit.Name,
	}

	return subreaditUserResponse

}

func createResponseSubreaditUsers(subreaditUsers *[]models.SubreaditUser) []models.SubreaditUserSerializer {
	subreaditUsersResponse := []models.SubreaditUserSerializer{}

	for _, subreaditUser := range *subreaditUsers {
		subreaditUserSerialized := createResponseSubreaditUser(&subreaditUser)
		subreaditUsersResponse = append(subreaditUsersResponse, subreaditUserSerialized)
	}

	return subreaditUsersResponse
}

func CreateSubreadit(w http.ResponseWriter, r *http.Request) {
	var body models.Subreadit
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, err := models.FindSubreaditByName(body.Name); err == nil {
		common.RespondError(w, http.StatusBadRequest, "Subreadit already exists")
		return
	}

	validate := validator.New()
	if err := validate.Struct(&body); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	newSubreadit, err := models.CreateSubreadit(body.Name)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.JoinSubreadit(newSubreadit.ID, issuer, models.ModeratorRole.String()); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetSubreadits(w http.ResponseWriter, r *http.Request) {
	subreadits, err := models.GetSubreadits()
	if err != nil {
		common.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	subreaditsResponse := []models.SubreaditSerializer{}
	for _, subreadit := range subreadits {
		subreaditResponse := CreateResponseSubreadit(&subreadit)
		subreaditsResponse = append(subreaditsResponse, subreaditResponse)
	}

	common.RespondJSON(w, http.StatusOK, subreaditsResponse)
}

func CreateResponseSubreadit(subreadit *models.Subreadit) models.SubreaditSerializer {
	return models.SubreaditSerializer{
		ID:        subreadit.ID,
		Name:      subreadit.Name,
		CreatedAt: subreadit.CreatedAt,
	}
}

func JoinSubreadit(w http.ResponseWriter, r *http.Request) {
	var requestBody SubreaditUserRequestBody
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	validate := validator.New()
	if err := validate.Struct(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	subreadit, err := models.FindSubreaditByName(requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.JoinSubreadit(subreadit.ID, issuer, models.UserRole.String()); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func LeaveSubreadit(w http.ResponseWriter, r *http.Request) {
	var requestBody SubreaditUserRequestBody
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	validate := validator.New()
	if err := validate.Struct(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	subreadit, err := models.FindSubreaditByName(requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, err := models.FindSubreaditUser(subreadit.ID, issuer); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.LeaveSubreadit(subreadit.ID, issuer); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetSubreaditModerators(w http.ResponseWriter, r *http.Request) {
	var requestBody SubreaditUserRequestBody
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	validate := validator.New()
	if err := validate.Struct(&requestBody); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	subreadit, err := models.FindSubreaditByName(requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditAdmins, err := models.GetSubreaditModerators(subreadit.ID)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditAdminsResponse := createResponseSubreaditUsers(&subreaditAdmins)
	common.RespondJSON(w, http.StatusOK, subreaditAdminsResponse)
}

func GetUserSubreadits(w http.ResponseWriter, r *http.Request) {
	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	userSubreadits, err := models.GetUserSubreadits(issuer)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	userSubreaditsResponse := createResponseSubreaditUsers(&userSubreadits)
	common.RespondJSON(w, http.StatusOK, userSubreaditsResponse)
}

func GetSubreaditMe(w http.ResponseWriter, r *http.Request) {
	subreaditName := r.URL.Query().Get("subreaditName")
	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	subreadit, err := models.FindSubreaditByName(subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditUser, err := models.FindSubreaditUser(subreadit.ID, issuer)
	if err != nil {
		common.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	userSubreaditResponse := createResponseSubreaditUser(&subreaditUser)
	common.RespondJSON(w, http.StatusOK, userSubreaditResponse)
}

func GetSubreaditAbout(w http.ResponseWriter, r *http.Request) {
	subreaditName := r.URL.Query().Get("subreaditName")
	subreadit, err := models.FindSubreaditByName(subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}
	count, err := models.GetNumberOfUsersInSubreadit(subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusNotFound, err.Error())
		return
	}
	type GetSubreaditAboutResponse struct {
		TotalMembers int64 `json:"totalMembers"`
		models.SubreaditSerializer
	}
	subreaditResponse := CreateResponseSubreadit(&subreadit)

	common.RespondJSON(w, http.StatusOK, GetSubreaditAboutResponse{
		TotalMembers:        count,
		SubreaditSerializer: subreaditResponse,
	})
}
