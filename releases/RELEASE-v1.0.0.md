# Elementor Copier v1.0.0 - Release Package

## Release Information

- **Version:** 1.0.0
- **Release Date:** October 15, 2025
- **Package File:** `elementor-copier-v1.0.0.zip`
- **Package Size:** ~15 KB (compressed)
- **Status:** Ready for Chrome Web Store submission

## What's Included

This release package contains only the essential files needed for the Chrome extension:

### Core Files
- `manifest.json` - Extension manifest (Manifest V3)
- `background.js` - Service worker for background tasks
- `content.js` - Content script for page interaction
- `offscreen.js` - Offscreen document for clipboard operations
- `offscreen.html` - Offscreen document HTML
- `README.md` - User documentation

### Icons
- `icons/icon16.png` - 16x16 toolbar icon
- `icons/icon48.png` - 48x48 extension management icon
- `icons/icon128.png` - 128x128 Chrome Web Store icon

### Popup Interface
- `popup/popup.html` - Popup interface HTML
- `popup/popup.js` - Popup functionality
- `popup/popup.css` - Popup styling

### Styles
- `styles/highlight.css` - Element highlighting styles

## What's NOT Included

The following files are excluded from the release package (development/documentation only):

- Test files (`test-*.html`, `test-*.js`)
- Documentation files (except main README.md)
- Build scripts (`*.ps1`)
- Implementation summaries
- Testing guides
- Icon generation scripts

## Installation Instructions

### For End Users

**Option 1: Chrome Web Store (Recommended - Coming Soon)**
1. Visit Chrome Web Store
2. Search for "Elementor Copier"
3. Click "Add to Chrome"
4. Extension is ready to use

**Option 2: Manual Installation**
1. Download `elementor-copier-v1.0.0.zip`
2. Extract the ZIP file to a permanent location
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the extracted folder
7. Extension icon appears in toolbar

### For Developers

**Testing the Release:**
```powershell
# Extract and test
Expand-Archive -Path releases/elementor-copier-v1.0.0.zip -DestinationPath test-extension
# Load in Chrome as unpacked extension
```

## Chrome Web Store Submission

### Prerequisites

Before submitting to Chrome Web Store, prepare:

1. **Developer Account**
   - Chrome Web Store developer account ($5 one-time fee)
   - Account at: https://chrome.google.com/webstore/devconsole

2. **Store Listing Assets**
   - Extension ZIP file (this release)
   - Screenshots (1280x800 or 640x400) - at least 1, up to 5
   - Promotional images:
     - Small tile: 440x280 (optional)
     - Marquee: 1400x560 (optional)
   - Extension icon: 128x128 (included in ZIP)

