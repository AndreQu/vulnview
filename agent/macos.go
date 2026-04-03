//go:build darwin

package main

import (
	"bufio"
	"bytes"
	"encoding/xml"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"syscall"
	"time"
	"unsafe"
)

// SoftwareInfo represents software found on macOS
type SoftwareInfo struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Publisher   string `json:"publisher"`
	InstallPath string `json:"install_path"`
	BundleID    string `json:"bundle_id"`
	Source      string `json:"source"`
}

// ProcessInfo represents a running process on macOS
type ProcessInfo struct {
	PID        uint32 `json:"pid"`
	Name       string `json:"name"`
	Executable string `json:"executable"`
	User       string `json:"user"`
}

// ScanInstalledSoftware scans macOS for installed applications
func ScanInstalledSoftware() ([]SoftwareInfo, error) {
	var software []SoftwareInfo

	// Method 1: Scan /Applications folder
	apps := scanApplicationsFolder("/Applications")
	software = append(software, apps...)

	// Method 2: Scan ~/Applications (User apps)
	home, _ := os.UserHomeDir()
	userApps := scanApplicationsFolder(filepath.Join(home, "Applications"))
	software = append(software, userApps...)

	// Method 3: System Profiler (slower but comprehensive)
	// Uncomment if needed: systemApps := scanSystemProfiler()
	// software = append(software, systemApps...)

	return software, nil
}

// scanApplicationsFolder scans .app bundles in a directory
func scanApplicationsFolder(root string) []SoftwareInfo {
	var software []SoftwareInfo

	entries, err := os.ReadDir(root)
	if err != nil {
		return software
	}

	for _, entry := range entries {
		if !entry.IsDir() || !strings.HasSuffix(entry.Name(), ".app") {
			continue
		}

		appPath := filepath.Join(root, entry.Name())
		appInfo := parseAppBundle(appPath)
		if appInfo != nil {
			software = append(software, *appInfo)
		}
	}

	return software
}

// parseAppBundle extracts info from an .app bundle
func parseAppBundle(appPath string) *SoftwareInfo {
	infoPlistPath := filepath.Join(appPath, "Contents", "Info.plist")
	
	// Try to read Info.plist
	data, err := os.ReadFile(infoPlistPath)
	if err != nil {
		// Fallback: just use folder name
		name := strings.TrimSuffix(filepath.Base(appPath), ".app")
		return &SoftwareInfo{
			Name:        name,
			InstallPath: appPath,
			Source:      "applications",
		}
	}

	// Parse plist (simplified XML parsing)
	info := parsePlist(data)
	
	name := info["CFBundleDisplayName"]
	if name == "" {
		name = info["CFBundleName"]
	}
	if name == "" {
		name = strings.TrimSuffix(filepath.Base(appPath), ".app")
	}

	version := info["CFBundleShortVersionString"]
	if version == "" {
		version = info["CFBundleVersion"]
	}

	bundleID := info["CFBundleIdentifier"]
	
	// Try to get publisher from bundle ID
	publisher := ""
	if bundleID != "" {
		parts := strings.Split(bundleID, ".")
		if len(parts) >= 2 {
			publisher = parts[1]
		}
	}

	return &SoftwareInfo{
		Name:        name,
		Version:     version,
		Publisher:   publisher,
		InstallPath: appPath,
		BundleID:    bundleID,
		Source:      "applications",
	}
}

// parsePlist extracts key-value pairs from plist XML (simplified)
func parsePlist(data []byte) map[string]string {
	result := make(map[string]string)
	
	// Very simple regex-based parsing
	// In production, use a proper plist library
	keyPattern := regexp.MustCompile(`<key>([^<]+)</key>`)
	stringPattern := regexp.MustCompile(`<string>([^<]*)</string>`)
	
	keys := keyPattern.FindAllStringSubmatch(string(data), -1)
	strings := stringPattern.FindAllStringSubmatch(string(data), -1)
	
	for i := 0; i < len(keys) && i < len(strings); i++ {
		result[keys[i][1]] = strings[i][1]
	}
	
	return result
}

// GetRunningProcesses enumerates running processes on macOS
func GetRunningProcesses() ([]ProcessInfo, error) {
	var processes []ProcessInfo

	// Method: Use ps command
	cmd := exec.Command("ps", "aux")
	output, err := cmd.Output()
	if err != nil {
		// Fallback to syscall
		return getProcessesViaSyscall()
	}

	lines := strings.Split(string(output), "\n")
	for i, line := range lines {
		if i == 0 || strings.TrimSpace(line) == "" {
			continue // Skip header
		}

		fields := strings.Fields(line)
		if len(fields) < 11 {
			continue
		}

		// ps aux format: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
		user := fields[0]
		pidStr := fields[1]
		command := strings.Join(fields[10:], " ")

		var pid uint32
		fmt.Sscanf(pidStr, "%d", &pid)

		processes = append(processes, ProcessInfo{
			PID:        pid,
			Name:       filepath.Base(command),
			Executable: command,
			User:       user,
		})
	}

	return processes, nil
}

