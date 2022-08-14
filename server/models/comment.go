package models

import (
	"errors"
	"time"

	"github.com/ikevinws/reddit-clone/db"
	"gorm.io/gorm"
)

type PostComment struct {
	gorm.Model
	TotalVoteValue int    `json:"-"`
	Post           Post   `validate:"-"`
	PostID         int    `json:"postId" validate:"required"`
	User           User   `validate:"-"`
	UserID         int    `json:"userId" validate:"required"`
	Text           string `json:"text" validate:"required,min=1"`
}

type PostCommentSerializer struct {
	ID             uint           `json:"id"`
	TotalVoteValue int            `json:"totalVoteValue"`
	Text           string         `json:"text"`
	CreatedAt      time.Time      `json:"createAt"`
	User           UserSerializer `json:"user"`
}

func CreatePostComment(comment *PostComment) error {
	if err := db.Connection.Create(&comment).Error; err != nil {
		return errors.New("comment could not be created")
	}
	return nil
}

func GetPostComments(postId uint) ([]PostComment, error) {
	postComments := []PostComment{}
	if err := db.Connection.Where("post_id = ?", postId).Joins("User").Find(&postComments).Error; err != nil {
		return postComments, errors.New("could not get comments")
	}
	return postComments, nil
}

func FindPostCommentById(id uint) (PostComment, error) {
	postComment := PostComment{}
	if err := db.Connection.Where("id = ?", id).First(&postComment).Error; err != nil {
		return postComment, errors.New("could not find comment")
	}
	return postComment, nil
}

func UpdatePostCommentText(postComment *PostComment, text string) error {
	if err := db.Connection.Model(postComment).Update("text", text); err != nil {
		return errors.New("an error occured while updating comment")
	}
	return nil
}

func UpdatePostCommentTotalVoteValue(postComment *PostComment, val int) error {
	if err := db.Connection.Model(postComment).Update("total_vote_value", gorm.Expr("total_vote_value + ?", val)).Error; err != nil {
		return errors.New("comment vote total value could not be updated")
	}
	return nil
}
