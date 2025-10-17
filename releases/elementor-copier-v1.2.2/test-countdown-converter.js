/**
 * Test script for CountdownConverter
 * Verifies countdown widget detection and conversion
 */

// Load the format converter module
const {
  CountdownConverter,
  converterRegistry
} = require('./elementor-format-converter.js');

console.log('=== Testing CountdownConverter ===\n');

// Helper function to generate element ID
function generateElementId() {
  return Math.random().toString(16).substr(2, 8);
}

// Create context object
const context = {
  generateElementId: generateElementId,
  sanitizer: null,
  logger: null
};

// Test 1: CountdownConverter class exists and has required methods
console.log('Test 1: CountdownConverter instantiation');
try {
  const countdownConverter = new CountdownConverter();
  console.log('✓ CountdownConverter instantiated');
  
  const metadata = countdownConverter.getMetadata();
  console.log('✓ getMetadata returns:', metadata);
  console.log('  - Name:', metadata.name);
  console.log('  - Version:', metadata.version);
  console.log('  - Supported widgets:', metadata.supportedWidgets.length);
} catch (e) {
  console.log('✗ CountdownConverter instantiation failed:', e.message);
}

// Test 2: Widget type detection
console.log('\nTest 2: Widget type detection (canConvert)');
try {
  const countdownConverter = new CountdownConverter();
  
  // Test positive matches
  const positiveTests = [
    'countdown',
    'countdown-timer',
    'countdown_timer',
    'wd_countdown',
    'custom_countdown',
    'timer',
    'count-down',
    'deadline',
    'deadline-timer'
  ];
  
  positiveTests.forEach(widgetType => {
    const result = countdownConverter.canConvert({}, widgetType);
    console.log(`✓ "${widgetType}":`, result ? 'detected' : 'NOT detected');
  });
  
  // Test negative matches
  const negativeTests = [
    'image',
    'heading',
    'video',
    'gallery'
  ];
  
  negativeTests.forEach(widgetType => {
    const result = countdownConverter.canConvert({}, widgetType);
    console.log(`✓ "${widgetType}":`, result ? 'INCORRECTLY detected' : 'correctly ignored');
  });
} catch (e) {
  console.log('✗ Widget type detection failed:', e.message);
}

// Test 3: Extract countdown from settings with date field
console.log('\nTest 3: Extract countdown from settings (due_date)');
try {
  const countdownConverter = new CountdownConverter();
  const element = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      label_days: 'Days',
      label_hours: 'Hours',
      label_minutes: 'Minutes',
      label_seconds: 'Seconds'
    }
  };
  
  const result = countdownConverter.convert(element, 'countdown', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Target date:', result.settings.due_date);
    console.log('  - Days label:', result.settings.label_days);
    console.log('  - Hours label:', result.settings.label_hours);
    console.log('  - Minutes label:', result.settings.label_minutes);
    console.log('  - Seconds label:', result.settings.label_seconds);
    console.log('  - Conversion meta:', result._conversionMeta);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from settings failed:', e.message);
}

// Test 4: Extract countdown from settings with timestamp
console.log('\nTest 4: Extract countdown from settings (timestamp)');
try {
  const countdownConverter = new CountdownConverter();
  const targetTimestamp = Math.floor(new Date('2025-12-31T23:59:59').getTime() / 1000);
  
  const element = {
    widgetType: 'wd_countdown',
    settings: {
      timestamp: targetTimestamp,
      days_label: 'D',
      hours_label: 'H',
      minutes_label: 'M',
      seconds_label: 'S'
    }
  };
  
  const result = countdownConverter.convert(element, 'wd_countdown', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Target date:', result.settings.due_date);
    console.log('  - Days label:', result.settings.label_days);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from timestamp failed:', e.message);
}

// Test 5: Extract countdown from HTML with data attributes
console.log('\nTest 5: Extract countdown from HTML (data attributes)');
try {
  const countdownConverter = new CountdownConverter();
  const element = {
    widgetType: 'custom_countdown',
    settings: {},
    renderedContent: '<div class="countdown" data-date="2025-12-31T23:59:59"><span class="days">10</span><span class="hours">5</span></div>'
  };
  
  const result = countdownConverter.convert(element, 'custom_countdown', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Target date:', result.settings.due_date);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from HTML failed:', e.message);
}

// Test 6: Completion actions
console.log('\nTest 6: Completion actions');
try {
  const countdownConverter = new CountdownConverter();
  
  // Test hide action
  const element1 = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      expire_action: 'hide'
    }
  };
  
  const result1 = countdownConverter.convert(element1, 'countdown', context);
  console.log('✓ Hide action:', result1.settings.expire_actions);
  
  // Test redirect action
  const element2 = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      expire_action: 'redirect',
      expire_redirect_url: 'https://example.com'
    }
  };
  
  const result2 = countdownConverter.convert(element2, 'countdown', context);
  console.log('✓ Redirect action:', result2.settings.expire_actions);
  console.log('  - Redirect URL:', result2.settings.expire_redirect_url);
  
  // Test message action
  const element3 = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      expire_action: 'message',
      expire_message: 'Countdown complete!'
    }
  };
  
  const result3 = countdownConverter.convert(element3, 'countdown', context);
  console.log('✓ Message action:', result3.settings.expire_actions);
  console.log('  - Message:', result3.settings.message_after_expire);
} catch (e) {
  console.log('✗ Completion actions test failed:', e.message);
}

