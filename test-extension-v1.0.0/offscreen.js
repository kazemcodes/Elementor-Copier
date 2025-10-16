/**
 * Elementor Copier - Offscreen Document Script
 * Handles clipboard operations for the service worker
 * Required for Manifest V3 as service workers cannot access DOM APIs
 */

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyToClipboard') {
    handleClipboardWrite(request.data)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

/**
 * Write data to clipboard using Clipboard API
 */
async function handleClipboardWrite(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    
    // Check if Clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API not available');
    }
    
    // Write to clipboard
    await navigator.clipboard.writeText(jsonString);
    console.log('✓ Data written to clipboard via offscreen document');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to write to clipboard:', error);
    throw error;
  }
}

console.log('Elementor Copier: Offscreen document loaded');
