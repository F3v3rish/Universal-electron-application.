import React, { useEffect, useState } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoUpdate: boolean;
  enableFileLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  showWelcomeScreen: boolean;
  windowWidth: number;
  windowHeight: number;
  autoLoadPlugins: boolean;
  enableDevTools: boolean;
  enableBackgroundThrottling: boolean;
}

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await window.electronAPI.settings.getAll();
    if (result.success && result.settings) {
      setSettings(result.settings);
    }
    setLoading(false);
  };

  const saveSetting = async (key: keyof Settings, value: any) => {
    setSaving(true);
    const result = await window.electronAPI.settings.set(key, value);

    if (result.success) {
      setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
      showMessage('success', 'Setting saved successfully');
    } else {
      showMessage('error', 'Failed to save setting');
    }

    setSaving(false);
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setSaving(true);
    const result = await window.electronAPI.settings.reset();

    if (result.success) {
      await loadSettings();
      showMessage('success', 'Settings reset to defaults');
    } else {
      showMessage('error', 'Failed to reset settings');
    }

    setSaving(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Settings</h2>
        </div>
        <div className="card-content">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Settings</h2>
        </div>
        <div className="card-content">
          <p>Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel">
      <div className="card">
        <div className="card-header">
          <h2>Application Settings</h2>
          <button className="btn btn-danger btn-small" onClick={resetSettings} disabled={saving}>
            Reset to Defaults
          </button>
        </div>

        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <div className="card-content settings-content">
          {/* General Settings */}
          <section className="settings-section">
            <h3>General</h3>

            <div className="setting-item">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => saveSetting('theme', e.target.value)}
                disabled={saving}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="setting-item">
              <label htmlFor="language">Language</label>
              <input
                id="language"
                type="text"
                value={settings.language}
                onChange={(e) => saveSetting('language', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoUpdate}
                  onChange={(e) => saveSetting('autoUpdate', e.target.checked)}
                  disabled={saving}
                />
                Enable automatic updates
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showWelcomeScreen}
                  onChange={(e) => saveSetting('showWelcomeScreen', e.target.checked)}
                  disabled={saving}
                />
                Show welcome screen on startup
              </label>
            </div>
          </section>

          {/* Logging Settings */}
          <section className="settings-section">
            <h3>Logging</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableFileLogging}
                  onChange={(e) => saveSetting('enableFileLogging', e.target.checked)}
                  disabled={saving}
                />
                Enable file logging
              </label>
            </div>

            <div className="setting-item">
              <label htmlFor="logLevel">Log Level</label>
              <select
                id="logLevel"
                value={settings.logLevel}
                onChange={(e) => saveSetting('logLevel', e.target.value)}
                disabled={saving}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </section>

          {/* Plugin Settings */}
          <section className="settings-section">
            <h3>Plugins</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoLoadPlugins}
                  onChange={(e) => saveSetting('autoLoadPlugins', e.target.checked)}
                  disabled={saving}
                />
                Automatically load plugins on startup
              </label>
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="settings-section">
            <h3>Advanced</h3>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableDevTools}
                  onChange={(e) => saveSetting('enableDevTools', e.target.checked)}
                  disabled={saving}
                />
                Enable developer tools
              </label>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.enableBackgroundThrottling}
                  onChange={(e) => saveSetting('enableBackgroundThrottling', e.target.checked)}
                  disabled={saving}
                />
                Enable background throttling (may reduce performance)
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
