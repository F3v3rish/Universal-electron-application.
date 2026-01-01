/**
 * Example Plugin
 * Demonstrates plugin lifecycle and capabilities
 */

class ExamplePlugin {
  constructor() {
    this.metadata = null; // Will be set by plugin manager
  }

  async onLoad() {
    console.log('Example Plugin: onLoad called');
  }

  async onActivate() {
    console.log('Example Plugin: onActivate called');
    // Plugin activation logic here
  }

  async onDeactivate() {
    console.log('Example Plugin: onDeactivate called');
    // Plugin deactivation logic here
  }

  async onUnload() {
    console.log('Example Plugin: onUnload called');
    // Cleanup logic here
  }

  // Custom plugin methods
  async doSomething(data) {
    console.log('Example Plugin: doSomething called with', data);
    return { success: true, message: 'Plugin executed successfully' };
  }
}

module.exports = ExamplePlugin;
