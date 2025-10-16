/**
 * Version Compatibility Manager
 * Handles version detection, comparison, and data migration between different Elementor versions
 */

class VersionCompatibilityManager {
  constructor() {
    // Widget type migrations between versions
    this.widgetMigrations = {
      '2.x_to_3.x': {
        'image-box': 'icon-box',
        'icon-list': 'icon-list-item'
      },
      '3.x_to_4.x': {
        // Future migrations can be added here
      }
    };

    // Setting migrations for specific widget types
    this.settingMigrations = {
      'heading': {
        'tag': 'header_size'
      },
      'button': {
        'size': 'button_size'
      },
      'image': {
        'caption': 'caption_text'
      }
    };

    // Version compatibility matrix
    this.compatibilityMatrix = {
      '2.x': { compatible: ['2.x', '3.x'], warning: ['4.x'] },
      '3.x': { compatible: ['2.x', '3.x', '4.x'], warning: [] },
      '4.x': { compatible: ['3.x', '4.x'], warning: ['2.x'] }
    };
  }

  /**
   * Detect Elementor version from window object
   * @returns {string|null} Version string or null if not detected
   */
  detectVersion() {
    try {
      if (window.elementor && window.elementor.config && window.elementor.config.version) {
        return window.elementor.config.version;
      }
      
      if (window.elementorFrontendConfig && window.elementorFrontendConfig.version) {
        return window.elementorFrontendConfig.version;
      }
      
      return null;
    } catch (error) {
      console.error('[Version Compatibility] Error detecting version:', error);
      return null;
    }
  }

