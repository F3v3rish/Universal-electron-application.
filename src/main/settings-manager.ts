import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { Logger } from '../shared/logger';
import { EventBus } from '../shared/event-bus';

/**
 * Default application settings
 */
export interface AppSettings {
  // General settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoUpdate: boolean;

  // Performance settings
  maxWorkerThreads?: number;
  enableFileLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // UI settings
  showWelcomeScreen: boolean;
  windowWidth: number;
  windowHeight: number;

  // Plugin settings
  autoLoadPlugins: boolean;
  pluginPaths: string[];

  // Advanced settings
  enableDevTools: boolean;
  enableBackgroundThrottling: boolean;
}

/**
 * Default settings values
 */
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'en',
  autoUpdate: true,
  enableFileLogging: true,
  logLevel: 'info',
  showWelcomeScreen: true,
  windowWidth: 1400,
  windowHeight: 900,
  autoLoadPlugins: true,
  pluginPaths: [],
  enableDevTools: false,
  enableBackgroundThrottling: false,
};

/**
 * Settings manager for application configuration
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AppSettings;
  private settingsPath: string;
  private logger: Logger;
  private eventBus: EventBus;

  private constructor() {
    this.logger = Logger.create('SettingsManager');
    this.eventBus = EventBus.getInstance();

    // Set settings file path
    const userDataPath = app.getPath('userData');
    this.settingsPath = path.join(userDataPath, 'settings.json');

    // Load settings
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Load settings from file
   */
  private loadSettings(): AppSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        const loaded = JSON.parse(data);

        // Merge with defaults to ensure all keys exist
        const merged = { ...DEFAULT_SETTINGS, ...loaded };

        this.logger.info('Settings loaded from file');
        return merged;
      }
    } catch (error) {
      this.logger.error('Failed to load settings:', error);
    }

    this.logger.info('Using default settings');
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to file
   */
  private saveSettings(): boolean {
    try {
      const data = JSON.stringify(this.settings, null, 2);

      // Ensure directory exists
      const dir = path.dirname(this.settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.settingsPath, data, 'utf-8');
      this.logger.info('Settings saved to file');
      return true;
    } catch (error) {
      this.logger.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Get a setting value
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * Set a setting value
   */
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
    try {
      const oldValue = this.settings[key];
      this.settings[key] = value;

      if (this.saveSettings()) {
        // Emit event for setting change
        this.eventBus.emit('settings:changed', { key, oldValue, newValue: value });
        this.logger.debug(`Setting updated: ${key} = ${JSON.stringify(value)}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to set setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all settings
   */
  getAll(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Update multiple settings at once
   */
  update(updates: Partial<AppSettings>): boolean {
    try {
      const changes: Array<{ key: string; oldValue: any; newValue: any }> = [];

      for (const [key, value] of Object.entries(updates)) {
        if (key in this.settings) {
          const typedKey = key as keyof AppSettings;
          const oldValue = this.settings[typedKey];
          (this.settings as any)[typedKey] = value;
          changes.push({ key, oldValue, newValue: value });
        }
      }

      if (this.saveSettings()) {
        // Emit events for all changes
        changes.forEach(({ key, oldValue, newValue }) => {
          this.eventBus.emit('settings:changed', { key, oldValue, newValue });
        });

        this.logger.info(`Updated ${changes.length} settings`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to update settings:', error);
      return false;
    }
  }

  /**
   * Reset settings to defaults
   */
  reset(): boolean {
    try {
      this.settings = { ...DEFAULT_SETTINGS };

      if (this.saveSettings()) {
        this.eventBus.emit('settings:reset');
        this.logger.info('Settings reset to defaults');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to reset settings:', error);
      return false;
    }
  }

  /**
   * Validate settings
   */
  validate(settings: Partial<AppSettings>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate theme
    if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
      errors.push('Invalid theme value');
    }

    // Validate log level
    if (settings.logLevel && !['debug', 'info', 'warn', 'error'].includes(settings.logLevel)) {
      errors.push('Invalid log level');
    }

    // Validate window dimensions
    if (settings.windowWidth && (settings.windowWidth < 800 || settings.windowWidth > 4000)) {
      errors.push('Window width must be between 800 and 4000');
    }

    if (settings.windowHeight && (settings.windowHeight < 600 || settings.windowHeight > 3000)) {
      errors.push('Window height must be between 600 and 3000');
    }

    // Validate worker threads
    if (
      settings.maxWorkerThreads &&
      (settings.maxWorkerThreads < 1 || settings.maxWorkerThreads > 32)
    ) {
      errors.push('Max worker threads must be between 1 and 32');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export settings to JSON string
   */
  export(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  import(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      const validation = this.validate(imported);

      if (!validation.valid) {
        this.logger.error('Invalid settings:', validation.errors);
        return false;
      }

      return this.update(imported);
    } catch (error) {
      this.logger.error('Failed to import settings:', error);
      return false;
    }
  }
}
