# Universal Electron Application

A high-performance, universal Electron application with a **modern React UI**, single-window architecture, and advanced plugin system. Optimized for multi-function workflows using worker threads and child processes. Designed for high-end PCs with multi-core processors.

## ✨ New Features

- 🎨 **Modern React UI** with theme support (light/dark mode)
- ⚙️ **Settings Management** with JSON persistence
- 📊 **System Monitor Plugin** for real-time resource tracking
- 🧮 **Calculator Plugin** with scientific operations
- 🔧 **Enhanced Error Handling** with recovery strategies
- 📝 **File-based Logging** with rotation support
- 💅 **ESLint & Prettier** for code quality

## Screenshots

### Dark Theme Dashboard
![Dashboard](docs/screenshots/dashboard-dark.png)

### Light Theme with Settings
![Settings](docs/screenshots/settings-light.png)

*Note: Screenshots coming soon*

## Architecture Overview

This application implements a scalable, modular architecture with the following key components:

### Single Window Design
- **One Main Window**: All functionality is accessed through a single Electron window for optimal performance
- **No Multiple Windows**: Avoids overhead of managing multiple BrowserWindow instances
- **Focused UI**: Clean, unified interface for all application features

### Process Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                         │
│  ├── Application Lifecycle                              │
│  ├── Window Manager (Single Window)                     │
│  ├── Plugin Manager                                     │
│  ├── Worker Pool Manager                                │
│  ├── Child Process Manager                              │
│  └── IPC Handler                                        │
└─────────────────────────────────────────────────────────┘
                          │
                          │ IPC (Secure Communication)
                          │
┌─────────────────────────────────────────────────────────┐
│              Renderer Process (UI)                       │
│  └── Single Window with all UI components               │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────────────────┐           ┌─────────────────────────┐
│  Worker Threads   │           │   Child Processes       │
│  (CPU Tasks)      │           │   (Isolated Tasks)      │
│  ├── Worker 1     │           │   ├── Process 1         │
│  ├── Worker 2     │           │   ├── Process 2         │
│  └── Worker N     │           │   └── Process N         │
└───────────────────┘           └─────────────────────────┘
```

### Core Components

#### 1. **Main Process** (`src/main/`)
- **index.ts**: Application entry point and lifecycle management
- **window-manager.ts**: Single window creation and management
- **plugin-manager.ts**: Plugin discovery, loading, and lifecycle
- **worker-pool-manager.ts**: Worker thread pool for parallel computation
- **child-process-manager.ts**: Spawn and manage Node.js child processes
- **ipc-handler.ts**: Secure IPC communication between processes

#### 2. **Renderer Process** (`src/renderer/`)
- Single UI window with all application features
- Secure communication with main process via preload script
- TypeScript support with type definitions

#### 3. **Preload Script** (`src/preload/`)
- Context bridge for secure API exposure
- IPC wrapper for renderer-main communication

#### 4. **Worker Threads** (`src/workers/`)
- CPU-intensive task execution
- Parallel processing with worker pool
- Non-blocking operations

#### 5. **Plugin System** (`plugins/`)
- Modular architecture for extensibility
- Plugin lifecycle hooks (load, activate, deactivate, unload)
- Easy addition of new features

## Key Features

### Core Features
- ✅ **Single Window Architecture**: One main window for all functionality
- ✅ **Modern React UI**: Component-based interface with TypeScript
- ✅ **Theme System**: Light and dark mode with smooth transitions
- ✅ **Worker Thread Pool**: Parallel execution of CPU-intensive tasks
- ✅ **Child Process Support**: Spawn isolated Node.js processes for heavy workloads
- ✅ **Plugin System**: Modular, extensible architecture with hot-reload support
- ✅ **Settings Management**: Persistent configuration with validation
- ✅ **Enhanced Error Handling**: Centralized error management with recovery strategies
- ✅ **File-based Logging**: Rotating log files with configurable levels
- ✅ **High Performance**: Optimized for multi-core, high-end PCs
- ✅ **TypeScript**: Full TypeScript support for type safety
- ✅ **Secure**: Context isolation and preload script security

### Built-in Plugins
- 📊 **System Monitor**: Real-time CPU, memory, and load monitoring
- 🧮 **Calculator**: Basic and scientific calculations with history
- 📦 **Example Plugin**: Template for creating custom plugins

### Developer Experience
- 🔍 **ESLint**: Code quality and consistency
- 💅 **Prettier**: Automatic code formatting
- 📚 **Comprehensive Documentation**: Detailed guides and API docs
- 🛠️ **Easy Plugin Development**: Simple API and lifecycle hooks

## Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start in development mode
npm run dev

# Or build and start
npm start
```

