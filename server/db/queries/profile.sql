-- name: GetUserOverviewPostsAndComments :many
Select 
subreadits.name as subreadit_name,
post_users.username as post_username,
posts.id, 
posts.created_at, posts.updated_at, posts.deleted_at,
posts.title, posts.user_id, posts.subreadit_id, posts.text,
(SELECT sum(value) FROM post_votes WHERE post_id = posts.id) as totalVoteValue,
(SELECT count(*) FROM post_comments WHERE post_id = posts.id AND post_comments.deleted_at IS NULL) as numberOfComments,

post_votes.user_id,
post_votes.value as postUserVoteValue,

post_comment_users.username as post_comment_username,
post_comments.id, post_comments.created_at, post_comments.updated_at, post_comments.post_id, post_comments.user_id, post_comments.text, post_comments.parent_id,
(SELECT sum(value) FROM post_comment_votes WHERE post_comment_id = post_comments.id) as commentTotalVoteValue,

post_comment_votes.user_id,
post_comment_votes.value as postCommentUserVoteValue 

from post_comments

FULL OUTER JOIN posts 
ON post_comments.post_id = posts.id AND post_comments.user_id = $1

LEFT JOIN users as post_users
ON posts.user_id = post_users.id

LEFT JOIN users as post_comment_users
ON post_comments.user_id = post_comment_users.id AND post_comment_users.id = $2

LEFT JOIN subreadits
ON posts.subreadit_id = subreadits.id

LEFT JOIN post_votes
ON post_votes.post_id = posts.id AND post_votes.user_id = $3

LEFT JOIN post_comment_votes
ON post_comment_votes.post_comment_id = post_comments.id AND post_comment_votes.user_id = $4

where (post_comments.user_id = $5 or posts.user_id = $6)
ORDER BY posts.created_at DESC, post_comments.created_at DESC;
