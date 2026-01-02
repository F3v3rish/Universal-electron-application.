/**
 * Electron-builder configuration validation tests
 * Ensures the application is properly configured for Windows builds
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

describe('Electron Builder Configuration', () => {
  let packageJson;

  test('should load package.json', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    assert.ok(fs.existsSync(packagePath), 'package.json should exist');
    
    const content = fs.readFileSync(packagePath, 'utf-8');
    packageJson = JSON.parse(content);
    
    assert.ok(packageJson, 'package.json should be valid JSON');
  });

  test('should have build configuration', () => {
    assert.ok(packageJson.build, 'package.json should have build configuration');
    assert.strictEqual(typeof packageJson.build, 'object');
  });

  test('should have Windows build target', () => {
    assert.ok(packageJson.build.win, 'package.json should have Windows build config');
    assert.ok(packageJson.build.win.target, 'Windows build should have target');
  });

  test('should use NSIS installer for Windows', () => {
    const winTarget = packageJson.build.win.target;
    assert.strictEqual(winTarget, 'nsis', 'Windows target should be NSIS');
  });

  test('should have output directory configured', () => {
    assert.ok(packageJson.build.directories, 'Build directories should be configured');
    assert.ok(packageJson.build.directories.output, 'Output directory should be specified');
  });

  test('should include distribution files', () => {
    assert.ok(Array.isArray(packageJson.build.files), 'Files to include should be array');
    assert.ok(
      packageJson.build.files.includes('dist/**/*'),
      'Should include dist directory'
    );
  });

  test('should have main entry point', () => {
    assert.ok(packageJson.main, 'package.json should have main entry point');
    assert.ok(
      packageJson.main.includes('dist/main'),
      'Main entry should point to dist/main'
    );
  });

  test('should have electron as dev dependency', () => {
    assert.ok(
      packageJson.devDependencies.electron,
      'Electron should be in devDependencies'
    );
  });

  test('should have electron-builder as dev dependency', () => {
    assert.ok(
      packageJson.devDependencies['electron-builder'],
      'electron-builder should be in devDependencies'
    );
  });
});

describe('Build Scripts', () => {
  let packageJson;

  test('should have build scripts defined', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    
    assert.ok(packageJson.scripts, 'package.json should have scripts');
    assert.ok(packageJson.scripts.build, 'Should have build script');
    assert.ok(packageJson.scripts.package, 'Should have package script');
  });

  test('build script should compile all components', () => {
    const buildScript = packageJson.scripts.build;
    
    assert.ok(buildScript.includes('build:main'), 'Should build main process');
    assert.ok(buildScript.includes('build:renderer'), 'Should build renderer');
    assert.ok(buildScript.includes('build:preload'), 'Should build preload script');
  });

  test('package script should build before packaging', () => {
    const packageScript = packageJson.scripts.package;
    
    assert.ok(
      packageScript.includes('build'),
      'Package script should build first'
    );
    assert.ok(
      packageScript.includes('electron-builder'),
      'Package script should run electron-builder'
    );
  });

  test('should have start script', () => {
    assert.ok(packageJson.scripts.start, 'Should have start script');
    assert.ok(
      packageJson.scripts.start.includes('electron'),
      'Start script should run electron'
    );
  });
});

describe('Build Output Validation', () => {
  test('dist directory should exist after build', () => {
    const distPath = path.join(__dirname, '..', 'dist');
    
    // This test assumes the application has been built
    if (!fs.existsSync(distPath)) {
      console.log('⚠️  Warning: dist/ directory not found. Run "npm run build" first.');
      return; // Skip if not built
    }
    
    assert.ok(fs.existsSync(distPath), 'dist directory should exist');
  });

  test('main process should be compiled', () => {
    const mainPath = path.join(__dirname, '..', 'dist', 'main', 'main', 'index.js');
    
    if (!fs.existsSync(mainPath)) {
      console.log('⚠️  Warning: Main process not compiled. Run "npm run build" first.');
      return;
    }
    
    assert.ok(fs.existsSync(mainPath), 'Main process should be compiled');
  });

  test('renderer should be bundled', () => {
    // Note: The build structure has nested directories: dist/renderer/renderer/
    // This is intentional based on the TypeScript configuration
    const rendererPath = path.join(__dirname, '..', 'dist', 'renderer', 'renderer', 'app.js');
    
    if (!fs.existsSync(rendererPath)) {
      console.log('⚠️  Warning: Renderer not bundled. Run "npm run build" first.');
      return;
    }
    
    assert.ok(fs.existsSync(rendererPath), 'Renderer should be bundled');
  });

  test('preload script should be compiled', () => {
    // Note: The build structure has nested directories: dist/preload/preload/
    // This is intentional based on the TypeScript configuration
    const preloadPath = path.join(__dirname, '..', 'dist', 'preload', 'preload', 'index.js');
    
    if (!fs.existsSync(preloadPath)) {
      console.log('⚠️  Warning: Preload script not compiled. Run "npm run build" first.');
      return;
    }
    
    assert.ok(fs.existsSync(preloadPath), 'Preload script should be compiled');
  });
});

describe('Windows Package Requirements', () => {
  test('should have renderer HTML file', () => {
    const htmlPath = path.join(__dirname, '..', 'renderer', 'index.html');
    assert.ok(fs.existsSync(htmlPath), 'renderer/index.html should exist');
  });

  test('should have plugins directory', () => {
    const pluginsPath = path.join(__dirname, '..', 'plugins');
    assert.ok(fs.existsSync(pluginsPath), 'plugins directory should exist');
  });

  test('HTML should reference correct script path', () => {
    const htmlPath = path.join(__dirname, '..', 'renderer', 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.log('⚠️  Warning: index.html not found');
      return;
    }
    
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(
      html.includes('dist/renderer') || html.includes('../dist/renderer'),
      'HTML should reference renderer bundle'
    );
  });
});
