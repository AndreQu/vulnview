CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    tenant_id TEXT,
    device_id TEXT NOT NULL UNIQUE,
    hostname TEXT NOT NULL,
    os_type TEXT NOT NULL DEFAULT '',
    os_version TEXT NOT NULL DEFAULT '',
    os_build TEXT NOT NULL DEFAULT '',
    architecture TEXT NOT NULL DEFAULT '',
    last_seen DATETIME,
    first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT NOT NULL DEFAULT '',
    mac_address TEXT NOT NULL DEFAULT '',
    agent_version TEXT NOT NULL DEFAULT '',
    is_online INTEGER NOT NULL DEFAULT 0,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS software (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    publisher TEXT NOT NULL DEFAULT '',
    install_path TEXT NOT NULL DEFAULT '',
    install_date DATETIME,
    source TEXT NOT NULL DEFAULT '',
    cpe TEXT NOT NULL DEFAULT '',
    sha256_hash TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    metadata TEXT NOT NULL DEFAULT '{}',
    first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (device_id, name, version, source)
);

CREATE TABLE IF NOT EXISTS heartbeats (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uptime_seconds INTEGER NOT NULL DEFAULT 0,
    cpu_usage_percent REAL NOT NULL DEFAULT 0,
    memory_usage_mb INTEGER NOT NULL DEFAULT 0,
    metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL DEFAULT 'full',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    software_count INTEGER NOT NULL DEFAULT 0,
    process_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT NOT NULL DEFAULT '',
    metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS cves (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cve_id TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    cvss_score REAL,
    cvss_vector TEXT,
    severity TEXT NOT NULL DEFAULT 'UNKNOWN',
    published_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    epss_score REAL,
    cwe_ids TEXT NOT NULL DEFAULT '[]',
    "references" TEXT NOT NULL DEFAULT '[]',
    affected_products TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS software_vulnerabilities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    software_id TEXT NOT NULL REFERENCES software(id) ON DELETE CASCADE,
    cve_id TEXT NOT NULL REFERENCES cves(id) ON DELETE CASCADE,
    matched_version TEXT NOT NULL DEFAULT '',
    match_confidence REAL NOT NULL DEFAULT 0,
    risk_score REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    first_detected DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_detected DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (software_id, cve_id)
);

CREATE TABLE IF NOT EXISTS nvd_sync_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    sync_type TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'completed',
    cves_added INTEGER NOT NULL DEFAULT 0,
    cves_updated INTEGER NOT NULL DEFAULT 0,
    api_response_time_ms INTEGER NOT NULL DEFAULT 0,
    error_message TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_software_device_id ON software(device_id);
CREATE INDEX IF NOT EXISTS idx_software_name ON software(name);
CREATE INDEX IF NOT EXISTS idx_heartbeats_device_id ON heartbeats(device_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_timestamp ON heartbeats(timestamp);
CREATE INDEX IF NOT EXISTS idx_scans_device_id ON scans(device_id);
CREATE INDEX IF NOT EXISTS idx_cves_cve_id ON cves(cve_id);
CREATE INDEX IF NOT EXISTS idx_cves_severity ON cves(severity);
CREATE INDEX IF NOT EXISTS idx_cves_cvss_score ON cves(cvss_score);
CREATE INDEX IF NOT EXISTS idx_cves_published_date ON cves(published_date);
CREATE INDEX IF NOT EXISTS idx_software_vulns_software_id ON software_vulnerabilities(software_id);
CREATE INDEX IF NOT EXISTS idx_software_vulns_cve_id ON software_vulnerabilities(cve_id);
