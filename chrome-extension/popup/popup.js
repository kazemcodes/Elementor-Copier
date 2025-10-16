/**
 * Elementor Copier - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if Elementor is detected
  checkElementorStatus(tab);
  
  // Load last copied data
  loadLastCopied();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Check if Elementor is detected on current page
 */
async function checkElementorStatus(tab) {
  const statusEl = document.getElementById('status');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const statsEl = document.getElementById('stats');
  const actionsEl = document.getElementById('actions');

  try {
    // First, try to get fresh stats from content script
    chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, async (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not responding, checking storage:', chrome.runtime.lastError.message);
        // Fallback to storage
        await checkFromStorage();
        return;
      }

      if (response && response.stats) {
        displayStats(response.stats);
      } else {
        // Fallback to storage
        await checkFromStorage();
      }
    });

    // Also check storage as backup (with slight delay)
    setTimeout(async () => {
      const data = await chrome.storage.local.get('stats');
      if (data.stats && data.stats.elementorDetected) {
        displayStats(data.stats);
      }
    }, 500);

  } catch (error) {
    console.error('Error checking Elementor status:', error);
    statusIcon.textContent = '✗';
    statusText.textContent = 'Error Checking Status';
    statusEl.classList.add('error');
  }

  async function checkFromStorage() {
    const data = await chrome.storage.local.get('stats');
    const stats = data.stats || {};
    
    if (stats.elementorDetected) {
      displayStats(stats);
    } else {
      // Not detected
      statusIcon.textContent = '✗';
      statusText.textContent = 'Elementor Not Detected';
      statusEl.classList.add('error');
    }
  }

  function displayStats(stats) {
    if (stats.elementorDetected) {
      // Elementor detected
      statusIcon.textContent = '✓';
      statusText.textContent = 'Elementor Detected';
      statusEl.classList.remove('error');
      statusEl.classList.add('success', 'detected');

      // Show stats
      document.getElementById('widgetCount').textContent = stats.widgets || 0;
      document.getElementById('sectionCount').textContent = stats.sections || 0;
      document.getElementById('columnCount').textContent = stats.columns || 0;
      statsEl.style.display = 'block';
      statsEl.classList.add('fade-in');

      // Show actions
      actionsEl.style.display = 'block';
      actionsEl.classList.add('fade-in');
    } else {
      // Not detected
      statusIcon.textContent = '✗';
      statusText.textContent = 'Elementor Not Detected';
      statusEl.classList.add('error');
    }
  }
}

/**
 * Load last copied data
 */
async function loadLastCopied() {
  try {
    const data = await chrome.storage.local.get(['lastCopied', 'lastCopiedAt']);
    
    if (data.lastCopied && data.lastCopiedAt) {
      const lastCopiedEl = document.getElementById('lastCopied');
      const copiedType = document.getElementById('copiedType');
      const copiedTime = document.getElementById('copiedTime');

      copiedType.textContent = formatElementType(data.lastCopied.elementType);
      copiedTime.textContent = formatTime(data.lastCopiedAt);

      lastCopiedEl.style.display = 'block';
      lastCopiedEl.classList.add('fade-in');
    }
  } catch (error) {
    console.error('Error loading last copied:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Highlight button
  const highlightBtn = document.getElementById('highlightBtn');
  if (highlightBtn) {
    highlightBtn.addEventListener('click', toggleHighlightMode);
  }

  // View clipboard button
  const viewClipboardBtn = document.getElementById('viewClipboard');
  if (viewClipboardBtn) {
    viewClipboardBtn.addEventListener('click', viewClipboard);
  }

  // Manual copy button
  const manualCopyBtn = document.getElementById('manualCopy');
  if (manualCopyBtn) {
    manualCopyBtn.addEventListener('click', manualCopy);
  }

  // Modal buttons
  const closeModalBtn = document.getElementById('closeModal');
  const closeModalBtn2 = document.getElementById('closeModalBtn');
  const copyFromModalBtn = document.getElementById('copyFromModal');
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  if (closeModalBtn2) {
    closeModalBtn2.addEventListener('click', closeModal);
  }
  if (copyFromModalBtn) {
    copyFromModalBtn.addEventListener('click', copyFromModal);
  }

  // Help link
  const helpLink = document.getElementById('helpLink');
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/kazemmoridi/elementor-copier' });
    });
  }

  // Settings link
  const settingsLink = document.getElementById('settingsLink');
  if (settingsLink) {
    settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Open settings page (to be implemented)
      alert('Settings coming soon!');
    });
  }

  // View errors link
  const viewErrorsLink = document.getElementById('viewErrorsLink');
  if (viewErrorsLink) {
    viewErrorsLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleErrorLog();
    });
  }

  // Clear errors button
  const clearErrorsBtn = document.getElementById('clearErrors');
  if (clearErrorsBtn) {
    clearErrorsBtn.addEventListener('click', clearErrorLog);
  }
}

/**
 * Toggle highlight mode
 */
async function toggleHighlightMode() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-highlight' }, (response) => {
      if (response && response.success) {
        const btn = document.getElementById('highlightBtn');
        if (response.message.includes('enabled')) {
          btn.textContent = '✓ Highlight Mode Enabled';
          btn.style.background = '#4caf50';
        } else {
          btn.innerHTML = '<span class="btn-icon">✨</span> Enable Highlight Mode';
          btn.style.background = '';
        }
      }
    });
  } catch (error) {
    console.error('Error toggling highlight mode:', error);
  }
}

