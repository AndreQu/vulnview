// VulnView Dashboard - Vanilla JavaScript
// API Base URL - configurable
const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8443';

// State
let devices = [];
let selectedDevice = null;
let refreshInterval = null;

// DOM Elements
const elements = {
    apiStatus: document.getElementById('apiStatus'),
    refreshBtn: document.getElementById('refreshBtn'),
    deviceSearch: document.getElementById('deviceSearch'),
    devicesTableBody: document.getElementById('devicesTableBody'),
    totalDevices: document.getElementById('totalDevices'),
    onlineDevices: document.getElementById('onlineDevices'),
    offlineDevices: document.getElementById('offlineDevices'),
    totalSoftware: document.getElementById('totalSoftware'),
    lastUpdate: document.getElementById('lastUpdate'),
    deviceModal: document.getElementById('deviceModal'),
    closeModal: document.getElementById('closeModal'),
    modalDeviceName: document.getElementById('modalDeviceName'),
    deviceInfo: document.getElementById('deviceInfo'),
    softwareList: document.getElementById('softwareList')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupEventListeners();
    startAutoRefresh();
});

function initDashboard() {
    checkApiStatus();
    loadDevices();
}

function setupEventListeners() {
    // Refresh button
    elements.refreshBtn.addEventListener('click', () => {
        loadDevices();
    });

    // Search
    elements.deviceSearch.addEventListener('input', (e) => {
        filterDevices(e.target.value);
    });

    // Modal close
    elements.closeModal.addEventListener('click', closeModal);
    elements.deviceModal.addEventListener('click', (e) => {
        if (e.target === elements.deviceModal) closeModal();
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        loadDevices();
    }, 30000); // 30 seconds
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
        setApiStatus(false, 'API nicht erreichbar');
    }
}

function setApiStatus(online, message) {
    elements.apiStatus.className = `api-status ${online ? 'online' : 'offline'}`;
    elements.apiStatus.textContent = `● ${message}`;
}

async function loadDevices() {
    try {
        const response = await fetch(`${API_BASE}/api/v1/devices`);
        if (!response.ok) throw new Error('Failed to load devices');
        
        const data = await response.json();
        if (data.success) {
            devices = data.data || [];
            renderDevices(devices);
            updateStats();
            updateLastUpdate();
        }
    } catch (error) {
        console.error('Error loading devices:', error);
        elements.devicesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading" style="color: #ef4444;">
                    Fehler beim Laden: ${error.message}
                </td>
            </tr>
        `;
    }
}

async function loadDeviceSoftware(deviceId) {
    try {
        elements.softwareList.innerHTML = '<div class="loading">Lade Software...</div>';
        
        const response = await fetch(`${API_BASE}/api/v1/devices/${deviceId}/software`);
        if (!response.ok) throw new Error('Failed to load software');
        
        const data = await response.json();
        if (data.success) {
            renderSoftware(data.data || []);
        }
    } catch (error) {
        console.error('Error loading software:', error);
        elements.softwareList.innerHTML = `
            <div class="loading" style="color: #ef4444;">
                Fehler beim Laden der Software
            </div>
        `;
    }
}

// Rendering Functions
function renderDevices(deviceList) {
    if (deviceList.length === 0) {
        elements.devicesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Keine Geräte gefunden. Starte einen Agent um Daten zu senden.
                </td>
            </tr>
        `;
        return;
    }

    elements.devicesTableBody.innerHTML = deviceList.map(device => {
        const isOnline = isDeviceOnline(device.last_seen);
        const lastSeen = formatLastSeen(device.last_seen);
        const osInfo = formatOS(device.os_type, device.os_version);
        
        return `
            <tr onclick="showDeviceDetails('${device.device_id}')">
                <td>
                    <span class="status-badge ${isOnline ? 'status-online' : 'status-offline'}">
                        ${isOnline ? '● Online' : '● Offline'}
                    </span>
                </td>
                <td><strong>${escapeHtml(device.hostname)}</strong></td>
                <td>${escapeHtml(osInfo)}</td>
                <td>${escapeHtml(device.os_version || '-')}</td>
                <td>${escapeHtml(device.agent_version || '-')}</td>
                <td title="${device.last_seen || 'Nie'}">${lastSeen}</td>
            </tr>
        `;
    }).join('');
}

