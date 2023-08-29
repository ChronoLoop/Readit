-- +goose Up
CREATE TABLE IF NOT EXISTS votes(
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INT NOT NULL
) INHERITS (time);

CREATE TABLE IF NOT EXISTS post_votes (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
) INHERITS (votes);

DROP TRIGGER IF EXISTS set_timestamp on "post_votes";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON post_votes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS post_comment_votes (
    post_comment_id BIGINT NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_comment_id)
) INHERITS (votes);

DROP TRIGGER IF EXISTS set_timestamp on "post_comment_votes";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON post_comment_votes
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- +goose Down
DROP TABLE IF EXISTS post_comment_votes;
DROP TABLE IF EXISTS post_votes;
DROP TABLE IF EXISTS votes;

