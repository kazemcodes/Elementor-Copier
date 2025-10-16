# Content Sanitization Quick Reference

## Quick Start

```javascript
// 1. Create sanitizer instance
const sanitizer = new ContentSanitizer();

// 2. Sanitize content
const clean = sanitizer.sanitize(data);

// 3. Use with format converter (automatic)
const converted = ElementorFormatConverter.convertToNativeFormat(data);
// Sanitization is enabled by default
```

## Common Use Cases

### Sanitize HTML
```javascript
const html = '<div onclick="bad()">Hello<script>alert(1)</script></div>';
const clean = sanitizer.sanitizeHTML(html);
// Result: '<div>Hello</div>'
```

### Validate URLs
```javascript
// Dangerous URLs → empty string
sanitizer.sanitizeURL('javascript:alert(1)');  // ''
sanitizer.sanitizeURL('data:text/html,...');   // ''

// Safe URLs → preserved
sanitizer.sanitizeURL('https://example.com');  // 'https://example.com'
sanitizer.sanitizeURL('/images/photo.jpg');    // '/images/photo.jpg'
```

### Clean CSS
```javascript
const css = 'color: red; background: url(javascript:alert(1))';
const clean = sanitizer.sanitizeCSS(css);
// Result: 'color: red; background: url('
```

### Validate Settings
```javascript
const settings = {
  title: '<script>bad</script>Hello',
  url: 'javascript:void(0)',
  color: '#ff0000'
};
const clean = sanitizer.validateSettings(settings, 'heading');
// Result: { title: 'Hello', url: '', color: '#ff0000', ... }
```

## What Gets Blocked

### HTML Elements
- `<script>` - JavaScript execution
- `<iframe>` - Embedded content
- `<object>`, `<embed>` - Plugin content
- `<applet>` - Java applets
- `<meta>`, `<link>`, `<base>` - Document metadata
- `<style>` - Inline styles

### HTML Attributes
- `onclick`, `onload`, `onerror`, etc. - Event handlers
- `href="javascript:..."` - JavaScript URLs
- `src="javascript:..."` - JavaScript URLs
- `style="...javascript:..."` - JavaScript in CSS

### URL Protocols
- `javascript:` - JavaScript execution
- `data:` - Data URLs (can contain scripts)
- `vbscript:` - VBScript execution
- `file:` - Local file access

### CSS Patterns
- `javascript:` - JavaScript URLs
- `expression()` - IE expressions
- `@import` - External stylesheets
- `behavior:` - IE behaviors
- `-moz-binding:` - XBL bindings

## What's Preserved

### Safe HTML
```javascript
// These are preserved:
'<div class="container">Content</div>'
'<p><strong>Bold</strong> and <em>italic</em></p>'
'<a href="https://example.com">Link</a>'
'<img src="/images/photo.jpg" alt="Photo">'
```

### Safe URLs
```javascript
// These are preserved:
'https://example.com/page'
'http://example.com/image.jpg'
'/relative/path'
'../parent/path'
'#anchor'
'mailto:email@example.com'
```

### Safe CSS
```javascript
// These are preserved:
'color: red; font-size: 16px;'
'background: #fff url(/image.jpg);'
'padding: 10px; margin: 20px;'
```

## Integration Points

### 1. Format Converter (Automatic)
```javascript
// Sanitization happens automatically during conversion
const converted = ElementorFormatConverter.convertToNativeFormat(data, {
  sanitize: true  // Default
});
```

### 2. Manual Sanitization
```javascript
// Sanitize before processing
const sanitized = sanitizer.sanitizeElementData(elementData);
if (sanitized) {
  // Process sanitized data
}
```

### 3. Settings Validation
```javascript
// Validate settings separately
const cleanSettings = sanitizer.validateSettings(
  element.settings,
  element.widgetType
);
```

## Testing

### Run Unit Tests
Open `chrome-extension/test-content-sanitizer.html` in browser

### Run Integration Tests
Open `chrome-extension/test-sanitization-integration.html` in browser

### Manual Testing
```javascript
// Test in browser console
const sanitizer = new ContentSanitizer();

// Test HTML sanitization
console.log(sanitizer.sanitizeHTML('<script>alert(1)</script>Hello'));

// Test URL validation
console.log(sanitizer.sanitizeURL('javascript:alert(1)'));

// Test complete element
console.log(sanitizer.sanitizeElementData({
  elType: 'widget',
  widgetType: 'text-editor',
  id: 'test123',
  settings: { content: '<script>bad</script>Good' },
  elements: [],
  isInner: false
}));
```

## Error Handling

```javascript
try {
  const sanitized = sanitizer.sanitize(data);
  if (!sanitized) {
    console.error('Data was rejected by sanitizer');
    // Handle rejection
  }
} catch (error) {
  console.error('Sanitization error:', error);
  // Handle error
}
```

## Performance Tips

1. **Cache Results**: Sanitize once, use multiple times
2. **Validate Early**: Check data structure before sanitizing
3. **Batch Operations**: Sanitize multiple elements together
4. **Profile**: Use browser dev tools to identify bottlenecks

## Security Checklist

- [x] HTML sanitization enabled
- [x] URL validation enabled
- [x] CSS sanitization enabled
- [x] Settings validation enabled
- [x] Recursive sanitization for nested elements
- [x] Error handling in place
- [x] Logging for security events
- [x] Test coverage for all features

## Common Patterns

### Pattern 1: Sanitize Before Paste
```javascript
// In paste interceptor
const clipboardData = await readClipboard();
const sanitized = sanitizer.sanitize(clipboardData);
if (sanitized) {
  await pasteToEditor(sanitized);
}
```

### Pattern 2: Validate User Input
```javascript
// When user provides settings
const userSettings = getUserInput();
const validated = sanitizer.validateSettings(userSettings, widgetType);
element.settings = validated;
```

### Pattern 3: Clean External Content
```javascript
// When extracting from external site
const extracted = extractElementData();
const cleaned = sanitizer.sanitizeElementData(extracted);
if (cleaned) {
  saveToClipboard(cleaned);
}
```

## Troubleshooting

### Issue: Content Over-Sanitized
**Solution**: Check console warnings, verify content doesn't match dangerous patterns

### Issue: Dangerous Content Getting Through
**Solution**: Verify sanitizer is loaded and enabled, check test suite

### Issue: Performance Slow
**Solution**: Profile with dev tools, consider caching, optimize for your use case

## Requirements Coverage

| Requirement | Feature | Status |
|-------------|---------|--------|
| 10.1 | Sanitize HTML from external sites | ✓ |
| 10.2 | Strip JavaScript and event handlers | ✓ |
| 10.3 | Validate URLs | ✓ |
| 10.4 | Validate data types | ✓ |
| 10.5 | CSP compliant methods | ✓ |
| 10.6 | Safe error logging | ✓ |
| 10.7 | User warnings | ✓ |

## Resources

- Full Guide: `CONTENT_SANITIZER_GUIDE.md`
- Unit Tests: `test-content-sanitizer.html`
- Integration Tests: `test-sanitization-integration.html`
- Source Code: `content-sanitizer.js`
