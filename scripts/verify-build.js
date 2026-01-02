/**
 * Cross-platform build verification script
 * Verifies that all required build outputs exist
 */

const fs = require('fs');
const path = require('path');

// Files that must exist after build
const requiredFiles = [
  'dist/main/main/index.js',
  'dist/renderer/renderer/app.js',
  'dist/preload/preload/index.js',
];

console.log('Verifying build output...\n');

let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`✗ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
}

console.log();

if (allFilesExist) {
  console.log('✓ All required build files exist');
  process.exit(0);
} else {
  console.error('✗ Some build files are missing');
  process.exit(1);
}
