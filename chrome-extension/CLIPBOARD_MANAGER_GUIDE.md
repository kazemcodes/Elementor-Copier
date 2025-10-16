# Clipboard Manager Guide

## Overview

The Clipboard Manager module provides multi-format clipboard operations for native Elementor paste support. It handles writing data to the clipboard with extension markers for identification and reading extension data back from the clipboard.

**Requirements Implemented:** 3.1, 3.2, 3.3, 3.4, 3.6

## Features

### 1. Multi-Format Clipboard Writing (Requirement 3.1)
- Writes data in `text/plain` JSON format (Elementor's default)
- Adds extension marker for identification
- Maintains compatibility with Elementor's clipboard reader

### 2. Extension Data Detection (Requirement 3.2)
- Reads clipboard content
- Parses JSON data
- Detects extension marker
- Returns extension data or null

### 3. Quick Clipboard Check (Requirement 3.3)
- Fast detection of extension data presence
- No need to parse full data structure
- Useful for paste event interception

### 4. Extension Marker System (Requirement 3.4)
- Unique marker: `__ELEMENTOR_COPIER_DATA__`
- Includes version, timestamp, and source
- Easy to add, check, and remove

### 5. Offscreen Document Support (Requirement 3.6)
- Updated `offscreen.js` for multi-format writes
- Supports both write and read operations
- Maintains backward compatibility

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clipboard Manager                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │ writeMultiFormat│──────▶│ Add Marker       │             │
│  └─────────────────┘      └──────────────────┘             │
│           │                         │                        │
│           ▼                         ▼                        │
│  ┌─────────────────────────────────────────┐               │
│  │     Clipboard API (text/plain)          │               │
│  └─────────────────────────────────────────┘               │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │ readExtensionData│─────▶│ Check Marker     │             │
│  └─────────────────┘      └──────────────────┘             │
│           │                         │                        │
│           ▼                         ▼                        │
│  ┌─────────────────────────────────────────┐               │
│  │     Return Extension Data or null       │               │
│  └─────────────────────────────────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Usage in Content Scripts

```javascript
// Initialize clipboard manager
const clipboardManager = new ClipboardManager();

// Write data to clipboard
const elementorData = {
  elType: 'widget',
  widgetType: 'heading',
  settings: { title: 'Hello World' }
};

await clipboardManager.writeMultiFormat(elementorData);

// Check if clipboard has extension data
const hasData = await clipboardManager.hasExtensionData();
if (hasData) {
  console.log('Extension data found in clipboard');
}

// Read extension data
const data = await clipboardManager.readExtensionData();
if (data) {
  console.log('Data:', data);
}
```

### Usage in Offscreen Document

The offscreen document automatically handles multi-format clipboard operations:

```javascript
// From background script or content script
chrome.runtime.sendMessage({
  action: 'copyToClipboard',
  data: elementorData,
  options: {}
}, (response) => {
  if (response.success) {
    console.log('Data written to clipboard');
  }
});

// Read from clipboard
chrome.runtime.sendMessage({
  action: 'readClipboard'
}, (response) => {
  if (response.success && response.data) {
    console.log('Extension data:', response.data);
  }
});
```

## API Reference

### ClipboardManager Class

#### `writeMultiFormat(data, options = {})`
Writes data to clipboard in multiple formats with extension marker.

**Parameters:**
- `data` (Object): The data to write to clipboard
- `options` (Object): Optional configuration (reserved for future use)

**Returns:** `Promise<boolean>` - Success status

**Example:**
```javascript
const success = await clipboardManager.writeMultiFormat({
  elType: 'widget',
  widgetType: 'button',
  settings: { text: 'Click Me' }
});
```

#### `readExtensionData()`
Reads and returns extension data from clipboard.

**Returns:** `Promise<Object|null>` - Extension data or null if not found

**Example:**
```javascript
const data = await clipboardManager.readExtensionData();
if (data) {
  console.log('Found extension data:', data);
}
```

#### `hasExtensionData()`
Quick check if clipboard contains extension data.

**Returns:** `Promise<boolean>` - True if extension data is present

**Example:**
```javascript
if (await clipboardManager.hasExtensionData()) {
  // Handle paste operation
}
```

#### `addExtensionMarker(data)`
Adds extension marker to data object.

**Parameters:**
- `data` (Object): The data to mark

**Returns:** `Object` - Data with extension marker

**Example:**
```javascript
const markedData = clipboardManager.addExtensionMarker({
  test: 'data'
});
```

#### `hasExtensionMarker(data)`
Checks if data has extension marker.

**Parameters:**
- `data` (Object): The data to check

**Returns:** `boolean` - True if marker is present

**Example:**
```javascript
if (clipboardManager.hasExtensionMarker(data)) {
  console.log('This is extension data');
}
```

#### `removeExtensionMarker(data)`
Removes extension marker from data.

**Parameters:**
- `data` (Object): The data to clean

**Returns:** `Object` - Data without extension marker

**Example:**
```javascript
const cleanData = clipboardManager.removeExtensionMarker(markedData);
```

#### `getExtensionMetadata(data)`
Extracts extension marker metadata.

**Parameters:**
- `data` (Object): The data to extract metadata from

**Returns:** `Object|null` - Marker metadata or null

**Example:**
```javascript
const metadata = clipboardManager.getExtensionMetadata(data);
console.log('Version:', metadata.version);
console.log('Timestamp:', metadata.timestamp);
```

## Extension Marker Format

The extension marker is added to clipboard data as follows:

```javascript
{
  // Original data fields
  elType: 'widget',
  widgetType: 'heading',
  settings: { ... },
  
  // Extension marker
  __ELEMENTOR_COPIER_DATA__: {
    version: '1.0.0',
    timestamp: 1634567890123,
    source: 'elementor-copier-extension'
  }
}
```

## Integration with Existing Code

### Content Script Integration

The clipboard manager can be integrated into `content.js` to enhance the copy operations:

```javascript
// Import or load clipboard manager
// (Already available via web_accessible_resources)

// In copy functions, use the clipboard manager
async function copyElementToClipboard(elementData) {
  const clipboardManager = new ClipboardManager();
  
  // Add native format conversion here (from task 2)
  const nativeData = convertToNativeFormat(elementData);
  
  // Write with extension marker
  await clipboardManager.writeMultiFormat(nativeData);
}
```

### Paste Event Interception

Use the clipboard manager to detect extension data during paste:

```javascript
document.addEventListener('paste', async (event) => {
  const clipboardManager = new ClipboardManager();
  
  // Quick check
  if (await clipboardManager.hasExtensionData()) {
    event.preventDefault();
    
    // Read and process extension data
    const data = await clipboardManager.readExtensionData();
    handleExtensionPaste(data);
  }
});
```

## Testing

A comprehensive test suite is available at `test-clipboard-manager.html`.

### Running Tests

1. Open `chrome-extension/test-clipboard-manager.html` in Chrome
2. Click "Run All Tests" or run individual tests
3. Verify all tests pass

### Test Coverage

- ✅ Write multi-format data
- ✅ Read extension data
- ✅ Quick clipboard check
- ✅ Extension marker operations
- ✅ Non-extension data detection
- ✅ End-to-end workflow

## Permissions Required

The following permissions are required in `manifest.json`:

```json
{
  "permissions": [
    "clipboardWrite",  // Write to clipboard
    "clipboardRead"    // Read from clipboard (NEW)
  ]
}
```

## Browser Compatibility

- **Chrome:** 109+ (Manifest V3 requirement)
- **Edge:** 109+ (Chromium-based)
- **Opera:** 95+ (Chromium-based)

## Security Considerations

### Data Sanitization
- All clipboard data should be sanitized before use
- Extension marker is read-only metadata
- No executable code in clipboard data

### Permission Model
- `clipboardRead` permission is optional for paste detection
- Fallback available if permission denied
- User consent required for clipboard access

### Privacy
- No clipboard data is sent to external servers
- All operations are local
- Extension marker contains no personal information

## Troubleshooting

### Issue: Clipboard API not available
**Solution:** Ensure the page is served over HTTPS or localhost

### Issue: Permission denied
**Solution:** Check that `clipboardRead` permission is in manifest.json

### Issue: Data not detected
**Solution:** Verify extension marker is present using `hasExtensionMarker()`

### Issue: JSON parse error
**Solution:** Ensure clipboard contains valid JSON data

## Future Enhancements

- Support for additional MIME types
- Clipboard history management
- Compression for large data
- Encryption for sensitive data
- Cross-browser compatibility layer

## Related Modules

- **elementor-format-converter.js** - Converts data to Elementor native format
- **elementor-editor-detector.js** - Detects Elementor editor context
- **paste-interceptor.js** - Intercepts paste events (Task 4)

## References

- [Clipboard API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [Chrome Extension Clipboard](https://developer.chrome.com/docs/extensions/reference/clipboard/)
- [Elementor Data Format](../ELEMENTOR_EDITOR_PASTE_FEATURE.md)

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- Multi-format clipboard support
- Extension marker system
- Offscreen document integration
- Comprehensive test suite

