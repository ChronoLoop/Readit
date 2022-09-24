package models

import (
	"errors"

	"github.com/ikevinws/readit/db"
	"gorm.io/gorm"
)

type Subreadit struct {
	gorm.Model
	Name string `json:"name" gorm:"unique;not null" validate:"required,min=3,max=20,alphanum"`
}

type SubreaditSerializer struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func FindSubreaditByName(name string) (Subreadit, error) {
	subreadit := Subreadit{}
	if err := db.Connection.Where("name = ?", name).First(&subreadit).Error; err != nil {
		return subreadit, errors.New("subreadit does not exist")
	}
	return subreadit, nil
}

func FindSubreaditById(id uint) (Subreadit, error) {
	subreadit := Subreadit{}
	if err := db.Connection.Where("id = ?", id).First(&subreadit).Error; err != nil {
		return subreadit, errors.New("subreadit does not exist")
	}
	return subreadit, nil
}

func CreateSubreadit(subreadit *Subreadit) error {
	if err := db.Connection.Create(&subreadit).Error; err != nil {
		return errors.New("subreadit could not be created")
	}
	return nil
}

func GetSubreadits() ([]Subreadit, error) {
	subreadits := []Subreadit{}
	if err := db.Connection.Find(&subreadits).Error; err != nil {
		return subreadits, errors.New("subreadit could not be obtained")
	}
	return subreadits, nil
}
