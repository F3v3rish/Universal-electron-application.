import React, { useEffect, useState } from 'react';

interface SystemInfoData {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  cpus: number;
  totalMemory: number;
  freeMemory: number;
  workerPool: {
    totalWorkers: number;
    activeWorkers: number;
    queuedTasks: number;
  };
  childProcesses: {
    totalProcesses: number;
  };
}

export const SystemInfo: React.FC = () => {
  const [info, setInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    setLoading(true);
    const result = await window.electronAPI.system.getInfo();
    if (result.success) {
      setInfo(result.info);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>System Information</h2>
        </div>
        <div className="card-content">
          <p>Loading system information...</p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>System Information</h2>
        </div>
        <div className="card-content">
          <p>Failed to load system information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>System Information</h2>
        <button className="btn btn-small" onClick={loadSystemInfo}>
          Refresh
        </button>
      </div>
      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Platform:</span>
            <span className="info-value">{info.platform}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Architecture:</span>
            <span className="info-value">{info.arch}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Node Version:</span>
            <span className="info-value">{info.nodeVersion}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Electron Version:</span>
            <span className="info-value">{info.electronVersion}</span>
          </div>
          <div className="info-item">
            <span className="info-label">CPUs:</span>
            <span className="info-value">{info.cpus}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Memory:</span>
            <span className="info-value">
              {(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Free Memory:</span>
            <span className="info-value">
              {(info.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Worker Pool:</span>
            <span className="info-value">
              {info.workerPool.totalWorkers} workers ({info.workerPool.activeWorkers} active,{' '}
              {info.workerPool.queuedTasks} queued)
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Child Processes:</span>
            <span className="info-value">{info.childProcesses.totalProcesses}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
