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

1. Run the build script: `.\build-extension.ps1`
2. The extension will be packaged in the `releases/` folder
3. Test thoroughly before releasing
4. Create a GitHub release with the generated ZIP file

## Development

- All modules are loaded in MAIN world context for Elementor API access
- Content script runs in ISOLATED world for security
- Communication happens via window.postMessage

## Installation

This extension is distributed through GitHub Releases only. Download the latest release from:
https://github.com/kazemcodes/elementor-copy/releases

## Support

Bitcoin: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`
