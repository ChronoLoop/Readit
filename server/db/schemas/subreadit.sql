-- +goose Up

CREATE TABLE subreadits (
    name VARCHAR(255) UNIQUE NOT NULL
) INHERITS (base);
CREATE INDEX idx_subreadits_deleted_at ON subreadits (deleted_at);

CREATE TABLE subreadit_users (
    subreadit_id BIGINT REFERENCES subreadit(id) NOT NULL,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    PRIMARY KEY(subreadit_id, user_id),

    role VARCHAR(255) NOT NULL
);
