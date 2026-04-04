package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Initialize database
	if err := InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer CloseDB()

	log.Println("Database connected successfully")

	// Setup router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Timeout(60 * time.Second))

	// API routes
	API(r)

	// TLS configuration
	var tlsConfig *tls.Config
	serverCert := getEnv("SERVER_CERT", "")
	serverKey := getEnv("SERVER_KEY", "")
	caCert := getEnv("CA_CERT", "")

	if serverCert != "" && serverKey != "" {
		// Load server certificate
		cert, err := tls.LoadX509KeyPair(serverCert, serverKey)
		if err != nil {
			log.Fatalf("Failed to load server certificate: %v", err)
		}

		tlsConfig = &tls.Config{
			Certificates: []tls.Certificate{cert},
			MinVersion:   tls.VersionTLS12,
		}

		// If CA cert is provided, enable mTLS
		if caCert != "" {
			caCertPEM, err := os.ReadFile(caCert)
			if err != nil {
				log.Fatalf("Failed to read CA certificate: %v", err)
			}

			caCertPool := x509.NewCertPool()
			if !caCertPool.AppendCertsFromPEM(caCertPEM) {
				log.Fatal("Failed to parse CA certificate")
			}

			tlsConfig.ClientCAs = caCertPool
			tlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
			log.Println("mTLS enabled - client certificates required")
		}
	} else {
		log.Println("Warning: Running without TLS certificates - mTLS disabled")
	}

	// Create server
	port := getEnv("PORT", "18443")
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		TLSConfig:    tlsConfig,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	// Start server
	log.Printf("VulnView Backend starting on port %s", port)
	if tlsConfig != nil {
		if err := server.ListenAndServeTLS("", ""); err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	} else {
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}
}
