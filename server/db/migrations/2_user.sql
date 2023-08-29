-- +goose Up

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL UNIQUE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
) INHERITS (time);

DROP TRIGGER IF EXISTS set_timestamp on "users";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- +goose Down
DROP TABLE IF EXISTS users;
