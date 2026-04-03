#!/bin/bash
#
# VulnView Agent macOS PKG Installer Builder
# Creates a .pkg installer that installs the agent as a LaunchDaemon

set -e

# Configuration
VERSION="1.0.0"
IDENTIFIER="com.vulnview.agent"
INSTALLER_NAME="vulnview-agent-${VERSION}-macos.pkg"
BUILD_DIR="build/pkg"
PAYLOAD_DIR="${BUILD_DIR}/payload"
SCRIPTS_DIR="${BUILD_DIR}/scripts"

# Clean and create directories
rm -rf "${BUILD_DIR}"
mkdir -p "${PAYLOAD_DIR}/usr/local/bin"
mkdir -p "${PAYLOAD_DIR}/usr/local/etc/vulnview"
mkdir -p "${PAYLOAD_DIR}/Library/LaunchDaemons"
mkdir -p "${SCRIPTS_DIR}"

echo "Building VulnView Agent macOS Installer..."

# Copy agent binary (must be built for macOS ARM64/x86_64 universal)
if [ -f "../vulnview-agent" ]; then
    cp "../vulnview-agent" "${PAYLOAD_DIR}/usr/local/bin/"
    chmod +x "${PAYLOAD_DIR}/usr/local/bin/vulnview-agent"
else
    echo "Warning: Agent binary not found. Place 'vulnview-agent' in parent directory."
fi

# Create config.json template
cat > "${PAYLOAD_DIR}/usr/local/etc/vulnview/config.json" << 'EOF'
{
  "server_url": "https://localhost:8443",
  "device_id": "",
  "client_cert": "",
  "client_key": "",
  "ca_cert": "",
  "insecure": false
}
EOF
chmod 644 "${PAYLOAD_DIR}/usr/local/etc/vulnview/config.json"

# Create LaunchDaemon plist
cat > "${PAYLOAD_DIR}/Library/LaunchDaemons/${IDENTIFIER}.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${IDENTIFIER}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/vulnview-agent</string>
        <string>--config</string>
        <string>/usr/local/etc/vulnview/config.json</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/usr/local/etc/vulnview</string>
    <key>StandardOutPath</key>
    <string>/usr/local/var/log/vulnview-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/usr/local/var/log/vulnview-agent-error.log</string>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
    <key>LaunchOnlyOnce</key>
    <false/>
    <key>ThrottleInterval</key>
    <integer>10</integer>
</dict>
</plist>
EOF

chmod 644 "${PAYLOAD_DIR}/Library/LaunchDaemons/${IDENTIFIER}.plist"

# Create preinstall script
cat > "${SCRIPTS_DIR}/preinstall" << 'EOF'
#!/bin/bash
# Preinstall script - runs before installation

echo "Preparing to install VulnView Agent..."

# Stop existing agent if running
if launchctl list com.vulnview.agent > /dev/null 2>&1; then
    echo "Stopping existing VulnView Agent..."
    launchctl unload /Library/LaunchDaemons/com.vulnview.agent.plist 2> /dev/null || true
fi

# Create log directory
mkdir -p /usr/local/var/log
chmod 755 /usr/local/var/log

exit 0
EOF

chmod +x "${SCRIPTS_DIR}/preinstall"

# Create postinstall script
cat > "${SCRIPTS_DIR}/postinstall" << 'EOF'
#!/bin/bash
# Postinstall script - runs after installation

echo "Configuring VulnView Agent..."

# Set correct ownership for plist
chown root:wheel /Library/LaunchDaemons/com.vulnview.agent.plist

# Create log directory if not exists
mkdir -p /usr/local/var/log
chmod 755 /usr/local/var/log

# Load the LaunchDaemon
echo "Starting VulnView Agent service..."
launchctl load /Library/LaunchDaemons/com.vulnview.agent.plist 2> /dev/null || true

# Check if service is running
sleep 2
if launchctl list com.vulnview.agent > /dev/null 2>&1; then
    echo "VulnView Agent is now running!"
else
    echo "Note: Service installed but not started. Check configuration."
fi

echo ""
echo "Installation complete!"
echo "Configuration file: /usr/local/etc/vulnview/config.json"
echo "Logs: /usr/local/var/log/vulnview-agent.log"
echo ""
echo "To start/stop the service:"
echo "  sudo launchctl load /Library/LaunchDaemons/com.vulnview.agent.plist"
echo "  sudo launchctl unload /Library/LaunchDaemons/com.vulnview.agent.plist"

exit 0
EOF

chmod +x "${SCRIPTS_DIR}/postinstall"

# Build the package
echo "Building package..."
pkgbuild \
    --root "${PAYLOAD_DIR}" \
    --identifier "${IDENTIFIER}" \
    --version "${VERSION}" \
    --scripts "${SCRIPTS_DIR}" \
    --install-location "/" \
    "${INSTALLER_NAME}"

echo ""
echo "================================================"
echo "Installer created: ${INSTALLER_NAME}"
echo "================================================"
echo ""
echo "To install: sudo installer -pkg ${INSTALLER_NAME} -target /"
echo ""

# Cleanup
rm -rf "${BUILD_DIR}"
