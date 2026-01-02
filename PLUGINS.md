# Plugin Development Guide

This guide explains how to create plugins for the Universal Electron Application.

## Overview

The plugin system allows you to extend the application with custom functionality. Plugins run in the main process and have access to Node.js APIs, the file system, and can communicate with the renderer process.

## Plugin Structure

Every plugin must have the following structure:

```
plugins/
└── my-plugin/
    ├── plugin.json          # Required: Plugin manifest
    ├── index.js             # Required: Main plugin file
    └── README.md            # Optional: Documentation
```

## Plugin Manifest (plugin.json)

The `plugin.json` file contains metadata about your plugin:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A description of what this plugin does",
  "author": "Your Name",
  "mainEntry": "index.js"
}
```

### Manifest Fields

- **id** (required): Unique identifier for the plugin (use kebab-case)
- **name** (required): Display name of the plugin
- **version** (required): Semantic version (e.g., "1.0.0")
- **description** (required): Brief description of the plugin's functionality
- **author** (optional): Plugin author name
- **mainEntry** (required): Path to the main plugin file (relative to plugin directory)

## Plugin Class

Your main plugin file should export a class with lifecycle hooks:

```javascript
class MyPlugin {
  constructor() {
    // Initialize plugin state
  }

  /**
   * Called when the plugin is first loaded
   */
  async onLoad() {
    console.log('Plugin loaded');
  }

  /**
   * Called when the plugin is activated
   */
  async onActivate() {
    console.log('Plugin activated');
    // Start plugin functionality
  }

  /**
   * Called when the plugin is deactivated
   */
  async onDeactivate() {
    console.log('Plugin deactivated');
    // Pause or disable plugin functionality
  }

  /**
   * Called when the plugin is unloaded
   */
  async onUnload() {
    console.log('Plugin unloaded');
    // Clean up resources, stop timers, close connections
  }
}

module.exports = MyPlugin;
```

## Lifecycle Hooks

### onLoad()

- Called once when the plugin is first loaded into memory
- Use for: Initial setup, loading configuration
- Async: Yes (can return Promise)

### onActivate()

- Called when the plugin should start its functionality
- Use for: Starting services, timers, event listeners
- Async: Yes (can return Promise)

### onDeactivate()

- Called when the plugin should pause its functionality
- Use for: Stopping services, pausing timers
- Async: Yes (can return Promise)

### onUnload()

- Called when the plugin is being completely removed
- Use for: Cleanup, resource disposal, saving state
- Async: Yes (can return Promise)

## Best Practices

### 1. Resource Management

Always clean up resources in `onDeactivate()` and `onUnload()`:

```javascript
class MyPlugin {
  constructor() {
    this.timer = null;
    this.connections = [];
  }

  async onActivate() {
    this.timer = setInterval(() => {
      // Do work
    }, 1000);
  }

  async onDeactivate() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async onUnload() {
    // Close all connections
    this.connections.forEach(conn => conn.close());
    this.connections = [];
  }
}
```

### 2. Error Handling

Handle errors gracefully and log them:

```javascript
async onActivate() {
  try {
    await this.initialize();
  } catch (error) {
    console.error('[MyPlugin] Activation failed:', error);
    throw error;
  }
}
```

### 3. State Management

Keep plugin state in the class instance:

```javascript
class MyPlugin {
  constructor() {
    this.isActive = false;
    this.data = [];
  }

  async onActivate() {
    this.isActive = true;
  }

  async onDeactivate() {
    this.isActive = false;
  }
}
```

### 4. Event Emitters

Use EventEmitter for inter-component communication:

```javascript
const { EventEmitter } = require('events');

class MyPlugin extends EventEmitter {
  constructor() {
    super();
  }

  async onActivate() {
    setInterval(() => {
      this.emit('data', { value: Math.random() });
    }, 1000);
  }
}
```

## Available APIs

### Node.js Built-ins

Your plugin has access to all Node.js built-in modules:

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');
```

### File System

Read and write files:

```javascript
const fs = require('fs');

class MyPlugin {
  saveData(data) {
    fs.writeFileSync('data.json', JSON.stringify(data));
  }

  loadData() {
    if (fs.existsSync('data.json')) {
      return JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    }
    return null;
  }
}
```

### System Information

Access system resources:

```javascript
const os = require('os');

class MyPlugin {
  getSystemInfo() {
    return {
      cpus: os.cpus().length,
      memory: os.totalmem(),
      platform: os.platform(),
    };
  }
}
```

## Plugin Examples

### Example 1: Data Logger

```javascript
const fs = require('fs');
const path = require('path');

class DataLoggerPlugin {
  constructor() {
    this.logFile = path.join(__dirname, 'logs.txt');
    this.timer = null;
  }

  async onActivate() {
    this.timer = setInterval(() => {
      this.log(`Timestamp: ${new Date().toISOString()}`);
    }, 5000);
  }

  log(message) {
    fs.appendFileSync(this.logFile, message + '\n');
  }

  async onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

module.exports = DataLoggerPlugin;
```

### Example 2: Resource Monitor

```javascript
const os = require('os');
const { EventEmitter } = require('events');

class ResourceMonitorPlugin extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
  }

  async onActivate() {
    this.interval = setInterval(() => {
      const metrics = {
        cpu: os.cpus().length,
        memory: os.freemem() / os.totalmem(),
        uptime: os.uptime(),
      };
      this.emit('metrics', metrics);
    }, 2000);
  }

  async onDeactivate() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

module.exports = ResourceMonitorPlugin;
```

## Testing Your Plugin

1. Place your plugin in the `plugins/` directory
2. Restart the application
3. The plugin will be automatically discovered and loaded
4. Check the console for plugin lifecycle messages

## Debugging

Enable debug logging to see plugin events:

```javascript
class MyPlugin {
  async onLoad() {
    console.log('[MyPlugin] Loaded at', new Date());
  }

  async onActivate() {
    console.log('[MyPlugin] Activated');
  }
}
```

## Security Considerations

1. **Validate Input**: Always validate and sanitize user input
2. **File Access**: Be careful with file system operations
3. **Resource Limits**: Implement timeouts and resource limits
4. **Error Boundaries**: Catch and handle errors to prevent crashes

## Distribution

To distribute your plugin:

1. Create a README.md with usage instructions
2. Package your plugin directory as a ZIP file
3. Users can extract it to their `plugins/` directory

## Need Help?

Check the included example plugins:
- `example-plugin`: Basic plugin template
- `system-monitor`: Real-time system monitoring
- `calculator`: Calculator with scientific operations
