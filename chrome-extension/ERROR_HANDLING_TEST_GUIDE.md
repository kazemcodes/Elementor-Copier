# Error Handling and User Feedback Test Guide

This guide helps you test the enhanced error handling and user feedback features implemented in Task 28.

## Features Implemented

### 1. Detailed Error Messages for Extraction Failures

**Error Codes:**
- `WIDGET_NOT_FOUND` - No Elementor widget found at clicked location
- `SECTION_NOT_FOUND` - No Elementor section found at clicked location
- `COLUMN_NOT_FOUND` - No Elementor column found at clicked location
- `PAGE_NOT_FOUND` - No Elementor page found
- `EXTRACTION_FAILED` - Could not extract element data
- `CLIPBOARD_COMMUNICATION_FAILED` - Failed to communicate with extension
- `CLIPBOARD_WRITE_FAILED` - Failed to write to clipboard
- `UNEXPECTED_ERROR` - Unexpected error occurred

**Test Cases:**

#### Test 1.1: Widget Not Found
1. Open a non-Elementor page
2. Right-click anywhere
3. Select "Elementor Copier" → "Copy Widget"
4. **Expected:** Error notification with message: "No Elementor widget found at this location. Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets"

#### Test 1.2: Section Not Found
1. Open an Elementor page
2. Right-click on a non-section element (e.g., text)
3. Select "Elementor Copier" → "Copy Section"
4. **Expected:** Error notification with actionable guidance

#### Test 1.3: Page Not Found
1. Open a non-Elementor page
2. Open extension popup
3. Click "Copy Entire Page" (if available)
4. **Expected:** Error notification explaining the page is not built with Elementor

### 2. Retry Logic for Clipboard Operations

**Configuration:**
- Max Retries: 3
- Initial Delay: 1000ms
- Backoff Multiplier: 2 (delays: 1s, 2s, 4s)

**Test Cases:**

#### Test 2.1: Successful Retry
1. Open an Elementor page
2. Copy a widget
3. **Expected:** If first attempt fails, automatic retry with console logs showing retry attempts
4. Check browser console for retry messages: "Retrying clipboard operation in Xms (attempt Y/Z)..."

#### Test 2.2: Max Retries Reached
1. Disable clipboard permissions (if possible)
2. Try to copy a widget
3. **Expected:** After 3 retries, error notification with guidance to use manual copy

#### Test 2.3: Fallback to Manual Copy
1. After clipboard failure
2. Open extension popup
3. Click "Copy Again" button
4. **Expected:** Retry logic applies with visual feedback

### 3. Visual Feedback Animations for Successful Copy

**Test Cases:**

#### Test 3.1: Success Animation
1. Open an Elementor page
2. Copy a widget successfully
3. **Expected:** 
   - Green overlay appears in center of screen
   - Shows checkmark (✓) icon
   - Displays "Widget Copied!" message
   - Animates with pulse effect
   - Fades out after 1.5 seconds

#### Test 3.2: Different Element Types
1. Copy a widget → **Expected:** "Widget Copied!"
2. Copy a section → **Expected:** "Section Copied!"
3. Copy a column → **Expected:** "Column Copied!"
4. Copy entire page → **Expected:** "Page Copied!"

#### Test 3.3: Animation Timing
1. Copy multiple elements quickly
2. **Expected:** Each animation completes without overlap
3. Animations should not block user interaction

### 4. Improved Notification Messages with Actionable Guidance

**Test Cases:**

#### Test 4.1: Connection Error
1. Reload extension while on a page
2. Try to copy without refreshing page
3. **Expected:** "Extension was updated or reloaded. Please refresh the page."

#### Test 4.2: Permission Error
1. Revoke clipboard permissions (if possible)
2. Try to copy
3. **Expected:** "Permission denied. Please check browser permissions for this extension."

#### Test 4.3: Clipboard Error
1. Simulate clipboard failure
2. **Expected:** "Clipboard access failed. Try using the extension popup to copy manually."

#### Test 4.4: Success Notification
1. Copy any element successfully
2. **Expected:** 
   - Notification title: "✓ Elementor Copier"
   - Message: "[Element Type] copied to clipboard!"
   - Badge shows green checkmark for 2 seconds

