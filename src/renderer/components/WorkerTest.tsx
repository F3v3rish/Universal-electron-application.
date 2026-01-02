import React, { useState } from 'react';

export const WorkerTest: React.FC = () => {
  const [output, setOutput] = useState<string>('Click the button to run a worker task...');
  const [running, setRunning] = useState(false);

  const runWorkerTask = async () => {
    setRunning(true);
    setOutput('Running worker task...');

    const task = {
      id: `task-${Date.now()}`,
      type: 'compute',
      data: {
        operation: 'sum',
        values: Array.from({ length: 1000 }, (_, i) => i + 1),
      },
    };

    try {
      const result = await window.electronAPI.workers.submitTask(task);
      
      if (result.success) {
        setOutput(JSON.stringify(result.result, null, 2));
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Worker Thread Test</h2>
      </div>
      <div className="card-content">
        <p>Test the worker pool by running a computation task:</p>
        <button 
          className="btn btn-primary" 
          onClick={runWorkerTask}
          disabled={running}
        >
          {running ? 'Running...' : 'Run Worker Task'}
        </button>
        <pre className="output-box">{output}</pre>
      </div>
    </div>
  );
};
