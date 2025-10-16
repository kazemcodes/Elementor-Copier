# 🧪 Testing Guide - Elementor Copier

## Quick Test Checklist

### 1. Installation Test
- [ ] Load extension in Chrome (`chrome://extensions/`)
- [ ] Enable Developer mode
- [ ] Load unpacked extension
- [ ] Extension icon appears in toolbar
- [ ] No errors in console

### 2. Elementor Detection Test

**Test on Elementor Page:**
1. Open any WordPress site with Elementor
2. Open browser console (F12)
3. Look for these messages:
   ```
   ✓ Elementor detected on this page
   [Init] Extension initialized successfully
   ```

**Test on Non-Elementor Page:**
1. Open any regular webpage
2. Check console for:
   ```
   ✗ Elementor not detected on this page
   ```

### 3. Highlight Mode Test

**Enable Highlight Mode:**
1. Go to an Elementor page
2. Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
3. Should see notification: "Element selector enabled!"
4. Console should show:
   ```
   [Highlight] Enabling highlight mode...
   [Highlight] Found X Elementor elements
   ```

**Hover Test:**
1. Move mouse over Elementor elements
2. Elements should highlight with colored outlines:
   - Blue for widgets
   - Green for sections
   - Yellow for columns
3. Outline should be 3px solid with 2px offset

**Disable Highlight Mode:**
1. Press `Ctrl+Shift+X`
2. Should see notification: "Element selector disabled"
3. Highlights should disappear

### 4. Copy Function Test

**Copy via Highlight Mode:**
1. Press `Ctrl+Shift+C` to enable selector
2. Hover over an element
3. Click on the element
4. Should see notification about copying
5. Console should show copy operation
6. Highlight mode should auto-disable

**Copy via Context Menu:**
1. Right-click on any Elementor element
2. Select "Elementor Copier" from menu
3. Choose "Copy Widget" or "Copy Section"
4. Should see success message

### 5. Console Logging Test

Open console and verify these logs appear:

**On Page Load:**
```
🚀 [v2.0] Content script starting...
[Detector] Starting Elementor detection...
✓ Elementor detected on this page
[Init] Initializing extension features...
[Init] Extension initialized successfully
```

**On Highlight Enable:**
```
[Keyboard] Element selector shortcut triggered
[Highlight] Enabling highlight mode...
[Highlight] Found X Elementor elements
[Highlight] Highlight mode enabled for X elements
```

**On Element Click:**
```
[Click] Element clicked: widget.heading
[Copy] Copying widget...
```

### 6. Error Handling Test

**No Elementor Elements:**
1. Enable highlight mode on page with no Elementor
2. Should see alert: "No Elementor elements found on this page"

**Retry Detection:**
1. Load page before Elementor loads
2. Should see retry attempt after 2 seconds:
   ```
   [Detector] Retrying detection...
   ```

## Detailed Testing Scenarios

### Scenario 1: Copy Widget
1. Open Elementor editor
2. Press `Ctrl+Shift+C`
3. Hover over a heading widget
4. Click to copy
5. Open another Elementor editor
6. Press `Ctrl+V` to paste
7. Verify widget appears with all settings

### Scenario 2: Copy Section
1. Open Elementor editor
2. Press `Ctrl+Shift+C`
3. Hover over a section
4. Click to copy
5. Open another Elementor editor
6. Press `Ctrl+V` to paste
7. Verify entire section appears

### Scenario 3: Copy Column
1. Open Elementor editor
2. Press `Ctrl+Shift+C`
3. Hover over a column
4. Click to copy
5. Open another Elementor editor
6. Press `Ctrl+V` to paste
7. Verify column with widgets appears

### Scenario 4: Keyboard Shortcuts
1. Test `Ctrl+Shift+C` - Enable selector
2. Test `Ctrl+Shift+X` - Disable selector
3. Test `ESC` - Cancel (if implemented)
4. Verify notifications appear for each

