/**
 * Logger service for consistent logging across the application
 */
export declare class Logger {
  private static instance;
  private context;
  private constructor();
  static getInstance(context?: string): Logger;
  static create(context: string): Logger;
  private log;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
//# sourceMappingURL=logger.d.ts.map
