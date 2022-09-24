package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator"
	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/models"
)

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

	if err := models.CreateSubreadit(&subreadit); err != nil {
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
