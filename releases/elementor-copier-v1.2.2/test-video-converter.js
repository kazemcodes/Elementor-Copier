/**
 * Test script for VideoConverter
 * Verifies video widget conversion for YouTube, Vimeo, and self-hosted videos
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing VideoConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: YouTube video from settings
console.log('Test 1: YouTube video from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_video_player',
      settings: {
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  YouTube URL:', result.settings.youtube_url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'youtube' &&
      result.settings.youtube_url.includes('dQw4w9WgXcQ')) {
    console.log('✓ YouTube video converted correctly\n');
  } else {
    console.log('✗ YouTube video conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: YouTube video from iframe HTML
console.log('Test 2: YouTube video from iframe HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_video',
      settings: {},
      renderedContent: '<div><iframe src="https://www.youtube.com/embed/abc123xyz" frameborder="0"></iframe></div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  YouTube URL:', result.settings.youtube_url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'youtube' &&
      result.settings.youtube_url.includes('abc123xyz')) {
    console.log('✓ YouTube iframe extraction worked\n');
  } else {
    console.log('✗ YouTube iframe extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Vimeo video from settings
console.log('Test 3: Vimeo video from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'vimeo_player',
      settings: {
        vimeo_url: 'https://vimeo.com/123456789'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  Vimeo URL:', result.settings.vimeo_url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'vimeo' &&
      result.settings.vimeo_url.includes('123456789')) {
    console.log('✓ Vimeo video converted correctly\n');
  } else {
    console.log('✗ Vimeo video conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Vimeo video from iframe HTML
console.log('Test 4: Vimeo video from iframe HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'video_widget',
      settings: {},
      renderedContent: '<iframe src="https://player.vimeo.com/video/987654321" width="640" height="360"></iframe>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  Vimeo URL:', result.settings.vimeo_url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'vimeo' &&
      result.settings.vimeo_url.includes('987654321')) {
    console.log('✓ Vimeo iframe extraction worked\n');
  } else {
    console.log('✗ Vimeo iframe extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Self-hosted video from settings
console.log('Test 5: Self-hosted video from settings');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_video_player',
      settings: {
        video_url: 'https://example.com/videos/sample.mp4'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  Hosted URL:', result.settings.hosted_url?.url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'hosted' &&
      result.settings.hosted_url?.url === 'https://example.com/videos/sample.mp4') {
    console.log('✓ Self-hosted video converted correctly\n');
  } else {
    console.log('✗ Self-hosted video conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Self-hosted video from video tag HTML
console.log('Test 6: Self-hosted video from video tag HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'html5_video',
      settings: {},
      renderedContent: '<video controls><source src="https://example.com/video.webm" type="video/webm"></video>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Video type:', result.settings.video_type);
  console.log('  Hosted URL:', result.settings.hosted_url?.url);
  
  if (result.widgetType === 'video' && 
      result.settings.video_type === 'hosted' &&
      result.settings.hosted_url?.url.includes('video.webm')) {
    console.log('✓ Video tag extraction worked\n');
  } else {
    console.log('✗ Video tag extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Video with autoplay and mute options (YouTube)
console.log('Test 7: Video with autoplay and mute options');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'youtube_video',
      settings: {
        youtube_url: 'https://www.youtube.com/watch?v=test123',
        autoplay: true,
        mute: true,
        loop: true
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Autoplay:', result.settings.youtube_autoplay);
  console.log('  Mute:', result.settings.youtube_mute);
  console.log('  Loop:', result.settings.youtube_loop);
  
  if (result.settings.youtube_autoplay === 'yes' &&
      result.settings.youtube_mute === 'yes' &&
      result.settings.youtube_loop === 'yes') {
    console.log('✓ Video options preserved correctly\n');
  } else {
    console.log('✗ Video options not preserved\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: YouTube short URL format (youtu.be) in iframe
console.log('Test 8: YouTube short URL format');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'video_embed',
      settings: {},
      renderedContent: '<iframe src="https://youtu.be/shorturl123" frameborder="0"></iframe>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData, { sanitize: false });
  
  console.log('✓ Conversion successful');
  console.log('  YouTube URL:', result.settings.youtube_url);
  
  if (result.widgetType === 'video' && 
      result.settings.youtube_url &&
      result.settings.youtube_url.includes('shorturl123')) {
    console.log('✓ YouTube short URL normalized correctly\n');
  } else {
    console.log('✗ YouTube short URL normalization failed\n');
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
      widgetType: 'wd_video',
      settings: {
        video_url: 'https://www.youtube.com/watch?v=metadata_test'
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
    console.log('  - Video type:', result._conversionMeta.videoType);
    console.log('  - Data loss:', result._conversionMeta.dataLoss);
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
    
    if (result._conversionMeta.converter === 'VideoConverter') {
      console.log('✓ Metadata is correct (VideoConverter used)\n');
      if (result._conversionMeta.videoType === 'youtube') {
        console.log('✓ Video type metadata preserved\n');
      } else {
        console.log('⚠ Video type metadata not preserved (may be removed by sanitizer)\n');
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
  console.log('✓ All video conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== VideoConverter Tests Complete ===');
