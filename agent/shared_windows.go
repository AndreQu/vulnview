//go:build windows

package main

// Shared Windows code

import (
	"syscall"
	"unsafe"
)

// GetSystemUptime returns system uptime in seconds
func GetSystemUptime() int {
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	getTickCount64 := kernel32.NewProc("GetTickCount64")
	
	r1, _, _ := getTickCount64.Call()
	// Returns milliseconds, convert to seconds
	return int(r1 / 1000)
}
