# Copilot Instructions for Universal Electron Application

This document provides guidance for GitHub Copilot when working with this codebase.

## Project Overview

This is a high-performance, universal Electron application with a **single-window architecture** optimized for multi-function workflows using worker threads and child processes. It's designed for high-end PCs with multi-core processors.

### Key Architecture Principles

1. **Single Window Design**: One main Electron window for all functionality (avoid creating multiple windows)
2. **Multi-Process Performance**: Uses worker threads for CPU-bound tasks and child processes for isolated operations
3. **Plugin System**: Modular, extensible architecture for adding features
4. **Security-First**: Context isolation enabled, node integration disabled in renderer

## Project Structure

```
src/
├── main/                          # Main process (Node.js environment)
│   ├── index.ts                   # Application entry point
│   ├── window-manager.ts          # Single window management
│   ├── plugin-manager.ts          # Plugin lifecycle
│   ├── worker-pool-manager.ts     # Worker thread pool
│   ├── child-process-manager.ts   # Child process management
│   └── ipc-handler.ts             # IPC communication
├── renderer/                      # Renderer process (Browser environment)
│   └── index.ts                   # UI logic
├── preload/                       # Preload script (Bridge)
│   └── index.ts                   # Context bridge for secure API exposure
├── shared/                        # Shared code between processes
│   ├── types.ts                   # Type definitions
│   ├── logger.ts                  # Logger service
│   └── event-bus.ts               # Event system
└── workers/                       # Worker scripts
    ├── base-worker.ts             # Base worker implementation
    └── child-process.ts           # Child process script
```

## Build and Test Commands

### Building
```bash
npm run build           # Build all components
npm run build:main      # Build main process only
npm run build:renderer  # Build renderer process only
npm run build:preload   # Build preload script only
```

### Development
```bash
npm run dev            # Build and run in development mode
npm run watch          # Auto-rebuild on file changes (use in separate terminal)
npm start              # Same as npm run dev (build and start)
```

### Testing
- **Current State**: No test framework is currently configured
- **Manual Testing**: Test the application by running `npm run dev`
- **Recommended for Future**: Consider adding testing frameworks like Jest for unit tests, Spectron/Playwright for E2E tests
- **When Making Changes**: Always manually test the application after building

## Code Style and Conventions

### TypeScript
- **Language**: Use TypeScript for all new code
- **Strict Mode**: TypeScript strict mode is enabled
- **Type Safety**: Always provide explicit types for function parameters and return values
- **No `any`**: Avoid using `any` type; use `unknown` or specific types

### Process Communication
- **Renderer → Main**: Always use `window.electronAPI` (exposed via preload script)
- **Main → Renderer**: Use `webContents.send()` for events
- **IPC Handlers**: Use `ipcMain.handle()` for request-response patterns (returns promises)
- **Validation**: Always validate IPC messages for security

### Worker Threads
- Use worker threads for **CPU-intensive** tasks (computations, data processing)
- Keep tasks focused and small
- Submit tasks via `workerPoolManager.submitTask()`
- Handle timeouts and errors gracefully

### Child Processes
- Use child processes for **isolated Node.js operations** or long-running tasks
- Message-based communication via `childProcessManager.sendAsync()`
- Always clean up processes when done

### Error Handling
- Use try-catch blocks for async operations
- Log errors using the shared logger service
- Provide meaningful error messages
- Handle worker/child process failures gracefully

### File Naming
- Use kebab-case for file names: `window-manager.ts`, `plugin-manager.ts`
- Use PascalCase for class names: `WindowManager`, `PluginManager`
- Use camelCase for variables and functions

## Security Considerations

### Required Security Practices
1. **Context Isolation**: Always maintain `contextIsolation: true`
2. **No Node Integration**: Keep `nodeIntegration: false` in renderer
3. **Preload Script**: Use context bridge for all API exposure
4. **IPC Validation**: Validate all incoming IPC messages
5. **CSP**: Maintain Content Security Policy in HTML

### DO NOT
- ❌ Enable `nodeIntegration` in renderer process
- ❌ Disable `contextIsolation`
- ❌ Expose Node.js APIs directly to renderer
- ❌ Trust renderer input without validation
- ❌ Store sensitive data in renderer process