## Development

### Build Scripts

```bash
# Build all components
npm run build

# Build main process only
npm run build:main

# Build renderer process only (with React)
npm run build:renderer

# Build preload script only
npm run build:preload

# Watch mode (auto-rebuild on changes)
npm run watch

# Lint and format
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Project Structure

```
universal-electron-application/
├── src/
│   ├── main/                  # Main process code
│   │   ├── index.ts           # Application entry
│   │   ├── window-manager.ts  # Window management
│   │   ├── plugin-manager.ts  # Plugin system
│   │   ├── worker-pool-manager.ts  # Worker threads
│   │   ├── child-process-manager.ts  # Child processes
│   │   └── ipc-handler.ts     # IPC communication
│   ├── renderer/              # Renderer process code
│   │   ├── index.ts           # UI logic
│   │   └── types.d.ts         # Type definitions
│   ├── preload/               # Preload script
│   │   └── index.ts           # Context bridge
│   ├── shared/                # Shared code
│   │   ├── types.ts           # Type definitions
│   │   ├── logger.ts          # Logger service
│   │   └── event-bus.ts       # Event system
│   └── workers/               # Worker scripts
│       ├── base-worker.ts     # Base worker implementation
│       └── child-process.ts   # Child process script
├── renderer/                  # Static assets
│   ├── index.html             # Main UI
│   └── styles.css             # Styles
├── plugins/                   # Plugin directory
│   └── example-plugin/        # Example plugin
├── dist/                      # Compiled output
├── package.json
└── tsconfig.*.json            # TypeScript configs
```

## Creating Plugins

Plugins extend the application with custom functionality. See [PLUGINS.md](PLUGINS.md) for the complete guide.

### Quick Start

1. Create a directory in `plugins/` with your plugin name
2. Add a `plugin.json` manifest file:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "author": "Your Name",
  "mainEntry": "index.js"
}
```

3. Create an `index.js` file with your plugin class:

```javascript
class MyPlugin {
  async onLoad() {
    console.log('Plugin loaded');
  }

  async onActivate() {
    // Plugin activation logic
  }

  async onDeactivate() {
    // Plugin deactivation logic
  }

  async onUnload() {
    // Cleanup
  }
}

module.exports = MyPlugin;
```

### Example Plugins

Check out the included plugins for reference:
- **system-monitor**: Real-time system resource monitoring
- **calculator**: Calculator with scientific operations
- **example-plugin**: Basic plugin template

## Using Worker Threads

Submit tasks to the worker pool from the renderer:

```javascript
const task = {
  id: 'unique-task-id',
  type: 'compute',
  data: { operation: 'sum', values: [1, 2, 3, 4, 5] },
};

const result = await window.electronAPI.workers.submitTask(task);
console.log(result);
```

## Performance Optimization

This application is optimized for high-end PCs:

- **Worker Pool**: Automatically scales to CPU core count
- **No Background Throttling**: Keeps processes running at full speed
- **Shared Array Buffers**: Enabled for advanced worker scenarios
- **WebGL**: Enabled for hardware-accelerated graphics
- **Context Isolation**: Security without performance penalty

## Security

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Preload script for safe API exposure
- ✅ Content Security Policy
- ✅ IPC message validation
- ✅ Centralized error handling
- ✅ Plugin sandboxing (coming soon)

## Documentation

- **[README.md](README.md)**: Project overview and quick start
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Detailed technical architecture
- **[USAGE.md](USAGE.md)**: API reference and usage examples
- **[PLUGINS.md](PLUGINS.md)**: Plugin development guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines
- **[CHANGELOG.md](CHANGELOG.md)**: Version history
- **[BUILD.md](BUILD.md)**: Build instructions
- **[QUICKSTART.md](QUICKSTART.md)**: Quick start guide
- **[ROADMAP.md](ROADMAP.md)**: Future plans

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linter and formatter: `npm run lint:fix && npm run format`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/)
- Bundled with [esbuild](https://esbuild.github.io/)
- Code quality with [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)
