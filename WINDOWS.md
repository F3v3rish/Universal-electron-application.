# Windows Support Guide

## Overview

The Universal Electron Application is fully compatible with Windows 10 and Windows 11. This document provides Windows-specific instructions and troubleshooting.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit) or Windows 11
- **Node.js**: Version 18.0.0 or higher
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 500 MB free space
- **Processor**: Multi-core processor (4+ cores recommended)

### Recommended Requirements
- **OS**: Windows 11 (latest update)
- **Node.js**: Version 20.x
- **RAM**: 16 GB or more
- **Storage**: 1 GB free space
- **Processor**: 6+ core processor for optimal worker performance

## Installation on Windows

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/)

Verify installation:
```cmd
node --version
npm --version
```

### 2. Clone or Download Repository

Using Git Bash or Command Prompt:
```cmd
git clone https://github.com/F3v3rish/Universal-electron-application..git
cd Universal-electron-application.
```

### 3. Install Dependencies

```cmd
npm install
```

### 4. Build the Application

```cmd
npm run build
```

### 5. Run the Application

```cmd
npm start
```

Or for development mode:
```cmd
npm run dev
```

## Windows-Specific Features

### Path Handling
The application correctly handles Windows-style paths:
- ✅ Backslash separators (`C:\Users\...`)
- ✅ Forward slashes (`C:/Users/...`)
- ✅ Mixed separators (automatically normalized)
- ✅ UNC paths (`\\server\share`)
- ✅ Relative paths (`..\folder\file.txt`)

### File System
- ✅ Long path support (>260 characters on Windows 10 1607+)
- ✅ Case-insensitive file system handling
- ✅ Windows line endings (CRLF) support
- ✅ Unicode filename support

### Process Management
- ✅ Worker threads work on Windows
- ✅ Child processes spawn correctly
- ✅ Process cleanup on application exit

## Building Installer (Windows)

To create a Windows installer:

```cmd
npm run package
```

This creates:
- **NSIS Installer**: `release/Universal Electron App Setup.exe`
- Installable package for distribution

The installer will:
- Install the application to `Program Files`
- Create Start Menu shortcuts
- Create Desktop shortcut (optional)
- Register uninstaller

## Running Tests on Windows

### Command Prompt / PowerShell

```cmd
npm test
```

### Quick Tests
```cmd
npm run test:quick
```

### Watch Mode
```cmd
npm run test:watch
```

All tests include Windows-specific path and environment validation.

## Windows-Specific Configuration

### electron-builder Configuration

Located in `package.json`:

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    }
  }
}
```

### Default Installation Locations
- **User Installation**: `C:\Users\<Username>\AppData\Local\Programs\universal-electron-app`
- **System Installation**: `C:\Program Files\Universal Electron App`
- **User Data**: `C:\Users\<Username>\AppData\Roaming\universal-electron-application`
- **Logs**: `C:\Users\<Username>\AppData\Roaming\universal-electron-application\logs`

## Troubleshooting

### Issue: "npm install" fails with permission errors

**Solution**: Run Command Prompt or PowerShell as Administrator

```cmd
# Right-click Command Prompt
# Select "Run as administrator"
npm install
```

### Issue: Build fails with "access denied" error

**Solution**: 
1. Disable Windows Defender temporarily
2. Add project folder to exclusions
3. Or use Windows Security settings to allow npm/node

### Issue: Application doesn't start

**Solution 1** - Check if port is in use:
```cmd
netstat -ano | findstr :PORT_NUMBER
```

**Solution 2** - Clean rebuild:
```cmd
rmdir /s /q dist node_modules
npm install
npm run build
npm start
```

### Issue: "Electron failed to install" during npm install

**Solution**: 
```cmd
# Set npm registry (if behind firewall/proxy)
npm config set registry https://registry.npmjs.org/

