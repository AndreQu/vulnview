//go:build windows

package main

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/debug"
	"golang.org/x/sys/windows/svc/eventlog"
	"golang.org/x/sys/windows/svc/mgr"
)

const serviceName = "VulnViewAgent"
const serviceDisplay = "VulnView Agent"
const serviceDesc = "System inventory and vulnerability scanning agent"

var elog debug.Log

type vulnviewService struct{}

func (s *vulnviewService) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (ssec bool, errno uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}

	// Initialize device ID and client
	deviceID = getDeviceID()
	hostname = GetComputerName()

	var err error
	if *insecure || *certFile == "" {
		client = NewClientInsecure(*serverURL, deviceID)
	} else {
		client, err = NewClient(*serverURL, deviceID, *certFile, *keyFile, *caFile)
		if err != nil {
			elog.Error(1, fmt.Sprintf("Failed to create client: %v", err))
			return true, 1
		}
	}

	// Start the agent logic in a goroutine
	shutdown := make(chan struct{})
	go runAgent(shutdown)

	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}

	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				changes <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				elog.Info(1, "Service stopping")
				close(shutdown)
				changes <- svc.Status{State: svc.StopPending}
				return false, 0
			}
		}
	}
}

// runAgent runs the actual agent logic
func runAgent(shutdown <-chan struct{}) {
	// This integrates with the existing agent code
	// Get the main logic from the existing main.go
	runAgentLogic(shutdown)
}

// runAgentLogic contains the actual agent functionality
func runAgentLogic(shutdown <-chan struct{}) {
	// Initial heartbeat
	if err := sendHeartbeat(); err != nil {
		elog.Error(1, fmt.Sprintf("Initial heartbeat failed: %v", err))
	}

	// Initial scan
	if err := performScan("full"); err != nil {
		elog.Error(1, fmt.Sprintf("Initial scan failed: %v", err))
	}

	// Use existing ticker logic but listen for shutdown
	// This is a simplified version - integrate with actual agent
	select {
	case <-shutdown:
		return
	}
}

// Service management functions
func installService() error {
	exepath, err := os.Executable()
	if err != nil {
		return err
	}

	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := m.OpenService(serviceName)
	if err == nil {
		s.Close()
		return fmt.Errorf("service %s already exists", serviceName)
	}

	config := mgr.Config{
		DisplayName: serviceDisplay,
		Description: serviceDesc,
		StartType:   mgr.StartAutomatic,
		LogOnAs:     "LocalSystem",
	}

	s, err = m.CreateService(serviceName, exepath, config)
	if err != nil {
		return err
	}
	defer s.Close()

	// Create event log source
	if err := eventlog.InstallAsEventCreate(serviceName, eventlog.Error|eventlog.Warning|eventlog.Info); err != nil {
		log.Printf("Warning: Could not create event log: %v", err)
	}

	log.Printf("Service %s installed successfully", serviceName)
	return nil
}

func uninstallService() error {
	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := m.OpenService(serviceName)
	if err != nil {
		return fmt.Errorf("service %s does not exist", serviceName)
	}
	defer s.Close()

	if err := s.Delete(); err != nil {
		return err
	}

	eventlog.Remove(serviceName)

	log.Printf("Service %s uninstalled successfully", serviceName)
	return nil
}

func startServiceCmd() error {
	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := m.OpenService(serviceName)
	if err != nil {
		return fmt.Errorf("could not access service: %v", err)
	}
	defer s.Close()

	if err := s.Start(); err != nil {
		return fmt.Errorf("could not start service: %v", err)
	}

	log.Printf("Service %s started", serviceName)
	return nil
}

func stopServiceCmd() error {
	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := m.OpenService(serviceName)
	if err != nil {
		return fmt.Errorf("could not access service: %v", err)
	}
	defer s.Close()

	status, err := s.Control(svc.Stop)
	if err != nil {
		return fmt.Errorf("could not stop service: %v", err)
	}

	log.Printf("Service %s stopping (state: %d)", serviceName, status.State)
	return nil
}

// runAsService checks if we're running as a Windows service
func runAsService() bool {
	isService, err := svc.IsWindowsService()
	if err != nil {
		log.Fatalf("Failed to determine if running as service: %v", err)
	}
	return isService
}

// runService runs as a Windows service
func runService() {
	var err error
	elog, err = eventlog.Open(serviceName)
	if err != nil {
		// Fallback to console logging
		log.Println("Could not open event log, using console logging")
		elog = debug.Log{}
	} else {
		defer elog.Close()
	}

	elog.Info(1, fmt.Sprintf("Starting %s service", serviceDisplay))

	s := &vulnviewService{}
	if err := svc.Run(serviceName, s); err != nil {
		elog.Error(1, fmt.Sprintf("Service failed: %v", err))
		os.Exit(1)
	}
}
