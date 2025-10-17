/**
 * Test script for core converter infrastructure
 * Verifies BaseConverter, ConverterRegistry, and ConversionLogger
 */

// Load the format converter module
const {
  BaseConverter,
  ConverterRegistry,
  ConversionLogger,
  converterRegistry,
  conversionLogger
} = require('./elementor-format-converter.js');

console.log('=== Testing Core Converter Infrastructure ===\n');

// Test 1: BaseConverter class exists and has required methods
console.log('Test 1: BaseConverter class');
try {
  const baseConverter = new BaseConverter();
  console.log('✓ BaseConverter instantiated');
  
  // Test that methods throw errors (must be implemented by subclass)
  try {
    baseConverter.canConvert({}, 'test');
    console.log('✗ canConvert should throw error');
  } catch (e) {
    console.log('✓ canConvert throws error as expected');
  }
  
  try {
    baseConverter.convert({}, 'test', {});
    console.log('✗ convert should throw error');
  } catch (e) {
    console.log('✓ convert throws error as expected');
  }
  
  const metadata = baseConverter.getMetadata();
  console.log('✓ getMetadata returns:', metadata);
} catch (e) {
  console.log('✗ BaseConverter test failed:', e.message);
}

console.log('\nTest 2: ConverterRegistry class');
try {
  const registry = new ConverterRegistry();
  console.log('✓ ConverterRegistry instantiated');
  
  // Create a test converter
  class TestConverter extends BaseConverter {
    canConvert(element, widgetType) {
      return widgetType.startsWith('test_');
    }
    
    convert(element, widgetType, context) {
      return {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'text-editor',
        settings: { editor: 'Test conversion' },
        elements: [],
        isInner: false
      };
    }
    
    getMetadata() {
      return {
        name: 'TestConverter',
        version: '1.0.0',
        author: 'Test'
      };
    }
  }
  
  const testConverter = new TestConverter();
  
  // Test registration
  registry.registerConverter(['test_*'], testConverter, 10);
  console.log('✓ Converter registered');
  
  // Test exact match
  const converter1 = registry.getConverter('test_widget');
  console.log('✓ getConverter with wildcard match:', converter1 ? 'found' : 'not found');
  
  // Test hasConverter
  const hasConverter = registry.hasConverter('test_widget');
  console.log('✓ hasConverter:', hasConverter);
  
  // Test pattern matching
  const converter2 = registry.getConverter('test_another');
  console.log('✓ Pattern matching works:', converter2 ? 'yes' : 'no');
  
  // Test non-matching
  const converter3 = registry.getConverter('other_widget');
  console.log('✓ Non-matching returns null:', converter3 === null);
  
  // Test cache
  const converter4 = registry.getConverter('test_widget');
  console.log('✓ Cache works:', converter4 === converter1);
  
  // Test clearCache
  registry.clearCache();
  console.log('✓ Cache cleared');
  
} catch (e) {
  console.log('✗ ConverterRegistry test failed:', e.message);
}

console.log('\nTest 3: ConversionLogger class');
try {
  const logger = new ConversionLogger();
  console.log('✓ ConversionLogger instantiated');
  
  // Test logging methods
  logger.logConversionSuccess('test_widget', 'text-editor', 'TestConverter');
  console.log('✓ logConversionSuccess works');
  
  // Test success with data loss
  logger.logConversionSuccess('test_widget2', 'text-editor', 'TestConverter', {
    dataLoss: true,
    warnings: ['Lost animation settings']
  });
  console.log('✓ logConversionSuccess with data loss works');
  
  logger.logConversionFallback('unknown_widget', 'No converter available', true);
  console.log('✓ logConversionFallback works');
  
  // Test fallback without rendered content
  logger.logConversionFallback('unknown_widget2', 'No converter available', false);
  console.log('✓ logConversionFallback without rendered content works');
  
  logger.logConversionError('broken_widget', new Error('Test error'), { id: 'test123' });
  console.log('✓ logConversionError works');
  
  logger.logDataLoss('partial_widget', ['animation', 'custom_css']);
  console.log('✓ logDataLoss works');
  
  logger.logSummary(10);
  console.log('✓ logSummary works');
  
  // Test getStats
  const stats = logger.getStats();
  console.log('✓ getStats returns:', stats);
  console.log('  - Total:', stats.total);
  console.log('  - Conversions:', stats.conversions);
  console.log('  - Successful:', stats.successfulConversions);
  console.log('  - With data loss:', stats.conversionsWithDataLoss);
  console.log('  - Fallbacks:', stats.fallbacks);
  console.log('  - Errors:', stats.errors);
  console.log('  - Warnings:', stats.warnings);
  
  // Check state
  console.log('✓ Conversions logged:', logger.conversions.length);
  console.log('✓ Fallbacks logged:', logger.fallbacks.length);
  console.log('✓ Errors logged:', logger.errors.length);
  console.log('✓ Warnings logged:', logger.warnings.length);
  
  // Test reset
  logger.reset();
  console.log('✓ Logger reset:', logger.conversions.length === 0 && logger.warnings.length === 0);
  
} catch (e) {
  console.log('✗ ConversionLogger test failed:', e.message);
}

console.log('\nTest 4: Global instances');
try {
  console.log('✓ converterRegistry exists:', typeof converterRegistry !== 'undefined');
  console.log('✓ conversionLogger exists:', typeof conversionLogger !== 'undefined');
  console.log('✓ converterRegistry is ConverterRegistry:', converterRegistry instanceof ConverterRegistry);
  console.log('✓ conversionLogger is ConversionLogger:', conversionLogger instanceof ConversionLogger);
} catch (e) {
  console.log('✗ Global instances test failed:', e.message);
}

console.log('\n=== All Tests Complete ===');
