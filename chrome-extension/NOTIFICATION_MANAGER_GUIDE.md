# Notification Manager Guide

## Overview

The Notification Manager provides a comprehensive user feedback system for the Elementor Copier extension. It handles all types of notifications, visual feedback, and user guidance throughout the copy/paste workflow.

## Features

### ✅ Basic Notifications
- **Success notifications** - Confirm successful operations
- **Warning notifications** - Alert users to potential issues
- **Error notifications** - Report failures with troubleshooting guidance
- **Info notifications** - Provide helpful information

### 🎨 Visual Feedback
- **Loading indicators** - Show progress during operations
- **Progress bars** - Track multi-element paste operations
- **Success animations** - Celebrate completed actions
- **Toast notifications** - Quick, non-intrusive messages

### 🎯 Specialized Notifications
- **Element pasted** - Confirm element type and count
- **External media warnings** - Alert about external URLs
- **Version conversion** - Inform about compatibility adjustments
- **Error guidance** - Provide troubleshooting steps

## Usage

### Basic Setup

```javascript
// Initialize the notification manager
const notificationManager = new NotificationManager();
```

### Success Notifications

```javascript
// Simple success notification
notificationManager.success(
  'Operation Successful',
  'Your element has been pasted successfully.'
);

// Element pasted notification
notificationManager.notifyElementPasted('heading'); // Single element
notificationManager.notifyElementPasted('section', 3); // Multiple elements

// Success animation (brief, celebratory)
notificationManager.showSuccessAnimation('Image');
```

### Warning Notifications

```javascript
// Generic warning
notificationManager.warning(
  'Warning',
  'Please review this information before proceeding.'
);

// External media warning
const mediaUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
];
notificationManager.notifyExternalMedia(mediaUrls);

// Version conversion notification
notificationManager.notifyVersionConversion(
  '3.5.0',  // Source version
  '4.0.0',  // Target version
  ['Widget type updated', 'Settings migrated'] // Changes
);

// Editor not detected
notificationManager.notifyEditorNotDetected();
```

### Error Notifications

```javascript
// Generic error
notificationManager.error(
  'Error Occurred',
  'Something went wrong. Please try again.'
);

// Paste error with troubleshooting
notificationManager.notifyPasteError(
  'conversion',  // Error type
  'Failed to convert element format.'
);

// Clipboard error
notificationManager.notifyClipboardError();

// Invalid data error
notificationManager.notifyInvalidData();
```

### Loading Indicators

```javascript
// Show loading indicator
const loading = notificationManager.showLoading('Pasting element...');

// Update loading message
loading.update('Converting format...');

// Dismiss when complete
loading.dismiss();

// Example with async operation
async function pasteElement() {
  const loading = notificationManager.showLoading('Processing...');
  
  try {
    await performPaste();
    loading.dismiss();
    notificationManager.success('Success', 'Element pasted!');
  } catch (error) {
    loading.dismiss();
    notificationManager.error('Failed', error.message);
  }
}
```

### Progress Indicators

```javascript
// Show progress for multiple elements
const progress = notificationManager.showProgress(5); // Total count

// Update progress
progress.update(1, 'Processing element 1...');
progress.update(2, 'Processing element 2...');
// ... continue for each element

// Complete the progress
progress.complete();

// Or dismiss early if needed
progress.dismiss();

// Example with loop
async function pasteMultipleElements(elements) {
  const progress = notificationManager.showProgress(elements.length);
  
  for (let i = 0; i < elements.length; i++) {
    progress.update(i + 1, `Pasting ${elements[i].type}...`);
    await pasteElement(elements[i]);
  }
  
  progress.complete();
  notificationManager.success('Complete', `${elements.length} elements pasted!`);
}
```

### Toast Notifications

```javascript
// Quick toast messages (auto-dismiss)
notificationManager.showToast('Copied to clipboard!', 'success', 2000);
notificationManager.showToast('Processing...', 'info', 3000);
notificationManager.showToast('Check your settings', 'warning', 4000);
notificationManager.showToast('Action failed', 'error', 3000);
```

### Custom Notifications