3. **Store Listing Information**
   - Extension name: "Elementor Copier"
   - Short description: "Copy Elementor widgets, sections, and pages from any website"
   - Detailed description: See RELEASE_NOTES.md
   - Category: Developer Tools
   - Language: English (with Persian support)
   - Privacy policy URL (if collecting data - we don't)

### Submission Steps

1. **Login to Developer Dashboard**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Sign in with Google account

2. **Create New Item**
   - Click "New Item" button
   - Upload `elementor-copier-v1.0.0.zip`
   - Wait for upload to complete

3. **Fill Store Listing**
   - **Product details:**
     - Name: Elementor Copier
     - Summary: Copy Elementor widgets, sections, and pages from any website with a simple right-click
     - Description: (Use description from RELEASE_NOTES.md)
     - Category: Developer Tools
     - Language: English
   
   - **Graphic assets:**
     - Upload screenshots
     - Upload promotional images (optional)
     - Icon is automatically extracted from ZIP
   
   - **Additional fields:**
     - Official URL: Your GitHub repository
     - Support URL: GitHub Issues page
     - Version: 1.0.0 (auto-filled from manifest)

4. **Privacy Practices**
   - Single purpose: Copy Elementor elements from websites
   - Permissions justification:
     - `contextMenus`: Add right-click menu options
     - `clipboardWrite`: Copy data to clipboard
     - `activeTab`: Access current tab content
     - `storage`: Store last copied item
     - `notifications`: Show success/error messages
     - `offscreen`: Clipboard operations
     - `host_permissions`: Access all websites to extract Elementor data
   - Data usage: No data collected or transmitted
   - Certification: Check all applicable boxes

5. **Distribution**
   - Visibility: Public
   - Regions: All regions
   - Pricing: Free

6. **Submit for Review**
   - Review all information
   - Click "Submit for review"
   - Wait for approval (typically 1-3 days)

### Review Process

**What Google Reviews:**
- ✅ Manifest V3 compliance
- ✅ Permission usage justification
- ✅ Privacy policy (if needed)
- ✅ Functionality matches description
- ✅ No malicious code
- ✅ No policy violations

**Common Rejection Reasons:**
- ❌ Excessive permissions
- ❌ Misleading description
- ❌ Missing privacy policy (if collecting data)
- ❌ Trademark violations
- ❌ Malicious code

**Our Extension:**
- ✅ Minimal permissions (only what's needed)
- ✅ Clear description
- ✅ No data collection (no privacy policy needed)
- ✅ No trademarks violated
- ✅ Clean, open-source code

## Testing Checklist

Before submitting, verify:

### Installation
- [ ] Extension installs without errors
- [ ] All icons display correctly
- [ ] Popup opens and displays properly
- [ ] No console errors on installation

### Functionality
- [ ] Detects Elementor websites correctly
- [ ] Badge shows element count
- [ ] Context menu appears on right-click
- [ ] Highlight mode works
- [ ] Copy operations succeed
- [ ] Clipboard contains valid JSON
- [ ] Notifications appear correctly

### Compatibility
- [ ] Works in Chrome 88+
- [ ] Works in Edge 88+
- [ ] Works in Brave
- [ ] Works on various Elementor sites
- [ ] Works with different Elementor versions

### Security
- [ ] No external network requests
- [ ] No data collection
- [ ] Clipboard data is sanitized
- [ ] No XSS vulnerabilities

### Performance
- [ ] No memory leaks
- [ ] Fast element detection
- [ ] Quick copy operations
- [ ] Minimal CPU usage

## Post-Submission

### After Approval

1. **Announcement**
   - Update README.md with Chrome Web Store link
   - Announce on social media
   - Update documentation

2. **Monitoring**
   - Monitor user reviews
   - Track installation statistics
   - Watch for bug reports

3. **Support**
   - Respond to user reviews
   - Fix reported bugs
   - Update documentation as needed

### Future Updates

To release updates:

1. Update version in `manifest.json`
2. Build new release package
3. Upload to Chrome Web Store
4. Update changelog
5. Submit for review

## Troubleshooting

### Build Issues

**Problem:** ZIP file too large
- **Solution:** Ensure only essential files included
- **Check:** No test files, no documentation (except README)

**Problem:** Missing files in ZIP
- **Solution:** Verify all required files copied
- **Check:** manifest.json, background.js, content.js, icons, popup

### Submission Issues

**Problem:** Rejected for excessive permissions
- **Solution:** Justify each permission in submission
- **Our justification:** All permissions necessary for core functionality

**Problem:** Rejected for unclear description
- **Solution:** Use clear, concise description
- **Our description:** Clearly explains copy/paste workflow

## Support

### For Users
- Documentation: [README.md](../README.md)
- Chrome Extension Guide: [chrome-extension/README.md](../chrome-extension/README.md)
- Issues: GitHub Issues

### For Developers
- Build script: `chrome-extension/build-release.ps1`
- Design docs: `.kiro/specs/elementor-widget-copier/`
- Testing: `chrome-extension/TESTING_GUIDE.md`

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | Oct 15, 2025 | Released | Initial stable release |

## License

GPL v2 or later

## Author

**Kazem Moridi**
- GitHub: [@kazemmoridi](https://github.com/kazemmoridi)

---

**Package Ready for Chrome Web Store Submission!**

Upload `elementor-copier-v1.0.0.zip` to:
https://chrome.google.com/webstore/devconsole
