# Clipboard Issue Troubleshooting Guide

## Current Status
The extension is successfully extracting Elementor data but failing to write to the clipboard with the error:
```
🔴 Elementor Copier Error [CLIPBOARD_WRITE_FAILED]
Clipboard access failed. Try using the extension popup to copy manually.
```

## Steps to Fix

### 1. Reload the Extension
**CRITICAL**: After making code changes, you MUST reload the extension:

1. Open Chrome and go to `chrome://extensions/`
2. Find "Elementor Copier"
3. Click the **reload icon** (circular arrow) button
4. Refresh the Elementor page you're testing on

### 2. Check Browser Console for Background Script Errors

1. Go to `chrome://extensions/`
2. Find "Elementor Copier"
3. Click "service worker" or "background page" link
4. Check the console for errors

**Expected output when clicking an element:**
```
Message received in background: {action: "copyToClipboard", data: {...}}
✓ Offscreen document created successfully
✓ Data stored in chrome.storage
✓ Multi-format data written to clipboard via offscreen document
```

### 3. Check Offscreen Document Console

The offscreen document runs in a separate context. To check its console:

1. Go to `chrome://extensions/`
2. Click "Inspect views: offscreen document" (if available)
3. Or check the background service worker console for offscreen messages

**Expected output:**
```
Elementor Copier: Offscreen document loaded with multi-format support and focus management
✓ Multi-format data written to clipboard via offscreen document (attempt 1)
```

### 4. Verify Permissions

Check that the extension has the required permissions in `manifest.json`:
- ✅ `clipboardWrite`
- ✅ `clipboardRead`
- ✅ `offscreen`

### 5. Test Clipboard Permissions

Try this in the browser console on the Elementor page:
```javascript
navigator.clipboard.writeText('test').then(() => {
  console.log('✓ Clipboard write works');
}).catch(err => {
  console.error('✗ Clipboard write failed:', err);
});
```

### 6. Check for Browser Focus Issues

The clipboard API requires the browser window to be focused:
- Make sure the Chrome window is in the foreground
- Click on the page before trying to copy
- Don't have other applications in focus

### 7. Try Manual Copy via Extension Popup

If automatic copying fails:
1. Click the extension icon in the toolbar
2. The popup should show the last copied data
3. Click "Copy to Clipboard" button in the popup

## Common Issues and Solutions

### Issue: "No response from offscreen document"
**Solution**: The offscreen document isn't being created or isn't responding
- Check background script console for offscreen creation errors
- Verify `offscreen.html` and `offscreen.js` exist in the extension folder
- Reload the extension

### Issue: "Document is not focused"
**Solution**: Browser security requires focus for clipboard access
- Click on the page before copying
- Ensure Chrome window is in foreground
- Try clicking the element again

### Issue: "Extension context invalidated"
**Solution**: Extension was reloaded while page was open
- Refresh the page after reloading the extension
- Close and reopen the page

### Issue: Clipboard writes but Elementor can't paste
**Solution**: Data format might be incorrect
- Check clipboard content by pasting into a text editor
- Verify JSON structure matches Elementor's expected format
- Check for the extension marker in the data

## Debug Mode

To enable verbose logging, add this to the content script console:
```javascript
localStorage.setItem('elementor-copier-debug', 'true');
```

Then reload the page and try copying again. You'll see detailed logs.

## Testing the Fix

1. **Reload Extension**: Go to `chrome://extensions/` and click reload
2. **Refresh Page**: Reload the Elementor page
3. **Open Console**: Press F12 to open DevTools
4. **Enable Highlight Mode**: Right-click → Elementor Copier → Enable Highlight Mode
5. **Click Section**: Click on a highlighted Elementor section
6. **Check Console**: Look for success messages:
   ```
   ✓ Extraction complete
   ✓ Clipboard data prepared
   ✓ Copied to clipboard
   ```
7. **Verify Clipboard**: Paste (Ctrl+V) into a text editor to see the JSON data

## If Still Not Working

### Check Chrome Version
The offscreen API requires Chrome 109+. Check your version:
```
chrome://version/
```

### Try Fallback Method
If the offscreen document approach doesn't work, the extension should fall back to:
1. `document.execCommand('copy')` (deprecated but reliable)
2. Textarea selection + copy
3. Manual copy via popup

### Report the Issue
If none of the above works, gather this information:
- Chrome version
- Operating system
- Console errors from:
  - Page console (F12)
  - Background service worker console
  - Offscreen document console (if available)
- Steps to reproduce

## Quick Fix Checklist

- [ ] Extension reloaded after code changes
- [ ] Page refreshed after extension reload
- [ ] Browser window is focused (not minimized)
- [ ] Clicked on the page before copying
- [ ] No console errors in background script
- [ ] Offscreen document is created successfully
- [ ] Clipboard permissions granted
- [ ] Chrome version 109 or higher

## Next Steps

If the issue persists after following all steps above:
1. Check the background service worker console for detailed error messages
2. Verify the offscreen document is being created
3. Test clipboard access directly in the console
4. Try the manual copy method via the extension popup
