package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// API handles all HTTP routes
func API(r chi.Router) {
	r.Get("/health", healthHandler)
	r.Get("/api/v1/devices", listDevicesHandler)
	r.Get("/api/v1/devices/{id}", getDeviceHandler)
	r.Get("/api/v1/devices/{id}/software", getDeviceSoftwareHandler)
	r.Post("/api/v1/heartbeat", heartbeatHandler)
	r.Post("/api/v1/scan", scanHandler)
}

// healthHandler returns service health status
func healthHandler(w http.ResponseWriter, r *http.Request) {
	render.JSON(w, r, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"status":    "healthy",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC(),
		},
	})
}

// listDevicesHandler returns all devices
func listDevicesHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	
	rows, err := db.Query(ctx, `
		SELECT id, device_id, hostname, os_type, os_version, last_seen, is_online, agent_version
		FROM devices
		ORDER BY last_seen DESC
	`)
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: err.Error()})
		return
	}
	defer rows.Close()

	var devices []map[string]interface{}
	for rows.Next() {
		var d Device
		err := rows.Scan(&d.ID, &d.DeviceID, &d.Hostname, &d.OsType, &d.OsVersion, 
			&d.LastSeen, &d.IsOnline, &d.AgentVersion)
		if err != nil {
			continue
		}
		devices = append(devices, map[string]interface{}{
			"id":             d.ID,
			"device_id":      d.DeviceID,
			"hostname":       d.Hostname,
			"os_type":        d.OsType,
			"os_version":     d.OsVersion,
			"last_seen":      d.LastSeen,
			"is_online":      d.IsOnline,
			"agent_version":  d.AgentVersion,
		})
	}

	render.JSON(w, r, APIResponse{Success: true, Data: devices})
}

// getDeviceHandler returns a single device by ID
func getDeviceHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	var d Device
	err := db.QueryRow(ctx, `
		SELECT id, device_id, hostname, os_type, os_version, os_build, architecture,
		       last_seen, first_seen, ip_address, mac_address, agent_version, is_online, metadata
		FROM devices WHERE device_id = $1
	`, id).Scan(&d.ID, &d.DeviceID, &d.Hostname, &d.OsType, &d.OsVersion, &d.OsBuild,
		&d.Architecture, &d.LastSeen, &d.FirstSeen, &d.IPAddress, &d.MacAddress,
		&d.AgentVersion, &d.IsOnline, &d.Metadata)

	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Device not found"})
		return
	}

	render.JSON(w, r, APIResponse{Success: true, Data: d})
}

// getDeviceSoftwareHandler returns software for a device
func getDeviceSoftwareHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	// First get device UUID
	var deviceUUID uuid.UUID
	err := db.QueryRow(ctx, `SELECT id FROM devices WHERE device_id = $1`, id).Scan(&deviceUUID)
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Device not found"})
		return
	}

	rows, err := db.Query(ctx, `
		SELECT name, version, publisher, install_path, source, first_seen, last_seen
		FROM software
		WHERE device_id = $1
		ORDER BY source, name
	`, deviceUUID)
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: err.Error()})
		return
	}
	defer rows.Close()

	var software []Software
	for rows.Next() {
		var s Software
		err := rows.Scan(&s.Name, &s.Version, &s.Publisher, &s.InstallPath, 
			&s.Source, &s.FirstSeen, &s.LastSeen)
		if err != nil {
			continue
		}
		software = append(software, s)
	}

	render.JSON(w, r, APIResponse{Success: true, Data: software})
}

// heartbeatHandler processes agent heartbeats
func heartbeatHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req HeartbeatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Invalid JSON: " + err.Error()})
		return
	}

	// Validate required fields
	if req.DeviceID == "" || req.Hostname == "" {
		render.JSON(w, r, APIResponse{Success: false, Error: "Missing required fields"})
		return
	}

	now := time.Now().UTC()

	// Insert or update device
	_, err := db.Exec(ctx, `
		INSERT INTO devices (device_id, hostname, os_type, os_version, architecture, 
		                     agent_version, last_seen, is_online, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
		ON CONFLICT (device_id) DO UPDATE SET
			hostname = EXCLUDED.hostname,
			os_version = EXCLUDED.os_version,
			agent_version = EXCLUDED.agent_version,
			last_seen = EXCLUDED.last_seen,
			is_online = true,
			updated_at = NOW()
	`, req.DeviceID, req.Hostname, req.OsType, req.OsVersion, req.Architecture,
		req.AgentVersion, now, req.Metadata)

	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Database error: " + err.Error()})
		return
	}

	// Get device UUID for heartbeat log
	var deviceUUID uuid.UUID
	err = db.QueryRow(ctx, `SELECT id FROM devices WHERE device_id = $1`, req.DeviceID).Scan(&deviceUUID)
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Failed to get device ID"})
		return
	}

	// Log heartbeat
	_, err = db.Exec(ctx, `
		INSERT INTO heartbeats (device_id, timestamp, uptime_seconds, cpu_usage_percent, memory_usage_mb, metadata)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, deviceUUID, now, req.UptimeSeconds, req.CPUUsagePercent, req.MemoryUsageMB, req.Metadata)

	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Failed to log heartbeat: " + err.Error()})
		return
	}

	render.JSON(w, r, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"timestamp": now,
			"status":    "acknowledged",
		},
	})
}

// scanHandler processes scan results from agents
func scanHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var result ScanResult
	if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Invalid JSON: " + err.Error()})
		return
	}

	if result.DeviceID == "" {
		render.JSON(w, r, APIResponse{Success: false, Error: "Missing device_id"})
		return
	}

	// Execute in transaction
	err := Transaction(ctx, func(tx pgx.Tx) error {
		// Get device UUID
		var deviceUUID uuid.UUID
		err := tx.QueryRow(ctx, `SELECT id FROM devices WHERE device_id = $1`, result.DeviceID).Scan(&deviceUUID)
		if err != nil {
			return err
		}

		// Create scan record
		scanID := uuid.New()
		_, err = tx.Exec(ctx, `
			INSERT INTO scans (id, device_id, scan_type, software_count, process_count, status)
			VALUES ($1, $2, $3, $4, $5, 'completed')
		`, scanID, deviceUUID, result.ScanType, len(result.Software), len(result.Processes))
		if err != nil {
			return err
		}

		// Insert or update software entries
		for _, sw := range result.Software {
			_, err = tx.Exec(ctx, `
				INSERT INTO software (device_id, name, version, publisher, install_path, source, last_seen)
				VALUES ($1, $2, $3, $4, $5, $6, NOW())
				ON CONFLICT (device_id, name, version, source) DO UPDATE SET
					publisher = EXCLUDED.publisher,
					install_path = EXCLUDED.install_path,
					last_seen = EXCLUDED.last_seen
			`, deviceUUID, sw.Name, sw.Version, sw.Publisher, sw.InstallPath, sw.Source)
			if err != nil {
				return err
			}
		}

		// Update device last_seen
		_, err = tx.Exec(ctx, `
			UPDATE devices SET last_seen = NOW(), updated_at = NOW() WHERE id = $1
		`, deviceUUID)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Database error: " + err.Error()})
		return
	}

	render.JSON(w, r, APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"software_processed": len(result.Software),
			"processes_reported": len(result.Processes),
		},
	})
}
