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
	User        User      `validate:"-"`
	UserID      int       `json:"userId" validate:"required"`
	Subreddit   Subreddit `validate:"-"`
	SubredditID int       `json:"subredditId" validate:"required"`
	Text        string    `json:"text" validate:"required,min=1"`
}

type PostSerializer struct {
	ID               uint                `json:"id"`
	Title            string              `json:"title"`
	TotalVoteValue   int64               `json:"totalVoteValue"`
	Text             string              `json:"text"`
	CreatedAt        time.Time           `json:"createAt"`
	User             UserSerializer      `json:"user"`
	Subreddit        SubRedditSerializer `json:"subreddit"`
	NumberOfComments int64               `json:"numberOfComments"`
	UserVote         *PostVoteSerializer `json:"userVote,omitempty"`
}

func CreatePost(post *Post) error {
	if err := db.Connection.Create(&post).Error; err != nil {
		return errors.New("post could not be created")
	}
	return nil
}

func GetPosts() ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Joins("Subreddit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("posts could not be obtained")
	}
	return posts, nil
}

func GetPostsBySubredditId(subredditId uint) ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Where("subreddit_id = ?", subredditId).Joins("Subreddit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

func GetPostsBySubredditName(subredditName string) ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Where("name = ?", subredditName).Joins("Subreddit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

func FindPostById(id uint) (Post, error) {
	post := Post{}
	if err := db.Connection.Where("id = ?", id).First(&post).Error; err != nil {
		return post, errors.New("post does not exist")
	}
	return post, nil
}
