# Paste Interceptor Guide

## Overview

The Paste Interceptor module captures paste operations in the Elementor editor and determines whether to handle them with extension data or allow native Elementor behavior.

## Features

✅ **Keyboard Paste Interception** - Captures Ctrl+V and Cmd+V  
✅ **Context Menu Integration** - Hooks into right-click paste  
✅ **Paste Button Override** - Intercepts Elementor's paste button  
✅ **API Hooking** - Wraps Elementor's internal paste methods  
✅ **React Compatibility** - Handles dynamic UI updates  
✅ **Version Fallbacks** - Supports different Elementor versions  

## Requirements Covered

- **7.1**: Keyboard event listeners for Ctrl+V and Cmd+V
- **7.2**: Check for extension clipboard data
- **7.3**: Prevent default paste when extension data detected
- **7.4**: Allow normal paste when no extension data
- **7.5**: Intercept context menu paste action
- **7.6**: Override paste button click handler
- **1.6**: Compatibility with React-based UI

## Usage

### Basic Initialization

```javascript
// Create instances
const clipboardManager = new ClipboardManager();
const elementorDetector = new ElementorEditorDetector();
const pasteInterceptor = new PasteInterceptor();

// Initialize
const success = pasteInterceptor.initialize(
  clipboardManager,
  elementorDetector
);

if (success) {
  console.log('✓ Paste interceptor ready');
}
```

### Full Initialization with UI Hooks

```javascript
// Initialize with all hooks (recommended)
const success = await pasteInterceptor.initializeWithUIHooks(
  clipboardManager,
  elementorDetector
);

// This will:
// 1. Set up keyboard listeners
// 2. Wait for Elementor UI to load
// 3. Hook context menu
// 4. Hook paste button
// 5. Hook Elementor's paste API
// 6. Enable React compatibility
```

### Listen for Paste Events

```javascript
// Listen for intercepted paste events
document.addEventListener('elementorCopierPaste', (event) => {
  const extensionData = event.detail.data;
  const originalEvent = event.detail.originalEvent;
  
  console.log('Extension paste triggered:', extensionData);
  
  // Handle the paste operation
  // (This will be done by the editor injector module)
});
```

## Architecture

### Paste Flow

```
User Paste Action (Ctrl+V)
         ↓
Paste Interceptor
         ↓
Check Clipboard (shouldHandlePaste)
         ↓
    ┌────┴────┐
    ↓         ↓
Extension   Native
  Data      Paste
    ↓         ↓
Prevent   Allow
Default   Default
    ↓
Dispatch Custom Event
    ↓
Editor Injector
```

### Hook Points

1. **Keyboard Events** - `document.addEventListener('keydown')`
2. **Context Menu** - `#elementor-panel` click events
3. **Paste Button** - Button click interception
4. **Elementor API** - `window.elementor.paste()` wrapper
5. **Clipboard Module** - `elementor.channels.clipboard` events

## Methods

### Core Methods

#### `initialize(clipboardManager, elementorDetector)`
Basic initialization with keyboard listeners only.

**Returns**: `boolean` - Success status

#### `initializeWithUIHooks(clipboardManager, elementorDetector)`
Full initialization including UI hooks (recommended).

**Returns**: `Promise<boolean>` - Success status

#### `shouldHandlePaste()`
Check if clipboard contains extension data.

**Returns**: `Promise<boolean>` - True if extension data present

#### `handleKeyboardPaste(event)`
Handle keyboard paste events (Ctrl+V, Cmd+V).

**Parameters**: 
- `event` - KeyboardEvent

#### `triggerExtensionPaste(event)`
Trigger custom paste with extension data.

**Parameters**:
- `event` - Original event

### Hook Methods

#### `interceptContextMenuPaste()`
Set up context menu paste interception.

**Returns**: `boolean` - Success status

#### `interceptElementorPasteButton()`
Set up paste button interception.

**Returns**: `boolean` - Success status

