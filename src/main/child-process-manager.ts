import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import { Logger } from '../shared/logger';

/**
 * Message types for child process communication
 */
export interface ChildProcessMessage {
  type: string;
  id: string;
  data?: any;
  error?: string;
}

/**
 * Child process configuration
 */
export interface ChildProcessConfig {
  id: string;
  script: string;
  args?: string[];
  env?: NodeJS.ProcessEnv;
  silent?: boolean;
}

/**
 * Child process manager for handling multiple child processes
 * Optimized for high-end PCs with multiple cores
 */
export class ChildProcessManager extends EventEmitter {
  private static instance: ChildProcessManager;
  private processes: Map<string, ChildProcess> = new Map();
  private messageCallbacks: Map<string, Map<string, (data: any) => void>> = new Map();
  private logger: Logger;

  private constructor() {
    super();
    this.logger = Logger.create('ChildProcessManager');
  }

  static getInstance(): ChildProcessManager {
    if (!ChildProcessManager.instance) {
      ChildProcessManager.instance = new ChildProcessManager();
    }
    return ChildProcessManager.instance;
  }

  /**
   * Spawn a new child process
   */
  spawn(config: ChildProcessConfig): ChildProcess {
    if (this.processes.has(config.id)) {
      this.logger.warn(`Child process ${config.id} already exists`);
      return this.processes.get(config.id)!;
    }

    this.logger.info(`Spawning child process: ${config.id}`);

    const childProcess = fork(config.script, config.args || [], {
      silent: config.silent !== false,
      env: { ...process.env, ...config.env },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    // Handle messages from child process
    childProcess.on('message', (message: ChildProcessMessage) => {
      this.handleChildMessage(config.id, message);
    });

    // Handle errors
    childProcess.on('error', (error) => {
      this.logger.error(`Child process ${config.id} error:`, error);
      this.emit('process-error', { id: config.id, error });
    });

    // Handle exit
    childProcess.on('exit', (code, signal) => {
      this.logger.info(`Child process ${config.id} exited with code ${code}, signal ${signal}`);
      this.processes.delete(config.id);
      this.messageCallbacks.delete(config.id);
      this.emit('process-exit', { id: config.id, code, signal });
    });

    // Handle stdout
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        this.logger.debug(`[${config.id}] stdout:`, data.toString());
      });
    }

    // Handle stderr
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        this.logger.error(`[${config.id}] stderr:`, data.toString());
      });
    }

    this.processes.set(config.id, childProcess);
    this.messageCallbacks.set(config.id, new Map());

    return childProcess;
  }

  /**
   * Send message to child process
   */
  send(processId: string, message: ChildProcessMessage): boolean {
    const childProcess = this.processes.get(processId);
    
    if (!childProcess) {
      this.logger.warn(`Child process ${processId} not found`);
      return false;
    }

    childProcess.send(message);
    return true;
  }

  /**
   * Send message and wait for response with callback
   */
  sendWithCallback(
    processId: string,
    message: ChildProcessMessage,
    callback: (data: any) => void
  ): boolean {
    const childProcess = this.processes.get(processId);
    
    if (!childProcess) {
      this.logger.warn(`Child process ${processId} not found`);
      return false;
    }

    // Store callback
    const callbacks = this.messageCallbacks.get(processId);
    if (callbacks) {
      callbacks.set(message.id, callback);
    }

    childProcess.send(message);
    return true;
  }

  /**
   * Send message and wait for response with promise
   */
  async sendAsync(processId: string, message: ChildProcessMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const success = this.sendWithCallback(processId, message, (data) => {
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data);
        }
      });

      if (!success) {
        reject(new Error(`Failed to send message to process ${processId}`));
      }

      // Set timeout
      setTimeout(() => {
        const callbacks = this.messageCallbacks.get(processId);
        if (callbacks?.has(message.id)) {
          callbacks.delete(message.id);
          reject(new Error(`Timeout waiting for response from ${processId}`));
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Handle message from child process
   */
  private handleChildMessage(processId: string, message: ChildProcessMessage): void {
    const callbacks = this.messageCallbacks.get(processId);
    
    if (callbacks?.has(message.id)) {
      const callback = callbacks.get(message.id)!;
      callback(message.data);
      callbacks.delete(message.id);
    } else {
      // Emit as event if no callback registered
      this.emit('message', { processId, message });
    }
  }

  /**
   * Kill a child process
   */
  kill(processId: string, signal?: NodeJS.Signals): boolean {
    const childProcess = this.processes.get(processId);
    
    if (!childProcess) {
      return false;
    }

    this.logger.info(`Killing child process: ${processId}`);
    childProcess.kill(signal || 'SIGTERM');
    return true;
  }

  /**
   * Get all process IDs
   */
  getProcessIds(): string[] {
    return Array.from(this.processes.keys());
  }

  /**
   * Check if process exists
   */
  hasProcess(processId: string): boolean {
    return this.processes.has(processId);
  }

  /**
   * Kill all child processes
   */
  killAll(): void {
    this.logger.info('Killing all child processes...');
    
    this.processes.forEach((childProcess, id) => {
      this.logger.info(`Killing child process: ${id}`);
      childProcess.kill('SIGTERM');
    });

    this.processes.clear();
    this.messageCallbacks.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalProcesses: this.processes.size,
      processIds: Array.from(this.processes.keys()),
    };
  }
}
