/**
 * Fallback Strategies Module
 * Provides alternative methods when primary operations fail
 * Includes clipboard fallbacks, manual paste instructions, and best-effort conversions
 */

class FallbackStrategies {
  constructor() {
    this.clipboardFallbackAttempted = false;
  }

  /**
   * Fallback for unavailable Clipboard API using execCommand
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyWithExecCommand(text) {
    return new Promise((resolve) => {
      try {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);

        // Select and copy
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        this.clipboardFallbackAttempted = true;
        resolve(success);
      } catch (error) {
        console.error('[Fallback] execCommand copy failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Fallback for reading clipboard using paste event
   * @returns {Promise<string|null>} Clipboard text or null
   */
  async readWithPasteEvent() {
    return new Promise((resolve) => {
      try {
        // Create temporary editable element
        const editable = document.createElement('div');
        editable.contentEditable = true;
        editable.style.position = 'fixed';
        editable.style.left = '-9999px';
        editable.style.top = '-9999px';
        document.body.appendChild(editable);

        // Focus and trigger paste
        editable.focus();

        const pasteHandler = (e) => {
          e.preventDefault();
          const text = e.clipboardData?.getData('text/plain');
          document.body.removeChild(editable);
          resolve(text || null);
        };

        editable.addEventListener('paste', pasteHandler, { once: true });

        // Trigger paste command
        document.execCommand('paste');

        // Cleanup after timeout
        setTimeout(() => {
          if (document.body.contains(editable)) {
            editable.removeEventListener('paste', pasteHandler);
            document.body.removeChild(editable);
            resolve(null);
          }
        }, 1000);
      } catch (error) {
        console.error('[Fallback] Paste event read failed:', error);
        resolve(null);
      }
    });
  }

  /**
   * Create manual paste instructions when API access fails
   * @param {object} data - Data to paste
   * @param {string} format - Data format ('json' or 'elementor')
   * @returns {object} Instructions object
   */
  createManualPasteInstructions(data, format = 'json') {
    const jsonData = JSON.stringify(data, null, 2);
    
    const instructions = {
      title: 'Manual Paste Required',
      steps: [
        'The extension cannot access the clipboard automatically.',
        'Please follow these steps to paste the element:',
        '',
        '1. Copy the JSON data below (click the "Copy Data" button)',
        '2. Open your Elementor editor',
        '3. Right-click in the editor and select "Paste"',
        '4. If that doesn\'t work, use Elementor\'s import feature',
        '',
        'JSON Data:'
      ],
      data: jsonData,
      actions: [
        { label: 'Copy Data', action: 'copy', data: jsonData },
        { label: 'Download Data', action: 'download', data: jsonData },
        { label: 'View Help', action: 'help' }
      ]
    };

    return instructions;
  }

  /**
   * Display manual paste instructions in UI
   * @param {object} instructions - Instructions object
   */
  displayManualInstructions(instructions) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'elementor-copier-manual-paste-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Build content
    let content = `<h2 style="margin-top: 0;">${instructions.title}</h2>`;
    content += instructions.steps.map(step => `<p style="margin: 8px 0;">${step}</p>`).join('');
    content += `<textarea readonly style="width: 100%; height: 200px; margin: 15px 0; padding: 10px; font-family: monospace; font-size: 12px; border: 1px solid #ddd; border-radius: 4px;">${instructions.data}</textarea>`;
    
    // Add action buttons
    content += '<div style="display: flex; gap: 10px; margin-top: 20px;">';
    instructions.actions.forEach(action => {
      content += `<button data-action="${action.action}" style="padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; background: #0073aa; color: white; font-size: 14px;">${action.label}</button>`;
    });
    content += '<button data-action="close" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background: white; color: #333; font-size: 14px;">Close</button>';
    content += '</div>';

