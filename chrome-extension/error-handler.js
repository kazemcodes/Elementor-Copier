/**
 * Error Handler Module
 * Provides comprehensive error handling with categorization, user-friendly messages,
 * and fallback mechanisms for the Elementor Copier extension.
 */

/**
 * Error categories for classification
 */
const ErrorCategory = {
  DETECTION: 'detection',
  CLJECTION: 'injection',
  VERSION: 'version'
};

// Error severity levels
const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 50;
  }

  /**
   * Handle an error with categorization and user feedback
   * @param {Error} error - The error object
   * @param {string} category - Error category from ErrorCategory
   * @param {object} context - Additional context information
   */
  handleError(error, category, context = {}) {
    // Log error for debugging
    const errorEntry = {
      timestamp: Date.now(),
      category,
      message: error.message,
      stack: error.stack,
      context
    };
    
    this.logError(errorEntry);
    console.error(`[Elementor Copier] ${category} error:`, error, context);

    // Get user-friendly message and severity
    const { message, severity, actions } = this.getUserMessage(error, category, context);

    // Show notification to user
    this.notifyUser(message, severity, actions);

    // Execute fallback mechanism
    this.executeFallback(category, context);

    // Report to background for analytics (optional)
    this.reportError(errorEntry);
  }

  /**
   * Log error to internal log
   * @param {object} errorEntry - Error entry object
   */
  logError(errorEntry) {
    this.errorLog.push(errorEntry);
    
    // Maintain max log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
  }

  /**
   * Get user-friendly error message based on category
   * @param {Error} error - The error object
   * @param {string} category - Error category
   * @param {object} context - Additional context
   * @returns {object} Message object with text, severity, and actions
   */
  getUserMessage(error, category, context) {
    const messages = {
      [ErrorCategory.DETECTION]: {
        message: 'Unable to detect Elementor editor. Please ensure you are in Elementor edit mode and the page has fully loaded.',
        severity: ErrorSeverity.WARNING,
        actions: ['Refresh the page', 'Verify Elementor is installed', 'Check browser console for details']
      },
      [ErrorCategory.CLIPBOARD]: {
        message: 'Clipboard access failed. Your browser may be blocking clipboard operations.',
        severity: ErrorSeverity.ERROR,
        actions: ['Grant clipboard permissions', 'Try using Ctrl+C/Ctrl+V manually', 'Check browser settings']
      },
      [ErrorCategory.CONVERSION]: {
        message: 'Failed to convert element data. The element format may be incompatible.',
        severity: ErrorSeverity.ERROR,
        actions: ['Try copying a different element', 'Check if element type is supported', 'Download raw data for manual import']
      },
      [ErrorCategory.INJECTION]: {
        message: 'Failed to inject element into Elementor editor. The editor may not be ready.',
        severity: ErrorSeverity.ERROR,
        actions: ['Wait for editor to fully load', 'Try pasting again', 'Refresh the page']
      },
      [ErrorCategory.VERSION]: {
        message: `Version compatibility issue detected. Source: ${context.sourceVersion || 'unknown'}, Target: ${context.targetVersion || 'unknown'}`,
        severity: ErrorSeverity.WARNING,
        actions: ['Review pasted element carefully', 'Some settings may need adjustment', 'Consider updating Elementor']
      }
    };

    // Get base message for category
    const baseMessage = messages[category] || {
      message: 'An unexpected error occurred. Please try again.',
      severity: ErrorSeverity.ERROR,
      actions: ['Refresh the page', 'Check browser console', 'Report issue if it persists']
    };

    // Add specific error details if available
    if (error.message && !error.message.includes('undefined')) {
      baseMessage.message += ` Details: ${error.message}`;
    }

    return baseMessage;
  }

  /**
   * Notify user with error message
   * @param {string} message - Error message
   * @param {string} severity - Error severity
   * @param {array} actions - Suggested actions
   */
  notifyUser(message, severity, actions) {
    // Use notification manager if available
    if (typeof NotificationManager !== 'undefined') {
      const notificationManager = new NotificationManager();
      
      if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
        notificationManager.showError(message, actions);
      } else if (severity === ErrorSeverity.WARNING) {
        notificationManager.showWarning(message, actions);
      } else {
        notificationManager.showInfo(message);
      }
    } else {
      // Fallback to console
      console.warn(`[Elementor Copier] ${severity.toUpperCase()}: ${message}`);
      if (actions && actions.length > 0) {
        console.info('Suggested actions:', actions);
      }
    }
  }

  /**
   * Execute fallback mechanism based on error category
   * @param {string} category - Error category
   * @param {object} context - Additional context
   */
  executeFallback(category, context) {
    const fallbacks = {
      [ErrorCategory.DETECTION]: () => {
        // Retry detection after delay
        if (context.retryCount < 3) {
          setTimeout(() => {
            if (context.retryCallback) {
              context.retryCallback();
            }
          }, 2000 * (context.retryCount + 1));
        }
      },
      [ErrorCategory.CLIPBOARD]: () => {
        // Provide manual paste instructions
        this.showManualPasteInstructions(context.data);
      },
      [ErrorCategory.CONVERSION]: () => {
        // Offer raw data download
        this.offerRawDataDownload(context.data);
      },
      [ErrorCategory.INJECTION]: () => {
        // Retry injection after delay
        if (context.retryCount < 2) {
          setTimeout(() => {
            if (context.retryCallback) {
              context.retryCallback();
            }
          }, 1000);
        }
      },
      [ErrorCategory.VERSION]: () => {
        // Attempt best-effort conversion
        if (context.attemptBestEffort && context.data) {
          this.attemptBestEffortConversion(context.data, context.targetVersion);
        }
      }
    };

    const fallback = fallbacks[category];
    if (fallback) {
      try {
        fallback();
      } catch (fallbackError) {
        console.error('[Elementor Copier] Fallback execution failed:', fallbackError);
      }
    }
  }

  /**
   * Show manual paste instructions to user
   * @param {object} data - Data to paste
   */
  showManualPasteInstructions(data) {
    if (!data) return;

    const instructions = `
Manual Paste Instructions:
1. Copy the JSON data below
2. Open Elementor editor
3. Use Elementor's import feature or paste manually

Data:
${JSON.stringify(data, null, 2)}
    `.trim();

    console.info(instructions);
    
    // Try to copy instructions to clipboard as fallback
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).catch(() => {
        // Silent fail - user can copy from console
      });
    } catch (e) {
      // Silent fail
    }
  }

  /**
   * Offer raw data download option
   * @param {object} data - Data to download
   */
  offerRawDataDownload(data) {
    if (!data) return;

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elementor-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.notifyUser(
        'Raw data downloaded. You can manually import this into Elementor.',
        ErrorSeverity.INFO,
        ['Open downloaded file', 'Use Elementor import feature']
      );
    } catch (error) {
      console.error('[Elementor Copier] Failed to download raw data:', error);
    }
  }

  /**
   * Attempt best-effort conversion with warnings
   * @param {object} data - Data to convert
   * @param {string} targetVersion - Target Elementor version
   */
  attemptBestEffortConversion(data, targetVersion) {
    console.warn('[Elementor Copier] Attempting best-effort conversion...');
    
    // This would integrate with the format converter
    // For now, just log the attempt
    this.notifyUser(
      'Attempting compatibility conversion. Please review the pasted element carefully.',
      ErrorSeverity.WARNING,
      ['Check element settings', 'Verify styles are correct', 'Test functionality']
    );
  }

  /**
   * Report error to background script for analytics
   * @param {object} errorEntry - Error entry object
   */
  reportError(errorEntry) {
    try {
      chrome.runtime.sendMessage({
        action: 'logError',
        error: {
          category: errorEntry.category,
          message: errorEntry.message,
          timestamp: errorEntry.timestamp,
          context: errorEntry.context
        }
      }).catch(() => {
        // Silent fail - error reporting is optional
      });
    } catch (e) {
      // Silent fail
    }
  }

  /**
   * Get recent error log
   * @returns {array} Recent errors
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Check if specific error category has occurred recently
   * @param {string} category - Error category
   * @param {number} timeWindow - Time window in milliseconds (default: 5000)
   * @returns {boolean} True if error occurred recently
   */
  hasRecentError(category, timeWindow = 5000) {
    const now = Date.now();
    return this.errorLog.some(entry => 
      entry.category === category && (now - entry.timestamp) < timeWindow
    );
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler, ErrorCategory, ErrorSeverity };
}
