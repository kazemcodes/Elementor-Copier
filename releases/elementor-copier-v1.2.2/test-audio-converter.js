/**
 * Test script for AudioConverter
 * Verifies audio widget conversion for self-hosted audio files and streaming embeds
 */

const {
  BaseConverter,
  converterRegistry,
  conversionLogger,
  convertToNativeFormat
} = require('./elementor-format-converter.js');

console.log('=== Testing AudioConverter ===\n');

// Reset logger for clean test
conversionLogger.reset();

// Test 1: Audio from settings with audio_url
console.log('Test 1: Audio from settings with audio_url');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'wd_audio_player',
      settings: {
        audio_url: 'https://example.com/audio/sample.mp3',
        title: 'Sample Audio Track'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Original type:', testData.data.widgetType);
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  console.log('  Title:', result.settings.title);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url === 'https://example.com/audio/sample.mp3' &&
      result.settings.title === 'Sample Audio Track') {
    console.log('✓ Audio converted correctly with title\n');
  } else {
    console.log('✗ Audio conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 1 failed:', e.message, '\n');
}

// Test 2: Audio from audio tag HTML
console.log('Test 2: Audio from audio tag HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_audio',
      settings: {},
      renderedContent: '<audio controls src="https://example.com/music/track.mp3"></audio>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url === 'https://example.com/music/track.mp3') {
    console.log('✓ Audio tag extraction worked\n');
  } else {
    console.log('✗ Audio tag extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 2 failed:', e.message, '\n');
}

// Test 3: Audio from source tag inside audio element
console.log('Test 3: Audio from source tag inside audio element');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'audio_widget',
      settings: {},
      renderedContent: '<audio controls><source src="https://example.com/podcast/episode.ogg" type="audio/ogg"></audio>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url.includes('episode.ogg')) {
    console.log('✓ Source tag extraction worked\n');
  } else {
    console.log('✗ Source tag extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 3 failed:', e.message, '\n');
}

// Test 4: Audio with file object format
console.log('Test 4: Audio with file object format');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'music_player',
      settings: {
        file: {
          url: 'https://example.com/music/song.wav',
          id: 123
        },
        title: 'My Song'
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  console.log('  Title:', result.settings.title);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url === 'https://example.com/music/song.wav' &&
      result.settings.title === 'My Song') {
    console.log('✓ File object format converted correctly\n');
  } else {
    console.log('✗ File object format conversion failed\n');
  }
} catch (e) {
  console.log('✗ Test 4 failed:', e.message, '\n');
}

// Test 5: Audio with autoplay and loop options
console.log('Test 5: Audio with autoplay and loop options');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'podcast_player',
      settings: {
        audio_url: 'https://example.com/podcast.mp3',
        autoplay: true,
        loop: true,
        controls: true
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Autoplay:', result.settings.autoplay);
  console.log('  Loop:', result.settings.loop);
  console.log('  Controls:', result.settings.controls);
  
  if (result.settings.autoplay === 'yes' &&
      result.settings.loop === 'yes') {
    console.log('✓ Audio options preserved correctly\n');
  } else {
    console.log('✗ Audio options not preserved\n');
  }
} catch (e) {
  console.log('✗ Test 5 failed:', e.message, '\n');
}

// Test 6: Audio from SoundCloud iframe embed
console.log('Test 6: Audio from SoundCloud iframe embed');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'sound_embed',
      settings: {},
      renderedContent: '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789" frameborder="0"></iframe>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url &&
      result.settings.audio.url.includes('soundcloud')) {
    console.log('✓ SoundCloud iframe extraction worked\n');
  } else {
    console.log('✗ SoundCloud iframe extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 6 failed:', e.message, '\n');
}

// Test 7: Audio with data-url attribute
console.log('Test 7: Audio with data-url attribute');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'custom_audio_widget',
      settings: {},
      renderedContent: '<div class="audio-player" data-audio-url="https://example.com/audio/track.mp3"></div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url === 'https://example.com/audio/track.mp3') {
    console.log('✓ Data attribute extraction worked\n');
  } else {
    console.log('✗ Data attribute extraction failed\n');
  }
} catch (e) {
  console.log('✗ Test 7 failed:', e.message, '\n');
}

// Test 8: Audio with title extraction from HTML
console.log('Test 8: Audio with title extraction from HTML');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'audio_player',
      settings: {},
      renderedContent: '<div><h3 class="audio-title">Episode 42: The Answer</h3><audio src="https://example.com/episode42.mp3"></audio></div>',
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Converted type:', result.widgetType);
  console.log('  Audio URL:', result.settings.audio?.url);
  console.log('  Title:', result.settings.title);
  
  if (result.widgetType === 'audio' && 
      result.settings.audio?.url.includes('episode42.mp3') &&
      result.settings.title === 'Episode 42: The Answer') {
    console.log('✓ Title extraction from HTML worked\n');
  } else {
    console.log('✗ Title extraction from HTML failed\n');
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
      widgetType: 'wd_audio',
      settings: {
        audio_url: 'https://example.com/metadata_test.mp3'
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
    console.log('  - Timestamp:', result._conversionMeta.timestamp);
    
    if (result._conversionMeta.converter === 'AudioConverter') {
      console.log('✓ Metadata is correct (AudioConverter used)\n');
    } else {
      console.log('✗ Metadata is incorrect\n');
    }
  } else {
    console.log('✗ Conversion metadata missing\n');
  }
} catch (e) {
  console.log('✗ Test 9 failed:', e.message, '\n');
}

// Test 10: Audio with controls disabled
console.log('Test 10: Audio with controls disabled');
try {
  const testData = {
    type: 'elementor-copier',
    metadata: { elementorVersion: '3.0.0' },
    data: {
      elType: 'widget',
      widgetType: 'background_audio',
      settings: {
        url: 'https://example.com/background.mp3',
        controls: false,
        autoplay: true
      },
      elements: [],
      isInner: false
    }
  };
  
  const result = convertToNativeFormat(testData);
  
  console.log('✓ Conversion successful');
  console.log('  Controls:', result.settings.controls);
  console.log('  Autoplay:', result.settings.autoplay);
  
  if (result.settings.controls === 'no' &&
      result.settings.autoplay === 'yes') {
    console.log('✓ Controls disabled correctly\n');
  } else {
    console.log('✗ Controls setting not preserved\n');
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
console.log('    - Fallbacks:', stats.fallbacks);
console.log('    - Errors:', stats.errors);

if (stats.conversions > 0 && stats.errors === 0) {
  console.log('✓ All audio conversions successful\n');
} else {
  console.log('✗ Some conversions failed\n');
}

console.log('=== AudioConverter Tests Complete ===');
