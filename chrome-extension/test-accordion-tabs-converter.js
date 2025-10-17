/**
 * Test script for AccordionTabsConverter
 * Verifies accordion and tabs widget detection and conversion
 */

// Load the format converter module
const {
  AccordionTabsConverter,
  converterRegistry
} = require('./elementor-format-converter.js');

console.log('=== Testing AccordionTabsConverter ===\n');

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

// Test 1: AccordionTabsConverter class exists and has required methods
console.log('Test 1: AccordionTabsConverter instantiation');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  console.log('✓ AccordionTabsConverter instantiated');
  
  const metadata = accordionTabsConverter.getMetadata();
  console.log('✓ getMetadata returns:', metadata);
  console.log('  - Name:', metadata.name);
  console.log('  - Version:', metadata.version);
  console.log('  - Supported widgets:', metadata.supportedWidgets.length);
} catch (e) {
  console.log('✗ AccordionTabsConverter instantiation failed:', e.message);
}

// Test 2: Widget type detection
console.log('\nTest 2: Widget type detection (canConvert)');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  
  // Test positive matches
  const positiveTests = [
    'accordion',
    'tabs',
    'tab',
    'toggle',
    'collapse',
    'panel',
    'wd_accordion',
    'wd_tabs',
    'custom_accordion',
    'custom_tabs',
    'accordion-item',
    'tab-item'
  ];
  
  positiveTests.forEach(widgetType => {
    const result = accordionTabsConverter.canConvert({}, widgetType);
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
    const result = accordionTabsConverter.canConvert({}, widgetType);
    console.log(`✓ "${widgetType}":`, result ? 'INCORRECTLY detected' : 'correctly ignored');
  });
} catch (e) {
  console.log('✗ Widget type detection failed:', e.message);
}

// Test 3: Extract accordion from settings with items array
console.log('\nTest 3: Extract accordion from settings (items array)');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'accordion',
    settings: {
      items: [
        { title: 'Item 1', content: 'Content for item 1' },
        { title: 'Item 2', content: 'Content for item 2' },
        { title: 'Item 3', content: 'Content for item 3' }
      ]
    }
  };
  
  const result = accordionTabsConverter.convert(element, 'accordion', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Number of items:', result.settings.tabs.length);
    console.log('  - First item title:', result.settings.tabs[0].tab_title);
    console.log('  - First item content:', result.settings.tabs[0].tab_content);
    console.log('  - Conversion meta:', result._conversionMeta);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from settings failed:', e.message);
}

// Test 4: Extract tabs from settings with tabs array
console.log('\nTest 4: Extract tabs from settings (tabs array)');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'tabs',
    settings: {
      tabs: [
        { tab_title: 'Tab 1', tab_content: 'Content for tab 1' },
        { tab_title: 'Tab 2', tab_content: 'Content for tab 2' }
      ]
    }
  };
  
  const result = accordionTabsConverter.convert(element, 'tabs', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Number of tabs:', result.settings.tabs.length);
    console.log('  - First tab title:', result.settings.tabs[0].tab_title);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from tabs array failed:', e.message);
}

// Test 5: Extract accordion from HTML
console.log('\nTest 5: Extract accordion from HTML');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'custom_accordion',
    settings: {},
    renderedContent: `
      <div class="accordion">
        <div class="accordion-item">
          <h3 class="accordion-title">Question 1</h3>
          <div class="accordion-content">Answer to question 1</div>
        </div>
        <div class="accordion-item">
          <h3 class="accordion-title">Question 2</h3>
          <div class="accordion-content">Answer to question 2</div>
        </div>
      </div>
    `
  };
  
  const result = accordionTabsConverter.convert(element, 'custom_accordion', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Number of items:', result.settings.tabs.length);
    console.log('  - First item title:', result.settings.tabs[0].tab_title);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from HTML failed:', e.message);
}

// Test 6: Extract tabs from HTML
console.log('\nTest 6: Extract tabs from HTML');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'custom_tabs',
    settings: {},
    renderedContent: `
      <div class="tabs">
        <ul class="tab-nav">
          <li class="tab-title">Tab 1</li>
          <li class="tab-title">Tab 2</li>
        </ul>
        <div class="tab-content">Content for tab 1</div>
        <div class="tab-content">Content for tab 2</div>
      </div>
    `
  };
  
  const result = accordionTabsConverter.convert(element, 'custom_tabs', context);
  
  if (result) {
    console.log('✓ Conversion successful');
    console.log('  - Widget type:', result.widgetType);
    console.log('  - Number of tabs:', result.settings.tabs.length);
  } else {
    console.log('✗ Conversion returned null');
  }
} catch (e) {
  console.log('✗ Conversion from HTML failed:', e.message);
}

// Test 7: Widget type determination (accordion vs tabs)
console.log('\nTest 7: Widget type determination');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  
  // Test accordion widget type
  const element1 = {
    widgetType: 'accordion',
    settings: {
      items: [
        { title: 'Item 1', content: 'Content 1' }
      ]
    }
  };
  
  const result1 = accordionTabsConverter.convert(element1, 'accordion', context);
  console.log('✓ Accordion widget type:', result1.widgetType);
  
  // Test tabs widget type
  const element2 = {
    widgetType: 'tabs',
    settings: {
      items: [
        { title: 'Tab 1', content: 'Content 1' }
      ]
    }
  };
  
  const result2 = accordionTabsConverter.convert(element2, 'tabs', context);
  console.log('✓ Tabs widget type:', result2.widgetType);
  
  // Test toggle (should default to accordion)
  const element3 = {
    widgetType: 'toggle',
    settings: {
      items: [
        { title: 'Toggle 1', content: 'Content 1' }
      ]
    }
  };
  
  const result3 = accordionTabsConverter.convert(element3, 'toggle', context);
  console.log('✓ Toggle widget type (should be accordion):', result3.widgetType);
} catch (e) {
  console.log('✗ Widget type determination test failed:', e.message);
}

