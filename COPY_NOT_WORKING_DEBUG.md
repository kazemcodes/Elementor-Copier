# Copy Not Working - Debug Guide

## Issue

The copy function appears to extract data successfully but doesn't actually copy to clipboard.

## What We Know

From your console logs:
```
[Extract] ✓ Extraction complete. Final data: {...}
✓ Clipboard data prepared for paste-time conversion
Extracted 53 media items from element
```

But then... nothing. No clipboard write, no success message, no error.

## Debug Version (v1.2.1)

I've added extensive logging to help diagnose the issue. After installing v1.2.1, you'll see:

### In Content Script Console
```
[Copy] Sending copy request to background script...
[Copy] Data type: section
[Copy] Data size: 12345 characters
[Copy] Received response from background: {...}
```

### In Background Script Console  
```
[Background] Received copyToClipboard request
[Background] Sender URL: https://...
[Background] Data type: section
[Background] Processing copy request...
✓ Data stored in chrome.storage
✓ Offscreen document created successfully
✓ Data copied to clipboard via offscreen document
```

## How to Debug

### Step 1: Open DevTools

1. **For Content Script:**
   - Right-click on page → Inspect
   - Go to Console tab
   - Look for `[Copy]` and `[Extract]` messages

2. **For Background Script:**
   - Go to `chrome://extensions/`
   - Find "Elementor Copier"
   - Click "service worker" or "background page"
   - Look for `[Background]` messages

### Step 2: Try Copying

1. Enable highlight mode (Ctrl+Shift+C)
2. Click on an element
3. Watch BOTH consoles

### Step 3: Check What's Missing

**If you see in content script:**
```
[Copy] Sending copy request to background script...
```
But nothing in background script → **Message not reaching background**

**If you see in background script:**
```
[Background] Received copyToClipboard request
[Background] Processing copy request...
```
But no success message → **Clipboard write failing**

**If you see:**
```
✗ Runtime error: Could not establish connection
```
→ **Extension needs reload**

## Common Issues & Solutions

### Issue 1: "Could not establish connection"

**Cause:** Extension was updated/reloaded while page was open

**Solution:**
1. Reload the extension in `chrome://extensions/`
2. Refresh the page
3. Try again

### Issue 2: No logs in background script

**Cause:** Background script not running or message not sent

**Solution:**
1. Check if service worker is active in `chrome://extensions/`
2. Click "service worker" to wake it up
3. Try copying again

### Issue 3: "Document is not focused"

**Cause:** Offscreen document can't access clipboard without focus

**Solution:**
1. Click on the browser window
2. Make sure it's the active window
3. Try copying again

### Issue 4: Offscreen document not created

**Cause:** Chrome API issue or permissions problem

**Solution:**
1. Check extension permissions in `chrome://extensions/`
2. Make sure "clipboardWrite" and "offscreen" are granted
3. Reload extension

## Manual Test

Try this in the content script console:

```javascript
// Test if background script responds
chrome.runtime.sendMessage({
  action: 'copyToClipboard',
  data: {
    version: '1.0.0',
    type: 'elementor-copier',
    elementType: 'test',
    data: { test: true }
  }
}, (response) => {
  console.log('Test response:', response);
  if (chrome.runtime.lastError) {
    console.error('Test error:', chrome.runtime.lastError);
  }
});
```

**Expected result:**
```
Test response: {success: true}
```

**If you get an error:**
- Extension needs reload
- Background script crashed
- Permissions issue

## Collecting Debug Info

If it still doesn't work, collect this info:

1. **Content Script Console:**
   - Copy all `[Copy]` and `[Extract]` messages
   - Copy any errors

2. **Background Script Console:**
   - Copy all `[Background]` messages
   - Copy any errors

3. **Extension Info:**
   - Chrome version
   - Extension version
   - Operating system

4. **Page Info:**
   - Are you in Elementor editor or frontend?
   - Page URL (if not sensitive)

## Quick Fixes to Try

### Fix 1: Reload Everything
```
1. Go to chrome://extensions/
2. Click reload on Elementor Copier
3. Refresh the page
4. Try copying
```

### Fix 2: Check Permissions
```
1. Go to chrome://extensions/
2. Click "Details" on Elementor Copier
3. Scroll to "Permissions"
4. Make sure all are granted
```

### Fix 3: Clear Extension Data
```
1. Open extension popup
2. Right-click → Inspect
3. Go to Application → Storage
4. Click "Clear site data"
5. Reload extension
```

### Fix 4: Reinstall Extension
```
1. Remove extension
2. Download latest version
3. Install fresh
4. Try again
```

## Expected Behavior

### Successful Copy Flow

1. **User clicks element**
   ```
   [Click] Element clicked: section
   ```

2. **Data extraction**
   ```
   [Extract] ========== EXTRACTING ELEMENT DATA ==========
   [Extract] Element ID: abc123
   [Extract] Element type: section
   [Extract] ✓ Extraction complete
   ```

3. **Send to background**
   ```
   [Copy] Sending copy request to background script...
   [Copy] Data type: section
   [Copy] Data size: 12345 characters
   ```

4. **Background processes**
   ```
   [Background] Received copyToClipboard request
   [Background] Processing copy request...
   ✓ Data stored in chrome.storage
   ✓ Offscreen document created successfully
   ```

5. **Clipboard write**
   ```
   ✓ Multi-format data written to clipboard via offscreen document
   ✓ Data copied to clipboard via offscreen document
   ```

6. **Success response**
   ```
   [Copy] Received response from background: {success: true}
   ✓ Copied to clipboard
   [Clipboard Verify] Length: 12345
   [Clipboard Verify] ✓ Valid JSON, type: elementor-copier
   ```

7. **User notification**
   ```
   ✓ Element copied successfully!
   ```

### If Any Step is Missing

That's where the problem is!

## Next Steps

1. **Install v1.2.1** (with debug logging)
2. **Open both consoles** (content + background)
3. **Try copying** an element
4. **Check which step fails**
5. **Report back** with the logs

The debug logs will show exactly where the process breaks!

---

**Version:** 1.2.1 (Debug)
**Purpose:** Diagnose copy issues
**Status:** Ready for testing
