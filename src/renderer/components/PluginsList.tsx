import React, { useEffect, useState } from 'react';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
}

export const PluginsList: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    const result = await window.electronAPI.plugins.list();
    if (result.success && result.plugins) {
      setPlugins(result.plugins);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Loaded Plugins</h2>
        </div>
        <div className="card-content">
          <p>Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Loaded Plugins</h2>
        <button className="btn btn-small" onClick={loadPlugins}>
          Refresh
        </button>
      </div>
      <div className="card-content">
        {plugins.length === 0 ? (
          <p className="empty-state">
            No plugins loaded. Add plugins to the <code>plugins/</code> directory to extend
            functionality.
          </p>
        ) : (
          <div className="plugins-grid">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="plugin-card">
                <h3>{plugin.name}</h3>
                <p className="plugin-description">{plugin.description}</p>
                <div className="plugin-meta">
                  <span className="plugin-version">v{plugin.version}</span>
                  {plugin.author && <span className="plugin-author">by {plugin.author}</span>}
                </div>
                <div className="plugin-id">ID: {plugin.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
