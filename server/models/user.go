package models

type UserSerializer struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
}
