/**
 * Integration test for converter registry with convertCustomWidgetToStandard
 * Verifies that the registry is properly integrated into the conversion pipeline
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing Converter Integration ===\n');

// Create a custom converter for video widgets
class VideoConverter extends BaseConverter {
  canConvert(element, widgetType) {
    return widgetType.includes('video') || widgetType.includes('player');
  }
  
  convert(element, widgetType, context) {
    const settings = element.settings || {};
    const videoUrl = settings.video_url || settings.youtube_url || settings.url;
    
    if (!videoUrl) {
      return null;
    }
    
    return {
      elType: 'widget',
      id: context.generateElementId(),
      widgetType: 'video',
      settings: {
        video_type: 'youtube',
        youtube_url: videoUrl,
        _element_id: '',
        _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
      },
      elements: [],
      isInner: false
    };
  }
  
  getMetadata() {
    return {
      name: 'VideoConverter',
      version: '1.0.0',
      author: 'Test'
    };
  }
}

// Register the video converter
const videoConverter = new VideoConverter();
converterRegistry.registerConverter(['video*', 'player*', '*_video', '*_player'], videoConverter, 10);
console.log('✓ VideoConverter registered\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Convert a custom video widget using the registered converter
console.log('Test 1: Custom video widget conversion');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'wd_video_player',
      settings: {
        video_url: 'https://youtube.com/watch?v=abc123'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Video URL preserved:', result.settings.youtube_url);
  console.log('  Conversions logged:', conversionLogger.conversions.length);
  
  // Check conversion metadata
  if (result._conversionMeta) {
    console.log('✓ Conversion metadata present:');
    console.log('  - Original type:', result._conversionMeta.originalType);
    console.log('  - Converter:', result._conversionMeta.converter);
    console.log('  - Source:', result._conversionMeta.source);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
  } else {
    console.log('✗ Conversion metadata missing');
  }
  
  if (result.widgetType === 'video' && result.settings.youtube_url) {
    console.log('✓ VideoConverter was used successfully\n');
  } else {
    console.log('✗ VideoConverter was not used\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Convert a widget with no registered converter (should use pattern matching)
console.log('Test 2: Widget with no registered converter');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'custom_image_box',
      settings: {
        image: {
          url: 'https://example.com/image.jpg'
        }
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Image URL preserved:', result.settings.image?.url);
  
  // Check conversion metadata for pattern-based conversion
  if (result._conversionMeta) {
    console.log('✓ Conversion metadata present:');
    console.log('  - Converter:', result._conversionMeta.converter);
    console.log('  - Source:', result._conversionMeta.source);
  }
  
  if (result.widgetType === 'image') {
    console.log('✓ Pattern-based conversion worked as fallback\n');
  } else {
    console.log('✗ Pattern-based conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Convert a widget with no converter and no pattern match (should use HTML fallback)
console.log('Test 3: Widget with HTML fallback');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'unknown_custom_widget',
      settings: {},
      renderedContent: '<div class="custom-widget">Custom content</div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  HTML preserved:', result.settings.html ? 'yes' : 'no');
  console.log('  Fallbacks logged:', conversionLogger.fallbacks.length);
  
  // Check conversion metadata for HTML fallback
  if (result._conversionMeta) {
    console.log('✓ Conversion metadata present:');
    console.log('  - Converter:', result._conversionMeta.converter);
    console.log('  - Source:', result._conversionMeta.source);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Warnings:', result._conversionMeta.warnings);
  }
  
  if (result.widgetType === 'html' && result.settings.html) {
    console.log('✓ HTML fallback worked correctly\n');
  } else {
    console.log('✗ HTML fallback failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Verify logger captured all conversions
console.log('Test 4: Logger summary and statistics');
const stats = conversionLogger.getStats();
console.log('  Statistics:');
console.log('    - Total:', stats.total);
console.log('    - Conversions:', stats.conversions);
console.log('    - Successful:', stats.successfulConversions);
console.log('    - With data loss:', stats.conversionsWithDataLoss);
console.log('    - Fallbacks:', stats.fallbacks);
console.log('    - Errors:', stats.errors);

if (conversionLogger.conversions.length > 0) {
  console.log('✓ Logger captured conversions');
}
if (conversionLogger.fallbacks.length > 0) {
  console.log('✓ Logger captured fallbacks');
}

console.log('\n=== Integration Tests Complete ===');
