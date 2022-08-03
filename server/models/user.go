package models

import (
	"errors"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null" validate:"required,min=4,max=20,alphanum"`
	Password string `json:"password" validate:"required,min=4,max=20"`
}

func FindUserByName(username string) (User, bool) {
	user := User{}
	db.Connection.Where("username = ?", username).First(&user)
	if user.ID == 0 {
		return user, false
	}

	return user, true
}

func FindUserById(id int) (User, bool) {
	user := User{}
	db.Connection.Where("id = ?", id).First(&user)
	if user.ID == 0 {
		return user, false
	}
	return user, true
}

func CreateUser(user *User) error {
	if err := db.Connection.Create(&user).Error; err != nil {
		return errors.New("user could not be created")
	}
	return nil
}
