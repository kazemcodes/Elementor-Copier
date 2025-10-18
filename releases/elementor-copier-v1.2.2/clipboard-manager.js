/**
 * Elementor Copier - Clipboard Manager
 * Handles multi-format clipboard operations for native Elementor paste support
 * 
 * This module manages clipboard data in multiple formats:
 * - text/plain: JSON string (Elementor's default format)
 * - Custom marker: Extension identification
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */

// Extension marker for clipboard data identification
const EXTENSION_MARKER = '__ELEMENTOR_COPIER_DATA__';
const EXTENSION_VERSION = '1.0.0';

/**
 * ClipboardManager class
 * Manages multi-format clipboard operations
 */
class ClipboardManager {
  constructor() {
    this.clipboardAPI = navigator.clipboard;
    this.initialized = false;
  }

  /**
   * Initialize the clipboard manager
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.initialized) {
      console.log('[ClipboardManager] Already initialized');
      return true;
    }

    try {
      // Check if Clipboard API is available
      if (!this.clipboardAPI) {
        console.warn('[ClipboardManager] Clipboard API not available');
        return false;
      }

      this.initialized = true;
      console.log('[ClipboardManager] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[ClipboardManager] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Write data to clipboard in multiple formats
   * Requirement 3.1: Store data in both extension format and Elementor native format
   * 
   * @param {Object} data - The data to write to clipboard
   * @param {Object} options - Optional configuration
   * @returns {Promise<boolean>} Success status
   */
  async writeMultiFormat(data, options = {}) {
    try {
      // Add extension marker for identification
      const markedData = this.addExtensionMarker(data);
      
      // Convert to JSON string (text/plain format that Elementor uses)
      const jsonString = JSON.stringify(markedData, null, 2);
      
      // Check if Clipboard API is available
      if (!this.clipboardAPI || !this.clipboardAPI.writeText) {
        throw new Error('Clipboard API not available');
      }
      
      // Write to clipboard as text/plain
      await this.clipboardAPI.writeText(jsonString);
      
      console.log('✓ Multi-format data written to clipboard');
      return true;
    } catch (error) {
      console.error('✗ Failed to write multi-format data:', error);
      throw error;
    }
  }

  /**
   * Read extension data from clipboard
   * Requirement 3.2: Detect and read extension clipboard data
   * 
   * @returns {Promise<Object|null>} Extension data or null if not found
   */
  async readExtensionData() {
    try {
      // Check if Clipboard API is available
      if (!this.clipboardAPI || !this.clipboardAPI.readText) {
        console.warn('Clipboard read API not available');
        return null;
      }
      
      // Read clipboard text
      const clipboardText = await this.clipboardAPI.readText();
      
      console.log('[ClipboardManager] Read clipboard, length:', clipboardText?.length || 0);
      console.log('[ClipboardManager] First 200 chars:', clipboardText?.substring(0, 200));
      
      if (!clipboardText) {
        console.log('[ClipboardManager] Clipboard is empty');
        return null;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(clipboardText);
        console.log('[ClipboardManager] ✓ JSON parsed successfully');
        console.log('[ClipboardManager] Data type:', data?.type);
      } catch (parseError) {
        console.log('[ClipboardManager] ✗ Clipboard content is not valid JSON');
        console.log('[ClipboardManager] Parse error:', parseError.message);
        console.log('[ClipboardManager] Content preview:', clipboardText.substring(0, 500));
        return null;
      }
      
      // Check if it has extension marker
      if (!this.hasExtensionMarker(data)) {
        console.log('Clipboard data does not have extension marker');
        return null;
      }
      
      console.log('✓ Extension data found in clipboard');
      return data;
    } catch (error) {
      console.error('✗ Failed to read clipboard:', error);
      return null;
    }
  }

  /**
   * Quick check if clipboard contains extension data
   * Requirement 3.3: Quick clipboard content detection
   * 
   * @returns {Promise<boolean>} True if extension data is present
   */
  async hasExtensionData() {
    try {
      const data = await this.readExtensionData();
      return data !== null;
    } catch (error) {
      console.error('✗ Failed to check clipboard:', error);
      return false;
    }
  }

  /**
   * Add extension marker to clipboard data
   * Requirement 3.4: Add extension marker for identification
   * 
   * @param {Object} data - The data to mark
   * @returns {Object} Data with extension marker
   */
  addExtensionMarker(data) {
    return {
      ...data,
      [EXTENSION_MARKER]: {
        version: EXTENSION_VERSION,
        timestamp: Date.now(),
        source: 'elementor-copier-extension'
      }
    };
  }

  /**
   * Check if data has extension marker
   * 
   * @param {Object} data - The data to check
   * @returns {boolean} True if marker is present
   */
  hasExtensionMarker(data) {
    return data && 
           typeof data === 'object' && 
           EXTENSION_MARKER in data &&
           data[EXTENSION_MARKER]?.source === 'elementor-copier-extension';
  }

  /**
   * Remove extension marker from data
   * Useful when passing data to Elementor
   * 
   * @param {Object} data - The data to clean
   * @returns {Object} Data without extension marker
   */
  removeExtensionMarker(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const cleaned = { ...data };
    delete cleaned[EXTENSION_MARKER];
    return cleaned;
  }

  /**
   * Get extension marker metadata
   * 
   * @param {Object} data - The data to extract metadata from
   * @returns {Object|null} Marker metadata or null
   */
  getExtensionMetadata(data) {
    if (!this.hasExtensionMarker(data)) {
      return null;
    }
    
    return data[EXTENSION_MARKER];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClipboardManager, EXTENSION_MARKER };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.ClipboardManager = ClipboardManager;
  window.EXTENSION_MARKER = EXTENSION_MARKER;
}

