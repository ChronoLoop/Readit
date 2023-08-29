-- +goose Up

-- POSTS

CREATE TABLE posts (
    title VARCHAR(255) NOT NULL,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    subreadit_id BIGINT REFERENCES subreadit(id) NOT NULL,
    text VARCHAR(255) NOT NULL
) INHERITS (base);
CREATE INDEX idx_posts_deleted_at ON posts (deleted_at);

CREATE TABLE user_read_posts (
    user_id BIGINT REFERENCES users(id) NOT NULL,
    post_id BIGINT REFERENCES posts(id) NOT NULL,
    PRIMARY KEY (user_id, post_id),
    read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
) INHERITS (time);
CREATE INDEX idx_user_read_posts_deleted_at ON user_read_posts (deleted_at);



-- POSTS COMMENTS

CREATE TABLE post_comments (
    post_id BIGINT REFERENCES posts(id) NOT NULL,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    text VARCHAR(255) NOT NULL,
    parent_id BIGINT REFERENCES post_comments(id) NULL
) INHERITS (base);
CREATE INDEX idx_post_comments_at ON post_comments (deleted_at);
