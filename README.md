# Elementor Copier - Chrome Extension

> Copy and paste Elementor sections across different WordPress sites with ease!

[![GitHub Release](https://img.shields.io/github/v/release/kazemcodes/elementor-copy?logo=github)](https://github.com/kazemcodes/elementor-copy/releases)
[![GitHub](https://img.shields.io/badge/GitHub-kazemcodes%2Felementor--copy-181717?logo=github)](https://github.com/kazemcodes/elementor-copy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Support](https://img.shields.io/badge/Support-Bitcoin-orange?logo=bitcoin)](https://blockchain.com/btc/address/bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm)

## ✨ Features

### 🎯 Chrome DevTools-Style Element Selector
- **Multi-layer visual overlay** (content, padding, margin) just like Chrome DevTools
- **Smart element detection** with automatic hierarchy awareness
- **Real-time tooltips** showing element type, ID, dimensions, and child count
- **Keyboard navigation** with arrow keys for precise selection
- **Smooth animations** and professional visual feedback

### ⌨️ Powerful Keyboard Shortcuts
- `Ctrl+Shift+C` - Enable element selector
- `Alt+C` - Quick copy hovered element
- `↑`/`↓` - Navigate parent/child elements
- `ESC` - Cancel selection
- `Ctrl+V` - Paste element

### 🚀 Advanced Capabilities
- **Cross-Site Copy & Paste**: Copy elements between different WordPress sites
- **Smart Widget Conversion**: Auto-converts custom widgets to HTML when needed
- **Media Preservation**: Maintains all images and media URLs
- **Complete Data Extraction**: Copies all settings, styling, and responsive configurations
- **Version Compatibility**: Works with different Elementor versions
- **Content Sanitization**: Secure clipboard operations with XSS protection
- **Multiple Copy Methods**: Context menu, keyboard shortcuts, or quick copy

## 🚀 Installation

### From GitHub Releases (Recommended)
1. Download the latest `elementor-copier-v*.zip` from [GitHub Releases](https://github.com/kazemcodes/elementor-copy/releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the extracted `chrome-extension` folder
7. The extension icon should appear in your toolbar

### Building from Source
```bash
git clone https://github.com/kazemcodes/elementor-copy.git
cd elementor-copy
# Run the build script
.\build-extension.ps1
# Load the chrome-extension folder in Chrome as unpacked extension
```

## 📖 How to Use

### Quick Start (30 seconds)
1. Open any Elementor editor
2. Press **Ctrl+Shift+C** to enable element selector
3. Click on any element to copy it
4. Go to another Elementor editor
5. Press **Ctrl+V** to paste

### Alternative Methods

**Method 1: Keyboard Selector (Recommended)**
- Press `Ctrl+Shift+C` to enable Chrome DevTools-style selector
- Hover over elements to see visual highlights
- Use `↑`/`↓` arrow keys to navigate element hierarchy
- Click to copy the selected element

**Method 2: Context Menu**
- Right-click on any Elementor element
- Select "Copy Elementor Section" from context menu
- Paste with `Ctrl+V` in target editor

**Method 3: Quick Copy**
- Hover over any element
- Press `Alt+C` to instantly copy it

## 📚 Documentation

- **[📘 Complete User Guide](USER_GUIDE.md)** - Comprehensive documentation with tutorials
- **[⚡ Quick Reference Card](QUICK_REFERENCE.md)** - Essential shortcuts and commands
- **[🚀 Installation Guide](INSTALLATION.md)** - Detailed installation instructions
- **[📝 Changelog](CHANGELOG.md)** - Version history and updates
- **[🎨 Features Overview](FEATURES_v1.0.0.md)** - All features explained
- **[🚀 GitHub Distribution](GITHUB_DISTRIBUTION.md)** - How releases work

## 🎯 Key Capabilities

### Custom Widget Handling
When you copy content with custom widgets (like Slider Revolution or WoodMart widgets) that don't exist on the target site, the extension automatically:
- Detects the missing widget type
- Converts it to an HTML widget
- Preserves the visual appearance using the rendered content
- Adds a CSS class for easy identification

### Supported Elements
- ✅ Sections
- ✅ Columns
- ✅ All standard Elementor widgets
- ✅ Custom third-party widgets (converted to HTML)
- ✅ Images and media
- ✅ Styling and settings
- ✅ Responsive settings

## 🛠️ Technical Details

### Architecture
- **Content Script**: Detects Elementor and handles copy operations
- **Background Service**: Manages clipboard operations
- **Page Bridge**: Communicates with Elementor's internal API
- **Format Converter**: Converts between extension and Elementor formats
- **Paste Interceptor**: Captures paste events and injects content

### Security
- Content sanitization removes potentially harmful scripts
- No data is sent to external servers
- All operations happen locally in your browser

## 💖 Support the Project

If you find this extension helpful, consider supporting its development:

**Bitcoin (BTC)**
```
bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm
```

Your support helps maintain and improve this extension!

## 🐛 Troubleshooting

### Extension not working?
1. Make sure you're in the Elementor editor (not the frontend)
2. Refresh the page after installing the extension
3. Check that the extension is enabled in `chrome://extensions/`
4. Reload the extension after any updates

### Copy not working?
1. Enable highlight mode: Right-click → Elementor Copier → Enable Highlight Mode
2. Make sure you're clicking on an Elementor element (sections, columns, or widgets)
3. Check browser console (F12) for error messages
4. Verify clipboard permissions are granted

### Paste not working?
1. Make sure you copied an Elementor section first
2. Verify you're in Elementor **edit mode** (not preview mode)
3. Reload the extension: Go to `chrome://extensions/` and click reload
4. Refresh the Elementor editor page
5. Check browser console (F12) for initialization messages:
   - Should see: `✅ [Paste Interceptor] Paste functionality is ready!`
6. Make sure the browser window is focused when pasting

### Clipboard Issues?
1. Check browser clipboard permissions
2. Try copying again
3. Verify the data in console: `navigator.clipboard.readText().then(console.log)`
4. Should see JSON with `__ELEMENTOR_COPIER_DATA__` marker

### Custom widgets not appearing correctly?
- This is expected! Custom widgets are converted to HTML widgets
- The visual appearance is preserved, but you won't be able to edit them as the original widget type
- Install the required plugin on the target site for full functionality

For more help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [open an issue](https://github.com/kazemcodes/elementor-copy/issues).

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Copy Elementor sections, columns, and widgets
- ✅ Paste functionality with Ctrl+V / Cmd+V
- ✅ Chrome DevTools-style element selector
- ✅ Custom widget conversion to HTML
- ✅ Visual highlighting with multi-layer overlay
- ✅ Cross-site compatibility
- ✅ Media URL preservation
- ✅ Keyboard shortcuts (Ctrl+Shift+C, Alt+C)
- ✅ Context menu integration
- ✅ Clipboard manager with extension marker
- ✅ Offscreen document for clipboard access
- ✅ Content sanitization and security

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### For Developers

This extension is distributed through GitHub Releases only. When you push changes to the `main` branch that affect the `chrome-extension/` folder, a GitHub Actions workflow automatically:
- Builds the extension
- Creates a new release based on the version in `manifest.json`
- Uploads the packaged ZIP file

**Getting Started:**
- [First Release Guide](FIRST_RELEASE.md) - Create your first release
- [GitHub Distribution](GITHUB_DISTRIBUTION.md) - How releases work
- [Workflow Guide](.github/WORKFLOW_GUIDE.md) - GitHub Actions details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Elementor community
- Inspired by the need for easier content migration
- Thanks to all contributors and supporters!

---

**Made with ❤️ for the WordPress & Elementor community**

[Report Bug](https://github.com/kazemcodes/elementor-copy/issues) · [Request Feature](https://github.com/kazemcodes/elementor-copy/issues) · [Donate Bitcoin](https://blockchain.com/btc/address/bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm)
