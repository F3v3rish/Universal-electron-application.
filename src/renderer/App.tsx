import React, { useEffect, useState } from 'react';
import { SystemInfo } from './components/SystemInfo';
import { WorkerTest } from './components/WorkerTest';
import { PluginsList } from './components/PluginsList';
import { SettingsPanel } from './components/SettingsPanel';
import { Header } from './components/Header';

/**
 * Main application component
 */
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from settings
    const loadTheme = async () => {
      const result = await window.electronAPI.settings.get('theme');
      if (result.success && result.value) {
        const themeValue =
          result.value === 'auto'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : result.value;
        setTheme(themeValue);
        document.documentElement.setAttribute('data-theme', themeValue);
      }
    };

    loadTheme();

    // Listen for critical errors
    window.electronAPI.on('error:critical', (error: any) => {
      console.error('Critical error:', error);
      // Could show a modal here
    });
  }, []);

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    await window.electronAPI.settings.set('theme', newTheme);
  };

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <SystemInfo />
            <WorkerTest />
          </div>
        )}

        {activeTab === 'plugins' && <PluginsList />}

        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
};

export default App;
