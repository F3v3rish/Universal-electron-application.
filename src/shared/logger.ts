import { LogLevel, LogMessage } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Logger configuration
 */
export interface LoggerConfig {
  enableFileLogging?: boolean;
  logDirectory?: string;
  maxLogFileSize?: number; // in bytes
  maxLogFiles?: number;
  logLevel?: LogLevel;
}

/**
 * Logger service for consistent logging across the application
 */
export class Logger {
  private static instance: Logger;
  private static globalConfig: LoggerConfig = {
    enableFileLogging: false,
    maxLogFileSize: 10 * 1024 * 1024, // 10MB
    maxLogFiles: 5,
    logLevel: LogLevel.INFO,
  };
  private context: string;
  private logBuffer: LogMessage[] = [];
  private flushTimer?: NodeJS.Timeout;

  private constructor(context: string = 'App') {
    this.context = context;
  }

  static getInstance(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  static create(context: string): Logger {
    return new Logger(context);
  }

  /**
   * Configure global logger settings
   */
  static configure(config: LoggerConfig): void {
    Logger.globalConfig = { ...Logger.globalConfig, ...config };

    // Create log directory if file logging is enabled
    if (config.enableFileLogging && config.logDirectory) {
      try {
        if (!fs.existsSync(config.logDirectory)) {
          fs.mkdirSync(config.logDirectory, { recursive: true });
        }
      } catch (error) {
        console.error('Failed to create log directory:', error);
      }
    }
  }

  /**
   * Get current logger configuration
   */
  static getConfig(): LoggerConfig {
    return { ...Logger.globalConfig };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(Logger.globalConfig.logLevel || LogLevel.INFO);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logMessage: LogMessage = {
      level,
      message,
      timestamp: Date.now(),
      context: this.context,
    };

    const timestamp = new Date(logMessage.timestamp).toISOString();
    const prefix = `[${timestamp}] [${logMessage.context}] [${level.toUpperCase()}]`;
    const formattedMessage = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }

    // File logging
    if (Logger.globalConfig.enableFileLogging) {
      this.logBuffer.push(logMessage);
      this.scheduleFlush();
    }
  }

  /**
   * Schedule buffer flush to file
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return;
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = undefined;
    }, 1000); // Flush every second
  }

  /**
   * Flush log buffer to file
   */
  private flush(): void {
    if (this.logBuffer.length === 0 || !Logger.globalConfig.logDirectory) {
      return;
    }

    try {
      // Ensure log directory exists before writing
      if (!fs.existsSync(Logger.globalConfig.logDirectory)) {
        fs.mkdirSync(Logger.globalConfig.logDirectory, { recursive: true });
      }

      const logFile = path.join(Logger.globalConfig.logDirectory, 'app.log');
      const logEntries =
        this.logBuffer
          .map((log) => {
            const timestamp = new Date(log.timestamp).toISOString();
            return `[${timestamp}] [${log.context}] [${log.level.toUpperCase()}] ${log.message}`;
          })
          .join('\n') + '\n';

      // Check file size and rotate if necessary
      this.rotateLogsIfNeeded(logFile);

      // Append to log file
      fs.appendFileSync(logFile, logEntries, 'utf-8');
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to write logs to file:', error);
    }
  }

  /**
   * Rotate log files if max size is reached
   */
  private rotateLogsIfNeeded(logFile: string): void {
    try {
      if (!fs.existsSync(logFile)) {
        return;
      }

      const stats = fs.statSync(logFile);
      const maxSize = Logger.globalConfig.maxLogFileSize || 10 * 1024 * 1024;

      if (stats.size >= maxSize) {
        const maxFiles = Logger.globalConfig.maxLogFiles || 5;

        // Rotate existing log files
        for (let i = maxFiles - 1; i >= 1; i--) {
          const oldFile = `${logFile}.${i}`;
          const newFile = `${logFile}.${i + 1}`;

          if (fs.existsSync(oldFile)) {
            if (i === maxFiles - 1) {
              fs.unlinkSync(oldFile); // Delete oldest
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }

        // Rename current log file
        fs.renameSync(logFile, `${logFile}.1`);
      }
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Force flush logs to file
   */
  forceFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.flush();
  }
}
