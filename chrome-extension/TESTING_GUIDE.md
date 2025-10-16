# Clipboard Integration Testing Guide

## Overview

This guide provides step-by-step instructions for testing the enhanced clipboard integration across different browsers and scenarios.

## Prerequisites

- Chrome 109+ / Edge 109+ / Brave (latest)
- Access to an Elementor website for testing
- WordPress site with Elementor Copier plugin installed

## Test Environment Setup

### 1. Load Extension in Chrome

```bash
1. Open Chrome
2. Navigate to chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the chrome-extension folder
6. Verify extension loads without errors
```

### 2. Load Extension in Edge

```bash
1. Open Edge
2. Navigate to edge://extensions/
3. Enable "Developer mode" (left sidebar)
4. Click "Load unpacked"
5. Select the chrome-extension folder
6. Verify extension loads without errors
```

### 3. Load Extension in Brave

```bash
1. Open Brave
2. Navigate to brave://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the chrome-extension folder
6. Verify extension loads without errors
7. Check Brave Shields settings if issues occur
```

## Test Cases

### Test 1: Basic Clipboard Write (Primary Method)

**Objective**: Verify offscreen document clipboard write works

**Steps**:
1. Open any Elementor website
2. Open browser DevTools (F12)
3. Go to Console tab
4. Right-click on any Elementor widget
5. Select "Elementor Copier" → "Copy Widget"
6. Check console for messages:
   - "✓ Offscreen document created"
   - "✓ Data written to clipboard via offscreen document"
   - "✓ Data copied to clipboard via offscreen document"
7. Open a text editor
8. Paste (Ctrl+V / Cmd+V)
9. Verify JSON data is pasted

**Expected Result**: 
- ✓ Widget data copied to clipboard
- ✓ Console shows success messages
- ✓ JSON data can be pasted

**Pass/Fail**: ___________

---

### Test 2: Chrome Storage Backup

**Objective**: Verify data is stored in chrome.storage as backup

**Steps**:
1. Copy any Elementor element (widget/section)
2. Open browser DevTools (F12)
3. Go to Application tab (Chrome) or Storage tab (Firefox)
4. Navigate to Extensions → Storage → Local Storage
5. Find "lastCopied" key
6. Verify it contains the copied data
7. Find "lastCopiedAt" key
8. Verify it contains ISO timestamp

**Expected Result**:
- ✓ lastCopied contains full JSON data
- ✓ lastCopiedAt contains valid timestamp
- ✓ Data matches what was copied

**Pass/Fail**: ___________

---

### Test 3: Extension Popup - View Data

**Objective**: Verify popup can display last copied data

**Steps**:
1. Copy any Elementor element
2. Click extension icon in toolbar
3. Verify "Last Copied" section appears
4. Check element type is displayed correctly
5. Check timestamp is displayed (e.g., "2 minutes ago")
6. Click "View Data" button
7. Verify modal opens with JSON data
8. Verify data is formatted and readable

**Expected Result**:
- ✓ Last copied section shows correct info
- ✓ Modal displays formatted JSON
- ✓ Data is complete and valid

**Pass/Fail**: ___________

---

### Test 4: Manual Copy Fallback

**Objective**: Verify manual copy button works as fallback

**Steps**:
1. Copy any Elementor element
2. Click extension icon
3. Click "Copy Again" button
4. Verify success message appears
5. Open text editor
6. Paste (Ctrl+V)
7. Verify JSON data is pasted

**Alternative (if Clipboard API fails)**:
1. Click "Copy Again" button
2. If modal opens, select all text in textarea
3. Copy manually (Ctrl+C)
4. Paste in text editor
5. Verify JSON data is correct

**Expected Result**:
- ✓ Copy Again button works
- ✓ Data can be pasted
- ✓ Fallback modal works if needed

**Pass/Fail**: ___________

---

### Test 5: Large Data (Full Page)

**Objective**: Verify clipboard handles large JSON payloads

**Steps**:
1. Open Elementor page with many elements (20+ widgets)
2. Right-click anywhere
3. Select "Elementor Copier" → "Copy Entire Page"
4. Wait for notification
5. Check console for any errors
6. Open text editor
7. Paste data
8. Verify complete JSON structure
9. Check file size (should be several KB)

**Expected Result**:
- ✓ Large page data copied successfully
- ✓ No memory errors in console
- ✓ Complete data structure preserved
- ✓ All elements included

**Pass/Fail**: ___________

---

### Test 6: Permission Handling

**Objective**: Verify extension handles clipboard permissions correctly

**Steps**:
1. Open Chrome settings
2. Navigate to Privacy and security → Site Settings → Permissions
3. Find Clipboard permission
4. Set to "Ask" or "Block" for the extension
5. Try to copy an Elementor element
6. Observe permission prompt (if "Ask")
7. Grant permission
8. Verify copy works
9. Try denying permission
10. Verify fallback method is offered

**Expected Result**:
- ✓ Permission prompt appears when needed
- ✓ Copy works after granting permission
- ✓ Fallback offered when permission denied
- ✓ User-friendly error messages

**Pass/Fail**: ___________

---

### Test 7: Cross-Browser Compatibility

**Objective**: Verify extension works across different browsers

**Chrome Test**:
1. Load extension in Chrome
2. Copy widget, section, and page
3. Verify all copy operations work
4. Check console for errors

**Edge Test**:
1. Load extension in Edge
2. Copy widget, section, and page
3. Verify all copy operations work
4. Check console for errors

**Brave Test**:
1. Load extension in Brave
2. Check Brave Shields settings
3. Copy widget, section, and page
4. Verify all copy operations work
5. Check console for errors

