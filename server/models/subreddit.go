package models

import (
	"errors"

	"github.com/ikevinws/readit/db"
	"gorm.io/gorm"
)

type SubreaditUserRole int64

const (
	UserRole SubreaditUserRole = iota
	ModeratorRole
)

func (u SubreaditUserRole) String() string {
	switch u {
	case UserRole:
		return "user"
	case ModeratorRole:
		return "moderator"
	}
	return "user"
}

type Subreadit struct {
	gorm.Model
	Name string `json:"name" gorm:"unique;not null" validate:"required,min=3,max=20,alphanum"`
}

type SubreaditSerializer struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type SubreaditUser struct {
	Subreadit   Subreadit `validate:"-"`
	SubreaditID uint      `json:"subreaditId" validate:"required" gorm:"primaryKey"`
	User        User      `validate:"-"`
	UserID      uint      `json:"userId" validate:"required" gorm:"primaryKey"`
	Role        string    `json:"role"`
}

type SubreaditUserSerializer struct {
	ID            uint   `json:"id"`
	Username      string `json:"username"`
	Role          string `json:"role"`
	SubreaditName string `json:"subreaditName"`
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

func GetUserSubreadits(user_id uint) ([]SubreaditUser, error) {
	subreaditUsers := []SubreaditUser{}

	if err := db.Connection.Where("user_id = ?", user_id).Joins("User").Joins("Subreadit").Find(&subreaditUsers).Error; err != nil {
		return subreaditUsers, errors.New("user subreadits could not be obtained")
	}
	return subreaditUsers, nil
}

func JoinSubreadit(subreaditUser *SubreaditUser) error {
	if err := db.Connection.Create(&subreaditUser).Error; err != nil {
		return errors.New("user could not join subreadit")
	}
	return nil
}

func LeaveSubreadit(subreaditId uint, user_id uint) error {
	subreaditUser := SubreaditUser{}
	if err := db.Connection.Where("subreadit_id = ? AND user_id = ?", subreaditId, user_id).Delete(&subreaditUser).Error; err != nil {
		return errors.New("user could not leave subreadit")
	}
	return nil
}

func FindSubreaditUser(subreaditId uint, user_id uint) (SubreaditUser, error) {
	subreaditUser := SubreaditUser{}
	if err := db.Connection.Where("subreadit_id = ? AND user_id = ?", subreaditId, user_id).Joins("User").Joins("Subreadit").First(&subreaditUser).Error; err != nil {
		return subreaditUser, errors.New("user does not exist on subreadit")
	}
	return subreaditUser, nil
}

func GetSubreaditModerators(subreaditId uint) ([]SubreaditUser, error) {
	subreaditUsers := []SubreaditUser{}
	if err := db.Connection.Where("subreadit_id = ? AND role = ?", subreaditId, ModeratorRole.String()).Joins("User").Joins("Subreadit").Find(&subreaditUsers).Error; err != nil {
		return subreaditUsers, errors.New("subreadit admins could not be obtained")
	}
	return subreaditUsers, nil
}
