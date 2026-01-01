"use strict";
/**
 * Shared types for the Universal Electron Application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.IPCChannel = void 0;
/**
 * IPC channel names
 */
var IPCChannel;
(function (IPCChannel) {
    // Plugin channels
    IPCChannel["PLUGIN_LIST"] = "plugin:list";
    IPCChannel["PLUGIN_LOAD"] = "plugin:load";
    IPCChannel["PLUGIN_UNLOAD"] = "plugin:unload";
    IPCChannel["PLUGIN_ACTIVATE"] = "plugin:activate";
    IPCChannel["PLUGIN_DEACTIVATE"] = "plugin:deactivate";
    // Worker channels
    IPCChannel["WORKER_SUBMIT_TASK"] = "worker:submit-task";
    IPCChannel["WORKER_CANCEL_TASK"] = "worker:cancel-task";
    IPCChannel["WORKER_TASK_RESULT"] = "worker:task-result";
    IPCChannel["WORKER_TASK_PROGRESS"] = "worker:task-progress";
    // Window channels
    IPCChannel["WINDOW_CREATE"] = "window:create";
    IPCChannel["WINDOW_CLOSE"] = "window:close";
    IPCChannel["WINDOW_LIST"] = "window:list";
    // System channels
    IPCChannel["SYSTEM_INFO"] = "system:info";
    IPCChannel["LOG"] = "log";
})(IPCChannel || (exports.IPCChannel = IPCChannel = {}));
/**
 * Logger levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=types.js.map