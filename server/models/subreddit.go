package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/ikevinws/readit/db"
)

type SubreaditUserRole int64

const (
	UserRole SubreaditUserRole = iota
	ModeratorRole
)

func (u SubreaditUserRole) String() string {
	switch u {
	case UserRole:
		return "user"
	case ModeratorRole:
		return "moderator"
	}
	return "user"
}

type Subreadit struct {
	CreatedAt time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt time.Time    `json:"updated_at" db:"updated_at"`
	DeletedAt sql.NullTime `json:"deleted_at" db:"deleted_at"`
	ID        int64        `json:"id" db:"id"`
	Name      string       `json:"name" validate:"required,min=3,max=20,alphanum" db:"name"`
}

type SubreaditSerializer struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type SubreaditUser struct {
	Subreadit   Subreadit `validate:"-" db:"subreadits"`
	SubreaditID int64     `json:"subreaditId" validate:"required" db:"subreadit_id"`
	User        User      `validate:"-" db:"users"`
	UserID      int64     `json:"userId" validate:"required" db:"user_id"`
	Role        string    `json:"role" db:"role"`
}

type SubreaditUserSerializer struct {
	ID            int64  `json:"id"`
	Username      string `json:"username"`
	Role          string `json:"role"`
	SubreaditName string `json:"subreaditName"`
}

const findSubreaditByName = `
SELECT created_at, updated_at, deleted_at, id, name FROM subreadits
WHERE name = $1 LIMIT 1
`

func FindSubreaditByName(name string) (Subreadit, error) {
	subreadit := Subreadit{}

	if err := db.Connection.Get(&subreadit, findSubreaditByName, name); err != nil {
		return subreadit, errors.New("subreadit does not exist")
	}
	return subreadit, nil
}

const findSubreaditById = `
SELECT created_at, updated_at, deleted_at, id, name FROM subreadits
WHERE id = $1 LIMIT 1
`

func FindSubreaditById(id int64) (Subreadit, error) {
	subreadit := Subreadit{}
	if err := db.Connection.Get(&subreadit, findSubreaditById, id); err != nil {
		return subreadit, errors.New("subreadit does not exist")
	}
	return subreadit, nil
}

const createSubreadit = `
INSERT INTO subreadits (
    name
) VALUES (
    $1
) RETURNING created_at, updated_at, deleted_at, id, name
`

func CreateSubreadit(name string) (Subreadit, error) {
	subreadit := Subreadit{}
	if err := db.Connection.Get(&subreadit, createSubreadit, name); err != nil {
		return subreadit, errors.New("subreadit could not be created")
	}
	return subreadit, nil
}

const getSubreadits = `
SELECT created_at, updated_at, deleted_at, id, name FROM subreadits
`

func GetSubreadits() ([]Subreadit, error) {
	subreadits := []Subreadit{}
	if err := db.Connection.Select(&subreadits, getSubreadits); err != nil {
		return subreadits, errors.New("subreadit could not be obtained")
	}
	return subreadits, nil
}

const getUserSubreadits = `
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

	subreadit_users.subreadit_id, 
	subreadit_users.user_id, 
	subreadit_users.role
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_users.user_id = $1
`

func GetUserSubreadits(userId int64) ([]SubreaditUser, error) {
	subreaditUsers := []SubreaditUser{}
	err := db.Connection.Select(&subreaditUsers, getUserSubreadits, userId)
	if err != nil {
		return subreaditUsers, errors.New("user subreadits could not be obtained")
	}
	return subreaditUsers, nil
}

const joinSubreadit = `
INSERT INTO subreadit_users (
    subreadit_id,
    user_id,
    role
) VALUES (
    $1,
    $2,
    $3
)
`

func JoinSubreadit(subreaditId int64, userId int64, role string) error {
	if _, err := db.Connection.Exec(joinSubreadit, subreaditId, userId, role); err != nil {
		return errors.New("user could not join subreadit")
	}
	return nil
}

const leaveSubreadit = `
DELETE FROM subreadit_users
WHERE subreadit_id = $1 AND user_id = $2
`

func LeaveSubreadit(subreaditId int64, userId int64) error {
	if _, err := db.Connection.Exec(leaveSubreadit, subreaditId, userId); err != nil {
		return errors.New("user could not leave subreadit")
	}
	return nil
}

const findSubreaditUser = `
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

	subreadit_users.subreadit_id, 
	subreadit_users.user_id, 
	subreadit_users.role
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_id = $1 AND user_id = $2 LIMIT 1
`

func FindSubreaditUser(subreaditId int64, userId int64) (SubreaditUser, error) {
	var subreaditUser SubreaditUser
	err := db.Connection.Get(&subreaditUser, findSubreaditUser, subreaditId, userId)
	if err != nil {
		return subreaditUser, errors.New("could not obtain subreadit user")
	}
	return subreaditUser, nil
}

const getSubreaditUsersByRole = `
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

	subreadit_users.subreadit_id, 
	subreadit_users.user_id, 
	subreadit_users.role
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_id = $1 AND role = $2
`

func GetSubreaditModerators(subreaditId int64) ([]SubreaditUser, error) {
	subreaditUsers := []SubreaditUser{}
	err := db.Connection.Select(&subreaditUsers, getSubreaditUsersByRole, subreaditId, ModeratorRole.String())
	if err != nil {
		return subreaditUsers, errors.New("subreadit admins could not be obtained")
	}

	return subreaditUsers, nil
}
