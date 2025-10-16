# Chrome Extension Troubleshooting Guide

Complete troubleshooting guide for the Elementor Copier Chrome extension.

---

## Table of Contents

1. [Extension Installation Issues](#extension-installation-issues)
2. [Elementor Detection Problems](#elementor-detection-problems)
3. [Copy Operation Failures](#copy-operation-failures)
4. [Highlight Mode Issues](#highlight-mode-issues)
5. [Data Extraction Problems](#data-extraction-problems)
6. [Clipboard Issues](#clipboard-issues)
7. [Browser Compatibility](#browser-compatibility)
8. [Performance Issues](#performance-issues)
9. [Integration with WordPress Plugin](#integration-with-wordpress-plugin)
10. [Advanced Debugging](#advanced-debugging)

---

## Extension Installation Issues

### Extension Won't Install

**Symptoms:**
- "Package is invalid" error
- Installation fails
- Extension doesn't appear

**Solutions:**

1. **Check Browser Version:**
   ```
   Required: Chrome 88+ or Edge 88+
   Check: chrome://version/ or edge://version/
   Update if needed
   ```

2. **Verify Manifest V3 Support:**
   - Older browsers don't support Manifest V3
   - Update to latest browser version
   - Try Chrome Canary if on cutting edge

3. **Check Extension Package:**
   - Ensure manifest.json is valid
   - Verify all required files present
   - Check for syntax errors in JSON

4. **Clear Extension Cache:**
   ```
   1. Go to chrome://extensions/
   2. Remove old version if present
   3. Restart browser
   4. Try installing again
   ```

### Extension Icon Not Appearing

**Symptoms:**
- Extension installed but no toolbar icon
- Can't access extension popup

**Solutions:**

1. **Pin Extension to Toolbar:**
   ```
   1. Click puzzle icon in toolbar
   2. Find "Elementor Copier"
   3. Click pin icon
   4. Icon appears in toolbar
   ```

2. **Check Extension Enabled:**
   ```
   1. Go to chrome://extensions/
   2. Find "Elementor Copier"
   3. Ensure toggle is ON (blue)
   ```

3. **Restart Browser:**
   - Close all browser windows
   - Reopen browser
   - Check toolbar again

---

## Elementor Detection Problems

### Extension Not Detecting Elementor

**Symptoms:**
- Badge shows red indicator
- Badge shows "0" or no count
- Context menu doesn't show Elementor options
- Popup says "No Elementor detected"

**Diagnostic Steps:**

1. **Verify Elementor is Present:**
   ```
   1. Right-click on page → Inspect (F12)
   2. Press Ctrl+F (Cmd+F on Mac)
   3. Search for: data-elementor-type
   4. If found: Elementor is present
   5. If not found: Page doesn't use Elementor
   ```

2. **Check for Elementor Classes:**
   ```
   Search in page source for:
   - .elementor-element
   - .elementor-widget
   - .elementor-section
   - data-elementor-id
   ```

3. **Verify Page Fully Loaded:**
   - Wait for page to finish loading
   - Check network tab (F12 → Network)
   - Ensure no pending requests
   - Try refreshing page (Ctrl+R)

**Common Causes:**

| Cause | Solution |
|-------|----------|
| Page doesn't use Elementor | Try different page on site |
| Elementor loaded via AJAX | Wait longer, refresh page |
| Custom Elementor implementation | May not be detectable |
| Browser extension conflicts | Disable other extensions |
| JavaScript errors on page | Check console for errors |

**Solutions:**

1. **Refresh the Page:**
   ```
   Press Ctrl+R (Cmd+R on Mac)
   Wait for full page load
   Check badge again
   ```

2. **Try Different Page:**
   ```
   Navigate to homepage
   Try /about or /contact pages
   Look for "Edit with Elementor" in page
   ```

3. **Check Browser Console:**
   ```
   1. Press F12
   2. Go to Console tab
   3. Look for extension errors
   4. Look for Elementor-related errors
   5. Report errors if found
   ```

4. **Reinstall Extension:**
   ```
   1. Go to chrome://extensions/
   2. Remove "Elementor Copier"
   3. Restart browser
   4. Reinstall extension
   5. Test again
   ```

### False Positive Detection

**Symptoms:**
- Extension detects Elementor but page doesn't have it
- Badge shows count but no elements visible

**Solutions:**

1. **Check for Elementor Remnants:**
   - Previous Elementor installation
   - Cached Elementor data
   - Theme using Elementor classes

2. **Verify with Highlight Mode:**
   - Enable highlight mode
   - See if any elements highlight
   - If none highlight, false positive

---

## Copy Operation Failures

### Copy Button Does Nothing

**Symptoms:**
- Right-click menu item doesn't work
- No notification appears
- Clipboard remains empty

**Diagnostic Steps:**

1. **Check Clipboard Permissions:**
   ```
   1. Click extension icon
   2. Look for permission warnings
   3. Grant clipboard access if requested
   ```

2. **Verify HTTPS:**
   ```
   Check URL bar:
   ✅ https://example.com (Clipboard API works)
   ❌ http://example.com (Clipboard API blocked)
   ✅ localhost (Clipboard API works)
   ```

3. **Test Clipboard Manually:**
   ```
   1. Select some text on page
   2. Press Ctrl+C (Cmd+C on Mac)
   3. Open notepad
   4. Press Ctrl+V (Cmd+V on Mac)
   5. If this fails, clipboard is blocked
   ```

**Solutions:**

1. **Use HTTPS:**
   ```
   Change: http://example.com
   To: https://example.com
   
   Clipboard API requires secure context
   ```

2. **Check Browser Permissions:**
   ```
   1. Click lock icon in address bar
   2. Check site permissions
   3. Ensure clipboard not blocked
   4. Reset permissions if needed
   ```

3. **Disable Conflicting Extensions:**
   ```
   Common conflicts:
   - Other clipboard managers
   - Privacy extensions (Privacy Badger, etc.)
   - Ad blockers (sometimes)
   - Security extensions
   
   Disable temporarily and test
   ```

4. **Try Different Copy Method:**
   ```
   If context menu fails:
   - Try highlight mode
   - Try extension popup
   - Try copying entire page
   ```

### Copy Succeeds But Data Invalid

**Symptoms:**
- Success notification shows
- WordPress plugin says "Invalid data"
- Clipboard contains wrong data

**Solutions:**

1. **Verify Data in Popup:**
   ```
   1. Click extension icon
   2. Click "View Clipboard"
   3. Check JSON structure
   4. Verify "type": "elementor-copier"
   ```

2. **Copy Again:**
   ```
   1. Refresh source page
   2. Wait for full load
   3. Copy element again
   4. Verify success notification
   ```

3. **Check Element Has Data:**
   ```
   1. Right-click → Inspect element
   2. Look for data-elementor-settings
   3. Verify JSON is valid
   4. If missing, try parent element
   ```

---

## Highlight Mode Issues

### Highlight Mode Not Activating

**Symptoms:**
- Click "Enable Highlight Mode" but nothing happens
- No overlays appear
- Cursor doesn't change

**Solutions:**

1. **Check Page Has Elementor:**
   ```
   - Verify badge shows element count
   - Check popup shows elements
   - If no elements, nothing to highlight
   ```

2. **Refresh and Retry:**
   ```
   1. Disable highlight mode
   2. Refresh page (Ctrl+R)
   3. Wait for full load
   4. Enable highlight mode again
   ```

3. **Check Browser Console:**
   ```
   1. Press F12
   2. Go to Console tab
   3. Enable highlight mode
   4. Look for JavaScript errors
   5. Report errors if found
   ```

### Overlays Not Visible

**Symptoms:**
- Highlight mode enabled
- Cursor changes to crosshair
- But no colored overlays appear

**Solutions:**

1. **Check Z-Index Conflicts:**
   ```
   Some sites have high z-index elements
   that cover overlays
   
   Try:
   - Scrolling to different areas
   - Hovering over different elements
   - Disabling page styles temporarily
   ```

2. **Check Browser Zoom:**
   ```
   - Reset zoom to 100% (Ctrl+0)
   - Overlays may not align at other zoom levels
   ```

3. **Try Different Elements:**
   ```
   - Hover over sections (larger areas)
   - Try widgets in different locations
   - Scroll to different page areas
   ```

### Overlays Show But Click Doesn't Copy

**Symptoms:**
- Elements highlight correctly
- Click on element
- But nothing copies

**Solutions:**

1. **Check Clipboard Permissions:**
   - Same as "Copy Button Does Nothing"
   - Verify HTTPS
   - Check browser permissions

2. **Try Context Menu Instead:**
   ```
   1. Disable highlight mode
   2. Right-click on element
   3. Use context menu to copy
   ```

3. **Check Console for Errors:**
   ```
   1. Keep F12 open
   2. Click element in highlight mode
   3. Check for errors in console
   4. Report errors
   ```

---

## Data Extraction Problems

### Incomplete Data Extracted

**Symptoms:**
- Copy succeeds
- But some settings missing
- Styling not preserved

**Solutions:**

1. **Try Parent Element:**
   ```
   Instead of: Widget
   Try: Section containing widget
   
   Instead of: Section
   Try: Entire page
   ```

2. **Check Element Attributes:**
   ```
   1. Right-click → Inspect element
   2. Look for data-elementor-settings
   3. Verify JSON is complete
   4. Check for nested elements
   ```

3. **Verify Elementor Version:**
   ```
   Old Elementor versions may have:
   - Different data structure
   - Missing attributes
   - Incomplete settings
   
   Update Elementor if possible
   ```

### Custom Widgets Not Extracting

**Symptoms:**
- Standard widgets work
- Custom/third-party widgets fail
- Error: "Could not extract data"

**Solutions:**

1. **Check Widget Has Attributes:**
   ```
   Custom widgets must have:
   - data-elementor-type
   - data-elementor-settings
   - data-widget_type
   
   If missing, widget not compatible
   ```

2. **Try Copying Container:**
   ```
   Copy section containing custom widget
   May work better than widget alone
   ```

3. **Report Incompatibility:**
   ```
   If widget should work but doesn't:
   - Note widget name/type
   - Check widget addon version
   - Report as GitHub issue
   ```

### Media URLs Not Extracted

**Symptoms:**
- Element copies successfully
- But images/videos missing
- Media array empty

**Solutions:**

1. **Check Media in Settings:**
   ```
   1. Inspect element
   2. Look in data-elementor-settings
   3. Check for image URLs
   4. Verify URLs are absolute
   ```

2. **Check Background Images:**
   ```
   Background images in CSS may not extract
   Try:
   - Copying parent section
   - Copying entire page
   ```

3. **Verify Media Accessible:**
   ```
   - Open media URL in browser
   - Check if publicly accessible
   - Verify not blocked by robots.txt
   ```

---

## Clipboard Issues

### Clipboard API Not Available

**Symptoms:**
- Error: "Clipboard API not supported"
- Copy fails with permission error

**Solutions:**

1. **Use HTTPS:**
   ```
   Clipboard API requires:
   ✅ https:// URLs
   ✅ localhost
   ❌ http:// URLs (except localhost)
   ```

2. **Update Browser:**
   ```
   Minimum versions:
   - Chrome 66+
   - Edge 79+
   - Brave (latest)
   - Opera (latest)
   
   Update if below minimum
   ```

3. **Check Browser Flags:**
   ```
   chrome://flags/
   Search for: clipboard
   Ensure not disabled
   ```

### Clipboard Data Overwritten

**Symptoms:**
- Copy succeeds
- But paste shows different data
- Clipboard has wrong content

**Solutions:**

1. **Don't Copy Other Things:**
   ```
   After copying from extension:
   - Don't copy text
   - Don't copy images
   - Go directly to WordPress
   - Paste immediately
   ```

2. **Verify in Popup:**
   ```
   1. Click extension icon
   2. Check "Last Copied" section
   3. Verify correct element shown
   4. Click "View Clipboard" to see data
   ```

3. **Use Same Browser:**
   ```
   Clipboard is per-browser:
   - Copy in Chrome
   - Paste in Chrome (same window)
   - Don't switch browsers
   ```

---

## Browser Compatibility

### Extension Not Working in Firefox

**Status:** Firefox not yet supported

**Reason:**
- Manifest V3 implementation differs
- Clipboard API differences
- Firefox extension in development

**Workaround:**
- Use Chrome, Edge, or Brave
- Firefox support planned for future

### Extension Not Working in Safari

**Status:** Safari not yet supported

**Reason:**
- Safari uses different extension format
- Requires separate development
- Safari extension planned for future

**Workaround:**
- Use Chrome, Edge, or Brave
- Safari support planned for future

### Issues on Chromium-Based Browsers

**Supported:**
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave (latest)
- ✅ Opera (latest)

**If Issues Occur:**

1. **Update Browser:**
   ```
   Ensure latest version installed
   Check for updates
   Restart after update
   ```

2. **Check Manifest V3 Support:**
   ```
   Older versions may not support Manifest V3
   Update to latest version
   ```

3. **Test in Chrome:**
   ```
   If works in Chrome but not other browser:
   - Report browser-specific issue
   - Include browser version
   - Include error messages
   ```

---

## Performance Issues

### Slow Extraction

**Symptoms:**
- Copy takes long time
- Browser becomes unresponsive
- Success notification delayed

**Solutions:**

1. **Copy Smaller Sections:**
   ```
   Instead of: Entire page
   Try: Individual sections
   
   Instead of: Large section
   Try: Individual widgets
   ```

2. **Close Other Tabs:**
   ```
   - Free up browser memory
   - Reduce CPU usage
   - Close unused tabs
   - Restart browser if needed
   ```

3. **Disable Highlight Mode:**
   ```
   Highlight mode uses resources:
   - Disable when not needed
   - Use context menu instead
   - Only enable when exploring
   ```

### Browser Freezes

**Symptoms:**
- Browser stops responding
- Must force quit
- Happens during copy

**Solutions:**

1. **Check Page Complexity:**
   ```
   Very complex pages may cause issues:
   - Many nested elements
   - Large page structures
   - Heavy JavaScript
   
   Try simpler pages first
   ```

2. **Increase Browser Memory:**
   ```
   chrome://flags/
   Search for: memory
   Adjust settings if available
   ```

3. **Report Issue:**
   ```
   If consistently freezes:
   - Note page URL (if public)
   - Note element count
   - Report as GitHub issue
   ```

---

## Integration with WordPress Plugin

### Paste Not Working in WordPress

**Symptoms:**
- Copy succeeds in extension
- But paste fails in WordPress
- "Invalid data" error

**Diagnostic Steps:**

1. **Verify Plugin Installed:**
   ```
   WordPress Admin:
   - Go to Plugins
   - Check "Elementor Widget Copier" active
   - Verify version matches
   ```

2. **Check Clipboard Data:**
   ```
   1. Click extension icon
   2. Click "View Clipboard"
   3. Verify JSON structure
   4. Check "type": "elementor-copier"
   ```

3. **Test Clipboard in WordPress:**
   ```
   1. Open WordPress admin
   2. Press F12 (console)
   3. Type: navigator.clipboard.readText()
   4. Check if data appears
   ```

**Solutions:**

1. **Use Same Browser:**
   ```
   Copy and paste in same browser
   Clipboard doesn't sync between browsers
   ```

2. **Use HTTPS:**
   ```
   WordPress admin must use HTTPS
   Clipboard API requires secure context
   ```

3. **Copy Again:**
   ```
   1. Return to source site
   2. Copy element again
   3. Verify success notification
   4. Go to WordPress immediately
   5. Paste without copying anything else
   ```

4. **Check Browser Console:**
   ```
   In WordPress admin:
   1. Press F12
   2. Go to Console tab
   3. Click paste button
   4. Look for errors
   5. Report errors if found
   ```

### Data Format Mismatch

**Symptoms:**
- WordPress says "Invalid format"
- Data structure doesn't match

**Solutions:**

1. **Update Both Components:**
   ```
   Ensure versions match:
   - Chrome extension version
   - WordPress plugin version
   - Should be same major version
   ```

2. **Check Format Version:**
   ```
   In clipboard data:
   "version": "1.0.0"
   
   Must match plugin expectations
   ```

3. **Reinstall Extension:**
   ```
   If format changed:
   - Remove extension
   - Clear cache
   - Reinstall latest version
   ```

---

## Advanced Debugging

### Enable Debug Mode

**In Extension:**

1. **Open Background Page:**
   ```
   1. Go to chrome://extensions/
   2. Find "Elementor Copier"
   3. Click "background page" link
   4. Console opens with debug info
   ```

2. **Check Content Script:**
   ```
   1. Open page with Elementor
   2. Press F12
   3. Go to Console tab
   4. Look for extension messages
   ```

### Collect Debug Information

**For Bug Reports:**

1. **Browser Information:**
   ```
   - Browser name and version
   - Operating system
   - Extension version
   ```

2. **Page Information:**
   ```
   - Source site URL (if public)
   - Elementor version (if known)
   - Element type trying to copy
   ```

3. **Error Messages:**
   ```
   - Console errors (F12 → Console)
   - Extension popup errors
   - Notification messages
   ```

4. **Steps to Reproduce:**
   ```
   1. Detailed steps
   2. Expected behavior
   3. Actual behavior
   4. Screenshots if helpful
   ```

### Test with Sample Sites

**Known Working Sites:**

Test extension on these to verify it works:

1. **Elementor Demo Sites:**
   - https://elementor.com/demos/
   - Various templates available
   - Known to work

2. **Elementor Showcase:**
   - https://elementor.com/showcase/
   - Real sites using Elementor
   - Good for testing

**If Works on Demo But Not Your Site:**
- Issue is site-specific
- Check site's Elementor version
- Check for custom implementations
- Check for security plugins

---

## Getting Help

### Before Asking for Help

1. **Read This Guide:**
   - Check all relevant sections
   - Try all suggested solutions
   - Note what you've tried

2. **Check Existing Issues:**
   - Search GitHub issues
   - Look for similar problems
   - Check if already reported

3. **Collect Information:**
   - Browser and version
   - Extension version
   - Error messages
   - Steps to reproduce

### Where to Get Help

1. **GitHub Issues:**
   ```
   https://github.com/[your-repo]/issues
   - Report bugs
   - Request features
   - Ask questions
   ```

2. **Documentation:**
   ```
   - README.md (main documentation)
   - TESTING_GUIDE.md (testing info)
   - TEST_VALIDATION_REPORT.md (test results)
   ```

3. **Community:**
   ```
   - GitHub Discussions
   - WordPress.org forums
   - Stack Overflow (tag: elementor-copier)
   ```

### Reporting Bugs

**Include:**

1. **Environment:**
   - Browser: Chrome 120.0.6099.109
   - OS: Windows 11
   - Extension: v1.0.0

2. **Problem:**
   - Clear description
   - Expected behavior
   - Actual behavior

3. **Steps to Reproduce:**
   ```
   1. Go to https://example.com
   2. Right-click on heading widget
   3. Select "Copy Widget"
   4. Error appears: [error message]
   ```

4. **Additional Info:**
   - Console errors
   - Screenshots
   - Source site URL (if public)

---

## Quick Reference

### Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| Not detecting Elementor | Refresh page (Ctrl+R) |
| Copy not working | Check HTTPS, verify clipboard permissions |
| Highlight mode not working | Disable/enable, refresh page |
| Data extraction fails | Try parent element |
| Paste fails in WordPress | Copy again, use same browser |
| Clipboard overwritten | Don't copy other things after |
| Browser freezes | Copy smaller sections |
| Extension not installing | Update browser, check version |

### Diagnostic Checklist

Before reporting issues, verify:

- [ ] Browser version is 88+ (Chrome/Edge)
- [ ] Extension is latest version
- [ ] Page actually uses Elementor
- [ ] Using HTTPS (not HTTP)
- [ ] Clipboard permissions granted
- [ ] No conflicting extensions
- [ ] Tried refreshing page
- [ ] Tried different element
- [ ] Checked browser console
- [ ] Tested on demo site

---

**Last Updated:** October 15, 2025  
**Extension Version:** 1.0.0  
**Applies To:** Chrome 88+, Edge 88+, Brave, Opera

---

*For more help, see [README.md](README.md) or open a GitHub issue.*
