//go:build windows

package main

import (
	"path/filepath"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows/registry"
)

// SoftwareInfo represents software found in registry
type SoftwareInfo struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Publisher   string `json:"publisher"`
	InstallPath string `json:"install_path"`
	Uninstall   string `json:"uninstall_string"`
	Source      string `json:"source"`
}

// ScanRegistry scans Windows registry for installed software
func ScanRegistry() ([]SoftwareInfo, error) {
	var software []SoftwareInfo

	// Scan HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
	keyPaths := []string{
		`SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`,
		`SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall`,
	}

	for _, keyPath := range keyPaths {
		k, err := registry.OpenKey(registry.LOCAL_MACHINE, keyPath, registry.ENUMERATE_SUB_KEYS|registry.QUERY_VALUE)
		if err != nil {
			continue // Skip if key doesn't exist
		}
		defer k.Close()

		subKeys, err := k.ReadSubKeyNames(-1)
		if err != nil {
			continue
		}

		for _, subKey := range subKeys {
			sw := readRegistrySoftware(keyPath, subKey)
			if sw != nil {
				software = append(software, *sw)
			}
		}
	}

	return software, nil
}

// readRegistrySoftware reads a single software entry from registry
func readRegistrySoftware(keyPath, subKey string) *SoftwareInfo {
	fullPath := filepath.Join(keyPath, subKey)
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, fullPath, registry.QUERY_VALUE)
	if err != nil {
		return nil
	}
	defer k.Close()

	// Skip entries without DisplayName
	displayName, _, err := k.GetStringValue("DisplayName")
	if err != nil || displayName == "" {
		return nil
	}

	sw := SoftwareInfo{
		Name:   displayName,
		Source: "registry",
	}

	// Get optional fields
	if val, _, err := k.GetStringValue("DisplayVersion"); err == nil {
		sw.Version = val
	}
	if val, _, err := k.GetStringValue("Publisher"); err == nil {
		sw.Publisher = val
	}
	if val, _, err := k.GetStringValue("InstallLocation"); err == nil {
		sw.InstallPath = val
	} else if val, _, err := k.GetStringValue("InstallDir"); err == nil {
		sw.InstallPath = val
	}
	if val, _, err := k.GetStringValue("UninstallString"); err == nil {
		sw.Uninstall = val
	}

	return &sw
}

// GetOSInfo retrieves Windows OS information
func GetOSInfo() (map[string]string, error) {
	info := make(map[string]string)

	// Open registry key for Windows version
	k, err := registry.OpenKey(registry.LOCAL_MACHINE,
		`SOFTWARE\Microsoft\Windows NT\CurrentVersion`, registry.QUERY_VALUE)
	if err != nil {
		return info, err
	}
	defer k.Close()

	if val, _, err := k.GetStringValue("ProductName"); err == nil {
		info["os_name"] = val
	}
	if val, _, err := k.GetStringValue("ReleaseId"); err == nil {
		info["os_version"] = val
	}
	if val, _, err := k.GetStringValue("CurrentBuild"); err == nil {
		info["os_build"] = val
	}
	if val, _, err := k.GetStringValue("DisplayVersion"); err == nil {
		info["display_version"] = val
	}

	return info, nil
}

// GetMachineGUID returns the unique machine identifier
func GetMachineGUID() (string, error) {
	k, err := registry.OpenKey(registry.LOCAL_MACHINE,
		`SOFTWARE\Microsoft\Cryptography`, registry.QUERY_VALUE)
	if err != nil {
		return "", err
	}
	defer k.Close()

	guid, _, err := k.GetStringValue("MachineGuid")
	if err != nil {
		return "", err
	}

	return guid, nil
}

// GetComputerName returns the computer hostname
func GetComputerName() string {
	var buf [256]uint16
	size := uint32(len(buf))

	// GetComputerNameW from kernel32
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	getComputerName := kernel32.NewProc("GetComputerNameW")

	r1, _, _ := getComputerName.Call(
		uintptr(unsafe.Pointer(&buf[0])),
		uintptr(unsafe.Pointer(&size)),
	)

	if r1 == 0 {
		return "unknown"
	}

	return syscall.UTF16ToString(buf[:])
}
