package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
)

type Post struct {
	CreatedAt   time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at" db:"updated_at"`
	DeletedAt   sql.NullTime `json:"deleted_at" db:"deleted_at"`
	ID          int64        `json:"id" db:"id"`
	Title       string       `json:"title" validate:"required,min=1" db:"title"`
	User        User         `validate:"-" db:"users"`
	UserID      int64        `json:"userId" validate:"required" db:"user_id"`
	Subreadit   Subreadit    `validate:"-" db:"subreadits"`
	SubreaditID int64        `json:"subreaditId" validate:"required" db:"subreadit_id"`
	Text        string       `json:"text" db:"text"`
}

type PostSerializer struct {
	ID               int64               `json:"id"`
	Title            string              `json:"title"`
	TotalVoteValue   int64               `json:"totalVoteValue"`
	Text             []string            `json:"text"`
	CreatedAt        time.Time           `json:"createAt"`
	UpdatedAt        time.Time           `json:"updatedAt"`
	User             *UserSerializer     `json:"user,omitempty"`
	Subreadit        SubreaditSerializer `json:"subreadit"`
	NumberOfComments int64               `json:"numberOfComments"`
	UserVote         *UserVoteSerializer `json:"userVote,omitempty"`
}

type UserReadPost struct {
	CreatedAt time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt time.Time    `json:"updated_at" db:"updated_at"`
	ReadAt    time.Time    `json:"read_at" db:"read_at"`
	DeletedAt sql.NullTime `json:"deleted_at" db:"deleted_at"`
	UserID    int64        `json:"userId" validate:"required" db:"user_id"`
	PostID    int64        `json:"postId" validate:"required" db:"post_id"`
}

type UserReadPostSerializer struct {
	CreatedAt time.Time `json:"createAt"`
	UserID    int64     `json:"userId"`
	PostID    int64     `json:"postId"`
}

const createPost = `
INSERT INTO posts (
    user_id,
    subreadit_id,
    title,
    text
) VALUES (
    $1, $2, $3, $4
) RETURNING id
`

func CreatePost(userID int64, subreaditID int64, title string, text string) (int64, error) {
	cleanedText := common.ProcessTextHandler(text)
	var postID int64

	if err := db.Connection.Get(&postID, createPost, userID, subreaditID, title, cleanedText); err != nil {
		return postID, errors.New("post could not be created")
	}
	return postID, nil
}

const getPosts = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE posts.deleted_at IS NULL
ORDER BY posts.created_at DESC
`

func GetPosts() ([]Post, error) {
	posts := []Post{}
	err := db.Connection.Select(&posts, getPosts)

	if err != nil {
		return posts, errors.New("could not get posts")
	}

	return posts, nil
}

const getPostsBySubreaditId = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE subreadit_id = $1 AND posts.deleted_at is NULL
ORDER BY posts.created_at DESC
`

func GetPostsBySubreaditId(subreaditId int64) ([]Post, error) {
	posts := []Post{}
	err := db.Connection.Select(&posts, getPostsBySubreaditId)

	if err != nil {
		return posts, errors.New("could not get posts")
	}

	return posts, nil
}

const getPostsBySubreaditName = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE subreadits.name = $1 AND posts.deleted_at is NULL
ORDER BY posts.created_at DESC
`

func GetPostsBySubreaditName(subreaditName string) ([]Post, error) {
	posts := []Post{}
	err := db.Connection.Select(&posts, getPostsBySubreaditName, subreaditName)
	if err != nil {
		return posts, errors.New("could not get posts")
	}
	return posts, nil
}

const findPostById = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE posts.id = $1 LIMIT 1
`

func FindPostById(id int64) (Post, error) {
	post := Post{}
	err := db.Connection.Get(&post, findPostById, id)
	if err != nil {
		return post, errors.New("post does not exist")
	}
	return post, nil
}

const createUserReadPost = `
INSERT INTO user_read_posts (
    user_id,
    post_id
) 
VALUES (
    $1, $2
)
`

func CreateUserReadPost(userId int64, postId int64) error {
	if _, err := GetUserReadPost(userId, postId); err == nil {
		if err := updateUserReadPostReadAt(userId, postId); err != nil {
			return errors.New("post read by user could not be created")
		}
		return nil
	}
	if _, err := db.Connection.Exec(createUserReadPost, userId, postId); err != nil {
		return errors.New("post read by user could not be created")
	}
	return nil
}

const updateUserReadPostReadAtQuery = `
UPDATE user_read_posts
SET read_at = NOW()
WHERE post_id = $1 AND user_id = $2
`

func updateUserReadPostReadAt(userId int64, postId int64) error {
	if _, err := db.Connection.Exec(updateUserReadPostReadAtQuery, postId, userId); err != nil {
		return errors.New("could not update UserReadPost read_at")
	}
	return nil
}

const getUserReadPost = `
SELECT created_at, updated_at, deleted_at, user_id, post_id, read_at
FROM user_read_posts
WHERE post_id = $1 AND user_id = $2 LIMIT 1
`

func GetUserReadPost(userId int64, postId int64) (UserReadPost, error) {
	userReadPost := UserReadPost{}
	if err := db.Connection.Get(&userReadPost, getUserReadPost, postId, userId); err != nil {
		return userReadPost, errors.New("post was not read by user")
	}
	return userReadPost, nil
}

const deletePost = `
UPDATE posts
SET deleted_at = NOW()
WHERE id = $1 AND user_id = $2
`

func DeletePost(postId int64, userId int64) error {
	if _, err := db.Connection.Exec(deletePost, postId, userId); err != nil {
		return errors.New("post could not be deleted")
	}
	return nil
}

const getUserRecentReadPosts = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM user_read_posts
LEFT JOIN posts ON posts.id = user_read_posts.post_id
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE posts.deleted_at IS NULL and user_read_posts.user_id = $1
ORDER BY user_read_posts.read_at DESC
LIMIT 5
`

func GetUserRecentReadPosts(userId int64) ([]Post, error) {
	posts := []Post{}
	err := db.Connection.Select(&posts, getUserRecentReadPosts, userId)

	if err != nil {
		return posts, errors.New("could not get posts")
	}

	return posts, nil
}

const getUserRecentReadSubreaditPosts = `
SELECT 
	users.created_at AS "users.created_at", 
	users.updated_at AS "users.updated_at", 
	users.deleted_at AS "users.deleted_at", 
	users.id AS "users.id", 
	users.username AS "users.username", 
	users.password AS "users.password", 

	subreadits.created_at AS "subreadits.created_at", 
	subreadits.updated_at AS "subreadits.updated_at", 
	subreadits.deleted_at AS "subreadits.deleted_at", 
	subreadits.id AS "subreadits.id", 
	subreadits.name AS "subreadits.name", 

	posts.created_at, 
	posts.updated_at, 
	posts.deleted_at, 
	posts.id, 
	posts.title, 
	posts.user_id, 
	posts.subreadit_id, 
	posts.text
FROM user_read_posts
LEFT JOIN posts ON posts.id = user_read_posts.post_id
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE posts.deleted_at IS NULL AND user_read_posts.user_id = $1 AND subreadits.name = $2
ORDER BY user_read_posts.read_at DESC
LIMIT 5
`

func GetUserRecentReadSubreaditPosts(userId int64, subreaditName string) ([]Post, error) {
	posts := []Post{}
	err := db.Connection.Select(&posts, getUserRecentReadSubreaditPosts, userId, subreaditName)

	if err != nil {
		return posts, errors.New("could not get posts")
	}

	return posts, nil
}
