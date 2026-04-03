# VulnView - Endpoint Vulnerability Management MVP

## Projektübersicht

VulnView ist ein agent-basiertes Vulnerability-Management-System mit Runtime-SBOM für Windows und macOS.

## Monat 1 MVP Features

- [x] Windows-Agent in Go
- [x] Registry-Scan (HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall)
- [x] WMI-Abfrage für installierte Software
- [x] Prozess-Liste (EnumProcesses)
- [x] Heartbeat alle 60 Sekunden
- [x] mTLS-Kommunikation zum Backend
- [x] Ingestion-Service (Go)
- [x] PostgreSQL-Schema für Devices, Software, Scans

## Projektstruktur

```
projekt-vulnview/
├── agent/              # Windows Agent (Go)
│   ├── main.go
│   ├── registry.go     # Windows Registry Scanner
│   ├── wmi.go          # WMI Abfragen
│   ├── processes.go    # Prozess-Enumeration
│   └── client.go       # mTLS HTTP Client
├── backend/            # Ingestion Service (Go)
│   ├── main.go
│   ├── api.go          # REST API Endpoints
│   ├── db.go           # PostgreSQL Verbindung
│   └── models.go       # Datenbank-Models
├── database/           # SQL Schema
│   └── schema.sql
├── certs/              # mTLS Zertifikate (dev)
├── docker-compose.yml  # Lokale Entwicklung
└── README.md
```

## Schnellstart

### 1. Datenbank starten
```bash
docker-compose up -d postgres
```

### 2. Backend starten
```bash
cd backend
go mod init vulnview-backend
go mod tidy
go run .
```

### 3. Agent bauen (Windows)
```bash
cd agent
GOOS=windows GOARCH=amd64 go build -o vulnview-agent.exe
```

## API Endpoints

- `POST /api/v1/heartbeat` - Agent Heartbeat
- `POST /api/v1/scan` - Scan-Ergebnisse senden
- `GET /api/v1/devices` - Alle Geräte anzeigen
- `GET /api/v1/devices/:id/software` - Software-Inventar

## Stack

- **Agent:** Go 1.21+ (Windows API via syscall, WMI via wmi Paket)
- **Backend:** Go + Chi Router + PostgreSQL
- **Kommunikation:** mTLS (mutual TLS)
- **Datenbank:** PostgreSQL 15+
