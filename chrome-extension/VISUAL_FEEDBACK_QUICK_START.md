# Visual Feedback Quick Start

## 5-Minute Guide to Using Visual Feedback

This guide gets you up and running with the visual feedback system in under 5 minutes.

---

## Setup

### 1. Initialize the Notification Manager

```javascript
// The notification manager is automatically initialized
const notificationManager = new NotificationManager();
```

That's it! The manager handles all styling and container creation automatically.

---

## Common Use Cases

### Quick Success Message

```javascript
// Show a quick success toast
notificationManager.showToast('Pasted successfully!', 'success');
```

### Show Loading During Operation

```javascript
async function pasteElement() {
  // Show loading
  const loading = notificationManager.showLoading('Pasting element...');
  
  try {
    // Do your paste operation
    await performPaste();
    
    // Dismiss loading
    loading.dismiss();
    
    // Show success
    notificationManager.showSuccessAnimation('heading');
  } catch (error) {
    loading.dismiss();
    notificationManager.showToast('Paste failed', 'error');
  }
}
```

### Track Multi-Element Progress

```javascript
async function pasteMultipleElements(elements) {
  const progress = notificationManager.showProgress(elements.length);
  
  for (let i = 0; i < elements.length; i++) {
    progress.update(i + 1, `Pasting ${elements[i].type}...`);
    await pasteElement(elements[i]);
  }
  
  progress.complete();
  notificationManager.showSuccessAnimation('section');
}
```

---

## The 4 Main Features

### 1. Toast Notifications (Quick Messages)

```javascript
// 4 types available
notificationManager.showToast('Success!', 'success');  // Green
notificationManager.showToast('Warning!', 'warning');  // Orange
notificationManager.showToast('Error!', 'error');      // Red
notificationManager.showToast('Info', 'info');         // Blue
```

**When to use:** Quick, non-critical updates

---

### 2. Loading Indicators (Processing)

```javascript
const loading = notificationManager.showLoading('Processing...');

// Update the message
loading.update('Almost done...');

// Dismiss when complete
loading.dismiss();
```

**When to use:** Operations that take 1-5 seconds

---

### 3. Success Animations (Celebration)

```javascript
notificationManager.showSuccessAnimation('heading');
// Shows: "Heading Added!" with bouncing checkmark
```

**When to use:** Immediate positive feedback after success

---

### 4. Progress Indicators (Multi-Step)

```javascript
const progress = notificationManager.showProgress(5);

progress.update(1, 'Step 1...');
progress.update(2, 'Step 2...');
progress.update(3, 'Step 3...');
progress.update(4, 'Step 4...');
progress.update(5, 'Step 5...');

progress.complete();
```

**When to use:** Multi-step operations or multiple elements

---

## Pre-Built Notifications

### Element Pasted

```javascript
notificationManager.notifyElementPasted('heading', 1);
// Shows: "Heading Pasted Successfully"
```

### External Media Warning

```javascript
notificationManager.notifyExternalMedia(['https://example.com/image.jpg']);
// Shows warning with "Learn More" button
```

### Paste Error

```javascript
notificationManager.notifyPasteError('conversion', 'Invalid format');
// Shows error with "Troubleshoot" button
```

---

## Complete Workflow Example

```javascript
async function completePasteWorkflow(elementData) {
  // Step 1: Show loading
  const loading = notificationManager.showLoading('Preparing to paste...');
  
  try {
    // Step 2: Convert format
    loading.update('Converting format...');
    const converted = await convertFormat(elementData);
    
    // Step 3: Validate
    loading.update('Validating data...');
    await validateData(converted);
    
    // Step 4: Paste
    loading.update('Injecting into editor...');
    await injectIntoEditor(converted);
    
    // Step 5: Success!
    loading.dismiss();
    notificationManager.showSuccessAnimation(elementData.type);
    
    // Step 6: Detailed notification
    setTimeout(() => {
      notificationManager.notifyElementPasted(elementData.type, 1);
    }, 2000);
    
  } catch (error) {
    loading.dismiss();
    notificationManager.notifyPasteError('conversion', error.message);
  }
}
```

---

## Best Practices

### ✅ DO

- Use toasts for quick, non-critical updates
- Show loading for operations > 1 second
- Use progress bars for multi-step operations
- Follow up success animations with detailed notifications
- Provide actionable error messages

