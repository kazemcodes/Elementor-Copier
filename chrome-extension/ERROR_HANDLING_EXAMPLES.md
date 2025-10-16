# Error Handling Examples

This document provides real-world examples of the enhanced error handling and user feedback system.

## Example 1: Widget Not Found Error

### Scenario
User right-clicks on a non-widget element and tries to copy a widget.

### User Experience

**1. Browser Notification:**
```
✗ Elementor Copier
[WIDGET_NOT_FOUND] No Elementor widget found at this location. 
Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets
```

**2. Console Output:**
```javascript
🔴 Elementor Copier Error [WIDGET_NOT_FOUND]
  Technical Message: No Elementor widget found at this location
  User Message: Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets
  Timestamp: 2025-10-15T14:30:22.123Z
  URL: https://example.com/sample-page
  Elementor Version: 3.16.0
```

**3. Error Log Entry:**
```
[WIDGET_NOT_FOUND]
Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets
5 minutes ago
```

---

## Example 2: Successful Copy with Retry

### Scenario
Clipboard API temporarily fails but succeeds on retry.

### User Experience

**1. Console Output:**
```javascript
✓ Elementor detected on this page
✓ Data stored in chrome.storage
✗ Error copying to clipboard (attempt 1/4): Error: Clipboard write failed
Retrying clipboard operation in 1000ms (attempt 1/3)...
✓ Offscreen document created
✓ Data copied to clipboard via offscreen document
✓ Copied to clipboard
✓ Action completed successfully: {success: true, message: "Widget copied successfully!"}
```

**2. Success Animation:**
```
┌─────────────────────────┐
│                         │
│          ✓              │
│                         │
│    Widget Copied!       │
│                         │
└─────────────────────────┘
(Green overlay, center screen, 1.5 seconds)
```

**3. Browser Notification:**
```
✓ Elementor Copier
Widget copied to clipboard!
```

**4. Badge Update:**
```
Extension icon badge: ✓ (green, 2 seconds)
```

---

## Example 3: Max Retries Reached

### Scenario
Clipboard API fails after all retry attempts.

### User Experience

**1. Console Output:**
```javascript
✗ Error copying to clipboard (attempt 1/4): Error: Clipboard access denied
Retrying in 1000ms...
✗ Error copying to clipboard (attempt 2/4): Error: Clipboard access denied
Retrying in 2000ms...
✗ Error copying to clipboard (attempt 3/4): Error: Clipboard access denied
Retrying in 4000ms...
✗ Error copying to clipboard (attempt 4/4): Error: Clipboard access denied
✗ Fallback copy also failed: Error: Manual copy required
🔴 Elementor Copier Error [CLIPBOARD_WRITE_FAILED]
  Technical Message: Failed to copy to clipboard
  User Message: Check browser clipboard permissions. You can also try using the extension popup to copy manually.
  Timestamp: 2025-10-15T14:35:10.456Z
  URL: https://example.com/sample-page
  Elementor Version: 3.16.0
```

**2. Browser Notification:**
```
✗ Elementor Copier
[CLIPBOARD_WRITE_FAILED] Check browser clipboard permissions. 
You can also try using the extension popup to copy manually.
(Requires interaction - doesn't auto-dismiss)
```

**3. User Action:**
User opens extension popup and clicks "Copy Again" button, which triggers another retry sequence.

---

## Example 4: Extension Context Invalidated

### Scenario
Extension is reloaded while user is on a page, then user tries to copy.

### User Experience

**1. Console Output:**
```javascript
✗ Runtime error: Error: Extension context invalidated. Extensions must be reloaded from chrome://extensions.
🔴 Elementor Copier Error [CLIPBOARD_COMMUNICATION_FAILED]
  Technical Message: Failed to communicate with extension
  User Message: Extension was updated or reloaded. Please refresh the page.
  Timestamp: 2025-10-15T14:40:33.789Z
  URL: https://example.com/sample-page
  Elementor Version: 3.16.0
  Original Error: Error: Extension context invalidated
```

**2. Browser Notification:**
```
✗ Elementor Copier
Extension was updated or reloaded. Please refresh the page.
```

**3. User Action:**
User refreshes the page and can copy successfully.

---

## Example 5: Viewing Error Log

### Scenario
User wants to see recent errors.

### User Experience

**1. Open Popup:**
User clicks extension icon to open popup.

**2. Click "View Errors":**
User clicks "View Errors" link in footer.

**3. Error Log Display:**
```
Recent Errors:

┌─────────────────────────────────────────────────────┐
│ [CLIPBOARD_WRITE_FAILED]                            │
│ Check browser clipboard permissions. You can also   │
│ try using the extension popup to copy manually.     │
│ 2 minutes ago                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [WIDGET_NOT_FOUND]                                  │
│ Try right-clicking directly on a widget element,    │
│ or enable Highlight Mode to see available widgets   │
│ 5 minutes ago                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ [SECTION_NOT_FOUND]                                 │
│ Try right-clicking on a section container, or       │
│ enable Highlight Mode to see available sections     │
│ 10 minutes ago                                      │
└─────────────────────────────────────────────────────┘

[Clear Errors]
```

**4. Clear Errors:**
User clicks "Clear Errors" button.

**5. Success Message:**
```
✓ Error log cleared
```

**6. Updated Display:**
```
Recent Errors:

✓ No errors recorded
```

---

## Example 6: Successful Section Copy

### Scenario
User successfully copies a section with multiple widgets.

### User Experience

**1. Right-Click Menu:**
User right-clicks on section → "Elementor Copier" → "Copy Section"

