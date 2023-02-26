package models

import (
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title       string    `json:"title" validate:"required,min=1"`
	User        User      `validate:"-"`
	UserID      int       `json:"userId" validate:"required"`
	Subreadit   Subreadit `validate:"-"`
	SubreaditID int       `json:"subreaditId" validate:"required"`
	Text        string    `json:"text"`
}

type PostSerializer struct {
	ID               uint                `json:"id"`
	Title            string              `json:"title"`
	TotalVoteValue   int64               `json:"totalVoteValue"`
	Text             string              `json:"text"`
	CreatedAt        time.Time           `json:"createAt"`
	User             UserSerializer      `json:"user"`
	Subreadit        SubreaditSerializer `json:"subreadit"`
	NumberOfComments int64               `json:"numberOfComments"`
	UserVote         *UserVoteSerializer `json:"userVote,omitempty"`
}

type UserReadPost struct {
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	User      User           `validate:"-"`
	UserID    int            `json:"userId" validate:"required" gorm:"primaryKey"`
	Post      Post           `validate:"-"`
	PostID    int            `json:"postId" validate:"required" gorm:"primaryKey"`
}

type UserReadPostSerializer struct {
	CreatedAt time.Time `json:"createAt"`
	UserID    int       `json:"userId"`
	PostID    int       `json:"postId"`
}

func CreatePost(post *Post) error {
	if err := db.Connection.Create(&post).Error; err != nil {
		return errors.New("post could not be created")
	}
	return nil
}

func GetPosts() ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Joins("Subreadit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("posts could not be obtained")
	}
	return posts, nil
}

func GetPostsBySubreaditId(subreaditId uint) ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Where("subreadit_id = ?", subreaditId).Joins("Subreadit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

func GetPostsBySubreaditName(subreaditName string) ([]Post, error) {
	posts := []Post{}
	if err := db.Connection.Where("name = ?", subreaditName).Joins("Subreadit").Joins("User").Find(&posts).Error; err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

func FindPostById(id uint) (Post, error) {
	post := Post{}
	if err := db.Connection.Joins("User").Joins("Subreadit").Where("posts.id = ?", id).First(&post).Error; err != nil {
		return post, errors.New("post does not exist")
	}
	return post, nil
}

func CreateUserReadPost(userReadPost *UserReadPost) error {
	if err := db.Connection.Where("post_id = ? AND user_id = ?", userReadPost.PostID, userReadPost.UserID).FirstOrCreate(&userReadPost).Error; err != nil {
		return errors.New("post read by user could not be created")
	}
	return nil
}

func GetUserReadPost(userId uint, postId uint) (UserReadPost, error) {
	userReadPost := UserReadPost{}
	if err := db.Connection.Where("post_id = ? AND user_id = ?", postId, userId).First(&userReadPost).Error; err != nil {
		return userReadPost, errors.New("post was not read by user")
	}
	return userReadPost, nil
}
