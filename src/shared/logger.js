"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const types_1 = require("./types");
/**
 * Logger service for consistent logging across the application
 */
class Logger {
    constructor(context = 'App') {
        this.context = context;
    }
    static getInstance(context) {
        if (!Logger.instance) {
            Logger.instance = new Logger(context);
        }
        return Logger.instance;
    }
    static create(context) {
        return new Logger(context);
    }
    log(level, message, ...args) {
        const logMessage = {
            level,
            message,
            timestamp: Date.now(),
            context: this.context,
        };
        const prefix = `[${logMessage.context}] [${level.toUpperCase()}]`;
        switch (level) {
            case types_1.LogLevel.DEBUG:
                console.debug(prefix, message, ...args);
                break;
            case types_1.LogLevel.INFO:
                console.info(prefix, message, ...args);
                break;
            case types_1.LogLevel.WARN:
                console.warn(prefix, message, ...args);
                break;
            case types_1.LogLevel.ERROR:
                console.error(prefix, message, ...args);
                break;
        }
    }
    debug(message, ...args) {
        this.log(types_1.LogLevel.DEBUG, message, ...args);
    }
    info(message, ...args) {
        this.log(types_1.LogLevel.INFO, message, ...args);
    }
    warn(message, ...args) {
        this.log(types_1.LogLevel.WARN, message, ...args);
    }
    error(message, ...args) {
        this.log(types_1.LogLevel.ERROR, message, ...args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map