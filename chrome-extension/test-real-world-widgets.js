/**
 * Real-World Widget Test Suite
 * Tests conversion of actual widgets from popular WordPress themes
 * Uses collected widget samples from WoodMart, Avada, and Divi themes
 */

const {
  convertToNativeFormat,
  conversionLogger
} = require('./elementor-format-converter.js');

const fs = require('fs');
const path = require('path');

console.log('=== Real-World Widget Conversion Test Suite ===\n');

// Load test data files
const testDataFiles = [
  'test-data-woodmart.json',
  'test-data-avada.json',
  'test-data-divi.json'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

// Test each theme's widgets
testDataFiles.forEach(filename => {
  try {
    const filePath = path.join(__dirname, filename);
    const testData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${testData.theme} Theme Widgets`);
    console.log(`${'='.repeat(60)}\n`);
    
    if (testData.note) {
      console.log(`Note: ${testData.note}\n`);
    }
    
    // Reset logger for each theme
    conversionLogger.reset();
    
    testData.widgets.forEach((widget, index) => {
      totalTests++;
      console.log(`Test ${index + 1}: ${widget.name} (${widget.widgetType})`);
      console.log(`Description: ${widget.description}`);
      
      try {
        // Prepare test data in the format expected by convertToNativeFormat
        const inputData = {
          type: 'elementor-copier',
          metadata: { elementorVersion: '3.0.0' },
          data: widget.element
        };
        
        // Perform conversion
        const result = convertToNativeFormat(inputData, { sanitize: false });
        
        // Check if conversion matches expected output
        const expectedType = widget.expectedConversion.widgetType;
        const actualType = result.widgetType;
        
        const passed = actualType === expectedType;
        
        if (passed) {
          passedTests++;
          console.log(`✓ PASS: Converted to "${actualType}" as expected`);
        } else {
          failedTests++;
          console.log(`✗ FAIL: Expected "${expectedType}", got "${actualType}"`);
        }
        
        // Log conversion metadata if available
        if (result._conversionMeta) {
          console.log(`  Converter: ${result._conversionMeta.converter || 'Pattern-based'}`);
          console.log(`  Source: ${result._conversionMeta.source || 'N/A'}`);
          if (result._conversionMeta.dataLoss) {
            console.log(`  ⚠ Data loss detected`);
          }
        }
        
        // Store result for summary
        results.push({
          theme: testData.theme,
          widget: widget.name,
          widgetType: widget.widgetType,
          expected: expectedType,
          actual: actualType,
          passed: passed,
          converter: result._conversionMeta?.converter || 'Pattern-based'
        });
        
      } catch (error) {
        failedTests++;
        console.log(`✗ ERROR: ${error.message}`);
        
        results.push({
          theme: testData.theme,
          widget: widget.name,
          widgetType: widget.widgetType,
          expected: widget.expectedConversion.widgetType,
          actual: 'ERROR',
          passed: false,
          error: error.message
        });
      }
      
      console.log('');
    });
    
    // Theme-specific summary
    const themeStats = conversionLogger.getStats();
    console.log(`${testData.theme} Theme Summary:`);
    console.log(`  Total conversions: ${themeStats.total}`);
    console.log(`  Successful: ${themeStats.successfulConversions}`);
    console.log(`  Fallbacks: ${themeStats.fallbacks}`);
    console.log(`  Errors: ${themeStats.errors}`);
    console.log('');
    
  } catch (error) {
    console.log(`✗ Failed to load ${filename}: ${error.message}\n`);
  }
});

// Overall Summary
console.log(`\n${'='.repeat(60)}`);
console.log('Overall Test Summary');
console.log(`${'='.repeat(60)}\n`);

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
console.log('');

// Breakdown by theme
console.log('Results by Theme:');
const themes = [...new Set(results.map(r => r.theme))];
themes.forEach(theme => {
  const themeResults = results.filter(r => r.theme === theme);
  const themePassed = themeResults.filter(r => r.passed).length;
  const themeTotal = themeResults.length;
  console.log(`  ${theme}: ${themePassed}/${themeTotal} passed (${((themePassed/themeTotal)*100).toFixed(1)}%)`);
});
console.log('');

// Breakdown by converter
console.log('Results by Converter:');
const converters = {};
results.forEach(r => {
  const converter = r.converter || 'Unknown';
  if (!converters[converter]) {
    converters[converter] = { total: 0, passed: 0 };
  }
  converters[converter].total++;
  if (r.passed) converters[converter].passed++;
});

Object.keys(converters).sort().forEach(converter => {
  const stats = converters[converter];
  console.log(`  ${converter}: ${stats.passed}/${stats.total} passed (${((stats.passed/stats.total)*100).toFixed(1)}%)`);
});
console.log('');

// Failed conversions detail
if (failedTests > 0) {
  console.log('Failed Conversions:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  ✗ ${r.theme} - ${r.widget} (${r.widgetType})`);
    console.log(`    Expected: ${r.expected}, Got: ${r.actual}`);
    if (r.error) {
      console.log(`    Error: ${r.error}`);
    }
  });
  console.log('');
}

// Success rate by widget type
console.log('Success Rate by Widget Type:');
const widgetTypes = {};
results.forEach(r => {
  if (!widgetTypes[r.expected]) {
    widgetTypes[r.expected] = { total: 0, passed: 0 };
  }
  widgetTypes[r.expected].total++;
  if (r.passed) widgetTypes[r.expected].passed++;
});

Object.keys(widgetTypes).sort().forEach(type => {
  const stats = widgetTypes[type];
  const rate = ((stats.passed/stats.total)*100).toFixed(1);
  const icon = rate === '100.0' ? '✓' : rate >= '50.0' ? '⚠' : '✗';
  console.log(`  ${icon} ${type}: ${stats.passed}/${stats.total} (${rate}%)`);
});

console.log('\n=== Real-World Widget Test Suite Complete ===');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);
