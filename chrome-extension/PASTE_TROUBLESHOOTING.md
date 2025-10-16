# Paste Troubleshooting Guide

## Quick Diagnostic Steps

If paste is not working, follow these steps:

### 1. Run the Diagnostic Tool
1. Open `chrome-extension/diagnose-paste-issue.html` in your browser
2. Click "Run Full Diagnostic"
3. Review the results and follow suggested fixes

### 2. Common Issues & Solutions

#### Issue: Nothing happens when I press Ctrl+V

**Possible Causes:**
- Not in Elementor editor mode
- No extension data in clipboard
- Paste interceptor not initialized

**Solutions:**
1. Make sure you're in Elementor **edit mode** (not preview)
2. Copy a widget from another site first using the extension
3. Refresh the Elementor editor page
4. Check browser console for errors (F12)

#### Issue: "Document is not focused" error

**Solution:**
- Click on the Elementor editor canvas first
- Wait a moment, then try pasting again
- This is a browser security feature

#### Issue: Paste works but element doesn't appear

**Possible Causes:**
- No active container selected
- Elementor API not ready
- Format conversion failed

**Solutions:**
1. Click on a section or column first
2. Wait for Elementor to fully load
3. Check browser console for conversion errors
4. Try pasting a simpler widget first

#### Issue: Extension data not detected

**Possible Causes:**
- Didn't copy using the extension
- Clipboard was overwritten
- Copy operation failed

**Solutions:**
1. Right-click on a widget and select "Copy Widget"
2. Wait for the success message
3. Don't copy anything else before pasting
4. Check if clipboard contains JSON data

### 3. Verify Extension Setup

Run these checks:

```javascript
// Open browser console (F12) and run:

// 1. Check if extension is loaded
console.log('Extension loaded:', typeof chrome !== 'undefined' && chrome.runtime);

// 2. Check if modules are loaded
console.log('Modules:', {
  converter: typeof ElementorFormatConverter !== 'undefined',
  detector: typeof ElementorEditorDetector !== 'undefined',
  clipboard: typeof ClipboardManager !== 'undefined',
  interceptor: typeof PasteInterceptor !== 'undefined',
  injector: typeof EditorContextInjector !== 'undefined'
});

// 3. Check if instances are created
console.log('Instances:', window.__elementorCopierInstances);

// 4. Check if in Elementor editor
console.log('In editor:', typeof elementor !== 'undefined');

// 5. Check paste interceptor status
if (window.__elementorCopierInstances) {
  console.log('Interceptor initialized:', 
    window.__elementorCopierInstances.pasteInterceptor?.initialized
  );
}
```

### 4. Manual Testing Steps

1. **Test Copy Operation:**
   - Go to any Elementor site
   - Right-click on a widget
   - Select "Copy Widget"
   - You should see a success message
   - Check clipboard: Ctrl+V in a text editor should show JSON

2. **Test Paste Operation:**
   - Go to your WordPress site
   - Open Elementor editor
   - Click on a section or column
   - Press Ctrl+V
   - Widget should appear

3. **Test with Simple Widget:**
   - Start with a heading or text widget
   - These are simpler and more likely to work
   - If simple widgets work, try more complex ones

### 5. Check Browser Console

Open browser console (F12) and look for:

**Good Signs (should see):**
```
✓ Elementor Copier: Content script loaded
✓ Format converter loaded
✓ Elementor editor detector loaded
✓ Clipboard manager loaded
✓ Paste interceptor loaded
✓ Editor injector loaded
✓ Elementor editor detected, initializing...
✓ Paste interceptor initialized
```

**Bad Signs (should NOT see):**
```
✗ Failed to load [module name]
✗ Paste interceptor initialization failed
Document is not focused
Elementor not found
```

### 6. Verify Elementor Editor State

Make sure:
- [ ] You're logged into WordPress
- [ ] You're in Elementor edit mode (URL contains `?action=elementor`)
- [ ] Elementor editor has fully loaded (not showing loading spinner)
- [ ] You can see the Elementor panel on the left
- [ ] You're not in preview mode

### 7. Test Clipboard Permissions

```javascript
// Run in browser console:
navigator.clipboard.readText()
  .then(text => console.log('Clipboard read OK:', text.substring(0, 100)))
  .catch(err => console.error('Clipboard read failed:', err));

navigator.clipboard.writeText('test')
  .then(() => console.log('Clipboard write OK'))
  .catch(err => console.error('Clipboard write failed:', err));
```

### 8. Check Extension Permissions

1. Go to `chrome://extensions`
2. Find "Elementor Copier"
3. Click "Details"
4. Verify these permissions are granted:
   - ✓ Read and change all your data on all websites
   - ✓ Modify data you copy and paste
   - ✓ Display notifications

### 9. Network/CORS Issues

If copying from external sites:
- Some sites may block the extension
- Try copying from your own WordPress sites first
- Check browser console for CORS errors

### 10. Version Compatibility

Check Elementor version:
```javascript
// Run in Elementor editor console:
console.log('Elementor version:', elementor.config.version);
```

Supported versions:
- ✓ Elementor 2.x (with compatibility layer)
- ✓ Elementor 3.x (full support)
- ✓ Elementor 4.x (full support)

### 11. Reset Extension

If all else fails:
1. Go to `chrome://extensions`
2. Remove "Elementor Copier"
3. Restart browser
4. Reinstall extension
5. Refresh all Elementor pages

### 12. Get Detailed Logs

```javascript
// Run in browser console to get error log:
window.elementorCopierGetErrorLog();

// This will show all errors that occurred
// Copy and save this for debugging
```

## Still Not Working?

If you've tried all the above and paste still doesn't work:

1. **Run the diagnostic tool** (`diagnose-paste-issue.html`)
2. **Export the diagnostic log**
3. **Check browser console** for errors
4. **Try in a different browser** (Chrome, Edge, Brave)
5. **Test on a fresh WordPress install** to rule out conflicts

## Known Limitations

- Paste only works in Elementor **edit mode**, not preview
- Some complex widgets may not paste perfectly
- Custom widgets from plugins may not be supported
- Very large sections may take longer to paste
- Cross-domain restrictions may apply

## Debug Mode

Enable verbose logging:
```javascript
// Run in browser console:
localStorage.setItem('elementorCopierDebug', 'true');
// Refresh page
// Check console for detailed logs
```

Disable debug mode:
```javascript
localStorage.removeItem('elementorCopierDebug');
```

## Contact Support

If you need help:
1. Run diagnostic tool and export log
2. Copy browser console errors
3. Note your Elementor version
4. Describe what you're trying to copy/paste
5. Include any error messages you see
