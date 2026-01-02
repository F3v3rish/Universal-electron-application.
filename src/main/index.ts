import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { WindowManager } from './window-manager';
import { PluginManager } from './plugin-manager';
import { WorkerPoolManager } from './worker-pool-manager';
import { ChildProcessManager } from './child-process-manager';
import { IPCHandler } from './ipc-handler';
import { Logger } from '../shared/logger';
import { ErrorHandler, AppError, ErrorCode, RecoveryStrategy } from '../shared/error-handler';

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
  private errorHandler: ErrorHandler;

  constructor() {
    // Configure logger first
    const logDirectory = path.join(app.getPath('userData'), 'logs');
    Logger.configure({
      enableFileLogging: true,
      logDirectory,
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      maxLogFiles: 5,
    });

    this.logger = Logger.create('Application');
    this.errorHandler = ErrorHandler.getInstance();
    
    // Set up error handler listener
    this.errorHandler.onError((error: AppError) => {
      // Send critical errors to renderer for user notification
      if (!error.recoverable) {
        this.windowManager.sendToMainWindow('error:critical', error.toJSON());
      }
    });

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
    try {
      this.logger.info('Initializing application...');
      this.logger.info(`Platform: ${process.platform}, Architecture: ${process.arch}`);
      this.logger.info(`Node: ${process.version}, Electron: ${process.versions.electron}`);
      this.logger.info(`CPUs: ${os.cpus().length}, Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);

      // Register IPC handlers
      this.ipcHandler.registerHandlers();

      // Set up plugin paths
      const pluginsPath = path.join(__dirname, '../../../plugins');
      this.pluginManager.addPluginPath(pluginsPath);

      // Initialize worker pool with error handling
      const workerScript = path.join(__dirname, '../workers/base-worker.js');
      await this.errorHandler.handleWithRecovery(
        () => this.workerPoolManager.initialize(workerScript),
        {
          strategy: RecoveryStrategy.RETRY,
          maxRetries: 3,
          retryDelay: 1000,
          onError: (error) => {
            this.logger.error('Worker pool initialization failed:', error);
          },
        }
      ).catch((err) => {
        this.logger.error('Failed to initialize worker pool after retries:', err);
        throw new AppError(
          ErrorCode.WORKER_POOL_INIT_FAILED,
          'Could not initialize worker pool',
          { error: err },
          false
        );
      });

      // Discover and load plugins
      await this.pluginManager.discoverPlugins();

      this.logger.info('Application initialized successfully');
    } catch (error) {
      this.logger.error('Application initialization failed:', error);
      this.errorHandler.handle(
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
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
    try {
      this.logger.info('Shutting down application...');

      // Shutdown worker pool
      await this.workerPoolManager.shutdown().catch((err) => {
        this.logger.error('Error shutting down worker pool:', err);
      });

      // Kill all child processes
      this.childProcessManager.killAll();

      // Flush logs before exiting
      this.logger.forceFlush();

      this.logger.info('Application shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      this.errorHandler.handle(
        error instanceof Error ? error : new Error(String(error))
      );
    }
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
  const logger = Logger.create('UncaughtException');
  logger.error('Uncaught exception:', error);
  
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.handle(
    new AppError(
      ErrorCode.SYSTEM_UNKNOWN,
      'Uncaught exception occurred',
      { error: error.message, stack: error.stack },
      false
    )
  );
});

process.on('unhandledRejection', (reason, promise) => {
  const logger = Logger.create('UnhandledRejection');
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.handle(
    new AppError(
      ErrorCode.SYSTEM_UNKNOWN,
      'Unhandled promise rejection',
      { reason, promise },
      false
    )
  );
});
