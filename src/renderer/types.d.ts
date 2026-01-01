/**
 * Type declarations for the Electron API exposed to renderer
 */

interface ElectronAPI {
  plugins: {
    list: () => Promise<{ success: boolean; plugins?: any[]; error?: string }>;
    load: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
    unload: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
    activate: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
    deactivate: (pluginId: string) => Promise<{ success: boolean; error?: string }>;
  };
  workers: {
    submitTask: (task: any) => Promise<{ success: boolean; result?: any; error?: string }>;
    cancelTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
    onTaskResult: (callback: (result: any) => void) => void;
    onTaskProgress: (callback: (progress: any) => void) => void;
  };
  system: {
    getInfo: () => Promise<{ success: boolean; info?: any; error?: string }>;
  };
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
  once: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
