/**
 * Elementor Data Extractor
 * Extracts element data directly from Elementor's internal API
 * This provides proper Elementor format data instead of just HTML
 */

(function() {
  'use strict';

  console.log('[DataExtractor] Module loading');

  class ElementorDataExtractor {
    constructor() {
      this.elementor = null;
      this.initialized = false;
    }

    /**
     * Initialize the extractor with Elementor instance
     */
    async initialize() {
      // Wait for Elementor to be available
      await this.waitForElementor();
      this.elementor = window.elementor;
      this.initialized = true;
      console.log('[DataExtractor] Initialized with Elementor', this.elementor.config.version);
      return true;
    }

    /**
     * Wait for Elementor to load
     */
    waitForElementor() {
      return new Promise((resolve) => {
        if (typeof window.elementor !== 'undefined' && window.elementor.config) {
          resolve(true);
          return;
        }

        let attempts = 0;
        const maxAttempts = 50;
        const check = () => {
          attempts++;
          if (typeof window.elementor !== 'undefined' && window.elementor.config) {
            resolve(true);
          } else if (attempts >= maxAttempts) {
            console.warn('[DataExtractor] Elementor not found after waiting');
            resolve(false);
          } else {
            setTimeout(check, 200);
          }
        };
        check();
      });
    }

    /**
     * Check if we're in Elementor editor
     */
    isInEditor() {
      return this.initialized && 
             this.elementor && 
             this.elementor.config && 
             this.elementor.config.document;
    }

    /**
     * Extract element data using Elementor's API
     * This gets the actual Elementor data, not just HTML
     * @param {HTMLElement} domElement - The DOM element to extract data from
     * @returns {Object|null} Elementor element data
     */
    extractElementData(domElement) {
      if (!this.isInEditor()) {
        console.log('[DataExtractor] Not in editor, falling back to DOM extraction');
        return this.extractFromDOM(domElement);
      }

      try {
        // Get element ID from DOM
        const elementId = domElement.getAttribute('data-id');
        if (!elementId) {
          console.warn('[DataExtractor] Element has no data-id');
          return this.extractFromDOM(domElement);
        }

        console.log('[DataExtractor] Extracting element:', elementId);

        // Get element model from Elementor
        const elementModel = this.getElementModel(elementId);
        if (!elementModel) {
          console.warn('[DataExtractor] Could not find element model for ID:', elementId);
          return this.extractFromDOM(domElement);
        }

        // Extract data from model
        const elementData = this.modelToData(elementModel);
        console.log('[DataExtractor] ✓ Extracted from Elementor API:', elementData);
        
        return elementData;

      } catch (error) {
        console.error('[DataExtractor] Error extracting from API:', error);
        return this.extractFromDOM(domElement);
      }
    }

    /**
     * Get element model from Elementor by ID
     * @param {string} elementId - Element ID
     * @returns {Object|null} Element model
     */
    getElementModel(elementId) {
      try {
        // Method 1: Search in elements collection
        if (this.elementor.elements && this.elementor.elements.models) {
          const model = this.findModelById(this.elementor.elements.models, elementId);
          if (model) {
            console.log('[DataExtractor] Found model in elements collection');
            return model;
          }
        }

        // Method 2: Get from preview view
        const previewView = this.elementor.getPreviewView?.();
        if (previewView && previewView.collection) {
          const model = this.findModelById(previewView.collection.models, elementId);
          if (model) {
            console.log('[DataExtractor] Found model in preview view');
            return model;
          }
        }

        // Method 3: Search in document
        if (this.elementor.documents && this.elementor.documents.currentDocument) {
          const container = this.elementor.documents.currentDocument.container;
          if (container) {
            const model = this.findModelInContainer(container, elementId);
            if (model) {
              console.log('[DataExtractor] Found model in document container');
              return model;
            }
          }
        }

        console.warn('[DataExtractor] Model not found in any collection');
        return null;

      } catch (error) {
        console.error('[DataExtractor] Error getting model:', error);
        return null;
      }
    }

    /**
     * Find model by ID in a collection
     * @param {Array} models - Array of models
     * @param {string} elementId - Element ID to find
     * @returns {Object|null} Found model
     */
    findModelById(models, elementId) {
      if (!models || !Array.isArray(models)) {
        return null;
      }

      for (const model of models) {
        // Check if this is the model we're looking for
        if (model.id === elementId || model.get?.('id') === elementId) {
          return model;
        }

        // Recursively search in children
        const children = model.get?.('elements') || model.elements;
        if (children && children.models) {
          const found = this.findModelById(children.models, elementId);
          if (found) {
            return found;
          }
        }
      }

      return null;
    }

    /**
     * Find model in container (Elementor 3.0+)
     * @param {Object} container - Container object
     * @param {string} elementId - Element ID
     * @returns {Object|null} Found model
     */
    findModelInContainer(container, elementId) {
      if (!container) {
        return null;
      }

      // Check if this container matches
      if (container.id === elementId) {
        return container.model || container;
      }

      // Search in children
      if (container.children) {
        for (const child of container.children) {
          const found = this.findModelInContainer(child, elementId);
          if (found) {
            return found;
          }
        }
      }

      return null;
    }

    /**
     * Convert Elementor model to data object
     * @param {Object} model - Elementor model
     * @returns {Object} Element data
     */
    modelToData(model) {
      try {
        // Get attributes from model
        const attributes = model.attributes || model.toJSON?.() || model;

        const data = {
          id: attributes.id,
          elType: attributes.elType,
          settings: { ...attributes.settings },
          isInner: attributes.isInner || false
        };

        // Add widget type for widgets
        if (data.elType === 'widget') {
          data.widgetType = attributes.widgetType;
        }

        // Recursively convert child elements
        const elements = attributes.elements;
        if (elements) {
          data.elements = [];
          
          // Handle both array and collection
          const childModels = elements.models || elements;
          if (Array.isArray(childModels)) {
            for (const childModel of childModels) {
              const childData = this.modelToData(childModel);
              if (childData) {
                data.elements.push(childData);
              }
            }
          }
        }

        console.log('[DataExtractor] Converted model to data:', data.elType, data.id);
        return data;

      } catch (error) {
        console.error('[DataExtractor] Error converting model to data:', error);
        return null;
      }
    }

    /**
     * Fallback: Extract from DOM when API is not available
     * @param {HTMLElement} element - DOM element
     * @returns {Object|null} Element data
     */
    extractFromDOM(element) {
      try {
        console.log('[DataExtractor] Extracting from DOM (fallback)');

        const data = {
          id: element.getAttribute('data-id') || this.generateId(),
          elType: element.getAttribute('data-element_type') || 'unknown',
          settings: {},
          isInner: false
        };

        // Extract settings from data attributes
        const settingsAttr = element.getAttribute('data-settings') || 
                            element.getAttribute('data-elementor-settings');
        if (settingsAttr) {
          try {
            data.settings = JSON.parse(settingsAttr);
          } catch (e) {
            console.warn('[DataExtractor] Could not parse settings:', e);
          }
        }

        // Extract widget type
        if (data.elType.startsWith('widget.')) {
          data.widgetType = data.elType.replace('widget.', '');
          data.elType = 'widget';
        }

        // Extract rendered content for widgets (fallback for frontend)
        if (data.elType === 'widget') {
          const widgetContent = element.querySelector('.elementor-widget-container');
          if (widgetContent) {
            data.renderedContent = widgetContent.innerHTML;
          }
        }

        // Extract child elements
        data.elements = this.extractChildElements(element, data.elType);

        return data;

      } catch (error) {
        console.error('[DataExtractor] Error extracting from DOM:', error);
        return null;
      }
    }

    /**
     * Extract child elements from DOM
     * @param {HTMLElement} element - Parent element
     * @param {string} elType - Element type
     * @returns {Array} Child elements data
     */
    extractChildElements(element, elType) {
      let childElements = [];

      try {
        if (elType === 'section') {
          childElements = element.querySelectorAll(':scope > .elementor-container > .elementor-column, :scope > .elementor-container > .elementor-row > .elementor-column');
        } else if (elType === 'column') {
          childElements = element.querySelectorAll(':scope > .elementor-widget-wrap > .elementor-element, :scope > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element');
        }

        const children = [];
        childElements.forEach(child => {
          const childData = this.extractFromDOM(child);
          if (childData) {
            children.push(childData);
          }
        });

        return children;

      } catch (error) {
        console.error('[DataExtractor] Error extracting children:', error);
        return [];
      }
    }

    /**
     * Generate random ID
     */
    generateId() {
      const chars = '0123456789abcdef';
      let id = '';
      for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * 16)];
      }
      return id;
    }

    /**
     * Get Elementor version
     */
    getElementorVersion() {
      if (this.elementor && this.elementor.config) {
        return this.elementor.config.version;
      }
      return 'unknown';
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ElementorDataExtractor };
  } else {
    window.ElementorDataExtractor = ElementorDataExtractor;
    console.log('[ElementorDataExtractor] Exported to window');
  }

})();
