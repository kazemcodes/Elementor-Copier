/**
 * Page Bridge Script
 * This script runs in the MAIN world (page context) and has access to page variables
 * It acts as a bridge between the isolated content script and the page's Elementor instance
 */

(function() {
  'use strict';
  
  console.log('[Bridge] Page bridge script loaded in MAIN world');
  
  // Wait for modules to load
  function waitForModules() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.ElementorEditorDetector && 
            window.ClipboardManager && 
            window.PasteInterceptor &&
            window.EditorContextInjector) {
          console.log('[Bridge] All modules available');
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
  
  // Wait for Elementor to load
  function waitForElementor() {
    return new Promise((resolve) => {
      // Check immediately first
      if (typeof elementor !== 'undefined' && elementor.config) {
        console.log('[Bridge] Elementor already loaded, version:', elementor.config.version);
        resolve(true);
        return;
      }
      
      if (typeof elementorFrontend !== 'undefined' && typeof elementor === 'undefined') {
        console.log('[Bridge] Elementor frontend detected (not editor)');
        resolve(false);
        return;
      }
      
      let attempts = 0;
      const maxAttempts = 50; // 10 seconds total
      
      const check = () => {
        attempts++;
        
        if (typeof elementor !== 'undefined' && elementor.config) {
          console.log('[Bridge] Elementor loaded after', attempts * 200, 'ms, version:', elementor.config.version);
          resolve(true);
        } else if (typeof elementorFrontend !== 'undefined' && typeof elementor === 'undefined') {
          console.log('[Bridge] Elementor frontend detected (not editor)');
          resolve(false);
        } else if (attempts >= maxAttempts) {
          console.log('[Bridge] Elementor not detected after', attempts * 200, 'ms, skipping initialization');
          resolve(false);
        } else {
          setTimeout(check, 200);
        }
      };
      
      check();
    });
  }
  
  // Initialize when modules and Elementor are ready
  waitForModules().then(async () => {
    console.log('[Bridge] Modules ready, waiting for Elementor...');
    
    const elementorReady = await waitForElementor();
    
    if (!elementorReady) {
      console.log('[Bridge] Not in Elementor editor, skipping initialization');
      return;
    }
    
    console.log('[Bridge] Initializing paste system...');
    
    try {
      // Create instances
      const editorDetector = new window.ElementorEditorDetector();
      const clipboardManager = new window.ClipboardManager();
      const pasteInterceptor = new window.PasteInterceptor();
      const editorInjector = new window.EditorContextInjector();
      
      // Double-check we're in editor
      if (!editorDetector.isElementorEditor()) {
        console.log('[Bridge] Editor detector says not in editor, skipping');
        return;
      }
      
      console.log('[Bridge] In Elementor editor, initializing paste interceptor...');
      
      // Initialize editor injector
      await editorInjector.initialize();
      
      // Initialize paste interceptor with all dependencies
      const success = await pasteInterceptor.initialize(
        clipboardManager,
        editorDetector,
        editorInjector,
        window.ElementorFormatConverter,
        window.MediaURLHandler ? new window.MediaURLHandler() : null,
        window.VersionCompatibilityManager ? new window.VersionCompatibilityManager() : null,
        window.NotificationManager ? new window.NotificationManager() : null
      );
      
      if (success) {
        console.log('[Bridge] ✅ Paste system initialized successfully!');
        
        // Store instances globally for debugging
        window.__elementorCopierInstances = {
          editorDetector,
          clipboardManager,
          pasteInterceptor,
          editorInjector
        };
      } else {
        console.error('[Bridge] ❌ Paste system initialization failed');
      }
      
    } catch (error) {
      console.error('[Bridge] Error initializing paste system:', error);
    }
  });
  
})();