```javascript
// Full control over notification
notificationManager.show({
  type: 'success',
  title: 'Custom Title',
  message: 'Custom message here',
  icon: '🎉',
  duration: 5000,
  actions: [
    {
      label: 'View Details',
      onClick: () => {
        console.log('Action clicked');
      }
    }
  ]
});
```

### Utility Methods

```javascript
// Clear all notifications
notificationManager.clearAll();

// Format element type for display
const formatted = notificationManager.formatElementType('text-editor');
// Returns: "Text Editor"
```

## Notification Types

### Success (Green)
- ✓ Element pasted successfully
- ✓ Operation completed
- ✓ Data saved

### Warning (Orange)
- ⚠ External media detected
- ⚠ Version conversion applied
- ⚠ Editor not detected

### Error (Red)
- ✕ Paste failed
- ✕ Clipboard access denied
- ✕ Invalid data format

### Info (Blue)
- ℹ Version compatibility information
- ℹ Troubleshooting guidance
- ℹ Feature updates

## Best Practices

### 1. Use Appropriate Notification Types
```javascript
// ✅ Good - Use success for completed actions
notificationManager.success('Pasted', 'Element added to page');

// ❌ Bad - Don't use error for warnings
notificationManager.error('Warning', 'External media detected');
```

### 2. Provide Actionable Information
```javascript
// ✅ Good - Include troubleshooting actions
notificationManager.error('Paste Failed', 'Format conversion error', {
  actions: [
    { label: 'Troubleshoot', onClick: showHelp }
  ]
});

// ❌ Bad - Vague error without guidance
notificationManager.error('Error', 'Something went wrong');
```

### 3. Use Loading Indicators for Async Operations
```javascript
// ✅ Good - Show loading during async work
const loading = notificationManager.showLoading('Processing...');
await doWork();
loading.dismiss();

// ❌ Bad - No feedback during long operations
await doWork(); // User sees nothing
```

### 4. Keep Messages Concise
```javascript
// ✅ Good - Clear and brief
notificationManager.success('Heading Pasted', 'Element added successfully');

// ❌ Bad - Too verbose
notificationManager.success(
  'Success',
  'The heading widget has been successfully pasted into your Elementor editor...'
);
```

### 5. Use Progress for Multiple Items
```javascript
// ✅ Good - Show progress for batch operations
const progress = notificationManager.showProgress(items.length);
items.forEach((item, i) => {
  progress.update(i + 1, `Processing ${item.name}...`);
  processItem(item);
});
progress.complete();

// ❌ Bad - Individual notifications for each item
items.forEach(item => {
  notificationManager.success('Done', `Processed ${item.name}`);
});
```

## Integration Examples

### Copy Operation
```javascript
async function copyElement(element) {
  try {
    const data = await extractElementData(element);
    await writeToClipboard(data);
    
    notificationManager.success(
      'Copied',
      `${element.type} copied to clipboard`
    );
  } catch (error) {
    notificationManager.error(
      'Copy Failed',
      error.message
    );
  }
}
```

### Paste Operation
```javascript
async function pasteElement() {
  const loading = notificationManager.showLoading('Pasting element...');
  
  try {
    // Read clipboard
    const data = await readClipboard();
    
    // Check for external media
    const mediaUrls = extractMediaUrls(data);
    if (mediaUrls.length > 0) {
      notificationManager.notifyExternalMedia(mediaUrls);
    }
    
    // Convert format
    loading.update('Converting format...');
    const converted = await convertFormat(data);
    
    // Check version compatibility
    if (needsVersionConversion(data)) {
      notificationManager.notifyVersionConversion(
        data.version,
        currentVersion,
        ['Widget types updated']
      );
    }
    
    // Inject into editor
    loading.update('Adding to editor...');
    await injectIntoEditor(converted);
    
    loading.dismiss();
    notificationManager.notifyElementPasted(data.type);
    
  } catch (error) {
    loading.dismiss();
    notificationManager.notifyPasteError('injection', error.message);
  }
}
```

