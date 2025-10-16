# Clipboard Manager - Quick Start Guide

## 🚀 Quick Start

### Installation
The clipboard manager is already integrated into the extension. No installation needed!

### Basic Usage

```javascript
// 1. Create instance
const clipboardManager = new ClipboardManager();

// 2. Write data to clipboard
await clipboardManager.writeMultiFormat({
  elType: 'widget',
  widgetType: 'heading',
  settings: { title: 'Hello World' }
});

// 3. Check if clipboard has extension data
if (await clipboardManager.hasExtensionData()) {
  // 4. Read the data
  const data = await clipboardManager.readExtensionData();
  console.log(data);
}
```

## 📋 Common Use Cases

### Use Case 1: Copy Element to Clipboard
```javascript
async function copyElement(elementData) {
  const clipboardManager = new ClipboardManager();
  
  try {
    await clipboardManager.writeMultiFormat(elementData);
    console.log('✓ Element copied to clipboard');
  } catch (error) {
    console.error('✗ Copy failed:', error);
  }
}
```

### Use Case 2: Detect Extension Data on Paste
```javascript
document.addEventListener('paste', async (event) => {
  const clipboardManager = new ClipboardManager();
  
  if (await clipboardManager.hasExtensionData()) {
    event.preventDefault();
    const data = await clipboardManager.readExtensionData();
    handleExtensionPaste(data);
  }
});
```

### Use Case 3: Clean Data Before Sending to Elementor
```javascript
async function pasteToElementor() {
  const clipboardManager = new ClipboardManager();
  const data = await clipboardManager.readExtensionData();
  
  if (data) {
    // Remove extension marker before passing to Elementor
    const cleanData = clipboardManager.removeExtensionMarker(data);
    elementor.paste(cleanData);
  }
}
```

## 🧪 Testing

Open `test-clipboard-manager.html` in Chrome and click "Run All Tests".

## 📚 Full Documentation

See `CLIPBOARD_MANAGER_GUIDE.md` for complete API reference and advanced usage.

## ⚠️ Requirements

- Chrome 109+
- HTTPS or localhost (for Clipboard API)
- Permissions: `clipboardWrite`, `clipboardRead`

## 🔧 Troubleshooting

**Problem:** "Clipboard API not available"  
**Solution:** Ensure page is HTTPS or localhost

**Problem:** "Permission denied"  
**Solution:** Check manifest.json has `clipboardRead` permission

**Problem:** Data not detected  
**Solution:** Verify data has extension marker using `hasExtensionMarker()`

## 📞 Support

See `CLIPBOARD_MANAGER_GUIDE.md` for detailed troubleshooting and examples.
