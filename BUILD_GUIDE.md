# 🔨 Build Guide - Elementor Copier

## Quick Build

### Single Command
```powershell
.\build-extension.ps1
```

This will:
1. ✅ Copy all extension files to a build directory
2. ✅ Create ZIP file: `elementor-copier-v1.0.0.zip`
3. ✅ Move ZIP to `releases/` folder
4. ✅ Remove old extracted folder (if exists)
5. ✅ Extract ZIP to `releases/elementor-copier-v1.0.0/`
6. ✅ Clean up temporary build directory

### Output Structure
```
releases/
├── elementor-copier-v1.0.0.zip          # For GitHub Release
└── elementor-copier-v1.0.0/             # For local testing
    ├── manifest.json
    ├── background.js
    ├── content-v2.js
    ├── icons/
    ├── popup/
    └── ... (all extension files)
```

## Verify Build

### Check Release Package
```powershell
.\verify-release.ps1
```

This will:
1. ✅ Check if ZIP exists
2. ✅ Check if extracted folder exists
3. ✅ Verify all required files are present
4. ✅ Display manifest information
5. ✅ Confirm package is valid

### Expected Output
```
Verifying Elementor Copier Release...

Checking required files...
  OK: manifest.json
  OK: background.js
  OK: content-v2.js
  OK: offscreen.html
  OK: offscreen.js
  OK: icons/icon16.png
  OK: icons/icon48.png
  OK: icons/icon128.png
  OK: popup/popup.html

Manifest Info:
  Name: Elementor Copier
  Version: 1.0.0
  Manifest Version: 3

Release package is VALID!
  ZIP: releases/elementor-copier-v1.0.0.zip
  Extracted: releases/elementor-copier-v1.0.0

Ready for installation and GitHub Release!
```

## Development Workflow

### 1. Make Changes
Edit files in `chrome-extension/` folder:
- `content-v2.js` - Main content script
- `background.js` - Background service worker
- `popup/` - Extension popup UI
- `styles/` - CSS styles
- etc.

### 2. Build
```powershell
.\build-extension.ps1
```

### 3. Verify
```powershell
.\verify-release.ps1
```

### 4. Test Locally
Load the extracted folder in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `releases/elementor-copier-v1.0.0/` folder

### 5. Test Changes
1. Navigate to an Elementor page
2. Test your changes
3. Check console for logs (F12)
4. Verify functionality

### 6. Iterate
If issues found:
1. Make fixes in `chrome-extension/`
2. Run `.\build-extension.ps1` again
3. Reload extension in Chrome (click reload icon)
4. Test again

## Build Script Details

### What Gets Copied
```
chrome-extension/
├── *.js                    ✅ All JavaScript files
├── *.html                  ✅ All HTML files
├── *.json                  ✅ Manifest and configs
├── icons/                  ✅ Extension icons
├── popup/                  ✅ Popup UI files
├── styles/                 ✅ CSS files
└── *.md                    ❌ Excluded (documentation)
```

### What Gets Excluded
- `*.md` - Markdown documentation files
- `build-release.ps1` - Build scripts
- Any other non-essential files

## GitHub Release

### 1. Prepare ZIP
The ZIP file is ready at: `releases/elementor-copier-v1.0.0.zip`

### 2. Create GitHub Release
The GitHub Actions workflow will automatically create a release when you push changes to the main branch. Alternatively, you can manually create a release:
1. Go to [GitHub Releases](https://github.com/kazemcodes/elementor-copy/releases)
2. Click "Draft a new release"
3. Upload `releases/elementor-copier-v1.0.0.zip`
4. Fill in store listing details
5. Submit for review

### 3. Store Listing Assets Needed
- Screenshots (1280x800 or 640x400)
- Promotional images:
  - Small tile: 440x280
  - Large tile: 920x680
  - Marquee: 1400x560
- Description (see RELEASE_CHECKLIST.md)

## Local Testing

### Load Unpacked Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select `releases/elementor-copier-v1.0.0/` folder
6. Extension loads immediately

### Reload After Changes
1. Make changes in `chrome-extension/`
2. Run `.\build-extension.ps1`
3. Go to `chrome://extensions/`
4. Click reload icon on Elementor Copier card
5. Changes take effect immediately

### View Console Logs
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker" (for background script)
3. Or open any page and press F12 (for content script)

## Troubleshooting

### Build Script Fails
**Error:** "Cannot find path..."
**Solution:** Make sure you're in the project root directory

**Error:** "Access denied..."
**Solution:** Close Chrome if it has the extension loaded

### Verify Script Fails
**Error:** "Release ZIP not found"
**Solution:** Run `.\build-extension.ps1` first

**Error:** "Extracted folder not found"
**Solution:** Run `.\build-extension.ps1` to create it

### Extension Won't Load
**Error:** "Manifest file is missing or unreadable"
**Solution:** Check that `manifest.json` exists in extracted folder

**Error:** "Could not load icon"
**Solution:** Verify icons exist in `icons/` folder

## Version Management

### Update Version
1. Edit `chrome-extension/manifest.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Update version in build scripts:
   - `build-extension.ps1`: `$version = "1.0.1"`
   - `verify-release.ps1`: `$version = "1.0.1"`

3. Rebuild:
   ```powershell
   .\build-extension.ps1
   ```

### Version Naming
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major:** Breaking changes
- **Minor:** New features
- **Patch:** Bug fixes

## Clean Build

### Remove All Build Artifacts
```powershell
# Remove releases folder
Remove-Item -Recurse -Force releases/elementor-copier-v1.0.0

# Remove ZIP
Remove-Item -Force releases/elementor-copier-v1.0.0.zip

# Rebuild from scratch
.\build-extension.ps1
```

## Automated Testing

### Quick Test Script
```powershell
# Build and verify in one command
.\build-extension.ps1; .\verify-release.ps1
```

### Full Test Workflow
```powershell
# 1. Build
.\build-extension.ps1

# 2. Verify
.\verify-release.ps1

# 3. Check diagnostics (if available)
# Add your test commands here
```

## Best Practices

### Before Building
- ✅ Test changes locally first
- ✅ Check console for errors
- ✅ Verify all features work
- ✅ Update version if needed
- ✅ Update CHANGELOG.md

### After Building
- ✅ Run verify script
- ✅ Test the extracted folder
- ✅ Check file sizes
- ✅ Verify all assets included
- ✅ Test on clean Chrome profile

### Before Submitting
- ✅ Test on multiple sites
- ✅ Check all permissions work
- ✅ Verify no console errors
- ✅ Test all features
- ✅ Update documentation

## File Sizes

### Typical Sizes
- ZIP file: ~100-200 KB
- Extracted folder: ~300-400 KB
- Individual files: 10-50 KB each

### Size Limits
- GitHub Release: 2 GB max (more than enough)
- Individual file: No specific limit
- Icons: Should be optimized

## Support

### Issues During Build
1. Check PowerShell version: `$PSVersionTable.PSVersion`
2. Ensure you have write permissions
3. Close Chrome before building
4. Check disk space

### Need Help?
- Check TESTING_GUIDE.md
- Check FIXES_APPLIED.md
- Check console logs
- Report issues on GitHub

---

**Quick Reference:**
```powershell
# Build
.\build-extension.ps1

# Verify
.\verify-release.ps1

# Both
.\build-extension.ps1; .\verify-release.ps1
```

**Output Location:**
- ZIP: `releases/elementor-copier-v1.0.0.zip`
- Extracted: `releases/elementor-copier-v1.0.0/`

**Ready to use!** 🚀
