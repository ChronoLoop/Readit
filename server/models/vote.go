package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
)

type Vote struct {
	UserID    int64        `json:"userId" db:"user_id"`
	CreatedAt time.Time    `db:"created_at"`
	UpdatedAt time.Time    `db:"updated_at"`
	DeletedAt sql.NullTime `db:"deleted_at"`
	Value     int32        `json:"value" db:"value"`
}

type PostVote struct {
	Vote
	PostID int64 `json:"postId" db:"post_id"`
}

type UserVoteSerializer struct {
	Value  int32 `json:"value"`
	UserID int64 `json:"userId"`
}

type PostCommentVote struct {
	Vote
	PostCommentID int64 `json:"postCommentId" db:"post_comment_id"`
}

const createPostVote = `
INSERT INTO  post_votes (
    user_id,
    post_id,
    value
) values (
    $1, $2, $3
)
`

func CreatePostVote(postVote *PostVote) error {
	if _, err := db.Connection.Exec(createPostVote, postVote.UserID, postVote.PostID, postVote.Value); err != nil {
		return errors.New("user could not be created")
	}
	return nil
}

const findPostVoteById = `
SELECT created_at, updated_at, deleted_at, user_id, value, post_id 
FROM post_votes
WHERE post_id = $1 AND user_id = $2 LIMIT 1
`

func FindPostVoteById(postId int64, userId int64) (PostVote, error) {
	postVote := PostVote{}
	if err := db.Connection.Get(&postVote, findPostVoteById, postId, userId); err != nil {
		return postVote, errors.New("user does not exist")
	}
	return postVote, nil
}

const updatePostVoteValue = `
UPDATE post_votes
SET value = $1
WHERE user_id = $2 AND post_id = $3
`

func UpdatePostVoteValue(postVote *PostVote, val int32) error {
	if _, err := db.Connection.Exec(updatePostVoteValue, val, postVote.UserID, postVote.PostID); err != nil {
		return errors.New("post comment vote could not be updated")
	}
	return nil
}

const createPostCommentVote = `
INSERT INTO post_comment_votes (
    user_id,
    post_comment_id,
    value
) VALUES (
    $1, $2, $3
)
`

func CreatePostCommentVote(userId int64, postCommentId int64, val int) error {
	if _, err := db.Connection.Exec(createPostCommentVote, userId, postCommentId, val); err != nil {
		return errors.New("post comment vote could not be created")
	}
	return nil
}

const findPostCommentVoteById = `
SELECT created_at, updated_at, deleted_at, user_id, value, post_comment_id
FROM post_comment_votes
WHERE post_comment_id = $1 AND user_id = $2 LIMIT 1
`

func FindPostCommentVoteById(postCommentId int64, userId int64) (PostCommentVote, error) {
	postCommentVote := PostCommentVote{}
	if err := db.Connection.Get(&postCommentVote, findPostCommentVoteById, postCommentId, userId); err != nil {
		return postCommentVote, errors.New("post comment vote does not exist")
	}
	return postCommentVote, nil
}

const updatePostCommentVoteValue = `
UPDATE post_comment_votes
SET value = $1
WHERE user_id = $2 AND post_comment_id = $3
`

type UpdatePostCommentVoteValueParams struct {
	UserId        int64
	PostCommentId int64
	Val           int32
}

func UpdatePostCommentVoteValue(arg UpdatePostCommentVoteValueParams) error {
	if _, err := db.Connection.Exec(updatePostVoteValue, arg.Val, arg.UserId, arg.PostCommentId); err != nil {
		return errors.New("user could not be created")
	}
	return nil
}

const getPostTotalVoteValue = `
SELECT SUM(value)
FROM post_votes
WHERE post_id = $1
`

func GetPostTotalVoteValue(postId int64) (int64, error) {
	var total int64
	if err := db.Connection.QueryRow(getPostTotalVoteValue, postId).Scan(&total); err != nil {
		return total, errors.New("post total vote value could not be obtained")
	}
	return total, nil
}

const getPostCommentTotalVoteValue = `
SELECT SUM(value)
FROM post_comment_votes
WHERE post_comment_id = $1
`

func GetPostCommentTotalVoteValue(postCommentId int64) (int64, error) {
	var total int64
	if err := db.Connection.QueryRow(getPostCommentTotalVoteValue, postCommentId).Scan(&total); err != nil {
		return total, errors.New("post comment total vote value could not be obtained")
	}
	return total, nil
}
