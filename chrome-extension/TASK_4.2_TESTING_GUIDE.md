# Task 4.2 Testing Guide
## Testing Elementor Paste Mechanism Hooks

### Quick Start

This guide helps you test the implementation of task 4.2, which adds hooks into Elementor's native paste mechanisms.

---

## Prerequisites

1. Chrome browser with the extension loaded
2. WordPress site with Elementor installed
3. Access to Elementor editor
4. Test content copied from another Elementor site

---

## Test Scenarios

### Test 1: Context Menu Paste Interception

**Objective:** Verify that right-click paste in Elementor editor is intercepted

**Steps:**
1. Copy an Elementor widget from any website using the extension
2. Open Elementor editor on your WordPress site
3. Right-click in the editor canvas
4. Select "Paste" from the context menu
5. Observe the console logs

**Expected Results:**
- ✅ Console shows: `[Paste Interceptor] Clipboard paste event detected`
- ✅ Console shows: `✓ Extension data detected, intercepting paste`
- ✅ Custom event `elementorCopierPaste` is dispatched
- ✅ Native Elementor paste is prevented

**Console Commands to Verify:**
```javascript
// Check if paste interceptor is initialized
window.__elementorCopierInstances?.pasteInterceptor?.getStatus()

// Should return:
// {
//   initialized: true,
//   isProcessingPaste: false,
//   handlersCount: > 0,
//   hasClipboardManager: true,
//   hasElementorDetector: true
// }
```

---

### Test 2: Paste Button Click Interception

**Objective:** Verify that clicking Elementor's paste button is intercepted

**Steps:**
1. Copy an Elementor widget using the extension
2. Open Elementor editor
3. Look for the paste button in the Elementor toolbar/panel
4. Click the paste button
5. Observe the console logs

**Expected Results:**
- ✅ Console shows: `✓ Paste button hooked`
- ✅ Click event is intercepted before Elementor processes it
- ✅ Extension paste is triggered if extension data is in clipboard
- ✅ Native paste proceeds if no extension data

**Console Commands to Verify:**
```javascript
// Check how many paste buttons are hooked
window.__elementorCopierInstances?.pasteInterceptor?.pasteHandlers.filter(
  h => h.event === 'click'
).length

// Should return a number > 0
```

---

### Test 3: React Compatibility

**Objective:** Verify that paste interception survives React re-renders

**Steps:**
1. Initialize paste interceptor in Elementor editor
2. Navigate between different Elementor panels (Style, Advanced, Content)
3. Switch between different widgets
4. Try pasting after each navigation
5. Wait 5 seconds and try pasting again

**Expected Results:**
- ✅ Paste interception works after panel navigation
- ✅ Console shows periodic re-attachment: `✓ React compatibility checks enabled`
- ✅ Listeners are re-attached every 2 seconds
- ✅ No errors about missing event handlers

**Console Commands to Verify:**
```javascript
// Check if React compatibility is running
// Wait 2 seconds and check handler count - it should remain stable
const initialCount = window.__elementorCopierInstances?.pasteInterceptor?.pasteHandlers.length;
setTimeout(() => {
  const newCount = window.__elementorCopierInstances?.pasteInterceptor?.pasteHandlers.length;
  console.log('Handler count stable:', initialCount === newCount);
}, 3000);
```

---

### Test 4: Version Fallback

**Objective:** Verify that different Elementor versions are handled correctly

**Steps:**
1. Test with Elementor 3.x (if available)
2. Test with Elementor 4.x (if available)
3. Check console for version detection messages
4. Verify paste interception works in both versions

**Expected Results:**
- ✅ Console shows: `✓ Version fallback configured for Elementor X.X.X`
- ✅ For v3.x+: `✓ React compatibility checks enabled`
- ✅ For older versions: `[Paste Interceptor] Legacy Elementor version detected`
- ✅ Paste interception works regardless of version

**Console Commands to Verify:**
```javascript
// Check detected Elementor version
window.__elementorCopierInstances?.editorDetector?.getElementorVersion()

// Check if version fallback was applied
// Look for console message about version configuration
```

---

### Test 5: Multiple Hook Strategies

**Objective:** Verify that all hook strategies are attempted

**Steps:**
1. Open Elementor editor
2. Wait for paste interceptor to initialize
3. Check console for hook setup messages
4. Verify multiple interception points are active

**Expected Results:**
- ✅ Console shows: `[Paste Interceptor] Comprehensive hooks setup:`
- ✅ Results object shows status of each hook:
  - `contextMenu: true/false`
  - `pasteButton: true/false`
  - `pasteAPI: true/false`
  - `clipboardModule: true/false`
- ✅ At least one hook strategy succeeds

**Console Commands to Verify:**
```javascript
// Manually trigger comprehensive hooks setup
window.__elementorCopierInstances?.pasteInterceptor?.setupComprehensiveHooks()

// Should return object with hook statuses
```

---

### Test 6: Keyboard Shortcut Integration

**Objective:** Verify that keyboard shortcuts (Ctrl+V/Cmd+V) still work alongside UI hooks

**Steps:**
1. Copy an Elementor widget using the extension
2. Open Elementor editor
3. Press Ctrl+V (or Cmd+V on Mac)
4. Verify paste is intercepted
5. Try context menu paste
6. Try paste button

**Expected Results:**
- ✅ All three paste methods are intercepted
- ✅ No conflicts between keyboard and UI interception
- ✅ Only one paste operation is triggered per action

---

## Debugging Commands

