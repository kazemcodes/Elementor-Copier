# Content Sanitizer Guide

## Overview

The Content Sanitizer module provides comprehensive security sanitization for external Elementor content before it's pasted into the editor. It protects against XSS attacks, malicious scripts, dangerous URLs, and other security threats.

## Features

### 1. HTML Sanitization
- Removes dangerous HTML tags: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<link>`, `<style>`, `<base>`
- Strips event handler attributes (onclick, onload, onerror, etc.)
- Sanitizes inline styles to remove dangerous CSS
- Validates and sanitizes URLs in href and src attributes
- Preserves safe HTML structure and content

### 2. URL Validation
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`, `file:`
- Detects and blocks encoded dangerous protocols
- Validates URL format and structure
- Allows safe protocols: `http:`, `https:`, relative URLs, anchors
- Preserves legitimate URLs while blocking malicious ones

### 3. CSS Sanitization
- Removes `javascript:` URLs in CSS
- Blocks `expression()` functions
- Removes `@import` statements
- Blocks `behavior:` and `-moz-binding:` properties
- Preserves safe CSS properties and values

### 4. Settings Validation
- Validates data types for known Elementor settings
- Recursively sanitizes nested objects and arrays
- Type coercion for mismatched types
- Special handling for URL, image, and CSS settings
- Preserves Elementor's data structure integrity

### 5. Complete Element Sanitization
- Sanitizes entire Elementor element trees
- Recursively processes nested elements
- Maintains element hierarchy and structure
- Validates required Elementor properties
- Handles sections, columns, and widgets

## Usage

### Basic Usage

```javascript
// Create sanitizer instance
const sanitizer = new ContentSanitizer();

// Sanitize HTML content
const cleanHTML = sanitizer.sanitizeHTML('<div>Safe<script>bad()</script></div>');
// Result: '<div>Safe</div>'

// Sanitize URLs
const cleanURL = sanitizer.sanitizeURL('javascript:alert(1)');
// Result: ''

const safeURL = sanitizer.sanitizeURL('https://example.com/image.jpg');
// Result: 'https://example.com/image.jpg'

// Sanitize CSS
const cleanCSS = sanitizer.sanitizeCSS('color: red; background: url(javascript:alert(1))');
// Result: 'color: red; background: url('

// Validate settings
const cleanSettings = sanitizer.validateSettings({
  title: '<script>bad</script>Hello',
  url: 'javascript:void(0)',
  color: '#ff0000'
}, 'heading');
// Result: { title: 'Hello', url: '', color: '#ff0000', _element_id: '', _css_classes: '' }
```

### Sanitizing Complete Elements

```javascript
const elementData = {
  elType: 'widget',
  widgetType: 'text-editor',
  id: 'abc12345',
  settings: {
    content: '<p>Safe</p><script>alert(1)</script>',
    url: 'javascript:void(0)'
  },
  elements: [],
  isInner: false
};

const sanitized = sanitizer.sanitizeElementData(elementData);
// All dangerous content removed, structure preserved
```

### Integration with Format Converter

The sanitizer is automatically integrated with the Format Converter:

```javascript
// Sanitization is enabled by default
const converted = ElementorFormatConverter.convertToNativeFormat(extensionData, {
  sourceVersion: '3.5.0',
  targetVersion: '3.5.0',
  sanitize: true  // Default: true
});

// Disable sanitization (not recommended)
const unsanitized = ElementorFormatConverter.convertToNativeFormat(extensionData, {
  sanitize: false
});
```

## Security Features

### XSS Protection
- Removes all script tags and inline JavaScript
- Strips event handlers from HTML elements
- Blocks JavaScript URLs in links and images
- Sanitizes CSS to prevent JavaScript execution

### Injection Prevention
- Validates and sanitizes all user input
- Blocks data: URLs that could contain malicious content
- Removes dangerous CSS properties
- Validates data types to prevent type confusion attacks

### Content Validation
- Ensures data matches expected Elementor schema
- Validates nested structures recursively
- Type checking for all settings
- Rejects unexpected or malformed data

## API Reference

### ContentSanitizer Class

#### Methods

##### `sanitizeHTML(html: string): string`
Sanitizes HTML content by removing dangerous elements and attributes.

**Parameters:**
- `html` - HTML string to sanitize

**Returns:** Sanitized HTML string

**Example:**
```javascript
const clean = sanitizer.sanitizeHTML('<div onclick="bad()">Hello</div>');
// Result: '<div>Hello</div>'
```

##### `sanitizeURL(url: string): string`
Validates and sanitizes URLs, blocking dangerous protocols.

**Parameters:**
- `url` - URL string to sanitize

**Returns:** Sanitized URL or empty string if dangerous

**Example:**
```javascript
const clean = sanitizer.sanitizeURL('javascript:alert(1)');
// Result: ''
```

##### `sanitizeCSS(css: string): string`
Removes dangerous patterns from CSS.

**Parameters:**
- `css` - CSS string to sanitize

**Returns:** Sanitized CSS string

**Example:**
```javascript
const clean = sanitizer.sanitizeCSS('color: red; behavior: url(xss.htc)');
// Result: 'color: red;'
```

##### `validateSettings(settings: object, widgetType: string): object`
Validates and sanitizes settings object.

