package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
)

type PostComment struct {
	CreatedAt time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt time.Time    `json:"updated_at" db:"updated_at"`
	DeletedAt sql.NullTime `json:"deleted_at" db:"deleted_at"`
	ID        int64        `json:"id" db:"id"`
	PostID    int64        `json:"postId" validate:"required" db:"post_id"`
	User      User         `validate:"-" db:"users"`
	UserID    int64        `json:"userId" validate:"required" db:"user_id"`
	Text      string       `json:"text" validate:"required,min=1" db:"text"`
	ParentID  *int64       `json:"parentId" db:"parent_id"`
}

type PostCommentSerializer struct {
	ID             int64               `json:"id"`
	TotalVoteValue int64               `json:"totalVoteValue"`
	Text           string              `json:"text"`
	CreatedAt      time.Time           `json:"createAt"`
	UpdatedAt      time.Time           `json:"updatedAt"`
	User           UserSerializer      `json:"user"`
	ParentID       *int64              `json:"parentId"`
	UserVote       *UserVoteSerializer `json:"userVote,omitempty"`
	PostID         int64               `json:"postId"`
}

const createPostComment = `
INSERT INTO post_comments (
    user_id,
    post_id,
    text,
    parent_id
) VALUES (
    $1, $2, $3, $4
) RETURNING created_at, updated_at, deleted_at, id, post_id, user_id, text, parent_id
`

func CreatePostComment(user_id int64, post_id int64, text string, parent_id *int64) (PostComment, error) {
	postComment := PostComment{}
	if err := db.Connection.Get(&postComment, createPostComment, user_id, post_id, text, parent_id); err != nil {
		return postComment, errors.New("comment could not be created")
	}
	return postComment, nil
}

const getPostComments = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	post_comments.created_at, 
	post_comments.updated_at, 
	post_comments.deleted_at, 
	post_comments.id, 
	post_comments.post_id, 
	post_comments.user_id, 
	post_comments.text, 
	post_comments.parent_id
FROM post_comments
LEFT JOIN users ON post_comments.user_id = users.id
WHERE post_id = $1
`

func GetPostComments(postId int64) ([]PostComment, error) {
	postComments := []PostComment{}
	err := db.Connection.Select(&postComments, getPostComments, postId)
	if err != nil {
		return postComments, errors.New("could not get post comments")
	}

	return postComments, nil
}

const findPostCommentById = `
SELECT created_at, updated_at, deleted_at, id, post_id, user_id, text, parent_id
FROM post_comments
WHERE id = $1 LIMIT 1
`

func FindPostCommentById(id int64) (PostComment, error) {
	postComment := PostComment{}
	if err := db.Connection.Get(&postComment, findPostCommentById, id); err != nil {
		return postComment, errors.New("could not find comment")
	}
	return postComment, nil
}

const updatePostCommentText = `
UPDATE post_comments
SET text = $1
WHERE id = $2
`

func UpdatePostCommentText(id int64, text string) error {
	if _, err := db.Connection.Exec(updatePostCommentText, text, id); err != nil {
		return errors.New("an error occured while updating comment")
	}
	return nil
}

const getPostCommentCount = `
SELECT COUNT(*)
FROM post_comments
WHERE post_id = $1 AND deleted_at IS NULL
`

func GetPostCommentCount(postId int64) (int64, error) {
	var count sql.NullInt64
	if err := db.Connection.QueryRow(getPostCommentCount, postId).Scan(&count); err != nil {
		return count.Int64, errors.New("total number of comments could not be obtained")
	}
	return count.Int64, nil
}
