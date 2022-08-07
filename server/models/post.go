package models

import (
	"errors"
	"time"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title       string    `json:"title" validate:"required,min=1"`
	VoteCount   int       `json:"voteCount"`
	User        User      `validate:"-"`
	UserID      int       `json:"userId" validate:"required"`
	Subreddit   Subreddit `validate:"-"`
	SubredditID int       `json:"subredditId" validate:"required"`
	Text        string    `json:"text" validate:"required,min=1"`
}

type PostVotes struct {
	Post      Post `validate:"-"`
	PostID    int  `json:"postId" gorm:"primaryKey;autoIncrement:false"`
	User      User `validate:"-"`
	UserID    int  `json:"userId" gorm:"primaryKey;autoIncrement:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type PostSerializer struct {
	ID        uint                `json:"id"`
	Title     string              `json:"title"`
	VoteCount int                 `json:"voteCount"`
	Text      string              `json:"text"`
	CreatedAt time.Time           `json:"createAt"`
	User      UserSerializer      `json:"user"`
	Subreddit SubRedditSerializer `json:"subreddit"`
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
