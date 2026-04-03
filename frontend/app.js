// VulnView Dashboard v3.0 - Mit CVE-Integration
// Apple Style, Dark Mode, CVE-Badges

const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8443';

// State
let devices = [];
let selectedDevice = null;
let currentFilter = 'all';
let refreshInterval = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const elements = {
  apiStatus: document.getElementById('apiStatus'),
  refreshBtn: document.getElementById('refreshBtn'),
  deviceSearch: document.getElementById('deviceSearch'),
  devicesTableBody: document.getElementById('devicesTableBody'),
  totalDevices: document.getElementById('totalDevices'),
  onlineDevices: document.getElementById('onlineDevices'),
  onlinePercent: document.getElementById('onlinePercent'),
  totalSoftware: document.getElementById('totalSoftware'),
  criticalCves: document.getElementById('criticalCves'),
  detailPanel: document.getElementById('detailPanel'),
  closeDetail: document.getElementById('closeDetail'),
  detailTitle: document.getElementById('detailTitle'),
  detailSubtitle: document.getElementById('detailSubtitle'),
  detailAvatar: document.getElementById('detailAvatar'),
  softwareList: document.getElementById('softwareList'),
  cveSummary: document.getElementById('cveSummary'),
  cveList: document.getElementById('cveList'),
  themeToggle: document.getElementById('themeToggle'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  detailTabs: document.querySelectorAll('.detail-tab')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDashboard();
  setupEventListeners();
  startAutoRefresh();
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function initDashboard() {
  checkApiStatus();
  loadDevices();
  loadVulnerabilityStats();
}

function setupEventListeners() {
  // Refresh
  elements.refreshBtn.addEventListener('click', () => {
    loadDevices();
    loadVulnerabilityStats();
  });

  // Search
  elements.deviceSearch.addEventListener('input', (e) => {
    filterDevices(e.target.value);
  });

  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Filter buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  // Detail tabs
  elements.detailTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      elements.detailTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });

  // Close detail
  elements.closeDetail.addEventListener('click', closeDetailPanel);
  elements.detailPanel.addEventListener('click', (e) => {
    if (e.target === elements.detailPanel) closeDetailPanel();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailPanel();
  });
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
}

function startAutoRefresh() {
  refreshInterval = setInterval(() => {
    loadDevices();
    loadVulnerabilityStats();
  }, 30000);
}

// API Functions
async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/health`);
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        setApiStatus(true, 'API verbunden');
        return;
      }
    }
    setApiStatus(false, 'API Fehler');
  } catch (error) {
    setApiStatus(false, 'Nicht verbunden');
  }
}

function setApiStatus(online, message) {
  elements.apiStatus.className = `status-pill ${online ? 'online' : 'offline'}`;
  elements.apiStatus.querySelector('.status-text').textContent = message;
}

async function loadVulnerabilityStats() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/vulnerabilities/stats`);
    if (!response.ok) return;
    
    const data = await response.json();
    if (data.success) {
      const critical = data.data.critical || 0;
      elements.criticalCves.textContent = critical;
      
      // Highlight if critical > 0
      const card = document.getElementById('criticalCard');
      if (critical > 0) {
        card.style.border = '1px solid #FF2D55';
      }
    }
  } catch (error) {
    console.error('Error loading vulnerability stats:', error);
  }
}

async function loadDevices() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/devices`);
    if (!response.ok) throw new Error('Failed');
    
    const data = await response.json();
    if (data.success) {
      devices = data.data || [];
      
      // Load CVE data for each device
      for (let device of devices) {
        device.vulnerabilities = await loadDeviceVulnerabilities(device.device_id);
      }
      
      applyFilter();
      updateStats();
    }
  } catch (error) {
    console.error('Error loading devices:', error);
    elements.devicesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-state">
          <p style="color: var(--danger)">Verbindung fehlgeschlagen</p>
        </td>
      </tr>
    `;
  }
}

