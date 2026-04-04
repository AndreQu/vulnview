package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var db *pgxpool.Pool

// InitDB initializes the database connection pool
func InitDB() error {
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		getEnv("DB_USER", "vulnview"),
		getEnv("DB_PASSWORD", "vulnview"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "vulnview"),
	)

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return fmt.Errorf("failed to parse database config: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = time.Minute * 30

	db, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	if err := InitSchema(ctx); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	return nil
}

// InitSchema executes the SQL schema file to ensure required tables exist.
func InitSchema(ctx context.Context) error {
	schemaPath := getEnv("DB_INIT_SQL", "init.sql")
	content, err := os.ReadFile(schemaPath)
	if err != nil {
		// Fallback to the executable directory so deployments still work
		// when started from a different cwd.
		execPath, pathErr := os.Executable()
		if pathErr == nil {
			altPath := filepath.Join(filepath.Dir(execPath), "init.sql")
			content, err = os.ReadFile(altPath)
		}
		if err != nil {
			return fmt.Errorf("failed to read schema file %q: %w", schemaPath, err)
		}
	}

	if _, err := db.Exec(ctx, string(content)); err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	return nil
}

// CloseDB closes the database connection pool
func CloseDB() {
	if db != nil {
		db.Close()
	}
}

// getEnv returns environment variable or default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetDB returns the database pool
func GetDB() *pgxpool.Pool {
	return db
}

// Transaction executes a function within a database transaction
func Transaction(ctx context.Context, fn func(pgx.Tx) error) error {
	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}

	if err := fn(tx); err != nil {
		tx.Rollback(ctx)
		return err
	}

	return tx.Commit(ctx)
}
