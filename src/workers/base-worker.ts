import { parentPort } from 'worker_threads';
import { WorkerTask, WorkerTaskResult } from '../shared/types';

/**
 * Base worker implementation
 * This worker can be extended or replaced with plugin-specific workers
 */

if (!parentPort) {
  throw new Error('This script must be run as a worker thread');
}

// Task handlers registry
const taskHandlers: Map<string, (data: any) => Promise<any>> = new Map();

/**
 * Register a task handler
 */
export function registerTaskHandler(
  type: string,
  handler: (data: any) => Promise<any>
): void {
  taskHandlers.set(type, handler);
}

/**
 * Example task handlers
 */

// CPU-intensive calculation example
registerTaskHandler('compute', async (data: { operation: string; values: number[] }) => {
  const { operation, values } = data;
  
  switch (operation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'product':
      return values.reduce((a, b) => a * b, 1);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});

// Data processing example
registerTaskHandler('processData', async (data: { items: any[]; transform: string }) => {
  const { items, transform } = data;
  
  // Simulate heavy processing
  return items.map((item) => {
    // Apply transformation based on type
    switch (transform) {
      case 'uppercase':
        return typeof item === 'string' ? item.toUpperCase() : item;
      case 'double':
        return typeof item === 'number' ? item * 2 : item;
      default:
        return item;
    }
  });
});

// Message handler
parentPort.on('message', async (task: WorkerTask | { type: string; taskId: string }) => {
  // Handle cancellation
  if ('type' in task && task.type === 'cancel') {
    // Worker can implement cancellation logic here
    return;
  }

  const workerTask = task as WorkerTask;
  const result: WorkerTaskResult = {
    taskId: workerTask.id,
    success: false,
  };

  try {
    const handler = taskHandlers.get(workerTask.type);
    
    if (!handler) {
      throw new Error(`No handler registered for task type: ${workerTask.type}`);
    }

    const taskResult = await handler(workerTask.data);
    result.success = true;
    result.result = taskResult;
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  // Send result back to main thread
  parentPort!.postMessage(result);
});

// Signal worker is ready
parentPort.postMessage({ type: 'ready' });