// Test 7: Show/hide time units
console.log('\nTest 7: Show/hide time units');
try {
  const countdownConverter = new CountdownConverter();
  const element = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      show_days: true,
      show_hours: true,
      show_minutes: false,
      show_seconds: false
    }
  };
  
  const result = countdownConverter.convert(element, 'countdown', context);
  console.log('✓ Show days:', result.settings.show_days);
  console.log('✓ Show hours:', result.settings.show_hours);
  console.log('✓ Show minutes:', result.settings.show_minutes);
  console.log('✓ Show seconds:', result.settings.show_seconds);
} catch (e) {
  console.log('✗ Show/hide time units test failed:', e.message);
}

// Test 8: Data loss tracking
console.log('\nTest 8: Data loss tracking');
try {
  const countdownConverter = new CountdownConverter();
  const element = {
    widgetType: 'countdown',
    settings: {
      due_date: '2025-12-31T23:59:59',
      separator: ':',
      digit_style: 'modern',
      animation: 'fade',
      evergreen: true,
      evergreen_days: 7
    }
  };
  
  const result = countdownConverter.convert(element, 'countdown', context);
  console.log('✓ Data loss detected:', result._conversionMeta.dataLoss);
  console.log('✓ Warnings:', result._conversionMeta.warnings);
} catch (e) {
  console.log('✗ Data loss tracking test failed:', e.message);
}

// Test 9: Registry integration
console.log('\nTest 9: Registry integration');
try {
  const converter = converterRegistry.getConverter('countdown');
  console.log('✓ CountdownConverter registered:', converter ? 'yes' : 'no');
  console.log('✓ Converter name:', converter ? converter.constructor.name : 'N/A');
  
  const converter2 = converterRegistry.getConverter('wd_countdown_timer');
  console.log('✓ Pattern matching works:', converter2 ? 'yes' : 'no');
  
  const converter3 = converterRegistry.getConverter('deadline-widget');
  console.log('✓ Deadline pattern works:', converter3 ? 'yes' : 'no');
} catch (e) {
  console.log('✗ Registry integration test failed:', e.message);
}

// Test 10: Date format variations
console.log('\nTest 10: Date format variations');
try {
  const countdownConverter = new CountdownConverter();
  
  // Test various date formats
  const dateFormats = [
    { name: 'ISO 8601', field: 'due_date', value: '2025-12-31T23:59:59' },
    { name: 'Date only', field: 'due_date', value: '2025-12-31' },
    { name: 'Date object', field: 'due_date', value: new Date('2025-12-31T23:59:59') },
    { name: 'Unix timestamp (seconds)', field: 'timestamp', value: Math.floor(new Date('2025-12-31T23:59:59').getTime() / 1000) },
    { name: 'Unix timestamp (ms)', field: 'timestamp', value: new Date('2025-12-31T23:59:59').getTime() }
  ];
  
  dateFormats.forEach(({ name, field, value }) => {
    const element = {
      widgetType: 'countdown',
      settings: {
        [field]: value
      }
    };
    
    const result = countdownConverter.convert(element, 'countdown', context);
    console.log(`✓ ${name}:`, result ? 'converted' : 'failed');
    if (result) {
      console.log(`  - Result date: ${result.settings.due_date}`);
    }
  });
} catch (e) {
  console.log('✗ Date format variations test failed:', e.message);
}

console.log('\n=== All CountdownConverter Tests Complete ===');