/**
 * View clipboard data
 */
async function viewClipboard() {
  try {
    const data = await chrome.storage.local.get('lastCopied');
    
    if (data.lastCopied) {
      const jsonString = JSON.stringify(data.lastCopied, null, 2);
      
      // Show in modal
      const modal = document.getElementById('clipboardModal');
      const textarea = document.getElementById('clipboardData');
      
      textarea.value = jsonString;
      modal.style.display = 'flex';
    } else {
      alert('No data in clipboard');
    }
  } catch (error) {
    console.error('Error viewing clipboard:', error);
    alert('Error viewing clipboard: ' + error.message);
  }
}

/**
 * Manual copy - fallback method with retry
 */
async function manualCopy() {
  try {
    const data = await chrome.storage.local.get('lastCopied');
    
    if (!data.lastCopied) {
      showMessage('No data to copy. Copy an element first.', 'error');
      return;
    }

    const jsonString = JSON.stringify(data.lastCopied, null, 2);
    
    // Try to copy using Clipboard API with retry
    if (navigator.clipboard && navigator.clipboard.writeText) {
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          await navigator.clipboard.writeText(jsonString);
          showMessage('✓ Copied to clipboard!', 'success');
          success = true;
          return;
        } catch (error) {
          console.error(`Clipboard API failed (${retries} retries left):`, error);
          retries--;
          
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // All retries failed
      if (!success) {
        console.error('All clipboard attempts failed');
        viewClipboard();
        showMessage('Clipboard access failed. Please copy manually from the modal (Ctrl+C)', 'error');
      }
    } else {
      // Clipboard API not available
      viewClipboard();
      showMessage('Clipboard API not available. Please copy manually from the modal (Ctrl+C)', 'info');
    }
  } catch (error) {
    console.error('Error in manual copy:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Copy from modal with retry logic
 */
async function copyFromModal() {
  const textarea = document.getElementById('clipboardData');
  
  try {
    // Select text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    // Try modern Clipboard API first with retry
    if (navigator.clipboard && navigator.clipboard.writeText) {
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          await navigator.clipboard.writeText(textarea.value);
          showMessage('✓ Copied to clipboard!', 'success');
          closeModal();
          success = true;
          return;
        } catch (error) {
          console.error(`Clipboard API failed (${retries} retries left):`, error);
          retries--;
          
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      // All retries failed, try fallback
      if (!success) {
        const execSuccess = document.execCommand('copy');
        if (execSuccess) {
          showMessage('✓ Copied to clipboard!', 'success');
          closeModal();
        } else {
          showMessage('Clipboard access failed. Please copy manually (Ctrl+C or Cmd+C)', 'error');
        }
      }
    } else {
      // Fallback to execCommand
      const success = document.execCommand('copy');
      if (success) {
        showMessage('✓ Copied to clipboard!', 'success');
        closeModal();
      } else {
        showMessage('Please copy manually (Ctrl+C or Cmd+C)', 'info');
      }
    }
  } catch (error) {
    console.error('Error copying from modal:', error);
    showMessage('Error: ' + error.message + '. Please copy manually (Ctrl+C or Cmd+C)', 'error');
  }
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('clipboardModal');
  modal.style.display = 'none';
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;
  
  // Add to body
  document.body.appendChild(messageEl);
  
  // Fade in
  setTimeout(() => {
    messageEl.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      messageEl.remove();
    }, 300);
  }, 3000);
}

/**
 * Format element type for display
 */
function formatElementType(type) {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format time for display
 */
function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Toggle error log display
 */
async function toggleErrorLog() {
  const errorLogEl = document.getElementById('errorLog');
  const instructionsEl = document.querySelector('.instructions');
  
  if (errorLogEl.style.display === 'none') {
    // Show error log
    await loadErrorLog();
    errorLogEl.style.display = 'block';
    instructionsEl.style.display = 'none';
  } else {
    // Hide error log
    errorLogEl.style.display = 'none';
    instructionsEl.style.display = 'block';
  }
}

/**
 * Load error log from storage
 */
async function loadErrorLog() {
  try {
    const data = await chrome.storage.local.get('errorLog');
    const errorLog = data.errorLog || [];
    
    const errorListEl = document.getElementById('errorList');
    
    if (errorLog.length === 0) {
      errorListEl.innerHTML = '<p class="no-errors">✓ No errors recorded</p>';
      return;
    }
    
    // Display last 10 errors
    const recentErrors = errorLog.slice(-10).reverse();
    
    errorListEl.innerHTML = recentErrors.map(error => `
      <div class="error-item">
        <div class="error-code">[${error.code}]</div>
        <div class="error-message">${error.userMessage || error.technicalMessage}</div>
        <div class="error-time">${formatTime(error.timestamp)}</div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading error log:', error);
    showMessage('Failed to load error log', 'error');
  }
}

/**
 * Clear error log
 */
async function clearErrorLog() {
  try {
    await chrome.storage.local.set({ errorLog: [] });
    showMessage('✓ Error log cleared', 'success');
    loadErrorLog();
  } catch (error) {
    console.error('Error clearing error log:', error);
    showMessage('Failed to clear error log', 'error');
  }
}
