import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { WindowManager } from './window-manager';
import { PluginManager } from './plugin-manager';
import { WorkerPoolManager } from './worker-pool-manager';
import { ChildProcessManager } from './child-process-manager';
import { IPCHandler } from './ipc-handler';
import { Logger } from '../shared/logger';

/**
 * Main application class
 */
class Application {
  private windowManager: WindowManager;
  private pluginManager: PluginManager;
  private workerPoolManager: WorkerPoolManager;
  private childProcessManager: ChildProcessManager;
  private ipcHandler: IPCHandler;
  private logger: Logger;

  constructor() {
    this.logger = Logger.create('Application');
    this.windowManager = WindowManager.getInstance();
    this.pluginManager = PluginManager.getInstance();
    this.workerPoolManager = WorkerPoolManager.getInstance();
    this.childProcessManager = ChildProcessManager.getInstance();
    this.ipcHandler = IPCHandler.getInstance();
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing application...');

    // Register IPC handlers
    this.ipcHandler.registerHandlers();

    // Set up plugin paths
    const pluginsPath = path.join(__dirname, '../../../plugins');
    this.pluginManager.addPluginPath(pluginsPath);

    // Initialize worker pool
    const workerScript = path.join(__dirname, '../workers/base-worker.js');
    await this.workerPoolManager.initialize(workerScript).catch((err) => {
      this.logger.error('Failed to initialize worker pool:', err);
    });

    // Discover and load plugins
    await this.pluginManager.discoverPlugins();

    this.logger.info('Application initialized');
  }

  /**
   * Create the main window
   */
  createMainWindow(): void {
    const htmlPath = path.join(__dirname, '../../../renderer/index.html');
    this.windowManager.createMainWindow(htmlPath);
  }

  /**
   * Shutdown the application
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down application...');

    // Shutdown worker pool
    await this.workerPoolManager.shutdown();

    // Kill all child processes
    this.childProcessManager.killAll();

    this.logger.info('Application shut down');
  }
}

// Create application instance
const application = new Application();

/**
 * App lifecycle handlers
 */

app.on('ready', async () => {
  await application.initialize();
  application.createMainWindow();
});

app.on('window-all-closed', () => {
  // On macOS, keep app running until user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  const mainWindow = WindowManager.getInstance().getMainWindow();
  if (!mainWindow) {
    application.createMainWindow();
  }
});

app.on('before-quit', async (event) => {
  event.preventDefault();
  await application.shutdown();
  app.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