#### `hookElementorPasteAPI()`
Wrap Elementor's paste API method.

**Returns**: `boolean` - Success status

#### `hookElementorClipboardModule()`
Hook into Elementor's clipboard module.

**Returns**: `boolean` - Success status

### Utility Methods

#### `getStatus()`
Get current interceptor status.

**Returns**: `Object` with status information

#### `cleanup()`
Remove all event listeners and clean up.

## Testing

### Manual Testing

1. Open `test-paste-interceptor.html` in a browser
2. Click "Initialize Paste Interceptor"
3. Click "Copy Test Data to Clipboard"
4. Click in test area and press Ctrl+V
5. Verify custom paste event is triggered

### Integration Testing

```javascript
// Test in Elementor editor
const test = async () => {
  // Initialize
  const interceptor = new PasteInterceptor();
  await interceptor.initializeWithUIHooks(
    clipboardManager,
    elementorDetector
  );
  
  // Copy test data
  await clipboardManager.writeMultiFormat({
    type: 'elementor-copier',
    data: { /* ... */ }
  });
  
  // Simulate paste
  const event = new KeyboardEvent('keydown', {
    key: 'v',
    ctrlKey: true
  });
  document.dispatchEvent(event);
  
  // Verify custom event was dispatched
};
```

## Troubleshooting

### Paste Not Intercepted

**Problem**: Paste events are not being intercepted

**Solutions**:
1. Check if Elementor editor is detected: `elementorDetector.isElementorEditor()`
2. Verify clipboard has extension data: `clipboardManager.hasExtensionData()`
3. Check interceptor status: `pasteInterceptor.getStatus()`
4. Ensure initialization completed: `await initializeWithUIHooks()`

### Multiple Paste Events

**Problem**: Paste is triggered multiple times

**Solution**: The interceptor has built-in protection with `isProcessingPaste` flag

### React Components Not Hooked

**Problem**: Paste button doesn't work after UI update

**Solution**: React compatibility is enabled automatically with periodic checks every 2 seconds

### Elementor API Not Found

**Problem**: `window.elementor` is undefined

**Solutions**:
1. Wait for Elementor to load: `await waitForElementorUI()`
2. Check if in editor mode: `elementorDetector.isElementorEditor()`
3. Verify Elementor version: `elementorDetector.getElementorVersion()`

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

## Security Considerations

- All clipboard reads require user permission
- Event listeners use capture phase for priority
- No modification of Elementor's core code
- Graceful fallback to native paste

## Performance

- Minimal overhead: < 1ms per paste check
- Lazy initialization: Only loads when needed
- Efficient event delegation
- Automatic cleanup on page unload

## Future Enhancements

- [ ] Support for paste from external applications
- [ ] Paste preview before insertion
- [ ] Paste history management
- [ ] Keyboard shortcut customization
- [ ] Paste analytics and logging

## Related Modules

- **clipboard-manager.js** - Handles clipboard read/write
- **elementor-editor-detector.js** - Detects Elementor editor
- **editor-injector.js** - Injects paste data into editor
- **format-converter.js** - Converts data to native format

## API Reference

### Events

#### `elementorCopierPaste`
Dispatched when extension paste is triggered.

**Event Detail**:
```javascript
{
  data: Object,        // Extension clipboard data
  originalEvent: Event // Original paste event
}
```

### Configuration

```javascript
// Keyboard shortcuts (read-only)
PASTE_SHORTCUTS = {
  windows: { key: 'v', ctrl: true, meta: false },
  mac: { key: 'v', ctrl: false, meta: true }
}
```

## Support

For issues or questions:
1. Check console for error messages
2. Verify all dependencies are loaded
3. Test with `test-paste-interceptor.html`
4. Review requirements in design document

## Version History

- **1.0.0** - Initial implementation
  - Keyboard paste interception
  - Context menu integration
  - Paste button override
  - React compatibility
  - Version fallbacks
