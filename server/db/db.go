package db

import (
	"fmt"
	"log"
	"os"

	"github.com/ikevinws/reddit-clone/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Connection *gorm.DB

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
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Could not connect database")
	}
	db.Migrator().DropTable(&models.User{})
	db.AutoMigrate(&models.User{})
	Connection = db
}
