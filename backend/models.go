package main

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Device represents an endpoint device
type Device struct {
	ID            uuid.UUID       `json:"id" db:"id"`
	TenantID      *uuid.UUID      `json:"tenant_id,omitempty" db:"tenant_id"`
	DeviceID      string          `json:"device_id" db:"device_id"`
	Hostname      string          `json:"hostname" db:"hostname"`
	OsType        string          `json:"os_type" db:"os_type"`
	OsVersion     string          `json:"os_version" db:"os_version"`
	OsBuild       string          `json:"os_build" db:"os_build"`
	Architecture  string          `json:"architecture" db:"architecture"`
	LastSeen      *time.Time      `json:"last_seen,omitempty" db:"last_seen"`
	FirstSeen     time.Time       `json:"first_seen" db:"first_seen"`
	IPAddress     string          `json:"ip_address,omitempty" db:"ip_address"`
	MacAddress    string          `json:"mac_address,omitempty" db:"mac_address"`
	AgentVersion  string          `json:"agent_version" db:"agent_version"`
	IsOnline      bool            `json:"is_online" db:"is_online"`
	Metadata      json.RawMessage `json:"metadata,omitempty" db:"metadata"`
	CreatedAt     time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at" db:"updated_at"`
}

// Software represents a software entry on a device
type Software struct {
	ID           uuid.UUID       `json:"id" db:"id"`
	DeviceID     uuid.UUID       `json:"device_id" db:"device_id"`
	Name         string          `json:"name" db:"name"`
	Version      string          `json:"version" db:"version"`
	Publisher    string          `json:"publisher" db:"publisher"`
	InstallPath  string          `json:"install_path,omitempty" db:"install_path"`
	InstallDate  *time.Time      `json:"install_date,omitempty" db:"install_date"`
	Source       string          `json:"source" db:"source"`
	CPE          string          `json:"cpe,omitempty" db:"cpe"`
	SHA256Hash   string          `json:"sha256_hash,omitempty" db:"sha256_hash"`
	SizeBytes    int64           `json:"size_bytes,omitempty" db:"size_bytes"`
	Metadata     json.RawMessage `json:"metadata,omitempty" db:"metadata"`
	FirstSeen    time.Time       `json:"first_seen" db:"first_seen"`
	LastSeen     time.Time       `json:"last_seen" db:"last_seen"`
}

// Process represents a running process
type Process struct {
	PID          uint32          `json:"pid"`
	Name         string          `json:"name"`
	Executable   string          `json:"executable"`
	CommandLine  string          `json:"command_line,omitempty"`
	UserName     string          `json:"user_name,omitempty"`
	MemoryBytes  uint64          `json:"memory_bytes,omitempty"`
	StartTime    time.Time       `json:"start_time,omitempty"`
}

// Scan represents a device scan
type Scan struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	DeviceID       uuid.UUID       `json:"device_id" db:"device_id"`
	ScanType       string          `json:"scan_type" db:"scan_type"`
	StartedAt      time.Time       `json:"started_at" db:"started_at"`
	CompletedAt    *time.Time      `json:"completed_at,omitempty" db:"completed_at"`
	SoftwareCount  int             `json:"software_count" db:"software_count"`
	ProcessCount   int             `json:"process_count" db:"process_count"`
	Status         string          `json:"status" db:"status"`
	ErrorMessage   string          `json:"error_message,omitempty" db:"error_message"`
	Metadata       json.RawMessage `json:"metadata,omitempty" db:"metadata"`
}

// Heartbeat represents an agent heartbeat
type Heartbeat struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	DeviceID         uuid.UUID       `json:"device_id" db:"device_id"`
	Timestamp        time.Time       `json:"timestamp" db:"timestamp"`
	UptimeSeconds    int             `json:"uptime_seconds" db:"uptime_seconds"`
	CPUUsagePercent  float64         `json:"cpu_usage_percent" db:"cpu_usage_percent"`
	MemoryUsageMB    int             `json:"memory_usage_mb" db:"memory_usage_mb"`
	Metadata         json.RawMessage `json:"metadata,omitempty" db:"metadata"`
}

// HeartbeatRequest is sent by the agent
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

// ScanResult contains software and process data from agent
type ScanResult struct {
	DeviceID   string              `json:"device_id"`
	ScanType   string              `json:"scan_type"` // 'full', 'delta'
	Timestamp  time.Time           `json:"timestamp"`
	Software   []SoftwareEntry     `json:"software"`
	Processes  []ProcessEntry      `json:"processes"`
	Metadata   json.RawMessage     `json:"metadata,omitempty"`
}

// SoftwareEntry is the agent's software data
type SoftwareEntry struct {
	Name        string    `json:"name"`
	Version     string    `json:"version"`
	Publisher   string    `json:"publisher"`
	InstallPath string    `json:"install_path"`
	Source      string    `json:"source"` // 'registry', 'wmi', 'portable'
	SHA256Hash  string    `json:"sha256_hash,omitempty"`
}

// ProcessEntry is the agent's process data
type ProcessEntry struct {
	PID        uint32 `json:"pid"`
	Name       string `json:"name"`
	Executable string `json:"executable"`
}

// APIResponse is a standard response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
