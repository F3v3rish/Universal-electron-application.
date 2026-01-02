# Build Instructions

This document provides step-by-step instructions to build and run the Universal Electron Application.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Operating System**: Linux, macOS, or Windows

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Electron 28.x
- TypeScript 5.x
- Build tools (concurrently, electron-builder)

### 2. Build the Application

```bash
npm run build
```

This command compiles all TypeScript files:
- Main process → `dist/main/`
- Renderer process → `dist/renderer/`
- Preload script → `dist/preload/`
- Worker scripts → `dist/main/workers/`

### 3. Run the Application

```bash
npm start
```

Or for development with rebuild:

```bash
npm run dev
```

The application window will open with:
- System information display
- Worker pool status
- Plugin list
- Interactive UI controls

## Development Workflow

### Watch Mode (Recommended for Development)

Run in two separate terminals:

**Terminal 1** - Auto-rebuild on file changes:
```bash
npm run watch
```

**Terminal 2** - Run the application:
```bash
npm start
```

After making code changes, restart the application in Terminal 2 to see the updates.

### Individual Build Commands

Build only specific components:

```bash
npm run build:main      # Build main process only
npm run build:renderer  # Build renderer process only
npm run build:preload   # Build preload script only
npm run build:verify    # Verify build output (cross-platform)
```

### Build Verification

After building, you can verify that all required files were created:

```bash
npm run build:verify
```

This runs a cross-platform verification script that checks for:
- `dist/main/main/index.js` - Main process entry point
- `dist/renderer/renderer/app.js` - Renderer bundle
- `dist/preload/preload/index.js` - Preload script

The script works on Windows, macOS, and Linux.

## Package for Distribution

To create distributable packages:

```bash
npm run package
```

This will create platform-specific installers in the `release/` directory:
- **Linux**: AppImage
- **Windows**: NSIS installer
- **macOS**: DMG installer

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean everything and start fresh
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors

Verify TypeScript is installed correctly:

```bash
npx tsc --version
```

### Electron Sandbox Issues

On Linux, if you get sandbox-related errors, run with:

```bash
./node_modules/.bin/electron . --no-sandbox
```

Or set the environment variable:

```bash
export ELECTRON_DISABLE_SANDBOX=1
npm start
```

### Headless/CI Environment

For running in CI/CD or headless environments without a display:

```bash
# Start virtual display (requires Xvfb)
Xvfb :99 -screen 0 1920x1080x24 &

# Run Electron with virtual display
DISPLAY=:99 ./node_modules/.bin/electron . --no-sandbox --disable-gpu
```

### Port Already in Use

If running multiple instances, ensure previous instances are closed:

```bash
# On Linux/macOS
pkill -f electron

# On Windows (PowerShell)
Get-Process electron | Stop-Process
```

## Build Output Structure

After building, the `dist/` directory contains:

```
dist/
├── main/
│   ├── main/
│   │   ├── index.js                  # Main entry point
│   │   ├── window-manager.js
│   │   ├── plugin-manager.js
│   │   ├── worker-pool-manager.js
│   │   ├── child-process-manager.js
│   │   └── ipc-handler.js
│   ├── workers/
│   │   ├── base-worker.js
│   │   └── child-process.js
│   └── shared/
│       ├── logger.js
│       ├── event-bus.js
│       └── types.js
├── renderer/
│   ├── renderer/
│   │   └── index.js
│   └── shared/
│       ├── logger.js
│       ├── event-bus.js
│       └── types.js
└── preload/
    ├── preload/
    │   └── index.js
    └── shared/
        ├── logger.js
        ├── event-bus.js
        └── types.js
```

## Environment Variables

Optional environment variables:

- `ELECTRON_DISABLE_SANDBOX`: Set to `1` to disable sandbox (for CI/CD)
- `NODE_ENV`: Set to `development` or `production`

## CI/CD Integration

For automated builds in CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Build
npm run build

# Run tests (if available)
# npm test

# Package
npm run package
```

## Additional Resources

- **README.md** - Project overview and architecture
- **QUICKSTART.md** - Quick start guide with examples
- **ARCHITECTURE.md** - Detailed technical architecture
- **USAGE.md** - API reference and usage examples

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check the GitHub issues page
4. Review the inline code comments
