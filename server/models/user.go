package models

import (
	"errors"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"unique;not null" validate:"required,min=4,max=20,alphanum"`
	Password string `json:"password" validate:"required,min=8,max=20"`
}

type UserSerializer struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}

func FindUserByName(username string) (User, error) {
	user := User{}
	if err := db.Connection.Where("username = ?", username).First(&user).Error; err != nil {
		return user, errors.New("user does not exist")
	}
	return user, nil

}

func FindUserById(id int) (User, error) {
	user := User{}
	if err := db.Connection.Where("id = ?", id).First(&user).Error; err != nil {
		return user, errors.New("user does not exist")
	}
	return user, nil
}

func CreateUser(user *User) error {
	if err := db.Connection.Create(&user).Error; err != nil {
		return errors.New("user could not be created")
	}
	return nil
}
