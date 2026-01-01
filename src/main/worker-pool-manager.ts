import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as os from 'os';
import { WorkerTask, WorkerTaskResult } from '../shared/types';
import { Logger } from '../shared/logger';

/**
 * Worker pool manager for handling CPU-intensive tasks
 * Optimized for high-end PCs with multiple cores
 */
export class WorkerPoolManager extends EventEmitter {
  private static instance: WorkerPoolManager;
  private workers: Worker[] = [];
  private taskQueue: Array<{ task: WorkerTask; resolve: Function; reject: Function }> = [];
  private activeTasks: Map<string, { worker: Worker; timeout?: NodeJS.Timeout }> = new Map();
  private maxWorkers: number;
  private logger: Logger;

  private constructor(maxWorkers?: number) {
    super();
    // Default to CPU count for high-end performance
    this.maxWorkers = maxWorkers || Math.max(os.cpus().length - 1, 1);
    this.logger = Logger.create('WorkerPool');
    this.logger.info(`Initializing worker pool with ${this.maxWorkers} workers`);
  }

  static getInstance(maxWorkers?: number): WorkerPoolManager {
    if (!WorkerPoolManager.instance) {
      WorkerPoolManager.instance = new WorkerPoolManager(maxWorkers);
    }
    return WorkerPoolManager.instance;
  }

  /**
   * Initialize the worker pool
   */
  async initialize(workerScript: string): Promise<void> {
    this.logger.info('Creating worker pool...');
    
    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(workerScript);
        
        worker.on('message', (message: WorkerTaskResult) => {
          this.handleWorkerMessage(worker, message);
        });
        
        worker.on('error', (error) => {
          this.logger.error(`Worker error:`, error);
          this.handleWorkerError(worker, error);
        });
        
        worker.on('exit', (code) => {
          if (code !== 0) {
            this.logger.error(`Worker stopped with exit code ${code}`);
          }
          this.removeWorker(worker);
        });
        
        this.workers.push(worker);
      } catch (error) {
        this.logger.error(`Failed to create worker:`, error);
      }
    }
    
    this.logger.info(`Worker pool created with ${this.workers.length} workers`);
  }

  /**
   * Submit a task to the worker pool
   */
  async submitTask<T = any, R = any>(task: WorkerTask<T, R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    if (this.taskQueue.length === 0) {
      return;
    }

    // Sort by priority (higher first)
    this.taskQueue.sort((a, b) => (b.task.priority || 0) - (a.task.priority || 0));

    // Find available workers
    const availableWorkers = this.workers.filter(
      (worker) => !Array.from(this.activeTasks.values()).some((t) => t.worker === worker)
    );

    while (availableWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = availableWorkers.shift()!;
      const { task, resolve, reject } = this.taskQueue.shift()!;

      this.logger.debug(`Assigning task ${task.id} to worker`);

      // Set up timeout if specified
      let timeout: NodeJS.Timeout | undefined;
      if (task.timeout) {
        timeout = setTimeout(() => {
          this.cancelTask(task.id);
          reject(new Error(`Task ${task.id} timed out after ${task.timeout}ms`));
        }, task.timeout);
      }

      this.activeTasks.set(task.id, { worker, timeout });

      // Store resolve/reject for later
      (worker as any).__taskCallbacks = (worker as any).__taskCallbacks || {};
      (worker as any).__taskCallbacks[task.id] = { resolve, reject };

      // Send task to worker
      worker.postMessage(task);
    }
  }

  /**
   * Handle message from worker
   */
  private handleWorkerMessage(worker: Worker, result: WorkerTaskResult): void {
    const taskInfo = this.activeTasks.get(result.taskId);
    if (!taskInfo) {
      return;
    }

    // Clear timeout
    if (taskInfo.timeout) {
      clearTimeout(taskInfo.timeout);
    }

    // Remove from active tasks
    this.activeTasks.delete(result.taskId);

    // Get callbacks
    const callbacks = (worker as any).__taskCallbacks?.[result.taskId];
    if (callbacks) {
      if (result.success) {
        callbacks.resolve(result.result);
      } else {
        callbacks.reject(new Error(result.error || 'Task failed'));
      }
      delete (worker as any).__taskCallbacks[result.taskId];
    }

    // Emit result event
    this.emit('taskComplete', result);

    // Process next task in queue
    this.processQueue();
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(worker: Worker, error: Error): void {
    // Find and reject all tasks assigned to this worker
    for (const [taskId, taskInfo] of this.activeTasks.entries()) {
      if (taskInfo.worker === worker) {
        const callbacks = (worker as any).__taskCallbacks?.[taskId];
        if (callbacks) {
          callbacks.reject(error);
          delete (worker as any).__taskCallbacks[taskId];
        }
        
        if (taskInfo.timeout) {
          clearTimeout(taskInfo.timeout);
        }
        
        this.activeTasks.delete(taskId);
      }
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const taskInfo = this.activeTasks.get(taskId);
    if (!taskInfo) {
      return false;
    }

    if (taskInfo.timeout) {
      clearTimeout(taskInfo.timeout);
    }

    this.activeTasks.delete(taskId);
    
    // Notify worker to cancel (worker needs to handle this)
    taskInfo.worker.postMessage({ type: 'cancel', taskId });
    
    return true;
  }

  /**
   * Remove a worker from the pool
   */
  private removeWorker(worker: Worker): void {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      this.workers.splice(index, 1);
    }
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down worker pool...');
    
    // Clear task queue
    this.taskQueue.forEach(({ reject }) => {
      reject(new Error('Worker pool is shutting down'));
    });
    this.taskQueue = [];

    // Terminate all workers
    await Promise.all(
      this.workers.map((worker) =>
        worker.terminate().catch((err) => {
          this.logger.error('Error terminating worker:', err);
        })
      )
    );

    this.workers = [];
    this.activeTasks.clear();
    
    this.logger.info('Worker pool shut down');
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      totalWorkers: this.workers.length,
      activeWorkers: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      maxWorkers: this.maxWorkers,
    };
  }
}