  /**
   * Parse version string into major, minor, patch components
   * @param {string} version - Version string (e.g., "3.5.2")
   * @returns {object} Parsed version object
   */
  parseVersion(version) {
    if (!version) {
      return { major: 0, minor: 0, patch: 0, full: '0.0.0' };
    }

    const parts = version.split('.').map(p => parseInt(p, 10) || 0);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      full: version
    };
  }

  /**
   * Get version family (e.g., "3.x" from "3.5.2")
   * @param {string} version - Version string
   * @returns {string} Version family
   */
  getVersionFamily(version) {
    const parsed = this.parseVersion(version);
    return `${parsed.major}.x`;
  }

  /**
   * Compare two versions
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(version1, version2) {
    const v1 = this.parseVersion(version1);
    const v2 = this.parseVersion(version2);

    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    return v1.patch - v2.patch;
  }

  /**
   * Check if two versions are compatible
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {object} Compatibility result with status and message
   */
  isCompatible(sourceVersion, targetVersion) {
    if (!sourceVersion || !targetVersion) {
      return {
        compatible: true,
        warning: false,
        message: 'Version information not available'
      };
    }

    const sourceFamily = this.getVersionFamily(sourceVersion);
    const targetFamily = this.getVersionFamily(targetVersion);

    // Same version family is always compatible
    if (sourceFamily === targetFamily) {
      return {
        compatible: true,
        warning: false,
        message: 'Same version family'
      };
    }

    const compatibility = this.compatibilityMatrix[sourceFamily];
    if (!compatibility) {
      return {
        compatible: true,
        warning: true,
        message: `Unknown source version ${sourceVersion}. Attempting best-effort conversion.`
      };
    }

    if (compatibility.compatible.includes(targetFamily)) {
      return {
        compatible: true,
        warning: false,
        message: 'Versions are compatible'
      };
    }

    if (compatibility.warning.includes(targetFamily)) {
      return {
        compatible: true,
        warning: true,
        message: `Converting from ${sourceVersion} to ${targetVersion} may result in some incompatibilities. Please review the pasted element.`
      };
    }

    return {
      compatible: false,
      warning: true,
      message: `Major incompatibility between ${sourceVersion} and ${targetVersion}. Some features may not work correctly.`
    };
  }

  /**
   * Get conversion rules for migrating between versions
   * @param {string} sourceVersion - Source version
   * @param {string} targetVersion - Target version
   * @returns {Array} Array of conversion rules
   */
  getConversionRules(sourceVersion, targetVersion) {
    const rules = [];
    const sourceFamily = this.getVersionFamily(sourceVersion);
    const targetFamily = this.getVersionFamily(targetVersion);

    // No conversion needed for same family
    if (sourceFamily === targetFamily) {
      return rules;
    }

    // Determine migration path
    const migrationKey = `${sourceFamily}_to_${targetFamily}`;
    
    // Add widget type migration rules
    if (this.widgetMigrations[migrationKey]) {
      Object.entries(this.widgetMigrations[migrationKey]).forEach(([oldType, newType]) => {
        rules.push({
          type: 'widget_rename',
          sourcePattern: oldType,
          targetPattern: newType,
          description: `Migrate widget type from ${oldType} to ${newType}`
        });
      });
    }

    // Add setting migration rules for all widgets
    Object.entries(this.settingMigrations).forEach(([widgetType, migrations]) => {
      Object.entries(migrations).forEach(([oldSetting, newSetting]) => {
        rules.push({
          type: 'setting_rename',
          widgetType: widgetType,
          sourcePattern: oldSetting,
          targetPattern: newSetting,
          description: `Migrate ${widgetType} setting from ${oldSetting} to ${newSetting}`
        });
      });
    });

    return rules;
  }

  /**
   * Apply conversion rules to element data
   * @param {object} data - Element data to convert
   * @param {Array} rules - Conversion rules to apply
   * @returns {object} Converted data
   */
  applyConversionRules(data, rules) {
    if (!data || !rules || rules.length === 0) {
      return data;
    }

    // Deep clone to avoid mutating original
    const converted = JSON.parse(JSON.stringify(data));

    rules.forEach(rule => {
      try {
        switch (rule.type) {
          case 'widget_rename':
            this._applyWidgetRename(converted, rule);
            break;
          case 'setting_rename':
            this._applySettingRename(converted, rule);
            break;
          case 'setting_transform':
            this._applySettingTransform(converted, rule);
            break;
          case 'structure_change':
            this._applyStructureChange(converted, rule);
            break;
        }
      } catch (error) {
        console.error('[Version Compatibility] Error applying rule:', rule, error);
      }
    });

    return converted;
  }

  /**
   * Apply widget type rename rule
   * @private
   */
  _applyWidgetRename(data, rule) {
    if (data.widgetType === rule.sourcePattern) {
      data.widgetType = rule.targetPattern;
    }

    // Recursively apply to nested elements
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => this._applyWidgetRename(element, rule));
    }
  }

  /**
   * Apply setting rename rule
   * @private
   */
  _applySettingRename(data, rule) {
    // Only apply if widget type matches (or no widget type specified)
    if (rule.widgetType && data.widgetType !== rule.widgetType) {
      if (data.elements && Array.isArray(data.elements)) {
        data.elements.forEach(element => this._applySettingRename(element, rule));
      }
      return;
    }

    // Rename setting if it exists
    if (data.settings && data.settings.hasOwnProperty(rule.sourcePattern)) {
      data.settings[rule.targetPattern] = data.settings[rule.sourcePattern];
      delete data.settings[rule.sourcePattern];
    }

    // Recursively apply to nested elements
    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => this._applySettingRename(element, rule));
    }
  }

  /**
   * Apply setting transformation rule
   * @private
   */
  _applySettingTransform(data, rule) {
    if (rule.widgetType && data.widgetType !== rule.widgetType) {
      if (data.elements && Array.isArray(data.elements)) {
        data.elements.forEach(element => this._applySettingTransform(element, rule));
      }
      return;
    }

    if (data.settings && data.settings.hasOwnProperty(rule.sourcePattern)) {
      if (rule.transform && typeof rule.transform === 'function') {
        data.settings[rule.sourcePattern] = rule.transform(data.settings[rule.sourcePattern]);
      }
    }

    if (data.elements && Array.isArray(data.elements)) {
      data.elements.forEach(element => this._applySettingTransform(element, rule));
    }
  }

  /**
   * Apply structure change rule
   * @private
   */
  _applyStructureChange(data, rule) {
    // Structure changes are complex and version-specific
    // This is a placeholder for future implementation
    if (rule.transform && typeof rule.transform === 'function') {
      return rule.transform(data);
    }
    return data;
  }

  /**
   * Convert data from source version to target version
   * @param {object} data - Element data to convert
   * @param {string} sourceVersion - Source Elementor version
   * @param {string} targetVersion - Target Elementor version
   * @returns {object} Result with converted data and compatibility info
   */
  convertVersion(data, sourceVersion, targetVersion) {
    const compatibility = this.isCompatible(sourceVersion, targetVersion);
    const rules = this.getConversionRules(sourceVersion, targetVersion);
    const convertedData = this.applyConversionRules(data, rules);

    return {
      data: convertedData,
      compatibility: compatibility,
      rulesApplied: rules.length,
      sourceVersion: sourceVersion,
      targetVersion: targetVersion
    };
  }

  /**
   * Get notification message for version conversion
   * @param {object} conversionResult - Result from convertVersion()
   * @returns {object} Notification object with type and message
   */
  getNotificationMessage(conversionResult) {
    if (!conversionResult.compatibility.compatible) {
      return {
        type: 'error',
        message: conversionResult.compatibility.message
      };
    }

    if (conversionResult.compatibility.warning) {
      return {
        type: 'warning',
        message: conversionResult.compatibility.message
      };
    }

    if (conversionResult.rulesApplied > 0) {
      return {
        type: 'info',
        message: `Element converted from Elementor ${conversionResult.sourceVersion} to ${conversionResult.targetVersion}. ${conversionResult.rulesApplied} compatibility adjustments applied.`
      };
    }

    return {
      type: 'success',
      message: 'Element pasted successfully'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VersionCompatibilityManager };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.VersionCompatibilityManager = VersionCompatibilityManager;
}