**Expected Result**:
- ✓ Chrome: All operations work
- ✓ Edge: All operations work
- ✓ Brave: All operations work
- ✓ No browser-specific errors

**Pass/Fail**: 
- Chrome: ___________
- Edge: ___________
- Brave: ___________

---

### Test 8: Error Handling

**Objective**: Verify proper error handling and user feedback

**Test 8a: Offscreen Document Failure**
1. Modify background.js to simulate offscreen creation failure
2. Try to copy element
3. Verify fallback method is attempted
4. Verify user sees helpful error message

**Test 8b: Clipboard API Not Available**
1. Test in older browser (if available)
2. Try to copy element
3. Verify execCommand fallback is used
4. Verify manual copy option is offered

**Test 8c: Runtime Error**
1. Reload extension while page is open
2. Try to copy element
3. Verify error message is user-friendly
4. Verify suggestion to reload page/extension

**Expected Result**:
- ✓ Errors are caught and handled
- ✓ User sees clear error messages
- ✓ Fallback methods are attempted
- ✓ No uncaught exceptions in console

**Pass/Fail**: ___________

---

### Test 9: WordPress Integration

**Objective**: Verify copied data works with WordPress plugin

**Steps**:
1. Copy Elementor widget from any site
2. Open WordPress admin
3. Navigate to Tools → Elementor Copier
4. Click "Paste from Clipboard" button
5. Verify data is detected and validated
6. Verify preview shows correct element type
7. Select import options
8. Click import
9. Verify element is imported correctly
10. Open in Elementor editor
11. Verify all settings and content preserved

**Expected Result**:
- ✓ WordPress plugin reads clipboard data
- ✓ Data validation passes
- ✓ Import completes successfully
- ✓ Element displays correctly in Elementor

**Pass/Fail**: ___________

---

### Test 10: Highlight Mode with Clipboard

**Objective**: Verify highlight mode works with clipboard operations

**Steps**:
1. Open Elementor page
2. Right-click → "Enable Highlight Mode"
3. Hover over elements
4. Verify elements are highlighted
5. Click on a widget
6. Verify it's copied to clipboard
7. Check notification
8. Paste in text editor
9. Verify correct element was copied

**Expected Result**:
- ✓ Highlight mode enables correctly
- ✓ Elements highlight on hover
- ✓ Click copies element
- ✓ Correct element is copied

**Pass/Fail**: ___________

---

## Automated Testing

### Using test-clipboard.html

1. Open `chrome-extension/test-clipboard.html` in browser
2. Review browser information section
3. Click "Run All Tests" button
4. Review results for each test:
   - Test 1: Basic Clipboard Write
   - Test 2: Large JSON Data
   - Test 3: Read from Clipboard
   - Test 4: Fallback Copy Method
   - Test 5: Clipboard Permission
   - Test 6: Copy Sample Elementor Data
5. Verify all tests pass
6. Note any failures

**Expected Result**:
- ✓ All tests pass
- ✓ Browser info shows Clipboard API supported
- ✓ Sample data can be copied

**Pass/Fail**: ___________

---

## Performance Testing

### Test 11: Memory Usage

**Objective**: Verify no memory leaks

**Steps**:
1. Open Chrome Task Manager (Shift+Esc)
2. Find extension process
3. Note initial memory usage
4. Copy 50 different elements
5. Check memory usage after each 10 copies
6. Verify memory doesn't grow excessively
7. Close all tabs
8. Verify memory is released

**Expected Result**:
- ✓ Memory usage stays reasonable (<50MB)
- ✓ No continuous memory growth
- ✓ Memory released when tabs closed

**Pass/Fail**: ___________

---

### Test 12: Speed Test

**Objective**: Verify clipboard operations are fast

**Steps**:
1. Open DevTools Console
2. Copy small widget
3. Note time in console logs
4. Copy large section (10+ widgets)
5. Note time in console logs
6. Copy full page (50+ elements)
7. Note time in console logs

**Expected Result**:
- ✓ Small widget: <100ms
- ✓ Large section: <500ms
- ✓ Full page: <2000ms
- ✓ No UI blocking

**Pass/Fail**: ___________

---

## Regression Testing

After any code changes, run these critical tests:

1. ✓ Basic clipboard write (Test 1)
2. ✓ Chrome storage backup (Test 2)
3. ✓ Manual copy fallback (Test 4)
4. ✓ WordPress integration (Test 9)
5. ✓ Cross-browser (Test 7)

---

## Bug Reporting Template

If you find a bug, report it with this information:

```
**Bug Title**: [Brief description]

**Browser**: Chrome/Edge/Brave [version]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Console Errors**:


**Screenshots**:


**Additional Context**:

```

---

## Test Results Summary

| Test | Chrome | Edge | Brave | Notes |
|------|--------|------|-------|-------|
| 1. Basic Clipboard | ☐ | ☐ | ☐ | |
| 2. Storage Backup | ☐ | ☐ | ☐ | |
| 3. View Data | ☐ | ☐ | ☐ | |
| 4. Manual Copy | ☐ | ☐ | ☐ | |
| 5. Large Data | ☐ | ☐ | ☐ | |
| 6. Permissions | ☐ | ☐ | ☐ | |
| 7. Cross-Browser | ☐ | ☐ | ☐ | |
| 8. Error Handling | ☐ | ☐ | ☐ | |
| 9. WordPress | ☐ | ☐ | ☐ | |
| 10. Highlight Mode | ☐ | ☐ | ☐ | |
| 11. Memory Usage | ☐ | ☐ | ☐ | |
| 12. Speed Test | ☐ | ☐ | ☐ | |

**Overall Status**: ☐ Pass ☐ Fail

**Tested By**: ___________

**Date**: ___________

**Notes**:
