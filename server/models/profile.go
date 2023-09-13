package models

import (
	"database/sql"
	"errors"

	"github.com/ikevinws/readit/common"
	"github.com/ikevinws/readit/db"
)

type OverviewSubreadit struct {
	ID        sql.NullInt64
	Name      sql.NullString
	CreatedAt sql.NullTime
}

type OverviewPost struct {
	CreatedAt        sql.NullTime
	UpdatedAt        sql.NullTime
	DeletedAt        sql.NullTime
	ID               sql.NullInt64
	Title            sql.NullString
	UserID           sql.NullInt64
	SubreaditID      sql.NullInt64
	Text             sql.NullString
	NumberOfComments sql.NullInt64
	TotalVoteValue   sql.NullInt64
}

type OverviewPostComment struct {
	CreatedAt      sql.NullTime
	UpdatedAt      sql.NullTime
	DeletedAt      sql.NullTime
	ID             sql.NullInt64
	TotalVoteValue sql.NullInt64
	Text           sql.NullString
	ParentID       *int64
	PostID         sql.NullInt64
}

type OverviewUser struct {
	Username sql.NullString
	ID       sql.NullInt64
}

type OverviewVote struct {
	UserID sql.NullInt64
	Value  sql.NullInt32
}

type PostWithComments struct {
	Post         PostSerializer          `json:"post"`
	UserComments []PostCommentSerializer `json:"userComments"`
}

const getUserOverviewPostsAndComments = `
Select 
subreadits.name as subreadit_name,
subreadits.created_at,
post_users.username as post_username,

posts.id, 
posts.created_at, posts.updated_at, posts.deleted_at,
posts.title, posts.user_id, posts.subreadit_id, posts.text,
(SELECT sum(value) FROM post_votes WHERE post_id = posts.id) as totalVoteValue,
(SELECT count(*) FROM post_comments WHERE post_id = posts.id AND post_comments.deleted_at IS NULL) as numberOfComments,

post_comment_users.username as post_comment_username,
post_comments.id, 
post_comments.created_at, post_comments.updated_at, post_comments.deleted_at,
post_comments.post_id, post_comments.user_id, post_comments.text, post_comments.parent_id,
(SELECT sum(value) FROM post_comment_votes WHERE post_comment_id = post_comments.id) as commentTotalVoteValue,

post_votes.user_id,
post_votes.value as postUserVoteValue,

post_comment_votes.user_id,
post_comment_votes.value as postCommentUserVoteValue 

from post_comments

FULL OUTER JOIN posts 
ON post_comments.post_id = posts.id AND post_comments.user_id = $1

LEFT JOIN users as post_users
ON posts.user_id = post_users.id

LEFT JOIN users as post_comment_users
ON post_comments.user_id = post_comment_users.id AND post_comment_users.id = $1

LEFT JOIN subreadits
ON posts.subreadit_id = subreadits.id

LEFT JOIN post_votes
ON post_votes.post_id = posts.id AND post_votes.user_id = $1

LEFT JOIN post_comment_votes
ON post_comment_votes.post_comment_id = post_comments.id AND post_comment_votes.user_id = $1

WHERE (post_comments.user_id = $1 AND post_comments.deleted_at IS NULL) or posts.user_id = $1
ORDER BY posts.created_at DESC, post_comments.created_at DESC
`

func GetUserOverviewPostsAndComments(userId int64) ([]PostWithComments, error) {
	results := []PostWithComments{}

	rows, err := db.Connection.Query(getUserOverviewPostsAndComments, userId)

	if err != nil {
		return results, errors.New("posts and comments could not be retrieved")
	}

	defer rows.Close()
	for rows.Next() {
		post := OverviewPost{}
		subreadit := OverviewSubreadit{}
		postUser := OverviewUser{}
		postComment := OverviewPostComment{}
		postCommentUser := OverviewUser{}

		postUserVote := OverviewVote{}
		postCommentUserVote := OverviewVote{}

		if err := rows.Scan(
			&subreadit.Name,
			&subreadit.CreatedAt,
			&postUser.Username,

			&post.ID,
			&post.CreatedAt, &post.UpdatedAt, &post.DeletedAt,
			&post.Title, &postUser.ID, &subreadit.ID, &post.Text,
			&post.TotalVoteValue,
			&post.NumberOfComments,

			&postCommentUser.Username,
			&postComment.ID,
			&postComment.CreatedAt, &postComment.UpdatedAt, &postComment.DeletedAt,
			&postComment.PostID, &postCommentUser.ID, &postComment.Text, &postComment.ParentID,
			&postComment.TotalVoteValue,

			&postUserVote.UserID,
			&postUserVote.Value,

			&postCommentUserVote.UserID,
			&postCommentUserVote.Value,
		); err != nil {
			return results, errors.New("posts and comments could not be retrieved")
		}

		postSerialize := PostSerializer{
			ID:               post.ID.Int64,
			TotalVoteValue:   post.TotalVoteValue.Int64,
			NumberOfComments: post.NumberOfComments.Int64,
			Text:             common.SplitTextByNewLine(post.Text.String),
			Title:            post.Title.String,
			CreatedAt:        post.CreatedAt.Time,
			UpdatedAt:        post.UpdatedAt.Time,
			Subreadit: SubreaditSerializer{
				ID:        subreadit.ID.Int64,
				Name:      subreadit.Name.String,
				CreatedAt: subreadit.CreatedAt.Time,
			},
		}
		postCommentSerialize := PostCommentSerializer{
			ID:             postComment.ID.Int64,
			UpdatedAt:      postComment.UpdatedAt.Time,
			CreatedAt:      postComment.CreatedAt.Time,
			Text:           postComment.Text.String,
			TotalVoteValue: postComment.TotalVoteValue.Int64,
			PostID:         postComment.PostID.Int64,
			ParentID:       postComment.ParentID,
		}

		if postUser.ID.Valid {
			postSerialize.User = &UserSerializer{
				Username: postUser.Username.String,
				ID:       postUser.ID.Int64,
			}
		}

		if post.DeletedAt.Valid && post.NumberOfComments.Int64 == 0 {
			continue
		} else if post.DeletedAt.Valid {
			postSerialize.Title = "[deleted]"
			postSerialize.Text = []string{"[deleted]"}
			postSerialize.User = nil
		}

		if postCommentUser.ID.Valid {
			postCommentSerialize.User = &UserSerializer{
				ID:       postCommentUser.ID.Int64,
				Username: postCommentUser.Username.String,
			}
		}

		if postUserVote.UserID.Valid {
			postSerialize.UserVote = &UserVoteSerializer{
				UserID: postUserVote.UserID.Int64,
				Value:  postUserVote.Value.Int32,
			}
		}
		if postCommentUserVote.UserID.Valid {
			postCommentSerialize.UserVote = &UserVoteSerializer{
				Value:  postCommentUserVote.Value.Int32,
				UserID: postCommentUserVote.UserID.Int64,
			}
		}

		if len(results) == 0 {
			results = append(results, PostWithComments{Post: postSerialize})
		} else {
			found := false
			for i := range results {
				if results[i].Post.ID == postSerialize.ID {
					found = true
					break
				}
			}
			if !found {
				results = append(results, PostWithComments{Post: postSerialize})
			}
		}

		if postComment.ID.Valid && !postComment.DeletedAt.Valid {
			for i := range results {
				if results[i].Post.ID == postCommentSerialize.PostID {
					results[i].UserComments = append(results[i].UserComments, postCommentSerialize)
				}
			}
		}
	}
	return results, nil
}