**Parameters:**
- `settings` - Settings object to validate
- `widgetType` - Widget type for context (optional)

**Returns:** Validated and sanitized settings object

**Example:**
```javascript
const clean = sanitizer.validateSettings({
  title: '<script>bad</script>Hello',
  url: 'https://example.com'
}, 'heading');
```

##### `sanitizeElementData(elementData: object): object`
Sanitizes complete Elementor element data structure.

**Parameters:**
- `elementData` - Elementor element object

**Returns:** Sanitized element object or null if invalid

**Example:**
```javascript
const clean = sanitizer.sanitizeElementData({
  elType: 'widget',
  widgetType: 'text-editor',
  id: 'abc12345',
  settings: { content: '<script>bad</script>Good' },
  elements: [],
  isInner: false
});
```

##### `sanitize(data: object): object`
Main entry point for sanitization. Handles various data structures.

**Parameters:**
- `data` - Data to sanitize (element, array of elements, or wrapped structure)

**Returns:** Sanitized data or null if invalid

## Testing

### Unit Tests
Run the unit test suite:
```bash
# Open in browser
chrome-extension/test-content-sanitizer.html
```

Tests cover:
- HTML sanitization (script removal, event handlers, etc.)
- URL validation (dangerous protocols, encoding, etc.)
- CSS sanitization (JavaScript URLs, expressions, etc.)
- Settings validation (type checking, nested objects, etc.)
- Element sanitization (complete structures, nested elements, etc.)
- Edge cases (null inputs, malformed data, etc.)

### Integration Tests
Run the integration test suite:
```bash
# Open in browser
chrome-extension/test-sanitization-integration.html
```

Tests cover:
- Format converter integration
- End-to-end sanitization workflow
- Multiple attack vectors
- Nested element structures
- Real-world scenarios

## Best Practices

### 1. Always Sanitize External Content
```javascript
// ✓ Good - Sanitization enabled
const converted = ElementorFormatConverter.convertToNativeFormat(data, {
  sanitize: true
});

// ✗ Bad - Sanitization disabled
const converted = ElementorFormatConverter.convertToNativeFormat(data, {
  sanitize: false
});
```

### 2. Validate Before Processing
```javascript
// Validate data structure before sanitization
if (typeof data === 'object' && data !== null && data.elType) {
  const sanitized = sanitizer.sanitizeElementData(data);
  if (sanitized) {
    // Process sanitized data
  }
}
```

### 3. Handle Errors Gracefully
```javascript
try {
  const sanitized = sanitizer.sanitize(data);
  if (!sanitized) {
    console.error('Sanitization rejected the data');
    // Show user-friendly error message
  }
} catch (error) {
  console.error('Sanitization error:', error);
  // Fallback to safe state
}
```

### 4. Log Security Events
```javascript
// The sanitizer logs warnings for blocked content
// Monitor console for security events during development
console.log('Checking for sanitization warnings...');
```

## Known Limitations

1. **HTML Parsing**: Uses browser's HTML parser, which may normalize some HTML structures
2. **CSS Validation**: Basic pattern matching, may not catch all CSS injection attempts
3. **URL Validation**: Relies on URL constructor, may have edge cases with unusual formats
4. **Performance**: Recursive sanitization of large element trees may be slow

## Security Considerations

### What's Protected
- ✓ XSS via script tags
- ✓ XSS via event handlers
- ✓ XSS via JavaScript URLs
- ✓ XSS via data: URLs
- ✓ CSS injection attacks
- ✓ Iframe injection
- ✓ Object/embed injection

### What's Not Protected
- ✗ Server-side vulnerabilities
- ✗ CSRF attacks
- ✗ SQL injection (not applicable)
- ✗ Social engineering
- ✗ Phishing (content-based)

### Defense in Depth
The sanitizer is one layer of security. Always:
- Validate on the server side
- Use Content Security Policy
- Keep Elementor and WordPress updated
- Review pasted content before publishing
- Educate users about security risks

## Troubleshooting

### Content Being Over-Sanitized
If legitimate content is being removed:
1. Check console for sanitization warnings
2. Verify the content doesn't match dangerous patterns
3. Consider adjusting sanitization rules (carefully!)

### Sanitization Not Working
If dangerous content is getting through:
1. Verify ContentSanitizer is loaded
2. Check that sanitization is enabled in options
3. Review console for errors
4. Test with the unit test suite

### Performance Issues
If sanitization is slow:
1. Profile with browser dev tools
2. Consider caching sanitized content
3. Optimize for your specific use case
4. Report performance issues for optimization

## Requirements Mapping

This module satisfies the following requirements:

- **10.1**: Sanitize HTML content from external sites
- **10.2**: Strip JavaScript and event handlers
- **10.3**: Validate URLs are properly formatted
- **10.4**: Validate data types match expected schemas
- **10.5**: Use Content Security Policy compliant methods
- **10.6**: Log errors without exposing sensitive information
- **10.7**: Warn about reviewing external content

## Version History

### v1.0.0
- Initial implementation
- HTML, URL, and CSS sanitization
- Settings validation
- Element sanitization
- Integration with format converter
- Comprehensive test suite

## Support

For issues or questions:
1. Check the test suites for examples
2. Review console logs for warnings
3. Consult the API reference
4. Report bugs with test cases
