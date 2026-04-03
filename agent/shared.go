// Shared code for both Windows and macOS
// +build !windows,!darwin

package main

import (
	"os"
)

// GetComputerName returns hostname (fallback)
func GetComputerName() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}

// GetMachineGUID returns machine identifier (fallback)
func GetMachineGUID() (string, error) {
	// Fallback implementation
	return "", nil
}

// GetOSInfo returns OS info (fallback)
func GetOSInfo() (map[string]string, error) {
	return make(map[string]string), nil
}

// GetSystemUptime returns uptime (fallback)
func GetSystemUptime() int {
	return 0
}
