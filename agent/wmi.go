//go:build windows

package main

import (
	"fmt"
	"os/exec"
	"strings"
)

// WMI queries for installed software using PowerShell
// This is simpler than using COM directly and doesn't require external deps

// WMISoftware represents software from WMI
type WMISoftware struct {
	Name        string
	Version     string
	Vendor      string
	InstallPath string
}

// QueryWMIInstalledSoftware queries WMI for installed software via PowerShell
func QueryWMIInstalledSoftware() ([]SoftwareInfo, error) {
	var software []SoftwareInfo

	// Use PowerShell to query WMI - simpler than COM and doesn't require external deps
	cmd := exec.Command("powershell.exe", "-Command",
		"Get-CimInstance -ClassName Win32_Product | Select-Object Name, Version, Vendor, InstallLocation | ConvertTo-Json -AsArray")
	
	output, err := cmd.Output()
	if err != nil {
		// WMI/Win32_Product may fail or be slow - return empty
		return software, fmt.Errorf("WMI query via PowerShell failed: %v", err)
	}

	// Parse JSON output (simplified)
	// In production, use proper JSON parsing
	outputStr := string(output)
	if strings.Contains(outputStr, "[") {
		// Has results - parse (simplified)
		// Full implementation would parse JSON properly
	}

	return software, nil
}

// GetSystemInfoWMI gets system info via WMI/PowerShell
func GetSystemInfoWMI() (map[string]string, error) {
	info := make(map[string]string)

	// Get OS info via PowerShell
	cmd := exec.Command("powershell.exe", "-Command",
		"Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, OSArchitecture | ConvertTo-Json")
	
	output, err := cmd.Output()
	if err == nil {
		outputStr := string(output)
		// Parse basic info (simplified)
		if strings.Contains(outputStr, "Caption") {
			info["source"] = "wmi"
		}
	}

	return info, nil
}
