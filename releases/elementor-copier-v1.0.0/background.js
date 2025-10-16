/**
 * Elementor Copier - Background Script
 * Handles context menu creation and message passing
 */

// Error tracking
const errorLog = [];
const MAX_ERROR_LOG_SIZE = 100;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
};

// Track context menu state per tab
const tabContextState = new Map();

// Import donation manager
importScripts('donation-manager.js');

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  // Show welcome message on first install
  if (typeof donationManager !== 'undefined') {
    await donationManager.showWelcomeIfNeeded();
  }

  // Parent menu
  chrome.contextMenus.create({
    id: 'elementor-copier-parent',
    title: 'Elementor Copier',
    contexts: ['all']
  });

  // Copy widget
  chrome.contextMenus.create({
    id: 'copy-widget',
    parentId: 'elementor-copier-parent',
    title: 'Copy Widget',
    contexts: ['all'],
    enabled: true
  });

  // Copy section
  chrome.contextMenus.create({
    id: 'copy-section',
    parentId: 'elementor-copier-parent',
    title: 'Copy Section',
    contexts: ['all'],
    enabled: true
  });

  // Copy column
  chrome.contextMenus.create({
    id: 'copy-column',
    parentId: 'elementor-copier-parent',
    title: 'Copy Column',
    contexts: ['all'],
    enabled: true
  });

  // Copy entire page
  chrome.contextMenus.create({
    id: 'copy-page',
    parentId: 'elementor-copier-parent',
    title: 'Copy Entire Page',
    contexts: ['all']
  });

  // Separator
  chrome.contextMenus.create({
    id: 'separator',
    parentId: 'elementor-copier-parent',
    type: 'separator',
    contexts: ['all']
  });

  // Enable highlight mode
  chrome.contextMenus.create({
    id: 'toggle-highlight',
    parentId: 'elementor-copier-parent',
    title: 'Enable Highlight Mode',
    contexts: ['all']
  });

  console.log('Elementor Copier: Context menus created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  // Check if we have Elementor element at this location
  const contextState = tabContextState.get(tab.id);
  
  // If trying to copy but no Elementor element, show helpful message
  if (!contextState?.hasElementor && 
      (info.menuItemId === 'copy-widget' || 
       info.menuItemId === 'copy-section' || 
       info.menuItemId === 'copy-column' ||
       info.menuItemId === 'copy-page')) {
    showNotification('No Elementor element at this location. Try right-clicking on an Elementor section, column, or widget.', 'warning');
    return;
  }

  // Send message to content script
  chrome.tabs.sendMessage(tab.id, {
    action: info.menuItemId,
    clickData: {
      x: info.x,
      y: info.y
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      const error = chrome.runtime.lastError;
      console.error('Error sending message:', error);
      
      // Show detailed error notification
      const errorMessage = getActionableErrorMessage(error.message);
      showNotification(errorMessage, 'error');
      logError('CONTEXT_MENU_ERROR', error.message, errorMessage);
      return;
    }

    if (response && response.success) {
      console.log('✓ Action completed successfully:', response);
      
      // Increment usage counter
      if (typeof donationManager !== 'undefined') {
        donationManager.incrementUsage().then(count => {
          console.log(`Usage count: ${count}`);
          
          // Check if we should show reminder (every 7 days)
          if (count % 25 === 0) { // Check every 25 uses
            donationManager.showReminder();
          }
        });
      }
      
      // Show success notification with element type
      if (response.message) {
        showNotification(response.message, 'success');
      }
      
      // Update badge with success indicator
      updateBadge('✓', '#4CAF50', tab.id);
      setTimeout(() => {
        updateBadge('', '', tab.id);
      }, 2000);
    } else if (response && response.error) {
      console.error('✗ Action failed:', response.error);
      
      // Show detailed error with code if available
      const errorMessage = response.errorCode 
        ? `[${response.errorCode}] ${response.error}`
        : response.error;
      showNotification(errorMessage, 'error');
      logError(response.errorCode || 'ACTION_FAILED', response.error, errorMessage);
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request, 'from:', sender);

  if (request.action === 'copyToClipboard') {
    // Only handle if this is from content script, not from offscreen document
    // Offscreen document will handle its own copyToClipboard messages
    if (sender.url && sender.url.includes('offscreen.html')) {
      // This is from offscreen document, ignore it
      return false;
    }
    
    // Copy data to clipboard with retry logic
    copyToClipboardWithRetry(request.data, 0)
      .then(async () => {
        sendResponse({ success: true });
        const elementType = request.data.elementType || 'Element';
        showNotification(`${elementType.charAt(0).toUpperCase() + elementType.slice(1)} copied to clipboard!`, 'success');
        
        // Increment usage counter
        if (typeof donationManager !== 'undefined') {
          const count = await donationManager.incrementUsage();
          console.log(`Usage count: ${count}`);
          
          // Check if we should show reminder (every 25 uses)
          if (count % 25 === 0) {
            donationManager.showReminder();
          }
        }
      })
      .catch((error) => {
        const errorMessage = getActionableErrorMessage(error.message);
        sendResponse({ success: false, error: errorMessage });
        showNotification(errorMessage, 'error');
        logError('CLIPBOARD_ERROR', error.message, errorMessage);
      });
    return true; // Keep channel open for async response
  }

  if (request.action === 'updateStats') {
    // Update extension stats
    updateStats(request.stats);
    sendResponse({ success: true });
  }

  if (request.action === 'showNotification') {
    showNotification(request.message, request.type);
    sendResponse({ success: true });
  }

  if (request.action === 'logError') {
    // Log error from content script
    logError(request.error.code, request.error.message, request.error.message);
    sendResponse({ success: true });
  }

  if (request.action === 'contextMenuOpened') {
    // Store context menu state for this tab
    const tabId = sender.tab?.id;
    if (tabId) {
      tabContextState.set(tabId, {
        hasElementor: request.hasElementor,
        elementType: request.elementType,
        timestamp: Date.now()
      });
      console.log(`[Background] Context menu state updated for tab ${tabId}:`, request);
      
      // Update context menu items based on element type
      updateContextMenuItems(request.hasElementor, request.elementType);
    }
    sendResponse({ success: true });
  }
});

/**
 * Update context menu items based on element type
 */
function updateContextMenuItems(hasElementor, elementType) {
  if (!hasElementor) {
    // Disable all copy options when not on Elementor element
    chrome.contextMenus.update('copy-widget', { 
      enabled: false,
      title: 'Copy Widget (no element selected)'
    });
    chrome.contextMenus.update('copy-section', { 
      enabled: false,
      title: 'Copy Section (no element selected)'
    });
    chrome.contextMenus.update('copy-column', { 
      enabled: false,
      title: 'Copy Column (no element selected)'
    });
    return;
  }

  // Enable appropriate options based on element type
  const isWidget = elementType && elementType.startsWith('widget');
  const isSection = elementType === 'section';
  const isColumn = elementType === 'column';

  chrome.contextMenus.update('copy-widget', { 
    enabled: isWidget,
    title: isWidget ? `Copy Widget (${elementType})` : 'Copy Widget'
  });
  
  chrome.contextMenus.update('copy-section', { 
    enabled: isSection,
    title: isSection ? 'Copy Section ✓' : 'Copy Section'
  });
  
  chrome.contextMenus.update('copy-column', { 
    enabled: isColumn,
    title: isColumn ? 'Copy Column ✓' : 'Copy Column'
  });
}

/**
 * Copy data to clipboard with retry logic
 */
async function copyToClipboardWithRetry(data, retryCount = 0) {
  try {
    // Store in chrome storage as backup
    await chrome.storage.local.set({
      lastCopied: data,
      lastCopiedAt: new Date().toISOString()
    });

    console.log('✓ Data stored in chrome.storage');

    // Use offscreen document for clipboard access
    await setupOffscreenDocument();
    
    // Wait a bit for offscreen document to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Send message to offscreen document to write to clipboard
    // chrome.runtime.sendMessage broadcasts to all contexts including offscreen
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'copyToClipboard',
        data: data
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          reject(new Error('No response from offscreen document'));
        } else {
          resolve(response);
        }
      });
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to copy to clipboard');
    }

    console.log('✓ Data copied to clipboard via offscreen document');
    return true;
  } catch (error) {
    console.error(`✗ Error copying to clipboard (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1}):`, error);
    
    // Retry logic
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return copyToClipboardWithRetry(data, retryCount + 1);
    }
    
    // Max retries reached, try fallback
    try {
      await fallbackCopyToClipboard(data);
      console.log('✓ Fallback copy succeeded');
      return true;
    } catch (fallbackError) {
      console.error('✗ Fallback copy also failed:', fallbackError);
      throw new Error('Clipboard access failed after multiple attempts. Please use the extension popup to copy manually.');
    }
  }
}

