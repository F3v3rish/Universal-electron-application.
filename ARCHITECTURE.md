# Architecture Documentation

## Overview

This Universal Electron Application implements a single-window, high-performance architecture designed for multi-function workflows on high-end PCs. The architecture leverages Electron's multi-process model with worker threads and child processes for optimal performance.

## Design Principles

### 1. Single Window Architecture
- **Why**: Reduces memory overhead and simplifies state management
- **How**: One `BrowserWindow` instance managed by `WindowManager`
- **Benefits**: 
  - Lower resource consumption
  - Simplified IPC communication
  - Better user experience with unified interface

### 2. Multi-Process Performance
- **Worker Threads**: For CPU-bound tasks (computation, data processing)
- **Child Processes**: For isolated tasks requiring separate Node.js runtime
- **Main Process**: For system operations and orchestration
- **Renderer Process**: For UI only

### 3. Callback-Based Communication
- **IPC Handlers**: Use Electron's `ipcMain.handle` for request-response patterns
- **Promises**: All async operations return promises for clean error handling
- **Event Emitters**: For fire-and-forget notifications

## Process Communication Flow

### Renderer → Main Process

```typescript
// In renderer
const result = await window.electronAPI.workers.submitTask(task);

// Flows through:
// 1. Preload script (context bridge)
// 2. IPC invoke
// 3. Main process IPC handler
// 4. Worker pool manager
// 5. Worker thread
// 6. Response back through IPC
```

### Main Process → Worker Thread

```typescript
// In main process
const result = await workerPoolManager.submitTask({
  id: 'task-1',
  type: 'compute',
  data: { /* task data */ }
});

// Worker thread receives message, processes, and responds
```

### Main Process → Child Process

```typescript
// In main process
const response = await childProcessManager.sendAsync('process-id', {
  type: 'heavy-task',
  id: 'msg-1',
  data: { /* data */ }
});

// Child process handles message and sends response
```

## Component Details

### Worker Pool Manager

**Purpose**: Manages a pool of worker threads for parallel execution

**Features**:
- Automatic scaling to CPU core count
- Task queue with priority support
- Timeout handling
- Resource cleanup

**Configuration**:
```typescript
// Default: CPU cores - 1
const maxWorkers = Math.max(os.cpus().length - 1, 1);
```

**Task Flow**:
1. Task submitted to queue
2. Queue sorted by priority
3. Available worker assigned
4. Task executed in worker
5. Result returned via message
6. Worker becomes available

### Child Process Manager

**Purpose**: Manages Node.js child processes for isolated workloads

**Features**:
- Process lifecycle management
- Message-based communication
- Callback and Promise support
- Automatic cleanup on exit

**Use Cases**:
- Long-running background tasks
- Native module execution
- Isolated computation
- File system operations

### Plugin System

**Purpose**: Extensible architecture for adding features

**Plugin Lifecycle**:
1. **Discovery**: Scan plugin directories for `plugin.json`
2. **Load**: Require plugin entry point
3. **Activate**: Call `onActivate()` hook
4. **Deactivate**: Call `onDeactivate()` hook
5. **Unload**: Call `onUnload()` hook and cleanup

**Plugin Structure**:
```
plugins/
└── my-plugin/
    ├── plugin.json      # Metadata
    ├── index.js         # Main entry (runs in main process)
    ├── renderer.js      # Optional renderer entry
    └── worker.js        # Optional worker entry
```

## Performance Optimizations

### 1. Worker Thread Pool
- **Why**: Avoid thread creation overhead
- **Implementation**: Pre-created pool of workers
- **Benefit**: Instant task execution

### 2. No Background Throttling
- **Why**: High-end PCs have resources to spare
- **Implementation**: `backgroundThrottling: false`
- **Benefit**: Consistent performance even when app is backgrounded

### 3. Shared Array Buffers
- **Why**: Zero-copy data sharing between threads
- **Implementation**: `enableBlinkFeatures: 'SharedArrayBuffer'`
- **Benefit**: Faster data transfer for large datasets

### 4. Task Priority Queue
- **Why**: Critical tasks execute first
- **Implementation**: Sort queue by priority
- **Benefit**: Better user experience for time-sensitive operations

### 5. IPC Message Batching
- **Why**: Reduce IPC overhead
- **Implementation**: Batch multiple messages when possible
- **Benefit**: Lower latency for high-frequency updates

## Security Considerations

### Context Isolation
- **Enabled**: `contextIsolation: true`
- **Why**: Prevents renderer from accessing Node.js directly
- **How**: Preload script with context bridge

### Node Integration
- **Disabled**: `nodeIntegration: false`
- **Why**: Security best practice
- **How**: All Node.js operations in main process via IPC

### Content Security Policy
- **Implemented**: Via meta tag in HTML
- **Why**: Prevents XSS attacks
- **Policy**: `default-src 'self'; script-src 'self'`

### IPC Validation
- **Required**: All IPC handlers validate input
- **Why**: Prevent malicious messages
- **How**: Type checking and sanitization

## Scalability

### Adding More Workers
```typescript
// Increase worker pool size
const workerPool = WorkerPoolManager.getInstance(16); // 16 workers
```

### Adding More Child Processes
```typescript
// Spawn multiple specialized processes
childProcessManager.spawn({ id: 'worker-1', script: './worker1.js' });
childProcessManager.spawn({ id: 'worker-2', script: './worker2.js' });
childProcessManager.spawn({ id: 'worker-3', script: './worker3.js' });
```

### Plugin Scaling
- Plugins are loaded on-demand
- Each plugin can have its own workers
- Plugins communicate via event bus

## Monitoring and Debugging

### System Information
```typescript
// Get performance metrics
const info = await electronAPI.system.getInfo();
// Returns: CPU count, memory, active workers, etc.
```

### Worker Pool Stats
```typescript
const stats = workerPoolManager.getStats();
// Returns: total workers, active workers, queued tasks
```

### Child Process Stats
```typescript
const stats = childProcessManager.getStats();
// Returns: total processes, process IDs
```

## Best Practices

### 1. Task Design
- Keep tasks focused and small
- Use workers for CPU-bound operations
- Use child processes for I/O-bound operations

### 2. Error Handling
- Always handle worker errors
- Implement task timeouts
- Provide fallback mechanisms

### 3. Resource Cleanup
- Terminate unused workers
- Kill inactive child processes
- Unload unused plugins

### 4. IPC Communication
- Minimize message size
- Use structured cloning efficiently
- Batch updates when possible

### 5. Plugin Development
- Follow lifecycle hooks
- Handle errors gracefully
- Clean up resources in `onUnload`

## Future Enhancements

### Potential Improvements
1. **Web Workers**: For renderer-side parallel processing
2. **GPU Acceleration**: For compute-heavy graphics tasks
3. **Native Modules**: Rust/C++ for maximum performance
4. **Database Integration**: SQLite for local data storage
5. **Network Workers**: Dedicated processes for API calls
6. **Hot Reload**: Plugin hot-reloading during development
7. **Process Monitoring**: Built-in performance profiler
8. **Auto-scaling**: Dynamic worker pool sizing based on load

## Troubleshooting

### Workers Not Starting
- Check if worker script path is correct
- Verify TypeScript is compiled to JavaScript
- Check console for errors

### Child Process Communication Issues
- Ensure child process sends messages correctly
- Check for proper message format
- Verify child process is running

### Plugin Not Loading
- Verify `plugin.json` is valid JSON
- Check plugin directory structure
- Look for errors in console

### Performance Issues
- Profile with Chrome DevTools
- Check worker pool utilization
- Monitor memory usage
- Verify tasks are distributed properly
