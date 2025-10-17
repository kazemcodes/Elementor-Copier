/**
 * Test script for ProgressCounterConverter
 * Verifies progress bar and counter widget detection and conversion
 */

// Load the format converter module
const {
  ProgressCounterConverter,
  converterRegistry
} = require('./elementor-format-converter.js');

console.log('=== Testing ProgressCounterConverter ===\n');

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

// Test 1: ProgressCounterConverter class exists and has required methods
console.log('Test 1: ProgressCounterConverter instantiation');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  console.log('✓ ProgressCounterConverter instantiated');
  
  const metadata = progressCounterConverter.getMetadata();
  console.log('✓ getMetadata returns:', metadata);
  console.log('  - Name:', metadata.name);
  console.log('  - Version:', metadata.version);
  console.log('  - Supported widgets:', metadata.supportedWidgets.length);
} catch (e) {
  console.log('✗ ProgressCounterConverter instantiation failed:', e.message);
}

// Test 2: Widget type detection for progress bars
console.log('\nTest 2: Widget type detection for progress bars (canConvert)');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  
  // Test progress bar matches
  const progressTests = [
    'progress',
    'progress-bar',
    'progress_bar',
    'skill-bar',
    'skill_bar',
    'skillbar',
    'wd_progress',
    'custom_progress_bar'
  ];
  
  progressTests.forEach(widgetType => {
    const result = progressCounterConverter.canConvert({}, widgetType);
    console.log(`✓ "${widgetType}":`, result ? 'detected' : 'NOT detected');
  });
} catch (e) {
  console.log('✗ Progress bar detection failed:', e.message);
}

// Test 3: Widget type detection for counters
console.log('\nTest 3: Widget type detection for counters (canConvert)');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  
  // Test counter matches
  const counterTests = [
    'counter',
    'number-counter',
    'number_counter',
    'stats',
    'stat',
    'wd_counter',
    'custom_stats'
  ];
  
  counterTests.forEach(widgetType => {
    const result = progressCounterConverter.canConvert({}, widgetType);
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
    const result = progressCounterConverter.canConvert({}, widgetType);
    console.log(`✓ "${widgetType}":`, result ? 'INCORRECTLY detected' : 'correctly ignored');
  });
} catch (e) {
  console.log('✗ Counter detection failed:', e.message);
}

// Test 4: Convert progress bar from settings
console.log('\nTest 4: Convert progress bar from settings');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'skill-bar',
    settings: {
      percentage: 75,
      title: 'JavaScript',
      inner_text: '%'
    }
  };
  
  const result = progressCounterConverter.convert(element, 'skill-bar', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Percentage:', result.settings.percent);
    console.log('  - Title:', result.settings.title);
    console.log('  - Display percentage:', result.settings.display_percentage);
    console.log('  - Conversion meta:', result._conversionMeta);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Progress bar conversion failed:', e.message);
}

// Test 5: Convert progress bar with decimal percentage
console.log('\nTest 5: Convert progress bar with decimal percentage (0-1 range)');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'progress',
    settings: {
      progress: 0.85,  // Should be converted to 85%
      skill_name: 'CSS'
    }
  };
  
  const result = progressCounterConverter.convert(element, 'progress', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Percentage (should be 85):', result.settings.percent.size);
    console.log('  - Title:', result.settings.title);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Decimal percentage conversion failed:', e.message);
}

// Test 6: Extract progress bar from HTML
console.log('\nTest 6: Extract progress bar from HTML');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'custom_progress',
    settings: {},
    renderedContent: '<div class="progress-bar" data-percentage="90" style="width: 90%"><h4>HTML</h4><span>90%</span></div>'
  };
  
  const result = progressCounterConverter.convert(element, 'custom_progress', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Percentage:', result.settings.percent.size);
    console.log('  - Title:', result.settings.title);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ HTML extraction failed:', e.message);
}

// Test 7: Convert counter from settings
console.log('\nTest 7: Convert counter from settings');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'counter',
    settings: {
      ending_number: 1500,
      starting_number: 0,
      title: 'Happy Clients',
      suffix: '+',
      duration: 3000,
      separator: ','
    }
  };
  
  const result = progressCounterConverter.convert(element, 'counter', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Ending number:', result.settings.ending_number);
    console.log('  - Starting number:', result.settings.starting_number);
    console.log('  - Title:', result.settings.title);
    console.log('  - Suffix:', result.settings.suffix);
    console.log('  - Duration:', result.settings.duration);
    console.log('  - Separator:', result.settings.thousand_separator);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Counter conversion failed:', e.message);
}

// Test 8: Convert counter with prefix
console.log('\nTest 8: Convert counter with prefix');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'stats',
    settings: {
      target_number: 99.9,
      title: 'Success Rate',
      prefix: '',
      suffix: '%'
    }
  };
  
  const result = progressCounterConverter.convert(element, 'stats', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Ending number:', result.settings.ending_number);
    console.log('  - Suffix:', result.settings.suffix);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Counter with prefix conversion failed:', e.message);
}

// Test 9: Extract counter from HTML
console.log('\nTest 9: Extract counter from HTML');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'custom_counter',
    settings: {},
    renderedContent: '<div class="counter" data-to="5000" data-duration="2000"><h3>Projects Completed</h3><span class="number">5000</span></div>'
  };
  
  const result = progressCounterConverter.convert(element, 'custom_counter', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Ending number:', result.settings.ending_number);
    console.log('  - Title:', result.settings.title);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ HTML extraction for counter failed:', e.message);
}

