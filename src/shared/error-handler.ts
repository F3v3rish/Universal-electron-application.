import { Logger } from './logger';

/**
 * Error codes for categorizing errors
 */
export enum ErrorCode {
  // System errors (1xxx)
  SYSTEM_UNKNOWN = 'SYS_1000',
  SYSTEM_INITIALIZATION_FAILED = 'SYS_1001',
  SYSTEM_SHUTDOWN_FAILED = 'SYS_1002',
  SYSTEM_OUT_OF_MEMORY = 'SYS_1003',

  // Worker errors (2xxx)
  WORKER_POOL_INIT_FAILED = 'WRK_2000',
  WORKER_TASK_FAILED = 'WRK_2001',
  WORKER_TASK_TIMEOUT = 'WRK_2002',
  WORKER_NOT_AVAILABLE = 'WRK_2003',

  // Plugin errors (3xxx)
  PLUGIN_NOT_FOUND = 'PLG_3000',
  PLUGIN_LOAD_FAILED = 'PLG_3001',
  PLUGIN_INVALID_MANIFEST = 'PLG_3002',
  PLUGIN_LIFECYCLE_FAILED = 'PLG_3003',
  PLUGIN_ALREADY_LOADED = 'PLG_3004',

  // IPC errors (4xxx)
  IPC_INVALID_CHANNEL = 'IPC_4000',
  IPC_INVALID_PAYLOAD = 'IPC_4001',
  IPC_HANDLER_FAILED = 'IPC_4002',

  // Child process errors (5xxx)
  CHILD_PROCESS_SPAWN_FAILED = 'CPR_5000',
  CHILD_PROCESS_COMMUNICATION_FAILED = 'CPR_5001',
  CHILD_PROCESS_TIMEOUT = 'CPR_5002',

  // Window errors (6xxx)
  WINDOW_CREATE_FAILED = 'WIN_6000',
  WINDOW_NOT_FOUND = 'WIN_6001',

  // File system errors (7xxx)
  FILE_NOT_FOUND = 'FS_7000',
  FILE_READ_FAILED = 'FS_7001',
  FILE_WRITE_FAILED = 'FS_7002',
  FILE_PERMISSION_DENIED = 'FS_7003',
}

/**
 * Application error with code and context
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: any;
  public readonly timestamp: number;
  public readonly recoverable: boolean;

  constructor(code: ErrorCode, message: string, context?: any, recoverable: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();
    this.recoverable = recoverable;

    // Maintain proper stack trace
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Convert to JSON for logging or IPC
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }

  /**
   * Create user-friendly error message
   */
  getUserMessage(): string {
    // Map error codes to user-friendly messages
    const userMessages: Record<string, string> = {
      [ErrorCode.SYSTEM_OUT_OF_MEMORY]:
        'The application is running low on memory. Please close some tasks.',
      [ErrorCode.WORKER_TASK_TIMEOUT]: 'The operation took too long and was cancelled.',
      [ErrorCode.PLUGIN_NOT_FOUND]: 'The requested plugin could not be found.',
      [ErrorCode.PLUGIN_LOAD_FAILED]: 'Failed to load the plugin. Please check the plugin files.',
      [ErrorCode.FILE_NOT_FOUND]: 'The requested file could not be found.',
      [ErrorCode.FILE_PERMISSION_DENIED]: 'Permission denied. Please check file permissions.',
    };

    return userMessages[this.code] || this.message;
  }
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  IGNORE = 'ignore',
  ABORT = 'abort',
  NOTIFY_USER = 'notify_user',
}

/**
 * Error recovery configuration
 */
export interface RecoveryConfig {
  strategy: RecoveryStrategy;
  maxRetries?: number;
  retryDelay?: number;
  fallbackAction?: () => Promise<any>;
  onError?: (error: AppError) => void;
}

/**
 * Centralized error handler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private logger: Logger;
  private errorListeners: Array<(error: AppError) => void> = [];

  private constructor() {
    this.logger = Logger.create('ErrorHandler');
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Register error listener
   */
  onError(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Handle an error
   */
  handle(error: Error | AppError, context?: any): void {
    const appError =
      error instanceof AppError
        ? error
        : new AppError(ErrorCode.SYSTEM_UNKNOWN, error.message, context);

    // Log the error
    this.logger.error(`[${appError.code}] ${appError.message}`, {
      context: appError.context,
      stack: appError.stack,
    });

    // Notify listeners
    this.errorListeners.forEach((listener) => {
      try {
        listener(appError);
      } catch (err) {
        this.logger.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Handle error with recovery
   */
  async handleWithRecovery<T>(
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<T | null> {
    const { strategy, maxRetries = 3, retryDelay = 1000, fallbackAction } = config;

    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= (maxRetries || 1); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError =
          error instanceof AppError
            ? error
            : new AppError(
                ErrorCode.SYSTEM_UNKNOWN,
                error instanceof Error ? error.message : String(error)
              );

        this.handle(lastError);

        if (strategy === RecoveryStrategy.RETRY && attempt < (maxRetries || 1)) {
          this.logger.warn(`Retrying operation (attempt ${attempt + 1}/${maxRetries})...`);
          await this.delay(retryDelay);
          continue;
        } else if (strategy === RecoveryStrategy.FALLBACK && fallbackAction) {
          this.logger.info('Executing fallback action...');
          try {
            return await fallbackAction();
          } catch (fallbackError) {
            this.logger.error('Fallback action failed:', fallbackError);
          }
        } else if (strategy === RecoveryStrategy.IGNORE) {
          this.logger.warn('Ignoring error as per recovery strategy');
          return null;
        }

        break;
      }
    }

    if (strategy === RecoveryStrategy.ABORT || strategy === RecoveryStrategy.NOTIFY_USER) {
      throw lastError;
    }

    return null;
  }

  /**
   * Wrap an async function with error handling
   */
  wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorCode: ErrorCode = ErrorCode.SYSTEM_UNKNOWN
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        const appError =
          error instanceof AppError
            ? error
            : new AppError(errorCode, error instanceof Error ? error.message : String(error));
        this.handle(appError);
        throw appError;
      }
    }) as T;
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear all error listeners
   */
  clearListeners(): void {
    this.errorListeners = [];
  }
}

/**
 * Convenience function to throw application errors
 */
export function throwError(
  code: ErrorCode,
  message: string,
  context?: any,
  recoverable: boolean = true
): never {
  throw new AppError(code, message, context, recoverable);
}

/**
 * Convenience function to create application errors
 */
export function createError(
  code: ErrorCode,
  message: string,
  context?: any,
  recoverable: boolean = true
): AppError {
  return new AppError(code, message, context, recoverable);
}
