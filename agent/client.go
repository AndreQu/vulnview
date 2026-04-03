//go:build windows

package main

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Client handles mTLS communication with backend
type Client struct {
	httpClient *http.Client
	baseURL    string
	deviceID   string
}

// NewClient creates a new mTLS client
func NewClient(serverURL, deviceID, certFile, keyFile, caFile string) (*Client, error) {
	// Load client certificate
	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load client certificate: %w", err)
	}

	// Load CA certificate
	caCert, err := os.ReadFile(caFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read CA certificate: %w", err)
	}

	caCertPool := x509.NewCertPool()
	if !caCertPool.AppendCertsFromPEM(caCert) {
		return nil, fmt.Errorf("failed to parse CA certificate")
	}

	// Configure TLS
	tlsConfig := &tls.Config{
		Certificates:       []tls.Certificate{cert},
		RootCAs:            caCertPool,
		InsecureSkipVerify: false,
		MinVersion:         tls.VersionTLS12,
	}

	// Create HTTP client with timeout
	return &Client{
		httpClient: &http.Client{
			Timeout:   30 * time.Second,
			Transport: &http.Transport{TLSClientConfig: tlsConfig},
		},
		baseURL:  serverURL,
		deviceID: deviceID,
	}, nil
}

// NewClientInsecure creates a client without mTLS (for development)
func NewClientInsecure(serverURL, deviceID string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		baseURL:  serverURL,
		deviceID: deviceID,
	}
}

// SendHeartbeat sends a heartbeat to the backend
func (c *Client) SendHeartbeat(req HeartbeatRequest) error {
	url := fmt.Sprintf("%s/api/v1/heartbeat", c.baseURL)
	
	data, err := json.Marshal(req)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("heartbeat failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("heartbeat failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// SendScanResult sends scan results to the backend
func (c *Client) SendScanResult(result ScanResult) error {
	url := fmt.Sprintf("%s/api/v1/scan", c.baseURL)
	
	data, err := json.Marshal(result)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("scan upload failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("scan upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// HeartbeatRequest is sent to the backend
type HeartbeatRequest struct {
	DeviceID        string          `json:"device_id"`
	Hostname        string          `json:"hostname"`
	OsType          string          `json:"os_type"`
	OsVersion       string          `json:"os_version"`
	Architecture    string          `json:"architecture"`
	AgentVersion    string          `json:"agent_version"`
	UptimeSeconds   int             `json:"uptime_seconds"`
	CPUUsagePercent float64         `json:"cpu_usage_percent"`
	MemoryUsageMB   int             `json:"memory_usage_mb"`
	Metadata        json.RawMessage `json:"metadata,omitempty"`
}

// ScanResult contains software and process data
type ScanResult struct {
	DeviceID  string          `json:"device_id"`
	ScanType  string          `json:"scan_type"`
	Timestamp time.Time       `json:"timestamp"`
	Software  []SoftwareEntry `json:"software"`
	Processes []ProcessEntry  `json:"processes"`
	Metadata  json.RawMessage `json:"metadata,omitempty"`
}

// SoftwareEntry is software data from agent
type SoftwareEntry struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Publisher   string `json:"publisher"`
	InstallPath string `json:"install_path"`
	Source      string `json:"source"`
	SHA256Hash  string `json:"sha256_hash,omitempty"`
}

// ProcessEntry is process data from agent
type ProcessEntry struct {
	PID        uint32 `json:"pid"`
	Name       string `json:"name"`
	Executable string `json:"executable"`
}
