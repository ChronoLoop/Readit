package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
	dbconnection "github.com/ikevinws/readit/db/sqlc"
	"github.com/ikevinws/readit/middleware"
	"github.com/ikevinws/readit/models"
)

type SubreaditUserRequestBody struct {
	SubreaditName string `json:"subreaditName" validate:"required,min=1"`
}

func createResponseSubreaditUser(subreaditUser *dbconnection.UserSubreaditsRow) models.SubreaditUserSerializer {
	subreaditUserResponse := models.SubreaditUserSerializer{
		ID:            subreaditUser.SubreaditID,
		Role:          subreaditUser.Role,
		Username:      subreaditUser.User.Username,
		SubreaditName: subreaditUser.Subreadit.Name,
	}

	return subreaditUserResponse

}

func createResponseSubreaditUsers(subreaditUsers *[]dbconnection.UserSubreaditsRow) []models.SubreaditUserSerializer {
	subreaditUsersResponse := []models.SubreaditUserSerializer{}

	for _, subreaditUser := range *subreaditUsers {
		subreaditUserSerialized := createResponseSubreaditUser(&subreaditUser)
		subreaditUsersResponse = append(subreaditUsersResponse, subreaditUserSerialized)
	}

	return subreaditUsersResponse
}

func CreateSubreadit(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Name string `json:"name" validate:"required,min=3,max=20,alphanum"`
	}
	var body request
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	ctx := context.Background()
	if _, err := db.Connection.FindSubreaditByName(ctx, body.Name); err == nil {
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
	subreadit, err := db.Connection.CreateSubreadit(ctx, body.Name)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := db.Connection.JoinSubreadit(ctx, dbconnection.JoinSubreaditParams{
		UserID:      issuer,
		SubreaditID: subreadit.ID,
		Role:        models.ModeratorRole.String(),
	}); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func GetSubreadits(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	subreadits, err := db.Connection.GetSubreadits(ctx)
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

func CreateResponseSubreadit(subreadit *dbconnection.Subreadit) models.SubreaditSerializer {
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

	ctx := context.Background()
	subreadit, err := db.Connection.FindSubreaditByName(ctx, requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := db.Connection.JoinSubreadit(ctx, dbconnection.JoinSubreaditParams{
		UserID:      issuer,
		SubreaditID: subreadit.ID,
		Role:        models.UserRole.String(),
	}); err != nil {
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

	ctx := context.Background()
	subreadit, err := db.Connection.FindSubreaditByName(ctx, requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, err := db.Connection.FindSubreaditUser(ctx, dbconnection.FindSubreaditUserParams{UserID: issuer, SubreaditID: subreadit.ID}); err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := db.Connection.LeaveSubreadit(ctx, dbconnection.LeaveSubreaditParams{SubreaditID: subreadit.ID, UserID: issuer}); err != nil {
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

	ctx := context.Background()
	subreadit, err := db.Connection.FindSubreaditByName(ctx, requestBody.SubreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditAdmins, err := db.Connection.GetSubreaditUsersByRole(ctx, dbconnection.GetSubreaditUsersByRoleParams{SubreaditID: subreadit.ID, Role: models.ModeratorRole.String()})
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

	ctx := context.Background()
	userSubreadits, err := db.Connection.GetUserSubreadits(ctx, issuer)
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

	ctx := context.Background()
	subreadit, err := db.Connection.FindSubreaditByName(ctx, subreaditName)
	if err != nil {
		common.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	subreaditUser, err := db.Connection.FindSubreaditUser(ctx, dbconnection.FindSubreaditUserParams{SubreaditID: subreadit.ID, UserID: issuer})
	if err != nil {
		common.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	userSubreaditResponse := createResponseSubreaditUser(&subreaditUser)
	common.RespondJSON(w, http.StatusOK, userSubreaditResponse)
}
