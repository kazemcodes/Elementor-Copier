# Media Extraction Test Guide

This guide explains how to test the media extraction functionality in the Elementor Copier Chrome extension.

## Overview

The media extraction feature automatically detects and extracts all media URLs from Elementor elements, including:
- Regular image elements (`<img>`)
- Responsive images with srcset
- Lazy-loaded images (data-src, data-lazy-src)
- Background images from CSS (inline styles and computed styles)
- Video elements (`<video>`)
- Video sources within video elements
- Embedded videos (YouTube, Vimeo, Dailymotion iframes)
- Media URLs from Elementor settings (data-elementor-settings)

## Test Setup

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Verify the extension is loaded and enabled

### 2. Open Test Page

1. Open `chrome-extension/test-media-extraction.html` in Chrome
2. Open the browser console (F12 or Ctrl+Shift+J)
3. Verify you see the message: "Media extraction test page loaded"

## Test Cases

### Test 1: Regular Image Extraction

**Element:** Widget with standard `<img>` tag

**Steps:**
1. Right-click on the "Widget with Regular Image" section
2. Select "Copy Widget" from context menu
3. Check console for: "Extracted X media items from element"
4. Paste clipboard data into a text editor

**Expected Result:**
- Media array should contain 1 item
- Type: `image`
- URL: `https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Widget+Image`
- Alt text: `Test Widget Image`
- Width and height should be populated

### Test 2: Background Image from CSS

**Element:** Widget with CSS background-image

**Steps:**
1. Right-click on the "Widget with Background Image" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 1 item
- Type: `background-image`
- URL: `https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Background+Image`

### Test 3: Inline Style Background

**Element:** Widget with inline style background-image

**Steps:**
1. Right-click on the "Widget with Inline Style Background" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 1 item
- Type: `background-image`
- URL extracted from inline style attribute

### Test 4: Video Element

**Element:** Widget with `<video>` tag

**Steps:**
1. Right-click on the "Widget with Video" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 1-2 items
- Type: `video`
- URLs from video src and/or source elements

### Test 5: YouTube Embed

**Element:** Widget with YouTube iframe

**Steps:**
1. Right-click on the "Widget with YouTube Embed" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 1 item
- Type: `video`
- URL: YouTube embed URL

### Test 6: Responsive Images (srcset)

**Element:** Widget with srcset attribute

**Steps:**
1. Right-click on the "Widget with Responsive Images" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 4 items (1 src + 3 srcset URLs)
- All should be type: `image`
- No duplicate URLs

### Test 7: Section with Multiple Widgets

**Element:** Section containing multiple widgets with images

**Steps:**
1. Right-click on the "Section with Multiple Widgets" section
2. Select "Copy Section"
3. Check console logs

**Expected Result:**
- Media array should contain 3 items:
  - 1 section background image
  - 2 column images
- All URLs should be unique (no duplicates)

### Test 8: Lazy-Loaded Images

**Element:** Widget with data-src and data-lazy-src attributes

**Steps:**
1. Right-click on the "Widget with Lazy-Loaded Images" section
2. Select "Copy Widget"
3. Check console logs

**Expected Result:**
- Media array should contain 1 item
- URL extracted from data-src or data-lazy-src
- Should NOT extract the placeholder data URI

## Verification Checklist

After running all tests, verify:

- [ ] All media types are extracted correctly
- [ ] No duplicate URLs in media array
- [ ] Media array is included in clipboard data structure
- [ ] Each media item has required fields: id, url, type
- [ ] Optional fields (alt, width, height) are populated when available
- [ ] Console logs show correct count of extracted media
- [ ] No JavaScript errors in console
- [ ] Clipboard data follows the correct JSON structure

## Expected Clipboard Data Structure

```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget|section|column|page",
  "data": {
    "id": "...",
    "elType": "...",
    "settings": {},
    "elements": []
  },
  "media": [
    {
      "id": "el_abc123",
      "url": "https://example.com/image.jpg",
      "type": "image|background-image|video",
      "alt": "Alt text",
      "width": 1920,
      "height": 1080
    }
  ],
  "metadata": {
    "sourceUrl": "...",
    "copiedAt": "...",
    "elementorVersion": "..."
  }
}
```

## Testing on Real Elementor Sites

After testing with the test page, verify on real Elementor websites:

1. **Test Site 1:** Simple blog with Elementor
   - Copy various widgets
   - Verify image extraction

2. **Test Site 2:** E-commerce site with product images
   - Copy product sections
   - Verify multiple images extracted

3. **Test Site 3:** Portfolio site with background images
   - Copy hero sections
   - Verify background image extraction

4. **Test Site 4:** Site with video content
   - Copy video widgets
   - Verify video URL extraction

## Troubleshooting

### No Media Extracted

**Possible Causes:**
- Element doesn't contain any media
- Media URLs are loaded dynamically after page load
- Media is in shadow DOM or inaccessible

**Solutions:**
- Wait for page to fully load
- Check if media is visible in browser
- Inspect element to verify media exists

### Duplicate URLs

**Issue:** Same URL appears multiple times in media array

**Solution:** This should not happen - the code uses a Set to track seen URLs. If duplicates occur, check console for errors.

### Missing Background Images

**Issue:** Background images not extracted

**Possible Causes:**
- Background set via external CSS file (not inline or computed)
- Background is a gradient, not an image

**Solution:** Background images from external CSS files cannot be extracted. Only inline styles and computed styles are accessible.

### Console Errors

**Common Errors:**
- "Cannot read property of null" - Element not found
- "JSON parse error" - Invalid Elementor settings data
- "Permission denied" - Cross-origin restrictions

**Solutions:**
- Verify element has correct data attributes
- Check Elementor settings JSON format
- Ensure page is fully loaded

## Performance Testing

Test with large pages:

1. Open a page with 50+ Elementor widgets
2. Copy entire page
3. Monitor console for performance
4. Verify extraction completes in reasonable time (<2 seconds)

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Edge (Chromium-based)
- [ ] Brave
- [ ] Opera

## Reporting Issues

If you find issues:

1. Note the specific test case that failed
2. Copy the console error messages
3. Save the clipboard data (if any)
4. Note the browser version
5. Provide steps to reproduce

## Success Criteria

The media extraction feature is working correctly when:

✅ All 8 test cases pass
✅ No JavaScript errors in console
✅ Media array is properly formatted
✅ No duplicate URLs
✅ All media types are detected
✅ Works on real Elementor sites
✅ Performance is acceptable (<2s for large pages)
