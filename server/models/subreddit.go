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

type SubRedditSerializer struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func FindSubredditByName(subreddit *Subreddit, name string) bool {
	db.Connection.Where("name = ?", name).First(&subreddit)
	return subreddit.ID != 0
}

func FindSubredditById(subreddit *Subreddit, id uint) bool {
	db.Connection.Where("id = ?", id).First(&subreddit)
	return subreddit.ID != 0
}

func CreateSubreddit(subreddit *Subreddit) error {
	if err := db.Connection.Create(&subreddit).Error; err != nil {
		return errors.New("subreddit could not be created")
	}
	return nil
}

func GetSubreddits(subreddits *[]Subreddit) error {
	if err := db.Connection.Find(subreddits).Error; err != nil {
		return errors.New("subreddit could not be obtained")
	}
	return nil
}
