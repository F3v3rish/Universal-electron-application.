# Test Suite Documentation

## Overview

This test suite provides basic testing infrastructure for the Universal Electron Application using Node.js's built-in test runner (available in Node 18+). No additional test framework dependencies are required.

## Running Tests

### All Tests
```bash
npm test
```
This will:
1. Build the application (TypeScript compilation)
2. Run all tests in the `test/` directory

### Quick Tests (without build)
```bash
npm run test:quick
```
Runs only basic utility and Windows compatibility tests without rebuilding the application.

### Watch Mode
```bash
npm run test:watch
```
Automatically re-runs tests when files change (useful during development).

## Test Files

### test/setup.js
Test environment setup file that configures:
- Test environment variables
- Logging levels
- Common test utilities

### test/utils.test.js
**Test Infrastructure & Cross-Platform Compatibility**
- Basic test framework verification
- Node.js API availability
- Path handling (cross-platform)
- Platform detection
- System information access

### test/windows.test.js
**Windows Compatibility Tests**
- Backslash path separator handling
- Mixed path separator normalization
- Relative path resolution
- Absolute path creation
- File extension parsing
- Environment variable handling
- End-of-line character handling

### test/logger.test.js
**Logger Module Tests**
- Logger instance creation
- File logging configuration
- Log level handling
- Temporary log file management

## Test Coverage

Current test coverage includes:
- ✅ Path handling (Windows and Unix)
- ✅ Platform detection
- ✅ System information access
- ✅ Logger functionality
- ✅ File system operations
- ✅ Environment compatibility

## Windows-Specific Testing

The test suite includes specific tests for Windows compatibility:

1. **Path Separators**: Ensures backslashes and forward slashes are handled correctly
2. **Mixed Paths**: Tests normalization of paths with mixed separators
3. **Drive Letters**: Validates Windows drive letter paths (C:\, D:\, etc.)
4. **Environment Variables**: Tests PATH/Path case differences
5. **EOL Characters**: Verifies \r\n vs \n handling

## Adding New Tests

To add new tests:

1. Create a new file in the `test/` directory with `.test.js` extension
2. Use Node.js test runner syntax:

```javascript
const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('My Feature', () => {
  test('should do something', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

3. Run `npm test` to verify your tests work

## Testing Best Practices

1. **Keep tests independent**: Each test should not depend on others
2. **Clean up resources**: Use `after()` hooks to clean up temporary files
3. **Use descriptive names**: Test names should clearly describe what they test
4. **Test cross-platform**: Always consider Windows, macOS, and Linux
5. **Mock external dependencies**: Don't rely on external services

## Continuous Integration

These tests are designed to run in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Run tests
  run: npm test

- name: Build application
  run: npm run build
```

## Troubleshooting

### Tests fail with "module not found"
- Ensure you've run `npm run build` first
- Check that all dependencies are installed: `npm install`

### Path tests fail on Windows
- This likely indicates a real bug in path handling
- Review the code to ensure `path.join()` is used instead of string concatenation

### Logger tests show warnings
- Cleanup warnings at the end of logger tests are expected
- Tests still pass even with these warnings

## Future Enhancements

Planned test additions:
- [ ] Electron-specific tests using Spectron or Playwright
- [ ] Integration tests for IPC communication
- [ ] Worker pool functionality tests
- [ ] Plugin system tests
- [ ] UI component tests (React Testing Library)
- [ ] End-to-end tests

## Notes

- Tests use Node.js's built-in test runner (no Jest, Mocha, etc.)
- Minimal dependencies mean faster test execution
- Tests are compatible with Node 18+
- All tests are run in Node.js context (not Electron context)
