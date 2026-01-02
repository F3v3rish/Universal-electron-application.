# Testing Guide

This document provides comprehensive testing instructions for the Universal Electron Application.

## Table of Contents

- [Quick Start](#quick-start)
- [Manual Testing](#manual-testing)
- [Feature Testing](#feature-testing)
- [Performance Testing](#performance-testing)
- [Plugin Testing](#plugin-testing)
- [Known Issues](#known-issues)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- All dependencies installed (`npm install`)
- Application built (`npm run build`)

### Running the Application

**Development Mode:**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The application should launch and display:
- Main window with a modern UI
- Dashboard with system information
- Plugins tab showing discovered plugins
- Settings panel with theme options

## Manual Testing

### 1. Application Launch

**Test:** Verify the application starts without errors

```bash
npm start
```

**Expected Results:**
- Window opens with title "Universal Electron Application"
- No critical errors in console
- UI renders correctly
- System information displays correctly

**Console Log Check:**
Look for these messages in the terminal:
```
[INFO] Initializing worker pool with N workers
[INFO] Application initialized successfully
[INFO] Discovered N plugins
[INFO] Created main window
```

### 2. Core Features Testing

#### Window Management

**Test:** Window operations
- ✅ Window opens on launch
- ✅ Window can be minimized
- ✅ Window can be maximized
- ✅ Window can be resized
- ✅ Window closes properly
- ✅ On macOS, app stays in dock after closing window

**Expected Behavior:**
- Single window architecture maintained
- Clean shutdown on window close

#### Theme System

**Test:** Theme switching
1. Launch the application
2. Click the theme toggle button (🌓) in the header
3. Verify theme switches between light and dark
4. Close and reopen the application
5. Verify theme persists across sessions

**Expected Results:**
- Smooth transition between light/dark themes
- All UI elements update colors appropriately
- Theme preference saves to settings
- Theme loads on restart

#### Navigation

**Test:** Tab navigation
1. Click "Dashboard" tab
2. Click "Plugins" tab
3. Click "Settings" tab

**Expected Results:**
- Content area updates for each tab
- Active tab is highlighted
- Navigation is smooth and responsive

### 3. Worker Pool Testing

**Test:** Worker thread functionality

1. Navigate to Dashboard
2. Look for "Worker Test" card
3. Click "Submit Task" button
4. Observe the output

**Expected Results:**
- Task submits successfully
- Worker processes the task
- Result appears in output box
- Console shows worker pool activity

**Manual Test via DevTools:**
```javascript
// Open DevTools (Ctrl+Shift+I or Cmd+Option+I)
// Run this in console:
await window.electronAPI.workers.submitTask({
  id: 'test-task',
  type: 'compute',
  data: { operation: 'sum', values: [1, 2, 3, 4, 5] }
});
// Should return result with sum
```

### 4. Settings Management

**Test:** Settings persistence

1. Navigate to Settings tab
2. Change theme setting
3. Toggle other settings
4. Close the application
5. Reopen the application
6. Navigate to Settings tab

**Expected Results:**
- All settings persist across sessions
- Changes take effect immediately
- Settings are stored in JSON format
- No errors when saving/loading settings

### 5. Plugin System Testing

**Test:** Plugin discovery and management

1. Navigate to Plugins tab
2. Verify plugins are listed
3. Check plugin information displays correctly

**Expected Results:**
- All plugins in `plugins/` directory are discovered
- Plugin cards show:
  - Plugin name
  - Description
  - Version
  - Author
  - Plugin ID

**Default Plugins:**
- ✅ system-monitor (System Monitor)
- ✅ calculator (Calculator)
- ✅ example-plugin (Example Plugin)

## Feature Testing

### System Information Display

**Test:** System info accuracy

1. Navigate to Dashboard
2. Check System Information card

**Expected Data:**
- Platform: Your OS (linux, darwin, win32)
- Architecture: Your CPU architecture (x64, arm64)
- Node version: v18.x.x
- Electron version: 28.x.x
- CPU cores: Actual CPU core count
- Total memory: Actual RAM in GB

### IPC Communication

**Test:** Inter-process communication

```javascript
// In DevTools console:

// Test system info retrieval
await window.electronAPI.system.getInfo();

// Test settings operations
await window.electronAPI.settings.get('theme');
await window.electronAPI.settings.set('theme', 'dark');

// Test plugin list
await window.electronAPI.plugins.list();

// Test worker status
await window.electronAPI.workers.getStatus();
```

**Expected Results:**
- All IPC calls complete successfully
- No errors in console
- Data returned in expected format

## Performance Testing

### Application Startup

**Test:** Startup time

1. Close the application
2. Time the launch: `time npm start`
3. Record time to visible window

**Expected Performance:**
- Application launches in < 5 seconds
- Window appears in < 3 seconds
- No blocking operations

### Worker Pool Performance

**Test:** Worker thread efficiency

```javascript
// Submit multiple tasks in parallel
const tasks = [];
for (let i = 0; i < 10; i++) {
  tasks.push(
    window.electronAPI.workers.submitTask({
      id: `task-${i}`,
      type: 'compute',
      data: { operation: 'heavy-computation', iterations: 1000000 }
    })
  );
}
await Promise.all(tasks);
```

**Expected Results:**
- Tasks execute in parallel
- No UI freezing
- Efficient CPU utilization

### Memory Usage

**Test:** Memory leaks

1. Open Task Manager / Activity Monitor
2. Note initial memory usage
3. Perform various operations for 10 minutes
4. Check memory usage again

**Expected Results:**
- Memory stays relatively stable
- No unbounded growth
- Proper cleanup on window close

## Plugin Testing

### Creating a Test Plugin

1. Create `plugins/test-plugin/` directory
2. Add `plugin.json`:

```json
{
  "id": "test-plugin",
  "name": "Test Plugin",
  "version": "1.0.0",
  "description": "Test plugin for verification",
  "author": "Tester",
  "mainEntry": "index.js"
}
```

3. Add `index.js`:

```javascript
class TestPlugin {
  async onLoad() {
    console.log('Test plugin loaded');
  }

  async onActivate() {
    console.log('Test plugin activated');
  }

  async onDeactivate() {
    console.log('Test plugin deactivated');
  }

  async onUnload() {
    console.log('Test plugin unloaded');
  }
}

module.exports = TestPlugin;
```

4. Restart application
5. Check Plugins tab

**Expected Results:**
- Test plugin appears in plugins list
- Plugin lifecycle methods are called
- Console shows lifecycle logs

### Example Plugins

Test the built-in plugins:

#### System Monitor Plugin
- Provides system resource monitoring
- Should display CPU/memory statistics

#### Calculator Plugin
- Provides calculation functionality
- Should handle basic and scientific operations

#### Example Plugin
- Template plugin
- Shows basic plugin structure

## Known Issues

### Headless Environments

When running in CI/CD or without a display:

```bash
# Use virtual display
Xvfb :99 -screen 0 1920x1080x24 &
DISPLAY=:99 ./node_modules/.bin/electron . --no-sandbox --disable-gpu
```

**Known Errors (Safe to Ignore):**
- GPU process errors in headless mode
- DBus connection errors on Linux
- Various Chromium rendering warnings

### Development Mode

**Note:** Some warnings in development mode are expected:
- React dev mode warnings
- Electron deprecation notices
- ESLint warnings (not errors)

## Testing Checklist

Use this checklist for comprehensive testing:

### Basic Functionality
- [ ] Application launches without errors
- [ ] Main window displays correctly
- [ ] Navigation tabs work
- [ ] Application closes cleanly

### UI/UX
- [ ] Theme switching works
- [ ] All buttons are responsive
- [ ] Text is readable
- [ ] Layout is not broken
- [ ] No console errors

### Core Features
- [ ] Worker pool initializes
- [ ] Settings persist
- [ ] Plugins are discovered
- [ ] System info displays
- [ ] IPC communication works

### Performance
- [ ] Fast startup time
- [ ] No UI freezing
- [ ] Efficient resource usage
- [ ] No memory leaks

### Cross-Platform (if applicable)
- [ ] Works on Linux
- [ ] Works on macOS
- [ ] Works on Windows

## Debugging Tips

### Enable Debug Logging

Set environment variable:
```bash
export DEBUG=true
npm start
```

### Open DevTools

**Method 1:** In the application window
- Linux/Windows: `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**Method 2:** Code
Add to main window creation:
```javascript
mainWindow.webContents.openDevTools();
```

### Check Log Files

Logs are stored in:
- **Linux:** `~/.config/universal-electron-application/logs/`
- **macOS:** `~/Library/Application Support/universal-electron-application/logs/`
- **Windows:** `%APPDATA%/universal-electron-application/logs/`

### Common Issues

**Application won't start:**
1. Check if port is already in use
2. Verify all dependencies installed
3. Rebuild: `rm -rf dist && npm run build`

**White screen on launch:**
1. Check DevTools console for errors
2. Verify renderer build completed
3. Check HTML file path in window-manager.ts

**Plugins not loading:**
1. Verify plugin.json syntax
2. Check console for plugin errors
3. Ensure mainEntry file exists

## Reporting Issues

When reporting issues, include:
1. Operating system and version
2. Node.js version (`node -v`)
3. Electron version (`npm list electron`)
4. Steps to reproduce
5. Console error messages
6. Log files from user data directory

## Contributing Tests

To contribute automated tests:
1. Follow project structure
2. Use consistent naming
3. Document test purpose
4. Include both positive and negative cases
5. Test error handling

---

For more information, see:
- [BUILD.md](BUILD.md) - Build instructions
- [USAGE.md](USAGE.md) - API usage guide
- [PLUGINS.md](PLUGINS.md) - Plugin development
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