    modal.innerHTML = content;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Handle button clicks
    modal.addEventListener('click', async (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      const action = button.dataset.action;
      
      if (action === 'copy') {
        try {
          await navigator.clipboard.writeText(instructions.data);
          button.textContent = '✓ Copied!';
          setTimeout(() => button.textContent = 'Copy Data', 2000);
        } catch (err) {
          // Try fallback
          const success = await this.copyWithExecCommand(instructions.data);
          button.textContent = success ? '✓ Copied!' : '✗ Failed';
          setTimeout(() => button.textContent = 'Copy Data', 2000);
        }
      } else if (action === 'download') {
        this.downloadData(instructions.data, 'elementor-data.json');
      } else if (action === 'help') {
        window.open('https://github.com/your-repo/wiki/manual-paste', '_blank');
      } else if (action === 'close') {
        document.body.removeChild(overlay);
      }
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - Filename
   */
  downloadData(data, filename) {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[Fallback] Download failed:', error);
    }
  }

  /**
   * Implement raw data download option for conversion failures
   * @param {object} data - Original data
   * @param {Error} conversionError - The conversion error
   */
  offerRawDataDownload(data, conversionError) {
    const filename = `elementor-raw-data-${Date.now()}.json`;
    const downloadData = {
      error: conversionError.message,
      timestamp: new Date().toISOString(),
      originalData: data,
      note: 'This is the raw extracted data. Conversion to Elementor format failed. You may need to manually adjust the data structure.'
    };

    this.downloadData(JSON.stringify(downloadData, null, 2), filename);

    // Show notification
    if (typeof NotificationManager !== 'undefined') {
      const notificationManager = new NotificationManager();
      notificationManager.showWarning(
        `Conversion failed. Raw data downloaded as ${filename}. You can try importing this manually.`,
        ['Check downloaded file', 'Review error in console', 'Contact support']
      );
    }
  }

  /**
   * Best-effort conversion with warnings for version incompatibilities
   * @param {object} data - Data to convert
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {object} Converted data with warnings
   */
  attemptBestEffortConversion(data, sourceVersion, targetVersion) {
    const warnings = [];
    const convertedData = JSON.parse(JSON.stringify(data)); // Deep clone

    try {
      // Handle major version differences
      const sourceMajor = parseInt(sourceVersion.split('.')[0]);
      const targetMajor = parseInt(targetVersion.split('.')[0]);

      if (sourceMajor < targetMajor) {
        warnings.push(`Upgrading from Elementor ${sourceVersion} to ${targetVersion}. Some features may need adjustment.`);
        
        // Apply known migrations
        this.applyVersionMigrations(convertedData, sourceMajor, targetMajor, warnings);
      } else if (sourceMajor > targetMajor) {
        warnings.push(`Downgrading from Elementor ${sourceVersion} to ${targetVersion}. Some newer features may not work.`);
        
        // Remove unsupported features
        this.removeUnsupportedFeatures(convertedData, targetMajor, warnings);
      }

      // Validate and fix common issues
      this.validateAndFix(convertedData, warnings);

      return {
        success: true,
        data: convertedData,
        warnings
      };
    } catch (error) {
      warnings.push(`Best-effort conversion failed: ${error.message}`);
      return {
        success: false,
        data: data, // Return original
        warnings
      };
    }
  }

  /**
   * Apply version-specific migrations
   * @param {object} data - Data to migrate
   * @param {number} sourceMajor - Source major version
   * @param {number} targetMajor - Target major version
   * @param {array} warnings - Warnings array
   */
  applyVersionMigrations(data, sourceMajor, targetMajor, warnings) {
    // Example: Elementor 2.x to 3.x migrations
    if (sourceMajor === 2 && targetMajor >= 3) {
      // Migrate deprecated widget types
      if (data.widgetType === 'image-box') {
        data.widgetType = 'icon-box';
        warnings.push('Converted deprecated "image-box" to "icon-box"');
      }
    }

    // Recursively apply to nested elements
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => {
        this.applyVersionMigrations(element, sourceMajor, targetMajor, warnings);
      });
    }
  }

  /**
   * Remove features not supported in target version
   * @param {object} data - Data to clean
   * @param {number} targetMajor - Target major version
   * @param {array} warnings - Warnings array
   */
  removeUnsupportedFeatures(data, targetMajor, warnings) {
    // Example: Remove Elementor 4.x features when targeting 3.x
    if (targetMajor < 4 && data.elType === 'container') {
      data.elType = 'section';
      warnings.push('Converted "container" to "section" for compatibility');
    }

    // Remove unsupported settings
    if (data.settings) {
      const unsupportedKeys = [];
      
      if (targetMajor < 3) {
        // Remove 3.x+ features
        unsupportedKeys.push('_flex_direction', '_flex_wrap');
      }

      unsupportedKeys.forEach(key => {
        if (data.settings[key]) {
          delete data.settings[key];
          warnings.push(`Removed unsupported setting: ${key}`);
        }
      });
    }

    // Recursively clean nested elements
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => {
        this.removeUnsupportedFeatures(element, targetMajor, warnings);
      });
    }
  }

  /**
   * Validate and fix common data issues
   * @param {object} data - Data to validate
   * @param {array} warnings - Warnings array
   */
  validateAndFix(data, warnings) {
    // Ensure required fields exist
    if (!data.id || typeof data.id !== 'string') {
      data.id = this.generateElementId();
      warnings.push('Generated missing element ID');
    }

    if (!data.elType) {
      data.elType = 'widget';
      warnings.push('Set missing elType to "widget"');
    }

    if (!data.settings || typeof data.settings !== 'object') {
      data.settings = {};
      warnings.push('Initialized missing settings object');
    }

    if (!Array.isArray(data.elements)) {
      data.elements = [];
    }

    // Recursively validate nested elements
    data.elements.forEach(element => {
      this.validateAndFix(element, warnings);
    });
  }

  /**
   * Generate random element ID
   * @returns {string} 8-character hex ID
   */
  generateElementId() {
    return Math.random().toString(16).substring(2, 10);
  }

  /**
   * Check if clipboard API is available
   * @returns {boolean} Availability status
   */
  isClipboardAPIAvailable() {
    return !!(navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.readText);
  }

  /**
   * Get appropriate clipboard method
   * @returns {string} Method name ('api', 'execCommand', or 'manual')
   */
  getClipboardMethod() {
    if (this.isClipboardAPIAvailable()) {
      return 'api';
    } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
      return 'execCommand';
    } else {
      return 'manual';
    }
  }

  /**
   * Universal clipboard write with automatic fallback
   * @param {string} text - Text to write
   * @returns {Promise<object>} Result object with success status and method used
   */
  async writeToClipboard(text) {
    const method = this.getClipboardMethod();

    try {
      if (method === 'api') {
        await navigator.clipboard.writeText(text);
        return { success: true, method: 'api' };
      } else if (method === 'execCommand') {
        const success = await this.copyWithExecCommand(text);
        return { success, method: 'execCommand' };
      } else {
        // Manual fallback
        const instructions = this.createManualPasteInstructions(JSON.parse(text));
        this.displayManualInstructions(instructions);
        return { success: false, method: 'manual', instructions };
      }
    } catch (error) {
      console.error('[Fallback] All clipboard methods failed:', error);
      
      // Last resort: show manual instructions
      try {
        const instructions = this.createManualPasteInstructions(JSON.parse(text));
        this.displayManualInstructions(instructions);
      } catch (e) {
        console.error('[Fallback] Failed to show manual instructions:', e);
      }
      
      return { success: false, method: 'none', error: error.message };
    }
  }

  /**
   * Universal clipboard read with automatic fallback
   * @returns {Promise<object>} Result object with text and method used
   */
  async readFromClipboard() {
    const method = this.getClipboardMethod();

    try {
      if (method === 'api') {
        const text = await navigator.clipboard.readText();
        return { success: true, text, method: 'api' };
      } else if (method === 'execCommand') {
        const text = await this.readWithPasteEvent();
        return { success: !!text, text, method: 'execCommand' };
      } else {
        return { success: false, text: null, method: 'manual', message: 'Manual paste required' };
      }
    } catch (error) {
      console.error('[Fallback] Clipboard read failed:', error);
      return { success: false, text: null, method: 'none', error: error.message };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FallbackStrategies };
}
