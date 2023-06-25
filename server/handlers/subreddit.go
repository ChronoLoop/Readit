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
	var subreadit models.Subreadit
	if err := json.NewDecoder(r.Body).Decode(&subreadit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, err := models.FindSubreaditByName(subreadit.Name); err == nil {
		common.RespondError(w, http.StatusBadRequest, "Subreadit already exists")
		return
	}

	validate := validator.New()
	if err := validate.Struct(&subreadit); err != nil {
		common.RespondError(w, http.StatusBadRequest, "Invalid fields")
		return
	}

	issuer, issuerErr := middleware.GetJwtClaimsIssuer(r)
	if issuerErr != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := models.CreateSubreadit(&subreadit); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditUser := models.SubreaditUser{
		UserID:      uint(issuer),
		SubreaditID: subreadit.ID,
		Role:        models.ModeratorRole.String(),
	}

	if err := models.JoinSubreadit(&subreaditUser); err != nil {
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
		ID:   subreadit.ID,
		Name: subreadit.Name,
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

	subreaditUser := models.SubreaditUser{
		UserID:      uint(issuer),
		SubreaditID: subreadit.ID,
		Role:        models.UserRole.String(),
	}

	if err := models.JoinSubreadit(&subreaditUser); err != nil {
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

	if _, err := models.FindSubreaditUser(subreadit.ID, uint(issuer)); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.LeaveSubreadit(subreadit.ID, uint(issuer)); err != nil {
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

	userSubreadits, err := models.GetUserSubreadits(uint(issuer))
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

	subreaditUser, err := models.FindSubreaditUser(subreadit.ID, uint(issuer))
	if err != nil {
		common.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	userSubreaditResponse := createResponseSubreaditUser(&subreaditUser)
	common.RespondJSON(w, http.StatusOK, userSubreaditResponse)
}