## Plugin Development

### Plugin Structure
```
plugins/
└── plugin-name/
    ├── plugin.json    # Required: Manifest with metadata
    ├── index.js       # Required: Plugin class with lifecycle hooks
    ├── renderer.js    # Optional: Renderer-side code
    └── worker.js      # Optional: Worker thread code
```

### Plugin Lifecycle Hooks
All plugins must implement:
- `onLoad()`: Called when plugin is loaded
- `onActivate()`: Called when plugin is activated
- `onDeactivate()`: Called when plugin is deactivated
- `onUnload()`: Called when plugin is unloaded (cleanup)

### Plugin Manifest (plugin.json)
```json
{
  "id": "unique-plugin-id",
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Author Name",
  "mainEntry": "index.js"
}
```

## Common Patterns

### Adding a New IPC Handler
```typescript
// In ipc-handler.ts
ipcMain.handle('channel-name', async (event, arg) => {
  try {
    // Validate input
    if (!arg || typeof arg !== 'expected-type') {
      throw new Error('Invalid argument');
    }
    
    // Process request
    const result = await someOperation(arg);
    return result;
  } catch (error) {
    logger.error('Error in handler:', error);
    throw error;
  }
});
```

### Exposing API via Preload
```typescript
// In preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  methodName: (arg) => ipcRenderer.invoke('channel-name', arg)
});
```

### Submitting Worker Task
```typescript
// From renderer
const result = await window.electronAPI.workers.submitTask({
  id: 'unique-task-id',
  type: 'task-type',
  data: { /* task data */ }
});
```

## Performance Guidelines

### Optimization for High-End PCs
- Worker pool automatically scales to CPU core count
- Background throttling is disabled for consistent performance
- SharedArrayBuffer enabled for zero-copy data sharing
- Use worker threads for parallelizable tasks

### Best Practices
1. **Keep UI Responsive**: Move heavy operations to workers/child processes
2. **Minimize IPC**: Batch messages when possible to reduce overhead
3. **Resource Cleanup**: Always terminate unused workers and child processes
4. **Task Priority**: Use task priority queue for time-sensitive operations

## Dependencies

### Core Dependencies
- **Electron**: ^28.0.0 (Desktop application framework)
- **TypeScript**: ^5.3.2 (Type safety)
- **@types/node**: ^20.10.0 (Node.js type definitions)

### Build Tools
- **concurrently**: For running multiple build commands
- **electron-builder**: For packaging the application

### Adding Dependencies
- Prefer built-in Node.js/Electron APIs over external packages
- Always justify new dependencies
- Keep the dependency tree minimal for performance

## Documentation Files

- **README.md**: Project overview and quick start
- **ARCHITECTURE.md**: Detailed technical architecture
- **BUILD.md**: Build instructions and troubleshooting
- **USAGE.md**: API reference and usage examples
- **QUICKSTART.md**: Quick start guide with examples
- **ROADMAP.md**: Future plans and enhancements

## Important Notes for Copilot

1. **Single Window Only**: Never create additional BrowserWindow instances. All functionality must be in the main window.
2. **Process Separation**: Keep main process logic in `src/main/`, renderer in `src/renderer/`, shared in `src/shared/`.
3. **Security First**: Never compromise on security settings (context isolation, node integration).
4. **Type Safety**: Always use TypeScript with explicit types.
5. **Error Handling**: All async operations need proper error handling.
6. **Resource Management**: Clean up workers, child processes, and event listeners.
7. **IPC Communication**: All renderer-main communication must go through the preload script's context bridge.

## When Making Changes

1. **Build First**: Run `npm run build` to ensure TypeScript compiles
2. **Test Manually**: Run `npm run dev` to test changes in the application
3. **Check Console**: Look for errors in both main and renderer DevTools
4. **Verify Security**: Ensure changes don't compromise security settings
5. **Update Docs**: Update relevant documentation if changing public APIs

## Questions to Ask Before Making Changes

- Does this maintain the single-window architecture?
- Is this the right process for this operation (main/renderer/worker/child)?
- Does this follow security best practices?
- Will this work on Linux, macOS, and Windows?
- Is error handling implemented properly?
- Are resources properly cleaned up?
