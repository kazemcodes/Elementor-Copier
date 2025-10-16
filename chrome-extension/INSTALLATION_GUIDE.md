# Installation Guide - Elementor Copier Extension

## Prerequisites
- Google Chrome, Microsoft Edge, or Brave browser
- Access to WordPress sites with Elementor

## Installation Steps

### 1. Prepare the Extension Files

Make sure you have all the extension files in the `chrome-extension` folder:
- `manifest.json`
- `background.js`
- `content.js`
- `offscreen.js`
- `offscreen.html`
- All module files (`.js` files)
- `popup/` folder
- `icons/` folder
- `styles/` folder

### 2. Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Type `chrome://extensions` in the address bar
   - Or go to Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner
   - This allows you to load unpacked extensions

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to your `chrome-extension` folder
   - Select the folder and click "Select Folder"

4. **Verify Installation:**
   - You should see "Elementor Copier" in your extensions list
   - Make sure it's enabled (toggle switch is blue)
   - You should see the extension icon in your browser toolbar

### 3. Grant Permissions

When you first use the extension, Chrome may ask for permissions:
- ✓ Allow "Read and change all your data on all websites"
- ✓ Allow "Modify data you copy and paste"
- ✓ Allow "Display notifications"

These are required for the extension to work.

### 4. Test the Extension

#### Test Copy Function:

1. Go to any WordPress site with Elementor (e.g., a demo site)
2. Right-click on any Elementor widget
3. You should see "Copy Widget" in the context menu
4. Click it - you should see a success message
5. Open Notepad and paste (Ctrl+V) - you should see JSON data

#### Test Paste Function:

1. Go to YOUR WordPress site
2. Open a page in Elementor editor (Edit with Elementor)
3. Wait for the editor to fully load
4. Click on a section or column
5. Press Ctrl+V (or Cmd+V on Mac)
6. The widget should appear in the editor

## Troubleshooting Installation

### Extension Not Showing Up

**Problem:** Extension doesn't appear in chrome://extensions

**Solution:**
- Make sure you selected the correct folder (the one with manifest.json)
- Check that manifest.json is valid JSON (no syntax errors)
- Try reloading: click the refresh icon on the extension card

### Extension Shows Errors

**Problem:** Red error messages in chrome://extensions

**Solution:**
1. Click "Errors" to see details
2. Common issues:
   - Missing files: Make sure all files are present
   - Invalid manifest: Check manifest.json syntax
   - File permissions: Make sure files are readable

### Extension Icon Not Visible

**Problem:** Can't see extension icon in toolbar

**Solution:**
- Click the puzzle piece icon in Chrome toolbar
- Find "Elementor Copier"
- Click the pin icon to pin it to toolbar

### Context Menu Not Appearing

**Problem:** Right-click doesn't show "Copy Widget" option

**Solution:**
1. Refresh the page (Ctrl+R)
2. Check if extension is enabled in chrome://extensions
3. Make sure you're right-clicking on an Elementor element
4. Check browser console (F12) for errors

## Verifying Installation

### Method 1: Check Extension Page
1. Go to `chrome://extensions`
2. Find "Elementor Copier"
3. Should show:
   - ✓ Enabled
   - ✓ Version 1.0.0
   - ✓ No errors

### Method 2: Check on Elementor Page
1. Go to any Elementor page
2. Open browser console (F12)
3. You should see:
   ```
   Elementor Copier: Content script loaded
   ✓ Format converter loaded
   ✓ Elementor editor detector loaded
   ✓ Clipboard manager loaded
   ✓ Paste interceptor loaded
   ```

### Method 3: Test Context Menu
1. Go to any Elementor page
2. Right-click anywhere
3. You should see "Elementor Copier" submenu with:
   - Copy Widget
   - Copy Section
   - Copy Column
   - Copy Page
   - Toggle Highlight Mode

## Running Diagnostic Tool

**IMPORTANT:** The diagnostic tool must be run AFTER installing the extension and WHILE on an Elementor page.

### Correct Way to Use Diagnostic Tool:

1. **Install the extension first** (steps above)
2. **Go to an Elementor editor page** (your WordPress site)
3. **Open the diagnostic tool:**
   - Option A: Create a bookmark with this URL:
     ```
     chrome-extension://[YOUR-EXTENSION-ID]/diagnose-paste-issue.html
     ```
   - Option B: Open it from the extension popup
   - Option C: Navigate to it in a new tab after getting the extension ID

4. **Get your extension ID:**
   - Go to `chrome://extensions`
   - Find "Elementor Copier"
   - Copy the ID (long string of letters)
   - Replace `[YOUR-EXTENSION-ID]` in the URL above

### Wrong Way (What You Did):
❌ Opening `diagnose-paste-issue.html` directly from file system
❌ Running diagnostic before installing extension
❌ Running diagnostic on non-Elementor pages

## Next Steps After Installation

1. **Test Copy:**
   - Go to any Elementor site
   - Copy a simple widget (heading or text)
   - Verify success message appears

2. **Test Paste:**
   - Go to your WordPress site
   - Open Elementor editor
   - Paste the widget (Ctrl+V)
   - Verify widget appears

3. **If Issues Persist:**
   - Run diagnostic tool (correct way, as described above)
   - Check browser console for errors
   - Review PASTE_TROUBLESHOOTING.md

## Common Installation Mistakes

1. ❌ Opening HTML files directly instead of installing as extension
2. ❌ Not enabling Developer Mode
3. ❌ Selecting wrong folder (parent folder instead of chrome-extension)
4. ❌ Not granting required permissions
5. ❌ Testing on non-Elementor pages
6. ❌ Not refreshing pages after installation

## Uninstalling

If you need to uninstall:
1. Go to `chrome://extensions`
2. Find "Elementor Copier"
3. Click "Remove"
4. Confirm removal

## Updating

To update the extension after making changes:
1. Go to `chrome://extensions`
2. Find "Elementor Copier"
3. Click the refresh icon (circular arrow)
4. Refresh any open Elementor pages

## Support

If you're still having issues after following this guide:
1. Make sure you completed ALL installation steps
2. Check that you're testing on an actual Elementor page
3. Review the error messages in chrome://extensions
4. Check browser console (F12) for errors
5. Run the diagnostic tool (correct way) and share results
