package models

import (
	"database/sql"
	"time"

	"gorm.io/gorm"
)

type PostComment struct {
	gorm.Model
	Post     Post   `validate:"-"`
	PostID   int    `json:"postId" validate:"required"`
	User     User   `validate:"-"`
	UserID   int    `json:"userId" validate:"required"`
	Text     string `json:"text" validate:"required,min=1"`
	ParentID *int   `json:"parentId"`
}

type PostCommentSerializer struct {
	ID             int64               `json:"id"`
	TotalVoteValue int64               `json:"totalVoteValue"`
	Text           string              `json:"text"`
	CreatedAt      time.Time           `json:"createAt"`
	UpdatedAt      time.Time           `json:"updatedAt"`
	User           UserSerializer      `json:"user"`
	ParentID       sql.NullInt64       `json:"parentId"`
	UserVote       *UserVoteSerializer `json:"userVote,omitempty"`
	PostID         int64               `json:"postId"`
}

// func CreatePostComment(comment *PostComment) error {
// 	if err := db.Connection.Create(&comment).Error; err != nil {
// 		return errors.New("comment could not be created")
// 	}
// 	return nil
// }

// func GetPostComments(postId uint) ([]PostComment, error) {
// 	postComments := []PostComment{}
// 	if err := db.Connection.Where("post_id = ?", postId).Joins("User").Find(&postComments).Error; err != nil {
// 		return postComments, errors.New("could not get comments")
// 	}
// 	return postComments, nil
// }

// func FindPostCommentById(id uint) (PostComment, error) {
// 	postComment := PostComment{}
// 	if err := db.Connection.Where("id = ?", id).First(&postComment).Error; err != nil {
// 		return postComment, errors.New("could not find comment")
// 	}
// 	return postComment, nil
// }

// func UpdatePostCommentText(postComment *PostComment, text string) error {
// 	if err := db.Connection.Model(postComment).Update("text", text); err != nil {
// 		return errors.New("an error occured while updating comment")
// 	}
// 	return nil
// }

// func GetPostCommentCount(postId uint) (int64, error) {
// 	var count int64
// 	db.Connection.Model(&PostComment{}).Where("post_id = ?", postId).Count(&count)
// 	return count, nil
// }
