-- name: FindSubreaditByName :one
SELECT * FROM subreadits
WHERE name = $1 LIMIT 1;

-- name: FindSubreaditById :one
SELECT * FROM subreadits
WHERE id = $1 LIMIT 1;

-- name: CreateSubreadit :one
INSERT INTO subreadits (
    name
) VALUES (
    $1
) RETURNING *;

-- name: GetSubreadits :many
SELECT * FROM subreadits;

-- name: GetUserSubreadits :many
SELECT sqlc.embed(users), sqlc.embed(subreadits), subreadit_users.*
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_users.user_id = $1;

-- name: JoinSubreadit :exec
INSERT INTO subreadit_users (
    subreadit_id,
    user_id,
    role
) VALUES (
    $1,
    $2,
    $3
);

-- name: LeaveSubreadit :exec
DELETE FROM subreadit_users
WHERE subreadit_id = $1 AND user_id = $2;

-- name: FindSubreaditUser :one
SELECT sqlc.embed(users), sqlc.embed(subreadits), subreadit_users.*
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_id = $1 AND user_id = $2 LIMIT 1;

-- name: GetSubreaditUsersByRole :many
SELECT sqlc.embed(users), sqlc.embed(subreadits), subreadit_users.*
FROM subreadit_users
LEFT JOIN users ON users.id = subreadit_users.user_id
LEFT JOIN subreadits ON subreadits.id = subreadit_users.subreadit_id
WHERE subreadit_id = $1 AND role = $2;

