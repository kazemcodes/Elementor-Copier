/**
 * Elementor Format Converter
 * Converts extension data format to Elementor's native clipboard format
 * Includes content sanitization for security
 */

(function () {
  'use strict';

  console.log('[FormatConverter] Module loading - VERSION 2.0');

  /**
   * Get sanitizer instance (lazy initialization)
   * This ensures ContentSanitizer is available even if checked before module fully loads
   */
  function getSanitizer() {
    console.log('[FormatConverter] getSanitizer() called. Checking for ContentSanitizer...');
    console.log('[FormatConverter] typeof window:', typeof window);
    console.log('[FormatConverter] window.ContentSanitizer:', typeof window !== 'undefined' ? window.ContentSanitizer : 'window undefined');

    // Check for ContentSanitizer in window (browser environment)
    if (typeof window !== 'undefined' && window.ContentSanitizer) {
      console.log('[FormatConverter] ContentSanitizer found, creating instance');
      return new window.ContentSanitizer();
    }

    // Check for require (Node.js environment)
    if (typeof require !== 'undefined') {
      try {
        const { ContentSanitizer } = require('./content-sanitizer.js');
        return new ContentSanitizer();
      } catch (e) {
        return null;
      }
    }

    console.log('[FormatConverter] ContentSanitizer NOT found. window.ContentSanitizer:', typeof (typeof window !== 'undefined' ? window.ContentSanitizer : undefined));
    return null;
  }

  /**
   * Widget type mapping for version compatibility
   * Maps old widget types to new ones across Elementor versions
   */
  const WIDGET_TYPE_MIGRATIONS = {
    '2.x_to_3.x': {
      'image-box': 'icon-box',
      'icon-list': 'icon-list-item'
    },
    '3.x_to_4.x': {
      // Future migrations can be added here
    }
  };

  /**
   * Deprecated widget types with fallback mappings
   * Maps deprecated widgets to their modern equivalents
   */
  const DEPRECATED_WIDGET_FALLBACKS = {
    'wordpress': 'text-editor',  // Old WordPress widget
    'wp-widget-text': 'text-editor',
    'wp-widget-media_image': 'image',
    'wp-widget-media_video': 'video',
    'wp-widget-media_audio': 'audio'
  };

  /**
   * Settings property migrations
   * Maps old setting names to new ones for specific widget types
   */
  const SETTING_MIGRATIONS = {
    'heading': {
      'tag': 'header_size'  // Elementor 2.x → 3.x
    },
    'button': {
      'size': 'button_size'
    },
    'image': {
      'link_to': 'link'
    },
    'icon': {
      'icon': 'selected_icon'
    }
  };

  /**
   * Settings value transformations
   * Transforms setting values when property names change
   */
  const SETTING_VALUE_TRANSFORMS = {
    'heading': {
      'header_size': (value) => {
        // Transform old tag values to new header_size format
        const tagMap = {
          'h1': 'h1',
          'h2': 'h2',
          'h3': 'h3',
          'h4': 'h4',
          'h5': 'h5',
          'h6': 'h6',
          'div': 'div',
          'span': 'span',
          'p': 'p'
        };
        return tagMap[value] || value;
      }
    }
  };

  /**
   * Convert extension data to Elementor native format
   * @param {Object} extensionData - Data in extension format
   * @param {Object} options - Conversion options
   * @param {string} options.sourceVersion - Source Elementor version
   * @param {string} options.targetVersion - Target Elementor version
   * @param {boolean} options.sanitize - Whether to sanitize content (default: true)
   * @returns {Object} Data in Elementor native format
   */
  function convertToNativeFormat(extensionData, options = {}) {
    try {
      if (!extensionData || !extensionData.data) {
        throw new Error('Invalid extension data: missing data property');
      }

      const sourceVersion = options.sourceVersion || extensionData.metadata?.elementorVersion || 'unknown';
      const targetVersion = options.targetVersion || 'unknown';
      const shouldSanitize = options.sanitize !== false; // Default to true

      console.log(`[FormatConverter] ========== CONVERSION START ==========`);
      console.log(`[FormatConverter] Converting from extension format (Elementor ${sourceVersion}) to native format (Elementor ${targetVersion})`);
      console.log('[FormatConverter] Input data:', JSON.stringify(extensionData.data, null, 2));
      console.log('[FormatConverter] Input element type:', extensionData.data?.elType);
      console.log('[FormatConverter] Input has children:', !!extensionData.data?.elements);
      console.log('[FormatConverter] Input children count:', extensionData.data?.elements?.length || 0);

      // Convert the main element
      let converted = convertElement(extensionData.data, sourceVersion, targetVersion);
      
      console.log('[FormatConverter] After conversion:', JSON.stringify(converted, null, 2));
      console.log('[FormatConverter] Converted element type:', converted?.elType);
      console.log('[FormatConverter] Converted has children:', !!converted?.elements);
      console.log('[FormatConverter] Converted children count:', converted?.elements?.length || 0);

      // Sanitize the converted data if sanitizer is available and enabled
      if (shouldSanitize) {
        const sanitizer = getSanitizer();
        if (sanitizer) {
          console.log('[FormatConverter] Sanitizing converted data...');
          console.log('[FormatConverter] Data before sanitization:', JSON.stringify(converted).substring(0, 300));
          converted = sanitizer.sanitizeElementData(converted);
          if (!converted) {
            throw new Error('Sanitization failed: data was rejected');
          }
          console.log('[FormatConverter] Data after sanitization:', JSON.stringify(converted).substring(0, 300));
          console.log('[FormatConverter] ✓ Sanitization complete');
        } else {
          console.warn('[FormatConverter] ⚠ Sanitizer not available, skipping sanitization');
        }
      }

      // Validate the output
      if (!validateOutput(converted)) {
        console.error('[FormatConverter] ✗ Validation failed for:', converted);
        throw new Error('Converted data failed validation');
      }

      console.log('[FormatConverter] ✓ Conversion successful');
      console.log('[FormatConverter] Final output:', JSON.stringify(converted, null, 2));
      return converted;

    } catch (error) {
      console.error('Error converting to native format:', error);
      throw error;
    }
  }

  /**
   * Convert a single element recursively
   * @param {Object} element - Element data to convert
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {Object} Converted element in native format
   */
  function convertElement(element, sourceVersion, targetVersion) {
    if (!element) {
      return null;
    }

    // Determine element type
    let elType = element.elType || 'widget';
    let widgetType = element.widgetType || null;

    // Handle widget.type format from data-element_type
    if (elType.startsWith('widget.')) {
      widgetType = elType.replace('widget.', '');
      elType = 'widget';
    }

    // Map widget type if needed for version compatibility
    if (widgetType) {
      widgetType = mapWidgetType(widgetType, sourceVersion, targetVersion);
    }

    // Generate unique element ID
    const elementId = generateElementId();

    // Convert settings
    const settings = convertSettings(
      element.settings || {},
      widgetType || elType,
      sourceVersion,
      targetVersion
    );

    // Check if this is a custom widget that might not exist on target site
    const isCustomWidget = elType === 'widget' && widgetType && (
      widgetType.includes('.') || // Custom widgets usually have dots (e.g., wd_banner.default)
      widgetType.startsWith('wd_') || // WoodMart widgets
      widgetType.includes('slider_revolution') || // Slider Revolution
      widgetType.includes('_') && !isStandardElementorWidget(widgetType) // Other custom widgets
    );

    // If custom widget and has renderedContent, convert to HTML widget
    if (isCustomWidget && element.renderedContent) {
      console.log(`[FormatConverter] Converting custom widget "${widgetType}" to HTML widget with rendered content`);
      
      return {
        elType: 'widget',
        id: elementId,
        widgetType: 'html',
        settings: {
          html: element.renderedContent,
          _element_id: '',
          _css_classes: `elementor-copier-fallback ${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
    }

    // Build base structure
    const converted = {
      elType: elType,
      id: elementId,
      settings: settings,
      elements: [],
      isInner: element.isInner || false
    };

    // Add widget type for widgets
    if (elType === 'widget' && widgetType) {
      converted.widgetType = widgetType;
    }

    // Recursively convert child elements
    if (element.elements && Array.isArray(element.elements)) {
      converted.elements = element.elements
        .map(child => convertElement(child, sourceVersion, targetVersion))
        .filter(child => child !== null);
    }

    return converted;
  }

  /**
   * Check if widget type is a standard Elementor widget
   * @param {string} widgetType - Widget type to check
   * @returns {boolean} True if standard Elementor widget
   */
  function isStandardElementorWidget(widgetType) {
    const standardWidgets = [
      'heading', 'image', 'text-editor', 'video', 'button', 'divider', 'spacer',
      'google_maps', 'icon', 'image-box', 'icon-box', 'star-rating', 'image-carousel',
      'image-gallery', 'icon-list', 'counter', 'progress', 'testimonial', 'tabs',
      'accordion', 'toggle', 'social-icons', 'alert', 'audio', 'shortcode', 'html',
      'menu-anchor', 'sidebar', 'read-more', 'text-path', 'animated-headline',
      'price-list', 'price-table', 'flip-box', 'call-to-action', 'countdown',
      'form', 'login', 'posts', 'portfolio', 'gallery', 'slides', 'nav-menu',
      'search-form', 'sitemap', 'breadcrumbs', 'author-box', 'post-info',
      'post-title', 'post-excerpt', 'post-content', 'post-navigation',
      'facebook-button', 'facebook-comments', 'facebook-embed', 'facebook-page',
      'woocommerce-menu-cart', 'woocommerce-breadcrumb', 'woocommerce-products',
      'theme-site-logo', 'theme-site-title', 'theme-page-title', 'theme-post-title'
    ];
    return standardWidgets.includes(widgetType);
  }

  /**
   * Generate 8-character hexadecimal element ID
   * Matches Elementor's ID format
   * @returns {string} 8-character hex ID
   */
  function generateElementId() {
    const chars = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars[Math.floor(Math.random() * 16)];
    }
    return id;
  }

  /**
   * Map widget type for version compatibility
   * @param {string} widgetType - Original widget type
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {string} Mapped widget type
   */
  function mapWidgetType(widgetType, sourceVersion, targetVersion) {
    if (!widgetType) {
      return widgetType;
    }

    let mappedType = widgetType;

    // First, check if widget is deprecated and needs fallback
    if (DEPRECATED_WIDGET_FALLBACKS[widgetType]) {
      const fallback = DEPRECATED_WIDGET_FALLBACKS[widgetType];
      console.log(`Using fallback for deprecated widget: ${widgetType} → ${fallback}`);
      mappedType = fallback;
    }

    // Determine which migration path to use
    const sourceMajor = getMajorVersion(sourceVersion);
    const targetMajor = getMajorVersion(targetVersion);

    // If versions are unknown or same major version, return current mapping
    if (sourceMajor === 'unknown' || targetMajor === 'unknown' || sourceMajor === targetMajor) {
      return mappedType;
    }

    // Apply version-specific migrations
    // 2.x → 3.x
    if (sourceMajor === '2' && (targetMajor === '3' || targetMajor === '4')) {
      const migration = WIDGET_TYPE_MIGRATIONS['2.x_to_3.x'][mappedType];
      if (migration) {
        console.log(`Mapping widget type: ${mappedType} → ${migration} (2.x → 3.x)`);
        mappedType = migration;
      }
    }

    // 3.x → 4.x
    if (sourceMajor === '3' && targetMajor === '4') {
      const migration = WIDGET_TYPE_MIGRATIONS['3.x_to_4.x'][mappedType];
      if (migration) {
        console.log(`Mapping widget type: ${mappedType} → ${migration} (3.x → 4.x)`);
        mappedType = migration;
      }
    }

    // 2.x → 4.x (apply both migrations)
    if (sourceMajor === '2' && targetMajor === '4') {
      // First apply 2.x → 3.x
      let tempType = WIDGET_TYPE_MIGRATIONS['2.x_to_3.x'][mappedType];
      if (tempType) {
        mappedType = tempType;
      }
      // Then apply 3.x → 4.x
      tempType = WIDGET_TYPE_MIGRATIONS['3.x_to_4.x'][mappedType];
      if (tempType) {
        console.log(`Mapping widget type: ${widgetType} → ${mappedType} (2.x → 4.x)`);
        mappedType = tempType;
      }
    }

    return mappedType;
  }

  /**
   * Convert element settings with property migrations
   * @param {Object} settings - Original settings
   * @param {string} elementType - Element or widget type
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {Object} Converted settings
   */
  function convertSettings(settings, elementType, sourceVersion, targetVersion) {
    if (!settings || typeof settings !== 'object') {
      return {};
    }

    const converted = { ...settings };

    // Apply setting migrations for this element type
    const migrations = SETTING_MIGRATIONS[elementType];
    if (migrations) {
      Object.keys(migrations).forEach(oldKey => {
        if (converted.hasOwnProperty(oldKey)) {
          const newKey = migrations[oldKey];
          let value = converted[oldKey];

          // Apply value transformation if defined
          const transforms = SETTING_VALUE_TRANSFORMS[elementType];
          if (transforms && transforms[newKey]) {
            value = transforms[newKey](value);
          }

          console.log(`Migrating setting: ${oldKey} → ${newKey} for ${elementType}`);
          converted[newKey] = value;
          delete converted[oldKey];
        }
      });
    }

    // Ensure required Elementor settings exist
    if (!converted._element_id) {
      converted._element_id = '';
    }
    if (!converted._css_classes) {
      converted._css_classes = '';
    }

    return converted;
  }

  /**
   * Get major version number from version string
   * @param {string} version - Version string (e.g., "3.5.2")
   * @returns {string} Major version (e.g., "3") or "unknown"
   */
  function getMajorVersion(version) {
    if (!version || version === 'unknown') {
      return 'unknown';
    }

    const match = version.match(/^(\d+)\./);
    return match ? match[1] : 'unknown';
  }

  /**
   * Validate converted output matches Elementor schema
   * @param {Object} data - Converted data to validate
   * @returns {boolean} True if valid
   */
  function validateOutput(data) {
    if (!data || typeof data !== 'object') {
      console.error('Validation failed: data is not an object');
      return false;
    }

    // Check required fields
    if (!data.elType) {
      console.error('Validation failed: missing elType');
      return false;
    }

    if (!data.id) {
      console.error('Validation failed: missing id');
      return false;
    }

    // Validate ID format (8 hex characters)
    if (!/^[a-f0-9]{8}$/.test(data.id)) {
      console.error('Validation failed: invalid id format (expected 8 hex characters)');
      return false;
    }

    // Check settings is an object
    if (!data.settings || typeof data.settings !== 'object') {
      console.error('Validation failed: settings must be an object');
      return false;
    }

    // Check elements is an array
    if (!Array.isArray(data.elements)) {
      console.error('Validation failed: elements must be an array');
      return false;
    }

    // Validate widget type for widgets
    if (data.elType === 'widget' && !data.widgetType) {
      console.error('Validation failed: widget missing widgetType');
      return false;
    }

    // Validate isInner is boolean
    if (typeof data.isInner !== 'boolean') {
      console.error('Validation failed: isInner must be boolean');
      return false;
    }

    // Recursively validate child elements
    for (const child of data.elements) {
      if (!validateOutput(child)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Convert extension clipboard data to native format
   * This is a convenience wrapper that handles the full clipboard data structure
   * @param {Object} clipboardData - Full clipboard data from extension
   * @param {Object} options - Conversion options
   * @returns {Object} Native format data ready for Elementor
   */
  function convertClipboardData(clipboardData, options = {}) {
    if (!clipboardData || clipboardData.type !== 'elementor-copier') {
      throw new Error('Invalid clipboard data: not from Elementor Copier extension');
    }

    const sourceVersion = clipboardData.metadata?.elementorVersion || 'unknown';
    const targetVersion = options.targetVersion || 'unknown';

    return convertToNativeFormat(clipboardData, {
      sourceVersion,
      targetVersion
    });
  }

  // Export functions
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS
    module.exports = {
      convertToNativeFormat,
      convertClipboardData,
      generateElementId,
      mapWidgetType,
      validateOutput
    };
  } else {
    // Browser
    window.ElementorFormatConverter = {
      convertToNativeFormat,
      convertClipboardData,
      generateElementId,
      mapWidgetType,
      validateOutput
    };
    console.log('[ElementorFormatConverter] Exported to window');
  }

})();
