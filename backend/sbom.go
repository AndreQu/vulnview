package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
)

// CycloneDX BOM Types - https://cyclonedx.org/specification/overview/
// Version 1.6 compliant structures

type CycloneDXBOM struct {
	BOMFormat    string                 `json:"bomFormat"`
	SpecVersion  string                 `json:"specVersion"`
	SerialNumber string                 `json:"serialNumber"`
	Version      int                    `json:"version"`
	Metadata     *CycloneDXMetadata     `json:"metadata,omitempty"`
	Components   []CycloneDXComponent   `json:"components,omitempty"`
	Dependencies []CycloneDXDependency  `json:"dependencies,omitempty"`
}

type CycloneDXMetadata struct {
	Timestamp  string              `json:"timestamp"`
	Tools      []CycloneDXTool     `json:"tools,omitempty"`
	Component  *CycloneDXComponent `json:"component,omitempty"`
}

type CycloneDXTool struct {
	Vendor  string `json:"vendor"`
	Name    string `json:"name"`
	Version string `json:"version"`
}

type CycloneDXComponent struct {
	Type            string                 `json:"type"`
	Name            string                 `json:"name"`
	Version         string                 `json:"version,omitempty"`
	Group           string                 `json:"group,omitempty"`
	Publisher       string                 `json:"publisher,omitempty"`
	Description     string                 `json:"description,omitempty"`
	Licenses        []CycloneDXLicense     `json:"licenses,omitempty"`
	PURL            string                 `json:"purl,omitempty"`
	CPE             string                 `json:"cpe,omitempty"`
	Hashes          []CycloneDXHash        `json:"hashes,omitempty"`
	Properties      []CycloneDXProperty    `json:"properties,omitempty"`
	BOMRef          string                 `json:"bom-ref,omitempty"`
}

type CycloneDXLicense struct {
	License *CycloneDXLicenseChoice `json:"license,omitempty"`
	Expression string              `json:"expression,omitempty"`
}

type CycloneDXLicenseChoice struct {
	ID   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}

type CycloneDXHash struct {
	Alg     string `json:"alg"`
	Content string `json:"content"`
}

type CycloneDXProperty struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type CycloneDXDependency struct {
	Ref       string   `json:"ref"`
	DependsOn []string `json:"dependsOn,omitempty"`
}

// sbomHandler generates CycloneDX SBOM for a device
func sbomHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	deviceID := chi.URLParam(r, "id")

	// Get device info
	var device Device
	err := db.QueryRow(ctx, `
		SELECT id, device_id, hostname, os_type, os_version, os_build, architecture
		FROM devices WHERE device_id = $1
	`, deviceID).Scan(&device.ID, &device.DeviceID, &device.Hostname, 
		&device.OsType, &device.OsVersion, &device.OsBuild, &device.Architecture)
	
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: "Device not found"})
		return
	}

	// Get software for device
	rows, err := db.Query(ctx, `
		SELECT name, version, publisher, install_path, source, cpe, sha256_hash, first_seen, last_seen
		FROM software
		WHERE device_id = $1
		ORDER BY name
	`, device.ID)
	if err != nil {
		render.JSON(w, r, APIResponse{Success: false, Error: err.Error()})
		return
	}
	defer rows.Close()

	var components []CycloneDXComponent
	var dependencies []CycloneDXDependency
	
	for rows.Next() {
		var sw Software
		var cpe, sha256 string
		err := rows.Scan(&sw.Name, &sw.Version, &sw.Publisher, &sw.InstallPath,
			&sw.Source, &cpe, &sha256, &sw.FirstSeen, &sw.LastSeen)
		if err != nil {
			continue
		}

		component := softwareToCycloneDXComponent(sw, cpe, sha256)
		components = append(components, component)
		
		// Add dependency reference
		dependencies = append(dependencies, CycloneDXDependency{
			Ref: component.BOMRef,
		})
	}

	// Generate BOM
	bom := generateCycloneDXBOM(device, components, dependencies)

	// Set headers for download
	w.Header().Set("Content-Type", "application/vnd.cyclonedx+json")
	w.Header().Set("Content-Disposition", "attachment; filename=\"sbom-"+deviceID+".json\"")
	
	// Encode and write
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	encoder.Encode(bom)
}

// softwareToCycloneDXComponent converts a Software entry to CycloneDX component
func softwareToCycloneDXComponent(sw Software, cpe, sha256 string) CycloneDXComponent {
	// Generate unique BOM reference
	bomRef := uuid.New().String()
	
	component := CycloneDXComponent{
		Type:      "application",
		Name:      sw.Name,
		Version:   sw.Version,
		Publisher: sw.Publisher,
		BOMRef:    bomRef,
	}

	// Set component type based on source
	switch sw.Source {
	case "registry", "wmi":
		component.Type = "application"
	case "portable":
		component.Type = "file"
	default:
		component.Type = "application"
	}

	// Add CPE if available
	if cpe != "" {
		component.CPE = cpe
	}

	// Add PURL (Package URL) - simplified
	if component.Publisher != "" && sw.Version != "" {
		component.PURL = generatePURL(sw)
	}

	// Add hash if available
	if sha256 != "" {
		component.Hashes = []CycloneDXHash{
			{Alg: "SHA-256", Content: sha256},
		}
	}

	// Add properties for metadata
	var properties []CycloneDXProperty
	if sw.InstallPath != "" {
		properties = append(properties, CycloneDXProperty{
			Name:  "install_path",
			Value: sw.InstallPath,
		})
	}
	if sw.Source != "" {
		properties = append(properties, CycloneDXProperty{
			Name:  "source",
			Value: sw.Source,
		})
	}
	component.Properties = properties

	return component
}

// generatePURL creates a Package URL for the component
func generatePURL(sw Software) string {
	// Simplified PURL generation
	// Format: pkg:generic/publisher/name@version
	if sw.Publisher == "" {
		return ""
	}
	return "pkg:generic/" + sw.Publisher + "/" + sw.Name + "@" + sw.Version
}

// generateCycloneDXBOM creates a complete CycloneDX BOM
func generateCycloneDXBOM(device Device, components []CycloneDXComponent, dependencies []CycloneDXDependency) CycloneDXBOM {
	now := time.Now().UTC().Format(time.RFC3339)
	
	bom := CycloneDXBOM{
		BOMFormat:    "CycloneDX",
		SpecVersion:  "1.6",
		SerialNumber: "urn:uuid:" + uuid.New().String(),
		Version:      1,
		Metadata: &CycloneDXMetadata{
			Timestamp: now,
			Tools: []CycloneDXTool{
				{
					Vendor:  "VulnView",
					Name:    "VulnView SBOM Generator",
					Version: "1.0.0",
				},
			},
			Component: &CycloneDXComponent{
				Type:        "device",
				Name:        device.Hostname,
				Version:     device.OsVersion,
				Description: device.OsType + " " + device.OsVersion + " (" + device.Architecture + ")",
			},
		},
		Components:   components,
		Dependencies: dependencies,
	}

	return bom
}
