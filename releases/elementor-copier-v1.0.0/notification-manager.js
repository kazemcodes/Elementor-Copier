/**
 * Notification Manager
 * Handles user feedback and notifications for the Elementor Copier extension
 * 
 * Features:
 * - Success notifications with element type display
 * - Warning notifications for external media URLs
 * - Error notifications with troubleshooting guidance
 * - Version conversion notifications
 */

class NotificationManager {
  constructor() {
    this.notificationContainer = null;
    this.notificationQueue = [];
    this.isProcessing = false;
    this.defaultDuration = 5000; // 5 seconds
    this.init();
  }

  /**
   * Initialize the notification system
   */
  init() {
    // Create notification container if it doesn't exist
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }
  }

  /**
   * Create the notification container element
   */
  createNotificationContainer() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'elementor-copier-notifications';
    this.notificationContainer.className = 'ec-notification-container';
    
    // Add styles
    this.injectStyles();
    
    // Append to body
    document.body.appendChild(this.notificationContainer);
  }

  /**
   * Inject notification styles
   */
  injectStyles() {
    if (document.getElementById('ec-notification-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'ec-notification-styles';
    style.textContent = `
      .ec-notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        max-width: 400px;
        pointer-events: none;
      }

      .ec-notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 12px;
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        pointer-events: auto;
        animation: ec-slide-in 0.3s ease-out;
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      }

      .ec-notification.ec-hiding {
        opacity: 0;
        transform: translateX(20px);
      }

      @keyframes ec-slide-in {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .ec-notification-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
      }

      .ec-notification-success .ec-notification-icon {
        background: #4caf50;
        color: white;
      }

      .ec-notification-warning .ec-notification-icon {
        background: #ff9800;
        color: white;
      }

      .ec-notification-error .ec-notification-icon {
        background: #f44336;
        color: white;
      }

      .ec-notification-info .ec-notification-icon {
        background: #2196f3;
        color: white;
      }

      .ec-notification-content {
        flex: 1;
        min-width: 0;
      }

      .ec-notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #333;
        margin: 0 0 4px 0;
      }

      .ec-notification-message {
        font-size: 13px;
        color: #666;
        margin: 0;
        line-height: 1.4;
      }

      .ec-notification-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }

      .ec-notification-action {
        font-size: 12px;
        color: #2196f3;
        text-decoration: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .ec-notification-action:hover {
        background: #f5f5f5;
      }

      .ec-notification-close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        color: #999;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
        transition: color 0.2s;
      }

      .ec-notification-close:hover {
        color: #333;
      }

      /* Loading Indicator */
      .ec-notification-loading {
        background: white;
        border-left: 4px solid #2196f3;
      }

      .ec-loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #2196f3;
        border-radius: 50%;
        animation: ec-spin 1s linear infinite;
      }

      @keyframes ec-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .ec-loading-message {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      /* Success Animation */
      .ec-notification-success-animation {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        padding: 20px;
        justify-content: center;
        align-items: center;
        animation: ec-success-pulse 0.5s ease-out;
      }

      @keyframes ec-success-pulse {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .ec-success-icon {
        font-size: 32px;
        font-weight: bold;
        animation: ec-check-bounce 0.6s ease-out;
      }

      @keyframes ec-check-bounce {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }

      .ec-success-message {
        font-size: 16px;
        font-weight: 600;
        margin-left: 12px;
      }

      /* Progress Indicator */
      .ec-notification-progress {
        background: white;
        border-left: 4px solid #2196f3;
        min-width: 300px;
      }

      .ec-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .ec-progress-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .ec-progress-text {
        font-size: 13px;
        color: #666;
      }

      .ec-progress-bar {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .ec-progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #2196f3 0%, #1976d2 100%);
        border-radius: 3px;
        transition: width 0.3s ease-out;
      }

      .ec-progress-message {
        font-size: 12px;
        color: #666;
      }

      /* Toast Notifications */
      .ec-toast {
        padding: 12px 16px;
        min-width: 250px;
        justify-content: flex-start;
      }

      .ec-toast-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .ec-toast-success .ec-toast-icon {
        background: #4caf50;
        color: white;
      }

      .ec-toast-warning .ec-toast-icon {
        background: #ff9800;
        color: white;
      }

      .ec-toast-error .ec-toast-icon {
        background: #f44336;
        color: white;
      }

      .ec-toast-info .ec-toast-icon {
        background: #2196f3;
        color: white;
      }

      .ec-toast-message {
        font-size: 13px;
        color: #333;
        margin-left: 12px;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Show a success notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  success(title, message, options = {}) {
    this.show({
      type: 'success',
      title,
      message,
      icon: '✓',
      ...options
    });
  }

  /**
   * Show a warning notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  warning(title, message, options = {}) {
    this.show({
      type: 'warning',
      title,
      message,
      icon: '⚠',
      ...options
    });
  }

  /**
   * Show an error notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  error(title, message, options = {}) {
    this.show({
      type: 'error',
      title,
      message,
      icon: '✕',
      duration: 8000, // Errors stay longer
      ...options
    });
  }

  /**
   * Show an info notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  info(title, message, options = {}) {
    this.show({
      type: 'info',
      title,
      message,
      icon: 'ℹ',
      ...options
    });
  }

  /**
   * Show element pasted success notification
   * @param {string} elementType - Type of element pasted (e.g., 'heading', 'section')
   * @param {number} count - Number of elements pasted
   */
  notifyElementPasted(elementType, count = 1) {
    const elementName = this.formatElementType(elementType);
    const title = count > 1 
      ? `${count} Elements Pasted Successfully`
      : `${elementName} Pasted Successfully`;
    
    const message = count > 1
      ? `${count} ${elementName} elements have been added to your page.`
      : `The ${elementName} has been added to your page.`;

    this.success(title, message, {
      duration: 4000
    });
  }

  /**
   * Show external media warning notification
   * @param {Array<string>} mediaUrls - Array of external media URLs
   */
  notifyExternalMedia(mediaUrls) {
    const count = mediaUrls.length;
    const title = 'External Media Detected';
    const message = count > 1
      ? `This element contains ${count} external media files. These may not display if the source site restricts access.`
      : 'This element contains external media. It may not display if the source site restricts access.';

    this.warning(title, message, {
      duration: 7000,
      actions: [
        {
          label: 'Learn More',
          onClick: () => {
            this.showMediaTroubleshooting();
          }
        }
      ]
    });
  }

  /**
   * Show version conversion notification
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @param {Array<string>} changes - List of changes made
   */
  notifyVersionConversion(sourceVersion, targetVersion, changes = []) {
    const title = 'Version Compatibility Applied';
    const changeList = changes.length > 0 
      ? ` Changes: ${changes.join(', ')}.`
      : '';
    
    const message = `Element converted from Elementor ${sourceVersion} to ${targetVersion}.${changeList}`;

    this.info(title, message, {
      duration: 6000
    });
  }

  /**
   * Show paste error notification
   * @param {string} errorType - Type of error
   * @param {string} errorMessage - Error message
   */
  notifyPasteError(errorType, errorMessage) {
    const troubleshooting = this.getTroubleshootingGuidance(errorType);
    
    this.error('Paste Failed', errorMessage, {
      actions: [
        {
          label: 'Troubleshoot',
          onClick: () => {
            this.showTroubleshooting(errorType, troubleshooting);
          }
        }
      ]
    });
  }

  /**
   * Show clipboard error notification
   */
  notifyClipboardError() {
    this.error(
      'Clipboard Access Denied',
      'Unable to access clipboard. Please check browser permissions.',
      {
        actions: [
          {
            label: 'Help',
            onClick: () => {
              this.showClipboardHelp();
            }
          }
        ]
      }
    );
  }

  /**
   * Show editor not detected notification
   */
  notifyEditorNotDetected() {
    this.warning(
      'Elementor Editor Not Detected',
      'Please make sure you are in Elementor edit mode before pasting.',
      {
        duration: 6000
      }
    );
  }

  /**
   * Show invalid data notification
   */
  notifyInvalidData() {
    this.error(
      'Invalid Clipboard Data',
      'The clipboard does not contain valid Elementor data. Please copy an element first.',
      {
        duration: 6000
      }
    );
  }

  /**
   * Show a generic notification
   * @param {Object} config - Notification configuration
   */
  show(config) {
    const notification = this.createNotification(config);
    
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    this.notificationContainer.appendChild(notification);

    // Auto-dismiss after duration
    const duration = config.duration || this.defaultDuration;
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification);
      }, duration);
    }
  }

  /**
   * Create notification element
   * @param {Object} config - Notification configuration
   * @returns {HTMLElement} Notification element
   */
  createNotification(config) {
    const notification = document.createElement('div');
    notification.className = `ec-notification ec-notification-${config.type}`;

    // Icon
    const icon = document.createElement('div');
    icon.className = 'ec-notification-icon';
    icon.textContent = config.icon;
    notification.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'ec-notification-content';

    const title = document.createElement('div');
    title.className = 'ec-notification-title';
    title.textContent = config.title;
    content.appendChild(title);

    const message = document.createElement('div');
    message.className = 'ec-notification-message';
    message.textContent = config.message;
    content.appendChild(message);

    // Actions
    if (config.actions && config.actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'ec-notification-actions';

      config.actions.forEach(action => {
        const actionButton = document.createElement('a');
        actionButton.className = 'ec-notification-action';
        actionButton.textContent = action.label;
        actionButton.href = '#';
        actionButton.onclick = (e) => {
          e.preventDefault();
          action.onClick();
        };
        actionsContainer.appendChild(actionButton);
      });

      content.appendChild(actionsContainer);
    }

    notification.appendChild(content);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'ec-notification-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.dismiss(notification);
    notification.appendChild(closeButton);

    return notification;
  }

  /**
   * Dismiss a notification
   * @param {HTMLElement} notification - Notification element to dismiss
   */
  dismiss(notification) {
    notification.classList.add('ec-hiding');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Format element type for display
   * @param {string} elementType - Raw element type
   * @returns {string} Formatted element type
   */
  formatElementType(elementType) {
    const typeMap = {
      'widget': 'Widget',
      'section': 'Section',
      'column': 'Column',
      'container': 'Container',
      'heading': 'Heading',
      'button': 'Button',
      'image': 'Image',
      'text-editor': 'Text Editor',
      'video': 'Video',
      'icon': 'Icon',
      'icon-box': 'Icon Box',
      'image-box': 'Image Box',
      'spacer': 'Spacer',
      'divider': 'Divider'
    };

    return typeMap[elementType] || elementType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get troubleshooting guidance for error type
   * @param {string} errorType - Type of error
   * @returns {string} Troubleshooting guidance
   */
  getTroubleshootingGuidance(errorType) {
    const guidance = {
      'detection': 'Make sure you are in Elementor edit mode. Refresh the page and try again.',
      'clipboard': 'Check browser permissions for clipboard access. Try copying the element again.',
      'conversion': 'The element format may be incompatible. Try copying a different element.',
      'injection': 'Elementor API access failed. Refresh the page and ensure Elementor is fully loaded.',
      'version': 'Version incompatibility detected. Some features may not work correctly.'
    };

    return guidance[errorType] || 'Please try again or contact support if the issue persists.';
  }

  /**
   * Show detailed troubleshooting modal
   * @param {string} errorType - Type of error
   * @param {string} guidance - Troubleshooting guidance
   */
  showTroubleshooting(errorType, guidance) {
    this.info('Troubleshooting Guide', guidance, {
      duration: 10000
    });
  }

  /**
   * Show media troubleshooting information
   */
  showMediaTroubleshooting() {
    const message = 'External media URLs may not work if the source site blocks hotlinking. ' +
                   'You can manually upload images to your WordPress media library and update the URLs in Elementor.';
    
    this.info('External Media Information', message, {
      duration: 10000
    });
  }

  /**
   * Show clipboard help information
   */
  showClipboardHelp() {
    const message = 'To enable clipboard access: 1) Click the lock icon in your browser address bar, ' +
                   '2) Allow clipboard permissions for this site, 3) Refresh the page.';
    
    this.info('Clipboard Permissions Help', message, {
      duration: 10000
    });
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    if (this.notificationContainer) {
      const notifications = this.notificationContainer.querySelectorAll('.ec-notification');
      notifications.forEach(notification => this.dismiss(notification));
    }
  }

  /**
   * Show loading indicator during paste operation
   * @param {string} message - Loading message
   * @returns {Object} Loading indicator controller
   */
  showLoading(message = 'Pasting element...') {
    const loadingId = `loading-${Date.now()}`;
    const loading = this.createLoadingIndicator(loadingId, message);
    
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    this.notificationContainer.appendChild(loading);

    return {
      update: (newMessage) => {
        const messageEl = loading.querySelector('.ec-loading-message');
        if (messageEl) {
          messageEl.textContent = newMessage;
        }
      },
      dismiss: () => {
        this.dismiss(loading);
      }
    };
  }

  /**
   * Create loading indicator element
   * @param {string} id - Unique identifier
   * @param {string} message - Loading message
   * @returns {HTMLElement} Loading indicator element
   */
  createLoadingIndicator(id, message) {
    const loading = document.createElement('div');
    loading.id = id;
    loading.className = 'ec-notification ec-notification-loading';

    // Spinner
    const spinner = document.createElement('div');
    spinner.className = 'ec-loading-spinner';
    loading.appendChild(spinner);

    // Content
    const content = document.createElement('div');
    content.className = 'ec-notification-content';

    const messageEl = document.createElement('div');
    messageEl.className = 'ec-loading-message';
    messageEl.textContent = message;
    content.appendChild(messageEl);

    loading.appendChild(content);

    return loading;
  }

  /**
   * Show success animation for completed paste
   * @param {string} elementType - Type of element pasted
   */
  showSuccessAnimation(elementType) {
    const elementName = this.formatElementType(elementType);
    const animation = this.createSuccessAnimation(elementName);
    
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    this.notificationContainer.appendChild(animation);

    // Auto-remove after animation
    setTimeout(() => {
      this.dismiss(animation);
    }, 2000);
  }

  /**
   * Create success animation element
   * @param {string} elementName - Name of element
   * @returns {HTMLElement} Success animation element
   */
  createSuccessAnimation(elementName) {
    const animation = document.createElement('div');
    animation.className = 'ec-notification ec-notification-success-animation';

    const icon = document.createElement('div');
    icon.className = 'ec-success-icon';
    icon.innerHTML = '✓';
    animation.appendChild(icon);

    const message = document.createElement('div');
    message.className = 'ec-success-message';
    message.textContent = `${elementName} Added!`;
    animation.appendChild(message);

    return animation;
  }

  /**
   * Show progress indicator for multi-element paste
   * @param {number} total - Total number of elements
   * @returns {Object} Progress indicator controller
   */
  showProgress(total) {
    const progressId = `progress-${Date.now()}`;
    const progress = this.createProgressIndicator(progressId, total);
    
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    this.notificationContainer.appendChild(progress);

    let current = 0;

    return {
      update: (count, message) => {
        current = count;
        const percentage = Math.round((current / total) * 100);
        
        const progressBar = progress.querySelector('.ec-progress-bar-fill');
        const progressText = progress.querySelector('.ec-progress-text');
        const progressMessage = progress.querySelector('.ec-progress-message');
        
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
          progressText.textContent = `${current} / ${total}`;
        }
        
        if (progressMessage && message) {
          progressMessage.textContent = message;
        }
      },
      complete: () => {
        const progressBar = progress.querySelector('.ec-progress-bar-fill');
        if (progressBar) {
          progressBar.style.width = '100%';
        }
        
        setTimeout(() => {
          this.dismiss(progress);
        }, 1000);
      },
      dismiss: () => {
        this.dismiss(progress);
      }
    };
  }

  /**
   * Create progress indicator element
   * @param {string} id - Unique identifier
   * @param {number} total - Total number of elements
   * @returns {HTMLElement} Progress indicator element
   */
  createProgressIndicator(id, total) {
    const progress = document.createElement('div');
    progress.id = id;
    progress.className = 'ec-notification ec-notification-progress';

    const content = document.createElement('div');
    content.className = 'ec-notification-content';

    const header = document.createElement('div');
    header.className = 'ec-progress-header';

    const title = document.createElement('div');
    title.className = 'ec-progress-title';
    title.textContent = 'Pasting Elements';
    header.appendChild(title);

    const text = document.createElement('div');
    text.className = 'ec-progress-text';
    text.textContent = `0 / ${total}`;
    header.appendChild(text);

    content.appendChild(header);

    const progressBar = document.createElement('div');
    progressBar.className = 'ec-progress-bar';

    const progressBarFill = document.createElement('div');
    progressBarFill.className = 'ec-progress-bar-fill';
    progressBarFill.style.width = '0%';
    progressBar.appendChild(progressBarFill);

    content.appendChild(progressBar);

    const message = document.createElement('div');
    message.className = 'ec-progress-message';
    message.textContent = 'Processing...';
    content.appendChild(message);

    progress.appendChild(content);

    return progress;
  }

  /**
   * Show in-editor toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, warning, error, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = this.createToast(message, type);
    
    if (!this.notificationContainer) {
      this.createNotificationContainer();
    }

    this.notificationContainer.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
  }

  /**
   * Create toast element
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   * @returns {HTMLElement} Toast element
   */
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `ec-notification ec-toast ec-toast-${type}`;

    const icon = document.createElement('div');
    icon.className = 'ec-toast-icon';
    
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    
    icon.textContent = icons[type] || icons.info;
    toast.appendChild(icon);

    const messageEl = document.createElement('div');
    messageEl.className = 'ec-toast-message';
    messageEl.textContent = message;
    toast.appendChild(messageEl);

    return toast;
  }

}

// Export singleton instance for use in other modules
if (typeof window !== 'undefined') {
  window.NotificationManager = NotificationManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
