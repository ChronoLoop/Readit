package models

import (
	"errors"

	"github.com/ikevinws/readit/db"
)

type PostWithComments struct {
	Post         PostSerializer          `json:"post"`
	UserComments []PostCommentSerializer `json:"userComments"`
}

func GetUserOverviewPostsAndComments(userId uint) ([]PostWithComments, error) {
	results := []PostWithComments{}

	//GORM issue: odd bug where `post_comment_users.username as post_comment_username` has to go before `post_comments`. Otherwise, the username can be empty sometimes.

	query := `
		Select 

		subreadits.name as subreadit_name,
		post_users.username as post_username,
		posts.id, posts.created_at, posts.updated_at, posts.title, posts.user_id, posts.subreadit_id, posts.text,
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
		ON post_comments.post_id = posts.id AND post_comments.user_id = ?

		LEFT JOIN users as post_users
		ON posts.user_id = post_users.id

		LEFT JOIN users as post_comment_users
		ON post_comments.user_id = post_comment_users.id AND post_comment_users.id = ?

		LEFT JOIN subreadits
		ON posts.subreadit_id = subreadits.id

		LEFT JOIN post_votes
		ON post_votes.post_id = posts.id AND post_votes.user_id = ?

		LEFT JOIN post_comment_votes
		ON post_comment_votes.post_comment_id = post_comments.id AND post_comment_votes.user_id = ?

		where post_comments.user_id = ? or posts.user_id = ?
		ORDER BY posts.created_at DESC, post_comments.created_at DESC;
	`
	rows, err := db.Connection.Raw(query, userId, userId, userId, userId, userId, userId).Rows()

	if err != nil {
		return results, errors.New("posts and comments could not be retrieved")
	}

	defer rows.Close()
	for rows.Next() {
		post := PostSerializer{}
		postComment := PostCommentSerializer{}

		postUserVote := UserVoteSerializer{}
		postCommentUserVote := UserVoteSerializer{}

		rows.Scan(
			&post.Subreadit.Name,
			&post.User.Username,
			&post.ID, &post.CreatedAt, &post.UpdatedAt, &post.Title, &post.User.ID, &post.Subreadit.ID, &post.Text,
			&post.TotalVoteValue,
			&post.NumberOfComments,

			&postUserVote.UserID,
			&postUserVote.Value,

			&postComment.User.Username,
			&postComment.ID, &postComment.CreatedAt, &postComment.UpdatedAt, &postComment.PostID, &postComment.User.ID, &postComment.Text, &postComment.ParentID,
			&postComment.TotalVoteValue,

			&postCommentUserVote.UserID,
			&postCommentUserVote.Value,
		)

		if postUserVote.UserID != 0 {
			post.UserVote = &postUserVote
		}
		if postCommentUserVote.UserID != 0 {
			postComment.UserVote = &postCommentUserVote
		}

		if len(results) == 0 {
			results = append(results, PostWithComments{Post: post})
		} else {
			found := false
			for i := range results {
				if results[i].Post.ID == post.ID {
					found = true
					break
				}
			}
			if !found {
				results = append(results, PostWithComments{Post: post})
			}
		}

		if postComment.ID != 0 {
			for i := range results {
				if int(results[i].Post.ID) == postComment.PostID {
					results[i].UserComments = append(results[i].UserComments, postComment)
				}
			}
		}
	}
	return results, nil
}
