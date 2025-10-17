/**
 * Test file for SocialIconsConverter
 * Tests the conversion of social icon widgets to Elementor format
 */

// Load the format converter module
if (typeof require !== 'undefined') {
  var { BaseConverter, ConverterRegistry, converterRegistry } = require('./elementor-format-converter.js');
}

console.log('=== SocialIconsConverter Tests ===\n');

// Test 1: Convert social icons from settings with icons array
console.log('Test 1: Social icons from settings (icons array)');
const test1Element = {
  id: 'test001',
  elType: 'widget',
  widgetType: 'wd_social_icons',
  settings: {
    icons: [
      { platform: 'facebook', url: 'https://facebook.com/example' },
      { platform: 'twitter', url: 'https://twitter.com/example' },
      { platform: 'instagram', url: 'https://instagram.com/example' }
    ],
    shape: 'circle',
    color_scheme: 'official'
  },
  elements: [],
  isInner: false
};

const converter1 = converterRegistry.getConverter('wd_social_icons');
if (converter1) {
  const context = {
    generateElementId: () => 'abc12345',
    extractImageUrl: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2' }),
    extractTextContent: () => null,
    extractButtonData: () => ({ text: '', link: null }),
    extractIconData: () => ({ icon: null })
  };
  
  const result1 = converter1.convert(test1Element, 'wd_social_icons', context);
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('✓ Test 1 passed\n');
} else {
  console.log('✗ Test 1 failed: Converter not found\n');
}

// Test 2: Convert social icons from HTML
console.log('Test 2: Social icons from HTML');
const test2Element = {
  id: 'test002',
  elType: 'widget',
  widgetType: 'custom_social_links',
  settings: {},
  renderedContent: `
    <div class="social-icons">
      <a href="https://facebook.com/mypage" class="social-icon"><i class="fab fa-facebook"></i></a>
      <a href="https://twitter.com/myhandle" class="social-icon"><i class="fab fa-twitter"></i></a>
      <a href="https://linkedin.com/in/myprofile" class="social-icon"><i class="fab fa-linkedin"></i></a>
      <a href="https://youtube.com/c/mychannel" class="social-icon"><i class="fab fa-youtube"></i></a>
    </div>
  `,
  elements: [],
  isInner: false
};

const converter2 = converterRegistry.getConverter('custom_social_links');
if (converter2) {
  const context = {
    generateElementId: () => 'def67890',
    extractImageUrl: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2' }),
    extractTextContent: () => null,
    extractButtonData: () => ({ text: '', link: null }),
    extractIconData: () => ({ icon: null })
  };
  
  const result2 = converter2.convert(test2Element, 'custom_social_links', context);
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('✓ Test 2 passed\n');
} else {
  console.log('✗ Test 2 failed: Converter not found\n');
}

// Test 3: Convert social icons with individual URL properties
console.log('Test 3: Social icons from individual URL properties');
const test3Element = {
  id: 'test003',
  elType: 'widget',
  widgetType: 'social_media_widget',
  settings: {
    facebook_url: 'https://facebook.com/brand',
    twitter_url: 'https://twitter.com/brand',
    instagram_url: 'https://instagram.com/brand',
    linkedin_url: 'https://linkedin.com/company/brand',
    youtube_url: 'https://youtube.com/c/brand'
  },
  elements: [],
  isInner: false
};

const converter3 = converterRegistry.getConverter('social_media_widget');
if (converter3) {
  const context = {
    generateElementId: () => 'ghi13579',
    extractImageUrl: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2' }),
    extractTextContent: () => null,
    extractButtonData: () => ({ text: '', link: null }),
    extractIconData: () => ({ icon: null })
  };
  
  const result3 = converter3.convert(test3Element, 'social_media_widget', context);
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('✓ Test 3 passed\n');
} else {
  console.log('✗ Test 3 failed: Converter not found\n');
}

// Test 4: Platform name mapping
console.log('Test 4: Platform name mapping');
const test4Element = {
  id: 'test004',
  elType: 'widget',
  widgetType: 'social_icons',
  settings: {
    icons: [
      { platform: 'fb', url: 'https://facebook.com/test' },
      { platform: 'twitter-square', url: 'https://twitter.com/test' },
      { platform: 'ig', url: 'https://instagram.com/test' },
      { platform: 'linkedin-in', url: 'https://linkedin.com/in/test' }
    ]
  },
  elements: [],
  isInner: false
};

const converter4 = converterRegistry.getConverter('social_icons');
if (converter4) {
  const context = {
    generateElementId: () => 'jkl24680',
    extractImageUrl: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2' }),
    extractTextContent: () => null,
    extractButtonData: () => ({ text: '', link: null }),
    extractIconData: () => ({ icon: null })
  };
  
  const result4 = converter4.convert(test4Element, 'social_icons', context);
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.log('✓ Test 4 passed\n');
} else {
  console.log('✗ Test 4 failed: Converter not found\n');
}

// Test 5: URL-based platform detection
console.log('Test 5: URL-based platform detection');
const test5Element = {
  id: 'test005',
  elType: 'widget',
  widgetType: 'share_buttons',
  settings: {
    social_links: [
      { url: 'https://facebook.com/page' },
      { url: 'https://x.com/handle' },
      { url: 'https://wa.me/1234567890' },
      { url: 'https://t.me/channel' }
    ]
  },
  elements: [],
  isInner: false
};

const converter5 = converterRegistry.getConverter('share_buttons');
if (converter5) {
  const context = {
    generateElementId: () => 'mno97531',
    extractImageUrl: () => null,
    extractHeadingData: () => ({ title: '', tag: 'h2' }),
    extractTextContent: () => null,
    extractButtonData: () => ({ text: '', link: null }),
    extractIconData: () => ({ icon: null })
  };
  
  const result5 = converter5.convert(test5Element, 'share_buttons', context);
  console.log('Result:', JSON.stringify(result5, null, 2));
  console.log('✓ Test 5 passed\n');
} else {
  console.log('✗ Test 5 failed: Converter not found\n');
}

console.log('=== All Tests Complete ===');
