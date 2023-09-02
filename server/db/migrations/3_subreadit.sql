-- +goose Up

CREATE TABLE IF NOT EXISTS subreadits (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
) INHERITS (time);

DROP TRIGGER IF EXISTS set_timestamp on "subreadits";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON subreadits
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE IF NOT EXISTS subreadit_users (
    subreadit_id BIGINT NOT NULL REFERENCES Subreadits (id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES Users (id) ON DELETE CASCADE,
    PRIMARY KEY(subreadit_id, user_id),
    role TEXT NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS subreadit_users;
DROP TABLE IF EXISTS subreadits;
