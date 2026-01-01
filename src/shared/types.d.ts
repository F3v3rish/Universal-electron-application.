/**
 * Shared types for the Universal Electron Application
 */
/**
 * Plugin metadata interface
 */
export interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description: string;
    author?: string;
    mainEntry?: string;
    rendererEntry?: string;
    workerEntry?: string;
}
/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
    onLoad?(): Promise<void> | void;
    onActivate?(): Promise<void> | void;
    onDeactivate?(): Promise<void> | void;
    onUnload?(): Promise<void> | void;
}
/**
 * Base plugin interface
 */
export interface IPlugin extends PluginLifecycle {
    metadata: PluginMetadata;
}
/**
 * Worker task interface
 */
export interface WorkerTask<T = any, R = any> {
    id: string;
    type: string;
    data: T;
    priority?: number;
    timeout?: number;
}
/**
 * Worker task result
 */
export interface WorkerTaskResult<R = any> {
    taskId: string;
    success: boolean;
    result?: R;
    error?: string;
}
/**
 * IPC channel names
 */
export declare enum IPCChannel {
    PLUGIN_LIST = "plugin:list",
    PLUGIN_LOAD = "plugin:load",
    PLUGIN_UNLOAD = "plugin:unload",
    PLUGIN_ACTIVATE = "plugin:activate",
    PLUGIN_DEACTIVATE = "plugin:deactivate",
    WORKER_SUBMIT_TASK = "worker:submit-task",
    WORKER_CANCEL_TASK = "worker:cancel-task",
    WORKER_TASK_RESULT = "worker:task-result",
    WORKER_TASK_PROGRESS = "worker:task-progress",
    WINDOW_CREATE = "window:create",
    WINDOW_CLOSE = "window:close",
    WINDOW_LIST = "window:list",
    SYSTEM_INFO = "system:info",
    LOG = "log"
}
/**
 * Window configuration
 */
export interface WindowConfig {
    id: string;
    title: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    frame?: boolean;
    show?: boolean;
}
/**
 * Logger levels
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
/**
 * Log message
 */
export interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: string;
}
//# sourceMappingURL=types.d.ts.map