/**
 * Elementor Editor Detector
 * 
 * Detects if the current page is running the Elementor editor and provides
 * utilities to wait for Elementor to be fully loaded.
 * 
 * Requirements: 1.1, 1.2, 9.1
 */

class ElementorEditorDetector {
  constructor() {
    this.maxRetries = 10;
    this.initialDelay = 100; // ms
    this.maxDelay = 5000; // ms
    this.mutationObserver = null;
  }

  /**
   * Check if the current page is an Elementor editor
   * @returns {boolean} True if Elementor editor is detected
   */
  isElementorEditor() {
    // Check for window.elementor object (main editor API)
    const hasElementor = typeof window.elementor !== 'undefined' && window.elementor !== null;
    
    // Check for window.elementorFrontend object (frontend rendering)
    const hasElementorFrontend = typeof window.elementorFrontend !== 'undefined' && window.elementorFrontend !== null;
    
    // Check if we're in the main editor page (URL contains action=elementor)
    const isMainEditorPage = window.location.href.includes('action=elementor');
    
    // Check if we're in the preview iframe (URL contains elementor-preview)
    const isPreviewFrame = window.location.href.includes('elementor-preview');
    
    // Verify we're in edit mode by checking for config
    const hasConfig = hasElementor && window.elementor.config;
    
    // We're in editor if:
    // 1. Main editor page with elementor object
    // 2. Preview iframe with elementor object and config
    // 3. Preview iframe with elementorFrontend
    return isMainEditorPage || (hasElementor && hasConfig) || (isPreviewFrame && hasElementorFrontend);
  }

  /**
   * Get the Elementor version from the editor
   * @returns {string|null} Version string or null if not available
   */
  getElementorVersion() {
    try {
      if (window.elementor && window.elementor.config && window.elementor.config.version) {
        return window.elementor.config.version;
      }
      
      // Fallback: try elementorFrontend
      if (window.elementorFrontend && window.elementorFrontend.config && window.elementorFrontend.config.version) {
        return window.elementorFrontend.config.version;
      }
      
      return null;
    } catch (error) {
      console.error('[Elementor Detector] Error getting version:', error);
      return null;
    }
  }

  /**
   * Get the Elementor editor instance
   * @returns {object|null} Elementor editor instance or null
   */
  getEditorInstance() {
    return window.elementor || null;
  }

  /**
   * Wait for Elementor to be ready with exponential backoff
   * @returns {Promise<void>} Resolves when Elementor is ready
   */
  async waitForElementorReady() {
    return new Promise((resolve, reject) => {
      // Check if already ready
      if (this.isElementorEditor()) {
        resolve();
        return;
      }

      let retryCount = 0;
      let currentDelay = this.initialDelay;

      const poll = () => {
        if (this.isElementorEditor()) {
          this.stopMutationObserver();
          resolve();
          return;
        }

        retryCount++;
        
        if (retryCount >= this.maxRetries) {
          this.stopMutationObserver();
          reject(new Error('Elementor editor not detected after maximum retries'));
          return;
        }

        // Exponential backoff: double the delay each time, up to maxDelay
        currentDelay = Math.min(currentDelay * 2, this.maxDelay);
        
        setTimeout(poll, currentDelay);
      };

      // Start polling
      setTimeout(poll, this.initialDelay);

      // Also set up MutationObserver for dynamic loading
      this.observeDynamicLoading(resolve, reject);
    });
  }

  /**
   * Set up MutationObserver to detect dynamic Elementor loading
   * @param {Function} resolve Promise resolve function
   * @param {Function} reject Promise reject function
   */
  observeDynamicLoading(resolve, reject) {
    // Don't create multiple observers
    if (this.mutationObserver) {
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      // Check if Elementor is now available
      if (this.isElementorEditor()) {
        this.stopMutationObserver();
        resolve();
      }
    });

    // Observe changes to the document body and head
    // Elementor typically injects scripts and iframes
    const config = {
      childList: true,
      subtree: true,
      attributes: false
    };

    this.mutationObserver.observe(document.documentElement, config);
  }

  /**
   * Stop the MutationObserver
   */
  stopMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  /**
   * Get detailed editor information
   * @returns {object} Editor information object
   */
  getEditorInfo() {
    if (!this.isElementorEditor()) {
      return {
        isEditor: false,
        version: null,
        documentId: null,
        editMode: null
      };
    }

    try {
      return {
        isEditor: true,
        version: this.getElementorVersion(),
        documentId: window.elementor.config.document.id,
        editMode: window.elementor.config.document.type,
        isPreview: window.elementor.config.document.panel?.is_preview || false
      };
    } catch (error) {
      console.error('[Elementor Detector] Error getting editor info:', error);
      return {
        isEditor: true,
        version: this.getElementorVersion(),
        documentId: null,
        editMode: null
      };
    }
  }

  /**
   * Check if Elementor is in preview mode
   * @returns {boolean} True if in preview mode
   */
  isPreviewMode() {
    try {
      return window.elementor?.config?.document?.panel?.is_preview || false;
    } catch (error) {
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ElementorEditorDetector };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.ElementorEditorDetector = ElementorEditorDetector;
  console.log('[ElementorEditorDetector] Exported to window');
}
