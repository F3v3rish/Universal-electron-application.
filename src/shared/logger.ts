import { LogLevel, LogMessage } from './types';

/**
 * Logger service for consistent logging across the application
 */
export class Logger {
  private static instance: Logger;
  private context: string;

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

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: Date.now(),
      context: this.context,
    };

    const prefix = `[${logMessage.context}] [${level.toUpperCase()}]`;
    
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
}
