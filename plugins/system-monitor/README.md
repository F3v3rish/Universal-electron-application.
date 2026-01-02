# System Monitor Plugin

Real-time system resource monitoring plugin for Universal Electron Application.

## Features

- **CPU Monitoring**: Track CPU usage percentage and core count
- **Memory Monitoring**: Monitor total, used, and free memory
- **System Info**: Display platform, architecture, hostname, and uptime
- **Load Average**: Track system load (Unix-like systems)
- **Health Status**: Get automatic health assessments with warnings

## Usage

The plugin automatically starts monitoring when activated. Metrics are collected every 2 seconds by default.

### API Methods

```javascript
// Get current metrics
const metrics = plugin.getCurrentMetrics();

// Get health status
const health = plugin.getHealthStatus();

// Change update interval (1000-10000ms)
plugin.setUpdateInterval(3000);
```

### Event Listeners

```javascript
// Listen for metric updates
plugin.on('metrics', (metrics) => {
  console.log('CPU Usage:', metrics.cpu.usage);
  console.log('Memory Usage:', metrics.memory.usagePercent);
});
```

## Metrics Structure

```javascript
{
  timestamp: 1234567890,
  cpu: {
    count: 8,
    usage: 45,
    model: "Intel Core i7",
    speed: 2400
  },
  memory: {
    total: 17179869184,
    used: 8589934592,
    free: 8589934592,
    usagePercent: "50.00"
  },
  system: {
    platform: "linux",
    arch: "x64",
    hostname: "my-computer",
    uptime: 12345,
    loadAverage: [1.5, 1.2, 1.0]
  }
}
```

## Health Status

The plugin provides automatic health assessment:

- **Good**: All metrics within normal ranges
- **Warning**: CPU >75% or Memory >75% or Load >1.5x CPU count
- **Critical**: CPU >90% or Memory >90% or Load >2.0x CPU count
