CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    device_id TEXT NOT NULL UNIQUE,
    hostname TEXT NOT NULL,
    os_type TEXT NOT NULL DEFAULT '',
    os_version TEXT NOT NULL DEFAULT '',
    os_build TEXT NOT NULL DEFAULT '',
    architecture TEXT NOT NULL DEFAULT '',
    last_seen TIMESTAMPTZ,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT NOT NULL DEFAULT '',
    mac_address TEXT NOT NULL DEFAULT '',
    agent_version TEXT NOT NULL DEFAULT '',
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS software (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    publisher TEXT NOT NULL DEFAULT '',
    install_path TEXT NOT NULL DEFAULT '',
    install_date TIMESTAMPTZ,
    source TEXT NOT NULL DEFAULT '',
    cpe TEXT NOT NULL DEFAULT '',
    sha256_hash TEXT NOT NULL DEFAULT '',
    size_bytes BIGINT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (device_id, name, version, source)
);

CREATE TABLE IF NOT EXISTS heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uptime_seconds INTEGER NOT NULL DEFAULT 0,
    cpu_usage_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
    memory_usage_mb INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL DEFAULT 'full',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    software_count INTEGER NOT NULL DEFAULT 0,
    process_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT NOT NULL DEFAULT '',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS cves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cve_id TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    cvss_score DOUBLE PRECISION,
    cvss_vector TEXT,
    severity TEXT NOT NULL DEFAULT 'UNKNOWN',
    published_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    epss_score DOUBLE PRECISION,
    cwe_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "references" JSONB NOT NULL DEFAULT '[]'::jsonb,
    affected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS software_vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
    cve_id UUID NOT NULL REFERENCES cves(id) ON DELETE CASCADE,
    matched_version TEXT NOT NULL DEFAULT '',
    match_confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    first_detected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_detected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (software_id, cve_id)
);

CREATE TABLE IF NOT EXISTS nvd_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'completed',
    cves_added INTEGER NOT NULL DEFAULT 0,
    cves_updated INTEGER NOT NULL DEFAULT 0,
    api_response_time_ms INTEGER NOT NULL DEFAULT 0,
    error_message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_software_device_id ON software(device_id);
CREATE INDEX IF NOT EXISTS idx_software_name ON software(name);
CREATE INDEX IF NOT EXISTS idx_heartbeats_device_id ON heartbeats(device_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_timestamp ON heartbeats(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scans_device_id ON scans(device_id);
CREATE INDEX IF NOT EXISTS idx_cves_cve_id ON cves(cve_id);
CREATE INDEX IF NOT EXISTS idx_cves_severity ON cves(severity);
CREATE INDEX IF NOT EXISTS idx_cves_cvss_score ON cves(cvss_score DESC);
CREATE INDEX IF NOT EXISTS idx_cves_published_date ON cves(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_software_vulns_software_id ON software_vulnerabilities(software_id);
CREATE INDEX IF NOT EXISTS idx_software_vulns_cve_id ON software_vulnerabilities(cve_id);
