package models

import (
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
)

type Vote struct {
	User      User `validate:"-"`
	UserID    uint `json:"userId" gorm:"primaryKey;autoIncrement:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Value     int `json:"value"`
}

type PostVote struct {
	Vote
	Post   Post `validate:"-"`
	PostID uint `json:"postId" gorm:"primaryKey;autoIncrement:false"`
}

type UserVoteSerializer struct {
	Value  int  `json:"value"`
	UserID uint `json:"userId"`
}

type PostCommentVote struct {
	Vote
	PostComment   PostComment `validate:"-"`
	PostCommentID uint        `json:"postCommentId" gorm:"primaryKey;autoIncrement:false"`
}

func CreatePostVote(postVote *PostVote) error {
	if err := db.Connection.Create(&postVote).Error; err != nil {
		return errors.New("post vote could not be created")
	}
	return nil
}

func FindPostVoteById(postId uint, userId uint) (PostVote, error) {
	postVote := PostVote{}
	if err := db.Connection.Where("post_id = ? AND user_id = ?", postId, userId).First(&postVote).Error; err != nil {
		return postVote, errors.New("post vote could not be found")
	}
	return postVote, nil
}

func UpdatePostVoteValue(postVote *PostVote, val int) error {
	if err := db.Connection.Model(postVote).Update("value", val).Error; err != nil {
		return errors.New("post vote could not be updated")
	}
	return nil
}

func CreatePostCommentVote(postCommentVote *PostCommentVote) error {
	if err := db.Connection.Create(&postCommentVote).Error; err != nil {
		return errors.New("comment vote could not be created")
	}
	return nil
}

func FindPostCommentVoteById(postCommentId uint, userId uint) (PostCommentVote, error) {
	postCommentVote := PostCommentVote{}
	if err := db.Connection.Where("post_comment_id = ? AND user_id = ?", postCommentId, userId).First(&postCommentVote).Error; err != nil {
		return postCommentVote, errors.New("post comment vote could not be found")
	}
	return postCommentVote, nil
}

func UpdatePostCommentVoteValue(postCommentVote *PostCommentVote, val int) error {
	if err := db.Connection.Model(postCommentVote).Update("value", val).Error; err != nil {
		return errors.New("post comment vote could not be updated")
	}
	return nil
}

func GetPostTotalVoteValue(postId uint) (int64, error) {
	var total int64
	if err := db.Connection.Model(&PostVote{}).Where("post_id = ?", postId).Select("sum(value)").Row().Scan(&total); err != nil {
		return total, errors.New("post total vote value could not be obtained")
	}
	return total, nil
}

func GetPostCommentTotalVoteValue(postCommentId uint) (int64, error) {
	var total int64
	if err := db.Connection.Model(&PostCommentVote{}).Where("post_comment_id = ?", postCommentId).Select("sum(value)").Row().Scan(&total); err != nil {
		return total, errors.New("post total vote value could not be obtained")
	}
	return total, nil
}
