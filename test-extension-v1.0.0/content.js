/**
 * Elementor Copier - Content Script
 * Runs on all pages to detect and extract Elementor data
 */

(function() {
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

  // Initialize
  console.log('Elementor Copier: Content script loaded');
  detectElementor();

  /**
   * Detect if page uses Elementor
   */
  function detectElementor() {
    // Check for Elementor markers
    const hasElementorClass = document.querySelector('[data-elementor-type]') !== null;
    const hasElementorId = document.querySelector('[data-elementor-id]') !== null;
    const hasElementorSettings = document.querySelector('[data-elementor-settings]') !== null;
    
    elementorDetected = hasElementorClass || hasElementorId || hasElementorSettings;
    
    if (elementorDetected) {
      console.log('✓ Elementor detected on this page');
      initializeExtension();
    } else {
      console.log('✗ Elementor not detected on this page');
    }
    
    return elementorDetected;
  }

  /**
   * Initialize extension features
   */
  function initializeExtension() {
    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, true);
    
    // Send stats to background
    sendStats();
  }

  /**
   * Handle context menu event
   */
  function handleContextMenu(event) {
    lastClickedElement = event.target;
    console.log('Context menu opened on:', lastClickedElement);
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);

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
      const clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'widget',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        }
      };

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
    try {
      const sectionElement = findElementorElement(element, 'section');
      
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

      // Extract media URLs
      const media = extractMediaUrls(sectionElement);

      const clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'section',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        }
      };

      copyToClipboardWithRetry(clipboardData, callback);
      
    } catch (error) {
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

      const clipboardData = {
        version: '1.0.0',
        type: 'elementor-copier',
        elementType: 'column',
        data: data,
        media: media,
        metadata: {
          sourceUrl: window.location.href,
          copiedAt: new Date().toISOString(),
          elementorVersion: detectElementorVersion()
        }
      };

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

      const clipboardData = {
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
        }
      };

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
      const data = {
        id: element.getAttribute('data-id') || generateId(),
        elType: element.getAttribute('data-element_type') || 'unknown',
        settings: {}
      };

      // Extract settings from data-elementor-settings
      const settingsAttr = element.getAttribute('data-elementor-settings');
      if (settingsAttr) {
        try {
          data.settings = JSON.parse(settingsAttr);
        } catch (e) {
          console.warn('Could not parse elementor settings:', e);
        }
      }

      // Extract widget type
      if (data.elType.startsWith('widget.')) {
        data.widgetType = data.elType.replace('widget.', '');
      }

      // Extract child elements recursively
      const childElements = element.querySelectorAll(':scope > .elementor-container > .elementor-column, :scope > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element');
      
      if (childElements.length > 0) {
        data.elements = [];
        childElements.forEach(child => {
          const childData = extractElementData(child);
          if (childData) {
            data.elements.push(childData);
          }
        });
      }

      return data;
      
    } catch (error) {
      console.error('Error extracting element data:', error);
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
    // Send to background script for clipboard access
    chrome.runtime.sendMessage({
      action: 'copyToClipboard',
      data: data
    }, (response) => {
      if (chrome.runtime.lastError) {
        const error = chrome.runtime.lastError;
        console.error('✗ Runtime error:', error);
        
        // Retry logic
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
          console.log(`Retrying clipboard operation in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})...`);
          
          setTimeout(() => {
            copyToClipboardWithRetry(data, callback, retryCount + 1);
          }, delay);
          return;
        }
        
        // Max retries reached
        const detailedError = createDetailedError(
          'CLIPBOARD_COMMUNICATION_FAILED',
          'Failed to communicate with extension',
          'Try reloading the page or reinstalling the extension. Check that the extension is enabled in your browser settings.',
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
        console.log('✓ Copied to clipboard');
        
        // Show visual feedback
        showSuccessAnimation(data.elementType);
        
        callback({ 
          success: true, 
          message: `${formatElementType(data.elementType)} copied successfully!`,
          elementType: data.elementType
        });
      } else {
        // Retry logic for failed clipboard operations
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
          console.log(`Retrying clipboard operation in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})...`);
          
          setTimeout(() => {
            copyToClipboardWithRetry(data, callback, retryCount + 1);
          }, delay);
          return;
        }
        
        // Max retries reached
        const detailedError = createDetailedError(
          'CLIPBOARD_WRITE_FAILED',
          'Failed to copy to clipboard',
          'Check browser clipboard permissions. You can also try using the extension popup to copy manually.',
          new Error(response?.error || 'Unknown clipboard error')
        );
        logError(detailedError);
        console.error('✗ Failed to copy to clipboard:', response?.error);
        callback({ 
          success: false, 
          error: detailedError.userMessage,
          errorCode: detailedError.code
        });
      }
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
    // Add hover listeners to all Elementor elements
    const elements = document.querySelectorAll('[data-element_type]');
    elements.forEach(el => {
      el.addEventListener('mouseenter', highlightElement);
      el.addEventListener('mouseleave', unhighlightElement);
      el.style.cursor = 'pointer';
    });
  }

  /**
   * Disable highlight mode
   */
  function disableHighlightMode() {
    // Remove hover listeners
    const elements = document.querySelectorAll('[data-element_type]');
    elements.forEach(el => {
      el.removeEventListener('mouseenter', highlightElement);
      el.removeEventListener('mouseleave', unhighlightElement);
      el.style.cursor = '';
      el.style.outline = '';
    });
  }

  /**
   * Highlight element on hover
   */
  function highlightElement(event) {
    const el = event.currentTarget;
    const elType = el.getAttribute('data-element_type');
    
    if (elType.startsWith('widget.')) {
      el.style.outline = '2px solid #0073aa';
    } else if (elType === 'section') {
      el.style.outline = '2px solid #00a32a';
    } else if (elType === 'column') {
      el.style.outline = '2px solid #f0b849';
    }
  }

  /**
   * Remove highlight from element
   */
  function unhighlightElement(event) {
    event.currentTarget.style.outline = '';
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
  window.elementorCopierGetErrorLog = function() {
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
