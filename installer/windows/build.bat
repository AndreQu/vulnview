@echo off
REM VulnView Agent Windows MSI Builder

echo Building VulnView Agent MSI Installer...

REM Check for WiX
where candle > nul 2>&1
if errorlevel 1 (
    echo Error: WiX Toolset not found in PATH
    echo Please install WiX Toolset from https://wixtoolset.org/
    exit /b 1
)

REM Clean previous builds
if exist "*.wixobj" del "*.wixobj"
if exist "*.msi" del "*.msi"

REM Compile WiX source
echo Compiling WiX source...
candle installer.wxs -o installer.wixobj
if errorlevel 1 (
    echo Error: Compilation failed
    exit /b 1
)

REM Link MSI
echo Linking MSI package...
light -ext WixUIExtension -o vulnview-agent.msi installer.wixobj
if errorlevel 1 (
    echo Error: Linking failed
    exit /b 1
)

echo.
echo ================================================
echo MSI Installer created: vulnview-agent.msi
echo ================================================
echo.
echo To install silently: msiexec /i vulnview-agent.msi /quiet /norestart
echo.

pause
