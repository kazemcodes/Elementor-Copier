# Error Handling and Fallback Strategies Guide

## Overview

This guide explains how to use the error handling and fallback strategies modules in the Elementor Copier extension.

## Modules

### 1. Error Handler (`error-handler.js`)

Provides centralized error handling with categorization, user-friendly messages, and automatic fallback execution.

#### Usage Example

```javascript
// Import the error handler
const errorHandler = new ErrorHandler();

// Handle an error
try {
  // Some operation that might fail
  await detectElementorEditor();
} catch (error) {
  errorHandler.handleError(error, ErrorCategory.DETECTION, {
    retryCount: 0,
    retryCallback: () => detectElementorEditor()
  });
}
```

#### Error Categories

- `ErrorCategory.DETECTION` - Elementor editor detection failures
- `ErrorCategory.CLIPBOARD` - Clipboard access issues
- `ErrorCategory.CONVERSION` - Data format conversion errors
- `ErrorCategory.INJECTION` - Editor injection failures
- `ErrorCategory.VERSION` - Version compatibility issues

#### Key Methods

- `handleError(error, category, context)` - Main error handling method
- `getUserMessage(error, category, context)` - Get user-friendly error message
- `executeFallback(category, context)` - Execute appropriate fallback
- `hasRecentError(category, timeWindow)` - Check for recent errors
- `getErrorLog()` - Get error history

### 2. Fallback Strategies (`fallback-strategies.js`)

Provides alternative methods when primary operations fail.

#### Usage Example

```javascript
// Import fallback strategies
const fallbackStrategies = new FallbackStrategies();

// Try to write to clipboard with automatic fallback
const result = await fallbackStrategies.writeToClipboard(jsonData);

if (result.success) {
  console.log(`Copied using ${result.method}`);
} else {
  console.log('Manual paste instructions shown');
}
```

#### Key Features

**Clipboard Fallbacks:**
- Primary: Clipboard API (`navigator.clipboard`)
- Fallback 1: `execCommand('copy')`
- Fallback 2: Manual paste instructions with UI modal

**Conversion Fallbacks:**
- Best-effort conversion with warnings
- Version migration rules
- Raw data download option

**Manual Paste Instructions:**
- Interactive modal with copy/download buttons
- Step-by-step guidance
- Formatted JSON data display

#### Key Methods

- `writeToClipboard(text)` - Universal clipboard write with fallbacks
- `readFromClipboard()` - Universal clipboard read with fallbacks
- `attemptBestEffortConversion(data, sourceVersion, targetVersion)` - Version-aware conversion
- `createManualPasteInstructions(data, format)` - Generate manual instructions
- `offerRawDataDownload(data, conversionError)` - Download raw data
- `isClipboardAPIAvailable()` - Check API availability

## Integration Examples

### Example 1: Copy Operation with Error Handling

```javascript
async function copyElement(elementData) {
  const errorHandler = new ErrorHandler();
  const fallbackStrategies = new FallbackStrategies();
  
  try {
    // Convert data
    const convertedData = convertToNativeFormat(elementData);
    
    // Try to copy
    const result = await fallbackStrategies.writeToClipboard(
      JSON.stringify(convertedData)
    );
    
    if (result.success) {
      console.log('Copied successfully');
    } else {
      throw new Error('Clipboard write failed');
    }
  } catch (error) {
    errorHandler.handleError(error, ErrorCategory.CLIPBOARD, {
      data: elementData
    });
  }
}
```

### Example 2: Paste Operation with Version Compatibility

