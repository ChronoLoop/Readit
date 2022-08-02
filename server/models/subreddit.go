package models

import (
	"errors"

	"gorm.io/gorm"
)

type Subreddit struct {
	gorm.Model
	Name string `json:"name" gorm:"unique;not null" validate:"required,min=3,max=20,alphanum"`
}

func FindSubredditByName(db *gorm.DB, name string) (*Subreddit, bool) {
	subreddit := Subreddit{}
	db.Where("name = ?", name).First(&subreddit)
	if subreddit.ID == 0 {
		return &subreddit, false
	}

	return &subreddit, true
}

func FindSubredditById(db *gorm.DB, id int) (*Subreddit, bool) {
	subreddit := Subreddit{}
	db.Where("id = ?", id).First(&subreddit)
	if subreddit.ID == 0 {
		return &subreddit, false
	}
	return &subreddit, true
}

func CreateSubreddit(db *gorm.DB, subreddit *Subreddit) error {
	if err := db.Create(&subreddit).Error; err != nil {
		return errors.New("subreddit could not be created")
	}
	return nil
}

func GetSubreddits(db *gorm.DB) ([]Subreddit, error) {
	subreddits := []Subreddit{}
	if err := db.Find(&subreddits).Error; err != nil {
		return subreddits, errors.New("subreddit could not be obtained")
	}
	return subreddits, nil
}
