package db

import (
	"fmt"
	"log"
	"os"

	dbconnection "github.com/ikevinws/readit/db/sqlc"
	"github.com/pressly/goose/v3"
)

var Connection *dbconnection.Queries

func Initialize() {
	host, port, username, password, name :=
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB")
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host,
		username,
		password,
		name,
		port,
	)
	db, err := goose.OpenDBWithDriver("postgres", dsn)
	if err != nil {
		log.Fatal("Could not connect database")
	}

	dir := "./schemas"
	if err = goose.Up(db, dir); err != nil {
		log.Fatal("Migrations failed")
	}

	Connection = dbconnection.New(db)
}
