/**
 * Test script for IconListConverter
 * Verifies icon list widget conversion from various themes/plugins
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing IconListConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Icon list from settings with items array
console.log('Test 1: Icon list from settings with items array');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_icon_list',
      settings: {
        items: [
          {
            icon: { value: 'fas fa-check', library: 'fa-solid' },
            text: 'First feature',
            link: { url: 'https://example.com/1', is_external: '', nofollow: '' }
          },
          {
            icon: { value: 'fas fa-star', library: 'fa-solid' },
            text: 'Second feature',
            link: { url: '', is_external: '', nofollow: '' }
          },
          {
            icon: { value: 'fas fa-heart', library: 'fa-solid' },
            text: 'Third feature',
            link: { url: 'https://example.com/3', is_external: '', nofollow: '' }
          }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 3) {
    console.log('✓ Icon list converted correctly');
    console.log('  First item text:', result.settings.icon_list[0].text);
    console.log('  First item icon:', result.settings.icon_list[0].selected_icon?.value);
    console.log('  First item link:', result.settings.icon_list[0].link?.url);
    console.log('✓ All items preserved\n');
  } else {
    console.log('✗ Icon list conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Icon list from HTML with <li> tags
console.log('Test 2: Icon list from HTML with <li> tags');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_icon_list',
      settings: {},
      renderedContent: `
        <ul class="icon-list">
          <li><i class="fas fa-check"></i> <span>Feature one</span></li>
          <li><i class="fas fa-times"></i> <span>Feature two</span></li>
          <li><i class="fas fa-info"></i> <a href="https://example.com">Feature three</a></li>
        </ul>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 3) {
    console.log('✓ HTML extraction worked');
    console.log('  First item text:', result.settings.icon_list[0].text);
    console.log('  Third item has link:', !!result.settings.icon_list[2].link?.url);
    console.log('✓ Items extracted from HTML\n');
  } else {
    console.log('✗ HTML extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Feature list with different property names
console.log('Test 3: Feature list with different property names');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'feature_list',
      settings: {
        features: [
          {
            icon_class: 'fa fa-rocket',
            title: 'Fast Performance',
            url: 'https://example.com/performance'
          },
          {
            selected_icon: { value: 'fas fa-shield-alt', library: 'fa-solid' },
            label: 'Secure',
            href: ''
          }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 2) {
    console.log('✓ Different property names normalized');
    console.log('  First item text:', result.settings.icon_list[0].text);
    console.log('  Second item text:', result.settings.icon_list[1].text);
    console.log('✓ Property mapping worked\n');
  } else {
    console.log('✗ Property mapping failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Icon list with string icons (not objects)
console.log('Test 4: Icon list with string icons');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'icon_list_widget',
      settings: {
        list_items: [
          {
            icon: 'fas fa-check-circle',
            text: 'Item with string icon'
          },
          {
            icon: 'far fa-circle',
            content: 'Another item'
          }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 2 &&
      result.settings.icon_list[0].selected_icon?.value === 'fas fa-check-circle') {
    console.log('✓ String icons converted to objects');
    console.log('  First icon:', result.settings.icon_list[0].selected_icon?.value);
    console.log('  Second icon:', result.settings.icon_list[1].selected_icon?.value);
    console.log('✓ Icon normalization worked\n');
  } else {
    console.log('✗ Icon normalization failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Icon list without icons (should add default checkmarks)
console.log('Test 5: Icon list without icons (default checkmarks)');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'checklist',
      settings: {
        items: [
          { text: 'Item without icon' },
          { text: 'Another item without icon' }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 2 &&
      result.settings.icon_list[0].selected_icon?.value === 'fas fa-check') {
    console.log('✓ Default checkmark icons added');
    console.log('  First icon:', result.settings.icon_list[0].selected_icon?.value);
    console.log('  Second icon:', result.settings.icon_list[1].selected_icon?.value);
    console.log('✓ Default icon fallback worked\n');
  } else {
    console.log('✗ Default icon fallback failed\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Icon list from HTML with div structure
console.log('Test 6: Icon list from HTML with div structure');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'feature_list_custom',
      settings: {},
      renderedContent: `
        <div class="feature-list">
          <div class="icon-list-item">
            <i class="fas fa-bolt"></i>
            <div class="text">Lightning fast</div>
          </div>
          <div class="icon-list-item">
            <i class="fas fa-lock"></i>
            <span>Secure by default</span>
          </div>
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 2) {
    console.log('✓ Div structure extraction worked');
    console.log('  First item text:', result.settings.icon_list[0].text);
    console.log('  Second item text:', result.settings.icon_list[1].text);
    console.log('✓ Items extracted from div structure\n');
  } else {
    console.log('✗ Div structure extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Icon list with SVG icons
console.log('Test 7: Icon list with SVG icons');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'svg_icon_list',
      settings: {},
      renderedContent: `
        <ul>
          <li>
            <svg width="20" height="20"><circle cx="10" cy="10" r="8"/></svg>
            <span>SVG icon item</span>
          </li>
        </ul>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Item count:', result.settings.icon_list?.length);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_list &&
      result.settings.icon_list.length === 1) {
    console.log('✓ SVG icon extraction worked');
    console.log('  Icon library:', result.settings.icon_list[0].selected_icon?.library);
    console.log('  Has SVG content:', result.settings.icon_list[0].selected_icon?.value?.includes('svg'));
    console.log('✓ SVG icons preserved\n');
  } else {
    console.log('✗ SVG icon extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: Icon list with icon position setting
console.log('Test 8: Icon list with icon position setting');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'icon_list_right',
      settings: {
        items: [
          { icon: 'fas fa-arrow-right', text: 'Right aligned icon' }
        ],
        icon_align: 'right'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Icon align:', result.settings.icon_align);
  
  if (result.widgetType === 'icon-list' && 
      result.settings.icon_align === 'right') {
    console.log('✓ Icon position preserved\n');
  } else {
    console.log('✗ Icon position not preserved\n');
  }
} catch (e) {
  console.log('✗ Test 8 failed:', e.message, '\n');
}

// Test 9: Verify conversion metadata
console.log('Test 9: Conversion metadata');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_icon_list',
      settings: {
        items: [
          { icon: 'fas fa-check', text: 'Test item' }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  if (result._conversionMeta) {
    console.log('✓ Conversion metadata present:');
    console.log('  - Original type:', result._conversionMeta.originalType);
    console.log('  - Converter:', result._conversionMeta.converter);
    console.log('  - Source:', result._conversionMeta.source);
    console.log('  - Item count:', result._conversionMeta.itemCount);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
    
    if (result._conversionMeta.converter === 'IconListConverter') {
      console.log('✓ Metadata is correct (IconListConverter used)\n');
    } else {
      console.log('✗ Metadata is incorrect\n');
    }
  } else {
    console.log('✗ Conversion metadata missing\n');
  }
} catch (e) {
  console.log('✗ Test 9 failed:', e.message, '\n');
}

// Test 10: Logger summary
console.log('Test 10: Logger summary and statistics');
const stats = conversionLogger.getStats();
console.log('  Statistics:');
console.log('    - Total:', stats.total);
console.log('    - Conversions:', stats.conversions);
console.log('    - Successful:', stats.successfulConversions);
console.log('    - Fallbacks:', stats.fallbacks);
console.log('    - Errors:', stats.errors);

if (stats.conversions > 0 && stats.errors === 0) {
  console.log('✓ All icon list conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== IconListConverter Tests Complete ===');
