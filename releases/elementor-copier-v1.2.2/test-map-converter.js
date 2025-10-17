/**
 * Test script for MapConverter
 * Verifies map widget conversion for Google Maps with various location formats
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing MapConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Map with lat/lng coordinates from settings
console.log('Test 1: Map with lat/lng coordinates from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_google_map',
      settings: {
        lat: 40.7128,
        lng: -74.0060,
        zoom: 12
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.address.includes('40.7128') &&
      result.settings.address.includes('-74.0060')) {
    console.log('✓ Map with coordinates converted correctly\n');
  } else {
    console.log('✗ Map with coordinates conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Map with address from settings
console.log('Test 2: Map with address from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_map',
      settings: {
        address: 'New York, NY, USA',
        zoom: 10
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address === 'New York, NY, USA' &&
      result.settings.zoom?.size === 10) {
    console.log('✓ Map with address converted correctly\n');
  } else {
    console.log('✗ Map with address conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Map with location object from settings
console.log('Test 3: Map with location object from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'google_map_widget',
      settings: {
        location: {
          lat: 51.5074,
          lng: -0.1278,
          address: 'London, UK'
        },
        zoom_level: 14
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address === 'London, UK' &&
      result.settings.zoom?.size === 14) {
    console.log('✓ Map with location object converted correctly\n');
  } else {
    console.log('✗ Map with location object conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Map from Google Maps iframe HTML
console.log('Test 4: Map from Google Maps iframe HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'map_embed',
      settings: {},
      renderedContent: '<iframe src="https://maps.google.com/maps?q=Paris,+France&z=13" width="600" height="450"></iframe>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.address.includes('Paris')) {
    console.log('✓ Map iframe extraction worked\n');
  } else {
    console.log('✗ Map iframe extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Map with data attributes in HTML
console.log('Test 5: Map with data attributes in HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'location_map',
      settings: {},
      renderedContent: '<div class="map-container" data-lat="48.8566" data-lng="2.3522" data-zoom="15"></div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.address.includes('48.8566') &&
      result.settings.zoom?.size === 15) {
    console.log('✓ Data attributes extraction worked\n');
  } else {
    console.log('✗ Data attributes extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Map with latitude/longitude (alternative naming)
console.log('Test 6: Map with latitude/longitude (alternative naming)');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'fusion_map',
      settings: {
        latitude: '35.6762',
        longitude: '139.6503',
        map_zoom: 11
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.address.includes('35.6762') &&
      result.settings.zoom?.size === 11) {
    console.log('✓ Alternative coordinate naming handled correctly\n');
  } else {
    console.log('✗ Alternative coordinate naming failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Map with coordinates object
console.log('Test 7: Map with coordinates object');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_map',
      settings: {
        coordinates: {
          lat: -33.8688,
          lng: 151.2093
        },
        zoom: 13
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.address.includes('-33.8688')) {
    console.log('✓ Coordinates object handled correctly\n');
  } else {
    console.log('✗ Coordinates object handling failed\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: Map with string coordinates (should parse)
console.log('Test 8: Map with string coordinates');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_google_map',
      settings: {
        lat: '37.7749',
        lng: '-122.4194',
        zoom: '12'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Address:', result.settings.address);
  console.log('  Zoom:', result.settings.zoom?.size);
  
  if (result.widgetType === 'google_maps' && 
      result.settings.address &&
      result.settings.zoom?.size === 12) {
    console.log('✓ String coordinates parsed correctly\n');
  } else {
    console.log('✗ String coordinates parsing failed\n');
  }
} catch (e) {
  console.log('✗ Test 8 failed:', e.message, '\n');
}

// Test 9: Verify conversion metadata and data loss warnings
console.log('Test 9: Conversion metadata with advanced settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'advanced_map',
      settings: {
        address: 'San Francisco, CA',
        zoom: 10,
        map_type: 'satellite',
        street_view: true,
        marker_icon: 'custom.png',
        custom_style: { /* custom styles */ }
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
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Warnings:', result._conversionMeta.warnings);
    console.log('  - Has coordinates:', result._conversionMeta.hasCoordinates);
    console.log('  - Has address:', result._conversionMeta.hasAddress);
    
    if (result._conversionMeta.converter === 'MapConverter') {
      console.log('✓ Metadata is correct (MapConverter used)\n');
      if (result._conversionMeta.dataLoss && result._conversionMeta.warnings.length > 0) {
        console.log('✓ Data loss warnings present for advanced settings\n');
      } else {
        console.log('⚠ Data loss warnings not detected\n');
      }
    } else {
      console.log('✗ Metadata is incorrect\n');
    }
  } else {
    console.log('✗ Conversion metadata missing\n');
  }
} catch (e) {
  console.log('✗ Test 9 failed:', e.message, '\n');
}

// Test 10: Map with multiple markers (should warn about data loss)
console.log('Test 10: Map with multiple markers');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'multi_marker_map',
      settings: {
        address: 'New York, NY',
        zoom: 12,
        markers: [
          { lat: 40.7128, lng: -74.0060, title: 'Marker 1' },
          { lat: 40.7580, lng: -73.9855, title: 'Marker 2' },
          { lat: 40.6782, lng: -73.9442, title: 'Marker 3' }
        ]
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  
  if (result._conversionMeta && result._conversionMeta.dataLoss) {
    console.log('✓ Data loss detected for multiple markers');
    const multiMarkerWarning = result._conversionMeta.warnings.find(w => 
      w.includes('Multiple markers')
    );
    if (multiMarkerWarning) {
      console.log('✓ Multiple markers warning present:', multiMarkerWarning, '\n');
    } else {
      console.log('✗ Multiple markers warning missing\n');
    }
  } else {
    console.log('✗ Data loss not detected for multiple markers\n');
  }
} catch (e) {
  console.log('✗ Test 10 failed:', e.message, '\n');
}

// Test 11: Logger summary
console.log('Test 11: Logger summary and statistics');
const stats = conversionLogger.getStats();
console.log('  Statistics:');
console.log('    - Total:', stats.total);
console.log('    - Conversions:', stats.conversions);
console.log('    - Successful:', stats.successfulConversions);
console.log('    - With data loss:', stats.conversionsWithDataLoss);
console.log('    - Fallbacks:', stats.fallbacks);
console.log('    - Errors:', stats.errors);

if (stats.conversions > 0 && stats.errors === 0) {
  console.log('✓ All map conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== MapConverter Tests Complete ===');
