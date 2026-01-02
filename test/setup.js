/**
 * Test setup file
 * This file is loaded before any tests run
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Disable logging during tests
process.env.LOG_LEVEL = 'error';

console.log('Test environment initialized');
