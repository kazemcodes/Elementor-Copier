# Elementor Copier - Extension Files

This directory contains the Chrome extension source code.

## File Structure

```
chrome-extension/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── content-v2.js             # Main content script
├── page-bridge.js            # Elementor API bridge
├── clipboard-manager.js      # Clipboard operations
├── paste-interceptor.js      # Paste event handling
├── editor-injector.js        # Elementor editor integration
├── elementor-format-converter.js  # Format conversion
├── elementor-editor-detector.js   # Editor detection
├── content-sanitizer.js      # Content security
├── media-url-handler.js      # Media URL processing
├── version-compatibility.js  # Version handling
├── notification-manager.js   # User notifications
├── error-handler.js          # Error management
├── offscreen.html/js         # Clipboard access
├── popup/                    # Extension popup UI
├── icons/                    # Extension icons
└── styles/                   # CSS styles
```

## Building for Production

1. Remove all console.log statements
2. Minify JavaScript files (optional)
3. Test thoroughly
4. Create ZIP file for Chrome Web Store

## Development

- All modules are loaded in MAIN world context for Elementor API access
- Content script runs in ISOLATED world for security
- Communication happens via window.postMessage

## Support

Bitcoin: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`
