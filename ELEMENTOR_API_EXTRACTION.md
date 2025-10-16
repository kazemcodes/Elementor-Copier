# Elementor API Data Extraction

## Overview

Version 1.2.0 introduces a major improvement to how Elementor Copier extracts element data. Instead of only reading HTML attributes and rendered content, the extension now accesses Elementor's internal API to get the actual element data with proper settings and structure.

## The Problem (Before v1.2.0)

### Old Method: DOM Extraction Only
The extension was extracting data from:
- `data-element_type` attribute
- `data-settings` attribute (often incomplete or missing)
- `data-id` attribute
- Rendered HTML content

### Limitations
- ❌ **Incomplete Settings**: Many settings not available in DOM attributes
- ❌ **Missing Data**: Complex widget configurations lost
- ❌ **HTML Only**: Fallback to rendered HTML for missing data
- ❌ **Poor Paste Quality**: Pasted elements missing functionality

### Example of Old Extraction
```javascript
// Old method - only gets what's in DOM
const data = {
  id: element.getAttribute('data-id'),
  elType: element.getAttribute('data-element_type'),
  settings: JSON.parse(element.getAttribute('data-settings') || '{}'),
  renderedContent: element.innerHTML // Fallback
};
```

## The Solution (v1.2.0+)

### New Method: Elementor API Access
The extension now:
1. **Accesses Elementor's internal API** (`window.elementor`)
2. **Gets element models** directly from Elementor's data structure
3. **Extracts complete data** with all settings and configurations
4. **Falls back to DOM** when API is not available (frontend pages)

### Benefits
- ✅ **Complete Settings**: All element settings preserved
- ✅ **Full Widget Data**: Widget configurations copied perfectly
- ✅ **Proper Structure**: Nested elements maintain relationships
- ✅ **Better Paste**: Elements work correctly in target editor
- ✅ **Native Format**: Data in Elementor's native format

### Example of New Extraction
```javascript
// New method - gets actual Elementor data
const elementModel = elementor.elements.findWhere({ id: elementId });
const data = {
  id: elementModel.get('id'),
  elType: elementModel.get('elType'),
  settings: elementModel.get('settings'), // Complete settings!
  widgetType: elementModel.get('widgetType'),
  elements: elementModel.get('elements') // Nested elements
};
```

## How It Works

### 1. Initialization
```javascript
// Wait for Elementor to load
await dataExtractor.initialize();
// Now has access to window.elementor
```

### 2. Element Model Lookup
```javascript
// Get element ID from DOM
const elementId = domElement.getAttribute('data-id');

// Find model in Elementor's collections
const model = elementor.elements.findWhere({ id: elementId });
```

### 3. Data Extraction
```javascript
// Extract complete data from model
const data = dataExtractor.modelToData(model);
// Returns proper Elementor format with all settings
```

### 4. Automatic Fallback
```javascript
// If API not available, falls back to DOM
if (!dataExtractor.isInEditor()) {
  return dataExtractor.extractFromDOM(element);
}
```

## Technical Details

### Module: `elementor-data-extractor.js`

#### Key Methods

**`initialize()`**
- Waits for Elementor to load
- Stores reference to `window.elementor`
- Returns promise when ready

**`extractElementData(domElement)`**
- Main extraction method
- Gets element ID from DOM
- Finds model in Elementor
- Converts model to data
- Falls back to DOM if needed

**`getElementModel(elementId)`**
- Searches Elementor's collections
- Checks multiple locations:
  - `elementor.elements.models`
  - `elementor.getPreviewView().collection`
  - `elementor.documents.currentDocument.container`
- Returns model or null

**`modelToData(model)`**
- Converts Elementor model to data object
- Extracts all attributes
- Recursively processes children
- Returns complete element data

**`extractFromDOM(element)`**
- Fallback method for frontend pages
- Reads DOM attributes
- Extracts rendered content
- Returns basic element data

### Integration with Content Script

```javascript
// In content-v2.js
function extractElementData(element) {
  // Try API method first
  if (dataExtractor && dataExtractor.initialized) {
    const data = dataExtractor.extractElementData(element);
    if (data) return data;
  }
  
  // Fall back to DOM method
  return extractFromDOM(element);
}
```

## Comparison

### Before (v1.1.0)

**Copying a Button Widget:**
```json
{
  "id": "abc123",
  "elType": "widget.button",
  "settings": {
    // Only basic settings from data-settings attribute
    "text": "Click Me"
  },
  "renderedContent": "<a href='#'>Click Me</a>"
}
```

**Result**: Pastes as HTML widget with rendered content only.

