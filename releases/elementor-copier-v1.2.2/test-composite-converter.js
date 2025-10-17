/**
 * Test script for CompositeWidgetConverter
 * Verifies conversion of composite widgets (icon-box, feature-box, etc.)
 */

// Load the format converter module
const {
  converterRegistry,
  conversionLogger,
  generateElementId
} = require('./elementor-format-converter.js');

console.log('=== Testing CompositeWidgetConverter ===\n');

// Helper to create context
function createTestContext() {
  return {
    extractImageUrl: (settings, renderedContent) => {
      if (settings.image?.url) return settings.image.url;
      if (renderedContent) {
        const match = renderedContent.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) return match[1];
      }
      return null;
    },
    extractTextContent: (settings, renderedContent) => {
      if (settings.content) return settings.content;
      if (settings.text) return settings.text;
      return renderedContent || null;
    },
    extractHeadingData: (settings, renderedContent) => {
      const result = { title: '', tag: 'h2', align: '' };
      if (settings.title) result.title = settings.title;
      if (settings.heading) result.title = settings.heading;
      if (settings.tag) result.tag = settings.tag;
      return result;
    },
    extractButtonData: (settings, renderedContent) => {
      const result = { text: '', link: null, align: 'center' };
      if (settings.button_text) result.text = settings.button_text;
      if (settings.link) result.link = settings.link;
      return result;
    },
    extractIconData: (settings, renderedContent) => {
      const result = { icon: null };
      if (settings.icon) result.icon = settings.icon;
      return result;
    },
    generateElementId,
    sanitizer: null,
    logger: conversionLogger
  };
}

// Test 1: Check if CompositeWidgetConverter is registered
console.log('Test 1: CompositeWidgetConverter registration');
try {
  const converter = converterRegistry.getConverter('wd_icon_box');
  if (converter) {
    console.log('✓ CompositeWidgetConverter found for "wd_icon_box"');
    console.log('  Metadata:', converter.getMetadata());
  } else {
    console.log('✗ CompositeWidgetConverter not found');
  }
} catch (e) {
  console.log('✗ Test failed:', e.message);
}

// Test 2: Convert simple icon-box widget
console.log('\nTest 2: Convert simple icon-box widget');
try {
  const element = {
    elType: 'widget',
    widgetType: 'wd_icon_box',
    settings: {
      icon: { value: 'fas fa-star', library: 'fa-solid' },
      title: 'Our Service',
      description: 'We provide excellent service to our customers.',
      layout: 'vertical'
    },
    renderedContent: '',
    isInner: false
  };
  
  const converter = converterRegistry.getConverter('wd_icon_box');
  if (converter && converter.canConvert(element, 'wd_icon_box')) {
    const context = createTestContext();
    const result = converter.convert(element, 'wd_icon_box', context);
    
    if (result) {
      console.log('✓ Conversion successful');
      console.log('  Widget type:', result.widgetType);
      console.log('  Has icon:', !!result.settings.selected_icon);
      console.log('  Has title:', !!result.settings.title_text);
      console.log('  Has description:', !!result.settings.description_text);
      console.log('  Position:', result.settings.position);
      console.log('  Conversion meta:', result._conversionMeta);
    } else {
      console.log('✗ Conversion returned null');
    }
  } else {
    console.log('✗ Converter cannot handle this widget');
  }
} catch (e) {
  console.log('✗ Test failed:', e.message);
  console.error(e.stack);
}

// Test 3: Convert feature-box with image instead of icon
console.log('\nTest 3: Convert feature-box with image');
try {
  const element = {
    elType: 'widget',
    widgetType: 'custom_feature_box',
    settings: {
      image: { url: 'https://example.com/feature.jpg', id: '123' },
      title: 'Amazing Feature',
      description: 'This feature will change your life.',
      layout: 'horizontal'
    },
    renderedContent: '',
    isInner: false
  };
  
  const converter = converterRegistry.getConverter('custom_feature_box');
  if (converter && converter.canConvert(element, 'custom_feature_box')) {
    const context = createTestContext();
    const result = converter.convert(element, 'custom_feature_box', context);
    
    if (result) {
      console.log('✓ Conversion successful');
      console.log('  Widget type:', result.widgetType);
      console.log('  Has image:', !!result.settings.image);
      console.log('  Has title:', !!result.settings.title_text);
      console.log('  Has description:', !!result.settings.description_text);
      console.log('  Position:', result.settings.position);
    } else {
      console.log('✗ Conversion returned null');
    }
  } else {
    console.log('✗ Converter cannot handle this widget');
  }
} catch (e) {
  console.log('✗ Test failed:', e.message);
  console.error(e.stack);
}

