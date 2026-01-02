# Calculator Plugin

A powerful calculator plugin with basic and scientific operations for Universal Electron Application.

## Features

- **Basic Operations**: Addition, subtraction, multiplication, division
- **Expression Evaluation**: Evaluate complex mathematical expressions
- **Scientific Functions**: Trigonometric, logarithmic, power, and root operations
- **Calculation History**: Keep track of recent calculations
- **Constants**: Access mathematical constants (π, e, etc.)
- **Unit Conversion**: Degrees/radians conversion

## Usage

### Basic Calculations

```javascript
// Evaluate expressions
const result = plugin.calculate('(10 + 5) * 2');
// Returns: { success: true, result: 30, expression: '(10 + 5) * 2' }

// Complex expressions
const result2 = plugin.calculate('100 / (5 + 5)');
// Returns: { success: true, result: 10, expression: '100 / (5 + 5)' }
```

### Scientific Operations

```javascript
// Trigonometric functions
plugin.sin(Math.PI / 2);  // 1
plugin.cos(0);             // 1
plugin.tan(Math.PI / 4);   // 1

// Square root and power
plugin.sqrt(16);          // 4
plugin.pow(2, 8);         // 256

// Logarithms
plugin.log(Math.E);       // 1
plugin.log10(100);        // 2
```

### History Management

```javascript
// Get calculation history (last 10 by default)
const history = plugin.getHistory();

// Get more history items
const history = plugin.getHistory(20);

// Clear history
plugin.clearHistory();
```

### Constants

```javascript
const constants = plugin.getConstants();
// Returns: { PI, E, LN2, LN10, LOG2E, LOG10E, SQRT2, SQRT1_2 }
```

### Unit Conversion

```javascript
// Degrees to radians
const radians = plugin.degToRad(180);  // π

// Radians to degrees
const degrees = plugin.radToDeg(Math.PI);  // 180
```

### Utilities

```javascript
// Calculate percentage
plugin.percentage(200, 15);  // 30

// Round to decimal places
plugin.round(3.14159, 2);  // 3.14
```

## API Reference

### Methods

- `calculate(expression)` - Evaluate a mathematical expression
- `sin(x)`, `cos(x)`, `tan(x)` - Trigonometric functions
- `sqrt(x)` - Square root
- `pow(base, exponent)` - Power function
- `log(x)`, `log10(x)` - Natural and base-10 logarithm
- `abs(x)` - Absolute value
- `degToRad(degrees)` - Convert degrees to radians
- `radToDeg(radians)` - Convert radians to degrees
- `percentage(value, percent)` - Calculate percentage
- `round(value, decimals)` - Round to decimal places
- `getHistory(limit)` - Get calculation history
- `clearHistory()` - Clear calculation history
- `getConstants()` - Get mathematical constants
