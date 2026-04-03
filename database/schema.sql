-- VulnView Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants (for future multi-tenancy)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices table (endpoints)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    device_id VARCHAR(255) UNIQUE NOT NULL, -- Agent-generated unique ID
    hostname VARCHAR(255) NOT NULL,
    os_type VARCHAR(50) NOT NULL, -- 'windows', 'macos', 'linux'
    os_version VARCHAR(255),
    os_build VARCHAR(255),
    architecture VARCHAR(20), -- 'amd64', 'arm64'
    last_seen TIMESTAMP WITH TIME ZONE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    mac_address VARCHAR(17),
    agent_version VARCHAR(50),
    is_online BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Software inventory
CREATE TABLE software (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    version VARCHAR(255),
    publisher VARCHAR(500),
    install_path TEXT,
    install_date TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) NOT NULL, -- 'registry', 'wmi', 'process', 'dll', 'portable'
    cpe VARCHAR(500), -- Common Platform Enumeration identifier
    sha256_hash VARCHAR(64), -- For file-based detection
    size_bytes BIGINT,
    metadata JSONB DEFAULT '{}',
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, name, version, source)
);

-- Scans history
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL, -- 'full', 'delta', 'heartbeat'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    software_count INTEGER DEFAULT 0,
    process_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed'
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Vulnerabilities (CVEs)
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cve_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CVE-2021-44228'
    cve_data JSONB NOT NULL, -- Full CVE data from NVD
    cvss_score DECIMAL(3,1),
    cvss_vector VARCHAR(100),
    severity VARCHAR(20), -- 'critical', 'high', 'medium', 'low', 'none'
    description TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    modified_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Device-Vulnerability mapping
CREATE TABLE device_vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    software_id UUID REFERENCES software(id) ON DELETE SET NULL,
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'remediated', 'false_positive'
    risk_score INTEGER, -- Calculated score 1-100
    UNIQUE(device_id, vulnerability_id, software_id)
);

-- SBOM documents (CycloneDX format)
CREATE TABLE sbom_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
    format VARCHAR(50) DEFAULT 'cyclonedx', -- 'cyclonedx', 'spdx'
    format_version VARCHAR(20) DEFAULT '1.5',
    document JSONB NOT NULL, -- Full SBOM document
    component_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Heartbeat log
CREATE TABLE heartbeats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uptime_seconds INTEGER,
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- API Keys for authentication
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    scopes JSONB DEFAULT '["read"]',
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_devices_tenant_id ON devices(tenant_id);
CREATE INDEX idx_devices_last_seen ON devices(last_seen);
CREATE INDEX idx_software_device_id ON software(device_id);
CREATE INDEX idx_software_name ON software(name);
CREATE INDEX idx_software_cpe ON software(cpe);
CREATE INDEX idx_software_hash ON software(sha256_hash);
CREATE INDEX idx_scans_device_id ON scans(device_id);
CREATE INDEX idx_vulnerabilities_cve_id ON vulnerabilities(cve_id);
CREATE INDEX idx_device_vulns_device_id ON device_vulnerabilities(device_id);
CREATE INDEX idx_device_vulns_vuln_id ON device_vulnerabilities(vulnerability_id);
CREATE INDEX idx_heartbeats_device_id ON heartbeats(device_id);
CREATE INDEX idx_heartbeats_timestamp ON heartbeats(timestamp);

-- Default tenant for single-tenant mode
INSERT INTO tenants (name) VALUES ('Default Tenant');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON software
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
