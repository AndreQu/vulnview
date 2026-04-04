package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func InitDB() error {
	var err error
	dbPath := getEnv("DB_PATH", "./vulnview.db")
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Create tables
	schema := `
	CREATE TABLE IF NOT EXISTS devices (
		id TEXT PRIMARY KEY,
		name TEXT,
		os TEXT,
		os_version TEXT,
		last_seen DATETIME,
		ip_address TEXT,
		status TEXT
	);
	CREATE TABLE IF NOT EXISTS software (
		id TEXT PRIMARY KEY,
		device_id TEXT,
		name TEXT,
		version TEXT,
		vendor TEXT,
		install_date DATETIME
	);
	`
	_, err = db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	fmt.Println("Database initialized (SQLite)")
	return nil
}

func CloseDB() {
	if db != nil {
		_ = db.Close()
	}
}

func GetDB() *sql.DB {
	return db
}

func Transaction(ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