// Test 4: Convert complex widget to container (with button)
console.log('\nTest 4: Convert complex widget with button to container');
try {
  const element = {
    elType: 'widget',
    widgetType: 'wd_service_box',
    settings: {
      icon: { value: 'fas fa-cog', library: 'fa-solid' },
      title: 'Technical Support',
      description: 'Get help from our expert team.',
      button_text: 'Contact Us',
      link: { url: 'https://example.com/contact' },
      layout: 'vertical'
    },
    renderedContent: '',
    isInner: false
  };
  
  const converter = converterRegistry.getConverter('wd_service_box');
  if (converter && converter.canConvert(element, 'wd_service_box')) {
    const context = createTestContext();
    const result = converter.convert(element, 'wd_service_box', context);
    
    if (result) {
      console.log('✓ Conversion successful');
      console.log('  Element type:', result.elType);
      console.log('  Widget type:', result.widgetType);
      console.log('  Conversion type:', result._conversionMeta?.conversionType);
      
      // Check if it's icon-box or container
      if (result.widgetType === 'icon-box') {
        console.log('  Converted to icon-box');
        console.log('  Data loss:', result._conversionMeta?.dataLoss);
        console.log('  Warnings:', result._conversionMeta?.warnings);
      } else if (result.elType === 'section') {
        console.log('  Converted to container');
        console.log('  Child widgets:', result.elements[0]?.elements?.length || 0);
      }
    } else {
      console.log('✗ Conversion returned null');
    }
  } else {
    console.log('✗ Converter cannot handle this widget');
  }
} catch (e) {
  console.log('✗ Test failed:', e.message);
  console.error(e.stack);
}

// Test 5: Convert widget from HTML content
console.log('\nTest 5: Convert widget from HTML content');
try {
  const element = {
    elType: 'widget',
    widgetType: 'theme_info_box',
    settings: {},
    renderedContent: `
      <div class="info-box">
        <i class="fas fa-heart"></i>
        <h3>Customer Love</h3>
        <p>Our customers love what we do and keep coming back for more.</p>
      </div>
    `,
    isInner: false
  };
  
  const converter = converterRegistry.getConverter('theme_info_box');
  if (converter && converter.canConvert(element, 'theme_info_box')) {
    const context = createTestContext();
    const result = converter.convert(element, 'theme_info_box', context);
    
    if (result) {
      console.log('✓ Conversion successful');
      console.log('  Widget type:', result.widgetType);
      console.log('  Has icon:', !!result.settings.selected_icon);
      console.log('  Has title:', !!result.settings.title_text);
      console.log('  Has description:', !!result.settings.description_text);
    } else {
      console.log('✗ Conversion returned null');
    }
  } else {
    console.log('✗ Converter cannot handle this widget');
  }
} catch (e) {
  console.log('✗ Test failed:', e.message);
  console.error(e.stack);
}

// Test 6: Test pattern matching
console.log('\nTest 6: Test pattern matching for various widget types');
const testWidgetTypes = [
  'wd_icon_box',
  'custom_feature_box',
  'theme_info_box',
  'service_box',
  'icon-box-custom',
  'feature_card',
  'info-card',
  'image-box', // Should be excluded
  'price-box'  // Should be excluded
];

testWidgetTypes.forEach(widgetType => {
  const converter = converterRegistry.getConverter(widgetType);
  const hasConverter = !!converter;
  const canConvert = hasConverter && converter.canConvert({}, widgetType);
  const status = canConvert ? '✓ can convert' : (hasConverter ? '✗ found but cannot convert' : '✗ not found');
  console.log(`  ${widgetType}: ${status}`);
});

console.log('\n=== All Tests Complete ===');
