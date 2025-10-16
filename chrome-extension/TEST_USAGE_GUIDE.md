# End-to-End Test Usage Guide

## Quick Start

1. **Open the test file** in your browser:
   ```
   chrome-extension/test-end-to-end-paste.html
   ```

2. **Run all tests** by clicking the "Run All Tests" button

3. **Or run individual tests** by clicking the test-specific buttons

## Test Structure

### Extension Data Format
All tests use this standard format:

```javascript
const extensionData = {
  type: 'elementor-copier',           // Required: identifies our extension data
  version: '1.0.0',                   // Required: extension version
  metadata: {
    elementorVersion: '3.5.0',        // Source Elementor version
    sourceURL: 'https://example.com', // Where element was copied from
    copiedAt: new Date().toISOString() // Optional: timestamp
  },
  data: {
    elType: 'widget',                 // Element type: widget, section, column
    widgetType: 'heading',            // Widget type (if elType is widget)
    id: 'abc12345',                   // Unique 8-char hex ID
    settings: {                       // Widget/element settings
      title: 'Test Heading',
      header_size: 'h2'
    },
    elements: []                      // Child elements (for sections/columns)
  }
};
```

### Module Usage

#### ElementorFormatConverter (Object)
```javascript
// ✅ CORRECT - It's an object with methods
const converter = window.ElementorFormatConverter;
const nativeFormat = converter.convertToNativeFormat(extensionData);

// ❌ WRONG - Don't use 'new'
const converter = new ElementorFormatConverter();  // TypeError!
```

#### Other Modules (Classes)
```javascript
// ✅ CORRECT - These are classes, use 'new'
const clipboardManager = new ClipboardManager();
const editorDetector = new ElementorEditorDetector();
const editorInjector = new EditorContextInjector();
const versionManager = new VersionCompatibilityManager();
const notificationManager = new NotificationManager();
const mediaHandler = new MediaURLHandler();
const pasteInterceptor = new PasteInterceptor();
```

## Test Coverage

### Widget Tests (Tests 1-3)
- **Test 1: Heading Widget** - Basic widget with text settings
- **Test 2: Button Widget** - Widget with link and styling
- **Test 3: Image Widget** - Widget with media URLs

### Structure Tests (Tests 4-5)
- **Test 4: Section with Columns** - Multi-column layout
- **Test 5: Nested Structure** - Section → Column → Widgets hierarchy

### Validation Tests (Tests 6-8)
- **Test 6: Settings Preservation** - Complex settings with typography, shadows, spacing
- **Test 7: Element Editability** - Validates element structure for Elementor editor
- **Test 8: Undo/Redo** - Tests history API integration

### Integration Tests (Tests 9-10)
- **Test 9: Complete Integration** - Full workflow with all modules
- **Test 10: Multiple Widget Types** - Tests 8 different widget types

## Common Patterns

### Basic Widget Test
```javascript
async function testWidget() {
  try {
    // 1. Create extension data
    const extensionData = {
      type: 'elementor-copier',
      version: '1.0.0',
      metadata: {
        elementorVersion: '3.5.0',
        sourceURL: 'https://example.com'
      },
      data: {
        elType: 'widget',
        widgetType: 'heading',
        id: 'test12345',
        settings: { title: 'Test' },
        elements: []
      }
    };

    // 2. Get converter
    const converter = window.ElementorFormatConverter;

    // 3. Convert to native format
    const nativeFormat = converter.convertToNativeFormat(extensionData);

    // 4. Validate result
    if (!nativeFormat || !nativeFormat.widgetType) {
      throw new Error('Conversion failed');
    }

    // 5. Display success
    displayResult('test-result', '✓ PASS: Test completed', 'success');
    markTestPassed();
    return true;
  } catch (error) {
    displayResult('test-result', `✗ FAIL: ${error.message}`, 'error');
    markTestFailed();
    return false;
  }
}
```

### Section with Nested Elements
```javascript
const extensionData = {
  type: 'elementor-copier',
  version: '1.0.0',
  metadata: {
    elementorVersion: '3.5.0',
    sourceURL: 'https://example.com'
  },
  data: {
    elType: 'section',
    id: 'sec12345',
    settings: { layout: 'boxed' },
    elements: [
      {
        elType: 'column',
        id: 'col12345',
        settings: { _column_size: 100 },
        elements: [
          {
            elType: 'widget',
            widgetType: 'heading',
            id: 'wid12345',
            settings: { title: 'Nested Widget' },
            elements: []
          }
        ]
      }
    ]
  }
};
```

### With Version Conversion
```javascript
// 1. Check compatibility
const versionManager = new VersionCompatibilityManager();
const compatibility = versionManager.isCompatible('3.0.0', '3.5.0');

// 2. Convert version if needed
const conversionResult = versionManager.convertVersion(
  extensionData.data,
  '3.0.0',  // source version
  '3.5.0'   // target version
);

// 3. Update extension data with converted data
const convertedExtensionData = {
  ...extensionData,
  data: conversionResult.data
};

// 4. Convert to native format
const converter = window.ElementorFormatConverter;
const nativeFormat = converter.convertToNativeFormat(convertedExtensionData);
```

## Debugging

### Check Console Logs
The converter logs detailed information:
```
Converting from extension format (Elementor 3.5.0) to native format (Elementor 3.5.0)
Sanitizing converted data...
✓ Sanitization complete
```

### Inspect Test Results
Each test shows:
- ✓ Step-by-step execution
- ✓ Converted data structure
- ✓ Validation results
- ✓ Error messages (if any)

### Common Issues

**Issue: "ElementorFormatConverter is not a constructor"**
```javascript
// ❌ WRONG
const converter = new ElementorFormatConverter();

// ✅ CORRECT
const converter = window.ElementorFormatConverter;
```

**Issue: "Invalid extension data: missing data property"**
```javascript
// ❌ WRONG
converter.convertToNativeFormat(extensionData.data);

// ✅ CORRECT
converter.convertToNativeFormat(extensionData);
```

**Issue: "Sanitization failed: data was rejected"**
- Check for malicious content in settings
- Verify all URLs are valid
- Check for script tags or event handlers

## Requirements Mapping

| Test | Requirements Verified |
|------|----------------------|
| Test 1 | Req 1.5 - Extension data conversion |
| Test 4 | Req 2.4 - Hierarchical structure |
| Test 5 | Req 2.4 - Nested widgets |
| Test 6 | Req 2.3 - Settings preservation |
| Test 8 | Req 7.7 - Undo/redo functionality |

## Expected Results

### All Tests Pass
```
Total Tests: 10
Passed: 10
Failed: 0
Pending: 0
```

### Requirements Status
- ✅ Requirement 1.5: PASS
- ✅ Requirement 2.3: PASS
- ✅ Requirement 2.4: PASS
- ✅ Requirement 7.7: PASS

## Next Steps After Testing

1. **If all tests pass:**
   - Document any edge cases found
   - Test with real Elementor editor
   - Verify in different browsers

2. **If tests fail:**
   - Check console for detailed errors
   - Verify module files are loaded
   - Check Elementor mock environment
   - Review test data structure

3. **For production:**
   - Run tests after any code changes
   - Add new tests for new features
   - Update tests when Elementor API changes
