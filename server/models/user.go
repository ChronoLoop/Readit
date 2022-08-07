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

type UserSerializer struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}

func FindUserByName(user *User, username string) bool {
	db.Connection.Where("username = ?", username).First(&user)
	return user.ID != 0
}

func FindUserById(user *User, id int) bool {
	db.Connection.Where("id = ?", id).First(&user)
	return user.ID != 0
}

func CreateUser(user *User) error {
	if err := db.Connection.Create(&user).Error; err != nil {
		return errors.New("user could not be created")
	}
	return nil
}
