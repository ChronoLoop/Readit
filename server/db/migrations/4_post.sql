-- +goose Up

-- POSTS

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subreadit_id BIGINT NOT NULL REFERENCES subreadits(id) ON DELETE CASCADE,
    text TEXT NOT NULL
) INHERITS (time);

DROP TRIGGER IF EXISTS set_timestamp on "posts";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE IF NOT EXISTS user_read_posts (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id),
    read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
) INHERITS (time);

DROP TRIGGER IF EXISTS set_timestamp on "user_read_posts";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON user_read_posts
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();


-- POSTS COMMENTS

CREATE TABLE IF NOT EXISTS post_comments (
    id BIGSERIAL PRIMARY KEY, 
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    parent_id BIGINT NULL REFERENCES post_comments(id) ON DELETE CASCADE
) INHERITS (time);

DROP TRIGGER IF EXISTS set_timestamp on "post_comments";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON post_comments
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- +goose Down
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS user_read_posts;
DROP TABLE IF EXISTS posts;
