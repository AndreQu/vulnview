-- CVE Database Schema Extension
-- NVD API 2.0 Integration

-- CVEs table from NVD
CREATE TABLE cves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cve_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., CVE-2024-1234
    description TEXT,
    description_de TEXT,  -- German translation
    cvss_score DECIMAL(3,1),  -- CVSS v3.1 Base Score (0.0-10.0)
    cvss_vector VARCHAR(100),  -- CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    severity VARCHAR(10) CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE')),
    published_date TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE,
    epss_score DECIMAL(5,4),  -- EPSS 0.0000-1.0000 (Exploit Prediction)
    epss_percentile DECIMAL(5,4),  -- EPSS percentile
    cwe_ids TEXT[],  -- Common Weakness Enumeration IDs
    references JSONB DEFAULT '[]',  -- Array of reference URLs
    affected_products JSONB DEFAULT '[]',  -- CPE matches
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Software-CVE matching table
CREATE TABLE software_vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_id UUID NOT NULL REFERENCES software(id) ON DELETE CASCADE,
    cve_id UUID NOT NULL REFERENCES cves(id) ON DELETE CASCADE,
    matched_version VARCHAR(50),  -- The version that was matched
    match_confidence DECIMAL(3,2),  -- 0.00-1.00 fuzzy matching confidence
    risk_score DECIMAL(5,2),  -- Calculated: CVSS * EPSS * Asset_Criticality (0-100)
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'remediated', 'false_positive', 'accepted')),
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remediated_at TIMESTAMP WITH TIME ZONE,
    remediated_by UUID REFERENCES devices(id),
    notes TEXT,
    UNIQUE(software_id, cve_id)
);

-- CPE (Common Platform Enumeration) cache
CREATE TABLE cpe_dictionary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpe_23_uri VARCHAR(500) UNIQUE NOT NULL,  -- cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*
    vendor VARCHAR(255),
    product VARCHAR(255),
    version VARCHAR(100),
    update_version VARCHAR(100),
    edition VARCHAR(100),
    language VARCHAR(50),
    sw_edition VARCHAR(100),
    target_sw VARCHAR(100),
    target_hw VARCHAR(100),
    other VARCHAR(100),
    deprecated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EPSS scores cache (updated daily)
CREATE TABLE epss_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cve_id VARCHAR(20) UNIQUE NOT NULL REFERENCES cves(cve_id),
    score DECIMAL(5,4) NOT NULL,  -- 0.0000-1.0000
    percentile DECIMAL(5,4),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync log for NVD updates
CREATE TABLE nvd_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type VARCHAR(50) NOT NULL,  -- 'full', 'delta', 'manual'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    cves_added INTEGER DEFAULT 0,
    cves_updated INTEGER DEFAULT 0,
    cves_processed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error_message TEXT,
    api_response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_cves_cve_id ON cves(cve_id);
CREATE INDEX idx_cves_severity ON cves(severity);
CREATE INDEX idx_cves_cvss_score ON cves(cvss_score DESC);
CREATE INDEX idx_cves_published_date ON cves(published_date DESC);
CREATE INDEX idx_software_vulns_software ON software_vulnerabilities(software_id);
CREATE INDEX idx_software_vulns_cve ON software_vulnerabilities(cve_id);
CREATE INDEX idx_software_vulns_status ON software_vulnerabilities(status);
CREATE INDEX idx_software_vulns_risk ON software_vulnerabilities(risk_score DESC);
CREATE INDEX idx_cpe_vendor ON cpe_dictionary(vendor);
CREATE INDEX idx_cpe_product ON cpe_dictionary(product);
CREATE INDEX idx_cpe_uri ON cpe_dictionary(cpe_23_uri);

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score(
    cvss DECIMAL(3,1),
    epss DECIMAL(5,4),
    criticality DECIMAL(3,2) DEFAULT 1.0
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
    -- Normalize inputs
    IF cvss IS NULL THEN cvss := 0; END IF;
    IF epss IS NULL THEN epss := 0; END IF;
    
    -- Calculate risk score (0-100)
    RETURN ROUND((cvss * 10) * epss * criticality, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get severity from CVSS score
CREATE OR REPLACE FUNCTION cvss_to_severity(cvss DECIMAL(3,1))
RETURNS VARCHAR(10) AS $$
BEGIN
    IF cvss >= 9.0 THEN RETURN 'CRITICAL';
    ELSIF cvss >= 7.0 THEN RETURN 'HIGH';
    ELSIF cvss >= 4.0 THEN RETURN 'MEDIUM';
    ELSIF cvss > 0 THEN RETURN 'LOW';
    ELSE RETURN 'NONE';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate severity on insert/update
CREATE OR REPLACE FUNCTION update_cve_severity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cvss_score IS NOT NULL THEN
        NEW.severity := cvss_to_severity(NEW.cvss_score);
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_cve_severity
    BEFORE INSERT OR UPDATE ON cves
    FOR EACH ROW
    EXECUTE FUNCTION update_cve_severity();

-- Views for common queries
CREATE VIEW v_critical_vulnerabilities AS
SELECT 
    sv.id,
    sv.software_id,
    s.name as software_name,
    s.version as software_version,
    sv.cve_id,
    c.cve_id as cve_number,
    c.description,
    c.cvss_score,
    c.severity,
    c.epss_score,
    sv.risk_score,
    sv.status,
    sv.first_detected,
    d.hostname,
    d.device_id
FROM software_vulnerabilities sv
JOIN cves c ON sv.cve_id = c.id
JOIN software s ON sv.software_id = s.id
JOIN devices d ON s.device_id = d.id
WHERE c.severity IN ('CRITICAL', 'HIGH')
  AND sv.status = 'open'
ORDER BY sv.risk_score DESC;

CREATE VIEW v_vulnerability_stats AS
SELECT 
    COUNT(*) FILTER (WHERE c.severity = 'CRITICAL') as critical_count,
    COUNT(*) FILTER (WHERE c.severity = 'HIGH') as high_count,
    COUNT(*) FILTER (WHERE c.severity = 'MEDIUM') as medium_count,
    COUNT(*) FILTER (WHERE c.severity = 'LOW') as low_count,
    COUNT(*) as total_count,
    AVG(sv.risk_score)::DECIMAL(5,2) as avg_risk_score,
    COUNT(DISTINCT s.device_id) as affected_devices
FROM software_vulnerabilities sv
JOIN cves c ON sv.cve_id = c.id
JOIN software s ON sv.software_id = s.id
WHERE sv.status = 'open';

COMMENT ON TABLE cves IS 'CVE entries from NVD (National Vulnerability Database)';
COMMENT ON TABLE software_vulnerabilities IS 'Matches between discovered software and CVEs';
COMMENT ON TABLE cpe_dictionary IS 'CPE 2.3 dictionary for software matching';
COMMENT ON TABLE epss_scores IS 'EPSS (Exploit Prediction Scoring System) scores';
