/**
 * Elementor Copier - Offscreen Document Script
 * Handles clipboard operations for the service worker
 * Required for Manifest V3 as service workers cannot access DOM APIs
 * 
 * Updated to support multi-format clipboard writes (Requirement 3.6)
 * Fixed clipboard focus issues (Task 13)
 */

// Extension marker for clipboard data identification
const EXTENSION_MARKER = '__ELEMENTOR_COPIER_DATA__';
const EXTENSION_VERSION = '1.0.0';

// Focus and retry configuration
const FOCUS_CONFIG = {
  maxRetries: 3,
  retryDelay: 100, // Start with 100ms
  backoffMultiplier: 2,
  focusAttempts: 2 // Try to acquire focus this many times before each retry
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyToClipboard') {
    handleClipboardWrite(request.data, request.options)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'readClipboard') {
    handleClipboardRead()
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

/**
 * Write data to clipboard using Clipboard API with multi-format support
 * Requirement 3.6: Update offscreen.js to support multi-format clipboard writes
 * Task 13: Fixed focus issues with retry logic and focus management
 * 
 * @param {Object} data - The data to write
 * @param {Object} options - Optional configuration
 */
async function handleClipboardWrite(data, options = {}) {
  // Try with focus management and retry logic
  return await writeWithRetry(data, options, 0);
}

/**
 * Write to clipboard with retry logic and focus management
 * Task 13: Implement retry logic with focus acquisition between attempts
 * 
 * @param {Object} data - The data to write
 * @param {Object} options - Optional configuration
 * @param {number} retryCount - Current retry attempt
 */
async function writeWithRetry(data, options, retryCount) {
  try {
    // Add extension marker for identification (Requirement 3.4)
    const markedData = addExtensionMarker(data);
    
    // Convert to JSON string (text/plain format that Elementor uses)
    const jsonString = JSON.stringify(markedData, null, 2);
    
    // Check if Clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API not available');
    }
    
    // Ensure document has focus before clipboard write
    await ensureDocumentFocus();
    
    // Write to clipboard as text/plain (Requirement 3.1)
    await navigator.clipboard.writeText(jsonString);
    
    console.log(`✓ Multi-format data written to clipboard via offscreen document (attempt ${retryCount + 1})`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to write to clipboard (attempt ${retryCount + 1}/${FOCUS_CONFIG.maxRetries + 1}):`, error);
    
    // Check if this is a focus-related error
    const isFocusError = error.message.includes('not focused') || 
                         error.message.includes('Document is not focused') ||
                         error.name === 'NotAllowedError';
    
    // Retry if we haven't exceeded max retries
    if (retryCount < FOCUS_CONFIG.maxRetries) {
      const delay = FOCUS_CONFIG.retryDelay * Math.pow(FOCUS_CONFIG.backoffMultiplier, retryCount);
      console.log(`Retrying clipboard write in ${delay}ms...`);
      
      // Wait before retry
      await sleep(delay);
      
      // If it's a focus error, try harder to acquire focus
      if (isFocusError) {
        await aggressiveFocusAcquisition();
      }
      
      // Retry
      return await writeWithRetry(data, options, retryCount + 1);
    }
    
    // Max retries reached, try fallback strategies
    console.log('Max retries reached, attempting fallback strategies...');
    return await tryFallbackStrategies(data, error);
  }
}

/**
 * Ensure document has focus before clipboard operations
 * Task 13: Implement proper focus management before clipboard write operations
 */
async function ensureDocumentFocus() {
  // Check if document already has focus
  if (document.hasFocus()) {
    return true;
  }
  
  console.log('Document does not have focus, attempting to acquire...');
  
  // Try multiple focus acquisition methods
  for (let i = 0; i < FOCUS_CONFIG.focusAttempts; i++) {
    // Method 1: Focus the window
    window.focus();
    
    // Method 2: Focus the document body
    if (document.body) {
      document.body.focus();
    }
    
    // Method 3: Create and focus a temporary input element
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();
    
    // Small delay to allow focus to take effect
    await sleep(50);
    
    // Clean up
    tempInput.remove();
    
    // Check if we now have focus
    if (document.hasFocus()) {
      console.log('✓ Document focus acquired');
      return true;
    }
    
    // Wait a bit before next attempt
    if (i < FOCUS_CONFIG.focusAttempts - 1) {
      await sleep(100);
    }
  }
  
  console.warn('⚠ Could not acquire document focus after multiple attempts');
  return false;
}

/**
 * Aggressive focus acquisition for stubborn cases
 * Task 13: Additional focus strategies when standard methods fail
 */
async function aggressiveFocusAcquisition() {
  console.log('Attempting aggressive focus acquisition...');
  
  // Try clicking on the document
  try {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    document.body.dispatchEvent(clickEvent);
    await sleep(50);
  } catch (e) {
    console.warn('Click simulation failed:', e);
  }
  
  // Try focusing multiple elements
  const focusableElements = ['input', 'textarea', 'button', 'a'];
  for (const tag of focusableElements) {
    const element = document.createElement(tag);
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.opacity = '0';
    document.body.appendChild(element);
    element.focus();
    await sleep(30);
    element.remove();
    
    if (document.hasFocus()) {
      console.log('✓ Focus acquired via aggressive method');
      return true;
    }
  }
  
  return false;
}

/**
 * Try fallback clipboard write strategies
 * Task 13: Consider alternative clipboard write strategies if focus issues persist
 * 
 * @param {Object} data - The data to write
 * @param {Error} originalError - The original error that caused fallback
 */
async function tryFallbackStrategies(data, originalError) {
  console.log('Attempting fallback clipboard strategies...');
  
  // Strategy 1: Try using execCommand (deprecated but more reliable in some cases)
  try {
    const success = await fallbackExecCommand(data);
    if (success) {
      console.log('✓ Fallback strategy (execCommand) succeeded');
      return true;
    }
  } catch (execError) {
    console.warn('execCommand fallback failed:', execError);
  }
  
  // Strategy 2: Try writing to clipboard after user interaction simulation
  try {
    await simulateUserInteraction();
    await ensureDocumentFocus();
    
    const markedData = addExtensionMarker(data);
    const jsonString = JSON.stringify(markedData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    
    console.log('✓ Fallback strategy (user interaction simulation) succeeded');
    return true;
  } catch (interactionError) {
    console.warn('User interaction simulation fallback failed:', interactionError);
  }
  
  // Strategy 3: Try using textarea with select and copy
  try {
    const success = await fallbackTextareaCopy(data);
    if (success) {
      console.log('✓ Fallback strategy (textarea copy) succeeded');
      return true;
    }
  } catch (textareaError) {
    console.warn('Textarea fallback failed:', textareaError);
  }
  
  // All strategies failed
  console.error('✗ All clipboard write strategies failed');
  throw new Error(`Clipboard write failed: ${originalError.message}. Please ensure the browser window is focused and try again.`);
}

/**
 * Fallback using deprecated execCommand
 * Task 13: Alternative clipboard write strategy
 */
async function fallbackExecCommand(data) {
  const markedData = addExtensionMarker(data);
  const jsonString = JSON.stringify(markedData, null, 2);
  
  const textarea = document.createElement('textarea');
  textarea.value = jsonString;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  
  try {
    textarea.focus();
    textarea.select();
    
    const success = document.execCommand('copy');
    textarea.remove();
    
    return success;
  } catch (error) {
    textarea.remove();
    throw error;
  }
}

/**
 * Simulate user interaction to help with focus
 * Task 13: Alternative focus acquisition strategy
 */
async function simulateUserInteraction() {
  // Create a temporary button and simulate click
  const button = document.createElement('button');
  button.style.position = 'absolute';
  button.style.left = '-9999px';
  button.style.opacity = '0';
  document.body.appendChild(button);
  
  button.click();
  button.focus();
  
  await sleep(50);
  button.remove();
}

/**
 * Fallback using textarea selection and copy
 * Task 13: Alternative clipboard write strategy
 */
async function fallbackTextareaCopy(data) {
  const markedData = addExtensionMarker(data);
  const jsonString = JSON.stringify(markedData, null, 2);
  
  const textarea = document.createElement('textarea');
  textarea.value = jsonString;
  textarea.style.position = 'fixed';
  textarea.style.left = '0';
  textarea.style.top = '0';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.padding = '0';
  textarea.style.border = 'none';
  textarea.style.outline = 'none';
  textarea.style.boxShadow = 'none';
  textarea.style.background = 'transparent';
  
  document.body.appendChild(textarea);
  
  try {
    // Focus and select
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    
    // Try modern clipboard API first
    try {
      await navigator.clipboard.writeText(jsonString);
      textarea.remove();
      return true;
    } catch (clipboardError) {
      // Fall back to execCommand
      const success = document.execCommand('copy');
      textarea.remove();
      return success;
    }
  } catch (error) {
    textarea.remove();
    throw error;
  }
}

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Read data from clipboard
 * Requirement 3.2: Detect and read extension clipboard data
 * Task 13: Added focus management for clipboard read operations
 */
async function handleClipboardRead() {
  try {
    // Check if Clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('Clipboard read API not available');
    }
    
    // Ensure document has focus before clipboard read
    await ensureDocumentFocus();
    
    // Read clipboard text
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText) {
      return null;
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(clipboardText);
    } catch (parseError) {
      console.log('Clipboard content is not valid JSON');
      return null;
    }
    
    // Check if it has extension marker (Requirement 3.3)
    if (!hasExtensionMarker(data)) {
      console.log('Clipboard data does not have extension marker');
      return null;
    }
    
    console.log('✓ Extension data read from clipboard');
    return data;
  } catch (error) {
    console.error('✗ Failed to read clipboard:', error);
    throw error;
  }
}

/**
 * Add extension marker to clipboard data
 * Requirement 3.4: Add extension marker for identification
 */
function addExtensionMarker(data) {
  return {
    ...data,
    [EXTENSION_MARKER]: {
      version: EXTENSION_VERSION,
      timestamp: Date.now(),
      source: 'elementor-copier-extension'
    }
  };
}

/**
 * Check if data has extension marker
 */
function hasExtensionMarker(data) {
  return data && 
         typeof data === 'object' && 
         EXTENSION_MARKER in data &&
         data[EXTENSION_MARKER]?.source === 'elementor-copier-extension';
}

console.log('Elementor Copier: Offscreen document loaded with multi-format support and focus management');