### Multi-Element Paste
```javascript
async function pasteMultipleElements(elements) {
  const progress = notificationManager.showProgress(elements.length);
  const results = { success: 0, failed: 0 };
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    progress.update(i + 1, `Pasting ${element.type}...`);
    
    try {
      await pasteElement(element);
      results.success++;
    } catch (error) {
      results.failed++;
      console.error('Failed to paste element:', error);
    }
  }
  
  progress.complete();
  
  if (results.failed === 0) {
    notificationManager.success(
      'All Elements Pasted',
      `${results.success} elements added successfully`
    );
  } else {
    notificationManager.warning(
      'Partial Success',
      `${results.success} succeeded, ${results.failed} failed`
    );
  }
}
```

## Styling Customization

The notification manager injects its own styles, but you can override them:

```css
/* Override notification container position */
.ec-notification-container {
  top: 80px !important; /* Move down if needed */
  right: 30px !important;
}

/* Customize notification appearance */
.ec-notification {
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

/* Change success color */
.ec-notification-success .ec-notification-icon {
  background: #00c853 !important;
}
```

## Testing

Use the included test suite to verify functionality:

```bash
# Open test file in browser
chrome-extension/test-notification-manager.html
```

The test suite includes:
- ✅ All notification types
- ✅ Visual feedback components
- ✅ Automated test runner
- ✅ Interactive demos

## Requirements Coverage

This implementation satisfies the following requirements:

### Requirement 8.1 - Success Notifications
✅ `notifyElementPasted()` - Shows element type and count

### Requirement 8.2 - External Media Warnings
✅ `notifyExternalMedia()` - Warns about external URLs

### Requirement 8.3 - Version Conversion Notifications
✅ `notifyVersionConversion()` - Informs about compatibility adjustments

### Requirement 8.4 - Error Notifications
✅ `notifyPasteError()` - Provides troubleshooting guidance

### Requirement 8.5 - Editor Detection Notifications
✅ `notifyEditorNotDetected()` - Informs user about edit mode requirement

### Requirement 8.6 - Invalid Data Notifications
✅ `notifyInvalidData()` - Explains clipboard issues

### Requirement 8.7 - Visual Feedback
✅ `showLoading()` - Loading indicators
✅ `showProgress()` - Progress bars
✅ `showSuccessAnimation()` - Success animations
✅ `showToast()` - Toast notifications

## Troubleshooting

### Notifications Not Appearing
1. Check if notification container is created: `document.getElementById('elementor-copier-notifications')`
2. Verify styles are injected: `document.getElementById('ec-notification-styles')`
3. Check browser console for errors

### Notifications Overlapping
- Adjust `top` and `right` values in `.ec-notification-container`
- Reduce `defaultDuration` to dismiss faster

### Styles Not Applied
- Ensure `injectStyles()` is called during initialization
- Check for CSS conflicts with existing styles
- Use `!important` to override conflicting styles

## API Reference

### Constructor
```javascript
new NotificationManager()
```

### Methods

#### Basic Notifications
- `success(title, message, options)` - Show success notification
- `warning(title, message, options)` - Show warning notification
- `error(title, message, options)` - Show error notification
- `info(title, message, options)` - Show info notification

#### Specialized Notifications
- `notifyElementPasted(elementType, count)` - Element paste success
- `notifyExternalMedia(mediaUrls)` - External media warning
- `notifyVersionConversion(sourceVersion, targetVersion, changes)` - Version conversion info
- `notifyPasteError(errorType, errorMessage)` - Paste error with guidance
- `notifyClipboardError()` - Clipboard access error
- `notifyEditorNotDetected()` - Editor not found warning
- `notifyInvalidData()` - Invalid clipboard data error

#### Visual Feedback
- `showLoading(message)` - Show loading indicator (returns controller)
- `showProgress(total)` - Show progress bar (returns controller)
- `showSuccessAnimation(elementType)` - Show success animation
- `showToast(message, type, duration)` - Show toast notification

#### Utilities
- `show(config)` - Show custom notification
- `clearAll()` - Clear all notifications
- `formatElementType(elementType)` - Format element type for display

## Support

For issues or questions:
1. Check the test suite for examples
2. Review the requirements document
3. Consult the design document for architecture details
