package models

import (
	"errors"
	"time"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title          string    `json:"title" validate:"required,min=1"`
	TotalVoteValue int       `json:"totalVoteValue"`
	User           User      `validate:"-"`
	UserID         int       `json:"userId" validate:"required"`
	Subreddit      Subreddit `validate:"-"`
	SubredditID    int       `json:"subredditId" validate:"required"`
	Text           string    `json:"text" validate:"required,min=1"`
}

type PostSerializer struct {
	ID             uint                `json:"id"`
	Title          string              `json:"title"`
	TotalVoteValue int                 `json:"totalVoteValue"`
	Text           string              `json:"text"`
	CreatedAt      time.Time           `json:"createAt"`
	User           UserSerializer      `json:"user"`
	Subreddit      SubRedditSerializer `json:"subreddit"`
}

func CreatePost(post *Post) error {
	if err := db.Connection.Create(&post).Error; err != nil {
		return errors.New("post could not be created")
	}
	return nil
}

func GetPostsBySubredditId(subredditId uint) ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Joins("Subreddit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

func UpdatePostTotalVoteValue(post *Post, val int) error {
	if err := db.Connection.Model(post).Update("total_vote_value", gorm.Expr("total_vote_value + ?", val)).Error; err != nil {
		return errors.New("post vote count could not be updated")
	}
	return nil
}

func FindPostById(id uint) (Post, bool) {
	post := Post{}
	db.Connection.Where("id = ?", id).First(&post)
	return post, postExists(&post)
}

func postExists(post *Post) bool {
	return post.ID != 0
}