```javascript
async function pasteElement() {
  const errorHandler = new ErrorHandler();
  const fallbackStrategies = new FallbackStrategies();
  
  try {
    // Read from clipboard
    const result = await fallbackStrategies.readFromClipboard();
    
    if (!result.success) {
      throw new Error('Cannot read clipboard');
    }
    
    const data = JSON.parse(result.text);
    const sourceVersion = data.elementorVersion || '3.0.0';
    const targetVersion = getElementorVersion();
    
    // Check version compatibility
    if (sourceVersion !== targetVersion) {
      const conversion = fallbackStrategies.attemptBestEffortConversion(
        data,
        sourceVersion,
        targetVersion
      );
      
      if (conversion.warnings.length > 0) {
        console.warn('Conversion warnings:', conversion.warnings);
      }
      
      // Use converted data
      await injectIntoEditor(conversion.data);
    } else {
      await injectIntoEditor(data);
    }
  } catch (error) {
    errorHandler.handleError(error, ErrorCategory.CONVERSION, {
      data: data,
      sourceVersion,
      targetVersion
    });
  }
}
```

### Example 3: Detection with Retry Logic

```javascript
async function detectEditor() {
  const errorHandler = new ErrorHandler();
  let retryCount = 0;
  
  const attemptDetection = async () => {
    try {
      const isEditor = await detectElementorEditor();
      
      if (!isEditor) {
        throw new Error('Elementor editor not found');
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(error, ErrorCategory.DETECTION, {
        retryCount,
        retryCallback: () => {
          retryCount++;
          attemptDetection();
        }
      });
      return false;
    }
  };
  
  return attemptDetection();
}
```

## Best Practices

1. **Always use error categories** - This ensures appropriate fallbacks are executed
2. **Provide context** - Include relevant data and callbacks in the context object
3. **Check for recent errors** - Avoid retry loops by checking `hasRecentError()`
4. **Use universal methods** - Prefer `writeToClipboard()` over direct API calls
5. **Handle warnings** - Display conversion warnings to users
6. **Test fallbacks** - Verify fallback mechanisms work in different scenarios

## Error Context Object

The context object passed to `handleError()` can include:

```javascript
{
  retryCount: 0,              // Number of retry attempts
  retryCallback: () => {},    // Function to call for retry
  data: {},                   // Relevant data for fallback
  sourceVersion: '3.0.0',     // Source Elementor version
  targetVersion: '4.0.0',     // Target Elementor version
  attemptBestEffort: true     // Whether to attempt conversion
}
```

## Testing

### Test Clipboard Fallbacks

```javascript
// Simulate clipboard API unavailable
delete navigator.clipboard;

const fallbackStrategies = new FallbackStrategies();
const result = await fallbackStrategies.writeToClipboard('test data');

console.log('Method used:', result.method); // Should be 'execCommand' or 'manual'
```

### Test Error Handling

```javascript
const errorHandler = new ErrorHandler();

// Simulate various errors
errorHandler.handleError(
  new Error('Editor not found'),
  ErrorCategory.DETECTION,
  { retryCount: 0 }
);

// Check error log
console.log(errorHandler.getErrorLog());
```

## Troubleshooting

### Issue: Fallback not executing

**Solution:** Ensure the error category matches one of the defined categories in `ErrorCategory`.

### Issue: Manual instructions not showing

**Solution:** Check that the DOM is ready and no CSP restrictions are blocking the modal.

### Issue: execCommand not working

**Solution:** Verify the page has focus and the command is supported: `document.queryCommandSupported('copy')`.

### Issue: Version conversion warnings

**Solution:** Review the warnings array and adjust the conversion rules in `applyVersionMigrations()`.

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 3.6**: Fallback mechanisms for clipboard operations
- **Requirement 5.6**: Graceful error handling in injected code
- **Requirement 8.4**: Error notifications with troubleshooting guidance
- **Requirement 8.6**: Invalid clipboard data handling
- **Requirement 9.5**: Notification when conversion is not possible
- **Requirement 9.6**: Version compatibility matrix maintenance

## Future Enhancements

- Add telemetry for error tracking
- Implement smart retry with exponential backoff
- Add more version-specific migration rules
- Create visual error dashboard
- Support custom error handlers per module