async function loadDeviceVulnerabilities(deviceId) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/devices/${deviceId}/vulnerabilities`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

// Rendering
function renderDevices(deviceList) {
  if (deviceList.length === 0) {
    elements.devicesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-state">
          <p>Keine Geräte gefunden</p>
        </td>
      </tr>
    `;
    return;
  }

  elements.devicesTableBody.innerHTML = deviceList.map(device => {
    const isOnline = isDeviceOnline(device.last_seen);
    const lastSeen = formatLastSeen(device.last_seen);
    const osIcon = device.os === 'windows' ? '⊞' : '◉';
    
    // Count CVEs
    const vulns = device.vulnerabilities || [];
    const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulns.filter(v => v.severity === 'HIGH').length;
    const totalCves = vulns.length;
    
    let cveBadge = '';
    if (criticalCount > 0) {
      cveBadge = `<span class="cve-badge critical">${criticalCount} CRITICAL</span>`;
    } else if (highCount > 0) {
      cveBadge = `<span class="cve-badge high">${highCount} HIGH</span>`;
    } else if (totalCves > 0) {
      cveBadge = `<span class="cve-badge medium">${totalCves}</span>`;
    } else {
      cveBadge = `<span class="cve-badge none">0</span>`;
    }
    
    return `
      <tr onclick="showDeviceDetail('${device.device_id}')" style="cursor: pointer">
        <td>
          <div class="device-cell">
            <div class="device-icon">${osIcon}</div>
            <div>
              <div class="device-name">${escapeHtml(device.hostname)}</div>
              <div class="device-id">${device.device_id.substring(0, 8)}...</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 500; text-transform: capitalize">${escapeHtml(device.os_type || 'Unknown')}</div>
          <div style="font-size: 12px; color: var(--text-secondary)">${escapeHtml(device.os_version || '')}</div>
        </td>
        <td>${device.software_count || 0} Pakete</td>
        <td>${cveBadge}</td>
        <td>
          <span class="status-badge ${isOnline ? 'online' : 'offline'}">
            <span style="width: 6px; height: 6px; border-radius: 50%; display: inline-block; background: currentColor; margin-right: 6px"></span>
            ${isOnline ? 'Online' : 'Offline'}
          </span>
        </td>
        <td style="color: var(--text-secondary)">${lastSeen}</td>
      </tr>
    `;
  }).join('');
}

function showDeviceDetail(deviceId) {
  const device = devices.find(d => d.device_id === deviceId);
  if (!device) return;

  selectedDevice = device;
  
  elements.detailTitle.textContent = device.hostname;
  elements.detailSubtitle.textContent = `${device.os_type || 'Unknown'} • ${device.os_version || ''}`;
  elements.detailAvatar.textContent = device.os === 'windows' ? '⊞' : '◉';

  // Render Software
  renderSoftwareList(device.software || []);
  
  // Render CVEs
  renderCVEs(device.vulnerabilities || []);

  elements.detailPanel.classList.add('open');
}

function renderSoftwareList(software) {
  if (!software || software.length === 0) {
    elements.softwareList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 24px;">Keine Software-Daten</p>';
    return;
  }

  elements.softwareList.innerHTML = software.map(sw => `
    <div class="software-item">
      <div>
        <div class="software-name">${escapeHtml(sw.name)}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase">${sw.source}</div>
      </div>
      <div class="software-meta">
        <span class="software-version">${escapeHtml(sw.version)}</span>
      </div>
    </div>
  `).join('');
}

