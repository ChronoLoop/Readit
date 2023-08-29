-- Posts

-- name: CreatePostVote :exec
INSERT INTO post_votes (
    user_id,
    post_id,
    value
) VALUES (
    $1, $2, $3
);

-- name: FindPostVoteById :one
SELECT * FROM post_votes
WHERE post_id = $1 AND user_id = $2 LIMIT 1;

-- name: UpdatePostVoteValue :exec
UPDATE post_votes
SET value = $1
WHERE user_id = $2 AND post_id = $3;

-- name: GetPostTotalVoteValue :one
SELECT SUM(value)
FROM post_votes
WHERE post_id = $1;


-- Post Comments

-- name: CreatePostCommentVote :exec
INSERT INTO post_comment_votes (
    user_id,
    post_comment_id,
    value
) VALUES (
    $1, $2, $3
);

-- name: FindPostCommentVoteById :one
SELECT *
FROM post_comment_votes
WHERE post_comment_id = $1 AND user_id = $2 LIMIT 1;


-- name: UpdatePostCommentVoteValue :exec
UPDATE post_comment_votes
SET value = $1
WHERE user_id = $2 AND post_comment_id = $3;

-- name: GetPostCommentTotalVoteValue :one
SELECT SUM(value)
FROM post_comment_votes
WHERE post_comment_id = $1;
