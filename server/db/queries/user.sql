-- name: FindUserByName :one
SELECT * FROM users
WHERE username = $1 LIMIT 1;

-- name: FindUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: CreateUser :exec
INSERT INTO users (
    username, password
) VALUES (
    $1, $2
);

