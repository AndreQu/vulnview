// VulnView Dashboard v2.0 - Apple Style
// Clean, minimalist, with animations

const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8443';

// State
let devices = [];
let selectedDevice = null;
let refreshInterval = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const elements = {
  app: document.getElementById('app'),
  apiStatus: document.getElementById('apiStatus'),
  refreshBtn: document.getElementById('refreshBtn'),
  deviceSearch: document.getElementById('deviceSearch'),
  devicesTableBody: document.getElementById('devicesTableBody'),
  totalDevices: document.getElementById('totalDevices'),
  onlineDevices: document.getElementById('onlineDevices'),
  onlinePercent: document.getElementById('onlinePercent'),
  totalSoftware: document.getElementById('totalSoftware'),
  riskScore: document.getElementById('riskScore'),
  detailPanel: document.getElementById('detailPanel'),
  closeDetail: document.getElementById('closeDetail'),
  detailTitle: document.getElementById('detailTitle'),
  detailSubtitle: document.getElementById('detailSubtitle'),
  detailAvatar: document.getElementById('detailAvatar'),
  deviceInfo: document.getElementById('deviceInfo'),
  softwareList: document.getElementById('softwareList'),
  themeToggle: document.getElementById('themeToggle'),
  navItems: document.querySelectorAll('.nav-item')
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
}

function setupEventListeners() {
  // Refresh
  elements.refreshBtn.addEventListener('click', () => {
    loadDevices();
  });

  // Search
  elements.deviceSearch.addEventListener('input', (e) => {
    filterDevices(e.target.value);
  });

  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);

  // Close detail panel
  elements.closeDetail.addEventListener('click', closeDetailPanel);
  elements.detailPanel.addEventListener('click', (e) => {
    if (e.target === elements.detailPanel) closeDetailPanel();
  });

  // Navigation
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      elements.navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
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

async function loadDevices() {
  try {
    const response = await fetch(`${API_BASE}/api/v1/devices`);
    if (!response.ok) throw new Error('Failed to load');
    
    const data = await response.json();
    if (data.success) {
      devices = data.data || [];
      renderDevices(devices);
      updateStats();
    }
  } catch (error) {
    elements.devicesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-state">
          <p style="color: var(--danger)">Verbindung fehlgeschlagen</p>
          <p style="font-size: 13px; margin-top: 8px;">Prüfe ob das Backend läuft unter ${API_BASE}</p>
        </td>
      </tr>
    `;
  }
}

async function loadDeviceSoftware(deviceId) {
  elements.softwareList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div></div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/v1/devices/${deviceId}/software`);
    if (!response.ok) throw new Error('Failed');
    
    const data = await response.json();
    if (data.success) {
      renderSoftware(data.data || []);
    }
  } catch (error) {
    elements.softwareList.innerHTML = `
      <div class="loading-state">
        <p>Fehler beim Laden</p>
      </div>
    `;
  }
}

// Rendering
function renderDevices(deviceList) {
  if (deviceList.length === 0) {
    elements.devicesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading-state">
          <p>Keine Geräte gefunden</p>
          <p style="font-size: 13px; margin-top: 8px;">Starten Sie einen Agent um Daten zu senden</p>
        </td>
      </tr>
    `;
    return;
  }

  elements.devicesTableBody.innerHTML = deviceList.map(device => {
    const isOnline = isDeviceOnline(device.last_seen);
    const lastSeen = formatLastSeen(device.last_seen);
    const osIcon = getOSIcon(device.os_type);
    
    return `
      <tr onclick="showDeviceDetail('${device.device_id}')" style="cursor: pointer">
        <td>
          <div class="device-cell">
            <div class="device-icon">${osIcon}</div>
            <div class="device-info">
              <span class="device-name">${escapeHtml(device.hostname)}</span>
              <span class="device-id">${device.device_id.substring(0, 8)}...</span>
            </div>
          </div>
        </td>
        <td>
          <span style="text-transform: capitalize">${escapeHtml(device.os_type || 'unknown')}</span>
          <span style="color: var(--text-secondary); font-size: 13px; display: block; margin-top: 2px">
            ${escapeHtml(device.os_version || '')}
          </span>
        </td>
        <td>${escapeHtml(device.agent_version || '-')}</td>
        <td>
          <span class="status-badge ${isOnline ? 'online' : 'offline'}">
            <span class="status-dot" style="width: 6px; height: 6px; border-radius: 50%; display: inline-block; background: currentColor; margin-right: 6px"></span>
            ${isOnline ? 'Online' : 'Offline'}
          </span>
        </td>
        <td style="color: var(--text-secondary)">${lastSeen}</td>
      </tr>
    `;
  }).join('');
}

function renderSoftware(softwareList) {
  if (softwareList.length === 0) {
    elements.softwareList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 24px;">Keine Software-Daten</p>';
    return;
  }

  // Group by source
  const bySource = softwareList.reduce((acc, sw) => {
    const source = sw.source || 'unknown';
    if (!acc[source]) acc[source] = [];
    acc[source].push(sw);
    return acc;
  }, {});

  let html = '';
  for (const [source, items] of Object.entries(bySource)) {
    html += `<h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin: 16px 0 8px">${getSourceLabel(source)}</h4>`;
    html += items.map(sw => `
      <div class="software-item">
        <span class="software-name">${escapeHtml(sw.name)}</span>
        <div class="software-meta">
          <span class="software-version">${escapeHtml(sw.version || '-')}</span>
          <span class="software-source">${escapeHtml(sw.source)}</span>
        </div>
      </div>
    `).join('');
  }

  elements.softwareList.innerHTML = html;
}

