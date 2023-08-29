-- name: CreatePost :exec
INSERT INTO posts (
    user_id,
    subreadit_id,
    title,
    text
) VALUES (
    $1, $2, $3, $4
);

-- name: GetPosts :many
SELECT sqlc.embed(users), sqlc.embed(subreadits), posts.*
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
ORDER BY posts.created_at DESC;

-- name: GetPostsBySubreaditId :many
SELECT sqlc.embed(users), sqlc.embed(subreadits), posts.*
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE subreadit_id = $1
ORDER BY posts.created_at DESC;

-- name: GetPostsBySubreaditName :many
SELECT sqlc.embed(users), sqlc.embed(subreadits), posts.*
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE subreadits.name = $1
ORDER BY posts.created_at DESC;


-- name: FindPostById :one
SELECT sqlc.embed(users), sqlc.embed(subreadits), posts.*
FROM posts
LEFT JOIN users ON posts.user_id = users.id
LEFT JOIN subreadits ON posts.subreadit_id = subreadits.id
WHERE posts.id = $1 LIMIT 1;

-- name: CreateUserReadPost :exec
INSERT INTO user_read_posts (
    user_id,
    post_id
) 
VALUES (
    $1, $2
);

-- name: GetUserReadPost :one
SELECT *
FROM user_read_posts
WHERE post_id = $1 AND user_id = $2 LIMIT 1;

-- name: DeletePost :exec
DELETE
FROM posts
WHERE id = $1 AND user_id = $2;
