/**
 * Main renderer process script
 * Handles UI interactions and communicates with main process
 */

/**
 * Initialize the application UI
 */
async function initializeApp() {
  // Get reference to electronAPI
  const electronAPI = window.electronAPI;
  console.log('Initializing renderer...');

  // Load system info
  await loadSystemInfo();

  // Set up event listeners
  setupEventListeners();

  // Load plugins
  await loadPlugins();

  console.log('Renderer initialized');
}

/**
 * Load and display system information
 */
async function loadSystemInfo() {
  const electronAPI = window.electronAPI;
  const result = await electronAPI.system.getInfo();

  if (result.success && result.info) {
    const { info } = result;
    const systemInfoEl = document.getElementById('system-info');

    if (systemInfoEl) {
      systemInfoEl.innerHTML = `
        <h3>System Information</h3>
        <ul>
          <li><strong>Platform:</strong> ${info.platform}</li>
          <li><strong>Architecture:</strong> ${info.arch}</li>
          <li><strong>Node Version:</strong> ${info.nodeVersion}</li>
          <li><strong>Electron Version:</strong> ${info.electronVersion}</li>
          <li><strong>CPUs:</strong> ${info.cpus}</li>
          <li><strong>Total Memory:</strong> ${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB</li>
          <li><strong>Free Memory:</strong> ${(info.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB</li>
          <li><strong>Worker Pool:</strong> ${info.workerPool.totalWorkers} workers (${info.workerPool.activeWorkers} active, ${info.workerPool.queuedTasks} queued)</li>
          <li><strong>Child Processes:</strong> ${info.childProcesses.totalProcesses}</li>
        </ul>
      `;
    }
  }
}

/**
 * Load and display plugins
 */
async function loadPlugins() {
  const electronAPI = window.electronAPI;
  const result = await electronAPI.plugins.list();

  if (result.success && result.plugins) {
    const pluginsListEl = document.getElementById('plugins-list');

    if (pluginsListEl) {
      if (result.plugins.length === 0) {
        pluginsListEl.innerHTML = '<p>No plugins loaded. Add plugins to the plugins directory.</p>';
      } else {
        pluginsListEl.innerHTML = result.plugins
          .map(
            (plugin: any) => `
            <div class="plugin-item">
              <h4>${plugin.name}</h4>
              <p>${plugin.description}</p>
              <small>Version: ${plugin.version} | ID: ${plugin.id}</small>
            </div>
          `
          )
          .join('');
      }
    }
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  const electronAPI = window.electronAPI;

  // Test worker button
  const testWorkerBtn = document.getElementById('test-worker');
  if (testWorkerBtn) {
    testWorkerBtn.addEventListener('click', async () => {
      const outputEl = document.getElementById('worker-output');
      if (outputEl) {
        outputEl.textContent = 'Running worker task...';
      }

      const task = {
        id: `task-${Date.now()}`,
        type: 'compute',
        data: {
          operation: 'sum',
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
      };

      const result = await electronAPI.workers.submitTask(task);

      if (outputEl) {
        if (result.success) {
          outputEl.textContent = `Worker result: ${JSON.stringify(result.result, null, 2)}`;
        } else {
          outputEl.textContent = `Worker error: ${result.error}`;
        }
      }
    });
  }

  // Refresh system info button
  const refreshBtn = document.getElementById('refresh-system-info');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadSystemInfo);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
