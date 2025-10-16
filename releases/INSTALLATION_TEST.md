# Installation Test Guide

Test the release package before submitting to Chrome Web Store.

## Quick Test

1. **Extract the ZIP**
   ```
   Extract: releases/elementor-copier-v1.0.0.zip
   ```

2. **Load in Chrome**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder

3. **Verify Installation**
   - Extension icon appears in toolbar
   - No errors in console
   - Extension shows as "Elementor Copier v1.0.0"

## Functional Tests

### Test 1: Copy Section
1. Go to any WordPress site with Elementor
2. Open Elementor editor
3. Right-click on a section
4. Verify "Copy Elementor Section" appears in menu
5. Click it
6. Check for success notification

### Test 2: Paste Section
1. Go to another WordPress site (or same site)
2. Open Elementor editor
3. Press Ctrl+V
4. Verify section is pasted
5. Check all widgets are present
6. Verify styling is maintained

### Test 3: Custom Widget Conversion
1. Copy a section with Slider Revolution or WoodMart widgets
2. Paste on a site without those plugins
3. Verify widgets are converted to HTML widgets
4. Check visual appearance is preserved

### Test 4: Media URLs
1. Copy a section with images
2. Paste on another site
3. Verify images load correctly
4. Check image URLs are from source site

## Expected Results

✅ All tests should pass
✅ No console errors
✅ Smooth user experience
✅ Content preserved accurately

## If Issues Found

1. Check browser console for errors
2. Verify manifest.json is correct
3. Check all required files are present
4. Test on different WordPress sites
5. Report issues on GitHub

## Browser Compatibility

Test on:
- Chrome (latest)
- Chrome (one version back)
- Edge (Chromium-based)

## Ready for Release?

If all tests pass:
- ✅ Package is ready for Chrome Web Store
- ✅ Can be distributed to users
- ✅ Safe for production use

---

**Support**: bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm
