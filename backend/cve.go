package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

const (
	NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0"
	NVD_API_KEY_HEADER = "apiKey"
	RATE_LIMIT_DELAY = 6 * time.Second // NVD rate limit: 5 requests per 30 seconds without key
)

// NVDClient handles communication with NVD APItype NVDClient struct {
	httpClient *http.Client
	apiKey     string
	baseURL    string
}

// NVDResponse represents the NVD API response
type NVDResponse struct {
	ResultsPerPage int           `json:"resultsPerPage"`
	StartIndex     int           `json:"startIndex"`
	TotalResults   int           `json:"totalResults"`
	Vulnerabilities []NVDVulnItem `json:"vulnerabilities"`
}

// NVDVulnItem represents a single vulnerability item
type NVDVulnItem struct {
	CVE NVDVulnDetail `json:"cve"`
}

// NVDVulnDetail contains CVE details
type NVDVulnDetail struct {
	ID               string           `json:"id"`
	SourceIdentifier string         `json:"sourceIdentifier"`
	Published        string           `json:"published"`
	LastModified     string           `json:"lastModified"`
	VulnStatus       string           `json:"vulnStatus"`
	Descriptions     []NVDBilingualText `json:"descriptions"`
	Metrics          NVDCVSSMetrics   `json:"metrics"`
	Configurations   []NVDConfig      `json:"configurations,omitempty"`
	References       []NVDReference   `json:"references"`
	Weaknesses       []NVDWeakness    `json:"weaknesses,omitempty"`
}

// NVDBilingualText for descriptions
type NVDBilingualText struct {
	Lang  string `json:"lang"`
	Value string `json:"value"`
}

// NVDCVSSMetrics contains CVSS scores
type NVDCVSSMetrics struct {
	CVSSDataV31 []NVDCVSSData `json:"cvssMetricV31,omitempty"`
	CVSSDataV30 []NVDCVSSData `json:"cvssMetricV30,omitempty"`
	CVSSDataV2  []NVDCVSSData `json:"cvssMetricV2,omitempty"`
}

// NVDCVSSData contains CVSS data
type NVDCVSSData struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	CVSSData struct {
		Version        string  `json:"version"`
		VectorString   string  `json:"vectorString"`
		BaseScore      float64 `json:"baseScore"`
		BaseSeverity   string  `json:"baseSeverity"`
		Exploitability float64 `json:"exploitabilityScore,omitempty"`
		ImpactScore    float64 `json:"impactScore,omitempty"`
	} `json:"cvssData"`
}

// NVDConfig contains CPE configurations
type NVDConfig struct {
	Nodes []NVDConfigNode `json:"nodes"`
}

// NVDConfigNode represents CPE nodes
type NVDConfigNode struct {
	Operator string    `json:"operator"`
	Negate  bool      `json:"negate"`
	CPEMatch []NVDCPEMatch `json:"cpeMatch"`
}

// NVDCPEMatch represents CPE match criteria
type NVDCPEMatch struct {
	Vulnerable            bool   `json:"vulnerable"`
	Criteria               string `json:"criteria"`
	MatchCriteriaID        string `json:"matchCriteriaId"`
	VersionStartIncluding  string `json:"versionStartIncluding,omitempty"`
	VersionEndExcluding    string `json:"versionEndExcluding,omitempty"`
}

// NVDReference contains reference URLs
type NVDReference struct {
	URL    string   `json:"url"`
	Source string   `json:"source"`
	Tags   []string `json:"tags,omitempty"`
}

// NVDWeakness contains CWE information
type NVDWeakness struct {
	Source      string   `json:"source"`
	Type        string   `json:"type"`
	Description []NVDBilingualText `json:"description"`
}

// NewNVDClient creates a new NVD API client
func NewNVDClient(apiKey string) *NVDClient {
	return &NVDClient{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		apiKey:  apiKey,
		baseURL: NVD_API_BASE,
	}
}

// FetchCVEs fetches CVEs from NVD with pagination
func (c *NVDClient) FetchCVEs(ctx context.Context, startIndex int, resultsPerPage int) (*NVDResponse, error) {
	params := url.Values{}
	params.Set("startIndex", strconv.Itoa(startIndex))
	params.Set("resultsPerPage", strconv.Itoa(resultsPerPage))
	
	// Add date filter for recent CVEs (last 120 days)
	startDate := time.Now().UTC().AddDate(0, 0, -120).Format("2006-01-02T15:04:05.000")
	params.Set("pubStartDate", startDate+"-00:00")
	
	reqURL := fmt.Sprintf("%s?%s", c.baseURL, params.Encode())
	
	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("creating request: %w", err)
	}
	
	if c.apiKey != "" {
		req.Header.Set(NVD_API_KEY_HEADER, c.apiKey)
	}
	req.Header.Set("Accept", "application/json")
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("NVD API returned %d: %s", resp.StatusCode, string(body))
	}
	
	var nvdResp NVDResponse
	if err := json.NewDecoder(resp.Body).Decode(&nvdResp); err != nil {
		return nil, fmt.Errorf("decoding response: %w", err)
	}
	
	return &nvdResp, nil
}

// FetchAllCVEs fetches all CVEs incrementally
func (c *NVDClient) FetchAllCVEs(ctx context.Context, maxResults int) ([]NVDVulnItem, error) {
	var allItems []NVDVulnItem
	startIndex := 0
	resultsPerPage := 2000 // Maximum allowed by NVD
	
	for {
		resp, err := c.FetchCVEs(ctx, startIndex, resultsPerPage)
		if err != nil {
			return nil, err
		}
		
		allItems = append(allItems, resp.Vulnerabilities...)
		
		// Check if we've fetched all results
		if startIndex+len(resp.Vulnerabilities) >= resp.TotalResults {
			break
		}
		
		// Check max results limit
		if maxResults > 0 && len(allItems) >= maxResults {
			allItems = allItems[:maxResults]
			break
		}
		
		startIndex += len(resp.Vulnerabilities)
		
		// Rate limiting
		if c.apiKey == "" {
			time.Sleep(RATE_LIMIT_DELAY)
		} else {
			time.Sleep(time.Second) // With API key, shorter delay
		}
	}
	
	return allItems, nil
}

// StoreCVEs stores CVEs in the database
func StoreCVEs(ctx context.Context, db *pgx.Conn, items []NVDVulnItem) error {
	batch := &pgx.Batch{}
	
	for _, item := range items {
		cve := item.CVE
		
		// Extract description
		description := ""
		for _, d := range cve.Descriptions {
			if d.Lang == "en" {
				description = d.Value
				break
			}
		}
		
		// Extract CVSS data (prefer v3.1, then v3.0, then v2)
		var cvssScore float64
		var cvssVector string
		var severity string
		
		if len(cve.Metrics.CVSSDataV31) > 0 {
			cvssScore = cve.Metrics.CVSSDataV31[0].CVSSData.BaseScore
			cvssVector = cve.Metrics.CVSSDataV31[0].CVSSData.VectorString
			severity = cve.Metrics.CVSSDataV31[0].CVSSData.BaseSeverity
		} else if len(cve.Metrics.CVSSDataV30) > 0 {
			cvssScore = cve.Metrics.CVSSDataV30[0].CVSSData.BaseScore
			cvssVector = cve.Metrics.CVSSDataV30[0].CVSSData.VectorString
			severity = cve.Metrics.CVSSDataV30[0].CVSSData.BaseSeverity
		} else if len(cve.Metrics.CVSSDataV2) > 0 {
			cvssScore = cve.Metrics.CVSSDataV2[0].CVSSData.BaseScore
			cvssVector = cve.Metrics.CVSSDataV2[0].CVSSData.VectorString
		}
		
		// Parse dates
		published, _ := time.Parse(time.RFC3339, cve.Published)
		lastModified, _ := time.Parse(time.RFC3339, cve.LastModified)
		
		// Extract CWEs
		var cweIDs []string
		for _, w := range cve.Weaknesses {
			for _, d := range w.Description {
				if d.Lang == "en" {
					cweIDs = append(cweIDs, d.Value)
				}
			}
		}
		
		// Extract references
		refsJSON, _ := json.Marshal(cve.References)
		
		// Extract affected products from configurations
		var affectedProducts []map[string]interface{}
		for _, config := range cve.Configurations {
			for _, node := range config.Nodes {
				for _, match := range node.CPEMatch {
					affectedProducts = append(affectedProducts, map[string]interface{}{
						"criteria":               match.Criteria,
						"vulnerable":             match.Vulnerable,
						"versionStartIncluding":  match.VersionStartIncluding,
						"versionEndExcluding":    match.VersionEndExcluding,
					})
				}
			}
		}
		productsJSON, _ := json.Marshal(affectedProducts)
		
		batch.Queue(`
			INSERT INTO cves (
				cve_id, description, cvss_score, cvss_vector, severity,
				published_date, last_modified, cwe_ids, references, affected_products
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			ON CONFLICT (cve_id) DO UPDATE SET
				description = EXCLUDED.description,
				cvss_score = EXCLUDED.cvss_score,
				cvss_vector = EXCLUDED.cvss_vector,
				severity = EXCLUDED.severity,
				last_modified = EXCLUDED.last_modified,
				cwe_ids = EXCLUDED.cwe_ids,
				references = EXCLUDED.references,
				affected_products = EXCLUDED.affected_products,
				updated_at = NOW()
		`,
			cve.ID, description, cvssScore, cvssVector, severity,
			published, lastModified, cweIDs, refsJSON, productsJSON,
		)
	}
	
	results := db.SendBatch(ctx, batch)
	defer results.Close()
	
	_, err := results.Exec()
	if err != nil {
		return fmt.Errorf("executing batch: %w", err)
	}
	
	return nil
}

