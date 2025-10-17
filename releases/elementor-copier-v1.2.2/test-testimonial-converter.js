/**
 * Test script for TestimonialConverter
 * Verifies testimonial widget conversion from various themes/plugins
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing TestimonialConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Testimonial from settings with all fields
console.log('Test 1: Testimonial from settings with all fields');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_testimonial',
      settings: {
        content: 'This product exceeded my expectations! Highly recommended.',
        author_name: 'John Doe',
        author_title: 'CEO, Tech Company',
        author_image: { url: 'https://example.com/john.jpg', id: '123' },
        rating: 5
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Content:', result.settings.testimonial_content?.substring(0, 50) + '...');
  console.log('  Author:', result.settings.testimonial_name);
  console.log('  Title:', result.settings.testimonial_job);
  console.log('  Has image:', !!result.settings.testimonial_image);
  console.log('  Rating:', result.settings.testimonial_rating);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_content &&
      result.settings.testimonial_name === 'John Doe' &&
      result.settings.testimonial_rating === '5') {
    console.log('✓ Testimonial converted correctly\n');
  } else {
    console.log('✗ Testimonial conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Testimonial from HTML with blockquote
console.log('Test 2: Testimonial from HTML with blockquote');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_testimonial',
      settings: {},
      renderedContent: `
        <div class="testimonial">
          <blockquote>
            <p>Amazing service and great support team!</p>
          </blockquote>
          <div class="author-info">
            <img src="https://example.com/jane.jpg" alt="Jane Smith">
            <cite class="author-name">Jane Smith</cite>
            <span class="author-title">Marketing Director</span>
          </div>
          <div class="rating">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
          </div>
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Content:', result.settings.testimonial_content);
  console.log('  Author:', result.settings.testimonial_name);
  console.log('  Title:', result.settings.testimonial_job);
  console.log('  Rating:', result.settings.testimonial_rating);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_content.includes('Amazing service') &&
      result.settings.testimonial_name === 'Jane Smith' &&
      result.settings.testimonial_rating === '5') {
    console.log('✓ HTML extraction worked correctly\n');
  } else {
    console.log('✗ HTML extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Testimonial with different property names
console.log('Test 3: Testimonial with different property names');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'review_widget',
      settings: {
        testimonial_content: 'Great product quality!',
        name: 'Bob Johnson',
        job_title: 'Product Manager',
        stars: 4.5
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Author:', result.settings.testimonial_name);
  console.log('  Title:', result.settings.testimonial_job);
  console.log('  Rating:', result.settings.testimonial_rating);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_name === 'Bob Johnson' &&
      result.settings.testimonial_job === 'Product Manager' &&
      result.settings.testimonial_rating === '4.5') {
    console.log('✓ Property name mapping worked\n');
  } else {
    console.log('✗ Property name mapping failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Testimonial without author (should still convert)
console.log('Test 4: Testimonial without author');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'quote_widget',
      settings: {
        quote: 'This is an anonymous testimonial without author info.'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Content:', result.settings.testimonial_content);
  console.log('  Author:', result.settings.testimonial_name || '(empty)');
  console.log('  Has data loss warning:', result._conversionMeta?.dataLoss);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_content &&
      result._conversionMeta?.dataLoss === true) {
    console.log('✓ Anonymous testimonial handled correctly\n');
  } else {
    console.log('✗ Anonymous testimonial handling failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Testimonial with rating out of 10 (should convert to out of 5)
console.log('Test 5: Testimonial with rating out of 10');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'testimonial_10_scale',
      settings: {
        content: 'Excellent service!',
        author: 'Alice Brown',
        rating: 8
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Original rating (out of 10):', 8);
  console.log('  Converted rating (out of 5):', result.settings.testimonial_rating);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_rating === '4') {
    console.log('✓ Rating conversion worked (8/10 → 4/5)\n');
  } else {
    console.log('✗ Rating conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Testimonial from HTML with paragraph structure
console.log('Test 6: Testimonial from HTML with paragraph structure');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'customer_review',
      settings: {},
      renderedContent: `
        <div class="review-box">
          <p class="testimonial-content">The team was professional and delivered on time.</p>
          <div class="reviewer">
            <span class="name">Michael Chen</span>
            <small>Freelance Designer</small>
          </div>
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Content:', result.settings.testimonial_content);
  console.log('  Author:', result.settings.testimonial_name);
  console.log('  Title:', result.settings.testimonial_job);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_content.includes('professional') &&
      result.settings.testimonial_name === 'Michael Chen' &&
      result.settings.testimonial_job === 'Freelance Designer') {
    console.log('✓ Paragraph structure extraction worked\n');
  } else {
    console.log('✗ Paragraph structure extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Testimonial with image URL as string
console.log('Test 7: Testimonial with image URL as string');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'testimonial_simple',
      settings: {
        content: 'Simple testimonial',
        author: 'Sarah Wilson',
        avatar: 'https://example.com/sarah.jpg'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Has image:', !!result.settings.testimonial_image);
  console.log('  Image URL:', result.settings.testimonial_image?.url);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_image?.url === 'https://example.com/sarah.jpg') {
    console.log('✓ String image URL converted correctly\n');
  } else {
    console.log('✗ String image URL conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: Verify conversion metadata
console.log('Test 8: Conversion metadata');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_testimonial',
      settings: {
        content: 'Test testimonial',
        author_name: 'Test Author',
        author_image: { url: 'https://example.com/test.jpg' },
        rating: 5
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
    console.log('  - Has author:', result._conversionMeta.hasAuthor);
    console.log('  - Has image:', result._conversionMeta.hasImage);
    console.log('  - Has rating:', result._conversionMeta.hasRating);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
    
    if (result._conversionMeta.converter === 'TestimonialConverter' &&
        result._conversionMeta.hasAuthor === true &&
        result._conversionMeta.hasImage === true &&
        result._conversionMeta.hasRating === true) {
      console.log('✓ Metadata is correct (TestimonialConverter used)\n');
    } else {
      console.log('✗ Metadata is incorrect\n');
    }
  } else {
    console.log('✗ Conversion metadata missing\n');
  }
} catch (e) {
  console.log('✗ Test 8 failed:', e.message, '\n');
}

// Test 9: Testimonial with company in title
console.log('Test 9: Testimonial with company in title');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'testimonial_with_company',
      settings: {
        content: 'Outstanding results!',
        author: 'David Lee',
        company: 'Acme Corporation'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Author:', result.settings.testimonial_name);
  console.log('  Title/Company:', result.settings.testimonial_job);
  
  if (result.widgetType === 'testimonial' && 
      result.settings.testimonial_job === 'Acme Corporation') {
    console.log('✓ Company field mapped to job title\n');
  } else {
    console.log('✗ Company field mapping failed\n');
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
  console.log('✓ All testimonial conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== TestimonialConverter Tests Complete ===');