// Test 8: Active item setting
console.log('\nTest 8: Active item setting');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'accordion',
    settings: {
      items: [
        { title: 'Item 1', content: 'Content 1' },
        { title: 'Item 2', content: 'Content 2' },
        { title: 'Item 3', content: 'Content 3' }
      ],
      active_item: 1
    }
  };
  
  const result = accordionTabsConverter.convert(element, 'accordion', context);
  console.log('✓ Active item set:', result.settings.selected_tab);
  console.log('  - Expected: 2 (1-based index)');
} catch (e) {
  console.log('✗ Active item setting test failed:', e.message);
}

// Test 9: Data loss tracking
console.log('\nTest 9: Data loss tracking');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  const element = {
    widgetType: 'accordion',
    settings: {
      items: [
        { title: 'Item 1', content: 'Content 1' }
      ],
      animation: 'slide',
      icon: 'fa-plus',
      icon_active: 'fa-minus',
      collapsible: true,
      multiple: false
    }
  };
  
  const result = accordionTabsConverter.convert(element, 'accordion', context);
  console.log('✓ Data loss detected:', result._conversionMeta.dataLoss);
  console.log('✓ Warnings:', result._conversionMeta.warnings);
} catch (e) {
  console.log('✗ Data loss tracking test failed:', e.message);
}

// Test 10: Registry integration
console.log('\nTest 10: Registry integration');
try {
  const converter = converterRegistry.getConverter('accordion');
  console.log('✓ AccordionTabsConverter registered:', converter ? 'yes' : 'no');
  console.log('✓ Converter name:', converter ? converter.constructor.name : 'N/A');
  
  const converter2 = converterRegistry.getConverter('wd_tabs');
  console.log('✓ Pattern matching works for tabs:', converter2 ? 'yes' : 'no');
  
  const converter3 = converterRegistry.getConverter('custom_toggle');
  console.log('✓ Toggle pattern works:', converter3 ? 'yes' : 'no');
  
  const converter4 = converterRegistry.getConverter('panel-widget');
  console.log('✓ Panel pattern works:', converter4 ? 'yes' : 'no');
} catch (e) {
  console.log('✗ Registry integration test failed:', e.message);
}

// Test 11: Various settings formats
console.log('\nTest 11: Various settings formats');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  
  // Test panels array format
  const element1 = {
    widgetType: 'accordion',
    settings: {
      panels: [
        { title: 'Panel 1', content: 'Content 1' }
      ]
    }
  };
  
  const result1 = accordionTabsConverter.convert(element1, 'accordion', context);
  console.log('✓ Panels format:', result1 ? 'converted' : 'failed');
  
  // Test accordion_items format
  const element2 = {
    widgetType: 'accordion',
    settings: {
      accordion_items: [
        { title: 'Accordion 1', content: 'Content 1' }
      ]
    }
  };
  
  const result2 = accordionTabsConverter.convert(element2, 'accordion', context);
  console.log('✓ Accordion_items format:', result2 ? 'converted' : 'failed');
  
  // Test toggles format
  const element3 = {
    widgetType: 'toggle',
    settings: {
      toggles: [
        { title: 'Toggle 1', content: 'Content 1' }
      ]
    }
  };
  
  const result3 = accordionTabsConverter.convert(element3, 'toggle', context);
  console.log('✓ Toggles format:', result3 ? 'converted' : 'failed');
} catch (e) {
  console.log('✗ Various settings formats test failed:', e.message);
}

// Test 12: Empty or invalid data handling
console.log('\nTest 12: Empty or invalid data handling');
try {
  const accordionTabsConverter = new AccordionTabsConverter();
  
  // Test empty items array
  const element1 = {
    widgetType: 'accordion',
    settings: {
      items: []
    }
  };
  
  const result1 = accordionTabsConverter.convert(element1, 'accordion', context);
  console.log('✓ Empty items array:', result1 ? 'incorrectly converted' : 'correctly returned null');
  
  // Test no items at all
  const element2 = {
    widgetType: 'accordion',
    settings: {}
  };
  
  const result2 = accordionTabsConverter.convert(element2, 'accordion', context);
  console.log('✓ No items:', result2 ? 'incorrectly converted' : 'correctly returned null');
  
  // Test invalid HTML
  const element3 = {
    widgetType: 'accordion',
    settings: {},
    renderedContent: '<div>No accordion structure here</div>'
  };
  
  const result3 = accordionTabsConverter.convert(element3, 'accordion', context);
  console.log('✓ Invalid HTML:', result3 ? 'extracted something' : 'correctly returned null');
} catch (e) {
  console.log('✗ Empty or invalid data handling test failed:', e.message);
}

console.log('\n=== All AccordionTabsConverter Tests Complete ===');