function showDeviceDetail(deviceId) {
  const device = devices.find(d => d.device_id === deviceId);
  if (!device) return;

  selectedDevice = device;
  
  elements.detailTitle.textContent = device.hostname;
  elements.detailSubtitle.textContent = `${device.os_type || 'Unknown'} • ${device.os_version || ''}`;
  elements.detailAvatar.textContent = getOSIcon(device.os_type);
  
  // Device info
  const infoItems = [
    { label: 'Device ID', value: device.device_id },
    { label: 'Hostname', value: device.hostname },
    { label: 'OS', value: `${device.os_type || '-'} ${device.os_version || ''}` },
    { label: 'Build', value: device.os_build || '-' },
    { label: 'Architektur', value: device.architecture || '-' },
    { label: 'IP', value: device.ip_address || '-' },
    { label: 'MAC', value: device.mac_address || '-' },
    { label: 'Agent', value: device.agent_version || '-' },
    { label: 'Erst gesehen', value: formatDate(device.first_seen) },
    { label: 'Zuletzt gesehen', value: formatDate(device.last_seen) }
  ];

  elements.deviceInfo.innerHTML = infoItems.map(item => `
    <div class="info-item">
      <span class="info-label">${item.label}</span>
      <span class="info-value">${escapeHtml(item.value)}</span>
    </div>
  `).join('');

  elements.detailPanel.classList.add('open');
  loadDeviceSoftware(deviceId);
}

function closeDetailPanel() {
  elements.detailPanel.classList.remove('open');
  selectedDevice = null;
}

// Stats
function updateStats() {
  const total = devices.length;
  const online = devices.filter(d => isDeviceOnline(d.last_seen)).length;
  const percent = total > 0 ? Math.round((online / total) * 100) : 0;

  animateValue(elements.totalDevices, parseInt(elements.totalDevices.textContent) || 0, total, 500);
  animateValue(elements.onlineDevices, parseInt(elements.onlineDevices.textContent) || 0, online, 500);
  
  elements.onlinePercent.textContent = `${percent}% aktiv`;
  elements.totalSoftware.textContent = '—';
  elements.riskScore.textContent = '—';
}

function animateValue(element, start, end, duration) {
  if (start === end) return;
  const range = end - start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = current;
    if (current === end) clearInterval(timer);
  }, Math.max(stepTime, 16));
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

  if (diffSecs < 60) return 'Gerade eben';
  if (diffMins < 60) return `${diffMins} Min`;
  if (diffHours < 24) return `${diffHours} Std`;
  if (diffDays < 7) return `${diffDays} Tage`;
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('de-DE', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getOSIcon(osType) {
  const icons = {
    'windows': '⊞',
    'darwin': '◉',
    'macos': '◉',
    'linux': '◉'
  };
  return icons[osType?.toLowerCase()] || '◉';
}

function getSourceLabel(source) {
  const labels = {
    'registry': 'Registry',
    'wmi': 'WMI',
    'applications': 'Apps',
    'process': 'Prozesse',
    'unknown': 'Unbekannt'
  };
  return labels[source] || source;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '-';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function filterDevices(searchTerm) {
  const term = searchTerm.toLowerCase();
  const filtered = devices.filter(d => 
    (d.hostname || '').toLowerCase().includes(term) ||
    (d.os_type || '').toLowerCase().includes(term)
  );
  renderDevices(filtered);
}

// Expose functions
window.showDeviceDetail = showDeviceDetail;
