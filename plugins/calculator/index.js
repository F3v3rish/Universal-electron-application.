/**
 * Calculator Plugin
 * Provides basic and scientific calculation operations
 */
class CalculatorPlugin {
  constructor() {
    this.history = [];
    this.maxHistorySize = 100;
  }

  /**
   * Plugin lifecycle: Load
   */
  async onLoad() {
    console.log('[Calculator] Plugin loaded');
  }

  /**
   * Plugin lifecycle: Activate
   */
  async onActivate() {
    console.log('[Calculator] Plugin activated');
  }

  /**
   * Plugin lifecycle: Deactivate
   */
  async onDeactivate() {
    console.log('[Calculator] Plugin deactivated');
  }

  /**
   * Plugin lifecycle: Unload
   */
  async onUnload() {
    console.log('[Calculator] Plugin unloaded');
  }

  /**
   * Evaluate a mathematical expression
   */
  calculate(expression) {
    try {
      // Sanitize input to prevent code injection
      const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
      
      // Use Function constructor for safe evaluation
      const result = Function('"use strict"; return (' + sanitized + ')')();
      
      // Add to history
      this.addToHistory(expression, result);
      
      return {
        success: true,
        result: result,
        expression: expression,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        expression: expression,
      };
    }
  }

  /**
   * Add calculation to history
   */
  addToHistory(expression, result) {
    this.history.unshift({
      expression,
      result,
      timestamp: Date.now(),
    });

    // Keep history size limited
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get calculation history
   */
  getHistory(limit = 10) {
    return this.history.slice(0, limit);
  }

  /**
   * Clear calculation history
   */
  clearHistory() {
    this.history = [];
    return { success: true };
  }

  /**
   * Scientific operations
   */
  sin(x) {
    return Math.sin(x);
  }

  cos(x) {
    return Math.cos(x);
  }

  tan(x) {
    return Math.tan(x);
  }

  sqrt(x) {
    return Math.sqrt(x);
  }

  pow(base, exponent) {
    return Math.pow(base, exponent);
  }

  log(x) {
    return Math.log(x);
  }

  log10(x) {
    return Math.log10(x);
  }

  abs(x) {
    return Math.abs(x);
  }

  /**
   * Constants
   */
  getConstants() {
    return {
      PI: Math.PI,
      E: Math.E,
      LN2: Math.LN2,
      LN10: Math.LN10,
      LOG2E: Math.LOG2E,
      LOG10E: Math.LOG10E,
      SQRT2: Math.SQRT2,
      SQRT1_2: Math.SQRT1_2,
    };
  }

  /**
   * Convert degrees to radians
   */
  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  radToDeg(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculate percentage
   */
  percentage(value, percent) {
    return (value * percent) / 100;
  }

  /**
   * Round to specified decimal places
   */
  round(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

module.exports = CalculatorPlugin;
