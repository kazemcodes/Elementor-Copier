/**
 * Verification Script for Content Sanitization
 * 
 * Quick verification that sanitization is working correctly.
 * Run this in browser console to verify functionality.
 */

(function() {
  'use strict';

  console.log('🛡️ Content Sanitization Verification Script');
  console.log('='.repeat(50));

  // Check if ContentSanitizer is available
  if (typeof ContentSanitizer === 'undefined') {
    console.error('❌ ContentSanitizer not found! Make sure content-sanitizer.js is loaded.');
    return;
  }

  const sanitizer = new ContentSanitizer();
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      const result = fn();
      if (result) {
        console.log(`✅ ${name}`);
        passed++;
      } else {
        console.error(`❌ ${name}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${name} - Error: ${error.message}`);
      failed++;
    }
  }

  // Test 1: Script tag removal
  test('Remove script tags', () => {
    const input = '<div>Hello<script>alert(1)</script>World</div>';
    const output = sanitizer.sanitizeHTML(input);
    return !output.includes('<script') && output.includes('Hello') && output.includes('World');
  });

  // Test 2: Event handler removal
  test('Remove event handlers', () => {
    const input = '<button onclick="bad()">Click</button>';
    const output = sanitizer.sanitizeHTML(input);
    return !output.includes('onclick');
  });

  // Test 3: JavaScript URL blocking
  test('Block javascript: URLs', () => {
    const input = 'javascript:alert(1)';
    const output = sanitizer.sanitizeURL(input);
    return output === '';
  });

  // Test 4: Safe URL preservation
  test('Preserve safe URLs', () => {
    const input = 'https://example.com/image.jpg';
    const output = sanitizer.sanitizeURL(input);
    return output === input;
  });

  // Test 5: CSS sanitization
  test('Remove dangerous CSS', () => {
    const input = 'color: red; background: url(javascript:alert(1))';
    const output = sanitizer.sanitizeCSS(input);
    return !output.includes('javascript:') && output.includes('color: red');
  });

  // Test 6: Settings validation
  test('Validate settings', () => {
    const input = {
      title: '<script>bad</script>Hello',
      url: 'javascript:void(0)',
      color: '#ff0000'
    };
    const output = sanitizer.validateSettings(input, 'heading');
    return !JSON.stringify(output).includes('<script') && 
           !JSON.stringify(output).includes('javascript:') &&
           output.color === '#ff0000';
  });

  // Test 7: Element sanitization
  test('Sanitize complete element', () => {
    const input = {
      elType: 'widget',
      widgetType: 'text-editor',
      id: 'test123',
      settings: {
        content: '<p>Safe</p><script>bad()</script>'
      },
      elements: [],
      isInner: false
    };
    const output = sanitizer.sanitizeElementData(input);
    return output !== null && 
           !JSON.stringify(output).includes('<script') &&
           output.elType === 'widget';
  });

  // Test 8: Nested element sanitization
  test('Sanitize nested elements', () => {
    const input = {
      elType: 'section',
      id: 'sec1',
      settings: {},
      elements: [
        {
          elType: 'column',
          id: 'col1',
          settings: {},
          elements: [
            {
              elType: 'widget',
              widgetType: 'text',
              id: 'wid1',
              settings: {
                content: '<iframe src="evil.com"></iframe>Good'
              },
              elements: [],
              isInner: false
            }
          ],
          isInner: false
        }
      ],
      isInner: false
    };
    const output = sanitizer.sanitizeElementData(input);
    return output !== null && !JSON.stringify(output).includes('<iframe');
  });

  // Test 9: Null handling
  test('Handle null input gracefully', () => {
    const output1 = sanitizer.sanitizeHTML(null);
    const output2 = sanitizer.sanitizeURL(null);
    return output1 === '' && output2 === '';
  });

  // Test 10: Integration with format converter
  test('Format converter integration', () => {
    if (typeof ElementorFormatConverter === 'undefined') {
      console.warn('⚠️ ElementorFormatConverter not loaded, skipping integration test');
      return true;
    }

    const input = {
      data: {
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: '<script>xss</script>Hello'
        },
        elements: []
      },
      metadata: {
        elementorVersion: '3.5.0'
      }
    };

    try {
      const output = ElementorFormatConverter.convertToNativeFormat(input, {
        sanitize: true
      });
      return !JSON.stringify(output).includes('<script');
    } catch (error) {
      console.warn('⚠️ Format converter test failed:', error.message);
      return false;
    }
  });

  // Summary
  console.log('='.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All verification tests passed!');
    console.log('🎉 Content sanitization is working correctly.');
  } else {
    console.error('❌ Some tests failed. Please review the implementation.');
  }

  console.log('='.repeat(50));

  return {
    passed,
    failed,
    total: passed + failed,
    success: failed === 0
  };
})();