function renderSoftware(softwareList) {
    if (softwareList.length === 0) {
        elements.softwareList.innerHTML = `
            <div class="loading">
                Keine Software-Daten verfügbar
            </div>
        `;
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
        html += `<h4 style="margin: 1rem 0 0.5rem; color: #94a3b8; font-size: 0.875rem; text-transform: uppercase;">
            ${getSourceLabel(source)} (${items.length})
        </h4>`;
        
        html += items.map(sw => `
            <div class="software-item">
                <div>
                    <div class="software-name">${escapeHtml(sw.name)}</div>
                    <div class="software-publisher">${escapeHtml(sw.publisher || '-')}</div>
                </div>
                <div style="text-align: right;">
                    <div class="software-version">${escapeHtml(sw.version || '-')}</div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
                        ${escapeHtml(sw.install_path || '')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    elements.softwareList.innerHTML = html;
}

function renderDeviceInfo(device) {
    const isOnline = isDeviceOnline(device.last_seen);
    const info = [
        { label: 'Device ID', value: device.device_id },
        { label: 'Hostname', value: device.hostname },
        { label: 'Status', value: isOnline ? 'Online' : 'Offline' },
        { label: 'OS Typ', value: device.os_type || '-' },
        { label: 'OS Version', value: device.os_version || '-' },
        { label: 'OS Build', value: device.os_build || '-' },
        { label: 'Architektur', value: device.architecture || '-' },
        { label: 'IP Adresse', value: device.ip_address || '-' },
        { label: 'MAC Adresse', value: device.mac_address || '-' },
        { label: 'Agent Version', value: device.agent_version || '-' },
        { label: 'Erst gesehen', value: formatDate(device.first_seen) },
        { label: 'Zuletzt gesehen', value: formatDate(device.last_seen) }
    ];

    elements.deviceInfo.innerHTML = `
        <div class="device-info-grid">
            ${info.map(item => `
                <div class="device-info-item">
                    <div class="device-info-label">${item.label}</div>
                    <div class="device-info-value">${escapeHtml(item.value)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Modal Functions
function showDeviceDetails(deviceId) {
    const device = devices.find(d => d.device_id === deviceId);
    if (!device) return;

    selectedDevice = device;
    elements.modalDeviceName.textContent = device.hostname;
    renderDeviceInfo(device);
    elements.deviceModal.classList.add('active');
    
    loadDeviceSoftware(deviceId);
}

function closeModal() {
    elements.deviceModal.classList.remove('active');
    selectedDevice = null;
}

// Stats
function updateStats() {
    const total = devices.length;
    const online = devices.filter(d => isDeviceOnline(d.last_seen)).length;
    const offline = total - online;
    
    elements.totalDevices.textContent = total;
    elements.onlineDevices.textContent = online;
    elements.offlineDevices.textContent = offline;
    
    // Software count - estimate based on devices
    // In production, this would be queried from API
    elements.totalSoftware.textContent = '-';
}

function updateLastUpdate() {
    elements.lastUpdate.textContent = new Date().toLocaleTimeString('de-DE');
}

// Filter
function filterDevices(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filtered = devices.filter(device => 
        (device.hostname || '').toLowerCase().includes(term) ||
        (device.os_type || '').toLowerCase().includes(term) ||
        (device.device_id || '').toLowerCase().includes(term)
    );
    renderDevices(filtered);
}

// Helpers
function isDeviceOnline(lastSeen) {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now - lastSeenDate) / 1000 / 60;
    return diffMinutes < 5; // Online if seen within 5 minutes
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('de-DE');
}

function formatOS(osType, version) {
    const osMap = {
        'windows': 'Windows',
        'linux': 'Linux',
        'darwin': 'macOS',
        'macos': 'macOS'
    };
    return osMap[osType?.toLowerCase()] || osType || 'Unknown';
}

function getSourceLabel(source) {
    const labels = {
        'registry': 'Registry (Installiert)',
        'wmi': 'WMI',
        'process': 'Laufende Prozesse',
        'dll': 'Geladene Bibliotheken',
        'portable': 'Portable Apps',
        'unknown': 'Unbekannt'
    };
    return labels[source] || source;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('de-DE');
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '-';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Expose function globally for onclick
window.showDeviceDetails = showDeviceDetails;
