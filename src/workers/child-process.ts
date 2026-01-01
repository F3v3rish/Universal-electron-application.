/**
 * Example child process for handling heavy computations
 * This runs as a separate Node.js process for isolation and performance
 */

interface Message {
  type: string;
  id: string;
  data?: any;
}

// Task handlers
const handlers: Map<string, (data: any) => Promise<any>> = new Map();

/**
 * Register a handler for a specific task type
 */
function registerHandler(type: string, handler: (data: any) => Promise<any>): void {
  handlers.set(type, handler);
}

/**
 * Example handlers
 */

// Heavy computation example
registerHandler('heavy-compute', async (data: { iterations: number }) => {
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i);
  }
  return { result, iterations: data.iterations };
});

// Data processing example
registerHandler('process-array', async (data: { array: number[]; operation: string }) => {
  const { array, operation } = data;
  
  switch (operation) {
    case 'sum':
      return array.reduce((a, b) => a + b, 0);
    case 'average':
      return array.reduce((a, b) => a + b, 0) / array.length;
    case 'max':
      return Math.max(...array);
    case 'min':
      return Math.min(...array);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
});

// File processing simulation
registerHandler('process-file', async (data: { filename: string; operation: string }) => {
  // Simulate heavy file processing
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return {
    filename: data.filename,
    operation: data.operation,
    processed: true,
    timestamp: Date.now(),
  };
});

/**
 * Handle incoming messages
 */
process.on('message', async (message: Message) => {
  const response: Message = {
    type: 'response',
    id: message.id,
  };

  try {
    const handler = handlers.get(message.type);
    
    if (!handler) {
      throw new Error(`No handler for message type: ${message.type}`);
    }

    const result = await handler(message.data);
    response.data = result;
  } catch (error) {
    response.data = {
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (process.send) {
    process.send(response);
  }
});

// Signal ready
if (process.send) {
  process.send({ type: 'ready', id: 'init' });
}

console.log('Child process started and ready');