function renderCVEs(vulnerabilities) {
  // Summary
  const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
  const high = vulnerabilities.filter(v => v.severity === 'HIGH').length;
  const medium = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
  const low = vulnerabilities.filter(v => v.severity === 'LOW').length;
  
  elements.cveSummary.innerHTML = `
    <div class="cve-summary-item">
      <div class="cve-summary-count ${critical > 0 ? 'critical' : ''}">${critical}</div>
      <div class="cve-summary-label">Critical</div>
    </div>
    <div class="cve-summary-item">
      <div class="cve-summary-count ${high > 0 ? 'high' : ''}">${high}</div>
      <div class="cve-summary-label">High</div>
    </div>
    <div class="cve-summary-item">
      <div class="cve-summary-count ${medium > 0 ? 'medium' : ''}">${medium}</div>
      <div class="cve-summary-label">Medium</div>
    </div>
    <div class="cve-summary-item">
      <div class="cve-summary-count">${low}</div>
      <div class="cve-summary-label">Low</div>
    </div>
  `;

  // List
  if (vulnerabilities.length === 0) {
    elements.cveList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 24px;">Keine CVEs gefunden</p>';
    return;
  }

  elements.cveList.innerHTML = vulnerabilities.map(v => `
    <div class="cve-item ${v.severity?.toLowerCase() || 'low'}">
      <div class="cve-header">
        <span class="cve-id">${escapeHtml(v.cve_id)}</span>
        <span class="cve-badge ${v.severity?.toLowerCase() || 'low'}">${v.severity}</span>
      </div>
      <div class="cve-description">${escapeHtml(v.description?.substring(0, 150) || 'Keine Beschreibung')}...</div>
      <div class="cve-meta">
        <span class="cve-software">Betrifft: ${escapeHtml(v.software_name)} ${escapeHtml(v.software_version)}</span>
        <div class="cve-risk">
          <span class="risk-score ${v.severity?.toLowerCase() || 'low'}">Risk Score: ${Math.round(v.risk_score || 0)}</span>
          <span class="cve-badge ${v.severity?.toLowerCase() || 'low'}">CVSS: ${v.cvss_score}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function closeDetailPanel() {
  elements.detailPanel.classList.remove('open');
  selectedDevice = null;
}

// Filters
function applyFilter() {
  let filtered = devices;
  
  if (currentFilter === 'critical') {
    filtered = devices.filter(d => {
      const vulns = d.vulnerabilities || [];
      return vulns.some(v => ['CRITICAL', 'HIGH'].includes(v.severity));
    });
  } else if (currentFilter === 'offline') {
    filtered = devices.filter(d => !isDeviceOnline(d.last_seen));
  }
  
  renderDevices(filtered);
}

function filterDevices(searchTerm) {
  const term = searchTerm.toLowerCase();
  let filtered = devices.filter(d => 
    (d.hostname || '').toLowerCase().includes(term) ||
    (d.device_id || '').toLowerCase().includes(term)
  );
  
  if (currentFilter === 'critical') {
    filtered = filtered.filter(d => {
      const vulns = d.vulnerabilities || [];
      return vulns.some(v => ['CRITICAL', 'HIGH'].includes(v.severity));
    });
  } else if (currentFilter === 'offline') {
    filtered = filtered.filter(d => !isDeviceOnline(d.last_seen));
  }
  
  renderDevices(filtered);
}

// Stats
function updateStats() {
  const total = devices.length;
  const online = devices.filter(d => isDeviceOnline(d.last_seen)).length;
  const percent = total > 0 ? Math.round((online / total) * 100) : 0;
  
  elements.totalDevices.textContent = total;
  elements.onlineDevices.textContent = online;
  elements.onlinePercent.textContent = `${percent}% aktiv`;
  elements.totalSoftware.textContent = devices.reduce((sum, d) => sum + (d.software_count || 0), 0);
}

// Helpers
function isDeviceOnline(lastSeen) {
  if (!lastSeen) return false;
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  return (now - lastSeenDate) / 1000 / 60 < 5;
}

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Nie';
  
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Gerade';
  if (diffMins < 60) return `${diffMins} Min`;
  if (diffHours < 24) return `${diffHours} Std`;
  if (diffDays < 7) return `${diffDays} Tage`;
  
  return date.toLocaleDateString('de-DE');
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '-';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Expose
window.showDeviceDetail = showDeviceDetail;
