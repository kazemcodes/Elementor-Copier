# Paste Interceptor Quick Reference

## 🎯 Purpose

The Paste Interceptor module captures paste operations in the Elementor editor and checks if the clipboard contains data from the Chrome extension. When detected, it prevents the default paste behavior and prepares the data for injection into Elementor.

## 📦 Module: `paste-interceptor.js`

### Class: `PasteInterceptor`

#### Methods

##### `initialize(clipboardManager, editorDetector)`
Initializes the paste interceptor with required dependencies.

**Parameters:**
- `clipboardManager` - Instance of ClipboardManager
- `editorDetector` - Instance of ElementorEditorDetector

**Returns:** `Promise<boolean>` - Success status

**Example:**
```javascript
const pasteInterceptor = new PasteInterceptor();
const success = await pasteInterceptor.initialize(clipboardManager, editorDetector);
```

##### `shouldHandlePaste()`
Checks if the paste operation should be handled by the extension.

**Returns:** `Promise<boolean>` - True if extension should handle paste

**Logic:**
1. Checks if in preview mode (returns false)
2. Checks if clipboard contains extension data
3. Returns true only if extension data is present

**Example:**
```javascript
const shouldHandle = await pasteInterceptor.shouldHandlePaste();
if (shouldHandle) {
  // Handle paste with extension data
}
```

##### `handleKeyboardPaste(event)`
Handles keyboard paste events (Ctrl+V / Cmd+V).

**Parameters:**
- `event` - KeyboardEvent object

**Behavior:**
1. Detects paste shortcuts (Ctrl+V or Cmd+V)
2. Checks if extension data is in clipboard
3. Prevents default if extension data found
4. Triggers extension paste operation

##### `cleanup()`
Removes event listeners and cleans up resources.

**Example:**
```javascript
pasteInterceptor.cleanup();
```

## 🔑 Key Features

### 1. Keyboard Shortcut Detection

Detects both Windows/Linux and Mac paste shortcuts:
- **Windows/Linux:** `Ctrl + V`
- **Mac:** `Cmd + V`

### 2. Multi-Context Listening

Attaches listeners to:
- Main document
- Elementor editor iframe (if accessible)

### 3. Smart Interception

Only intercepts when:
- ✅ Extension data is in clipboard
- ✅ Not in preview mode
- ✅ In Elementor editor

### 4. User Feedback

Provides visual notifications:
- **Success:** Green notification with element type
- **Error:** Red notification with error message
- **Duration:** 5 seconds with fade-out animation

## 🔄 Integration Flow

```
User presses Ctrl+V
    ↓
handleKeyboardPaste() triggered
    ↓
shouldHandlePaste() checks clipboard
    ↓
Extension data found?
    ↓ Yes                    ↓ No
event.preventDefault()    Allow default paste
    ↓
triggerExtensionPaste()
    ↓
Show notification
```

## 🧪 Testing

### Manual Testing

1. **Setup:**
   ```javascript
   // In browser console
   const clipboardManager = new ClipboardManager();
   const editorDetector = new ElementorEditorDetector();
   const pasteInterceptor = new PasteInterceptor();
   await pasteInterceptor.initialize(clipboardManager, editorDetector);
   ```

2. **Test Paste Interception:**
   ```javascript
   // Add test data to clipboard
   const testData = {
     version: '1.0.0',
     type: 'elementor-copier',
     elementType: 'widget',
     data: { /* ... */ }
   };
   await clipboardManager.writeMultiFormat(testData);
   
   // Now press Ctrl+V in the page
   // Should see notification and interception
   ```

3. **Test shouldHandlePaste():**
   ```javascript
   // With extension data
   const shouldHandle = await pasteInterceptor.shouldHandlePaste();
   console.log(shouldHandle); // Should be true
   
   // Clear clipboard
   await navigator.clipboard.writeText('');
   const shouldHandleEmpty = await pasteInterceptor.shouldHandlePaste();
   console.log(shouldHandleEmpty); // Should be false
   ```

### Automated Testing

Use `test-paste-interceptor.html`:
1. Open file in browser
2. Run automated tests
3. Check console log for results

## 🐛 Debugging

### Enable Debug Logging

All operations are logged to console with prefixes:
- `[Paste Interceptor]` - General operations
- `✓` - Success operations
- `✗` - Failed operations

### Common Issues

**Issue:** Paste not intercepted
- **Check:** Is Elementor editor detected?
- **Check:** Is extension data in clipboard?
- **Check:** Are listeners attached?

**Issue:** Listeners not working
- **Check:** Is initialization successful?
- **Check:** Are dependencies loaded?
- **Check:** Check browser console for errors

**Issue:** Iframe not accessible
- **Expected:** Cross-origin iframes cannot be accessed
- **Solution:** Main document listeners will still work

## 📊 Status Indicators

### Console Messages

| Message | Meaning |
|---------|---------|
| `✓ Paste interceptor initialized` | Successfully initialized |
| `✓ Keyboard paste listeners attached` | Listeners active |
| `✓ Editor iframe paste listeners attached` | Iframe listeners active |
| `[Paste Interceptor] Paste shortcut detected` | Paste key pressed |
| `✓ Paste event intercepted` | Successfully intercepted |
| `[Paste Interceptor] No extension data` | Normal paste allowed |

## 🔗 Dependencies

### Required Modules
- `clipboard-manager.js` - For clipboard operations
- `elementor-editor-detector.js` - For editor detection

### Browser APIs
- `navigator.clipboard` - Clipboard API
- `KeyboardEvent` - Keyboard event handling
- `document.addEventListener` - Event listening

## 📝 Notes

### Current Limitations

1. **No Actual Injection:** Task 4.1 only intercepts paste events. Actual data injection will be implemented in Task 5 (Editor Context Injector).

2. **No UI Hooks:** Context menu and paste button interception will be added in Task 4.2.

3. **No Format Conversion:** Data format conversion happens in Task 2 (Format Converter).

### Future Enhancements (Task 4.2)

- Context menu paste interception
- Elementor paste button override
- React component compatibility
- `initializeWithUIHooks()` method

## 🎓 Code Examples

### Basic Usage

```javascript
// Initialize
const clipboardManager = new ClipboardManager();
const editorDetector = new ElementorEditorDetector();
const pasteInterceptor = new PasteInterceptor();

await pasteInterceptor.initialize(clipboardManager, editorDetector);

// Paste interception is now active
// Press Ctrl+V to test
```

### Check Clipboard Before Paste

```javascript
// Check if we should handle paste
const shouldHandle = await pasteInterceptor.shouldHandlePaste();

if (shouldHandle) {
  console.log('Extension will handle this paste');
} else {
  console.log('Normal paste will proceed');
}
```

### Cleanup

```javascript
// When done, cleanup
pasteInterceptor.cleanup();
```

## 🚀 Quick Start

1. **Load the module:**
   ```html
   <script src="paste-interceptor.js"></script>
   ```

2. **Initialize:**
   ```javascript
   const pasteInterceptor = new PasteInterceptor();
   await pasteInterceptor.initialize(clipboardManager, editorDetector);
   ```

3. **Test:**
   - Add extension data to clipboard
   - Press Ctrl+V
   - See notification

That's it! The paste interceptor is now monitoring for paste operations.
