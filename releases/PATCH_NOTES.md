# Elementor Copier v1.0.0 - Patch Notes

## Build Fix (October 15, 2025)

### Issue Fixed

**Error:** `Uncaught ReferenceError: window is not defined` in `background.js:381`

**Root Cause:**
- Service workers (Manifest V3 background scripts) don't have access to the `window` object
- The code was trying to attach a debug function to `window.elementorCopierGetErrorLog`
- This caused the extension to fail on load

### Changes Made

**File:** `chrome-extension/background.js`

**Before:**
```javascript
/**
 * Get error log (for debugging)
 */
window.elementorCopierGetErrorLog = function() {
  return errorLog;
};
```

**After:**
```javascript
/**
 * Get error log (for debugging)
 * Note: In service workers, we can't use window object
 * This function is available via chrome.runtime.getBackgroundPage() in MV2
 * or via message passing in MV3
 */
function getErrorLog() {
  return errorLog;
}
```

### Impact

- ✅ Extension now loads without errors
- ✅ Service worker compatible
- ✅ All functionality works correctly
- ✅ No breaking changes to user-facing features

### Testing

**Verified:**
- [x] Extension loads without console errors
- [x] Background service worker starts correctly
- [x] Context menu appears
- [x] Elementor detection works
- [x] Copy operations succeed
- [x] Clipboard integration works
- [x] Notifications appear

### Release Package

**Updated File:** `releases/elementor-copier-v1.0.0.zip`
**Size:** ~33 KB
**Status:** ✅ Ready for Chrome Web Store submission

### Notes for Developers

**Service Worker Limitations:**
- No `window` object
- No `document` object
- No DOM access
- No `localStorage` (use `chrome.storage` instead)
- No synchronous XMLHttpRequest

**Debugging in Service Workers:**
- Use `console.log()` for debugging
- View logs in: `chrome://extensions/` → Extension details → Service worker → Inspect
- Use `chrome.storage` for persistent data
- Use message passing to communicate with content scripts

### Verification Steps

To verify the fix:

1. Extract `releases/elementor-copier-v1.0.0.zip`
2. Load unpacked in Chrome
3. Open `chrome://extensions/`
4. Click "Service worker" link under extension
5. Check console - should be no errors
6. Test extension functionality

### Additional Information

**Related Documentation:**
- [Service Worker API](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)

**Support:**
- GitHub Issues: Report any problems
- Documentation: See README.md
- Testing Guide: chrome-extension/TESTING_GUIDE.md

---

**Version:** 1.0.0 (Fixed Build)
**Date:** October 15, 2025
**Status:** Ready for submission
