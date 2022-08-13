package models

import (
	"errors"
	"time"

	"github.com/ikevinws/reddit-clone/db"
)

type PostVote struct {
	Post      Post `validate:"-"`
	PostID    uint `json:"postId" gorm:"primaryKey;autoIncrement:false"`
	User      User `validate:"-"`
	UserID    uint `json:"userId" gorm:"primaryKey;autoIncrement:false"`
	CreatedAt time.Time
	UpdatedAt time.Time
	Value     int `json:"value"`
}

func CreatePostVote(postVote *PostVote) error {
	if err := db.Connection.Create(&postVote).Error; err != nil {
		return errors.New("post could not be created")
	}
	return nil
}

func FindPostVoteById(postId uint, userId uint) (PostVote, bool) {
	postVote := PostVote{}
	db.Connection.Where("post_id = ? AND user_id = ?", postId, userId).First(&postVote)
	return postVote, postVoteExists(&postVote)
}

func UpdatePostVoteValue(postVote *PostVote, val int) error {
	if err := db.Connection.Model(postVote).Update("value", val).Error; err != nil {
		return errors.New("post vote could not be updated")
	}
	return nil
}

func postVoteExists(p *PostVote) bool {
	return p.UserID != 0 && p.PostID != 0
}

// func (p *PostVote) AfterCreate(tx *gorm.DB) (err error){

// }
