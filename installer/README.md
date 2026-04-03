# VulnView Installer

## Windows MSI Installer

### Prerequisites
- WiX Toolset 3.x or later
- Windows SDK

### Build Instructions

```powershell
# Navigate to installer directory
cd installer/windows

# Build the MSI
candle installer.wxs
light -ext WixUIExtension -o vulnview-agent.msi installer.wixobj
```

### Installation
```powershell
# Silent install
msiexec /i vulnview-agent.msi /quiet /norestart

# With custom server URL
msiexec /i vulnview-agent.msi BACKENDURL="https://your-server:8443" /quiet
```

### Service Management
```powershell
# Check service status
sc query VulnViewAgent

# Stop service
sc stop VulnViewAgent

# Start service
sc start VulnViewAgent

# Uninstall
msiexec /x vulnview-agent.msi /quiet
```

## macOS PKG Installer

### Prerequisites
- macOS with pkgbuild
- Xcode Command Line Tools

### Build Instructions

```bash
cd installer/macos
chmod +x build-pkg.sh
./build-pkg.sh
```

### Installation
```bash
# Install
sudo installer -pkg vulnview-agent-1.0.0-macos.pkg -target /

# Or double-click the .pkg file
```

### Service Management
```bash
# Start service
sudo launchctl load /Library/LaunchDaemons/com.vulnview.agent.plist

# Stop service
sudo launchctl unload /Library/LaunchDaemons/com.vulnview.agent.plist

# Check status
sudo launchctl list | grep vulnview

# View logs
tail -f /usr/local/var/log/vulnview-agent.log
```

## Configuration

Both installers create a `config.json` file:
- **Windows**: `%ProgramFiles%\VulnView Agent\config.json`
- **macOS**: `/usr/local/etc/vulnview/config.json`

Example:
```json
{
  "server_url": "https://your-server:8443",
  "client_cert": "/path/to/client.crt",
  "client_key": "/path/to/client.key",
  "ca_cert": "/path/to/ca.crt"
}
```
