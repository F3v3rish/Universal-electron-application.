# Usage Guide

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic understanding of Electron applications

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Universal-electron-application
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the application:
```bash
npm start
```

### Development Mode

For development with auto-rebuild:

```bash
# Terminal 1: Watch and rebuild on changes
npm run watch

# Terminal 2: Run the application
npm start
```

## Using the Application

### Main Window

The application opens with a single main window showing:

1. **System Information**: Hardware specs, memory usage, worker pool status
2. **Worker Thread Test**: Button to test the worker pool with a sample computation
3. **Loaded Plugins**: List of currently loaded plugins
4. **Architecture Features**: Overview of the application's capabilities

### Testing Worker Threads

Click the "Run Worker Task" button to submit a sample computation to the worker pool. The result will appear in the output box below the button.

Example task:
```javascript
{
  id: 'task-12345',
  type: 'compute',
  data: {
    operation: 'sum',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
}
```

## Creating Custom Workers

### Adding Worker Task Types

Edit `src/workers/base-worker.ts` to add new task handlers:

```typescript
registerTaskHandler('my-task', async (data: { /* your data type */ }) => {
  // Your task logic here
  const result = performComputation(data);
  return result;
});
```

### Using Child Processes

For heavier, isolated tasks, use the child process manager:

```typescript
// In main process
import { ChildProcessManager } from './child-process-manager';

const manager = ChildProcessManager.getInstance();

// Spawn a child process
manager.spawn({
  id: 'my-worker',
  script: path.join(__dirname, 'workers/my-child-process.js'),
});

// Send a task
const result = await manager.sendAsync('my-worker', {
  type: 'heavy-task',
  id: 'task-1',
  data: { /* your data */ }
});
```

## Creating Plugins

### Plugin Structure

Create a new directory in `plugins/`:

```
plugins/
└── my-plugin/
    ├── plugin.json      # Plugin metadata
    ├── index.js         # Main process entry
    ├── renderer.js      # (Optional) Renderer process code
    └── worker.js        # (Optional) Worker thread code
```

### plugin.json Example

```json
{
  "id": "my-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "Does something awesome",
  "author": "Your Name",
  "mainEntry": "index.js",
  "rendererEntry": "renderer.js",
  "workerEntry": "worker.js"
}
```

### Plugin Implementation

```javascript
// plugins/my-plugin/index.js
class MyPlugin {
  async onLoad() {
    console.log('Plugin loaded');
    // Initialize your plugin
  }

  async onActivate() {
    console.log('Plugin activated');
    // Start plugin functionality
  }

  async onDeactivate() {
    console.log('Plugin deactivated');
    // Pause plugin functionality
  }

  async onUnload() {
    console.log('Plugin unloaded');
    // Clean up resources
  }

  // Custom methods
  async doSomething(params) {
    // Your plugin logic
    return { success: true, result: 'Done!' };
  }
}

module.exports = MyPlugin;
```

### Accessing Plugin from Renderer

```javascript
// In renderer process
const result = await window.electronAPI.plugins.list();
console.log('Loaded plugins:', result.plugins);

// Load a plugin
await window.electronAPI.plugins.load('my-plugin');

// Activate a plugin
await window.electronAPI.plugins.activate('my-plugin');
```

## API Reference

### Renderer API

All APIs are available through `window.electronAPI`:

#### Plugins

```javascript
// List loaded plugins
const { success, plugins } = await window.electronAPI.plugins.list();

// Load a plugin
const { success, error } = await window.electronAPI.plugins.load('plugin-id');

// Unload a plugin
await window.electronAPI.plugins.unload('plugin-id');

// Activate a plugin
await window.electronAPI.plugins.activate('plugin-id');

// Deactivate a plugin
await window.electronAPI.plugins.deactivate('plugin-id');
```

#### Workers

```javascript
// Submit a task to the worker pool
const task = {
  id: 'unique-id',
  type: 'compute',
  data: { /* your data */ },
  priority: 1, // Optional, higher = more important
  timeout: 30000 // Optional, in milliseconds
};

const { success, result, error } = await window.electronAPI.workers.submitTask(task);

// Cancel a task
await window.electronAPI.workers.cancelTask('task-id');

// Listen for task results
window.electronAPI.workers.onTaskResult((result) => {
  console.log('Task completed:', result);
});

// Listen for task progress updates
window.electronAPI.workers.onTaskProgress((progress) => {
  console.log('Task progress:', progress);
});
```

