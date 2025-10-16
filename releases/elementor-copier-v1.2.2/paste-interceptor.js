/**
 * Elementor Copier - Paste Interceptor
 * Intercepts paste operations in the Elementor editor to inject extension data
 * 
 * This module captures paste events (keyboard shortcuts and UI actions) and
 * checks if the clipboard contains data from the Chrome extension. When detected,
 * it prevents the default paste behavior and injects the converted data.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

class PasteInterceptor {
  constructor() {
    this.clipboardManager = null;
    this.editorDetector = null;
    this.editorInjector = null;
    this.formatConverter = null;
    this.mediaURLHandler = null;
    this.versionCompatibility = null;
    this.notificationManager = null;
    this.initialized = false;
    this.keyboardListenerAttached = false;
    this.contextMenuListenerAttached = false;
  }

  /**
   * Initialize the paste interceptor
   * Requirement 7.1: Intercept paste events in editor context
   * 
   * @param {ClipboardManager} clipboardManager - Instance of clipboard manager
   * @param {ElementorEditorDetector} editorDetector - Instance of editor detector
   * @param {EditorContextInjector} editorInjector - Instance of editor injector
   * @param {Object} formatConverter - Instance of format converter
   * @param {MediaURLHandler} mediaURLHandler - Instance of media URL handler (optional)
   * @param {VersionCompatibilityManager} versionCompatibility - Instance of version compatibility manager (optional)
   * @param {NotificationManager} notificationManager - Instance of notification manager (optional)
   * @returns {Promise<boolean>} Success status
   */
  async initialize(clipboardManager, editorDetector, editorInjector, formatConverter, mediaURLHandler, versionCompatibility, notificationManager) {
    try {
      if (this.initialized) {
        console.log('[Paste Interceptor] Already initialized');
        return true;
      }

      // Validate dependencies
      if (!clipboardManager || !editorDetector) {
        console.error('[Paste Interceptor] Missing required dependencies');
        return false;
      }

      this.clipboardManager = clipboardManager;
      this.editorDetector = editorDetector;
      this.editorInjector = editorInjector;
      this.formatConverter = formatConverter;
      this.mediaURLHandler = mediaURLHandler;
      this.versionCompatibility = versionCompatibility;
      this.notificationManager = notificationManager;

      // Wait for Elementor to be ready
      if (!this.editorDetector.isElementorEditor()) {
        console.log('[Paste Interceptor] Not in Elementor editor, skipping initialization');
        return false;
      }

      console.log('[Paste Interceptor] Initializing in Elementor editor...');

      // Attach keyboard event listeners
      this.attachKeyboardListeners();

      this.initialized = true;
      console.log('✓ Paste interceptor initialized');
      return true;

    } catch (error) {
      console.error('[Paste Interceptor] Initialization error:', error);
      return false;
    }
  }

  /**
   * Attach keyboard event listeners for paste shortcuts
   * Requirement 7.2: Listen for Ctrl+V and Cmd+V
   */
  attachKeyboardListeners() {
    if (this.keyboardListenerAttached) {
      console.log('[Paste Interceptor] Keyboard listeners already attached');
      return;
    }

    console.log('[Paste Interceptor] Attaching keyboard listeners...');
    
    // Listen for keydown events on the document
    const handler = this.handleKeyboardPaste.bind(this);
    document.addEventListener('keydown', handler, true);
    console.log('[Paste Interceptor] Document keydown listener attached');
    
    // Test listener
    console.log('[Paste Interceptor] Testing: Press any key to verify listener is working');
    
    // Also listen on the Elementor editor iframe if it exists
    this.attachEditorIframeListeners();

    this.keyboardListenerAttached = true;
    console.log('✓ Keyboard paste listeners attached');
  }

  /**
   * Attach listeners to Elementor editor iframe
   */
  attachEditorIframeListeners() {
    try {
      // Elementor editor typically uses an iframe for the preview
      const editorFrame = document.querySelector('#elementor-preview-iframe');
      
      if (editorFrame && editorFrame.contentWindow) {
        const frameDocument = editorFrame.contentWindow.document;
        frameDocument.addEventListener('keydown', this.handleKeyboardPaste.bind(this), true);
        console.log('✓ Editor iframe paste listeners attached');
      }
    } catch (error) {
      // Cross-origin iframe access may fail, which is expected
      console.log('[Paste Interceptor] Could not attach to iframe (may be cross-origin)');
    }
  }

  /**
   * Handle keyboard paste events (Ctrl+V, Cmd+V)
   * Requirement 7.2: Intercept keyboard paste shortcuts
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  async handleKeyboardPaste(event) {
    try {
      console.log('[Paste Interceptor] Key event:', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        target: event.target.tagName
      });
      
      // Check if this is a paste shortcut
      // Ctrl+V (Windows/Linux) or Cmd+V (Mac)
      const isPasteShortcut = (event.ctrlKey || event.metaKey) && 
                              event.key.toLowerCase() === 'v' &&
                              !event.shiftKey && 
                              !event.altKey;

      if (!isPasteShortcut) {
        console.log('[Paste Interceptor] Not a paste shortcut, ignoring');
        return;
      }

      console.log('[Paste Interceptor] ✓ Paste shortcut detected!');

      // Check if we should handle this paste
      const shouldHandle = await this.shouldHandlePaste();

      if (!shouldHandle) {
        console.log('[Paste Interceptor] No extension data in clipboard, allowing default paste');
        return;
      }

      // Prevent default paste behavior
      // Requirement 7.4: Prevent default when extension data is detected
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      console.log('✓ Paste event intercepted, extension data detected');

      // Read extension data from clipboard
      const extensionData = await this.clipboardManager.readExtensionData();

      if (!extensionData) {
        console.warn('[Paste Interceptor] Failed to read extension data after detection');
        return;
      }

      // Trigger paste with extension data
      await this.triggerExtensionPaste(extensionData);

    } catch (error) {
      console.error('[Paste Interceptor] Error handling keyboard paste:', error);
    }
  }

  /**
   * Check if paste should be handled by the extension
   * Requirement 7.3: Check for extension clipboard data
   * 
   * @returns {Promise<boolean>} True if extension should handle paste
   */
  async shouldHandlePaste() {
    try {
      // Check if we're in preview mode (should not intercept)
      if (this.editorDetector.isPreviewMode()) {
        console.log('[Paste Interceptor] In preview mode, skipping interception');
        return false;
      }

      // Check if clipboard contains extension data
      const hasExtensionData = await this.clipboardManager.hasExtensionData();

      return hasExtensionData;

    } catch (error) {
      console.error('[Paste Interceptor] Error checking clipboard:', error);
      return false;
    }
  }

  /**
   * Trigger paste operation with extension data
   * Requirement 5.4: Call editorInjector.triggerElementorPaste() with converted data
   * Requirement 7.5, 7.6: Inject data into Elementor
   * 
   * @param {Object} extensionData - The extension clipboard data
   */
  async triggerExtensionPaste(extensionData) {
    try {
      console.log('[Paste Interceptor] Triggering extension paste with data:', extensionData);

      // Validate extension data
      if (!extensionData || !extensionData.data) {
        throw new Error('Invalid extension data: missing data property');
      }

      // Get target Elementor version if available
      // Requirement 9.2: Detect target Elementor version during paste
      let targetVersion = 'unknown';
      if (this.editorInjector) {
        try {
          targetVersion = await this.editorInjector.getElementorVersion() || 'unknown';
          console.log('[Paste Interceptor] Target Elementor version:', targetVersion);
        } catch (error) {
          console.warn('[Paste Interceptor] Could not detect target version:', error);
        }
      }

      // Get source version
      const sourceVersion = extensionData.metadata?.elementorVersion || 'unknown';
      console.log('[Paste Interceptor] Source Elementor version:', sourceVersion);

      // Check version compatibility and apply conversion rules
      // Requirement 9.3, 9.4: Apply version conversion rules before injecting
      let conversionResult = null;
      if (this.versionCompatibility && sourceVersion !== 'unknown' && targetVersion !== 'unknown') {
        console.log('[Paste Interceptor] Checking version compatibility...');
        try {
          // Check if versions are compatible
          const compatibility = this.versionCompatibility.isCompatible(sourceVersion, targetVersion);
          console.log('[Paste Interceptor] Compatibility check:', compatibility);

          // Apply version conversion if needed
          if (sourceVersion !== targetVersion) {
            conversionResult = this.versionCompatibility.convertVersion(
              extensionData.data,
              sourceVersion,
              targetVersion
            );
            
            // Update data with converted version
            extensionData.data = conversionResult.data;
            
            console.log(`✓ Version conversion applied: ${conversionResult.rulesApplied} rule(s)`);
            
            // Show compatibility notification
            // Requirement 8.3: Show compatibility notifications to user
            this.showVersionNotification(conversionResult);
          }
        } catch (versionError) {
          console.error('[Paste Interceptor] Version compatibility check failed:', versionError);
          // Continue with paste even if version check fails
        }
      }

      // Process media URLs if handler is available
      // Requirement 4.6, 4.7: Process media URLs and show notifications
      let mediaURLs = [];
      if (this.mediaURLHandler) {
        console.log('[Paste Interceptor] Processing media URLs...');
        try {
          // Extract media URLs from the data
          mediaURLs = this.mediaURLHandler.extractMediaURLs(extensionData.data);
          
          if (mediaURLs.length > 0) {
            console.log(`[Paste Interceptor] Found ${mediaURLs.length} media URL(s)`);
            
            // Get source origin from metadata
            const sourceOrigin = extensionData.metadata?.sourceURL 
              ? new URL(extensionData.metadata.sourceURL).origin 
              : window.location.origin;
            
            // Convert to absolute URLs
            const absoluteURLs = this.mediaURLHandler.convertToAbsoluteURLs(mediaURLs, sourceOrigin);
            
            // Update element data with absolute URLs
            extensionData.data = this.mediaURLHandler.updateElementURLs(extensionData.data, sourceOrigin);
            
            // Show notification about external media
            // Requirement 8.2: Show warning notifications for external media URLs
            this.showMediaNotification(absoluteURLs);
          }
        } catch (mediaError) {
          console.error('[Paste Interceptor] Media URL processing failed:', mediaError);
          // Continue with paste even if media processing fails
        }
      }

      // Convert to native format if converter is available
      let nativeData = extensionData.data;
      if (this.formatConverter && this.formatConverter.convertToNativeFormat) {
        console.log('[Paste Interceptor] Converting to native format...');
        try {
          const sourceVersion = extensionData.metadata?.elementorVersion || 'unknown';
          nativeData = this.formatConverter.convertToNativeFormat(extensionData, {
            sourceVersion,
            targetVersion,
            sanitize: true
          });
          console.log('✓ Format conversion successful');
        } catch (conversionError) {
          console.error('[Paste Interceptor] Format conversion failed:', conversionError);
          // Fallback: try to use original data
          console.warn('[Paste Interceptor] Using original data as fallback');
        }
      } else {
        console.warn('[Paste Interceptor] Format converter not available, using original data');
      }

      // Inject into Elementor if injector is available
      // Requirement 5.4: Call editorInjector.triggerElementorPaste() with converted data
      // Requirement 7.5, 7.6: Inject data into Elementor
      if (!this.editorInjector) {
        console.error('[Paste Interceptor] Editor injector not available');
        this.handleInjectionError(
          new Error('Editor injector not initialized'),
          nativeData
        );
        return;
      }

      if (!this.editorInjector.triggerElementorPaste) {
        console.error('[Paste Interceptor] triggerElementorPaste method not available');
        this.handleInjectionError(
          new Error('Paste method not available'),
          nativeData
        );
        return;
      }

      console.log('[Paste Interceptor] ========== INJECTING INTO ELEMENTOR ==========');
      console.log('[Paste Interceptor] Native data to inject:', JSON.stringify(nativeData, null, 2));
      console.log('[Paste Interceptor] Data type:', typeof nativeData);
      console.log('[Paste Interceptor] Is array:', Array.isArray(nativeData));
      console.log('[Paste Interceptor] Element type:', nativeData?.elType || (Array.isArray(nativeData) ? nativeData[0]?.elType : 'unknown'));
      
      try {
        // Call editor injector to trigger Elementor paste
        // Requirement 5.4: Call editorInjector.triggerElementorPaste() with converted data
        const result = await this.editorInjector.triggerElementorPaste(nativeData);
        
        console.log('[Paste Interceptor] Injection result:', result);
        
        // Verify paste was successful
        if (!result || !result.success) {
          throw new Error(result?.error || 'Paste operation returned unsuccessful result');
        }
        
        console.log('✓ Paste injection successful via method:', result.method);
        console.log('✓ Elements created:', result.count || 'unknown');
        
        // Show success notification
        const elementType = extensionData.data?.widgetType || extensionData.data?.elType || 'element';
        this.showSuccessNotification(elementType);
        
      } catch (injectionError) {
        console.error('[Paste Interceptor] Injection failed:', injectionError);
        
        // Requirement 5.6: Handle injection errors and provide fallback
        this.handleInjectionError(injectionError, nativeData);
      }

    } catch (error) {
      console.error('[Paste Interceptor] Error triggering paste:', error);
      this.showErrorNotification('Failed to paste element: ' + error.message);
    }
  }

  /**
   * Handle injection errors with fallback strategies
   * Requirement 5.6: Handle injection errors and provide fallback
   * 
   * @param {Error} error - The injection error
   * @param {Object} nativeData - The converted native data
   */
  handleInjectionError(error, nativeData) {
    console.error('[Paste Interceptor] Handling injection error:', error);

    // Determine error type and provide appropriate fallback
    const errorMessage = error.message.toLowerCase();

    // Error type 1: Elementor not found or not ready
    if (errorMessage.includes('elementor not found') || 
        errorMessage.includes('not detected') ||
        errorMessage.includes('not initialized')) {
      this.showErrorNotification(
        'Elementor editor not detected. Please make sure you are in Elementor edit mode.',
        [
          {
            label: 'Refresh Page',
            action: () => window.location.reload()
          },
          {
            label: 'Manual Paste',
            action: () => this.showManualPasteInstructions(nativeData)
          }
        ]
      );
      return;
    }

    // Error type 2: Container or document issues
    if (errorMessage.includes('container') || 
        errorMessage.includes('document') ||
        errorMessage.includes('no active')) {
      this.showErrorNotification(
        'Could not find a valid paste location. Please click on a section or column first, then try pasting again.',
        [
          {
            label: 'Try Manual Paste',
            action: () => this.showManualPasteInstructions(nativeData)
          }
        ]
      );
      return;
    }

    // Error type 3: Timeout issues
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      this.showErrorNotification(
        'Paste operation timed out. Elementor may still be loading.',
        [
          {
            label: 'Retry',
            action: async () => {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              await this.triggerExtensionPaste({ data: nativeData });
            }
          },
          {
            label: 'Manual Paste',
            action: () => this.showManualPasteInstructions(nativeData)
          }
        ]
      );
      return;
    }

    // Error type 4: Method not available
    if (errorMessage.includes('method not available') || 
        errorMessage.includes('paste method') ||
        errorMessage.includes('all paste methods failed')) {
      this.showErrorNotification(
        'Elementor paste API is not available. This may be due to an incompatible Elementor version.',
        [
          {
            label: 'Manual Paste Instructions',
            action: () => this.showManualPasteInstructions(nativeData)
          },
          {
            label: 'Check Compatibility',
            action: () => {
              window.open('https://github.com/yourusername/elementor-copier#compatibility', '_blank');
            }
          }
        ]
      );
      return;
    }

    // Error type 5: Bridge or communication errors
    if (errorMessage.includes('bridge') || 
        errorMessage.includes('message') ||
        errorMessage.includes('communication')) {
      this.showErrorNotification(
        'Communication error with Elementor editor. Try refreshing the page.',
        [
          {
            label: 'Refresh Page',
            action: () => window.location.reload()
          },
          {
            label: 'Manual Paste',
            action: () => this.showManualPasteInstructions(nativeData)
          }
        ]
      );
      return;
    }

    // Generic error with comprehensive fallback options
    this.showErrorNotification(
      `Paste operation failed: ${error.message}. You can try manual paste as a fallback.`,
      [
        {
          label: 'Manual Paste Instructions',
          action: () => this.showManualPasteInstructions(nativeData)
        },
        {
          label: 'Retry',
          action: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.triggerExtensionPaste({ data: nativeData });
          }
        }
      ]
    );
  }

  /**
   * Show manual paste instructions as fallback
   * 
   * @param {Object} nativeData - The converted native data
   */
  showManualPasteInstructions(nativeData) {
    console.log('[Paste Interceptor] Showing manual paste instructions');
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(nativeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 999999;
      max-width: 500px;
      font-family: Arial, sans-serif;
    `;
    
    notification.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Manual Paste Instructions</h3>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #666; line-height: 1.5;">
        The automatic paste failed, but you can manually import the element:
      </p>
      <ol style="margin: 0 0 16px 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
        <li>Download the element data using the button below</li>
        <li>In Elementor, right-click on a section or column</li>
        <li>Select "Paste" from the context menu</li>
        <li>If that doesn't work, you may need to use Elementor's import feature</li>
      </ol>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="ec-download-data" style="padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
          Download Data
        </button>
        <button id="ec-close-instructions" style="padding: 8px 16px; background: #f5f5f5; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Download button
    document.getElementById('ec-download-data').onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elementor-element.json';
      a.click();
      URL.revokeObjectURL(url);
    };
    
    // Close button
    document.getElementById('ec-close-instructions').onclick = () => {
      document.body.removeChild(notification);
      URL.revokeObjectURL(url);
    };
  }

  /**
   * Show success notification to user
   * 
   * @param {string} elementType - Type of element pasted
   */
  showSuccessNotification(elementType) {
    const message = `${this.formatElementType(elementType)} pasted successfully!`;
    console.log(`[Paste Interceptor] ${message}`);
    
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 400px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  /**
   * Show error notification to user
   * 
   * @param {string} message - Error message
   * @param {Array} actions - Optional action buttons
   */
  showErrorNotification(message, actions = []) {
    console.error(`[Paste Interceptor] ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 400px;
    `;
    
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    // Add action buttons if provided
    if (actions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.style.cssText = `
        margin-top: 12px;
        display: flex;
        gap: 8px;
      `;
      
      actions.forEach(actionConfig => {
        const button = document.createElement('button');
        button.textContent = actionConfig.label;
        button.style.cssText = `
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        `;
        button.onclick = () => {
          actionConfig.action();
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        };
        actionsContainer.appendChild(button);
      });
      
      notification.appendChild(actionsContainer);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 8000);
  }

  /**
   * Show version compatibility notification
   * Requirement 8.3: Show compatibility notifications to user
   * 
   * @param {Object} conversionResult - Result from version conversion
   */
  showVersionNotification(conversionResult) {
    if (!conversionResult) {
      return;
    }

    // Use notification manager if available
    if (this.notificationManager && this.notificationManager.notifyVersionConversion) {
      const changes = conversionResult.rulesApplied > 0 
        ? [`${conversionResult.rulesApplied} compatibility adjustment(s)`]
        : [];
      
      this.notificationManager.notifyVersionConversion(
        conversionResult.sourceVersion,
        conversionResult.targetVersion,
        changes
      );
      return;
    }

    // Fallback: show simple notification
    const compatibility = conversionResult.compatibility;
    
    // Only show notification if there's a warning or conversion was applied
    if (!compatibility.warning && conversionResult.rulesApplied === 0) {
      return;
    }

    let message = '';
    let backgroundColor = '#2196f3'; // Info blue

    if (!compatibility.compatible) {
      message = `Version incompatibility: ${compatibility.message}`;
      backgroundColor = '#f44336'; // Error red
    } else if (compatibility.warning) {
      message = compatibility.message;
      backgroundColor = '#ff9800'; // Warning orange
    } else if (conversionResult.rulesApplied > 0) {
      message = `Element converted from Elementor ${conversionResult.sourceVersion} to ${conversionResult.targetVersion}. ${conversionResult.rulesApplied} compatibility adjustment(s) applied.`;
      backgroundColor = '#2196f3'; // Info blue
    }

    if (!message) {
      return;
    }

    console.log(`[Paste Interceptor] ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 400px;
      line-height: 1.5;
    `;
    
    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px;';
    title.textContent = 'Version Compatibility';
    notification.appendChild(title);
    
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    document.body.appendChild(notification);
    
    // Remove after 6 seconds
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 6000);
  }

  /**
   * Show media notification for external URLs
   * Requirement 4.6, 4.7, 8.2: Show notifications for external media URLs during paste
   * 
   * @param {Array} mediaURLs - Array of media URL objects
   */
  showMediaNotification(mediaURLs) {
    if (!mediaURLs || mediaURLs.length === 0) {
      return;
    }

    // Filter for external URLs
    const externalURLs = mediaURLs.filter(item => item.isExternal);
    
    if (externalURLs.length === 0) {
      return;
    }

    // Use notification manager if available
    if (this.notificationManager && this.notificationManager.notifyExternalMedia) {
      const urls = externalURLs.map(item => item.url);
      this.notificationManager.notifyExternalMedia(urls);
      return;
    }

    // Fallback: show simple notification
    const count = externalURLs.length;
    const message = count > 1
      ? `This element contains ${count} external media files. These may not display if the source site restricts access.`
      : 'This element contains external media. It may not display if the source site restricts access.';

    console.warn(`[Paste Interceptor] ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff9800;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 400px;
      line-height: 1.5;
    `;
    
    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px;';
    title.textContent = 'External Media Detected';
    notification.appendChild(title);
    
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    const tip = document.createElement('div');
    tip.style.cssText = 'margin-top: 8px; font-size: 12px; opacity: 0.9;';
    tip.textContent = 'Tip: Upload media to your WordPress library for better reliability.';
    notification.appendChild(tip);
    
    document.body.appendChild(notification);
    
    // Remove after 7 seconds
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 7000);
  }

  /**
   * Format element type for display
   * 
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
   * Cleanup and remove event listeners
   */
  cleanup() {
    if (this.keyboardListenerAttached) {
      document.removeEventListener('keydown', this.handleKeyboardPaste.bind(this), true);
      this.keyboardListenerAttached = false;
    }

    this.initialized = false;
    console.log('[Paste Interceptor] Cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PasteInterceptor };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.PasteInterceptor = PasteInterceptor;
}

// Auto-initialize when in Elementor editor (MAIN world)
if (typeof window !== 'undefined' && window.ElementorEditorDetector) {
  console.log('[Paste Interceptor] Auto-initialization starting...');
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePasteInterceptor);
  } else {
    // DOM is already ready
    initializePasteInterceptor();
  }
  
  async function initializePasteInterceptor() {
    try {
      // Wait a bit for all modules to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we're in Elementor editor
      const detector = new window.ElementorEditorDetector();
      const isEditor = detector.isElementorEditor();
      
      if (!isEditor) {
        console.log('[Paste Interceptor] Not in Elementor editor, skipping initialization');
        return;
      }
      
      console.log('[Paste Interceptor] In Elementor editor, initializing paste functionality...');
      
      // Initialize required modules
      const clipboardManager = window.ClipboardManager ? new window.ClipboardManager() : null;
      const editorInjector = window.EditorContextInjector ? new window.EditorContextInjector() : null;
      const formatConverter = window.ElementorFormatConverter || null;
      
      if (!clipboardManager) {
        console.error('[Paste Interceptor] ClipboardManager not available');
        return;
      }
      
      if (!editorInjector) {
        console.error('[Paste Interceptor] EditorContextInjector not available');
        return;
      }
      
      // Initialize clipboard manager
      await clipboardManager.initialize();
      
      // Initialize editor injector
      await editorInjector.initialize();
      
      // Create and initialize paste interceptor
      const pasteInterceptor = new PasteInterceptor();
      const success = await pasteInterceptor.initialize(
        clipboardManager,
        detector,
        editorInjector,
        formatConverter,
        null, // mediaURLHandler
        null, // versionCompatibility
        null  // notificationManager
      );
      
      if (success) {
        console.log('✅ [Paste Interceptor] Paste functionality is ready!');
        console.log('✅ [Paste Interceptor] You can now paste copied Elementor elements with Ctrl+V / Cmd+V');
        
        // Store globally for debugging
        window.elementorCopierPasteInterceptor = pasteInterceptor;
      } else {
        console.error('[Paste Interceptor] Initialization failed');
      }
      
    } catch (error) {
      console.error('[Paste Interceptor] Auto-initialization error:', error);
    }
  }
}
