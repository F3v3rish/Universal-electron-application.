/**
 * Basic utility tests to verify test infrastructure works
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');

describe('Test Infrastructure', () => {
  test('should run basic assertions', () => {
    assert.strictEqual(1 + 1, 2);
    assert.ok(true);
  });

  test('should have access to Node.js APIs', () => {
    assert.ok(process.version);
    assert.ok(os.cpus().length > 0);
  });
});

describe('Cross-Platform Path Handling', () => {
  test('path.join should work correctly', () => {
    const joined = path.join('folder', 'subfolder', 'file.txt');
    assert.ok(joined.includes('folder'));
    assert.ok(joined.includes('subfolder'));
    assert.ok(joined.includes('file.txt'));
  });

  test('path.resolve should create absolute paths', () => {
    const resolved = path.resolve('test', 'file.txt');
    assert.ok(path.isAbsolute(resolved));
  });

  test('path operations should be OS-independent', () => {
    const testPath = path.join('src', 'main', 'index.ts');
    
    // Should work on all platforms
    assert.ok(testPath.length > 0);
    
    // Path separators should be normalized
    const normalized = path.normalize(testPath);
    assert.ok(normalized.length > 0);
  });

  test('should handle Windows-style paths correctly', () => {
    // Test that path.join normalizes separators
    const mixedPath = path.join('C:\\Users', 'test', 'file.txt');
    assert.ok(mixedPath.includes('file.txt'));
  });
});

describe('Platform Detection', () => {
  test('should detect current platform', () => {
    const platform = process.platform;
    assert.ok(['darwin', 'win32', 'linux'].includes(platform));
  });

  test('should detect architecture', () => {
    const arch = process.arch;
    assert.ok(['x64', 'arm64', 'ia32'].includes(arch));
  });

  test('should provide system information', () => {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    
    assert.ok(cpus.length > 0);
    assert.ok(totalMem > 0);
  });
});