#### System

```javascript
// Get system information
const { success, info } = await window.electronAPI.system.getInfo();
console.log('CPU count:', info.cpus);
console.log('Memory:', info.totalMemory);
console.log('Worker pool:', info.workerPool);
```

#### Events

```javascript
// Listen for custom events
window.electronAPI.on('my-event', (data) => {
  console.log('Event received:', data);
});

// Remove event listener
window.electronAPI.off('my-event', callback);

// Listen once
window.electronAPI.once('my-event', (data) => {
  console.log('Event received once:', data);
});
```

## Performance Tips

### Optimizing Worker Tasks

1. **Keep tasks small**: Break large computations into smaller chunks
2. **Use priority**: Set priority for time-sensitive tasks
3. **Batch operations**: Group related operations together
4. **Avoid large data transfers**: Minimize data sent to/from workers

### Optimizing Child Processes

1. **Reuse processes**: Don't spawn/kill frequently
2. **Use for I/O**: Child processes are great for file/network operations
3. **Handle errors**: Always implement error handling
4. **Clean shutdown**: Kill processes gracefully when done

### Memory Management

1. **Monitor usage**: Check system info regularly
2. **Limit concurrent tasks**: Don't queue unlimited tasks
3. **Clean up**: Remove event listeners when done
4. **Unload plugins**: Unload unused plugins

## Troubleshooting

### Application Won't Start

1. Check that build completed successfully: `npm run build`
2. Verify node_modules are installed: `npm install`
3. Check console for errors: `npm start`
4. Try clearing dist folder and rebuilding

### Worker Tasks Failing

1. Check worker script exists at correct path
2. Verify task type is registered in base-worker.ts
3. Check task data format matches handler expectations
4. Look for errors in console

### Plugin Not Loading

1. Verify plugin.json is valid JSON
2. Check plugin ID matches directory name
3. Ensure mainEntry file exists
4. Check console for plugin errors

### Build Errors

1. Run `npm install` to ensure dependencies are up to date
2. Delete dist/ and node_modules/, then reinstall and rebuild
3. Check TypeScript version compatibility
4. Verify all imports are correct

## Advanced Usage

### Custom Worker Pool Size

Edit `src/main/index.ts`:

```typescript
// Initialize with custom worker count
const workerPoolManager = WorkerPoolManager.getInstance(8); // 8 workers
```

### Multiple Child Processes

```typescript
const manager = ChildProcessManager.getInstance();

// Spawn multiple specialized workers
manager.spawn({ id: 'file-processor', script: './workers/file-worker.js' });
manager.spawn({ id: 'data-analyzer', script: './workers/data-worker.js' });
manager.spawn({ id: 'api-client', script: './workers/api-worker.js' });
```

### Custom IPC Channels

Add to `src/main/ipc-handler.ts`:

```typescript
ipcMain.handle('my-custom-channel', async (event, data) => {
  // Your custom logic
  return { success: true, result: 'Custom response' };
});
```

And in preload script `src/preload/index.ts`:

```typescript
const api = {
  // ... existing APIs
  myCustomAPI: {
    doSomething: (data: any) => ipcRenderer.invoke('my-custom-channel', data),
  },
};
```

## Building for Production

### Create Distributable

```bash
npm run package
```

This creates platform-specific installers in the `release/` directory.

### Platform-Specific Builds

Edit `package.json` build configuration:

```json
"build": {
  "appId": "com.yourcompany.app",
  "productName": "Your App Name",
  "mac": {
    "category": "public.app-category.utilities",
    "target": "dmg"
  },
  "win": {
    "target": ["nsis", "portable"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

## Contributing

When adding features:

1. Follow existing code style
2. Add TypeScript types for new APIs
3. Document new features in this guide
4. Test on multiple platforms if possible
5. Update ARCHITECTURE.md for significant changes

## Support

For issues, feature requests, or questions:
- Check existing documentation
- Review ARCHITECTURE.md for technical details
- Search closed issues
- Open a new issue with details
