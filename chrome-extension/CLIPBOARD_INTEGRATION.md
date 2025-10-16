# Clipboard Integration Documentation

## Overview

The Elementor Copier extension uses a robust clipboard integration system that works across different browsers and handles various permission scenarios. This document explains the implementation and fallback mechanisms.

## Architecture

### 1. Offscreen Document Method (Primary)

For Manifest V3 service workers, we use an offscreen document to access the Clipboard API:

```
Content Script → Background Script → Offscreen Document → Clipboard API
```

**Why?** Service workers in Manifest V3 don't have access to DOM APIs like `navigator.clipboard`. The offscreen document provides a hidden page context where we can use these APIs.

**Files:**
- `offscreen.html` - Minimal HTML document
- `offscreen.js` - Handles clipboard write operations
- `background.js` - Creates and manages offscreen document

### 2. Fallback Methods

If the primary method fails, we provide multiple fallback options:

#### A. Chrome Storage Backup
All copied data is automatically stored in `chrome.storage.local` as a backup. This ensures data is never lost even if clipboard operations fail.

#### B. Manual Copy from Popup
Users can open the extension popup and manually copy data using:
- "Copy Again" button - Attempts clipboard write from popup context
- "View Data" button - Opens modal with data that can be manually selected and copied

#### C. Legacy execCommand
For older browsers without Clipboard API support, we fall back to `document.execCommand('copy')`.

## Browser Compatibility

### Supported Browsers

| Browser | Version | Primary Method | Fallback |
|---------|---------|----------------|----------|
| Chrome | 109+ | Offscreen Document | Manual Copy |
| Edge | 109+ | Offscreen Document | Manual Copy |
| Brave | Latest | Offscreen Document | Manual Copy |
| Opera | Latest | Offscreen Document | Manual Copy |

### Clipboard API Support

- **Chrome 66+**: Full Clipboard API support
- **Firefox 63+**: Clipboard API with permissions
- **Safari 13.1+**: Clipboard API with user gesture requirement
- **Edge 79+**: Full Clipboard API support

## Permission Handling

### Required Permissions

```json
{
  "permissions": [
    "clipboardWrite",
    "storage"
  ]
}
```

### Permission Checks

The extension handles various permission scenarios:

1. **Permission Granted**: Normal clipboard write operation
2. **Permission Denied**: Falls back to manual copy
3. **Permission Prompt**: User must approve clipboard access
4. **No Clipboard API**: Uses execCommand fallback

## Error Handling

### Error Scenarios

1. **Offscreen Document Creation Failed**
   - Error: "Could not create offscreen document"
   - Fallback: Try direct clipboard access from content script
   - User Action: Manual copy from popup

2. **Clipboard Write Failed**
   - Error: "Failed to copy to clipboard"
   - Fallback: Store in chrome.storage
   - User Action: Use "Copy Again" button in popup

3. **Runtime Error**
   - Error: "Failed to communicate with extension"
   - Fallback: Reload extension
   - User Action: Check extension status

4. **No Clipboard API**
   - Error: "Clipboard API not available"
   - Fallback: execCommand or manual copy
   - User Action: Update browser or copy manually

### Error Messages

All error messages are user-friendly and actionable:

```javascript
// Good error message
"Failed to copy to clipboard. Please use the 'Copy Again' button in the extension popup."

// Bad error message
"Error: undefined"
```

## Implementation Details

### Background Script (background.js)

```javascript
async function copyToClipboard(data) {
  try {
    // 1. Store in chrome.storage as backup
    await chrome.storage.local.set({
      lastCopied: data,
      lastCopiedAt: new Date().toISOString()
    });

    // 2. Setup offscreen document
    await setupOffscreenDocument();
    
    // 3. Send message to offscreen document
    const response = await chrome.runtime.sendMessage({
      action: 'copyToClipboard',
      data: data
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to copy');
    }

    return true;
  } catch (error) {
    // 4. Try fallback method
    await fallbackCopyToClipboard(data);
  }
}
```

