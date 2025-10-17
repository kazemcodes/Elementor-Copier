/**
 * Test script for GalleryConverter
 * Verifies gallery widget conversion functionality
 */

const {
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing GalleryConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Convert gallery with images array in settings
console.log('Test 1: Gallery with images array in settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'wd_gallery',
      settings: {
        images: [
          { id: '1', url: 'https://example.com/image1.jpg', alt: 'Image 1', caption: 'Caption 1' },
          { id: '2', url: 'https://example.com/image2.jpg', alt: 'Image 2', caption: 'Caption 2' },
          { id: '3', url: 'https://example.com/image3.jpg', alt: 'Image 3', caption: 'Caption 3' },
          { id: '4', url: 'https://example.com/image4.jpg', alt: 'Image 4', caption: 'Caption 4' }
        ],
        columns: 3,
        lightbox: true
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Image count:', result.settings.gallery?.length || 0);
  console.log('  Columns:', result.settings.gallery_columns);
  console.log('  Lightbox:', result.settings.open_lightbox);
  
  // Check conversion metadata
  if (result._conversionMeta) {
    console.log('✓ Conversion metadata present:');
    console.log('  - Converter:', result._conversionMeta.converter);
    console.log('  - Image count:', result._conversionMeta.imageCount);
    console.log('  - Target widget:', result._conversionMeta.targetWidgetType);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
  }
  
  if (result.widgetType === 'image-gallery' && result.settings.gallery?.length === 4) {
    console.log('✓ GalleryConverter converted to image-gallery successfully\n');
  } else {
    console.log('✗ GalleryConverter failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 2: Convert gallery with fewer than 3 images (should use carousel)
console.log('Test 2: Gallery with 2 images (should convert to carousel)');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'custom_gallery',
      settings: {
        images: [
          { id: '1', url: 'https://example.com/image1.jpg' },
          { id: '2', url: 'https://example.com/image2.jpg' }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Image count:', result.settings.carousel?.length || 0);
  
  if (result.widgetType === 'image-carousel' && result.settings.carousel?.length === 2) {
    console.log('✓ GalleryConverter correctly chose image-carousel for < 3 images\n');
  } else {
    console.log('✗ GalleryConverter should have used image-carousel\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 3: Extract images from HTML when settings don't have images
console.log('Test 3: Gallery with images in HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'photo-gallery',
      settings: {},
      renderedContent: `
        <div class="gallery">
          <img src="https://example.com/img1.jpg" alt="Photo 1" data-id="101" />
          <img src="https://example.com/img2.jpg" alt="Photo 2" data-id="102" />
          <img src="https://example.com/img3.jpg" alt="Photo 3" data-id="103" />
          <img src="https://example.com/img4.jpg" alt="Photo 4" data-id="104" />
          <img src="https://example.com/img5.jpg" alt="Photo 5" data-id="105" />
        </div>
      `,
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Images extracted from HTML:', result.settings.gallery?.length || 0);
  
  if (result.widgetType === 'image-gallery' && result.settings.gallery?.length === 5) {
    console.log('✓ GalleryConverter successfully extracted images from HTML\n');
  } else {
    console.log('✗ GalleryConverter failed to extract images from HTML\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 4: Gallery with gallery_items format
console.log('Test 4: Gallery with gallery_items format');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'image-grid',
      settings: {
        gallery_items: [
          { image: { id: '1', url: 'https://example.com/a.jpg' }, caption: 'Item A' },
          { image: { id: '2', url: 'https://example.com/b.jpg' }, caption: 'Item B' },
          { image: { id: '3', url: 'https://example.com/c.jpg' }, caption: 'Item C' }
        ],
        columns: 3
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Image count:', result.settings.gallery?.length || 0);
  
  if (result.widgetType === 'image-gallery' && result.settings.gallery?.length === 3) {
    console.log('✓ GalleryConverter handled gallery_items format\n');
  } else {
    console.log('✗ GalleryConverter failed with gallery_items format\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 5: Gallery with attachments format (WordPress media library)
console.log('Test 5: Gallery with attachments format');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'portfolio-grid',
      settings: {
        attachments: [
          { id: '10', url: 'https://example.com/portfolio1.jpg', alt: 'Portfolio 1', caption: 'Project A' },
          { id: '11', url: 'https://example.com/portfolio2.jpg', alt: 'Portfolio 2', caption: 'Project B' },
          { id: '12', url: 'https://example.com/portfolio3.jpg', alt: 'Portfolio 3', caption: 'Project C' },
          { id: '13', url: 'https://example.com/portfolio4.jpg', alt: 'Portfolio 4', caption: 'Project D' }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Image count:', result.settings.gallery?.length || 0);
  
  if (result.widgetType === 'image-gallery' && result.settings.gallery?.length === 4) {
    console.log('✓ GalleryConverter handled attachments format\n');
  } else {
    console.log('✗ GalleryConverter failed with attachments format\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 6: Gallery with no images (should fail gracefully)
console.log('Test 6: Gallery with no images (should fail gracefully)');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: {
      elementorVersion: '3.0.0'
    },
    data: {
      elType: 'widget',
      widgetType: 'empty_gallery',
      settings: {},
      renderedContent: '<div class="gallery"></div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion handled gracefully');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  
  // Should fall back to HTML widget
  if (result.widgetType === 'html') {
    console.log('✓ GalleryConverter correctly fell back to HTML widget\n');
  } else {
    console.log('✗ Expected HTML fallback\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
  console.error(e.stack);
}

// Test 7: Verify logger captured all conversions
console.log('Test 7: Logger summary and statistics');
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
  console.log('  Conversion details:');
  conversionLogger.conversions.forEach((conv, idx) => {
    console.log(`    ${idx + 1}. ${conv.originalType} → ${conv.convertedType} (${conv.converterName})`);
  });
}

console.log('\n=== GalleryConverter Tests Complete ===');
