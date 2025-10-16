# Installation Guide

## Quick Start

### Installation from GitHub Releases

1. **Download the Extension**
   - Go to [GitHub Releases](https://github.com/kazemcodes/elementor-copy/releases)
   - Download the latest `elementor-copier-v1.0.0.zip` file
   - Extract it to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Navigate to and select the extracted `chrome-extension` folder
   - Click "Select Folder"

3. **Verify Installation**
   - You should see "Elementor Copier" in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - Status should show "Enabled"

4. **Grant Permissions** (if prompted)
   - The extension needs clipboard access to function
   - Click "Allow" when Chrome asks for permissions

## Usage

### Copying Content

**Method 1: Visual Selector (Recommended)**
1. Go to any WordPress page with Elementor content (frontend view)
2. Right-click anywhere → "Elementor Copier" → "Enable Highlight Mode"
3. Elementor elements will be highlighted with green outlines
4. Click on any section, column, or widget to copy it
5. You'll see a success message when copied

**Method 2: Context Menu**
1. Go to any WordPress page with Elementor content
2. Right-click directly on an Elementor section
3. Select "Elementor Copier" → "Copy Section"

**Method 3: Keyboard Shortcut**
1. Press `Ctrl+Shift+C` to enable element selector
2. Hover over elements to see highlights
3. Click to copy

### Pasting Content
1. Go to your target WordPress site
2. Open the Elementor editor (edit mode, not preview)
3. Click somewhere in the editor to give it focus
4. Press `Ctrl+V` (or `Cmd+V` on Mac)
5. The section will be pasted automatically!

**Important**: Paste only works in Elementor **edit mode**, not on the frontend or preview mode.

## Troubleshooting

### Extension not appearing?
- Make sure it's enabled in `chrome://extensions/`
- Try reloading the extension
- Restart Chrome

### Copy not working?
- Make sure you're in the Elementor editor
- Try right-clicking directly on the section
- Check browser console for errors (F12)

### Paste not working?
- Make sure you copied a section first
- **Reload the extension**: Go to `chrome://extensions/` and click the reload button
- Refresh the Elementor editor page (F5)
- Open browser console (F12) and look for: `✅ [Paste Interceptor] Paste functionality is ready!`
- If you don't see that message, the paste interceptor didn't initialize
- Make sure you're in **edit mode**, not preview mode
- Click in the editor before pasting to ensure focus
- Try pressing Ctrl+V again

## System Requirements

- **Browser**: Google Chrome 109 or higher (for Manifest V3 and Offscreen API)
- **WordPress**: 5.0 or higher
- **Elementor**: 3.0 or higher (tested with 3.31.4)
- **Permissions**: Clipboard access (granted automatically)
- **Internet**: Active connection required for cross-site copying

## Permissions Explained

The extension requires these permissions:
- **clipboardWrite/Read**: To copy and paste Elementor data
- **storage**: To store clipboard data as backup
- **notifications**: To show success/error messages
- **offscreen**: For secure clipboard access in Manifest V3
- **activeTab**: To detect Elementor on current page
- **contextMenus**: For right-click menu options

All operations happen locally in your browser. No data is sent to external servers.

## Support

Need help? 
- [Report an issue](https://github.com/kazemcodes/elementor-copy/issues)
- [Read the FAQ](README.md#troubleshooting)
- [View troubleshooting guide](TROUBLESHOOTING.md)

## Donate

Support development:
**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`
