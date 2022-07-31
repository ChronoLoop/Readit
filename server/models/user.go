package models

import (
	"errors"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null" validate:"required,min=4,max=20"`
	Password string `json:"password,-" validate:"required,min=4,max=20"`
}

func FindUser(db *gorm.DB, username string) (User, bool) {
	user := User{}
	db.Where("username = ?", username).First(&user)
	if user.ID == 0 {
		return user, false
	}

	return user, true
}

func CreateUser(db *gorm.DB, user *User) error {
	if err := db.Create(&user).Error; err != nil {
		return errors.New("user could not be created")
	}
	return nil
}