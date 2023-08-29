package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
)

type User struct {
	CreatedAt time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt time.Time    `json:"updated_at" db:"updated_at"`
	DeletedAt sql.NullTime `json:"deleted_at" db:"deleted_at"`
	ID        int64        `json:"id" db:"id"`
	Username  string       `json:"username" db:"username"`
	Password  string       `json:"password" db:"password"`
}

type UserSerializer struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
}

const findUserByName = `
SELECT created_at, updated_at, deleted_at, id, username, password FROM users
WHERE username = $1 LIMIT 1
`

func FindUserByName(username string) (User, error) {
	user := User{}

	if err := db.Connection.Get(&user, findUserByName, username); err != nil {
		return user, errors.New("user does not exist")
	}
	return user, nil
}

const findUserById = `
SELECT created_at, updated_at, deleted_at, id, username, password FROM users
WHERE id = $1 LIMIT 1
`

func FindUserById(id int64) (User, error) {
	user := User{}
	if err := db.Connection.Get(&user, findUserById, id); err != nil {
		return user, errors.New("user does not exist")
	}
	return user, nil
}

const createUser = `
INSERT INTO users (
    username, password
) VALUES (
    $1, $2
)
`

func CreateUser(username string, password string) error {
	if _, err := db.Connection.Exec(createUser, username, password); err != nil {
		return errors.New("user could not be created")
	}
	return nil
}