### After (v1.2.0)

**Copying a Button Widget:**
```json
{
  "id": "abc123",
  "elType": "widget",
  "widgetType": "button",
  "settings": {
    // Complete settings from Elementor model
    "text": "Click Me",
    "link": { "url": "#", "is_external": false },
    "size": "md",
    "button_type": "primary",
    "icon": { "value": "fas fa-arrow-right" },
    "icon_align": "right",
    "button_css_id": "",
    "_element_id": "",
    "_css_classes": "",
    // ... all other settings
  },
  "elements": []
}
```

**Result**: Pastes as proper Button widget with all functionality.

## When Each Method is Used

### API Method (Preferred)
Used when:
- ✅ In Elementor editor
- ✅ `window.elementor` is available
- ✅ Element model can be found
- ✅ User is editing a page

**Advantages:**
- Complete data
- All settings preserved
- Proper widget types
- Native Elementor format

### DOM Method (Fallback)
Used when:
- ⚠️ On frontend (not in editor)
- ⚠️ Elementor API not available
- ⚠️ Element model not found
- ⚠️ Viewing published page

**Advantages:**
- Still works on frontend
- Extracts what's available
- Better than nothing
- Includes rendered content

## User Experience

### For Users Copying from Editor
1. Open Elementor editor
2. Right-click on element
3. Select "Copy"
4. **Gets complete element data via API** ✨
5. Paste in another editor
6. **Element works perfectly** ✨

### For Users Copying from Frontend
1. View published page
2. Right-click on element
3. Select "Copy"
4. **Gets basic data from DOM** ⚠️
5. Paste in editor
6. **Element may need adjustments** ⚠️

## Best Practices

### For Best Results
1. **Copy from Editor**: Always copy from Elementor editor when possible
2. **Check Settings**: Verify settings after pasting
3. **Test Functionality**: Test interactive elements after paste
4. **Use Latest Version**: Keep extension updated

### For Developers
1. **Check Initialization**: Ensure data extractor is initialized
2. **Handle Fallback**: Always have DOM fallback ready
3. **Log Extraction**: Log which method was used
4. **Test Both Methods**: Test API and DOM extraction

## Troubleshooting

### API Extraction Not Working

**Symptoms:**
- Extension falls back to DOM method in editor
- Missing settings after paste
- Console shows "Data extractor not available"

**Solutions:**
1. **Reload Page**: Refresh Elementor editor
2. **Check Console**: Look for initialization errors
3. **Wait for Load**: Ensure Elementor fully loaded
4. **Reinstall Extension**: Reload extension in chrome://extensions/

### DOM Extraction Issues

**Symptoms:**
- Incomplete data on frontend
- Missing widget functionality
- HTML-only paste

**Solutions:**
1. **Copy from Editor**: Use editor instead of frontend
2. **Check Attributes**: Verify data-settings attribute exists
3. **Manual Adjustment**: Adjust settings after paste
4. **Report Issue**: If data should be available but isn't

## Future Improvements

### Planned Enhancements
- [ ] Cache element models for faster extraction
- [ ] Support for Elementor Pro widgets
- [ ] Better handling of dynamic content
- [ ] Extraction from Elementor templates
- [ ] Support for global widgets

### Potential Features
- [ ] Batch extraction of multiple elements
- [ ] Element comparison (source vs target)
- [ ] Settings migration tools
- [ ] Widget type conversion helpers

## Technical Notes

### Elementor API Versions

**Elementor 2.x:**
- Uses Backbone models
- `elementor.elements.models`
- `model.get('attribute')`

**Elementor 3.x+:**
- Uses Container system
- `elementor.documents.currentDocument.container`
- `container.model` or direct access

**Compatibility:**
- Extension supports both versions
- Tries multiple lookup methods
- Falls back gracefully

### Performance

**API Method:**
- Fast: Direct model access
- Efficient: No DOM parsing
- Reliable: Official API

**DOM Method:**
- Slower: DOM traversal required
- Limited: Only visible data
- Fallback: When API unavailable

## Summary

Version 1.2.0 brings a major improvement to Elementor Copier by accessing Elementor's internal API for data extraction. This results in:

- ✅ **Better Copy Quality**: Complete element data with all settings
- ✅ **Improved Paste**: Elements work correctly in target editor
- ✅ **Native Format**: Data in Elementor's native format
- ✅ **Backward Compatible**: Falls back to DOM when needed

The extension now provides professional-grade copy/paste functionality that rivals Elementor's built-in clipboard!

---

**Version**: 1.2.0
**Date**: 2025-10-16
**Status**: Implemented and tested
