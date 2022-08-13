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

func FindSubredditByName(name string) (Subreddit, error) {
	subreddit := Subreddit{}
	if err := db.Connection.Where("name = ?", name).First(&subreddit).Error; err != nil {
		return subreddit, errors.New("subreddit does not exist")
	}
	return subreddit, nil
}

func FindSubredditById(id uint) (Subreddit, error) {
	subreddit := Subreddit{}
	if err := db.Connection.Where("id = ?", id).First(&subreddit).Error; err != nil {
		return subreddit, errors.New("subreddit does not exist")
	}
	return subreddit, nil
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
