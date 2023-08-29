-- +goose Up

CREATE TABLE votes(
    user_id BIGINT REFERENCES users(id) NOT NULL,
    value INT NOT NULL
) INHERITS (time);

CREATE TABLE post_votes (
    post_id BIGINT REFERENCES posts(id) NOT NULL,
    PRIMARY KEY (user_id, post_id)
) INHERITS (votes);

CREATE TABLE post_comment_votes (
    post_comment_id BIGINT REFERENCES post_comments(id) NOT NULL,
    PRIMARY KEY (user_id, post_comment_id)
) INHERITS (votes);
