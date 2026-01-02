/**
 * Tests for Logger functionality
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('Logger Tests', () => {
  let Logger;
  let testLogDir;

  before(async () => {
    // Create a temporary directory for test logs
    testLogDir = path.join(os.tmpdir(), 'electron-app-test-logs-' + Date.now());
    fs.mkdirSync(testLogDir, { recursive: true });

    // Build the logger module path
    const loggerPath = path.join(__dirname, '../dist/main/shared/logger.js');
    
    // Check if logger was built
    if (!fs.existsSync(loggerPath)) {
      throw new Error('Logger not built. Run npm run build first.');
    }

    Logger = require(loggerPath).Logger;
  });

  after(() => {
    // Clean up test logs
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  test('should create logger instance', () => {
    const logger = Logger.create('TestLogger');
    assert.ok(logger);
    assert.strictEqual(typeof logger.info, 'function');
    assert.strictEqual(typeof logger.error, 'function');
    assert.strictEqual(typeof logger.warn, 'function');
  });

  test('should configure with file logging', () => {
    Logger.configure({
      enableFileLogging: true,
      logDirectory: testLogDir,
    });
    
    const logger = Logger.create('FileLogger');
    logger.info('Test log message');
    
    // Give it a moment to write
    assert.ok(true); // Basic test that configuration doesn't throw
  });

  test('should handle log levels', () => {
    const logger = Logger.create('LevelLogger');
    
    // These should not throw
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    assert.ok(true);
  });
});
