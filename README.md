# Elementor Copier - Chrome Extension

> Copy and paste Elementor sections across different WordPress sites with ease!

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Support](https://img.shields.io/badge/Support-Bitcoin-orange?logo=bitcoin)](https://blockchain.com/btc/address/bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm)

## ✨ Features

- **Cross-Site Copy & Paste**: Copy Elementor sections from one WordPress site and paste them into another
- **Smart Widget Conversion**: Automatically converts custom widgets (Slider Revolution, WoodMart, etc.) to HTML widgets when the plugin isn't installed on the target site
- **Visual Highlighting**: Hover over Elementor sections to highlight them before copying
- **Media Preservation**: Maintains all images and media URLs from the source site
- **Version Compatibility**: Handles different Elementor versions seamlessly
- **Content Sanitization**: Removes potentially harmful scripts while preserving styling
- **One-Click Copy**: Simple right-click context menu integration

## 🚀 Installation

### From Chrome Web Store (Recommended)
1. Visit the [Chrome Web Store](#) (coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation
1. Download the latest release from [Releases](../../releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the extracted `chrome-extension` folder

## 📖 How to Use

### Copying Content
1. Navigate to any WordPress site with Elementor
2. Open the Elementor editor
3. **Right-click** on any section you want to copy
4. Select **"Copy Elementor Section"** from the context menu
5. The section data is now in your clipboard!

### Pasting Content
1. Navigate to your target WordPress site
2. Open the Elementor editor
3. Press **Ctrl+V** (or Cmd+V on Mac) anywhere in the editor
4. The section will be automatically pasted with all its content!

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

### Paste not working?
1. Make sure you copied an Elementor section first
2. Try refreshing the Elementor editor page
3. Check the browser console for any errors (F12)

### Custom widgets not appearing correctly?
- This is expected! Custom widgets are converted to HTML widgets
- The visual appearance is preserved, but you won't be able to edit them as the original widget type
- Install the required plugin on the target site for full functionality

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- Copy and paste Elementor sections
- Custom widget conversion to HTML
- Visual highlighting
- Cross-site compatibility
- Media URL preservation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Elementor community
- Inspired by the need for easier content migration
- Thanks to all contributors and supporters!

---

**Made with ❤️ for the WordPress & Elementor community**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Donate Bitcoin](https://blockchain.com/btc/address/bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm)