### ❌ DON'T

- Don't stack too many notifications at once
- Don't use toasts for critical errors
- Don't forget to dismiss loading indicators
- Don't use long messages in toasts
- Don't skip error handling

---

## Timing Guidelines

| Feature | Duration | Use Case |
|---------|----------|----------|
| Toast | 3 seconds | Quick updates |
| Loading | Manual dismiss | Active operations |
| Success Animation | 2 seconds | Immediate feedback |
| Progress | Auto after complete | Multi-step operations |
| Standard Notification | 5-8 seconds | Detailed information |

---

## Testing Your Implementation

1. Open `test-visual-feedback.html` in your browser
2. Test each feature individually
3. Test complete workflows
4. Verify timing and animations
5. Check error handling

---

## Common Patterns

### Pattern 1: Simple Success

```javascript
// Just show success
notificationManager.showToast('Done!', 'success');
```

### Pattern 2: Loading → Success

```javascript
const loading = notificationManager.showLoading('Working...');
await doWork();
loading.dismiss();
notificationManager.showSuccessAnimation('widget');
```

### Pattern 3: Loading → Progress → Success

```javascript
const loading = notificationManager.showLoading('Starting...');
await prepare();

loading.dismiss();
const progress = notificationManager.showProgress(items.length);

for (let i = 0; i < items.length; i++) {
  progress.update(i + 1, `Processing ${i + 1}...`);
  await processItem(items[i]);
}

progress.complete();
notificationManager.showSuccessAnimation('section');
```

### Pattern 4: Error Handling

```javascript
const loading = notificationManager.showLoading('Trying...');

try {
  await riskyOperation();
  loading.dismiss();
  notificationManager.showToast('Success!', 'success');
} catch (error) {
  loading.dismiss();
  notificationManager.notifyPasteError('operation', error.message);
}
```

---

## Troubleshooting

### Notifications Not Appearing?

```javascript
// Make sure the manager is initialized
const notificationManager = new NotificationManager();

// Check if container exists
console.log(document.getElementById('elementor-copier-notifications'));
```

### Styles Not Applied?

```javascript
// Styles are injected automatically on initialization
// Check if style element exists
console.log(document.getElementById('ec-notification-styles'));
```

### Notifications Not Dismissing?

```javascript
// Clear all notifications manually
notificationManager.clearAll();
```

---

## API Reference (Quick)

### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `showToast()` | message, type, duration | void | Quick toast notification |
| `showLoading()` | message | controller | Loading indicator |
| `showSuccessAnimation()` | elementType | void | Success animation |
| `showProgress()` | total | controller | Progress indicator |
| `success()` | title, message, options | void | Success notification |
| `warning()` | title, message, options | void | Warning notification |
| `error()` | title, message, options | void | Error notification |
| `info()` | title, message, options | void | Info notification |
| `clearAll()` | none | void | Clear all notifications |

### Controller Objects

**Loading Controller:**
```javascript
{
  update: (message) => void,
  dismiss: () => void
}
```

**Progress Controller:**
```javascript
{
  update: (count, message) => void,
  complete: () => void,
  dismiss: () => void
}
```

---

## Next Steps

1. ✅ Read this quick start
2. → Open `test-visual-feedback.html` to see examples
3. → Read `VISUAL_FEEDBACK_GUIDE.md` for detailed documentation
4. → Integrate into your paste operations
5. → Test thoroughly

---

## Need Help?

- **Full Documentation:** `VISUAL_FEEDBACK_GUIDE.md`
- **Test Suite:** `test-visual-feedback.html`
- **Implementation Details:** `TASK_9.2_IMPLEMENTATION_SUMMARY.md`
- **Code:** `notification-manager.js`

---

## Summary

```javascript
// Initialize (automatic)
const notificationManager = new NotificationManager();

// Quick success
notificationManager.showToast('Done!', 'success');

// With loading
const loading = notificationManager.showLoading('Working...');
await work();
loading.dismiss();

// With progress
const progress = notificationManager.showProgress(5);
for (let i = 1; i <= 5; i++) {
  progress.update(i, `Step ${i}...`);
  await step(i);
}
progress.complete();

// Success animation
notificationManager.showSuccessAnimation('heading');
```

That's it! You're ready to add visual feedback to your paste operations. 🎉
