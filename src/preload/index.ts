import { contextBridge, ipcRenderer } from 'electron';
import { IPCChannel } from '../shared/types';

/**
 * Preload script - Exposes safe APIs to the renderer process
 * This is the bridge between main and renderer processes
 */

// API exposed to renderer
const api = {
  // Plugin APIs
  plugins: {
    list: () => ipcRenderer.invoke(IPCChannel.PLUGIN_LIST),
    load: (pluginId: string) => ipcRenderer.invoke(IPCChannel.PLUGIN_LOAD, pluginId),
    unload: (pluginId: string) => ipcRenderer.invoke(IPCChannel.PLUGIN_UNLOAD, pluginId),
    activate: (pluginId: string) => ipcRenderer.invoke(IPCChannel.PLUGIN_ACTIVATE, pluginId),
    deactivate: (pluginId: string) => ipcRenderer.invoke(IPCChannel.PLUGIN_DEACTIVATE, pluginId),
  },

  // Worker APIs
  workers: {
    submitTask: (task: any) => ipcRenderer.invoke(IPCChannel.WORKER_SUBMIT_TASK, task),
    cancelTask: (taskId: string) => ipcRenderer.invoke(IPCChannel.WORKER_CANCEL_TASK, taskId),
    onTaskResult: (callback: (result: any) => void) => {
      ipcRenderer.on(IPCChannel.WORKER_TASK_RESULT, (_event, result) => callback(result));
    },
    onTaskProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on(IPCChannel.WORKER_TASK_PROGRESS, (_event, progress) => callback(progress));
    },
  },

  // System APIs
  system: {
    getInfo: () => ipcRenderer.invoke(IPCChannel.SYSTEM_INFO),
  },

  // Event listener management
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },

  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // One-time event listener
  once: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  },
};

// Expose API to renderer through context bridge
contextBridge.exposeInMainWorld('electronAPI', api);

// Type definitions for TypeScript (will be used by renderer)
export type ElectronAPI = typeof api;
