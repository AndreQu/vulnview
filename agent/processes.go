//go:build windows

package main

import (
	"fmt"
	"path/filepath"
	"syscall"
	"unsafe"
)

var (
	psapi    = syscall.NewLazyDLL("psapi.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")

	procEnumProcesses     = psapi.NewProc("EnumProcesses")
	procEnumProcessModules  = psapi.NewProc("EnumProcessModules")
	procGetModuleBaseNameW  = psapi.NewProc("GetModuleBaseNameW")
	procGetModuleFileNameExW = psapi.NewProc("GetModuleFileNameExW")

	procOpenProcess   = kernel32.NewProc("OpenProcess")
	procCloseHandle   = kernel32.NewProc("CloseHandle")
	procGetLastError  = kernel32.NewProc("GetLastError")
)

const (
	PROCESS_QUERY_INFORMATION = 0x0400
	PROCESS_VM_READ           = 0x0010
	MAX_PATH                  = 260
)

// ProcessInfo represents a running process
type ProcessInfo struct {
	PID        uint32 `json:"pid"`
	Name       string `json:"name"`
	Executable string `json:"executable"`
}

// GetRunningProcesses enumerates all running processes
func GetRunningProcesses() ([]ProcessInfo, error) {
	var processes []ProcessInfo

	// Allocate buffer for process IDs
	var cbNeeded uint32
	const maxPIDs = 1024
	pids := make([]uint32, maxPIDs)
	cb := uint32(len(pids)) * uint32(unsafe.Sizeof(pids[0]))

	// Enumerate processes
	ret, _, _ := procEnumProcesses.Call(
		uintptr(unsafe.Pointer(&pids[0])),
		uintptr(cb),
		uintptr(unsafe.Pointer(&cbNeeded)),
	)

	if ret == 0 {
		return processes, fmt.Errorf("EnumProcesses failed")
	}

	// Calculate number of processes returned
	numPIDs := cbNeeded / uint32(unsafe.Sizeof(pids[0]))

	// Get info for each process
	for i := uint32(0); i < numPIDs; i++ {
		pid := pids[i]
		if pid == 0 {
			continue
		}

		proc := getProcessInfo(pid)
		if proc != nil {
			processes = append(processes, *proc)
		}
	}

	return processes, nil
}

// getProcessInfo gets information about a single process
func getProcessInfo(pid uint32) *ProcessInfo {
	// Open process
	hProcess, _, _ := procOpenProcess.Call(
		uintptr(PROCESS_QUERY_INFORMATION|PROCESS_VM_READ),
		uintptr(0),
		uintptr(pid),
	)

	if hProcess == 0 {
		return nil
	}
	defer procCloseHandle.Call(hProcess)

	// Get module file name
	var filename [MAX_PATH]uint16
	ret, _, _ := procGetModuleFileNameExW.Call(
		hProcess,
		uintptr(0), // Get main module
		uintptr(unsafe.Pointer(&filename[0])),
		uintptr(MAX_PATH),
	)

	if ret == 0 {
		return nil
	}

	filenameStr := syscall.UTF16ToString(filename[:])
	name := filepath.Base(filenameStr)

	// Skip system processes without name
	if name == "" || name == "System Idle Process" {
		return nil
	}

	return &ProcessInfo{
		PID:        pid,
		Name:       name,
		Executable: filenameStr,
	}
}

// GetSystemUptime returns system uptime in seconds
func GetSystemUptime() int {
	// GetTickCount64 returns milliseconds since system start
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	getTickCount64 := kernel32.NewProc("GetTickCount64")

	ret, _, _ := getTickCount64.Call()
	milliseconds := uint64(ret)
	
	return int(milliseconds / 1000)
}