### Scenario 5: Context Menu
1. Right-click on widget
2. Verify "Elementor Copier" menu appears
3. Click "Copy Widget"
4. Verify success message
5. Repeat for section

## Browser Console Commands

### Check if Elementor is Detected
```javascript
// Run in console
document.querySelectorAll('[data-element_type]').length
```
Should return number > 0 on Elementor pages

### Check Extension State
```javascript
// Check if content script loaded
console.log('Extension loaded:', typeof chrome !== 'undefined' && chrome.runtime);
```

### Manual Detection Test
```javascript
// Check for Elementor markers
console.log({
  hasElementorType: document.querySelector('[data-elementor-type]') !== null,
  hasElementorId: document.querySelector('[data-elementor-id]') !== null,
  hasElementType: document.querySelector('[data-element_type]') !== null,
  isEditor: window.location.href.includes('action=elementor')
});
```

## Common Issues & Solutions

### Issue: "No Elementor elements found"
**Cause:** Not on an Elementor page
**Solution:** Navigate to a page built with Elementor

### Issue: Highlight mode doesn't work
**Cause:** Extension not loaded or Elementor not detected
**Solution:** 
1. Refresh the page
2. Check console for errors
3. Verify extension is enabled

### Issue: Copy doesn't work
**Cause:** Element not properly selected
**Solution:**
1. Make sure element is highlighted
2. Check console for error messages
3. Try context menu instead

### Issue: Paste doesn't work
**Cause:** Not in Elementor editor
**Solution:**
1. Make sure you're in edit mode (not preview)
2. Click inside the editor canvas first
3. Try right-click paste

## Performance Testing

### Load Time Test
1. Open Elementor page
2. Note time until "Extension initialized" message
3. Should be < 1 second

### Highlight Performance
1. Enable highlight mode
2. Move mouse rapidly over elements
3. Should be smooth with no lag

### Copy Performance
1. Copy a large section
2. Should complete in < 2 seconds
3. Check console for timing logs

## Regression Testing

After any code changes, verify:
- [ ] Detection still works
- [ ] Highlight mode still works
- [ ] Copy still works
- [ ] Paste still works
- [ ] Keyboard shortcuts still work
- [ ] Context menu still works
- [ ] No new console errors

## Test Matrix

| Browser | OS | Elementor Version | Status |
|---------|----|--------------------|--------|
| Chrome | Windows | 3.x | ✅ |
| Chrome | Mac | 3.x | ⏳ |
| Edge | Windows | 3.x | ⏳ |
| Brave | Windows | 3.x | ⏳ |

## Automated Testing (Future)

### Unit Tests Needed
- [ ] detectElementor()
- [ ] enableHighlightMode()
- [ ] copyWidget()
- [ ] copySection()

### Integration Tests Needed
- [ ] Full copy/paste workflow
- [ ] Cross-site compatibility
- [ ] Media URL handling

### E2E Tests Needed
- [ ] Install extension
- [ ] Copy element
- [ ] Paste element
- [ ] Verify result

## Bug Report Template

If you find a bug, report with:

```
**Bug Description:**
[What happened]

**Expected Behavior:**
[What should happen]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Environment:**
- Browser: [Chrome/Edge/etc]
- Version: [Browser version]
- OS: [Windows/Mac/Linux]
- Elementor Version: [Version]

**Console Errors:**
[Paste any console errors]

**Screenshots:**
[If applicable]
```

## Success Criteria

Extension is working correctly if:
- ✅ Detects Elementor on all Elementor pages
- ✅ Highlight mode activates with keyboard shortcut
- ✅ Elements highlight on hover
- ✅ Click copies element
- ✅ Paste works in Elementor editor
- ✅ No console errors
- ✅ Notifications appear
- ✅ Context menu works

---

**Last Updated:** October 2025
**Version:** 1.0.0
**Status:** Ready for Testing
