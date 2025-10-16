/**
 * Content Sanitizer Module
 * 
 * Provides security sanitization for external Elementor content before pasting.
 * Removes dangerous HTML elements, validates URLs, sanitizes CSS, and validates settings.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */

console.log('[ContentSanitizer] Module loading...');

class ContentSanitizer {
  constructor() {
    // Dangerous HTML tags that should be removed
    this.dangerousTags = ['script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style', 'base'];
    
    // Event handler attributes that should be removed
    this.eventHandlerPattern = /^on/i;
    
    // Dangerous URL protocols
    this.dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    
    // Dangerous CSS patterns
    this.dangerousCSSPatterns = [
      /javascript\s*:/gi,
      /expression\s*\(/gi,
      /import\s+/gi,
      /behavior\s*:/gi,
      /-moz-binding\s*:/gi
    ];
    
    // Expected data types for common Elementor settings
    this.settingTypes = {
      'title': 'string',
      'text': 'string',
      'content': 'string',
      'url': 'string',
      'header_size': 'string',
      'align': 'string',
      'size': 'string',
      '_column_size': 'number',
      '_inline_size': 'number',
      'gap': 'string',
      'height': 'string',
      'width': 'string',
      'background_color': 'string',
      'color': 'string',
      'typography_font_family': 'string',
      'typography_font_size': 'object',
      'border_width': 'object',
      'border_radius': 'object',
      'padding': 'object',
      'margin': 'object',
      '_element_id': 'string',
      '_css_classes': 'string',
      'image': 'object',
      'background_image': 'object'
    };
  }

  /**
   * Sanitize HTML content by removing dangerous elements and attributes
   * Requirement: 10.1, 10.2
   * 
   * @param {string} html - HTML string to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html) {
    if (typeof html !== 'string') {
      return '';
    }

    // Create a temporary DOM element for parsing
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove dangerous elements
    this.dangerousTags.forEach(tag => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    // Remove event handlers and dangerous attributes from all elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      // Remove event handler attributes
      Array.from(el.attributes).forEach(attr => {
        if (this.eventHandlerPattern.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
        
        // Sanitize href and src attributes
        if (attr.name === 'href' || attr.name === 'src') {
          const sanitizedURL = this.sanitizeURL(attr.value);
          if (sanitizedURL === '') {
            el.removeAttribute(attr.name);
          } else {
            el.setAttribute(attr.name, sanitizedURL);
          }
        }
        
        // Sanitize style attributes
        if (attr.name === 'style') {
          const sanitizedStyle = this.sanitizeCSS(attr.value);
          if (sanitizedStyle === '') {
            el.removeAttribute(attr.name);
          } else {
            el.setAttribute(attr.name, sanitizedStyle);
          }
        }
      });
    });

    return temp.innerHTML;
  }

  /**
   * Sanitize and validate URLs
   * Requirement: 10.2, 10.3
   * 
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL or empty string if dangerous
   */
  sanitizeURL(url) {
    if (typeof url !== 'string' || url.trim() === '') {
      return '';
    }

    const trimmedURL = url.trim();

    // Check for dangerous protocols
    for (const protocol of this.dangerousProtocols) {
      if (trimmedURL.toLowerCase().startsWith(protocol)) {
        console.warn(`[Content Sanitizer] Blocked dangerous URL protocol: ${protocol}`);
        return '';
      }
    }

    // Check for encoded dangerous protocols
    try {
      const decoded = decodeURIComponent(trimmedURL);
      for (const protocol of this.dangerousProtocols) {
        if (decoded.toLowerCase().includes(protocol)) {
          console.warn(`[Content Sanitizer] Blocked encoded dangerous URL: ${protocol}`);
          return '';
        }
      }
    } catch (e) {
      // Invalid URL encoding, reject it
      console.warn('[Content Sanitizer] Invalid URL encoding detected');
      return '';
    }

    // Validate URL format
    try {
      // For relative URLs, prepend a dummy base
      if (trimmedURL.startsWith('/') || trimmedURL.startsWith('./') || trimmedURL.startsWith('../')) {
        return trimmedURL; // Allow relative URLs
      }
      
      // For absolute URLs, validate with URL constructor
      if (trimmedURL.startsWith('http://') || trimmedURL.startsWith('https://') || trimmedURL.startsWith('//')) {
        new URL(trimmedURL.startsWith('//') ? 'https:' + trimmedURL : trimmedURL);
        return trimmedURL;
      }
      
      // For other formats (like #anchor or mailto:), allow them
      return trimmedURL;
    } catch (e) {
      console.warn('[Content Sanitizer] Invalid URL format:', trimmedURL);
      return '';
    }
  }

  /**
   * Sanitize CSS to remove dangerous patterns
   * Requirement: 10.4
   * 
   * @param {string} css - CSS string to sanitize
   * @returns {string} Sanitized CSS
   */
  sanitizeCSS(css) {
    if (typeof css !== 'string') {
      return '';
    }

    let sanitized = css;

    // Remove dangerous CSS patterns
    this.dangerousCSSPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove any remaining javascript: or data: URLs in CSS
    sanitized = sanitized.replace(/url\s*\(\s*['"]?(javascript|data|vbscript):/gi, 'url(');

    return sanitized.trim();
  }

  /**
   * Validate settings object data types and structure
   * Requirement: 10.3, 10.5
   * 
   * @param {object} settings - Settings object to validate
   * @param {string} widgetType - Widget type for context
   * @returns {object} Validated and sanitized settings
   */
  validateSettings(settings, widgetType = '') {
    if (typeof settings !== 'object' || settings === null) {
      return {};
    }

    const validated = {};

    for (const [key, value] of Object.entries(settings)) {
      // Check if we have a known type for this setting
      const expectedType = this.settingTypes[key];
      
      if (expectedType) {
        // Validate against expected type
        if (typeof value === expectedType) {
          validated[key] = this.sanitizeSettingValue(key, value);
        } else if (expectedType === 'object' && typeof value === 'object' && value !== null) {
          validated[key] = this.sanitizeSettingValue(key, value);
        } else {
          console.warn(`[Content Sanitizer] Type mismatch for setting "${key}": expected ${expectedType}, got ${typeof value}`);
          // Try to coerce the value
          validated[key] = this.coerceSettingType(value, expectedType);
        }
      } else {
        // Unknown setting - validate based on actual type
        if (typeof value === 'string') {
          validated[key] = this.sanitizeString(value);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          validated[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Recursively validate nested objects
          if (Array.isArray(value)) {
            validated[key] = value.map(item => 
              typeof item === 'object' ? this.validateSettings(item, widgetType) : item
            );
          } else {
            validated[key] = this.validateSettings(value, widgetType);
          }
        }
      }
    }

    return validated;
  }

  /**
   * Sanitize individual setting value based on key
   * 
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {any} Sanitized value
   */
  sanitizeSettingValue(key, value) {
    // Sanitize string values
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    
    // Sanitize URL-related settings
    if (key === 'url' || key.includes('_url') || key.includes('link')) {
      if (typeof value === 'string') {
        return this.sanitizeURL(value);
      } else if (typeof value === 'object' && value !== null && value.url) {
        return {
          ...value,
          url: this.sanitizeURL(value.url)
        };
      }
    }
    
    // Sanitize image objects
    if ((key === 'image' || key === 'background_image') && typeof value === 'object' && value !== null) {
      const sanitized = { ...value };
      if (sanitized.url) {
        sanitized.url = this.sanitizeURL(sanitized.url);
      }
      return sanitized;
    }
    
    // Sanitize CSS-related settings
    if (key.includes('css') || key === 'style') {
      if (typeof value === 'string') {
        return this.sanitizeCSS(value);
      }
    }
    
    // For objects, recursively validate
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return this.validateSettings(value);
    }
    
    return value;
  }

  /**
   * Sanitize string values (remove potential XSS)
   * 
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeString(str) {
    if (typeof str !== 'string') {
      return '';
    }
    
    // Don't sanitize if it looks like plain text (no HTML tags)
    if (!/<[^>]+>/.test(str)) {
      return str;
    }
    
    // If it contains HTML, sanitize it
    return this.sanitizeHTML(str);
  }

  /**
   * Coerce value to expected type
   * 
   * @param {any} value - Value to coerce
   * @param {string} expectedType - Expected type
   * @returns {any} Coerced value
   */
  coerceSettingType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      case 'boolean':
        return Boolean(value);
      case 'object':
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  }

  /**
   * Sanitize complete Elementor element data
   * Requirement: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
   * 
   * @param {object} elementData - Elementor element data to sanitize
   * @returns {object} Sanitized element data
   */
  sanitizeElementData(elementData) {
    if (typeof elementData !== 'object' || elementData === null) {
      return null;
    }

    const sanitized = {
      elType: elementData.elType,
      id: elementData.id,
      isInner: Boolean(elementData.isInner)
    };

    // Add widget type if present
    if (elementData.widgetType) {
      sanitized.widgetType = String(elementData.widgetType);
    }

    // Sanitize settings
    if (elementData.settings) {
      sanitized.settings = this.validateSettings(elementData.settings, elementData.widgetType);
    } else {
      sanitized.settings = {};
    }

    // Recursively sanitize nested elements
    if (Array.isArray(elementData.elements)) {
      sanitized.elements = elementData.elements
        .map(el => this.sanitizeElementData(el))
        .filter(el => el !== null);
    } else {
      sanitized.elements = [];
    }

    return sanitized;
  }

  /**
   * Perform complete sanitization on clipboard data
   * This is the main entry point for sanitization
   * 
   * @param {object} data - Complete clipboard data object
   * @returns {object} Sanitized data
   */
  sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      console.error('[Content Sanitizer] Invalid data format');
      return null;
    }

    try {
      // If it's a single element
      if (data.elType) {
        return this.sanitizeElementData(data);
      }

      // If it's wrapped in a data structure
      if (data.element) {
        return {
          ...data,
          element: this.sanitizeElementData(data.element)
        };
      }

      // If it's an array of elements
      if (Array.isArray(data)) {
        return data
          .map(el => this.sanitizeElementData(el))
          .filter(el => el !== null);
      }

      console.warn('[Content Sanitizer] Unknown data structure');
      return data;
    } catch (error) {
      console.error('[Content Sanitizer] Sanitization error:', error);
      return null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContentSanitizer };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.ContentSanitizer = ContentSanitizer;
  console.log('[ContentSanitizer] Exported to window');
}
