import * as fs from 'fs';
import * as path from 'path';
import { IPlugin, PluginMetadata } from '../shared/types';
import { Logger } from '../shared/logger';
import { EventBus } from '../shared/event-bus';

/**
 * Plugin registry and loader
 */
export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, IPlugin> = new Map();
  private pluginPaths: string[] = [];
  private logger: Logger;
  private eventBus: EventBus;

  private constructor() {
    this.logger = Logger.create('PluginManager');
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  /**
   * Add a directory to search for plugins
   */
  addPluginPath(pluginPath: string): void {
    if (!fs.existsSync(pluginPath)) {
      this.logger.warn(`Plugin path does not exist: ${pluginPath}`);
      return;
    }

    this.pluginPaths.push(pluginPath);
    this.logger.info(`Added plugin path: ${pluginPath}`);
  }

  /**
   * Discover plugins in registered paths
   */
  async discoverPlugins(): Promise<PluginMetadata[]> {
    const discovered: PluginMetadata[] = [];

    for (const pluginPath of this.pluginPaths) {
      try {
        const entries = fs.readdirSync(pluginPath, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const manifestPath = path.join(pluginPath, entry.name, 'plugin.json');

            if (fs.existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                discovered.push(manifest);
              } catch (error) {
                this.logger.error(`Failed to read plugin manifest: ${manifestPath}`, error);
              }
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to discover plugins in ${pluginPath}:`, error);
      }
    }

    this.logger.info(`Discovered ${discovered.length} plugins`);
    return discovered;
  }

  /**
   * Load a plugin
   */
  async loadPlugin(pluginId: string): Promise<boolean> {
    if (this.plugins.has(pluginId)) {
      this.logger.warn(`Plugin ${pluginId} is already loaded`);
      return false;
    }

    try {
      // Find plugin directory
      let pluginDir: string | null = null;

      for (const basePath of this.pluginPaths) {
        const candidatePath = path.join(basePath, pluginId);
        if (fs.existsSync(path.join(candidatePath, 'plugin.json'))) {
          pluginDir = candidatePath;
          break;
        }
      }

      if (!pluginDir) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      // Read manifest
      const manifestPath = path.join(pluginDir, 'plugin.json');
      const manifest: PluginMetadata = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

      // Load main entry if exists
      let pluginInstance: IPlugin | null = null;

      if (manifest.mainEntry) {
        const mainPath = path.join(pluginDir, manifest.mainEntry);

        if (fs.existsSync(mainPath)) {
          const module = require(mainPath);
          const PluginClass = module.default || module;

          if (typeof PluginClass === 'function') {
            pluginInstance = new PluginClass();
          } else if (typeof PluginClass === 'object') {
            pluginInstance = PluginClass;
          }
        }
      }

      // Create minimal plugin instance if no main entry
      if (!pluginInstance) {
        pluginInstance = {
          metadata: manifest,
        };
      } else {
        pluginInstance.metadata = manifest;
      }

      // Call lifecycle hook
      if (pluginInstance.onLoad) {
        await pluginInstance.onLoad();
      }

      this.plugins.set(pluginId, pluginInstance);
      this.eventBus.emit('plugin:loaded', pluginId);

      this.logger.info(`Loaded plugin: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      this.logger.warn(`Plugin ${pluginId} is not loaded`);
      return false;
    }

    try {
      // Call lifecycle hook
      if (plugin.onUnload) {
        await plugin.onUnload();
      }

      this.plugins.delete(pluginId);
      this.eventBus.emit('plugin:unloaded', pluginId);

      this.logger.info(`Unloaded plugin: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      this.logger.warn(`Plugin ${pluginId} is not loaded`);
      return false;
    }

    try {
      if (plugin.onActivate) {
        await plugin.onActivate();
      }

      this.eventBus.emit('plugin:activated', pluginId);
      this.logger.info(`Activated plugin: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to activate plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      this.logger.warn(`Plugin ${pluginId} is not loaded`);
      return false;
    }

    try {
      if (plugin.onDeactivate) {
        await plugin.onDeactivate();
      }

      this.eventBus.emit('plugin:deactivated', pluginId);
      this.logger.info(`Deactivated plugin: ${pluginId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to deactivate plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }
}
