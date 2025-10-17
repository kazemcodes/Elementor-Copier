/**
 * Test script for PricingTableConverter
 * Verifies pricing table widget conversion from various themes/plugins
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing PricingTableConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Pricing table from settings with all fields
console.log('Test 1: Pricing table from settings with all fields');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_pricing_table',
      settings: {
        title: 'Professional Plan',
        price: '49',
        currency: '$',
        period: 'month',
        features: [
          'Unlimited Projects',
          '50GB Storage',
          'Priority Support',
          'Advanced Analytics',
          'Custom Domain'
        ],
        button_text: 'Get Started',
        button_link: { url: 'https://example.com/signup' },
        featured: true
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Title:', result.settings.heading);
  console.log('  Price:', result.settings.price);
  console.log('  Currency:', result.settings.currency_symbol);
  console.log('  Period:', result.settings.period);
  console.log('  Features count:', result.settings.features_list?.length || 0);
  console.log('  Button text:', result.settings.button_text);
  console.log('  Has ribbon:', result.settings.show_ribbon);
  
  if (result.widgetType === 'price-table' && 
      result.settings.heading === 'Professional Plan' &&
      result.settings.price === '49' &&
      result.settings.features_list?.length === 5) {
    console.log('✓ Pricing table converted correctly\n');
  } else {
    console.log('✗ Pricing table conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Pricing table from HTML
console.log('Test 2: Pricing table from HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_pricing',
      settings: {},
      renderedContent: `
        <div class="pricing-table">
          <h3 class="plan-title">Starter Plan</h3>
          <div class="price-wrapper">
            <span class="currency">$</span>
            <span class="amount">19</span>
            <span class="period">/month</span>
          </div>
          <ul class="features-list">
            <li>5 Projects</li>
            <li>10GB Storage</li>
            <li>Email Support</li>
            <li>Basic Analytics</li>
          </ul>
          <a href="https://example.com/buy" class="pricing-button">Buy Now</a>
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Title:', result.settings.heading);
  console.log('  Price:', result.settings.price);
  console.log('  Currency:', result.settings.currency_symbol);
  console.log('  Period:', result.settings.period);
  console.log('  Features count:', result.settings.features_list?.length || 0);
  console.log('  Button text:', result.settings.button_text);
  
  if (result.widgetType === 'price-table' && 
      result.settings.heading === 'Starter Plan' &&
      result.settings.price === '19' &&
      result.settings.features_list?.length === 4) {
    console.log('✓ HTML extraction worked correctly\n');
  } else {
    console.log('✗ HTML extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Pricing table with feature_list format
console.log('Test 3: Pricing table with feature_list format');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'price_box',
      settings: {
        plan_name: 'Enterprise',
        amount: '99',
        currency_symbol: '€',
        billing_cycle: 'year',
        feature_list: [
          { text: 'Unlimited Everything' },
          { text: 'Dedicated Support' },
          { text: 'Custom Integration' }
        ],
        cta_text: 'Contact Sales',
        cta_link: 'https://example.com/contact'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Title:', result.settings.heading);
  console.log('  Price:', result.settings.price);
  console.log('  Currency:', result.settings.currency_symbol);
  console.log('  Period:', result.settings.period);
  console.log('  Features:', result.settings.features_list?.map(f => f.item_text).join(', '));
  
  if (result.widgetType === 'price-table' && 
      result.settings.heading === 'Enterprise' &&
      result.settings.currency_symbol === '€' &&
      result.settings.features_list?.length === 3) {
    console.log('✓ Alternative format converted correctly\n');
  } else {
    console.log('✗ Alternative format conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Pricing table with individual feature properties
console.log('Test 4: Pricing table with individual feature properties');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'pricing_box',
      settings: {
        title: 'Basic',
        price: '9',
        currency: '$',
        period: 'mo',
        feature_1: 'Feature One',
        feature_2: 'Feature Two',
        feature_3: 'Feature Three',
        btn_text: 'Subscribe',
        link: 'https://example.com/subscribe'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Features count:', result.settings.features_list?.length || 0);
  console.log('  Features:', result.settings.features_list?.map(f => f.item_text).join(', '));
  
  if (result.widgetType === 'price-table' && 
      result.settings.features_list?.length === 3 &&
      result.settings.features_list[0].item_text === 'Feature One') {
    console.log('✓ Individual feature properties extracted correctly\n');
  } else {
    console.log('✗ Individual feature properties extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Pricing table with minimal data
console.log('Test 5: Pricing table with minimal data (price only)');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'simple_pricing',
      settings: {
        price: '29'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Price:', result.settings.price);
  console.log('  Default title:', result.settings.heading);
  console.log('  Default button:', result.settings.button_text);
  
  if (result.widgetType === 'price-table' && 
      result.settings.price === '29') {
    console.log('✓ Minimal pricing table converted with defaults\n');
  } else {
    console.log('✗ Minimal pricing table conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Pricing table with featured flag
console.log('Test 6: Pricing table with featured/popular flag');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'pricing_plan',
      settings: {
        title: 'Most Popular',
        price: '39',
        popular: true,
        features: ['Feature A', 'Feature B']
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Show ribbon:', result.settings.show_ribbon);
  console.log('  Ribbon title:', result.settings.ribbon_title);
  
  if (result.widgetType === 'price-table' && 
      result.settings.show_ribbon === 'yes' &&
      result.settings.ribbon_title === 'Popular') {
    console.log('✓ Featured flag converted to ribbon correctly\n');
  } else {
    console.log('✗ Featured flag conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Verify conversion metadata
console.log('Test 7: Conversion metadata');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_price_table',
      settings: {
        price: '49',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
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
    console.log('  - Feature count:', result._conversionMeta.featureCount);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
    
    if (result._conversionMeta.converter === 'PricingTableConverter' &&
        result._conversionMeta.featureCount === 3) {
      console.log('✓ Metadata is correct\n');
    } else {
      console.log('✗ Metadata is incorrect\n');
    }
  } else {
    console.log('✗ Conversion metadata missing\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: Different currency symbols
console.log('Test 8: Different currency symbols');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'pricing_widget',
      settings: {},
      renderedContent: `
        <div class="pricing">
          <div class="price">£99</div>
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Currency:', result.settings.currency_symbol);
  console.log('  Price:', result.settings.price);
  
  if (result.widgetType === 'price-table' && 
      result.settings.currency_symbol === '£' &&
      result.settings.price === '99') {
    console.log('✓ Currency symbol extracted correctly\n');
  } else {
    console.log('✗ Currency symbol extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 8 failed:', e.message, '\n');
}

// Test 9: Logger summary
console.log('Test 9: Logger summary and statistics');
const stats = conversionLogger.getStats();
console.log('  Statistics:');
console.log('    - Total:', stats.total);
console.log('    - Conversions:', stats.conversions);
console.log('    - Successful:', stats.successfulConversions);
console.log('    - Fallbacks:', stats.fallbacks);
console.log('    - Errors:', stats.errors);

if (stats.conversions > 0 && stats.errors === 0) {
  console.log('✓ All pricing table conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== PricingTableConverter Tests Complete ===');