### Check Initialization Status
```javascript
// Check if all modules are loaded
console.log('Editor Detector:', !!window.ElementorEditorDetector);
console.log('Clipboard Manager:', !!window.ClipboardManager);
console.log('Paste Interceptor:', !!window.PasteInterceptor);

// Check if instances are created
console.log('Instances:', window.__elementorCopierInstances);
```

### Check Paste Interceptor Status
```javascript
const interceptor = window.__elementorCopierInstances?.pasteInterceptor;
if (interceptor) {
  console.log('Status:', interceptor.getStatus());
  console.log('Handlers:', interceptor.pasteHandlers.length);
  console.log('Initialized:', interceptor.initialized);
}
```

### Check Elementor Detection
```javascript
const detector = window.__elementorCopierInstances?.editorDetector;
if (detector) {
  console.log('Is Editor:', detector.isElementorEditor());
  console.log('Version:', detector.getElementorVersion());
}
```

### Check Clipboard Data
```javascript
const clipboardMgr = window.__elementorCopierInstances?.clipboardManager;
if (clipboardMgr) {
  clipboardMgr.hasExtensionData().then(has => {
    console.log('Has Extension Data:', has);
  });
}
```

### Manually Trigger Paste
```javascript
// Simulate extension paste
const interceptor = window.__elementorCopierInstances?.pasteInterceptor;
if (interceptor) {
  interceptor.triggerExtensionPaste(new KeyboardEvent('keydown'));
}
```

---

## Common Issues and Solutions

### Issue 1: Paste Interceptor Not Initializing

**Symptoms:**
- No console messages about paste interceptor
- `window.__elementorCopierInstances` is undefined

**Solutions:**
1. Check if you're in Elementor editor (not preview mode)
2. Verify manifest.json includes paste-interceptor.js in web_accessible_resources
3. Check browser console for script loading errors
4. Reload the page

**Verification:**
```javascript
// Check if scripts are loaded
console.log('Scripts loaded:', {
  detector: !!window.ElementorEditorDetector,
  clipboard: !!window.ClipboardManager,
  interceptor: !!window.PasteInterceptor
});
```

---

### Issue 2: Paste Not Being Intercepted

**Symptoms:**
- Native Elementor paste happens instead of extension paste
- No console messages about interception

**Solutions:**
1. Verify extension data is in clipboard
2. Check if paste interceptor is initialized
3. Verify event listeners are attached
4. Check for JavaScript errors

**Verification:**
```javascript
// Check if clipboard has extension data
window.__elementorCopierInstances?.clipboardManager?.hasExtensionData()
  .then(has => console.log('Has extension data:', has));

// Check handler count
console.log('Handlers:', 
  window.__elementorCopierInstances?.pasteInterceptor?.pasteHandlers.length
);
```

---

### Issue 3: React Re-renders Breaking Interception

**Symptoms:**
- Paste works initially but stops after navigating panels
- Handler count decreases over time

**Solutions:**
1. Verify React compatibility is enabled
2. Check if periodic re-attachment is running
3. Manually trigger hook setup

**Verification:**
```javascript
// Manually re-setup hooks
window.__elementorCopierInstances?.pasteInterceptor?.setupComprehensiveHooks();

// Check if React compatibility is enabled
// Should see periodic console messages every 2 seconds
```

---

### Issue 4: Multiple Paste Operations Triggered

**Symptoms:**
- One paste action triggers multiple paste operations
- Console shows duplicate interception messages

**Solutions:**
1. Check if `isProcessingPaste` flag is working
2. Verify event.stopImmediatePropagation() is called
3. Check for duplicate event listeners

**Verification:**
```javascript
// Check processing state
console.log('Is Processing:', 
  window.__elementorCopierInstances?.pasteInterceptor?.isProcessingPaste
);

// Should be false when not pasting
```

---

## Performance Testing

### Memory Leak Check
```javascript
// Check handler count over time
setInterval(() => {
  const count = window.__elementorCopierInstances?.pasteInterceptor?.pasteHandlers.length;
  console.log('Handler count:', count);
}, 5000);

// Handler count should remain stable (not continuously increasing)
```

### Event Listener Cleanup
```javascript
// Cleanup and verify
const interceptor = window.__elementorCopierInstances?.pasteInterceptor;
if (interceptor) {
  const beforeCount = interceptor.pasteHandlers.length;
  interceptor.cleanup();
  const afterCount = interceptor.pasteHandlers.length;
  console.log('Cleanup successful:', afterCount === 0);
}
```

---

## Success Criteria

Task 4.2 is successfully implemented if:

- ✅ Context menu paste is intercepted when extension data is present
- ✅ Paste button clicks are intercepted when extension data is present
- ✅ Interception survives React component re-renders
- ✅ Works with both Elementor 3.x and 4.x
- ✅ Multiple hook strategies provide fallback coverage
- ✅ No memory leaks or performance issues
- ✅ Proper cleanup when page unloads
- ✅ Clear console logging for debugging

---

## Next Steps After Testing

Once all tests pass:

1. Mark task 4.2 as complete ✅
2. Document any issues found
3. Proceed to task 5: Create editor context injector
4. Begin integration testing with complete workflow

---

## Additional Resources

- **Implementation Summary:** `TASK_4.2_IMPLEMENTATION_SUMMARY.md`
- **Verification Document:** `test-task-4.2-verification.html`
- **Source Code:** `paste-interceptor.js`
- **Requirements:** `.kiro/specs/native-elementor-paste/requirements.md`
- **Design:** `.kiro/specs/native-elementor-paste/design.md`