**2. Console Output:**
```javascript
Context menu clicked: copy-section
Message received in content script: {action: "copy-section"}
Extracted 5 media items from element
✓ Data stored in chrome.storage
✓ Data copied to clipboard via offscreen document
✓ Copied to clipboard
✓ Action completed successfully: {success: true, message: "Section copied successfully!", elementType: "section"}
```

**3. Success Animation:**
```
┌─────────────────────────┐
│                         │
│          ✓              │
│                         │
│   Section Copied!       │
│                         │
└─────────────────────────┘
(Green overlay with pulse animation)
```

**4. Browser Notification:**
```
✓ Elementor Copier
Section copied to clipboard!
```

**5. Badge Update:**
```
Extension icon badge: ✓ (green background)
(Disappears after 2 seconds)
```

**6. Popup Update:**
User opens popup and sees:
```
Last Copied:
Section
Just now

[View Data] [Copy Again]
```

---

## Example 7: Manual Copy from Popup

### Scenario
User wants to manually copy data from popup after automatic copy failed.

### User Experience

**1. Open Popup:**
User clicks extension icon.

**2. Click "Copy Again":**
User clicks "Copy Again" button.

**3. Retry Sequence:**
```javascript
Clipboard API failed (3 retries left): Error: Permission denied
Retrying in 500ms...
Clipboard API failed (2 retries left): Error: Permission denied
Retrying in 500ms...
Clipboard API failed (1 retries left): Error: Permission denied
Retrying in 500ms...
All clipboard attempts failed
```

**4. Fallback Modal:**
Modal opens with JSON data:
```
Clipboard Data
×

{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget",
  "data": {
    "id": "abc123",
    "elType": "widget.heading",
    ...
  },
  ...
}

[Copy to Clipboard] [Close]
```

**5. Error Message:**
```
Clipboard access failed. Please copy manually from the modal (Ctrl+C)
```

**6. User Action:**
User selects all text (Ctrl+A) and copies (Ctrl+C), then closes modal.

---

## Example 8: Debugging with Console

### Scenario
Developer wants to debug error log.

### Console Commands

**1. View Error Log:**
```javascript
> elementorCopierGetErrorLog()

[
  {
    code: "CLIPBOARD_WRITE_FAILED",
    technicalMessage: "Failed to copy to clipboard",
    userMessage: "Check browser clipboard permissions...",
    timestamp: "2025-10-15T14:30:22.123Z",
    url: "https://example.com/page",
    elementorVersion: "3.16.0"
  },
  {
    code: "WIDGET_NOT_FOUND",
    technicalMessage: "No Elementor widget found at this location",
    userMessage: "Try right-clicking directly on a widget element...",
    timestamp: "2025-10-15T14:25:10.456Z",
    url: "https://example.com/page",
    elementorVersion: "3.16.0"
  }
]
```

**2. Check Storage:**
```javascript
> chrome.storage.local.get(['errorLog', 'lastCopied'], console.log)

{
  errorLog: [...],
  lastCopied: {
    version: "1.0.0",
    type: "elementor-copier",
    elementType: "widget",
    ...
  }
}
```

**3. Clear Storage:**
```javascript
> chrome.storage.local.clear()
> console.log('Storage cleared')
```

---

## Example 9: Page Not Found Error

### Scenario
User tries to copy entire page on a non-Elementor page.

### User Experience

**1. Console Output:**
```javascript
✗ Elementor not detected on this page
Context menu clicked: copy-page
Message received in content script: {action: "copy-page"}
🔴 Elementor Copier Error [PAGE_NOT_FOUND]
  Technical Message: No Elementor page found
  User Message: This page may not be built with Elementor, or Elementor data is not accessible. Try copying individual sections instead.
  Timestamp: 2025-10-15T14:50:15.789Z
  URL: https://example.com/non-elementor-page
  Elementor Version: unknown
```

**2. Browser Notification:**
```
✗ Elementor Copier
[PAGE_NOT_FOUND] This page may not be built with Elementor, 
or Elementor data is not accessible. Try copying individual sections instead.
```

**3. Popup Status:**
```
✗ Elementor Not Detected

This page doesn't appear to use Elementor.
```

---

## Example 10: Extraction Failed Error

### Scenario
Element has invalid structure and data extraction fails.

### User Experience

**1. Console Output:**
```javascript
Context menu clicked: copy-widget
Message received in content script: {action: "copy-widget"}
Error extracting element data: TypeError: Cannot read property 'getAttribute' of null
🔴 Elementor Copier Error [EXTRACTION_FAILED]
  Technical Message: Could not extract widget data
  User Message: The widget may have an invalid structure. Try copying the parent section instead.
  Timestamp: 2025-10-15T14:55:30.123Z
  URL: https://example.com/sample-page
  Elementor Version: 3.16.0
  Original Error: TypeError: Cannot read property 'getAttribute' of null
```

**2. Browser Notification:**
```
✗ Elementor Copier
[EXTRACTION_FAILED] The widget may have an invalid structure. 
Try copying the parent section instead.
```

**3. User Action:**
User follows guidance and copies the parent section successfully.

---

## Summary of User Benefits

### Clear Communication
- Every error has a specific code
- Technical details in console for developers
- User-friendly messages for end users
- Actionable guidance for resolution

### Automatic Recovery
- Retry logic handles transient failures
- Exponential backoff prevents overwhelming the system
- Fallback to manual copy when needed

### Professional Feedback
- Success animations provide immediate confirmation
- Browser notifications keep users informed
- Badge updates show status at a glance
- Error log provides history for troubleshooting

### Easy Debugging
- Comprehensive console logging
- Error log accessible via popup
- Console commands for developers
- Persistent error history

### Improved Reliability
- Handles edge cases gracefully
- Provides multiple fallback options
- Clear guidance for problem resolution
- Professional error handling throughout
