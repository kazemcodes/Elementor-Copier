# Quick Fix for Module Loading Issue

## Problem
The module scripts (elementor-editor-detector.js, editor-injector.js) are loading but not executing due to Content Security Policy restrictions on the page.

## Solution
We need to inject the code directly into the page context using a different method.

## Immediate Workaround

Since ClipboardManager and PasteInterceptor ARE working, we can create minimal inline versions of the missing modules.

Add this to content.js after the module loading functions:

```javascript
// TEMPORARY FIX: Inject missing classes directly
function injectMissingClasses() {
  const script = document.createElement('script');
  script.textContent = `
    // Minimal ElementorEditorDetector
    class ElementorEditorDetector {
      isElementorEditor() {
        return typeof elementor !== 'undefined' || typeof elementorFrontend !== 'undefined';
      }
      isPreviewMode() {
        return window.location.href.includes('elementor-preview');
      }
      async waitForElementor() {
        if (typeof elementor !== 'undefined') return true;
        return new Promise((resolve) => {
          const check = setInterval(() => {
            if (typeof elementor !== 'undefined') {
              clearInterval(check);
              resolve(true);
            }
          }, 100);
          setTimeout(() => {
            clearInterval(check);
            resolve(false);
          }, 10000);
        });
      }
    }
    window.ElementorEditorDetector = ElementorEditorDetector;
    
    // Minimal EditorContextInjector
    class EditorContextInjector {
      async initialize() {
        return typeof elementor !== 'undefined';
      }
      async getElementorVersion() {
        return elementor?.config?.version || 'unknown';
      }
      async triggerElementorPaste(data) {
        if (!elementor || !elementor.$preview) {
          throw new Error('Elementor not found');
        }
        
        // Try to paste using Elementor's internal methods
        try {
          const container = elementor.getPreviewContainer();
          if (container && container.model) {
            // Use Elementor's paste command
            $e.run('document/elements/create', {
              model: data,
              container: container
            });
            return { success: true, method: 'elementor-api' };
          }
        } catch (e) {
          console.error('Paste failed:', e);
        }
        
        throw new Error('Could not paste element');
      }
    }
    window.EditorContextInjector = EditorContextInjector;
    
    console.log('[Inline Fix] Classes injected:', {
      ElementorEditorDetector: typeof window.ElementorEditorDetector,
      EditorContextInjector: typeof window.EditorContextInjector
    });
  `;
  (document.head || document.documentElement).appendChild(script);
  console.log('[Inline Fix] Script injected');
}

// Call this before loading other modules
injectMissingClasses();
```

This creates minimal versions of the classes that will work for basic paste functionality.
