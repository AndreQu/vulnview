//go:build windows

package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/google/uuid"
)

const (
	AgentVersion    = "1.0.0-mvp"
	HeartbeatInterval = 60 * time.Second
	FullScanInterval    = 4 * time.Hour
)

var (
	serverURL    = flag.String("server", "https://localhost:8443", "Backend server URL")
	certFile     = flag.String("cert", "", "Client certificate file (for mTLS)")
	keyFile      = flag.String("key", "", "Client key file (for mTLS)")
	caFile       = flag.String("ca", "", "CA certificate file (for mTLS)")
	insecure     = flag.Bool("insecure", false, "Disable mTLS (development only)")
	deviceID     string
	hostname     string
	client       *Client
)

func main() {
	flag.Parse()

	log.Printf("VulnView Agent v%s starting...", AgentVersion)

	// Get or create device ID
	deviceID = getDeviceID()
	log.Printf("Device ID: %s", deviceID)

	// Get hostname
	hostname = GetComputerName()
	log.Printf("Hostname: %s", hostname)

	// Create client
	var err error
	if *insecure || *certFile == "" {
		log.Println("Warning: Running without mTLS")
		client = NewClientInsecure(*serverURL, deviceID)
	} else {
		client, err = NewClient(*serverURL, deviceID, *certFile, *keyFile, *caFile)
		if err != nil {
			log.Fatalf("Failed to create client: %v", err)
		}
		log.Println("mTLS enabled")
	}

	// Initial registration heartbeat
	if err := sendHeartbeat(); err != nil {
		log.Printf("Initial heartbeat failed: %v", err)
	}

	// Perform initial scan
	if err := performScan("full"); err != nil {
		log.Printf("Initial scan failed: %v", err)
	}

	// Setup signal handling for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Setup ticker for heartbeat
	heartbeatTicker := time.NewTicker(HeartbeatInterval)
	defer heartbeatTicker.Stop()

	// Setup ticker for full scan
	scanTicker := time.NewTicker(FullScanInterval)
	defer scanTicker.Stop()

	log.Println("Agent running. Press Ctrl+C to exit.")

	// Main loop
	for {
		select {
		case <-heartbeatTicker.C:
			if err := sendHeartbeat(); err != nil {
				log.Printf("Heartbeat failed: %v", err)
			}

		case <-scanTicker.C:
			if err := performScan("full"); err != nil {
				log.Printf("Scheduled scan failed: %v", err)
			}

		case sig := <-sigChan:
			log.Printf("Received signal %v, shutting down...", sig)
			return
		}
	}
}

// getDeviceID returns the unique device identifier
func getDeviceID() string {
	// Try to get MachineGuid from registry
	guid, err := GetMachineGUID()
	if err == nil && guid != "" {
		return guid
	}

	// Fallback: generate and store UUID
	return uuid.New().String()
}

// sendHeartbeat sends heartbeat to backend
func sendHeartbeat() error {
	// Get OS info
	osInfo, _ := GetOSInfo()

	// Get system uptime
	uptime := GetSystemUptime()

	req := HeartbeatRequest{
		DeviceID:        deviceID,
		Hostname:        hostname,
		OsType:          "windows",
		OsVersion:       osInfo["os_version"],
		Architecture:    "amd64", // TODO: detect properly
		AgentVersion:    AgentVersion,
		UptimeSeconds:   uptime,
		CPUUsagePercent: 0.0,  // TODO: implement CPU monitoring
		MemoryUsageMB:   0,    // TODO: implement memory monitoring
	}

	if err := client.SendHeartbeat(req); err != nil {
		return err
	}

	log.Printf("Heartbeat sent at %s", time.Now().Format(time.RFC3339))
	return nil
}

// performScan performs a system scan
func performScan(scanType string) error {
	log.Printf("Starting %s scan...", scanType)
	startTime := time.Now()

	// Scan registry for installed software
	registrySoftware, err := ScanRegistry()
	if err != nil {
		log.Printf("Registry scan error: %v", err)
	}
	log.Printf("Registry scan found %d software entries", len(registrySoftware))

	// Get running processes
	processes, err := GetRunningProcesses()
	if err != nil {
		log.Printf("Process enumeration error: %v", err)
	}
	log.Printf("Process enumeration found %d processes", len(processes))

	// Convert to API format
	var softwareEntries []SoftwareEntry
	for _, sw := range registrySoftware {
		softwareEntries = append(softwareEntries, SoftwareEntry{
			Name:        sw.Name,
			Version:     sw.Version,
			Publisher:   sw.Publisher,
			InstallPath: sw.InstallPath,
			Source:      sw.Source,
		})
	}

	var processEntries []ProcessEntry
	for _, proc := range processes {
		processEntries = append(processEntries, ProcessEntry{
			PID:        proc.PID,
			Name:       proc.Name,
			Executable: proc.Executable,
		})
	}

	// Build scan result
	result := ScanResult{
		DeviceID:  deviceID,
		ScanType:  scanType,
		Timestamp: startTime,
		Software:  softwareEntries,
		Processes: processEntries,
	}

	// Send to backend
	if err := client.SendScanResult(result); err != nil {
		return fmt.Errorf("failed to send scan result: %w", err)
	}

	duration := time.Since(startTime)
	log.Printf("Scan completed in %v: %d software, %d processes", 
		duration, len(softwareEntries), len(processEntries))

	return nil
}

// getEnv returns environment variable or default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