/**
 * Copy data to clipboard using offscreen document (legacy - kept for compatibility)
 */
async function copyToClipboard(data) {
  return copyToClipboardWithRetry(data, 0);
}

/**
 * Setup offscreen document for clipboard access
 */
async function setupOffscreenDocument() {
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length > 0) {
    console.log('✓ Offscreen document already exists');
    return; // Already exists
  }

  // Create offscreen document
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Write Elementor data to clipboard'
    });
    console.log('✓ Offscreen document created successfully');
  } catch (error) {
    // Document might already exist or browser doesn't support offscreen API
    console.error('✗ Could not create offscreen document:', error);
    throw error;
  }
}

/**
 * Fallback clipboard copy method
 * Uses chrome.storage and instructs user to paste manually
 */
async function fallbackCopyToClipboard(data) {
  // Data is already stored in chrome.storage
  // Show notification with instructions
  throw new Error('Please use the extension popup to copy data manually');
}

/**
 * Show notification with enhanced messaging
 */
function showNotification(message, type = 'success') {
  const iconUrl = 'icons/icon48.png';
  
  // Add emoji based on type
  let title = 'Elementor Copier';
  if (type === 'success') {
    title = '✓ Elementor Copier';
  } else if (type === 'error') {
    title = '✗ Elementor Copier';
  }
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: type === 'error' ? 2 : 1,
    requireInteraction: type === 'error' // Keep error notifications visible
  });
}

