import { BrowserWindow } from 'electron';
import * as path from 'path';
import { WindowConfig } from '../shared/types';
import { Logger } from '../shared/logger';

/**
 * Single-window manager for optimal performance
 * Manages one main window and uses child processes for heavy work
 */
export class WindowManager {
  private static instance: WindowManager;
  private mainWindow: BrowserWindow | null = null;
  private logger: Logger;
  private preloadScript: string;

  private constructor() {
    this.logger = Logger.create('WindowManager');
    this.preloadScript = path.join(__dirname, '../preload/index.js');
  }

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * Set preload script path
   */
  setPreloadScript(preloadPath: string): void {
    this.preloadScript = preloadPath;
  }

  /**
   * Create the main application window
   */
  createMainWindow(htmlPath: string): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.logger.warn('Main window already exists');
      this.mainWindow.focus();
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      resizable: true,
      frame: true,
      show: true,
      title: 'Universal Electron Application',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: this.preloadScript,
        // Enable performance features for high-end PCs
        webgl: true,
        backgroundThrottling: false,
        // Enable shared array buffer for advanced worker scenarios
        enableBlinkFeatures: 'SharedArrayBuffer',
      },
    });

    // Load HTML
    this.mainWindow.loadFile(htmlPath).catch((err) => {
      this.logger.error(`Failed to load ${htmlPath}:`, err);
    });

    // Handle window close
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.logger.info('Main window closed');
    });

    this.logger.info('Created main window');

    return this.mainWindow;
  }

  /**
   * Get the main window
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Close the main window
   */
  closeMainWindow(): boolean {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return false;
    }

    this.mainWindow.close();
    return true;
  }

  /**
   * Send message to main window
   */
  sendToMainWindow(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }
}