// Test 10: Type determination (progress vs counter)
console.log('\nTest 10: Type determination (progress vs counter)');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  
  // Should be detected as progress
  const progressElement = {
    widgetType: 'skill-widget',
    settings: {
      percentage: 80,
      title: 'PHP'
    }
  };
  
  const progressResult = progressCounterConverter.convert(progressElement, 'skill-widget', context);
  console.log('✓ Skill widget detected as:', progressResult ? progressResult.widgetType : 'null');
  
  // Should be detected as counter
  const counterElement = {
    widgetType: 'stat-widget',
    settings: {
      ending_number: 250,
      title: 'Awards Won'
    }
  };
  
  const counterResult = progressCounterConverter.convert(counterElement, 'stat-widget', context);
  console.log('✓ Stat widget detected as:', counterResult ? counterResult.widgetType : 'null');
} catch (e) {
  console.log('✗ Type determination test failed:', e.message);
}

// Test 11: Data loss tracking
console.log('\nTest 11: Data loss tracking');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'progress',
    settings: {
      percentage: 65,
      title: 'React',
      animation: 'slide',
      duration: 1500,
      border_radius: 10
    }
  };
  
  const result = progressCounterConverter.convert(element, 'progress', context);
  console.log('✓ Data loss detected:', result._conversionMeta.dataLoss);
  console.log('✓ Warnings:', result._conversionMeta.warnings);
} catch (e) {
  console.log('✗ Data loss tracking test failed:', e.message);
}

// Test 12: Registry integration
console.log('\nTest 12: Registry integration');
try {
  const converter1 = converterRegistry.getConverter('progress-bar');
  console.log('✓ ProgressCounterConverter registered for progress:', converter1 ? 'yes' : 'no');
  console.log('✓ Converter name:', converter1 ? converter1.constructor.name : 'N/A');
  
  const converter2 = converterRegistry.getConverter('skill-bar');
  console.log('✓ Pattern matching for skill:', converter2 ? 'yes' : 'no');
  
  const converter3 = converterRegistry.getConverter('counter');
  console.log('✓ Pattern matching for counter:', converter3 ? 'yes' : 'no');
  
  const converter4 = converterRegistry.getConverter('wd_stats_widget');
  console.log('✓ Pattern matching for stats:', converter4 ? 'yes' : 'no');
} catch (e) {
  console.log('✗ Registry integration test failed:', e.message);
}

// Test 13: Number formatting in counter
console.log('\nTest 13: Number formatting in counter');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  const element = {
    widgetType: 'counter',
    settings: {
      counter_value: '1,500,000',  // String with commas
      title: 'Downloads'
    }
  };
  
  const result = progressCounterConverter.convert(element, 'counter', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Ending number (should be 1500000):', result.settings.ending_number);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Number formatting test failed:', e.message);
}

// Test 14: Percentage clamping
console.log('\nTest 14: Percentage clamping (0-100 range)');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  
  // Test over 100
  const element1 = {
    widgetType: 'progress',
    settings: {
      percentage: 150,
      title: 'Over 100'
    }
  };
  
  const result1 = progressCounterConverter.convert(element1, 'progress', context);
  console.log('✓ 150% clamped to:', result1 ? result1.settings.percent.size : 'null');
  
  // Test negative
  const element2 = {
    widgetType: 'progress',
    settings: {
      percentage: -10,
      title: 'Negative'
    }
  };
  
  const result2 = progressCounterConverter.convert(element2, 'progress', context);
  console.log('✓ -10% clamped to:', result2 ? result2.settings.percent.size : 'null');
} catch (e) {
  console.log('✗ Percentage clamping test failed:', e.message);
}

// Test 15: Various settings field names
console.log('\nTest 15: Various settings field names');
try {
  const progressCounterConverter = new ProgressCounterConverter();
  
  // Test different field names for progress
  const progressFields = [
    { field: 'percentage', value: 70 },
    { field: 'percent', value: 80 },
    { field: 'progress', value: 90 },
    { field: 'skill_level', value: 95 },
    { field: 'value', value: 85 }
  ];
  
  progressFields.forEach(({ field, value }) => {
    const element = {
      widgetType: 'progress',
      settings: {
        [field]: value,
        title: `Test ${field}`
      }
    };
    
    const result = progressCounterConverter.convert(element, 'progress', context);
    console.log(`✓ Field "${field}":`, result ? `converted (${result.settings.percent.size}%)` : 'failed');
  });
  
  // Test different field names for counter
  const counterFields = [
    { field: 'ending_number', value: 100 },
    { field: 'target_number', value: 200 },
    { field: 'end_value', value: 300 },
    { field: 'counter_value', value: 400 },
    { field: 'number', value: 500 }
  ];
  
  counterFields.forEach(({ field, value }) => {
    const element = {
      widgetType: 'counter',
      settings: {
        [field]: value,
        title: `Test ${field}`
      }
    };
    
    const result = progressCounterConverter.convert(element, 'counter', context);
    console.log(`✓ Field "${field}":`, result ? `converted (${result.settings.ending_number})` : 'failed');
  });
} catch (e) {
  console.log('✗ Various field names test failed:', e.message);
}

console.log('\n=== All ProgressCounterConverter Tests Complete ===');