#### Test 4.5: Error Notification
1. Trigger any error
2. **Expected:**
   - Notification title: "✗ Elementor Copier"
   - Message includes error code: "[ERROR_CODE] Error message"
   - Notification requires interaction (doesn't auto-dismiss)

### 5. Error Logging to Extension Console

**Test Cases:**

#### Test 5.1: Console Error Logging
1. Open browser console (F12)
2. Trigger any error
3. **Expected:** Grouped console error with:
   - Error code in red
   - Technical message
   - User message
   - Timestamp
   - URL
   - Elementor version
   - Original error (if applicable)

#### Test 5.2: Error Log Storage
1. Trigger multiple errors
2. Open extension popup
3. Click "View Errors" in footer
4. **Expected:** 
   - Error log section appears
   - Shows last 10 errors
   - Each error shows: code, message, time
   - "Clear Errors" button available

#### Test 5.3: Error Log Persistence
1. Trigger errors
2. Close and reopen popup
3. View errors
4. **Expected:** Errors persist in storage

#### Test 5.4: Clear Error Log
1. View error log
2. Click "Clear Errors"
3. **Expected:** 
   - Success message: "✓ Error log cleared"
   - Error list shows: "✓ No errors recorded"

#### Test 5.5: Error Log Access via Console
1. Open browser console
2. Type: `elementorCopierGetErrorLog()`
3. **Expected:** Returns array of error objects

### 6. Badge Updates

**Test Cases:**

#### Test 6.1: Success Badge
1. Copy element successfully
2. **Expected:** 
   - Badge shows "✓" in green
   - Disappears after 2 seconds

#### Test 6.2: Badge on Multiple Tabs
1. Open multiple Elementor pages
2. Copy from different tabs
3. **Expected:** Badge updates only on active tab

## Comprehensive Test Scenarios

### Scenario 1: Complete Success Flow
1. Open Elementor page
2. Right-click on widget
3. Select "Copy Widget"
4. **Expected:**
   - Success animation appears
   - Browser notification shows
   - Badge shows checkmark
   - Console logs success
   - No errors in error log

### Scenario 2: Complete Error Flow
1. Open non-Elementor page
2. Right-click anywhere
3. Select "Copy Widget"
4. **Expected:**
   - Error notification with guidance
   - Console shows detailed error
   - Error added to error log
   - Can view error in popup

### Scenario 3: Retry and Recovery
1. Simulate clipboard failure
2. Automatic retry occurs
3. Eventually succeeds or shows manual copy option
4. **Expected:**
   - Console shows retry attempts
   - User sees progress
   - Clear guidance on next steps

### Scenario 4: Error Log Management
1. Trigger 5 different errors
2. Open popup and view errors
3. Clear error log
4. Trigger new error
5. **Expected:**
   - All errors logged correctly
   - Can clear and start fresh
   - New errors appear after clearing

## Browser Console Commands

### View Error Log
```javascript
elementorCopierGetErrorLog()
```

### Check Storage
```javascript
chrome.storage.local.get(['errorLog', 'lastCopied'], console.log)
```

### Clear Storage
```javascript
chrome.storage.local.clear()
```

## Expected Console Output Examples

### Successful Copy
```
✓ Elementor detected on this page
✓ Data stored in chrome.storage
✓ Offscreen document created
✓ Data copied to clipboard via offscreen document
✓ Copied to clipboard
✓ Action completed successfully: {success: true, message: "Widget copied successfully!"}
```

### Error with Retry
```
✗ Error copying to clipboard (attempt 1/4): Error: Clipboard write failed
Retrying in 1000ms...
✗ Error copying to clipboard (attempt 2/4): Error: Clipboard write failed
Retrying in 2000ms...
✓ Data copied to clipboard via offscreen document
✓ Copied to clipboard
```

### Detailed Error
```
🔴 Elementor Copier Error [WIDGET_NOT_FOUND]
  Technical Message: No Elementor widget found at this location
  User Message: Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets
  Timestamp: 2025-10-15T12:00:00.000Z
  URL: https://example.com/page
  Elementor Version: 3.16.0
```

## Performance Expectations

- Success animation: < 2 seconds total
- Retry delays: 1s, 2s, 4s (exponential backoff)
- Error logging: < 50ms
- Notification display: Immediate
- Badge update: < 100ms

## Accessibility

- All notifications are screen-reader friendly
- Error messages are clear and actionable
- Visual feedback includes text descriptions
- Keyboard navigation supported in popup

## Notes

- Error log maintains last 50 errors in storage
- Content script maintains last 50 errors in memory
- Retry logic applies to both clipboard write and communication errors
- Success animations don't block user interaction
- All errors include actionable guidance for users
