package models

import (
	"errors"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type Subreddit struct {
	gorm.Model
	Name string `json:"name" gorm:"unique;not null" validate:"required,min=3,max=20,alphanum"`
}

func FindSubredditByName(name string) (Subreddit, bool) {
	subreddit := Subreddit{}
	db.Connection.Where("name = ?", name).First(&subreddit)
	if subreddit.ID == 0 {
		return subreddit, false
	}

	return subreddit, true
}

func FindSubredditById(id int) (Subreddit, bool) {
	subreddit := Subreddit{}
	db.Connection.Where("id = ?", id).First(&subreddit)
	if subreddit.ID == 0 {
		return subreddit, false
	}
	return subreddit, true
}

func CreateSubreddit(subreddit *Subreddit) error {
	if err := db.Connection.Create(&subreddit).Error; err != nil {
		return errors.New("subreddit could not be created")
	}
	return nil
}

func GetSubreddits() ([]Subreddit, error) {
	subreddits := []Subreddit{}
	if err := db.Connection.Find(&subreddits).Error; err != nil {
		return subreddits, errors.New("subreddit could not be obtained")
	}
	return subreddits, nil
}