### Offscreen Document (offscreen.js)

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyToClipboard') {
    handleClipboardWrite(request.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleClipboardWrite(data) {
  const jsonString = JSON.stringify(data, null, 2);
  
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    throw new Error('Clipboard API not available');
  }
  
  await navigator.clipboard.writeText(jsonString);
}
```

### Content Script (content.js)

```javascript
function copyToClipboard(data, callback) {
  // Always go through background script
  chrome.runtime.sendMessage({
    action: 'copyToClipboard',
    data: data
  }, (response) => {
    if (response && response.success) {
      callback({ success: true, message: 'Copied to clipboard!' });
    } else {
      callback({ success: false, error: response?.error });
    }
  });
}
```

### Popup Manual Copy (popup.js)

```javascript
async function manualCopy() {
  const data = await chrome.storage.local.get('lastCopied');
  const jsonString = JSON.stringify(data.lastCopied, null, 2);
  
  // Try Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(jsonString);
      showMessage('Copied to clipboard!', 'success');
    } catch (error) {
      // Show modal for manual copy
      viewClipboard();
    }
  } else {
    // Show modal for manual copy
    viewClipboard();
  }
}
```

## Testing

### Test Cases

1. **Normal Operation**
   - Copy widget from page
   - Verify clipboard contains JSON data
   - Verify chrome.storage contains backup

2. **Permission Denied**
   - Deny clipboard permission
   - Verify fallback to manual copy
   - Verify data still in chrome.storage

3. **Offscreen Document Failure**
   - Simulate offscreen creation failure
   - Verify fallback methods work
   - Verify user can still access data

4. **Browser Without Clipboard API**
   - Test in older browser
   - Verify execCommand fallback
   - Verify manual copy works

5. **Large Data**
   - Copy entire page with many elements
   - Verify clipboard handles large JSON
   - Verify no memory issues

### Manual Testing Steps

1. **Chrome (Latest)**
   ```
   1. Install extension
   2. Visit Elementor site
   3. Right-click widget → Copy Widget
   4. Verify notification shows success
   5. Open WordPress admin
   6. Paste (Ctrl+V) in Elementor Copier plugin
   7. Verify data is correct
   ```

2. **Edge (Latest)**
   ```
   Same as Chrome
   ```

3. **Brave (Latest)**
   ```
   1. Install extension
   2. Check Brave shields settings
   3. Follow Chrome steps
   4. Verify clipboard access works
   ```

4. **Fallback Testing**
   ```
   1. Open extension popup
   2. Click "View Data"
   3. Verify modal shows JSON
   4. Click "Copy to Clipboard"
   5. Verify copy works
   6. Try manual selection + Ctrl+C
   ```

## Troubleshooting

### Common Issues

1. **"Failed to copy to clipboard"**
   - **Cause**: Browser denied clipboard permission
   - **Solution**: Use "Copy Again" button in popup
   - **Prevention**: Grant clipboard permission when prompted

2. **"Clipboard API not available"**
   - **Cause**: Older browser version
   - **Solution**: Update browser or use manual copy
   - **Prevention**: Check browser compatibility

3. **"Failed to communicate with extension"**
   - **Cause**: Extension context invalidated
   - **Solution**: Reload extension
   - **Prevention**: Keep extension updated

4. **Data not pasting in WordPress**
   - **Cause**: Clipboard cleared or wrong format
   - **Solution**: Copy again from extension popup
   - **Prevention**: Paste immediately after copying

### Debug Mode

Enable debug logging:

```javascript
// In background.js
const DEBUG = true;

if (DEBUG) {
  console.log('Clipboard operation:', data);
}
```

## Best Practices

1. **Always Store Backup**: Store data in chrome.storage before clipboard write
2. **Provide Fallbacks**: Multiple fallback methods for reliability
3. **User-Friendly Errors**: Clear, actionable error messages
4. **Test Across Browsers**: Verify on Chrome, Edge, Brave
5. **Handle Permissions**: Gracefully handle denied permissions
6. **Large Data**: Test with large JSON payloads
7. **User Feedback**: Show clear success/error notifications

## Future Improvements

1. **Clipboard Read**: Add ability to read clipboard on paste
2. **Format Detection**: Auto-detect clipboard format
3. **Compression**: Compress large data before clipboard write
4. **Encryption**: Optional encryption for sensitive data
5. **History**: Store multiple clipboard items
6. **Sync**: Sync clipboard across devices via chrome.storage.sync

## References

- [Chrome Offscreen Documents](https://developer.chrome.com/docs/extensions/reference/offscreen/)
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)
