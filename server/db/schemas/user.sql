-- +goose Up

CREATE TABLE users (
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
) INHERITS (base);
CREATE INDEX idx_users_deleted_at ON users (deleted_at);