/**
 * Update extension stats
 */
async function updateStats(stats) {
  try {
    const current = await chrome.storage.local.get('stats');
    const updated = {
      ...current.stats,
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    await chrome.storage.local.set({ stats: updated });
  } catch (error) {
    console.error('Error updating stats:', error);
    logError('STATS_UPDATE_ERROR', error.message, 'Failed to update extension statistics');
  }
}

/**
 * Update badge
 */
function updateBadge(text, color, tabId) {
  chrome.action.setBadgeText({ text: text, tabId: tabId });
  if (color) {
    chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
  }
}

/**
 * Log error
 */
function logError(code, technicalMessage, userMessage) {
  const error = {
    code: code,
    technicalMessage: technicalMessage,
    userMessage: userMessage,
    timestamp: new Date().toISOString()
  };
  
  errorLog.push(error);
  
  // Maintain max size
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }
  
  // Log to console
  console.group(`🔴 Elementor Copier Error [${code}]`);
  console.error('Technical:', technicalMessage);
  console.error('User Message:', userMessage);
  console.error('Timestamp:', error.timestamp);
  console.groupEnd();
  
  // Store in chrome.storage for debugging
  chrome.storage.local.get('errorLog', (data) => {
    const log = data.errorLog || [];
    log.push(error);
    
    // Keep last 50 errors
    if (log.length > 50) {
      log.shift();
    }
    
    chrome.storage.local.set({ errorLog: log });
  });
}

/**
 * Get actionable error message
 */
function getActionableErrorMessage(technicalError) {
  const errorMap = {
    'Could not establish connection': 'Page needs to be refreshed. Please reload the page and try again.',
    'Extension context invalidated': 'Extension was updated or reloaded. Please refresh the page.',
    'Cannot access': 'Permission denied. Please check browser permissions for this extension.',
    'clipboard': 'Clipboard access failed. Try using the extension popup to copy manually.',
    'offscreen': 'Clipboard service unavailable. Try refreshing the page or restarting your browser.',
    'timeout': 'Operation timed out. Please try again.',
    'network': 'Network error. Check your internet connection and try again.'
  };
  
  // Find matching error message
  for (const [key, message] of Object.entries(errorMap)) {
    if (technicalError.toLowerCase().includes(key.toLowerCase())) {
      return message;
    }
  }
  
  // Default message
  return 'An error occurred. Please try again or check the browser console for details.';
}

/**
 * Get error log (for debugging)
 * Note: In service workers, we can't use window object
 * This function is available via chrome.runtime.getBackgroundPage() in MV2
 * or via message passing in MV3
 */
function getErrorLog() {
  return errorLog;
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // First button - usually "Support Developer" or "Donate"
    if (typeof donationManager !== 'undefined') {
      donationManager.openDonationPage();
    }
  } else if (buttonIndex === 1) {
    // Second button - usually "Remind Me Later" or "Maybe Later"
    if (typeof donationManager !== 'undefined') {
      await donationManager.dismissReminder();
    }
  }
  
  // Clear the notification
  chrome.notifications.clear(notificationId);
});

// Log when background script is loaded
console.log('Elementor Copier: Background script loaded');