# Reinstall Electron
npm install electron --save-dev
```

### Issue: Worker threads not working

**Solution**: Ensure Node.js is version 18+ with worker thread support:
```cmd
node --version
```

If version is below 18, upgrade Node.js.

### Issue: Path-related errors

The application uses `path.join()` for cross-platform compatibility. If you see path errors:

1. Check that paths don't use hardcoded separators:
   - ❌ Bad: `"C:/Users/" + username + "/file.txt"`
   - ✅ Good: `path.join("C:", "Users", username, "file.txt")`

2. Run path tests:
   ```cmd
   npm run test:quick
   ```

### Issue: Antivirus blocks the application

Some antivirus software may flag Electron apps. Solutions:

1. **Add exception** for the application folder
2. **Digitally sign** the installer (for distribution)
3. **Use Windows Defender** which generally doesn't flag Electron apps

## Performance on Windows

### Optimizations Applied

1. **Background Throttling Disabled**: Ensures consistent performance
2. **Worker Thread Pool**: Auto-scales to CPU core count
3. **Shared Array Buffer**: Enabled for zero-copy data sharing
4. **Hardware Acceleration**: WebGL enabled

### Performance Monitoring

Open DevTools (F12 or Ctrl+Shift+I) and check:
- Task Manager → Performance tab
- Worker thread utilization
- Memory usage

### Expected Performance
- **Startup Time**: < 5 seconds on SSD
- **Memory Usage**: 100-300 MB (depending on workload)
- **CPU Usage**: Scales with worker tasks

## Firewall and Network

If running behind a corporate firewall:

### Configure npm Proxy
```cmd
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Remove Proxy (if needed)
```cmd
npm config delete proxy
npm config delete https-proxy
```

## Development on Windows

### Recommended Tools
- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript
- **Git for Windows** or **GitHub Desktop**
- **Windows Terminal** (modern terminal experience)
- **Node Version Manager (nvm-windows)** for managing Node versions

### Watch Mode
For development with auto-rebuild:

```cmd
# Terminal 1
npm run watch

# Terminal 2
npm start
```

### Debugging
1. Run application: `npm start`
2. Open DevTools: `Ctrl+Shift+I`
3. Use Sources tab for debugging
4. Check Console for logs

## Command Line Shortcuts

### PowerShell Aliases (Optional)

Add to PowerShell profile (`$PROFILE`):

```powershell
# Electron app shortcuts
function ea-build { npm run build }
function ea-start { npm start }
function ea-dev { npm run dev }
function ea-test { npm test }
```

Then use:
```powershell
ea-build
ea-start
ea-test
```

## Distribution

### Creating Release Builds

```cmd
# Set production environment
set NODE_ENV=production

# Build and package
npm run package
```

Output in `release/` folder:
- `Universal Electron App Setup.exe` - NSIS installer
- `win-unpacked/` - Unpacked application files

### Code Signing (Recommended for Distribution)

For production release, sign the executable:

1. Obtain a code signing certificate
2. Configure in `package.json`:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

## Compatibility Notes

### Windows Versions
- ✅ Windows 11 (all versions)
- ✅ Windows 10 (1607+)
- ⚠️ Windows 8.1 (not officially supported, may work)
- ❌ Windows 7 (not supported - Electron 28 requires Windows 10+)

### Architecture Support
- ✅ x64 (64-bit) - Primary target
- ✅ ARM64 - Works with emulation on ARM Windows
- ❌ x86 (32-bit) - Not supported

## Security

### Windows Defender SmartScreen
First-time installs may show SmartScreen warning:
- Click "More info"
- Click "Run anyway"

For distribution, code signing prevents this warning.

### User Account Control (UAC)
The application runs without administrator privileges by default. UAC prompts should not appear during normal operation.

## Support

For Windows-specific issues:
1. Check this guide's troubleshooting section
2. Review the main [README.md](../README.md)
3. Check [TESTING.md](../TESTING.md) for test-related issues
4. Open an issue on GitHub with:
   - Windows version
   - Node.js version
   - Error messages
   - Steps to reproduce

## Additional Resources

- [Node.js Windows Installation Guide](https://nodejs.org/en/download/)
- [Electron Windows Development](https://www.electronjs.org/docs/latest/development/build-instructions-windows)
- [electron-builder Windows Target](https://www.electron.build/configuration/win)
