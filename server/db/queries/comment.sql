-- name: CreatePostComment :one
INSERT INTO post_comments (
    user_id,
    post_id,
    text,
    parent_id
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: GetPostComments :many
SELECT sqlc.embed(users), post_comments.*
FROM post_comments
LEFT JOIN users ON post_comments.user_id = users.id
WHERE post_id = $1;

-- name: FindPostCommentById :one
SELECT *
FROM post_comments
WHERE id = $1;

-- name: UpdatePostCommentText :exec
UPDATE post_comments
SET text = $1
WHERE id = $2;

-- name: GetPostCommentCount :one
SELECT COUNT(*)
FROM post_comments
WHERE post_id = $1;
