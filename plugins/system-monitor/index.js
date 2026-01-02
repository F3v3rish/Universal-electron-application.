const os = require('os');
const { EventEmitter } = require('events');

/**
 * System Monitor Plugin
 * Provides real-time system resource monitoring
 */
class SystemMonitorPlugin extends EventEmitter {
  constructor() {
    super();
    this.monitorInterval = null;
    this.updateInterval = 2000; // Update every 2 seconds
  }

  /**
   * Plugin lifecycle: Load
   */
  async onLoad() {
    console.log('[SystemMonitor] Plugin loaded');
  }

  /**
   * Plugin lifecycle: Activate
   */
  async onActivate() {
    console.log('[SystemMonitor] Plugin activated');
    this.startMonitoring();
  }

  /**
   * Plugin lifecycle: Deactivate
   */
  async onDeactivate() {
    console.log('[SystemMonitor] Plugin deactivated');
    this.stopMonitoring();
  }

  /**
   * Plugin lifecycle: Unload
   */
  async onUnload() {
    console.log('[SystemMonitor] Plugin unloaded');
    this.stopMonitoring();
  }

  /**
   * Start monitoring system resources
   */
  startMonitoring() {
    if (this.monitorInterval) {
      return;
    }

    this.monitorInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.emit('metrics', metrics);
    }, this.updateInterval);

    console.log('[SystemMonitor] Started monitoring');
  }

  /**
   * Stop monitoring system resources
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('[SystemMonitor] Stopped monitoring');
    }
  }

  /**
   * Collect system metrics
   */
  collectMetrics() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Calculate CPU usage
    const cpuUsage = this.calculateCPUUsage(cpus);

    // Memory usage
    const memoryUsage = {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercent: ((usedMemory / totalMemory) * 100).toFixed(2),
    };

    // System info
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };

    return {
      timestamp: Date.now(),
      cpu: cpuUsage,
      memory: memoryUsage,
      system: systemInfo,
    };
  }

  /**
   * Calculate CPU usage percentage
   */
  calculateCPUUsage(cpus) {
    const cpuCount = cpus.length;
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpuCount;
    const total = totalTick / cpuCount;
    const usage = 100 - ~~((100 * idle) / total);

    return {
      count: cpuCount,
      usage: usage,
      model: cpus[0].model,
      speed: cpus[0].speed,
    };
  }

  /**
   * Get current metrics (synchronous)
   */
  getCurrentMetrics() {
    return this.collectMetrics();
  }

  /**
   * Set update interval
   */
  setUpdateInterval(interval) {
    if (interval < 1000 || interval > 10000) {
      throw new Error('Update interval must be between 1000ms and 10000ms');
    }

    this.updateInterval = interval;
    
    if (this.monitorInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const metrics = this.collectMetrics();
    const health = {
      status: 'good',
      warnings: [],
      critical: [],
    };

    // Check CPU usage
    if (metrics.cpu.usage > 90) {
      health.critical.push('CPU usage critically high (>90%)');
      health.status = 'critical';
    } else if (metrics.cpu.usage > 75) {
      health.warnings.push('CPU usage high (>75%)');
      if (health.status === 'good') {
        health.status = 'warning';
      }
    }

    // Check memory usage
    const memoryPercent = parseFloat(metrics.memory.usagePercent);
    if (memoryPercent > 90) {
      health.critical.push('Memory usage critically high (>90%)');
      health.status = 'critical';
    } else if (memoryPercent > 75) {
      health.warnings.push('Memory usage high (>75%)');
      if (health.status === 'good') {
        health.status = 'warning';
      }
    }

    // Check load average (for Unix-like systems)
    if (metrics.system.platform !== 'win32') {
      const loadAvg = metrics.system.loadAverage[0];
      const cpuCount = metrics.cpu.count;
      const normalizedLoad = loadAvg / cpuCount;

      if (normalizedLoad > 2.0) {
        health.critical.push('System load critically high');
        health.status = 'critical';
      } else if (normalizedLoad > 1.5) {
        health.warnings.push('System load high');
        if (health.status === 'good') {
          health.status = 'warning';
        }
      }
    }

    return health;
  }
}

module.exports = SystemMonitorPlugin;