// SyncCVESyncLog logs a sync operation
func SyncCVESyncLog(ctx context.Context, db *pgx.Conn, syncType string, cvesAdded, cvesUpdated int, duration time.Duration, err error) error {
	status := "completed"
	errMsg := ""
	if err != nil {
		status = "failed"
		errMsg = err.Error()
	}
	
	_, dbErr := db.Exec(ctx, `
		INSERT INTO nvd_sync_log (sync_type, status, cves_added, cves_updated, api_response_time_ms, error_message)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, syncType, status, cvesAdded, cvesUpdated, int(duration.Milliseconds()), errMsg)
	
	return dbErr
}

// GetCVEStats returns statistics about CVEs
func GetCVEStats(ctx context.Context, db *pgx.Conn) (map[string]interface{}, error) {
	var total, critical, high, medium, low int
	err := db.QueryRow(ctx, `
		SELECT 
			COUNT(*),
			COUNT(*) FILTER (WHERE severity = 'CRITICAL'),
			COUNT(*) FILTER (WHERE severity = 'HIGH'),
			COUNT(*) FILTER (WHERE severity = 'MEDIUM'),
			COUNT(*) FILTER (WHERE severity = 'LOW')
		FROM cves
	`).Scan(&total, &critical, &high, &medium, &low)
	
	if err != nil {
		return nil, err
	}
	
	return map[string]interface{}{
		"total":    total,
		"critical": critical,
		"high":     high,
		"medium":   medium,
		"low":      low,
	}, nil
}

// MatchSoftwareToCVEs attempts to match software against CVE CPEs
func MatchSoftwareToCVEs(ctx context.Context, db *pgx.Conn, softwareID uuid.UUID, softwareName, softwareVersion string) error {
	// This is a simplified matching - in production you'd use proper CPE matching
	// with version range comparison
	
	// Get CVEs that might match this software
	rows, err := db.Query(ctx, `
		SELECT id FROM cves 
		WHERE affected_products @> $1::jsonb
		   OR description ILIKE $2
	`, 
		fmt.Sprintf(`[{"criteria": "%%%s%%"}]`, softwareName),
		"%"+softwareName+"%",
	)
	if err != nil {
		return err
	}
	defer rows.Close()
	
	for rows.Next() {
		var cveID uuid.UUID
		if err := rows.Scan(&cveID); err != nil {
			continue
		}
		
		// Check if match already exists
		var exists bool
		err := db.QueryRow(ctx, `
			SELECT EXISTS(SELECT 1 FROM software_vulnerabilities WHERE software_id = $1 AND cve_id = $2)
		`, softwareID, cveID).Scan(&exists)
		if err != nil || exists {
			continue
		}
		
		// Get CVE details for risk calculation
		var cvssScore float64
		var epssScore float64
		err = db.QueryRow(ctx, `
			SELECT COALESCE(cvss_score, 0), COALESCE(epss_score, 0) FROM cves WHERE id = $1
		`, cveID).Scan(&cvssScore, &epssScore)
		if err != nil {
			continue
		}
		
		// Calculate risk score
		riskScore := cvssScore * 10 * epssScore
		
		// Insert match
		_, err = db.Exec(ctx, `
			INSERT INTO software_vulnerabilities (software_id, cve_id, matched_version, match_confidence, risk_score)
			VALUES ($1, $2, $3, $4, $5)
		`, softwareID, cveID, softwareVersion, 0.7, riskScore)
		if err != nil {
			// Log but continue
			continue
		}
	}
	
	return nil
}