// getProcessesViaSyscall uses sysctl to get processes (fallback)
func getProcessesViaSyscall() ([]ProcessInfo, error) {
	var processes []ProcessInfo

	// Use KERN_PROC_ALL via syscall
	// This is a simplified version
	const (
		CTL_KERN    = 1
		KERN_PROC   = 14
		KERN_PROC_ALL = 0
	)

	// Get process count
	var mib []int32 = []int32{CTL_KERN, KERN_PROC, KERN_PROC_ALL, 0}
	
	// This requires more complex implementation with proper syscall
	// For MVP, return empty and rely on ps command
	
	return processes, fmt.Errorf("syscall method not fully implemented, use ps fallback")
}

// GetOSInfo retrieves macOS system information
func GetOSInfo() (map[string]string, error) {
	info := make(map[string]string)
	info["os_type"] = "darwin"
	
	// Get version from sw_vers
	cmd := exec.Command("sw_vers")
	output, err := cmd.Output()
	if err == nil {
		lines := strings.Split(string(output), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "ProductName:") {
				info["os_name"] = strings.TrimSpace(strings.TrimPrefix(line, "ProductName:"))
			}
			if strings.HasPrefix(line, "ProductVersion:") {
				info["os_version"] = strings.TrimSpace(strings.TrimPrefix(line, "ProductVersion:"))
			}
			if strings.HasPrefix(line, "BuildVersion:") {
				info["os_build"] = strings.TrimSpace(strings.TrimPrefix(line, "BuildVersion:"))
			}
		}
	}

	// Get architecture
	info["architecture"] = runtime.GOARCH
	
	// Get hostname
	hostname, _ := os.Hostname()
	info["hostname"] = hostname

	return info, nil
}

// GetMachineGUID returns unique machine identifier for macOS
func GetMachineGUID() (string, error) {
	// Method 1: Use ioreg to get IOPlatformUUID
	cmd := exec.Command("ioreg", "-rd1", "-c", "IOPlatformExpertDevice")
	output, err := cmd.Output()
	if err == nil {
		// Parse IOPlatformUUID from output
		re := regexp.MustCompile(`"IOPlatformUUID" = "([^"]+)"`)
		matches := re.FindStringSubmatch(string(output))
		if len(matches) > 1 {
			return matches[1], nil
		}
	}

	// Method 2: system_profiler
	cmd = exec.Command("system_profiler", "SPHardwareDataType")
	output, err = cmd.Output()
	if err == nil {
		re := regexp.MustCompile(`Hardware UUID: ([A-Fa-f0-9-]+)`)
		matches := re.FindStringSubmatch(string(output))
		if len(matches) > 1 {
			return matches[1], nil
		}
	}

	return "", fmt.Errorf("could not retrieve machine UUID")
}

// GetComputerName returns the computer name
func GetComputerName() string {
	// Try scutil
	cmd := exec.Command("scutil", "--get", "ComputerName")
	output, err := cmd.Output()
	if err == nil {
		return strings.TrimSpace(string(output))
	}

	// Fallback to uname
	cmd = exec.Command("uname", "-n")
	output, err = cmd.Output()
	if err == nil {
		return strings.TrimSpace(string(output))
	}

	return "unknown"
}

// GetSystemUptime returns system uptime in seconds
func GetSystemUptime() int {
	// Use sysctl
	var mib []int32 = []int32{1, 21} // CTL_KERN, KERN_BOOTTIME
	
	type timeval struct {
		sec  int64
		usec int64
	}
	
	var boottime timeval
	size := unsafe.Sizeof(boottime)
	
	_, _, errno := syscall.Syscall6(
		syscall.SYS___SYSCTL,
		uintptr(unsafe.Pointer(&mib[0])),
		uintptr(len(mib)),
		uintptr(unsafe.Pointer(&boottime)),
		uintptr(unsafe.Pointer(&size)),
		0,
		0,
	)
	
	if errno == 0 {
		now := time.Now().Unix()
		return int(now - boottime.sec)
	}
	
	// Fallback
	return 0
}

// scanSystemProfiler uses system_profiler to get software (slow but thorough)
func scanSystemProfiler() []SoftwareInfo {
	var software []SoftwareInfo
	
	cmd := exec.Command("system_profiler", "SPApplicationsDataType", "-xml")
	output, err := cmd.Output()
	if err != nil {
		return software
	}

	// Parse XML output
	// This is simplified - in production use proper XML parsing
	_ = output // Suppress unused variable warning
	
	return software
}
