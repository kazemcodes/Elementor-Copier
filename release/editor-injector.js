/**
 * Editor Context Injector
 * 
 * Safely injects code into Elementor's editor context (main world) to access
 * internal APIs and trigger paste operations. Uses message passing to communicate
 * between the content script (isolated world) and injected script (main world).
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

class EditorContextInjector {
  constructor() {
    this.injected = false;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;
    this.bridgeReady = false;
    
    // Initialize message bridge
    this.setupMessageBridge();
  }

  /**
   * Setup message bridge between content script and injected script
   * Requirement 5.3: Create message bridge between content script and injected script
   */
  setupMessageBridge() {
    // Listen for messages from injected script
    window.addEventListener('message', (event) => {
      // Only accept messages from same origin
      if (event.source !== window) return;
      
      // Check for our message format
      if (event.data && event.data.source === 'elementor-copier-injected') {
        this.handleInjectedMessage(event.data);
      }
    });

    console.log('[EditorInjector] Message bridge initialized');
  }

  /**
   * Handle messages from injected script
   */
  handleInjectedMessage(data) {
    const { type, requestId, payload, error } = data;

    switch (type) {
      case 'bridge-ready':
        this.bridgeReady = true;
        console.log('[EditorInjector] Bridge ready');
        break;

      case 'response':
        // Handle response to a pending request
        if (this.pendingRequests.has(requestId)) {
          const { resolve, reject } = this.pendingRequests.get(requestId);
          if (error) {
            reject(new Error(error));
          } else {
            resolve(payload);
          }
          this.pendingRequests.delete(requestId);
        }
        break;

      case 'event':
        // Handle events from injected script
        if (this.messageHandlers.has(payload.eventName)) {
          this.messageHandlers.get(payload.eventName)(payload.data);
        }
        break;
    }
  }

  /**
   * Send message to injected script and wait for response
   */
  sendMessage(action, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!this.injected) {
        reject(new Error('Injected script not loaded'));
        return;
      }

      const requestId = ++this.requestId;
      this.pendingRequests.set(requestId, { resolve, reject });

      // Send message to injected script
      window.postMessage({
        source: 'elementor-copier-content',
        action,
        requestId,
        payload
      }, '*');

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Register event handler for injected script events
   */
  on(eventName, handler) {
    this.messageHandlers.set(eventName, handler);
  }

  /**
   * Inject script into main world using <script> tag
   * Requirement 5.2: Implement script injection into main world using <script> tag
   * Requirement 5.1: Wait for Elementor's JavaScript to fully load before attempting integration
   */
  async injectScript() {
    if (this.injected) {
      console.log('[EditorInjector] Script already injected');
      return true;
    }

    try {
      // Create script element
      const script = document.createElement('script');
      script.id = 'elementor-copier-injected';
      
      // Inline script content to avoid CSP issues
      script.textContent = this.getInjectedScriptContent();
      
      // Inject into page
      (document.head || document.documentElement).appendChild(script);
      
      // Remove script tag after execution (code remains in memory)
      script.remove();
      
      this.injected = true;
      console.log('[EditorInjector] Script injected successfully');

      // Wait for bridge to be ready
      await this.waitForBridge();
      
      return true;
    } catch (error) {
      console.error('[EditorInjector] Failed to inject script:', error);
      return false;
    }
  }

  /**
   * Wait for message bridge to be ready
   */
  waitForBridge(timeout = 3000) {
    return new Promise((resolve, reject) => {
      if (this.bridgeReady) {
        resolve();
        return;
      }

      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (this.bridgeReady) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error('Bridge ready timeout'));
        }
      }, 100);
    });
  }

  /**
   * Get the content of the script to be injected
   * This script runs in the main world and has access to Elementor APIs
   */
  getInjectedScriptContent() {
    return `
(function() {
  'use strict';
  
  console.log('[ElementorCopier] Injected script loaded - VERSION 3.0 - PASTE FIX');

  // Requirement 5.6: Wrap all Elementor API calls in try-catch for safety
  const safeCall = (fn, fallback = null) => {
    try {
      return fn();
    } catch (error) {
      console.error('[ElementorCopier] Safe call error:', error);
      return fallback;
    }
  };

  // Requirement 5.1: Wait for Elementor to be ready
  const waitForElementor = () => {
    return new Promise((resolve) => {
      if (window.elementor && window.elementor.loaded) {
        resolve();
        return;
      }

      // Wait for elementor:loaded event
      if (window.elementor) {
        window.elementor.on('preview:loaded', () => {
          resolve();
        });
      } else {
        // Poll for elementor object
        const checkInterval = setInterval(() => {
          if (window.elementor && window.elementor.loaded) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });
  };

  // Requirement 5.7: Implement detection and adaptation to React component lifecycle
  const detectReactComponents = () => {
    return safeCall(() => {
      // Check if Elementor uses React
      const hasReact = !!(window.React || window.ReactDOM);
      const elementorVersion = window.elementor?.config?.version || 'unknown';
      
      // Return serializable data only (no functions)
      return {
        hasReact: hasReact,
        elementorVersion: elementorVersion,
        isReactBased: hasReact && parseFloat(elementorVersion) >= 3.0
      };
    }, { hasReact: false, elementorVersion: 'unknown', isReactBased: false });
  };

  // Requirement 5.4: Add triggerElementorPaste() function to call Elementor's internal paste API
  const triggerElementorPaste = (elementData) => {
    return safeCall(() => {
      console.log('[ElementorCopier] ========== PASTE OPERATION START ==========');
      console.log('[ElementorCopier] Raw element data received:', JSON.stringify(elementData).substring(0, 500));
      
      if (!window.elementor) {
        throw new Error('Elementor not found');
      }

      if (!window.$e) {
        throw new Error('Elementor commands ($e) not found');
      }

      // Prepare the data for pasting
      const pasteData = Array.isArray(elementData) ? elementData : [elementData];
      
      console.log('[ElementorCopier] Paste data prepared:', pasteData.length, 'element(s)');
      console.log('[ElementorCopier] First element:', JSON.stringify(pasteData[0], null, 2));
      console.log('[ElementorCopier] Element type:', pasteData[0]?.elType);
      console.log('[ElementorCopier] Element ID:', pasteData[0]?.id);
      console.log('[ElementorCopier] Has settings:', !!pasteData[0]?.settings);
      console.log('[ElementorCopier] Has elements:', !!pasteData[0]?.elements);
      console.log('[ElementorCopier] Child elements count:', pasteData[0]?.elements?.length || 0);

      // Method 1: Use document/elements/create command (most reliable for Elementor 3.x)
      try {
        console.log('[ElementorCopier] --- METHOD 1: document/elements/create ---');
        
        // Get the active container
        let container = window.elementor.getPreviewContainer?.();
        console.log('[ElementorCopier] getPreviewContainer result:', container?.id || 'null');
        
        // If no container, try getting from selection
        if (!container) {
          const selection = window.elementor.selection?.getElements?.();
          console.log('[ElementorCopier] Selection elements:', selection?.length || 0);
          if (selection && selection.length > 0) {
            container = selection[0];
            console.log('[ElementorCopier] Using selected container:', container.id);
          }
        }
        
        // If still no container, use document root
        if (!container) {
          const document = window.elementor.documents?.getCurrent();
          console.log('[ElementorCopier] Current document:', document?.id || 'null');
          container = document?.container;
          console.log('[ElementorCopier] Document container:', container?.id || 'null');
        }
        
        if (!container) {
          throw new Error('No valid container found');
        }
        
        console.log('[ElementorCopier] Final target container ID:', container.id || 'root');
        console.log('[ElementorCopier] Container type:', container.model?.get('elType'));
        console.log('[ElementorCopier] Container children count:', container.children?.length || 0);
        
        // Create elements using Elementor's command system
        const results = [];
        for (let i = 0; i < pasteData.length; i++) {
          const element = pasteData[i];
          console.log('[ElementorCopier] Creating element ' + (i + 1) + '/' + pasteData.length + ':', element.elType);
          console.log('[ElementorCopier] Element data:', JSON.stringify(element, null, 2));
          
          try {
            const result = window.$e.run('document/elements/create', {
              model: element,
              container: container,
              options: {}
            });
            results.push(result);
            console.log('[ElementorCopier] ✓ Element created successfully:', element.elType);
            console.log('[ElementorCopier] Created element result:', result);
            
            // Check if element was actually added to DOM
            setTimeout(() => {
              const elementInDom = document.querySelector('[data-id="' + element.id + '"]');
              console.log('[ElementorCopier] Element in DOM check:', !!elementInDom, 'for ID:', element.id);
            }, 100);
          } catch (err) {
            console.error('[ElementorCopier] ✗ Failed to create element:', element.elType, err);
            console.error('[ElementorCopier] Error details:', err.message, err.stack);
          }
        }
        
        if (results.length > 0) {
          console.log('[ElementorCopier] ✓ Successfully created', results.length, 'element(s)');
          console.log('[ElementorCopier] Results:', results);
          return { success: true, method: 'document-elements-create', count: results.length, results };
        } else {
          console.warn('[ElementorCopier] No elements were created');
        }
      } catch (err) {
        console.error('[ElementorCopier] ✗ document/elements/create failed:', err);
        console.error('[ElementorCopier] Error stack:', err.stack);
      }

      // Method 2: Use clipboard channel with paste command
      try {
        console.log('[ElementorCopier] Attempting clipboard channel method');
        
        if (window.elementor.channels?.clipboard) {
          // Set data in Elementor's clipboard
          window.elementor.channels.clipboard.reply('data', pasteData);
          console.log('[ElementorCopier] Data set in clipboard channel');
          
          // Get container
          let container = window.elementor.getPreviewContainer?.();
          if (!container) {
            const document = window.elementor.documents?.getCurrent();
            container = document?.container;
          }
          
          if (container) {
            // Trigger paste command
            window.$e.run('document/ui/paste', {
              container: container
            });
            console.log('[ElementorCopier] Paste command executed');
            return { success: true, method: 'clipboard-channel' };
          }
        }
      } catch (err) {
        console.error('[ElementorCopier] Clipboard channel method failed:', err);
      }

      // Method 3: Direct insertion into preview
      try {
        console.log('[ElementorCopier] Attempting direct insertion method');
        
        const previewView = window.elementor.getPreviewView?.();
        if (previewView && previewView.addChildElement) {
          pasteData.forEach(element => {
            previewView.addChildElement(element);
          });
          console.log('[ElementorCopier] Direct insertion completed');
          return { success: true, method: 'direct-insertion' };
        }
      } catch (err) {
        console.error('[ElementorCopier] Direct insertion failed:', err);
      }

      console.error('[ElementorCopier] All paste methods exhausted');
      return { success: false, error: 'All paste methods failed' };
    }, { success: false, error: 'Safe call wrapper failed' });
  };

  // Access Elementor API
  const accessElementorAPI = (apiPath) => {
    return safeCall(() => {
      const parts = apiPath.split('.');
      let current = window;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return null;
        }
      }
      
      return current;
    }, null);
  };

  // Get Elementor version
  const getElementorVersion = () => {
    return safeCall(() => {
      return window.elementor?.config?.version || null;
    }, null);
  };

  // Check if in editor mode
  const isEditorMode = () => {
    return safeCall(() => {
      return !!(window.elementor && window.elementor.config?.document?.id);
    }, false);
  };

  // Get current selection/container
  const getCurrentContainer = () => {
    return safeCall(() => {
      if (!window.elementor) return null;
      
      // Try to get selected element
      const selection = window.elementor.selection?.getElements();
      if (selection && selection.length > 0) {
        return selection[0];
      }
      
      // Fallback to preview container
      return window.elementor.getPreviewContainer();
    }, null);
  };

  // Message handler
  const handleMessage = async (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== 'elementor-copier-content') return;

    const { action, requestId, payload } = event.data;

    try {
      let result;

      switch (action) {
        case 'wait-for-elementor':
          await waitForElementor();
          result = { ready: true };
          break;

        case 'detect-react':
          result = detectReactComponents();
          break;

        case 'trigger-paste':
          result = triggerElementorPaste(payload.elementData);
          break;

        case 'access-api':
          result = accessElementorAPI(payload.apiPath);
          break;

        case 'get-version':
          result = getElementorVersion();
          break;

        case 'is-editor-mode':
          result = isEditorMode();
          break;

        case 'get-current-container':
          result = getCurrentContainer();
          break;

        default:
          throw new Error('Unknown action: ' + action);
      }

      // Send response
      window.postMessage({
        source: 'elementor-copier-injected',
        type: 'response',
        requestId,
        payload: result
      }, '*');

    } catch (error) {
      // Send error response
      window.postMessage({
        source: 'elementor-copier-injected',
        type: 'response',
        requestId,
        error: error.message
      }, '*');
    }
  };

  // Setup message listener
  window.addEventListener('message', handleMessage);

  // Notify that bridge is ready
  window.postMessage({
    source: 'elementor-copier-injected',
    type: 'bridge-ready'
  }, '*');

  console.log('[ElementorCopier] Injected script ready');
})();
`;
  }

  /**
   * Wait for Elementor to be fully loaded
   * Requirement 5.1: Wait for Elementor's JavaScript to fully load before attempting integration
   */
  async waitForElementorReady() {
    try {
      const result = await this.sendMessage('wait-for-elementor');
      return result.ready;
    } catch (error) {
      console.error('[EditorInjector] Failed to wait for Elementor:', error);
      return false;
    }
  }

  /**
   * Detect React components
   * Requirement 5.7: Implement detection and adaptation to React component lifecycle
   */
  async detectReactComponents() {
    try {
      return await this.sendMessage('detect-react');
    } catch (error) {
      console.error('[EditorInjector] Failed to detect React:', error);
      return { hasReact: false, elementorVersion: 'unknown', isReactBased: false };
    }
  }

  /**
   * Trigger Elementor paste operation
   * Requirement 5.4: Add triggerElementorPaste() function to call Elementor's internal paste API
   * Requirement 5.6: Wrap all Elementor API calls in try-catch for safety
   */
  async triggerElementorPaste(elementData) {
    try {
      const result = await this.sendMessage('trigger-paste', { elementData });
      
      if (!result.success) {
        throw new Error(result.error || 'Paste operation failed');
      }
      
      console.log('[EditorInjector] Paste successful via method:', result.method);
      return result;
    } catch (error) {
      console.error('[EditorInjector] Failed to trigger paste:', error);
      throw error;
    }
  }

  /**
   * Access Elementor API by path
   * Requirement 5.2: Use only documented or stable internal APIs
   * Requirement 5.6: Wrap all Elementor API calls in try-catch for safety
   */
  async accessElementorAPI(apiPath) {
    try {
      return await this.sendMessage('access-api', { apiPath });
    } catch (error) {
      console.error('[EditorInjector] Failed to access API:', error);
      return null;
    }
  }

  /**
   * Get Elementor version
   */
  async getElementorVersion() {
    try {
      return await this.sendMessage('get-version');
    } catch (error) {
      console.error('[EditorInjector] Failed to get version:', error);
      return null;
    }
  }

  /**
   * Check if in editor mode
   * Requirement 5.5: When the editor is in preview mode THEN the system SHALL disable paste interception
   */
  async isEditorMode() {
    try {
      return await this.sendMessage('is-editor-mode');
    } catch (error) {
      console.error('[EditorInjector] Failed to check editor mode:', error);
      return false;
    }
  }

  /**
   * Get current container/selection
   */
  async getCurrentContainer() {
    try {
      return await this.sendMessage('get-current-container');
    } catch (error) {
      console.error('[EditorInjector] Failed to get current container:', error);
      return null;
    }
  }

  /**
   * Initialize the injector
   * Requirement 5.6: When errors occur in injected code THEN the system SHALL fail gracefully without breaking the editor
   */
  async initialize() {
    try {
      // Inject the script
      const injected = await this.injectScript();
      if (!injected) {
        throw new Error('Failed to inject script');
      }

      // Wait for Elementor to be ready
      const ready = await this.waitForElementorReady();
      if (!ready) {
        console.warn('[EditorInjector] Elementor not ready, but continuing');
      }

      // Detect React components
      const reactInfo = await this.detectReactComponents();
      console.log('[EditorInjector] React detection:', reactInfo);

      console.log('[EditorInjector] Initialization complete');
      return true;
    } catch (error) {
      console.error('[EditorInjector] Initialization failed:', error);
      // Requirement 5.6: Fail gracefully
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.pendingRequests.clear();
    this.messageHandlers.clear();
    this.bridgeReady = false;
    console.log('[EditorInjector] Cleanup complete');
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EditorContextInjector };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.EditorContextInjector = EditorContextInjector;
  console.log('[EditorContextInjector] Exported to window');
}
