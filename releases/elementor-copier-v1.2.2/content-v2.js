/**
 * Elementor Copier - Content Script
 * Runs on all pages to detect and extract Elementor data
 */

(function () {
  'use strict';

  // State
  let highlightMode = false;
  let lastClickedElement = null;
  let elementorDetected = false;

  // Error tracking
  const errorLog = [];
  const MAX_ERROR_LOG_SIZE = 50;

  // Retry configuration
  const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // ms
    backoffMultiplier: 2
  };

  // Module loading state
  let formatConverterLoaded = false;
  let editorDetectorLoaded = false;
  let clipboardManagerLoaded = false;
  let pasteInterceptorLoaded = false;
  let editorInjectorLoaded = false;
  let mediaURLHandlerLoaded = false;
  let versionCompatibilityLoaded = false;
  let contentSanitizerLoaded = false;
  let notificationManagerLoaded = false;
  let dataExtractorLoaded = false;

  // Module instances
  let editorDetector = null;
  let clipboardManager = null;
  let pasteInterceptor = null;
  let editorInjector = null;
  let mediaURLHandler = null;
  let versionCompatibilityManager = null;
  let contentSanitizer = null;
  let notificationManager = null;
  let dataExtractor = null;

  // NOTE: This function is no longer needed as modules are loaded via manifest.json
  // in the MAIN world. Kept for backwards compatibility.
  function injectCriticalClasses() {
    // All modules (editor-injector.js, etc.) are now loaded via manifest.json
    // in the MAIN world, so no additional injection is needed
    console.log('[Inline] Modules loaded via manifest (MAIN world), no injection needed');
  }

  console.log('🚀 [v2.0] Content script starting...');

  // Inject critical classes first - MUST happen before anything else
  try {
    console.log('🔧 [v2.0] About to inject critical classes...');
    injectCriticalClasses();
    console.log('✅ [v2.0] Injection function called');
  } catch (error) {
    console.error('❌ [v2.0] Failed to inject critical classes:', error);
  }

  console.log('📦 [v2.0] Modules will be loaded in MAIN world via manifest');
  console.log('✨ [v2.0] Elementor Copier: Content script loaded - NEW VERSION');

  // Note: Modules are now loaded in MAIN world (page context) via manifest.json
  // The page-bridge.js script will initialize them there
  // This content script only handles copy operations and context menu

  // Wait for DOM to be ready before detecting Elementor
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectElementor);
  } else {
    // DOM is already ready
    detectElementor();
  }

  /**
   * Load format converter module
   */
  function loadFormatConverter() {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('elementor-format-converter.js');
      script.onload = () => {
        formatConverterLoaded = true;
        console.log('✓ Format converter loaded');
      };
      script.onerror = () => {
        console.warn('✗ Failed to load format converter');
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (error) {
      console.warn('Error loading format converter:', error);
    }
  }

  /**
   * Load editor integration modules (detector, clipboard manager, paste interceptor)
   * Requirement 1.1, 1.2: Add Elementor editor detection on page load
   */
  function loadEditorIntegrationModules() {
    try {
      // Load Elementor editor detector
      const detectorScript = document.createElement('script');
      detectorScript.src = chrome.runtime.getURL('elementor-editor-detector.js');
      detectorScript.onload = () => {
        editorDetectorLoaded = true;
        console.log('✓ Elementor editor detector loaded');
        // Check if class is available immediately and after delay
        console.log('[IMMEDIATE] ElementorEditorDetector:', typeof window.ElementorEditorDetector);
        setTimeout(() => {
          console.log('[DELAYED] ElementorEditorDetector:', typeof window.ElementorEditorDetector);
          if (typeof window.ElementorEditorDetector === 'undefined') {
            console.error('❌ ElementorEditorDetector class not found in window after script loaded!');
            console.log('Window keys:', Object.keys(window).filter(k => k.includes('Elementor')));
          }
        }, 100);
        checkAndInitializeEditorIntegration();
      };
      detectorScript.onerror = (error) => {
        console.error('✗ Failed to load Elementor editor detector script:', error);
      };
      (document.head || document.documentElement).appendChild(detectorScript);

      // Load clipboard manager
      const clipboardScript = document.createElement('script');
      clipboardScript.src = chrome.runtime.getURL('clipboard-manager.js');
      clipboardScript.onload = () => {
        clipboardManagerLoaded = true;
        console.log('✓ Clipboard manager loaded');
        checkAndInitializeEditorIntegration();
      };
      clipboardScript.onerror = () => {
        console.warn('✗ Failed to load clipboard manager');
      };
      (document.head || document.documentElement).appendChild(clipboardScript);

      // Load paste interceptor
      const interceptorScript = document.createElement('script');
      interceptorScript.src = chrome.runtime.getURL('paste-interceptor.js');
      interceptorScript.onload = () => {
        pasteInterceptorLoaded = true;
        console.log('✓ Paste interceptor loaded');
        checkAndInitializeEditorIntegration();
      };
      interceptorScript.onerror = () => {
        console.warn('✗ Failed to load paste interceptor');
      };
      (document.head || document.documentElement).appendChild(interceptorScript);
    } catch (error) {
      console.warn('Error loading editor integration modules:', error);
    }
  }

  /**
   * Load additional modules (editor injector, media handler, version compatibility, sanitizer, notifications)
   * Requirement 1.3, 1.4, 1.5: Wire up all modules
   */
  function loadAdditionalModules() {
    try {
      // Load editor injector
      const injectorScript = document.createElement('script');
      injectorScript.src = chrome.runtime.getURL('editor-injector.js');
      injectorScript.onload = () => {
        editorInjectorLoaded = true;
        console.log('✓ Editor injector loaded');
        // Check if class is available immediately and after delay
        console.log('[IMMEDIATE] EditorContextInjector:', typeof window.EditorContextInjector);
        setTimeout(() => {
          console.log('[DELAYED] EditorContextInjector:', typeof window.EditorContextInjector);
          if (typeof window.EditorContextInjector === 'undefined') {
            console.error('❌ EditorContextInjector class not found in window after script loaded!');
          }
        }, 100);
        checkAndInitializeEditorIntegration();
      };
      injectorScript.onerror = (error) => {
        console.error('✗ Failed to load editor injector script:', error);
      };
      (document.head || document.documentElement).appendChild(injectorScript);

      // Load media URL handler
      const mediaScript = document.createElement('script');
      mediaScript.src = chrome.runtime.getURL('media-url-handler.js');
      mediaScript.onload = () => {
        mediaURLHandlerLoaded = true;
        console.log('✓ Media URL handler loaded');
        checkAndInitializeEditorIntegration();
      };
      mediaScript.onerror = () => {
        console.warn('✗ Failed to load media URL handler');
      };
      (document.head || document.documentElement).appendChild(mediaScript);

      // Load version compatibility manager
      const versionScript = document.createElement('script');
      versionScript.src = chrome.runtime.getURL('version-compatibility.js');
      versionScript.onload = () => {
        versionCompatibilityLoaded = true;
        console.log('✓ Version compatibility manager loaded');
        checkAndInitializeEditorIntegration();
      };
      versionScript.onerror = () => {
        console.warn('✗ Failed to load version compatibility manager');
      };
      (document.head || document.documentElement).appendChild(versionScript);

      // Load content sanitizer
      const sanitizerScript = document.createElement('script');
      sanitizerScript.src = chrome.runtime.getURL('content-sanitizer.js');
      sanitizerScript.onload = () => {
        contentSanitizerLoaded = true;
        console.log('✓ Content sanitizer loaded');
        checkAndInitializeEditorIntegration();
      };
      sanitizerScript.onerror = () => {
        console.warn('✗ Failed to load content sanitizer');
      };
      (document.head || document.documentElement).appendChild(sanitizerScript);

      // Load notification manager
      const notificationScript = document.createElement('script');
      notificationScript.src = chrome.runtime.getURL('notification-manager.js');
      notificationScript.onload = () => {
        notificationManagerLoaded = true;
        console.log('✓ Notification manager loaded');
        checkAndInitializeEditorIntegration();
      };
      notificationScript.onerror = () => {
        console.warn('✗ Failed to load notification manager');
      };
      (document.head || document.documentElement).appendChild(notificationScript);

      // Load data extractor
      const dataExtractorScript = document.createElement('script');
      dataExtractorScript.src = chrome.runtime.getURL('elementor-data-extractor.js');
      dataExtractorScript.onload = () => {
        dataExtractorLoaded = true;
        console.log('✓ Data extractor loaded');
        checkAndInitializeEditorIntegration();
      };
      dataExtractorScript.onerror = () => {
        console.warn('✗ Failed to load data extractor');
      };
      (document.head || document.documentElement).appendChild(dataExtractorScript);
    } catch (error) {
      console.warn('Error loading additional modules:', error);
    }
  }

  /**
   * Check if all modules are loaded and initialize editor integration
   * Requirement 1.1, 1.2, 1.3, 1.4, 1.5: Initialize all modules when ready
   */
  async function checkAndInitializeEditorIntegration() {
    // Wait for core modules to be loaded
    if (!editorDetectorLoaded || !clipboardManagerLoaded || !pasteInterceptorLoaded) {
      return;
    }

    // Give modules a moment to expose to window (script execution timing)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if we have the required classes
    if (!window.ElementorEditorDetector || !window.ClipboardManager || !window.PasteInterceptor) {
      console.warn('Core editor integration modules not available in window');
      console.log('Available:', {
        ElementorEditorDetector: typeof window.ElementorEditorDetector,
        ClipboardManager: typeof window.ClipboardManager,
        PasteInterceptor: typeof window.PasteInterceptor,
        EditorContextInjector: typeof window.EditorContextInjector,
        MediaURLHandler: typeof window.MediaURLHandler,
        VersionCompatibilityManager: typeof window.VersionCompatibilityManager,
        ContentSanitizer: typeof window.ContentSanitizer
      });
      return;
    }

    try {
      // Create core instances
      editorDetector = new window.ElementorEditorDetector();
      clipboardManager = new window.ClipboardManager();
      pasteInterceptor = new window.PasteInterceptor();

      // Create additional module instances if loaded
      if (editorInjectorLoaded && window.EditorContextInjector) {
        editorInjector = new window.EditorContextInjector();
        console.log('✓ Editor injector instance created');
      }

      if (mediaURLHandlerLoaded && window.MediaURLHandler) {
        mediaURLHandler = new window.MediaURLHandler();
        console.log('✓ Media URL handler instance created');
      }

      if (versionCompatibilityLoaded && window.VersionCompatibilityManager) {
        versionCompatibilityManager = new window.VersionCompatibilityManager();
        console.log('✓ Version compatibility manager instance created');
      }

      if (contentSanitizerLoaded && window.ContentSanitizer) {
        contentSanitizer = new window.ContentSanitizer();
        console.log('✓ Content sanitizer instance created');
      }

      if (notificationManagerLoaded && window.NotificationManager) {
        notificationManager = new window.NotificationManager();
        console.log('✓ Notification manager instance created');
      }

      // Initialize data extractor if available
      if (dataExtractorLoaded && window.ElementorDataExtractor) {
        dataExtractor = new window.ElementorDataExtractor();
        // Initialize asynchronously
        dataExtractor.initialize().then(() => {
          console.log('✓ Data extractor initialized');
        }).catch(err => {
          console.warn('✗ Data extractor initialization failed:', err);
        });
      }

      // Requirement 1.2: Initialize paste interceptor when editor is detected
      if (!editorDetector.isElementorEditor()) {
        console.log('[Editor Integration] Not in Elementor editor, skipping paste interceptor initialization');
        return;
      }

      console.log('[Editor Integration] Elementor editor detected, initializing...');

      // Initialize editor injector first if available (needed by paste interceptor)
      // Task 14.2: Integrate editor injector with paste flow
      if (editorInjector) {
        try {
          await editorInjector.initialize();
          console.log('✓ Editor injector initialized');
        } catch (error) {
          console.warn('✗ Editor injector initialization failed:', error);
          // Requirement 1.7: Add error handling and fallback mechanisms
          handleModuleInitializationError('editor-injector', error);
        }
      }

      // Initialize paste interceptor with all dependencies
      // Task 14: Complete paste operation integration
      // Task 14.2: Pass editor injector to paste interceptor
      pasteInterceptor.initialize(
        clipboardManager,
        editorDetector,
        editorInjector,
        window.ElementorFormatConverter, // Format converter is a module, not a class instance
        mediaURLHandler,
        versionCompatibilityManager,
        notificationManager
      )
        .then(async (success) => {
          if (success) {
            console.log('✓ Paste interceptor initialized with all dependencies');

            // Store instances globally for debugging and access
            window.__elementorCopierInstances = {
              editorDetector,
              clipboardManager,
              pasteInterceptor,
              editorInjector,
              mediaURLHandler,
              versionCompatibilityManager,
              contentSanitizer,
              notificationManager
            };

            console.log('✓ All editor integration modules initialized successfully');
          } else {
            console.warn('✗ Paste interceptor initialization failed');
            handleModuleInitializationError('paste-interceptor', new Error('Initialization returned false'));
          }
        })
        .catch((error) => {
          console.error('Error initializing paste interceptor:', error);
          handleModuleInitializationError('paste-interceptor', error);
        });
    } catch (error) {
      console.error('Error setting up editor integration:', error);
      handleModuleInitializationError('editor-integration', error);
    }
  }

  /**
   * Handle module initialization errors with fallback mechanisms
   * Requirement 1.7: Add error handling and fallback mechanisms
   */
  function handleModuleInitializationError(moduleName, error) {
    console.error(`[Editor Integration] Module initialization error (${moduleName}):`, error);

    // Log error for debugging
    const errorDetails = {
      module: moduleName,
      error: error.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Send error to background for tracking
    try {
      chrome.runtime.sendMessage({
        action: 'logError',
        error: errorDetails
      });
    } catch (e) {
      console.warn('Failed to send error to background:', e);
    }

    // Show user-friendly notification if notification manager is available
    if (notificationManager) {
      notificationManager.warning(
        'Feature Initialization Warning',
        `Some advanced paste features may not be available. Basic copy functionality will still work.`,
        { duration: 6000 }
      );
    }
  }

  /**
   * Pre-convert extension data to native Elementor format
   * Requirement 1.3: Wire up format converter to copy operations
   * 
   * NOTE: Format conversion now happens at paste time in the MAIN world
   * where the converter is available. This function is kept for compatibility
   * but doesn't perform conversion during copy.
   * 
   * @param {Object} clipboardData - Extension clipboard data
   * @returns {Object} Clipboard data (unchanged, conversion happens at paste)
   */
  function addNativeFormat(clipboardData) {
    // Format conversion is now handled by paste-interceptor.js in the MAIN world
    // The converter is loaded via manifest and available during paste operations
    console.log('✓ Clipboard data prepared for paste-time conversion');
    return clipboardData;
  }

  /**
   * Process clipboard data with all available modules
   * Requirement 1.3, 1.4, 1.5: Wire up all modules to copy operations
   * @param {Object} clipboardData - Raw clipboard data
   * @returns {Object} Processed clipboard data
   */
  function processClipboardData(clipboardData) {
    let processedData = { ...clipboardData };

    try {
      // 1. Handle media URLs if handler is available
      if (mediaURLHandler && processedData.data) {
        try {
          const sourceOrigin = window.location.origin;
          processedData.data = mediaURLHandler.updateElementURLs(processedData.data, sourceOrigin);
          console.log('✓ Media URLs processed');
        } catch (error) {
          console.warn('Media URL processing failed:', error);
          handleModuleError('media-url-handler', error);
        }
      }

      // 2. Sanitize content if sanitizer is available
      if (contentSanitizer && processedData.data) {
        try {
          processedData.data = contentSanitizer.sanitizeElementData(processedData.data);
          console.log('✓ Content sanitized');
        } catch (error) {
          console.warn('Content sanitization failed:', error);
          handleModuleError('content-sanitizer', error);
        }
      }

      // 3. Pre-convert to native format
      processedData = addNativeFormat(processedData);

      return processedData;
    } catch (error) {
      console.error('Error processing clipboard data:', error);
      handleModuleError('clipboard-processing', error);
      return clipboardData; // Return original data on error
    }
  }

  /**
   * Handle conversion errors
   * Requirement 1.7: Add error handling and fallback mechanisms
   */
  function handleConversionError(context, error) {
    console.error(`[Conversion Error] ${context}:`, error);

    if (notificationManager) {
      notificationManager.warning(
        'Conversion Warning',
        'Element data conversion encountered an issue. The element may paste with some limitations.',
        { duration: 5000 }
      );
    }
  }

  /**
   * Handle module errors during processing
   * Requirement 1.7: Add error handling and fallback mechanisms
   */
  function handleModuleError(moduleName, error) {
    console.error(`[Module Error] ${moduleName}:`, error);

    // Log to background for tracking
    try {
      chrome.runtime.sendMessage({
        action: 'logError',
        error: {
          module: moduleName,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn('Failed to log module error:', e);
    }
  }

  /**
   * Detect if page uses Elementor
   */
  function detectElementor() {
    console.log('[Detector] Starting Elementor detection...');

    // Check for Elementor markers
    const hasElementorClass = document.querySelector('[data-elementor-type]') !== null;
    const hasElementorId = document.querySelector('[data-elementor-id]') !== null;
    const hasElementorSettings = document.querySelector('[data-elementor-settings]') !== null;
    const hasElementorElement = document.querySelector('[data-element_type]') !== null;

    // Check for Elementor in URL (editor mode)
    const isElementorEditor = window.location.href.includes('action=elementor') ||
      window.location.href.includes('elementor-preview');

    // Check for Elementor body class
    const hasElementorBodyClass = document.body.classList.contains('elementor-page') ||
      document.body.classList.contains('elementor-editor-active');

    elementorDetected = hasElementorClass || hasElementorId || hasElementorSettings ||
      hasElementorElement || isElementorEditor || hasElementorBodyClass;

    if (elementorDetected) {
      console.log('✓ Elementor detected on this page');
      console.log('[Detector] Detection details:', {
        hasElementorClass,
        hasElementorId,
        hasElementorSettings,
        hasElementorElement,
        isElementorEditor,
        hasElementorBodyClass
      });
      initializeExtension();
    } else {
      console.log('✗ Elementor not detected on this page');
      // Try again after a delay in case content is loading
      setTimeout(() => {
        console.log('[Detector] Retrying detection...');
        const retry = detectElementor();
        if (!retry) {
          console.log('[Detector] Still no Elementor found after retry');
        }
      }, 2000);
    }

    return elementorDetected;
  }

  /**
   * Initialize extension features
   */
  function initializeExtension() {
    console.log('[Init] Initializing extension features...');

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, true);

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Send stats to background
    sendStats();

    console.log('[Init] Extension initialized successfully');
  }

  /**
   * Handle context menu event
   */
  function handleContextMenu(event) {
    // Find closest Elementor element
    const elementorElement = event.target.closest('[data-element_type]');

    if (elementorElement) {
      // Store the Elementor element instead of the raw target
      lastClickedElement = elementorElement;
      const elementType = elementorElement.getAttribute('data-element_type');
      console.log('[Context Menu] Elementor element found:', elementType);

      // Send info to background to enable/disable menu items
      chrome.runtime.sendMessage({
        action: 'contextMenuOpened',
        elementType: elementType,
        hasElementor: true
      });
    } else {
      // Store the target anyway (for debugging)
      lastClickedElement = event.target;
      console.log('[Context Menu] No Elementor element at this location');

      // Send info to background to disable menu items
      chrome.runtime.sendMessage({
        action: 'contextMenuOpened',
        elementType: null,
        hasElementor: false
      });
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboardShortcuts(event) {
    // Ctrl+Shift+C or Cmd+Shift+C to enable element selector
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
      event.preventDefault();
      console.log('[Keyboard] Element selector shortcut triggered');
      enableHighlightMode();
    }

    // Ctrl+Shift+X or Cmd+Shift+X to disable element selector
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'X') {
      event.preventDefault();
      console.log('[Keyboard] Disable selector shortcut triggered');
      disableHighlightMode();
    }
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Message] Received in content script:', request);

    try {
      switch (request.action) {
        case 'copy-widget':
          copyWidget(lastClickedElement, sendResponse);
          break;

        case 'copy-section':
          copySection(lastClickedElement, sendResponse);
          break;

        case 'copy-column':
          copyColumn(lastClickedElement, sendResponse);
          break;

        case 'copy-page':
          copyPage(sendResponse);
          break;

        case 'toggle-highlight':
          toggleHighlightMode(sendResponse);
          break;

        case 'getStats':
          // Return current stats
          const widgets = document.querySelectorAll('[data-element_type^="widget."]').length;
          const sections = document.querySelectorAll('[data-element_type="section"]').length;
          const columns = document.querySelectorAll('[data-element_type="column"]').length;

          sendResponse({
            success: true,
            stats: {
              widgets,
              sections,
              columns,
              elementorDetected
            }
          });
          break;

        case 'writeToClipboard':
          // Handle clipboard write directly in content script context
          writeToClipboardDirect(request.data, sendResponse);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep channel open for async response
  });

  /**
   * Write to clipboard directly from content script
   * This is more reliable than offscreen document
   */
  async function writeToClipboardDirect(data, callback) {
    try {
      console.log('[Clipboard] Writing data to clipboard...');
      console.log('[Clipboard] Data type:', data.type);
      console.log('[Clipboard] Element type:', data.elementType);
      console.log('[Clipboard] Data size:', JSON.stringify(data).length, 'characters');

      const jsonString = JSON.stringify(data, null, 2);
      console.log('[Clipboard] JSON string created, length:', jsonString.length);
      console.log('[Clipboard] First 500 chars:', jsonString.substring(0, 500));

      await navigator.clipboard.writeText(jsonString);
      console.log('✓ Clipboard write successful from content script');

      // Verify write
      const readBack = await navigator.clipboard.readText();
      console.log('[Clipboard] Verification - read back length:', readBack.length);
      console.log('[Clipboard] Verification - matches:', readBack === jsonString);

      callback({ success: true });
    } catch (error) {
      console.error('✗ Content script clipboard write failed:', error);
      console.error('[Clipboard] Error details:', error.message, error.stack);
      callback({ success: false, error: error.message });
    }
  }

  /**
   * Copy widget data
   */
  function copyWidget(element, callback) {
    try {
      const widgetElement = findElementorElement(element, 'widget');

      if (!widgetElement) {
        const error = createDetailedError(
          'WIDGET_NOT_FOUND',
          'No Elementor widget found at this location',
          'Try right-clicking directly on a widget element, or enable Highlight Mode to see available widgets'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      const data = extractElementData(widgetElement);

      if (!data) {
        const error = createDetailedError(
          'EXTRACTION_FAILED',
          'Could not extract widget data',
          'The widget may have an invalid structure. Try copying the parent section instead.'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      // Extract media URLs
      const media = extractMediaUrls(widgetElement);

      // Prepare clipboard data
      let clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'widget',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        },
        // Extension marker for paste interceptor recognition
        __ELEMENTOR_COPIER_DATA__: {
          version: '1.0.0',
          timestamp: Date.now(),
          source: 'elementor-copier-extension'
        }
      };

      // Process clipboard data with all modules
      // Requirement 1.3, 1.4, 1.5: Wire up all modules to copy operations
      clipboardData = processClipboardData(clipboardData);

      // Copy to clipboard with retry logic
      copyToClipboardWithRetry(clipboardData, callback);

    } catch (error) {
      const detailedError = createDetailedError(
        'UNEXPECTED_ERROR',
        'An unexpected error occurred while copying widget',
        'Please try again. If the problem persists, check the browser console for details.',
        error
      );
      logError(detailedError);
      console.error('Error copying widget:', error);
      callback({ success: false, error: detailedError.userMessage, errorCode: detailedError.code });
    }
  }

  /**
   * Copy section data
   */
  function copySection(element, callback) {
    console.log('[CopySection] Function called, element:', element, 'callback:', typeof callback);
    try {
      const sectionElement = findElementorElement(element, 'section');
      console.log('[CopySection] Section element found:', !!sectionElement);

      if (!sectionElement) {
        const error = createDetailedError(
          'SECTION_NOT_FOUND',
          'No Elementor section found at this location',
          'Try right-clicking on a section container, or enable Highlight Mode to see available sections'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      const data = extractElementData(sectionElement);
      console.log('[CopySection] Data extracted:', !!data);

      if (!data) {
        const error = createDetailedError(
          'EXTRACTION_FAILED',
          'Could not extract section data',
          'The section may have an invalid structure. Try refreshing the page and trying again.'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      // Check if section has content
      const hasContent = data.elements && data.elements.some(column =>
        column.elements && column.elements.length > 0
      );

      if (!hasContent) {
        console.warn('[Elementor Copier] Warning: Copying empty section (no widgets inside)');
        console.warn('[Elementor Copier] This section may not paste correctly in the editor');
      }

      // Extract media URLs
      console.log('[CopySection] About to extract media URLs');
      const media = extractMediaUrls(sectionElement);
      console.log('[CopySection] Media extracted, count:', media ? media.length : 0);

      let clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'section',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        },
        // Extension marker for paste interceptor recognition
        __ELEMENTOR_COPIER_DATA__: {
          version: '1.0.0',
          timestamp: Date.now(),
          source: 'elementor-copier-extension'
        }
      };

      // Process clipboard data with all modules
      console.log('[CopySection] Before processClipboardData');
      clipboardData = processClipboardData(clipboardData);
      console.log('[CopySection] After processClipboardData, data exists:', !!clipboardData);

      console.log('[CopySection] About to call copyToClipboardWithRetry');
      console.log('[CopySection] Callback type:', typeof callback);
      console.log('[CopySection] Clipboard data ready:', !!clipboardData);
      
      copyToClipboardWithRetry(clipboardData, callback);

    } catch (error) {
      console.error('[CopySection] CAUGHT ERROR:', error);
      console.error('[CopySection] Error stack:', error.stack);
      const detailedError = createDetailedError(
        'UNEXPECTED_ERROR',
        'An unexpected error occurred while copying section',
        'Please try again. If the problem persists, check the browser console for details.',
        error
      );
      logError(detailedError);
      console.error('Error copying section:', error);
      callback({ success: false, error: detailedError.userMessage, errorCode: detailedError.code });
    }
  }

  /**
   * Copy column data
   */
  function copyColumn(element, callback) {
    try {
      const columnElement = findElementorElement(element, 'column');

      if (!columnElement) {
        const error = createDetailedError(
          'COLUMN_NOT_FOUND',
          'No Elementor column found at this location',
          'Try right-clicking on a column element, or enable Highlight Mode to see available columns'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      const data = extractElementData(columnElement);

      if (!data) {
        const error = createDetailedError(
          'EXTRACTION_FAILED',
          'Could not extract column data',
          'The column may have an invalid structure. Try copying the parent section instead.'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      // Extract media URLs
      const media = extractMediaUrls(columnElement);

      let clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'column',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        },
        // Extension marker for paste interceptor recognition
        __ELEMENTOR_COPIER_DATA__: {
          version: '1.0.0',
          timestamp: Date.now(),
          source: 'elementor-copier-extension'
        }
      };

      // Process clipboard data with all modules
      clipboardData = processClipboardData(clipboardData);

      copyToClipboardWithRetry(clipboardData, callback);

    } catch (error) {
      const detailedError = createDetailedError(
        'UNEXPECTED_ERROR',
        'An unexpected error occurred while copying column',
        'Please try again. If the problem persists, check the browser console for details.',
        error
      );
      logError(detailedError);
      console.error('Error copying column:', error);
      callback({ success: false, error: detailedError.userMessage, errorCode: detailedError.code });
    }
  }

  /**
   * Copy entire page data
   */
  function copyPage(callback) {
    try {
      const pageElement = document.querySelector('[data-elementor-type="wp-page"], [data-elementor-type="page"]');

      if (!pageElement) {
        const error = createDetailedError(
          'PAGE_NOT_FOUND',
          'No Elementor page found',
          'This page may not be built with Elementor, or Elementor data is not accessible. Try copying individual sections instead.'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      const data = extractElementData(pageElement);

      if (!data) {
        const error = createDetailedError(
          'EXTRACTION_FAILED',
          'Could not extract page data',
          'The page structure may be too complex. Try copying sections individually instead.'
        );
        logError(error);
        callback({ success: false, error: error.userMessage, errorCode: error.code });
        return;
      }

      // Extract media URLs
      const media = extractMediaUrls(pageElement);

      let clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'page',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion(),
          pageTitle: document.title
        },
        // Extension marker for paste interceptor recognition
        __ELEMENTOR_COPIER_DATA__: {
          version: '1.0.0',
          timestamp: Date.now(),
          source: 'elementor-copier-extension'
        }
      };

      // Process clipboard data with all modules
      clipboardData = processClipboardData(clipboardData);

      copyToClipboardWithRetry(clipboardData, callback);

    } catch (error) {
      const detailedError = createDetailedError(
        'UNEXPECTED_ERROR',
        'An unexpected error occurred while copying page',
        'Please try again. If the problem persists, try copying sections individually.',
        error
      );
      logError(detailedError);
      console.error('Error copying page:', error);
      callback({ success: false, error: detailedError.userMessage, errorCode: detailedError.code });
    }
  }

  /**
   * Find Elementor element of specific type
   */
  function findElementorElement(startElement, type) {
    let current = startElement;
    const maxDepth = 20;
    let depth = 0;

    // Search upwards in DOM tree
    while (current && depth < maxDepth) {
      const elType = current.getAttribute('data-element_type');

      if (type === 'widget' && elType && elType.startsWith('widget.')) {
        return current;
      }

      if (type === 'section' && elType === 'section') {
        return current;
      }

      if (type === 'column' && elType === 'column') {
        return current;
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  }

  /**
   * Extract data from Elementor element
   */
  function extractElementData(element) {
    try {
      console.log('[Extract] ========== EXTRACTING ELEMENT DATA ==========');
      console.log('[Extract] Element:', element);
      console.log('[Extract] Element classes:', element.className);

      // Try to use the data extractor if available (gets proper Elementor data)
      if (dataExtractor && dataExtractor.initialized) {
        console.log('[Extract] Using ElementorDataExtractor (API method)');
        const extractedData = dataExtractor.extractElementData(element);
        if (extractedData) {
          console.log('[Extract] ✓ Successfully extracted via API');
          return extractedData;
        }
        console.log('[Extract] API extraction failed, falling back to DOM method');
      } else {
        console.log('[Extract] Data extractor not available, using DOM method');
      }

      // Fallback to DOM extraction
      const data = {
        id: element.getAttribute('data-id') || generateId(),
        elType: element.getAttribute('data-element_type') || 'unknown',
        settings: {}
      };

      console.log('[Extract] Element ID:', data.id);
      console.log('[Extract] Element type:', data.elType);

      // Extract settings from data-settings or data-elementor-settings
      // Try both attributes as different Elementor versions use different names
      let settingsAttr = element.getAttribute('data-settings') || element.getAttribute('data-elementor-settings');
      if (settingsAttr) {
        console.log('[Extract] Settings attribute found:', settingsAttr.substring(0, 200));
        try {
          data.settings = JSON.parse(settingsAttr);
          console.log('[Extract] Parsed settings:', Object.keys(data.settings).length, 'keys');
          console.log('[Extract] Settings keys:', Object.keys(data.settings).join(', '));
        } catch (e) {
          console.warn('[Extract] Could not parse elementor settings:', e);
          console.warn('[Extract] Raw settings string:', settingsAttr);
        }
      } else {
        console.log('[Extract] No settings attribute found (checked data-settings and data-elementor-settings)');
      }

      // Extract widget type
      if (data.elType.startsWith('widget.')) {
        data.widgetType = data.elType.replace('widget.', '');
        console.log('[Extract] Widget type:', data.widgetType);
      }

      // CRITICAL: Extract content from rendered HTML (for frontend pages)
      // When copying from frontend, settings aren't available, so we extract rendered content
      if (data.elType === 'widget' || data.elType.startsWith('widget.')) {
        console.log('[Extract] Extracting widget content from rendered HTML...');

        // Get widget type from data-widget_type attribute
        const widgetType = element.getAttribute('data-widget_type');
        if (widgetType) {
          data.widgetType = widgetType;
          console.log('[Extract] Widget type from attribute:', widgetType);
        }

        // Extract content based on widget type
        const widgetContent = element.querySelector('.elementor-widget-container');
        if (widgetContent) {
          // Store the rendered HTML content
          data.renderedContent = widgetContent.innerHTML;
          console.log('[Extract] Rendered content extracted:', data.renderedContent.substring(0, 200));

          // Try to extract specific content based on widget type
          if (widgetType && widgetType.includes('image')) {
            const img = widgetContent.querySelector('img');
            if (img) {
              data.settings.image = {
                url: img.src || img.getAttribute('data-src'),
                alt: img.alt || '',
                id: img.getAttribute('data-id') || ''
              };
              console.log('[Extract] Image widget - extracted image URL:', data.settings.image.url);
            }
          } else if (widgetType && widgetType.includes('heading')) {
            const heading = widgetContent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
              data.settings.title = heading.textContent;
              data.settings.header_size = heading.tagName.toLowerCase();
              console.log('[Extract] Heading widget - extracted:', data.settings.title);
            }
          } else if (widgetType && widgetType.includes('text')) {
            data.settings.editor = widgetContent.innerHTML;
            console.log('[Extract] Text widget - extracted HTML content');
          } else if (widgetType && widgetType.includes('button')) {
            const button = widgetContent.querySelector('a, button');
            if (button) {
              data.settings.text = button.textContent;
              data.settings.link = { url: button.href || '' };
              console.log('[Extract] Button widget - extracted:', data.settings.text);
            }
          }
        }
      }

      // Extract child elements recursively
      // Different selectors for different element types and Elementor versions
      let childElements = [];

      if (data.elType === 'section') {
        // For sections, get columns
        childElements = element.querySelectorAll(':scope > .elementor-container > .elementor-column, :scope > .elementor-container > .elementor-row > .elementor-column');
        console.log('[Extract] Section: Found', childElements.length, 'columns');
      } else if (data.elType === 'column') {
        // For columns, get widgets from widget-wrap
        childElements = element.querySelectorAll(':scope > .elementor-widget-wrap > .elementor-element, :scope > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element');
        console.log('[Extract] Column: Found', childElements.length, 'widgets');
      } else if (data.elType.startsWith('widget')) {
        // Widgets typically don't have children
        console.log('[Extract] Widget: No children expected');
      } else {
        // Generic fallback
        childElements = element.querySelectorAll(':scope > .elementor-element');
        console.log('[Extract] Generic: Found', childElements.length, 'child elements');
      }

      console.log('[Extract] Total child elements found:', childElements.length);

      if (childElements.length > 0) {
        data.elements = [];
        childElements.forEach((child, index) => {
          console.log(`[Extract] Processing child ${index + 1}/${childElements.length}`);
          const childData = extractElementData(child);
          if (childData) {
            data.elements.push(childData);
            console.log(`[Extract] ✓ Child ${index + 1} extracted:`, childData.elType);
          } else {
            console.warn(`[Extract] ✗ Child ${index + 1} extraction failed`);
          }
        });
      }

      console.log('[Extract] ✓ Extraction complete. Final data:', JSON.stringify(data, null, 2));
      return data;

    } catch (error) {
      console.error('[Extract] ✗ Error extracting element data:', error);
      console.error('[Extract] Error stack:', error.stack);
      return null;
    }
  }

  /**
   * Extract all media URLs from an element and its children
   */
  function extractMediaUrls(element) {
    const mediaArray = [];
    const seenUrls = new Set(); // Avoid duplicates

    try {
      // 1. Extract image elements
      const images = element.querySelectorAll('img');
      images.forEach(img => {
        const url = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          mediaArray.push({
            id: generateId(),
            url: url,
            type: 'image',
            alt: img.alt || '',
            width: img.naturalWidth || img.width || null,
            height: img.naturalHeight || img.height || null
          });
        }

        // Check srcset for responsive images
        const srcset = img.srcset || img.getAttribute('data-srcset');
        if (srcset) {
          const srcsetUrls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          srcsetUrls.forEach(srcUrl => {
            if (srcUrl && !seenUrls.has(srcUrl)) {
              seenUrls.add(srcUrl);
              mediaArray.push({
                id: generateId(),
                url: srcUrl,
                type: 'image',
                alt: img.alt || '',
                width: null,
                height: null
              });
            }
          });
        }
      });

      // 2. Extract background images from inline styles
      const elementsWithStyle = element.querySelectorAll('[style*="background"]');
      elementsWithStyle.forEach(el => {
        const style = el.getAttribute('style');
        if (style) {
          const bgImageMatches = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi);
          if (bgImageMatches) {
            bgImageMatches.forEach(match => {
              const urlMatch = match.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
              if (urlMatch && urlMatch[1] && !seenUrls.has(urlMatch[1])) {
                seenUrls.add(urlMatch[1]);
                mediaArray.push({
                  id: generateId(),
                  url: urlMatch[1],
                  type: 'background-image',
                  alt: '',
                  width: null,
                  height: null
                });
              }
            });
          }
        }
      });

      // 3. Extract background images from computed styles
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        try {
          const computedStyle = window.getComputedStyle(el);
          const bgImage = computedStyle.backgroundImage;

          if (bgImage && bgImage !== 'none') {
            const urlMatches = bgImage.match(/url\(['"]?([^'")\s]+)['"]?\)/gi);
            if (urlMatches) {
              urlMatches.forEach(match => {
                const urlMatch = match.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
                if (urlMatch && urlMatch[1] && !seenUrls.has(urlMatch[1])) {
                  seenUrls.add(urlMatch[1]);
                  mediaArray.push({
                    id: generateId(),
                    url: urlMatch[1],
                    type: 'background-image',
                    alt: '',
                    width: null,
                    height: null
                  });
                }
              });
            }
          }
        } catch (e) {
          // Skip elements that can't be accessed
        }
      });

      // 4. Extract video elements
      const videos = element.querySelectorAll('video');
      videos.forEach(video => {
        const url = video.src || video.getAttribute('data-src');
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          mediaArray.push({
            id: generateId(),
            url: url,
            type: 'video',
            alt: '',
            width: video.videoWidth || video.width || null,
            height: video.videoHeight || video.height || null
          });
        }

        // Check source elements within video
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
          const srcUrl = source.src || source.getAttribute('data-src');
          if (srcUrl && !seenUrls.has(srcUrl)) {
            seenUrls.add(srcUrl);
            mediaArray.push({
              id: generateId(),
              url: srcUrl,
              type: 'video',
              alt: '',
              width: null,
              height: null
            });
          }
        });
      });

      // 5. Extract iframe videos (YouTube, Vimeo, etc.)
      const iframes = element.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
      iframes.forEach(iframe => {
        const url = iframe.src;
        if (url && !seenUrls.has(url)) {
          seenUrls.add(url);
          mediaArray.push({
            id: generateId(),
            url: url,
            type: 'video',
            alt: '',
            width: iframe.width || null,
            height: iframe.height || null
          });
        }
      });

      // 6. Extract media from Elementor settings (if available in data attributes)
      const settingsAttr = element.getAttribute('data-elementor-settings');
      if (settingsAttr) {
        try {
          const settings = JSON.parse(settingsAttr);

          // Check for common Elementor image settings
          const imageFields = ['image', 'background_image', 'background_video_link', 'video_link'];
          imageFields.forEach(field => {
            if (settings[field]) {
              let url = null;

              // Handle different formats
              if (typeof settings[field] === 'string') {
                url = settings[field];
              } else if (settings[field].url) {
                url = settings[field].url;
              }

              if (url && !seenUrls.has(url)) {
                seenUrls.add(url);
                const mediaType = field.includes('video') ? 'video' : 'image';
                mediaArray.push({
                  id: generateId(),
                  url: url,
                  type: mediaType,
                  alt: settings[field].alt || '',
                  width: settings[field].width || null,
                  height: settings[field].height || null
                });
              }
            }
          });
        } catch (e) {
          console.warn('Could not parse elementor settings for media extraction:', e);
        }
      }

      console.log(`Extracted ${mediaArray.length} media items from element`);
      return mediaArray;

    } catch (error) {
      console.error('Error extracting media URLs:', error);
      return [];
    }
  }

  /**
   * Copy data to clipboard via background script with retry logic
   */
  function copyToClipboardWithRetry(data, callback, retryCount = 0) {
    console.log('[Copy] Attempting clipboard write...');
    console.log('[Copy] Data type:', data.elementType);
    console.log('[Copy] Data size:', JSON.stringify(data).length, 'characters');
    
    // Try direct clipboard API first (works in most modern browsers)
    const jsonString = JSON.stringify(data, null, 2);
    
    console.log('[Copy] Using direct Clipboard API');
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        console.log('✓ Copied to clipboard via Clipboard API');
        
        // Verify clipboard content
        navigator.clipboard.readText().then(text => {
          console.log('[Clipboard Verify] Length:', text.length);
          console.log('[Clipboard Verify] First 200 chars:', text.substring(0, 200));
          try {
            const parsed = JSON.parse(text);
            console.log('[Clipboard Verify] ✓ Valid JSON, type:', parsed.type);
          } catch (e) {
            console.error('[Clipboard Verify] ✗ NOT valid JSON!', e.message);
          }
        });

        // Show visual feedback
        showSuccessAnimation(data.elementType);

        callback({
          success: true,
          message: `${formatElementType(data.elementType)} copied successfully!`,
          elementType: data.elementType
        });
      })
      .catch((error) => {
        console.error('[Copy] Clipboard API failed:', error);
        console.log('[Copy] Falling back to background script method...');
        
        // Fallback to background script
        chrome.runtime.sendMessage({
          action: 'copyToClipboard',
          data: data
        }, (response) => {
          console.log('[Copy] Response callback invoked');
          console.log('[Copy] Received response from background:', response);
      
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            console.error('✗ Background script error:', error);
            
            const detailedError = createDetailedError(
              'CLIPBOARD_FALLBACK_FAILED',
              'Both clipboard methods failed',
              'Try reloading the page. If the problem persists, check browser permissions.',
              error
            );
            logError(detailedError);
            callback({
              success: false,
              error: detailedError.userMessage,
              errorCode: detailedError.code
            });
            return;
          }

          if (response && response.success) {
            console.log('✓ Copied via background script');
            showSuccessAnimation(data.elementType);
            callback({
              success: true,
              message: `${formatElementType(data.elementType)} copied successfully!`,
              elementType: data.elementType
            });
          } else {
            const detailedError = createDetailedError(
              'CLIPBOARD_WRITE_FAILED',
              'Failed to copy to clipboard',
              'Check browser clipboard permissions.',
              new Error(response?.error || 'Unknown error')
            );
            logError(detailedError);
            callback({
              success: false,
              error: detailedError.userMessage,
              errorCode: detailedError.code
            });
          }
        });
      });
  }

  /**
   * Copy data to clipboard via background script (legacy - kept for compatibility)
   */
  function copyToClipboard(data, callback) {
    copyToClipboardWithRetry(data, callback, 0);
  }

  /**
   * Toggle highlight mode
   */
  function toggleHighlightMode(callback) {
    highlightMode = !highlightMode;

    if (highlightMode) {
      enableHighlightMode();
      callback({ success: true, message: 'Highlight mode enabled' });
    } else {
      disableHighlightMode();
      callback({ success: true, message: 'Highlight mode disabled' });
    }
  }

  /**
   * Enable highlight mode
   */
  function enableHighlightMode() {
    console.log('[Highlight] Enabling highlight mode...');

    // Add hover listeners to all Elementor elements
    const elements = document.querySelectorAll('[data-element_type]');
    console.log('[Highlight] Found', elements.length, 'Elementor elements');

    if (elements.length === 0) {
      console.warn('[Highlight] No Elementor elements found! Make sure you are on an Elementor page.');
      alert('No Elementor elements found on this page. Make sure you are viewing an Elementor-built page.');
      return;
    }

    highlightMode = true;
    elements.forEach(el => {
      el.addEventListener('mouseenter', highlightElement);
      el.addEventListener('mouseleave', unhighlightElement);
      el.addEventListener('click', handleElementClick);
      el.style.cursor = 'pointer';

      // Add visual label box
      addElementLabel(el);
    });

    console.log('[Highlight] Highlight mode enabled for', elements.length, 'elements');
    showTemporaryNotification('Element selector enabled! Click copy buttons or click elements directly.');
  }

  /**
   * Add visual label box to element
   */
  function addElementLabel(element) {
    const elementType = element.getAttribute('data-element_type');
    const elementId = element.getAttribute('data-id');

    // Don't add labels to nested widgets (only top-level sections, columns, and direct widgets)
    const parent = element.parentElement;
    if (parent && parent.hasAttribute('data-element_type')) {
      const parentType = parent.getAttribute('data-element_type');
      // Skip if parent is a widget (nested widget)
      if (parentType && parentType.startsWith('widget.')) {
        return;
      }
    }

    // Create label container
    const label = document.createElement('div');
    label.className = 'elementor-copier-label';
    label.setAttribute('data-copier-label', elementId);

    // Determine element info
    let typeName = 'Element';
    let typeColor = '#666';
    let icon = '📦';

    if (elementType === 'section') {
      typeName = 'Section';
      typeColor = '#00a32a';
      icon = '📐';
    } else if (elementType === 'column') {
      typeName = 'Column';
      typeColor = '#f0b849';
      icon = '📊';
    } else if (elementType && elementType.startsWith('widget.')) {
      const widgetName = elementType.replace('widget.', '').replace(/-/g, ' ');
      typeName = widgetName.charAt(0).toUpperCase() + widgetName.slice(1);
      typeColor = '#0073aa';
      icon = '🧩';
    }

    // Create label content
    label.innerHTML = `
      <div class="elementor-copier-label-header" style="background: ${typeColor}">
        <span class="elementor-copier-label-icon">${icon}</span>
        <span class="elementor-copier-label-type">${typeName}</span>
        <span class="elementor-copier-label-id">#${elementId}</span>
      </div>
      <button class="elementor-copier-label-btn" data-element-id="${elementId}">
        📋 Copy
      </button>
    `;

    // Position label at top-left of element
    label.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: 999999;
      background: white;
      border: 2px solid ${typeColor};
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      pointer-events: auto;
      min-width: 150px;
    `;

    // Add click handler to copy button
    const copyBtn = label.querySelector('.elementor-copier-label-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Find the element and copy it
      const targetElement = document.querySelector(`[data-id="${elementId}"]`);
      if (targetElement) {
        handleElementClick({ currentTarget: targetElement, preventDefault: () => { }, stopPropagation: () => { } });
      }
    });

    // Make element position relative if it's not already positioned
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }

    // Add label to element
    element.appendChild(label);
  }

  /**
   * Disable highlight mode
   */
  function disableHighlightMode() {
    console.log('[Highlight] Disabling highlight mode...');

    highlightMode = false;
    // Remove hover listeners
    const elements = document.querySelectorAll('[data-element_type]');
    elements.forEach(el => {
      el.removeEventListener('mouseenter', highlightElement);
      el.removeEventListener('mouseleave', unhighlightElement);
      el.removeEventListener('click', handleElementClick);
      el.style.cursor = '';
      el.style.outline = '';
    });

    // Remove all labels
    const labels = document.querySelectorAll('.elementor-copier-label');
    labels.forEach(label => label.remove());

    console.log('[Highlight] Highlight mode disabled');
    showTemporaryNotification('Element selector disabled');
  }

  /**
   * Highlight element on hover
   */
  function highlightElement(event) {
    const el = event.currentTarget;
    const elType = el.getAttribute('data-element_type');

    if (elType.startsWith('widget.')) {
      el.style.outline = '3px solid #0073aa';
      el.style.outlineOffset = '2px';
    } else if (elType === 'section') {
      el.style.outline = '3px solid #00a32a';
      el.style.outlineOffset = '2px';
    } else if (elType === 'column') {
      el.style.outline = '3px solid #f0b849';
      el.style.outlineOffset = '2px';
    }
  }

  /**
   * Remove highlight from element
   */
  function unhighlightElement(event) {
    event.currentTarget.style.outline = '';
    event.currentTarget.style.outlineOffset = '';
  }

  /**
   * Handle element click in highlight mode
   */
  function handleElementClick(event) {
    if (!highlightMode) return;

    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget;
    const elementType = element.getAttribute('data-element_type');

    console.log('[Click] Element clicked:', elementType);

    // Callback to handle copy result
    const handleCopyResult = (response) => {
      if (response && response.success) {
        showTemporaryNotification('✓ Element copied successfully!', 2000);
      } else {
        showTemporaryNotification('✗ Copy failed: ' + (response?.error || 'Unknown error'), 3000);
      }
      // Disable highlight mode after copying
      disableHighlightMode();
    };

    // Determine what to copy based on element type
    if (elementType === 'section' || elementType.startsWith('section')) {
      console.log('[Click] Calling copySection for element type:', elementType);
      copySection(element, handleCopyResult);
    } else if (elementType === 'column') {
      copySection(element, handleCopyResult); // Copy column as section
    } else if (elementType.startsWith('widget.')) {
      copyWidget(element, handleCopyResult);
    } else {
      copyWidget(element, handleCopyResult); // Default to widget copy
    }
  }

  /**
   * Show temporary notification to user
   */
  function showTemporaryNotification(message, duration = 3000) {
    // Remove any existing notification
    const existing = document.querySelector('.elementor-copier-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'elementor-copier-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196f3;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after duration
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Detect Elementor version
   */
  function detectElementorVersion() {
    // Try to find version in meta tags or scripts
    const versionMeta = document.querySelector('meta[name="generator"][content*="Elementor"]');
    if (versionMeta) {
      const match = versionMeta.content.match(/Elementor\s+([\d.]+)/);
      if (match) {
        return match[1];
      }
    }
    return 'unknown';
  }

  /**
   * Generate unique ID
   */
  function generateId() {
    return 'el_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Send stats to background
   */
  function sendStats() {
    const widgets = document.querySelectorAll('[data-element_type^="widget."]').length;
    const sections = document.querySelectorAll('[data-element_type="section"]').length;
    const columns = document.querySelectorAll('[data-element_type="column"]').length;

    chrome.runtime.sendMessage({
      action: 'updateStats',
      stats: {
        widgets,
        sections,
        columns,
        elementorDetected
      }
    });
  }

  /**
   * Create detailed error object
   */
  function createDetailedError(code, technicalMessage, userMessage, originalError = null) {
    return {
      code: code,
      technicalMessage: technicalMessage,
      userMessage: userMessage,
      originalError: originalError,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      elementorVersion: detectElementorVersion()
    };
  }

  /**
   * Log error to console and error log
   */
  function logError(error) {
    // Add to error log
    errorLog.push(error);

    // Maintain max size
    if (errorLog.length > MAX_ERROR_LOG_SIZE) {
      errorLog.shift();
    }

    // Log to console with detailed information
    console.group(`🔴 Elementor Copier Error [${error.code}]`);
    console.error('Technical Message:', error.technicalMessage);
    console.error('User Message:', error.userMessage);
    console.error('Timestamp:', error.timestamp);
    console.error('URL:', error.url);
    console.error('Elementor Version:', error.elementorVersion);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();

    // Send error to background for tracking
    chrome.runtime.sendMessage({
      action: 'logError',
      error: {
        code: error.code,
        message: error.technicalMessage,
        timestamp: error.timestamp
      }
    });
  }

  /**
   * Get error log (for debugging)
   */
  window.elementorCopierGetErrorLog = function () {
    return errorLog;
  };

  /**
   * Show success animation
   */
  function showSuccessAnimation(elementType) {
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(76, 175, 80, 0.95);
      color: white;
      padding: 30px 50px;
      border-radius: 12px;
      font-size: 24px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: successPulse 0.6s ease-out;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Add animation keyframes
    if (!document.getElementById('elementor-copier-animations')) {
      const style = document.createElement('style');
      style.id = 'elementor-copier-animations';
      style.textContent = `
        @keyframes successPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes successFadeOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
      `;
      document.head.appendChild(style);
    }

    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
        <div>${formatElementType(elementType)} Copied!</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Fade out and remove
    setTimeout(() => {
      overlay.style.animation = 'successFadeOut 0.4s ease-out';
      setTimeout(() => {
        overlay.remove();
      }, 400);
    }, 1500);
  }

  /**
   * Format element type for display
   */
  function formatElementType(type) {
    if (!type) return 'Element';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

})();
