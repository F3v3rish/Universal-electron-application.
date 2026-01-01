import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IPCChannel } from '../shared/types';
import { PluginManager } from './plugin-manager';
import { WorkerPoolManager } from './worker-pool-manager';
import { ChildProcessManager } from './child-process-manager';
import { WindowManager } from './window-manager';
import { Logger } from '../shared/logger';
import * as os from 'os';

/**
 * IPC handler for communication between main and renderer processes
 */
export class IPCHandler {
  private static instance: IPCHandler;
  private pluginManager: PluginManager;
  private workerPoolManager: WorkerPoolManager;
  private childProcessManager: ChildProcessManager;
  private windowManager: WindowManager;
  private logger: Logger;

  private constructor() {
    this.pluginManager = PluginManager.getInstance();
    this.workerPoolManager = WorkerPoolManager.getInstance();
    this.childProcessManager = ChildProcessManager.getInstance();
    this.windowManager = WindowManager.getInstance();
    this.logger = Logger.create('IPCHandler');
  }

  static getInstance(): IPCHandler {
    if (!IPCHandler.instance) {
      IPCHandler.instance = new IPCHandler();
    }
    return IPCHandler.instance;
  }

  /**
   * Register all IPC handlers
   */
  registerHandlers(): void {
    this.logger.info('Registering IPC handlers...');

    // Plugin handlers
    ipcMain.handle(IPCChannel.PLUGIN_LIST, this.handlePluginList.bind(this));
    ipcMain.handle(IPCChannel.PLUGIN_LOAD, this.handlePluginLoad.bind(this));
    ipcMain.handle(IPCChannel.PLUGIN_UNLOAD, this.handlePluginUnload.bind(this));
    ipcMain.handle(IPCChannel.PLUGIN_ACTIVATE, this.handlePluginActivate.bind(this));
    ipcMain.handle(IPCChannel.PLUGIN_DEACTIVATE, this.handlePluginDeactivate.bind(this));

    // Worker handlers
    ipcMain.handle(IPCChannel.WORKER_SUBMIT_TASK, this.handleWorkerSubmitTask.bind(this));
    ipcMain.handle(IPCChannel.WORKER_CANCEL_TASK, this.handleWorkerCancelTask.bind(this));

    // System handlers
    ipcMain.handle(IPCChannel.SYSTEM_INFO, this.handleSystemInfo.bind(this));

    this.logger.info('IPC handlers registered');
  }

  /**
   * Plugin handlers
   */
  private async handlePluginList(): Promise<any> {
    try {
      return {
        success: true,
        plugins: this.pluginManager.getLoadedPlugins(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handlePluginLoad(_event: IpcMainInvokeEvent, pluginId: string): Promise<any> {
    try {
      const success = await this.pluginManager.loadPlugin(pluginId);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handlePluginUnload(_event: IpcMainInvokeEvent, pluginId: string): Promise<any> {
    try {
      const success = await this.pluginManager.unloadPlugin(pluginId);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handlePluginActivate(_event: IpcMainInvokeEvent, pluginId: string): Promise<any> {
    try {
      const success = await this.pluginManager.activatePlugin(pluginId);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handlePluginDeactivate(_event: IpcMainInvokeEvent, pluginId: string): Promise<any> {
    try {
      const success = await this.pluginManager.deactivatePlugin(pluginId);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Worker handlers
   */
  private async handleWorkerSubmitTask(_event: IpcMainInvokeEvent, task: any): Promise<any> {
    try {
      const result = await this.workerPoolManager.submitTask(task);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleWorkerCancelTask(_event: IpcMainInvokeEvent, taskId: string): Promise<any> {
    try {
      const success = await this.workerPoolManager.cancelTask(taskId);
      return { success };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * System handlers
   */
  private async handleSystemInfo(): Promise<any> {
    try {
      const workerStats = this.workerPoolManager.getStats();
      const childProcessStats = this.childProcessManager.getStats();

      return {
        success: true,
        info: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          electronVersion: process.versions.electron,
          cpus: os.cpus().length,
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          uptime: os.uptime(),
          workerPool: workerStats,
          childProcesses: childProcessStats,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send message to renderer
   */
  sendToRenderer(channel: string, ...args: any[]): void {
    this.windowManager.sendToMainWindow(channel, ...args);
  }
}
