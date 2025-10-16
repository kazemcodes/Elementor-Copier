/**
 * Media URL Handler
 * 
 * Handles media URLs in Elementor elements, ensuring they are preserved
 * and converted to absolute URLs for cross-site compatibility.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

class MediaURLHandler {
  constructor() {
    this.mediaProperties = [
      'url',
      'image.url',
      'background_image.url',
      'background_video_link',
      'video_link',
      'external_link.url',
      'link.url',
      'icon.url',
      'thumbnail.url',
      'poster.url',
      'fallback.url'
    ];
  }

  /**
   * Extract all media URLs from element data
   * Requirement 4.1: Extract all media references
   * 
   * @param {Object} elementData - Elementor element data structure
   * @returns {Array<Object>} Array of {path, url, type} objects
   */
  extractMediaURLs(elementData) {
    const mediaURLs = [];
    
    if (!elementData) {
      return mediaURLs;
    }

    // Recursive function to traverse the element tree
    const traverse = (obj, currentPath = '') => {
      if (!obj || typeof obj !== 'object') {
        return;
      }

      // Check if current object is settings
      if (currentPath.endsWith('.settings') || currentPath === 'settings') {
        this._extractFromSettings(obj, currentPath, mediaURLs);
      }

      // Recursively traverse nested elements
      if (Array.isArray(obj.elements)) {
        obj.elements.forEach((element, index) => {
          traverse(element, `${currentPath}.elements[${index}]`);
        });
      }

      // Traverse all object properties
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'elements') {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            traverse(value, currentPath ? `${currentPath}.${key}` : key);
          }
        }
      }
    };

    traverse(elementData);
    return mediaURLs;
  }

  /**
   * Extract media URLs from settings object
   * @private
   */
  _extractFromSettings(settings, path, mediaURLs) {
    // Check direct URL properties
    if (settings.url && this._isMediaURL(settings.url)) {
      mediaURLs.push({
        path: `${path}.url`,
        url: settings.url,
        type: this._detectMediaType(settings.url)
      });
    }

    // Check nested image objects
    if (settings.image && settings.image.url) {
      mediaURLs.push({
        path: `${path}.image.url`,
        url: settings.image.url,
        type: 'image'
      });
    }

    // Check background image
    if (settings.background_image && settings.background_image.url) {
      mediaURLs.push({
        path: `${path}.background_image.url`,
        url: settings.background_image.url,
        type: 'image'
      });
    }

    // Check video links
    if (settings.background_video_link) {
      mediaURLs.push({
        path: `${path}.background_video_link`,
        url: settings.background_video_link,
        type: 'video'
      });
    }

    if (settings.video_link) {
      mediaURLs.push({
        path: `${path}.video_link`,
        url: settings.video_link,
        type: 'video'
      });
    }

    // Check external links
    if (settings.external_link && settings.external_link.url) {
      mediaURLs.push({
        path: `${path}.external_link.url`,
        url: settings.external_link.url,
        type: 'link'
      });
    }

    if (settings.link && settings.link.url) {
      mediaURLs.push({
        path: `${path}.link.url`,
        url: settings.link.url,
        type: 'link'
      });
    }

    // Check CSS background images in custom CSS
    if (settings._custom_css || settings.custom_css) {
      const css = settings._custom_css || settings.custom_css;
      const cssURLs = this._extractURLsFromCSS(css);
      cssURLs.forEach(url => {
        mediaURLs.push({
          path: `${path}._custom_css`,
          url: url,
          type: 'css-background'
        });
      });
    }
  }

  /**
   * Check if a string is a media URL
   * @private
   */
  _isMediaURL(url) {
    if (typeof url !== 'string' || !url) {
      return false;
    }

    // Check for common media extensions
    const mediaExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|ogg|mp3|wav|pdf)$/i;
    
    // Check for URLs (http/https or protocol-relative)
    const isURL = /^(https?:)?\/\//i.test(url);
    
    return isURL && (mediaExtensions.test(url) || url.includes('/wp-content/uploads/'));
  }

  /**
   * Detect media type from URL
   * @private
   */
  _detectMediaType(url) {
    if (!url) return 'unknown';
    
    const imageExts = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    const videoExts = /\.(mp4|webm|ogg)$/i;
    const audioExts = /\.(mp3|wav|ogg)$/i;
    
    if (imageExts.test(url)) return 'image';
    if (videoExts.test(url)) return 'video';
    if (audioExts.test(url)) return 'audio';
    
    return 'unknown';
  }

  /**
   * Extract URLs from CSS content
   * Requirement 4.4: Handle background images in CSS
   * @private
   */
  _extractURLsFromCSS(css) {
    if (!css) return [];
    
    const urls = [];
    const urlPattern = /url\(['"]?(.*?)['"]?\)/gi;
    let match;
    
    while ((match = urlPattern.exec(css)) !== null) {
      if (match[1] && this._isMediaURL(match[1])) {
        urls.push(match[1]);
      }
    }
    
    return urls;
  }

  /**
   * Convert relative URLs to absolute URLs
   * Requirement 4.2, 4.3: Ensure URLs are absolute and work cross-domain
   * 
   * @param {Array<Object>} mediaURLs - Array of media URL objects from extractMediaURLs
   * @param {string} sourceOrigin - Origin of the source website (e.g., 'https://example.com')
   * @returns {Array<Object>} Array with converted absolute URLs
   */
  convertToAbsoluteURLs(mediaURLs, sourceOrigin) {
    if (!Array.isArray(mediaURLs)) {
      return [];
    }

    return mediaURLs.map(item => {
      const absoluteURL = this._makeAbsoluteURL(item.url, sourceOrigin);
      return {
        ...item,
        originalURL: item.url,
        url: absoluteURL,
        isExternal: this._isExternalURL(absoluteURL, sourceOrigin)
      };
    });
  }

  /**
   * Make a URL absolute
   * @private
   */
  _makeAbsoluteURL(url, sourceOrigin) {
    if (!url) return url;

    // Already absolute
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    // Protocol-relative URL
    if (url.startsWith('//')) {
      const protocol = sourceOrigin.startsWith('https') ? 'https:' : 'http:';
      return `${protocol}${url}`;
    }

    // Relative URL
    try {
      const base = new URL(sourceOrigin);
      const absolute = new URL(url, base.origin);
      return absolute.href;
    } catch (error) {
      console.warn('[Media URL Handler] Failed to convert URL to absolute:', url, error);
      return url;
    }
  }

  /**
   * Check if URL is external to the source origin
   * @private
   */
  _isExternalURL(url, sourceOrigin) {
    try {
      const urlObj = new URL(url);
      const sourceObj = new URL(sourceOrigin);
      return urlObj.origin !== sourceObj.origin;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate URLs for accessibility
   * Requirement 4.3: Check URL accessibility
   * 
   * @param {Array<Object>} mediaURLs - Array of media URL objects
   * @returns {Promise<Array<Object>>} Array with validation results
   */
  async validateURLs(mediaURLs) {
    if (!Array.isArray(mediaURLs)) {
      return [];
    }

    const validationPromises = mediaURLs.map(async (item) => {
      const validation = await this._validateSingleURL(item.url);
      return {
        ...item,
        isValid: validation.isValid,
        statusCode: validation.statusCode,
        error: validation.error
      };
    });

    return Promise.all(validationPromises);
  }

  /**
   * Validate a single URL
   * @private
   */
  async _validateSingleURL(url) {
    try {
      // Use HEAD request to check if URL is accessible
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors', // Avoid CORS issues
        cache: 'no-cache'
      });

      // Note: With no-cors mode, we can't read the status
      // We just check if the request didn't throw
      return {
        isValid: true,
        statusCode: null, // Can't read with no-cors
        error: null
      };
    } catch (error) {
      return {
        isValid: false,
        statusCode: null,
        error: error.message
      };
    }
  }

  /**
   * Update element data with absolute URLs
   * Requirement 4.6: Preserve URLs in Elementor settings
   * 
   * @param {Object} elementData - Elementor element data structure
   * @param {string} sourceOrigin - Origin of the source website
   * @returns {Object} Updated element data with absolute URLs
   */
  updateElementURLs(elementData, sourceOrigin) {
    if (!elementData) {
      return elementData;
    }

    // Clone the data to avoid mutations
    const updatedData = JSON.parse(JSON.stringify(elementData));

    // Extract URLs
    const mediaURLs = this.extractMediaURLs(updatedData);
    
    // Convert to absolute
    const absoluteURLs = this.convertToAbsoluteURLs(mediaURLs, sourceOrigin);

    // Update URLs in the data structure
    absoluteURLs.forEach(item => {
      this._updateURLInObject(updatedData, item.path, item.url);
    });

    return updatedData;
  }

  /**
   * Update a URL at a specific path in an object
   * @private
   */
  _updateURLInObject(obj, path, newURL) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Handle array indices
      const arrayMatch = part.match(/(.+)\[(\d+)\]/);
      if (arrayMatch) {
        const key = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        current = current[key][index];
      } else {
        current = current[part];
      }

      if (!current) return;
    }

    // Set the final value
    const lastPart = parts[parts.length - 1];
    if (current && typeof current === 'object') {
      current[lastPart] = newURL;
    }
  }

  /**
   * Create notification for external media warnings
   * Requirement 4.6, 4.7: Notify users about external media
   * 
   * @param {Array<Object>} mediaURLs - Array of media URL objects with validation
   * @returns {Object} Notification data
   */
  createMediaNotification(mediaURLs) {
    if (!Array.isArray(mediaURLs) || mediaURLs.length === 0) {
      return null;
    }

    const externalURLs = mediaURLs.filter(item => item.isExternal);
    const invalidURLs = mediaURLs.filter(item => item.isValid === false);

    if (externalURLs.length === 0 && invalidURLs.length === 0) {
      return null;
    }

    const notification = {
      type: 'warning',
      title: 'External Media Detected',
      message: this._buildNotificationMessage(externalURLs, invalidURLs),
      mediaURLs: externalURLs,
      invalidURLs: invalidURLs,
      actions: [
        {
          label: 'View Details',
          action: 'show-media-details'
        },
        {
          label: 'Dismiss',
          action: 'dismiss'
        }
      ]
    };

    return notification;
  }

  /**
   * Build notification message
   * @private
   */
  _buildNotificationMessage(externalURLs, invalidURLs) {
    const parts = [];

    if (externalURLs.length > 0) {
      parts.push(
        `Found ${externalURLs.length} external media URL${externalURLs.length > 1 ? 's' : ''}. ` +
        `These URLs point to the source website and may become unavailable if the source site changes or removes them.`
      );
    }

    if (invalidURLs.length > 0) {
      parts.push(
        `${invalidURLs.length} URL${invalidURLs.length > 1 ? 's' : ''} could not be validated. ` +
        `They may not be accessible.`
      );
    }

    parts.push(
      `\n\nRecommendation: Consider uploading these media files to your WordPress media library ` +
      `and updating the URLs in Elementor for better reliability.`
    );

    return parts.join('\n\n');
  }

  /**
   * Get media statistics
   * 
   * @param {Array<Object>} mediaURLs - Array of media URL objects
   * @returns {Object} Statistics about media URLs
   */
  getMediaStatistics(mediaURLs) {
    if (!Array.isArray(mediaURLs)) {
      return {
        total: 0,
        byType: {},
        external: 0,
        invalid: 0
      };
    }

    const stats = {
      total: mediaURLs.length,
      byType: {},
      external: 0,
      invalid: 0
    };

    mediaURLs.forEach(item => {
      // Count by type
      const type = item.type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count external
      if (item.isExternal) {
        stats.external++;
      }

      // Count invalid
      if (item.isValid === false) {
        stats.invalid++;
      }
    });

    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MediaURLHandler };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.MediaURLHandler = MediaURLHandler;
}
