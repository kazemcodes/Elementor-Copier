/**
 * Elementor Format Converter
 * Converts extension data format to Elementor's native clipboard format
 * Includes content sanitization for security
 */

(function () {
  'use strict';

  console.log('[FormatConverter] Module loading - VERSION 2.0');

  /**
   * Base Converter Class
   * All specialized converters should extend this class
   */
  class BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      throw new Error('canConvert() must be implemented by subclass');
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      throw new Error('convert() must be implemented by subclass');
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: this.constructor.name,
        version: '1.0.0',
        author: 'Elementor Copier'
      };
    }
  }

  /**
   * Converter Registry
   * Manages registration and lookup of specialized widget converters
   */
  class ConverterRegistry {
    constructor() {
      this.exactMatchCache = new Map();
      this.patternConverters = [];
    }

    /**
     * Register a converter for one or more widget type patterns
     * @param {Array<string|RegExp>} patterns - Patterns to match widget types
     * @param {BaseConverter} converter - Converter instance
     * @param {number} priority - Higher priority converters checked first (default: 10)
     */
    registerConverter(patterns, converter, priority = 10) {
      if (!Array.isArray(patterns)) {
        patterns = [patterns];
      }

      const entry = {
        patterns,
        converter,
        priority,
        metadata: converter.getMetadata()
      };

      // Insert in priority order (higher priority first)
      const insertIndex = this.patternConverters.findIndex(e => e.priority < priority);
      if (insertIndex === -1) {
        this.patternConverters.push(entry);
      } else {
        this.patternConverters.splice(insertIndex, 0, entry);
      }

      console.log(`[ConverterRegistry] Registered ${converter.constructor.name} with priority ${priority} for patterns:`, patterns);
    }

    /**
     * Get converter for a specific widget type
     * @param {string} widgetType - Widget type to find converter for
     * @returns {BaseConverter|null} Converter instance or null if not found
     */
    getConverter(widgetType) {
      // Check cache first
      if (this.exactMatchCache.has(widgetType)) {
        return this.exactMatchCache.get(widgetType);
      }

      // Pattern matching
      for (const entry of this.patternConverters) {
        if (this.matchesPattern(widgetType, entry.patterns)) {
          this.exactMatchCache.set(widgetType, entry.converter);
          return entry.converter;
        }
      }

      return null;
    }

    /**
     * Check if converter exists for widget type
     * @param {string} widgetType - Widget type to check
     * @returns {boolean} True if converter exists
     */
    hasConverter(widgetType) {
      return this.getConverter(widgetType) !== null;
    }

    /**
     * Check if widget type matches any pattern
     * @param {string} widgetType - Widget type to check
     * @param {Array<string|RegExp>} patterns - Patterns to match against
     * @returns {boolean} True if matches any pattern
     */
    matchesPattern(widgetType, patterns) {
      for (const pattern of patterns) {
        if (pattern instanceof RegExp) {
          if (pattern.test(widgetType)) {
            return true;
          }
        } else if (typeof pattern === 'string') {
          // Exact match
          if (pattern === widgetType) {
            return true;
          }
          // Suffix wildcard (e.g., 'video*' matches 'video-player')
          if (pattern.endsWith('*') && !pattern.startsWith('*')) {
            const prefix = pattern.slice(0, -1);
            if (widgetType.startsWith(prefix)) {
              return true;
            }
          }
          // Prefix wildcard (e.g., '*_video' matches 'wd_video')
          if (pattern.startsWith('*') && !pattern.endsWith('*')) {
            const suffix = pattern.slice(1);
            if (widgetType.endsWith(suffix)) {
              return true;
            }
          }
          // Both prefix and suffix wildcard (e.g., '*video*' matches 'wd_video_player')
          if (pattern.startsWith('*') && pattern.endsWith('*')) {
            const middle = pattern.slice(1, -1);
            if (widgetType.includes(middle)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    /**
     * Clear the exact match cache
     */
    clearCache() {
      this.exactMatchCache.clear();
    }
  }

  /**
   * Conversion Logger
   * Tracks conversion success, warnings, fallbacks, and errors
   */
  class ConversionLogger {
    constructor() {
      this.conversions = [];
      this.fallbacks = [];
      this.errors = [];
      this.warnings = [];
    }

    /**
     * Log successful conversion
     * @param {string} originalType - Original widget type
     * @param {string} convertedType - Converted widget type
     * @param {string} converterName - Name of converter used
     * @param {Object} options - Additional options
     * @param {boolean} options.dataLoss - Whether data loss occurred
     * @param {Array<string>} options.warnings - List of warnings
     */
    logConversionSuccess(originalType, convertedType, converterName, options = {}) {
      const entry = { 
        originalType, 
        convertedType, 
        converterName,
        dataLoss: options.dataLoss || false,
        warnings: options.warnings || []
      };
      this.conversions.push(entry);
      
      if (options.dataLoss && options.warnings && options.warnings.length > 0) {
        console.warn(`[FormatConverter] ⚠ Converted "${originalType}" to "${convertedType}" (${converterName}) with data loss:`, options.warnings);
      } else {
        console.log(`[FormatConverter] ✓ Converted "${originalType}" to "${convertedType}" (${converterName})`);
      }
    }

    /**
     * Log conversion fallback to HTML widget
     * @param {string} originalType - Original widget type
     * @param {string} reason - Reason for fallback
     * @param {boolean} hasRenderedContent - Whether rendered content is available
     */
    logConversionFallback(originalType, reason, hasRenderedContent = true) {
      const entry = { originalType, reason, hasRenderedContent };
      this.fallbacks.push(entry);
      
      if (hasRenderedContent) {
        console.log(`[FormatConverter] ⚠ No converter for "${originalType}", using HTML widget fallback: ${reason}`);
      } else {
        console.warn(`[FormatConverter] ⚠ No converter for "${originalType}" and no rendered content available: ${reason}`);
      }
    }

    /**
     * Log conversion error
     * @param {string} originalType - Original widget type
     * @param {Error} error - Error that occurred
     * @param {Object} element - Element that failed to convert
     */
    logConversionError(originalType, error, element) {
      const entry = { 
        originalType, 
        error: error.message, 
        stack: error.stack,
        elementId: element.id || 'unknown'
      };
      this.errors.push(entry);
      console.error(`[FormatConverter] ✗ Conversion failed for "${originalType}":`, error.message);
      console.error('[FormatConverter] Error details:', error);
    }

    /**
     * Log data loss warning
     * @param {string} originalType - Original widget type
     * @param {Array<string>} lostData - List of data that was lost
     */
    logDataLoss(originalType, lostData) {
      const entry = { originalType, lostData };
      this.warnings.push(entry);
      console.warn(`[FormatConverter] ⚠ Converted "${originalType}" with data loss:`, lostData);
    }

    /**
     * Log summary of all conversions
     * @param {number} totalElements - Total number of elements processed
     */
    logSummary(totalElements) {
      const successCount = this.conversions.filter(c => !c.dataLoss).length;
      const dataLossCount = this.conversions.filter(c => c.dataLoss).length;
      
      console.log(`[FormatConverter] ========== CONVERSION SUMMARY ==========`);
      console.log(`[FormatConverter] Total elements: ${totalElements}`);
      console.log(`[FormatConverter] Successful conversions: ${successCount}`);
      console.log(`[FormatConverter] Conversions with data loss: ${dataLossCount}`);
      console.log(`[FormatConverter] Fallbacks to HTML: ${this.fallbacks.length}`);
      console.log(`[FormatConverter] Errors: ${this.errors.length}`);
      
      if (this.errors.length > 0) {
        console.log(`[FormatConverter] Failed widget types:`, this.errors.map(e => e.originalType));
      }
      
      if (this.fallbacks.length > 0) {
        console.log(`[FormatConverter] Fallback widget types:`, this.fallbacks.map(f => f.originalType));
      }
      
      console.log(`[FormatConverter] ========================================`);
    }

    /**
     * Get conversion statistics
     * @returns {Object} Statistics object
     */
    getStats() {
      return {
        total: this.conversions.length + this.fallbacks.length + this.errors.length,
        conversions: this.conversions.length,
        successfulConversions: this.conversions.filter(c => !c.dataLoss).length,
        conversionsWithDataLoss: this.conversions.filter(c => c.dataLoss).length,
        fallbacks: this.fallbacks.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      };
    }

    /**
     * Reset logger state
     */
    reset() {
      this.conversions = [];
      this.fallbacks = [];
      this.errors = [];
      this.warnings = [];
    }
  }

  /**
   * VideoConverter
   * Handles conversion of video widgets from various themes/plugins
   * Supports YouTube, Vimeo, and self-hosted videos
   */
  class VideoConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches video patterns
      const videoPatterns = ['video', 'player', 'youtube', 'vimeo', 'media-video'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return videoPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract video data
      const videoData = this.extractVideoData(settings, renderedContent);
      
      if (!videoData || !videoData.url) {
        return null;
      }
      
      // Detect video type and create appropriate settings
      const videoType = this.detectVideoType(videoData.url);
      const elementorSettings = this.createElementorVideoSettings(videoData, videoType);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'video',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'VideoConverter',
        dataLoss: false,
        warnings: [],
        source: 'registry',
        videoType: videoType,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract video data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Video data with url and optional properties
     */
    extractVideoData(settings, renderedContent) {
      const videoData = {
        url: null,
        autoplay: false,
        mute: false,
        loop: false,
        controls: true
      };
      
      // Try to extract from settings first
      if (settings.video_url) {
        videoData.url = settings.video_url;
      } else if (settings.youtube_url) {
        videoData.url = settings.youtube_url;
      } else if (settings.vimeo_url) {
        videoData.url = settings.vimeo_url;
      } else if (settings.url) {
        videoData.url = settings.url;
      } else if (settings.src) {
        videoData.url = settings.src;
      } else if (settings.video && typeof settings.video === 'object' && settings.video.url) {
        videoData.url = settings.video.url;
      }
      
      // Extract video options from settings
      if (settings.autoplay !== undefined) {
        videoData.autoplay = !!settings.autoplay;
      }
      if (settings.mute !== undefined) {
        videoData.mute = !!settings.mute;
      }
      if (settings.loop !== undefined) {
        videoData.loop = !!settings.loop;
      }
      if (settings.controls !== undefined) {
        videoData.controls = !!settings.controls;
      }
      
      // If no URL found in settings, try to extract from HTML
      if (!videoData.url && renderedContent) {
        videoData.url = this.extractVideoUrlFromHtml(renderedContent);
      }
      
      return videoData.url ? videoData : null;
    }

    /**
     * Extract video URL from HTML content
     * @param {string} html - HTML content to parse
     * @returns {string|null} Extracted video URL or null
     */
    extractVideoUrlFromHtml(html) {
      if (!html) return null;
      
      // Try to find YouTube iframe
      const youtubeIframeMatch = html.match(/<iframe[^>]+src=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)["']/i);
      if (youtubeIframeMatch) {
        return this.normalizeYouTubeUrl(youtubeIframeMatch[1]);
      }
      
      // Try to find Vimeo iframe
      const vimeoIframeMatch = html.match(/<iframe[^>]+src=["']([^"']*vimeo\.com[^"']*)["']/i);
      if (vimeoIframeMatch) {
        return this.normalizeVimeoUrl(vimeoIframeMatch[1]);
      }
      
      // Try to find video tag with src
      const videoTagMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
      if (videoTagMatch) {
        return videoTagMatch[1];
      }
      
      // Try to find source tag inside video
      const sourceTagMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i);
      if (sourceTagMatch) {
        return sourceTagMatch[1];
      }
      
      // Try to find data attributes with video URLs
      const dataUrlMatch = html.match(/data-(?:video-)?url=["']([^"']+)["']/i);
      if (dataUrlMatch) {
        return dataUrlMatch[1];
      }
      
      return null;
    }

    /**
     * Normalize YouTube URL to standard watch format
     * @param {string} url - YouTube URL (any format)
     * @returns {string} Normalized YouTube URL
     */
    normalizeYouTubeUrl(url) {
      // Extract video ID from various YouTube URL formats
      let videoId = null;
      
      // youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) {
        videoId = watchMatch[1];
      }
      
      // youtube.com/embed/VIDEO_ID
      const embedMatch = url.match(/\/embed\/([^?&/]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
      
      // youtu.be/VIDEO_ID
      const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
      
      // Return normalized URL if video ID found
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      
      return url;
    }

    /**
     * Normalize Vimeo URL to standard format
     * @param {string} url - Vimeo URL (any format)
     * @returns {string} Normalized Vimeo URL
     */
    normalizeVimeoUrl(url) {
      // Extract video ID from various Vimeo URL formats
      let videoId = null;
      
      // vimeo.com/VIDEO_ID or vimeo.com/channels/.../VIDEO_ID
      const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/[^/]+\/|video\/)?(\d+)/);
      if (vimeoMatch) {
        videoId = vimeoMatch[1];
      }
      
      // Return normalized URL if video ID found
      if (videoId) {
        return `https://vimeo.com/${videoId}`;
      }
      
      return url;
    }

    /**
     * Detect video type from URL
     * @param {string} url - Video URL
     * @returns {string} Video type: 'youtube', 'vimeo', or 'hosted'
     */
    detectVideoType(url) {
      if (!url) return 'hosted';
      
      const urlLower = url.toLowerCase();
      
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
      }
      
      if (urlLower.includes('vimeo.com')) {
        return 'vimeo';
      }
      
      return 'hosted';
    }

    /**
     * Create Elementor video widget settings based on video type
     * @param {Object} videoData - Extracted video data
     * @param {string} videoType - Video type (youtube, vimeo, hosted)
     * @returns {Object} Elementor video widget settings
     */
    createElementorVideoSettings(videoData, videoType) {
      const settings = {
        video_type: videoType
      };
      
      // Set URL based on video type
      if (videoType === 'youtube') {
        settings.youtube_url = videoData.url;
        
        // YouTube-specific options
        if (videoData.autoplay) {
          settings.youtube_autoplay = 'yes';
        }
        if (videoData.mute) {
          settings.youtube_mute = 'yes';
        }
        if (videoData.loop) {
          settings.youtube_loop = 'yes';
        }
        if (!videoData.controls) {
          settings.youtube_controls = 'no';
        }
      } else if (videoType === 'vimeo') {
        settings.vimeo_url = videoData.url;
        
        // Vimeo-specific options
        if (videoData.autoplay) {
          settings.vimeo_autoplay = 'yes';
        }
        if (videoData.mute) {
          settings.vimeo_mute = 'yes';
        }
        if (videoData.loop) {
          settings.vimeo_loop = 'yes';
        }
      } else {
        // Self-hosted video
        settings.hosted_url = { url: videoData.url };
        
        // Hosted video options
        if (videoData.autoplay) {
          settings.autoplay = 'yes';
        }
        if (videoData.mute) {
          settings.mute = 'yes';
        }
        if (videoData.loop) {
          settings.loop = 'yes';
        }
        if (!videoData.controls) {
          settings.controls = 'no';
        }
      }
      
      return settings;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'VideoConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'video', 'video-player', 'video-embed', 'youtube', 'vimeo',
          'media-video', 'wd_video', 'custom_video', '*video*', '*player*'
        ]
      };
    }
  }

  /**
   * GalleryConverter
   * Handles conversion of gallery and image grid widgets from various themes/plugins
   * Converts to image-gallery or image-carousel based on image count
   */
  class GalleryConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches gallery patterns
      const galleryPatterns = ['gallery', 'image-grid', 'photo-gallery', 'portfolio-grid', 'images'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return galleryPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract gallery data
      const galleryData = this.extractGalleryData(settings, renderedContent);
      
      if (!galleryData || !galleryData.images || galleryData.images.length === 0) {
        return null;
      }
      
      // Determine widget type based on image count and layout
      const targetWidgetType = this.determineTargetWidgetType(galleryData);
      
      // Create appropriate Elementor settings
      const elementorSettings = this.createElementorGallerySettings(galleryData, targetWidgetType);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: targetWidgetType,
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (galleryData.layoutSettings && Object.keys(galleryData.layoutSettings).length > 0) {
        const unmappedSettings = this.getUnmappedLayoutSettings(galleryData.layoutSettings, targetWidgetType);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some layout settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'GalleryConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        imageCount: galleryData.images.length,
        targetWidgetType: targetWidgetType,
        timestamp: new Date().toISOString()
      };
      
      // Store metadata in settings for easier access
      if (!convertedWidget.settings._meta) {
        convertedWidget.settings._meta = {};
      }
      convertedWidget.settings._meta.imageCount = galleryData.images.length;
      convertedWidget.settings._meta.targetWidgetType = targetWidgetType;
      
      return convertedWidget;
    }

    /**
     * Extract gallery data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Gallery data with images array and optional properties
     */
    extractGalleryData(settings, renderedContent) {
      const galleryData = {
        images: [],
        columns: null,
        spacing: null,
        lightbox: true,
        layoutSettings: {}
      };
      
      // Try to extract from settings first
      const imagesFromSettings = this.extractImagesFromSettings(settings);
      if (imagesFromSettings.length > 0) {
        galleryData.images = imagesFromSettings;
      }
      
      // Extract layout settings from settings
      if (settings.columns !== undefined) {
        galleryData.columns = parseInt(settings.columns) || null;
        galleryData.layoutSettings.columns = settings.columns;
      }
      if (settings.column_gap !== undefined) {
        galleryData.spacing = settings.column_gap;
        galleryData.layoutSettings.column_gap = settings.column_gap;
      }
      if (settings.gap !== undefined) {
        galleryData.spacing = settings.gap;
        galleryData.layoutSettings.gap = settings.gap;
      }
      if (settings.lightbox !== undefined) {
        galleryData.lightbox = !!settings.lightbox;
      }
      if (settings.open_lightbox !== undefined) {
        galleryData.lightbox = settings.open_lightbox === 'yes' || settings.open_lightbox === true;
      }
      
      // Store other layout-related settings for data loss tracking
      const layoutKeys = ['layout', 'image_size', 'aspect_ratio', 'masonry', 'lazyload'];
      layoutKeys.forEach(key => {
        if (settings[key] !== undefined) {
          galleryData.layoutSettings[key] = settings[key];
        }
      });
      
      // If no images found in settings, try to extract from HTML
      if (galleryData.images.length === 0 && renderedContent) {
        const imagesFromHtml = this.extractImagesFromHtml(renderedContent);
        if (imagesFromHtml.length > 0) {
          galleryData.images = imagesFromHtml;
        }
      }
      
      return galleryData.images.length > 0 ? galleryData : null;
    }

    /**
     * Extract images from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of image objects
     */
    extractImagesFromSettings(settings) {
      const images = [];
      
      // Check for various settings structures
      // Format 1: images array with objects
      if (settings.images && Array.isArray(settings.images)) {
        settings.images.forEach(img => {
          if (typeof img === 'object' && img.url) {
            images.push({
              id: img.id || '',
              url: img.url,
              alt: img.alt || '',
              caption: img.caption || ''
            });
          } else if (typeof img === 'string') {
            images.push({
              id: '',
              url: img,
              alt: '',
              caption: ''
            });
          }
        });
      }
      
      // Format 2: gallery_items array
      if (settings.gallery_items && Array.isArray(settings.gallery_items)) {
        settings.gallery_items.forEach(item => {
          if (item.image && item.image.url) {
            images.push({
              id: item.image.id || '',
              url: item.image.url,
              alt: item.image.alt || '',
              caption: item.caption || item.title || ''
            });
          }
        });
      }
      
      // Format 3: attachments array (WordPress media library format)
      if (settings.attachments && Array.isArray(settings.attachments)) {
        settings.attachments.forEach(attachment => {
          if (attachment.url) {
            images.push({
              id: attachment.id || '',
              url: attachment.url,
              alt: attachment.alt || '',
              caption: attachment.caption || ''
            });
          }
        });
      }
      
      // Format 4: gallery object with ids
      if (settings.gallery && Array.isArray(settings.gallery)) {
        settings.gallery.forEach(item => {
          if (typeof item === 'object' && item.url) {
            images.push({
              id: item.id || '',
              url: item.url,
              alt: item.alt || '',
              caption: item.caption || ''
            });
          }
        });
      }
      
      // Format 5: wp_gallery with ids (WordPress shortcode format)
      if (settings.ids && typeof settings.ids === 'string') {
        // This is just IDs, we can't get URLs without WordPress API
        // Skip this format as we need actual URLs
      }
      
      return images;
    }

    /**
     * Extract images from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of image objects
     */
    extractImagesFromHtml(html) {
      if (!html) return [];
      
      const images = [];
      
      // Find all img tags
      const imgRegex = /<img[^>]+>/gi;
      const imgMatches = html.match(imgRegex);
      
      if (!imgMatches) return images;
      
      imgMatches.forEach(imgTag => {
        // Extract src
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (!srcMatch) return;
        
        const url = srcMatch[1];
        
        // Extract alt
        const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
        const alt = altMatch ? altMatch[1] : '';
        
        // Extract data-id if available
        const idMatch = imgTag.match(/data-id=["']([^"']*)["']/i);
        const id = idMatch ? idMatch[1] : '';
        
        // Try to find caption from surrounding elements
        let caption = '';
        
        // Look for figcaption
        const figcaptionRegex = new RegExp(`${imgTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?<figcaption[^>]*>([^<]+)</figcaption>`, 'i');
        const figcaptionMatch = html.match(figcaptionRegex);
        if (figcaptionMatch) {
          caption = figcaptionMatch[1].trim();
        }
        
        // Look for caption class
        if (!caption) {
          const captionRegex = new RegExp(`${imgTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?<[^>]*class=["'][^"']*caption[^"']*["'][^>]*>([^<]+)<`, 'i');
          const captionMatch = html.match(captionRegex);
          if (captionMatch) {
            caption = captionMatch[1].trim();
          }
        }
        
        images.push({
          id: id,
          url: url,
          alt: alt,
          caption: caption
        });
      });
      
      return images;
    }

    /**
     * Determine target widget type based on gallery data
     * @param {Object} galleryData - Extracted gallery data
     * @returns {string} Target widget type: 'image-gallery' or 'image-carousel'
     */
    determineTargetWidgetType(galleryData) {
      const imageCount = galleryData.images.length;
      
      // Use carousel for fewer than 3 images
      if (imageCount < 3) {
        return 'image-carousel';
      }
      
      // Check if layout settings suggest carousel
      if (galleryData.layoutSettings) {
        const layout = galleryData.layoutSettings.layout;
        if (layout && (layout.includes('carousel') || layout.includes('slider') || layout.includes('slide'))) {
          return 'image-carousel';
        }
      }
      
      // Default to gallery for 3+ images
      return 'image-gallery';
    }

    /**
     * Create Elementor gallery widget settings
     * @param {Object} galleryData - Extracted gallery data
     * @param {string} targetWidgetType - Target widget type
     * @returns {Object} Elementor gallery widget settings
     */
    createElementorGallerySettings(galleryData, targetWidgetType) {
      const settings = {};
      
      if (targetWidgetType === 'image-gallery') {
        // Image Gallery settings
        settings.gallery = galleryData.images.map(img => ({
          id: img.id || '',
          url: img.url
        }));
        
        // Gallery-specific settings
        if (galleryData.columns) {
          settings.gallery_columns = galleryData.columns;
        } else {
          settings.gallery_columns = 4; // Default
        }
        
        if (galleryData.spacing !== null) {
          settings.gap = {
            unit: 'px',
            size: galleryData.spacing
          };
        }
        
        // Lightbox
        settings.open_lightbox = galleryData.lightbox ? 'yes' : 'no';
        
        // Link to
        settings.gallery_link = 'file'; // Link to full image
        
        // Image size
        settings.thumbnail_size = 'medium_large';
        
      } else {
        // Image Carousel settings
        settings.carousel = galleryData.images.map(img => ({
          id: img.id || '',
          url: img.url
        }));
        
        // Carousel-specific settings
        settings.slides_to_show = '3';
        settings.slides_to_scroll = '1';
        
        if (galleryData.spacing !== null) {
          settings.image_spacing_custom = {
            unit: 'px',
            size: galleryData.spacing
          };
        }
        
        // Lightbox
        settings.open_lightbox = galleryData.lightbox ? 'yes' : 'no';
        
        // Link to
        settings.link_to = 'file';
        
        // Image size
        settings.thumbnail_size = 'medium_large';
        
        // Autoplay
        settings.autoplay = 'yes';
        settings.autoplay_speed = 5000;
        settings.infinite = 'yes';
        
        // Navigation
        settings.navigation = 'both'; // Arrows and dots
      }
      
      return settings;
    }

    /**
     * Get unmapped layout settings for data loss tracking
     * @param {Object} layoutSettings - Original layout settings
     * @param {string} targetWidgetType - Target widget type
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedLayoutSettings(layoutSettings, targetWidgetType) {
      const unmapped = [];
      
      // Settings that are commonly not mappable
      const commonUnmappable = ['masonry', 'aspect_ratio', 'lazyload', 'image_size'];
      
      Object.keys(layoutSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'GalleryConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'gallery', 'image-gallery', 'image-grid', 'photo-gallery', 
          'portfolio-grid', 'wd_gallery', 'custom_gallery', '*gallery*', '*images*'
        ]
      };
    }
  }

  /**
   * SliderConverter
   * Handles conversion of slider and slideshow widgets from various themes/plugins
   * Converts to Elementor slides widget with individual slide elements
   */
  class SliderConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches slider patterns
      const sliderPatterns = ['slider', 'slideshow', 'carousel', 'swiper', 'slide'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Exclude image carousels (handled by GalleryConverter)
      if (widgetTypeLower.includes('image') && widgetTypeLower.includes('carousel')) {
        return false;
      }
      
      return sliderPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract slider data
      const sliderData = this.extractSliderData(settings, renderedContent);
      
      if (!sliderData || !sliderData.slides || sliderData.slides.length === 0) {
        return null;
      }
      
      // Create Elementor slides widget settings
      const elementorSettings = this.createElementorSlidesSettings(sliderData);
      
      // Create slide elements
      const slideElements = this.createSlideElements(sliderData.slides, context);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'slides',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: slideElements,
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (sliderData.advancedSettings && Object.keys(sliderData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedSliderSettings(sliderData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some slider settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'SliderConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        slideCount: sliderData.slides.length,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract slider data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Slider data with slides array and settings
     */
    extractSliderData(settings, renderedContent) {
      const sliderData = {
        slides: [],
        autoplay: false,
        autoplaySpeed: 5000,
        navigation: true,
        pagination: true,
        loop: true,
        speed: 500,
        advancedSettings: {}
      };
      
      // Try to extract slides from settings first
      const slidesFromSettings = this.extractSlidesFromSettings(settings);
      if (slidesFromSettings.length > 0) {
        sliderData.slides = slidesFromSettings;
      }
      
      // Extract slider settings
      if (settings.autoplay !== undefined) {
        sliderData.autoplay = !!settings.autoplay;
      }
      if (settings.autoplay_speed !== undefined) {
        sliderData.autoplaySpeed = parseInt(settings.autoplay_speed) || 5000;
      }
      if (settings.navigation !== undefined) {
        sliderData.navigation = !!settings.navigation;
      }
      if (settings.arrows !== undefined) {
        sliderData.navigation = !!settings.arrows;
      }
      if (settings.pagination !== undefined) {
        sliderData.pagination = !!settings.pagination;
      }
      if (settings.dots !== undefined) {
        sliderData.pagination = !!settings.dots;
      }
      if (settings.loop !== undefined) {
        sliderData.loop = !!settings.loop;
      }
      if (settings.infinite !== undefined) {
        sliderData.loop = !!settings.infinite;
      }
      if (settings.speed !== undefined) {
        sliderData.speed = parseInt(settings.speed) || 500;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['effect', 'transition', 'easing', 'direction', 'parallax', 'lazy_load'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          sliderData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no slides found in settings, try to extract from HTML
      if (sliderData.slides.length === 0 && renderedContent) {
        const slidesFromHtml = this.extractSlidesFromHtml(renderedContent);
        if (slidesFromHtml.length > 0) {
          sliderData.slides = slidesFromHtml;
        }
      }
      
      return sliderData.slides.length > 0 ? sliderData : null;
    }

    /**
     * Extract slides from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of slide objects
     */
    extractSlidesFromSettings(settings) {
      const slides = [];
      
      // Format 1: slides array with objects
      if (settings.slides && Array.isArray(settings.slides)) {
        settings.slides.forEach(slide => {
          if (typeof slide === 'object') {
            slides.push(this.normalizeSlideData(slide));
          }
        });
      }
      
      // Format 2: items array (common in some themes)
      if (settings.items && Array.isArray(settings.items)) {
        settings.items.forEach(item => {
          if (typeof item === 'object') {
            slides.push(this.normalizeSlideData(item));
          }
        });
      }
      
      // Format 3: slide_content array
      if (settings.slide_content && Array.isArray(settings.slide_content)) {
        settings.slide_content.forEach(content => {
          if (typeof content === 'object') {
            slides.push(this.normalizeSlideData(content));
          }
        });
      }
      
      return slides;
    }

    /**
     * Normalize slide data from various formats
     * @param {Object} slideData - Raw slide data
     * @returns {Object} Normalized slide object
     */
    normalizeSlideData(slideData) {
      const normalized = {
        backgroundImage: null,
        heading: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        backgroundType: 'image'
      };
      
      // Extract background image
      if (slideData.background_image) {
        normalized.backgroundImage = slideData.background_image.url || slideData.background_image;
      } else if (slideData.image) {
        normalized.backgroundImage = slideData.image.url || slideData.image;
      } else if (slideData.bg_image) {
        normalized.backgroundImage = slideData.bg_image.url || slideData.bg_image;
      } else if (slideData.src) {
        normalized.backgroundImage = slideData.src;
      }
      
      // Extract heading
      if (slideData.heading) {
        normalized.heading = slideData.heading;
      } else if (slideData.title) {
        normalized.heading = slideData.title;
      } else if (slideData.headline) {
        normalized.heading = slideData.headline;
      }
      
      // Extract description
      if (slideData.description) {
        normalized.description = slideData.description;
      } else if (slideData.content) {
        normalized.description = slideData.content;
      } else if (slideData.text) {
        normalized.description = slideData.text;
      } else if (slideData.subtitle) {
        normalized.description = slideData.subtitle;
      }
      
      // Extract button
      if (slideData.button_text) {
        normalized.buttonText = slideData.button_text;
      } else if (slideData.btn_text) {
        normalized.buttonText = slideData.btn_text;
      } else if (slideData.cta_text) {
        normalized.buttonText = slideData.cta_text;
      }
      
      if (slideData.button_link) {
        normalized.buttonLink = slideData.button_link.url || slideData.button_link;
      } else if (slideData.link) {
        normalized.buttonLink = slideData.link.url || slideData.link;
      } else if (slideData.url) {
        normalized.buttonLink = slideData.url;
      }
      
      return normalized;
    }

    /**
     * Extract slides from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of slide objects
     */
    extractSlidesFromHtml(html) {
      if (!html) return [];
      
      const slides = [];
      
      // Try to find slide containers with common class patterns
      const slidePatterns = [
        /<div[^>]*class=["'][^"']*slide[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
        /<li[^>]*class=["'][^"']*slide[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,
        /<div[^>]*class=["'][^"']*swiper-slide[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
      ];
      
      for (const pattern of slidePatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          const slideHtml = match[1];
          const slide = this.parseSlideFromHtml(slideHtml);
          if (slide) {
            slides.push(slide);
          }
        }
        
        // If we found slides with this pattern, stop looking
        if (slides.length > 0) {
          break;
        }
      }
      
      return slides;
    }

    /**
     * Parse individual slide from HTML
     * @param {string} slideHtml - HTML content of a single slide
     * @returns {Object|null} Parsed slide object
     */
    parseSlideFromHtml(slideHtml) {
      if (!slideHtml) return null;
      
      const slide = {
        backgroundImage: null,
        heading: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        backgroundType: 'image'
      };
      
      // Extract background image from style attribute or img tag
      const bgStyleMatch = slideHtml.match(/background-image:\s*url\(['"]?([^'"()]+)['"]?\)/i);
      if (bgStyleMatch) {
        slide.backgroundImage = bgStyleMatch[1];
      } else {
        const imgMatch = slideHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          slide.backgroundImage = imgMatch[1];
        }
      }
      
      // Extract heading (h1-h6 tags)
      const headingMatch = slideHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      if (headingMatch) {
        slide.heading = headingMatch[1].trim();
      }
      
      // Extract description (p tags or div with description class)
      const descMatch = slideHtml.match(/<p[^>]*>([^<]+)<\/p>/i);
      if (descMatch) {
        slide.description = descMatch[1].trim();
      } else {
        const descDivMatch = slideHtml.match(/<div[^>]*class=["'][^"']*(?:desc|content|text)[^"']*["'][^>]*>([^<]+)<\/div>/i);
        if (descDivMatch) {
          slide.description = descDivMatch[1].trim();
        }
      }
      
      // Extract button
      const buttonMatch = slideHtml.match(/<(?:a|button)[^>]*>([^<]+)<\/(?:a|button)>/i);
      if (buttonMatch) {
        slide.buttonText = buttonMatch[1].trim();
        
        const hrefMatch = slideHtml.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) {
          slide.buttonLink = hrefMatch[1];
        }
      }
      
      // Only return slide if it has at least an image or heading
      if (slide.backgroundImage || slide.heading) {
        return slide;
      }
      
      return null;
    }

    /**
     * Create Elementor slides widget settings
     * @param {Object} sliderData - Extracted slider data
     * @returns {Object} Elementor slides widget settings
     */
    createElementorSlidesSettings(sliderData) {
      const settings = {};
      
      // Autoplay settings
      if (sliderData.autoplay) {
        settings.autoplay = 'yes';
        settings.autoplay_speed = sliderData.autoplaySpeed;
      } else {
        settings.autoplay = 'no';
      }
      
      // Navigation settings
      if (sliderData.navigation) {
        settings.navigation = 'arrows';
      } else if (sliderData.pagination) {
        settings.navigation = 'dots';
      } else if (sliderData.navigation && sliderData.pagination) {
        settings.navigation = 'both';
      } else {
        settings.navigation = 'none';
      }
      
      // Loop setting
      settings.infinite = sliderData.loop ? 'yes' : 'no';
      
      // Transition speed
      settings.transition_speed = sliderData.speed;
      
      // Default transition
      settings.transition = 'slide';
      
      return settings;
    }

    /**
     * Create individual slide elements for Elementor
     * @param {Array} slides - Array of slide data
     * @param {Object} context - Converter context
     * @returns {Array} Array of slide elements
     */
    createSlideElements(slides, context) {
      return slides.map(slideData => {
        const slideSettings = {
          background_background: 'classic'
        };
        
        // Background image
        if (slideData.backgroundImage) {
          slideSettings.background_image = {
            url: slideData.backgroundImage,
            id: ''
          };
        }
        
        // Heading
        if (slideData.heading) {
          slideSettings.heading = slideData.heading;
        }
        
        // Description
        if (slideData.description) {
          slideSettings.description = slideData.description;
        }
        
        // Button
        if (slideData.buttonText) {
          slideSettings.button_text = slideData.buttonText;
          
          if (slideData.buttonLink) {
            slideSettings.link = {
              url: slideData.buttonLink,
              is_external: '',
              nofollow: ''
            };
          }
        }
        
        // Create slide element
        return {
          elType: 'slide',
          id: context.generateElementId(),
          settings: slideSettings,
          elements: [],
          isInner: false
        };
      });
    }

    /**
     * Get unmapped slider settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedSliderSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor slides
      const commonUnmappable = ['effect', 'parallax', 'lazy_load', 'easing', 'direction'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'SliderConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'slider', 'slideshow', 'carousel', 'swiper', 'slides',
          'wd_slider', 'custom_slider', '*slider*', '*slideshow*', '*swiper*'
        ]
      };
    }
  }

  /**
   * CompositeWidgetConverter
   * Handles conversion of composite widgets with multiple content types
   * (icon boxes, feature boxes, info boxes, service boxes)
   * Converts to icon-box widget or container with individual widgets
   */
  class CompositeWidgetConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches composite widget patterns
      const compositePatterns = ['icon-box', 'icon_box', 'feature-box', 'feature_box', 
                                  'info-box', 'info_box', 'service-box', 'service_box',
                                  'box', 'card'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Exclude widgets that are better handled by other converters (check first)
      const excludePatterns = ['image-box', 'image_box', 'price-box', 'price_box', 
                               'pricing-box', 'pricing_box', 'pricing', 'price-table'];
      const isExcluded = excludePatterns.some(pattern => widgetTypeLower.includes(pattern));
      
      if (isExcluded) {
        return false;
      }
      
      // Must contain one of the patterns
      const matchesPattern = compositePatterns.some(pattern => widgetTypeLower.includes(pattern));
      
      return matchesPattern;
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Analyze widget structure to identify components
      const components = this.analyzeWidgetStructure(settings, renderedContent, context);
      
      if (!components || Object.keys(components).length === 0) {
        return null;
      }
      
      // Determine if structure matches icon-box pattern
      const matchesIconBox = this.matchesIconBoxPattern(components);
      
      if (matchesIconBox) {
        // Convert to icon-box widget
        return this.convertToIconBox(components, element, widgetType, context);
      } else {
        // Fallback to container with individual widgets
        return this.convertToContainer(components, element, widgetType, context);
      }
    }

    /**
     * Analyze widget structure to identify components
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {Object} Identified components
     */
    analyzeWidgetStructure(settings, renderedContent, context) {
      const components = {};
      
      // Extract icon
      const iconData = this.extractIconComponent(settings, renderedContent);
      if (iconData) {
        components.icon = iconData;
      }
      
      // Extract image (if no icon found)
      if (!components.icon) {
        const imageUrl = context.extractImageUrl(settings, renderedContent);
        if (imageUrl) {
          components.image = {
            url: imageUrl,
            id: settings.image?.id || '',
            alt: settings.image?.alt || ''
          };
        }
      }
      
      // Extract heading
      const headingData = this.extractHeadingComponent(settings, renderedContent, context);
      if (headingData && headingData.title) {
        components.heading = headingData;
      }
      
      // Extract description/text
      const textContent = this.extractTextComponent(settings, renderedContent, context);
      if (textContent) {
        components.text = textContent;
      }
      
      // Extract button
      const buttonData = this.extractButtonComponent(settings, renderedContent, context);
      if (buttonData && buttonData.text) {
        components.button = buttonData;
      }
      
      // Detect layout
      components.layout = this.detectLayout(settings, renderedContent);
      
      return components;
    }

    /**
     * Extract icon component from settings or HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Icon data
     */
    extractIconComponent(settings, renderedContent) {
      // Check settings for icon
      if (settings.selected_icon) {
        return settings.selected_icon;
      }
      if (settings.icon) {
        // Handle both string and object formats
        if (typeof settings.icon === 'string') {
          return { value: settings.icon, library: 'fa-solid' };
        }
        return settings.icon;
      }
      if (settings.icon_type && settings.icon_type !== 'none') {
        // Some themes use icon_type with separate icon value
        if (settings.icon_value) {
          return { value: settings.icon_value, library: 'fa-solid' };
        }
      }
      
      // Parse from HTML
      if (renderedContent) {
        // Look for Font Awesome icons
        const faMatch = renderedContent.match(/<i[^>]*class=["']([^"']*(?:fa-|fas |far |fab )[^"']*)["']/i);
        if (faMatch) {
          return { value: faMatch[1].trim(), library: 'fa-solid' };
        }
        
        // Look for other icon classes
        const iconMatch = renderedContent.match(/<i[^>]*class=["']([^"']*icon[^"']*)["']/i);
        if (iconMatch) {
          return { value: iconMatch[1].trim(), library: 'fa-solid' };
        }
        
        // Look for SVG icons
        const svgMatch = renderedContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        if (svgMatch) {
          return { value: svgMatch[0], library: 'svg' };
        }
      }
      
      return null;
    }

    /**
     * Extract heading component from settings or HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {Object|null} Heading data
     */
    extractHeadingComponent(settings, renderedContent, context) {
      // Use context helper for consistency
      const headingData = context.extractHeadingData(settings, renderedContent);
      
      // Also check for title_text which is common in composite widgets
      if (!headingData.title && settings.title_text) {
        headingData.title = settings.title_text;
      }
      
      // Check for heading_text
      if (!headingData.title && settings.heading_text) {
        headingData.title = settings.heading_text;
      }
      
      return headingData.title ? headingData : null;
    }

    /**
     * Extract text/description component from settings or HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {string|null} Text content
     */
    extractTextComponent(settings, renderedContent, context) {
      // Check settings for description
      if (settings.description) {
        return settings.description;
      }
      if (settings.desc) {
        return settings.desc;
      }
      if (settings.content) {
        return settings.content;
      }
      if (settings.text) {
        return settings.text;
      }
      if (settings.description_text) {
        return settings.description_text;
      }
      
      // Parse from HTML - look for paragraph or description div
      if (renderedContent) {
        // Remove heading and button from content first
        let cleanContent = renderedContent;
        cleanContent = cleanContent.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, '');
        cleanContent = cleanContent.replace(/<(?:a|button)[^>]*class=["'][^"']*(?:btn|button)[^"']*["'][^>]*>[\s\S]*?<\/(?:a|button)>/gi, '');
        
        // Look for paragraph
        const pMatch = cleanContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (pMatch) {
          return pMatch[1].trim();
        }
        
        // Look for description div
        const descMatch = cleanContent.match(/<div[^>]*class=["'][^"']*(?:desc|description|content|text)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (descMatch) {
          return descMatch[1].trim();
        }
      }
      
      return null;
    }

    /**
     * Extract button component from settings or HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {Object|null} Button data
     */
    extractButtonComponent(settings, renderedContent, context) {
      // Use context helper for consistency
      const buttonData = context.extractButtonData(settings, renderedContent);
      
      // Also check for btn_text which is common in composite widgets
      if (!buttonData.text && settings.btn_text) {
        buttonData.text = settings.btn_text;
      }
      
      // Check for button_url
      if (!buttonData.link && settings.button_url) {
        buttonData.link = { url: settings.button_url };
      }
      
      // Check for btn_link
      if (!buttonData.link && settings.btn_link) {
        buttonData.link = typeof settings.btn_link === 'string' 
          ? { url: settings.btn_link } 
          : settings.btn_link;
      }
      
      return buttonData.text ? buttonData : null;
    }

    /**
     * Detect layout orientation from settings or HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {string} Layout type: 'horizontal', 'vertical', or 'default'
     */
    detectLayout(settings, renderedContent) {
      // Check settings for explicit layout
      if (settings.layout) {
        const layout = settings.layout.toLowerCase();
        if (layout.includes('horizontal') || layout.includes('left') || layout.includes('right')) {
          return 'horizontal';
        }
        if (layout.includes('vertical') || layout.includes('top') || layout.includes('bottom')) {
          return 'vertical';
        }
      }
      
      // Check for position settings
      if (settings.position) {
        const position = settings.position.toLowerCase();
        if (position === 'left' || position === 'right') {
          return 'horizontal';
        }
        if (position === 'top' || position === 'bottom') {
          return 'vertical';
        }
      }
      
      // Check icon position
      if (settings.icon_position) {
        const iconPos = settings.icon_position.toLowerCase();
        if (iconPos === 'left' || iconPos === 'right') {
          return 'horizontal';
        }
        if (iconPos === 'top' || iconPos === 'bottom') {
          return 'vertical';
        }
      }
      
      // Parse from HTML - look for flex direction or layout classes
      if (renderedContent) {
        if (renderedContent.match(/flex-direction:\s*row/i) || 
            renderedContent.match(/class=["'][^"']*(?:horizontal|row|inline)[^"']*/i)) {
          return 'horizontal';
        }
        if (renderedContent.match(/flex-direction:\s*column/i) || 
            renderedContent.match(/class=["'][^"']*(?:vertical|column|stacked)[^"']*/i)) {
          return 'vertical';
        }
      }
      
      // Default to vertical (most common for icon boxes)
      return 'vertical';
    }

    /**
     * Check if components match icon-box pattern
     * Icon-box requires: (icon OR image) + heading + description
     * Button is optional
     * @param {Object} components - Identified components
     * @returns {boolean} True if matches icon-box pattern
     */
    matchesIconBoxPattern(components) {
      // Must have icon or image
      const hasIconOrImage = !!(components.icon || components.image);
      
      // Must have heading
      const hasHeading = !!components.heading;
      
      // Must have description
      const hasDescription = !!components.text;
      
      // Icon-box pattern: (icon OR image) + heading + description
      // Button is optional
      return hasIconOrImage && hasHeading && hasDescription;
    }

    /**
     * Convert to Elementor icon-box widget
     * @param {Object} components - Identified components
     * @param {Object} element - Original element
     * @param {string} widgetType - Original widget type
     * @param {Object} context - Converter context
     * @returns {Object} Converted icon-box widget
     */
    convertToIconBox(components, element, widgetType, context) {
      const settings = {};
      
      // Icon or Image
      if (components.icon) {
        settings.selected_icon = components.icon;
        settings.view = 'default'; // Can be 'default', 'stacked', or 'framed'
      } else if (components.image) {
        settings.image = {
          url: components.image.url,
          id: components.image.id || '',
          alt: components.image.alt || ''
        };
      }
      
      // Heading
      if (components.heading) {
        settings.title_text = components.heading.title;
        settings.title_size = components.heading.tag || 'h3';
      }
      
      // Description
      if (components.text) {
        settings.description_text = components.text;
      }
      
      // Button (optional)
      if (components.button) {
        settings.link = components.button.link || { url: '' };
        // Note: icon-box doesn't have a separate button, the whole box is clickable
        // If button text is important, we'll note it in warnings
      }
      
      // Position based on layout
      if (components.layout === 'horizontal') {
        settings.position = 'left'; // Icon on left, content on right
      } else {
        settings.position = 'top'; // Icon on top, content below
      }
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'icon-box',
        settings: {
          ...settings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (components.button && components.button.text) {
        warnings.push('Button text was not preserved (icon-box uses the entire box as a link)');
        dataLoss = true;
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'CompositeWidgetConverter',
        conversionType: 'icon-box',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        layout: components.layout,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Convert to container with individual widgets
     * Used when structure doesn't match icon-box pattern or is too complex
     * @param {Object} components - Identified components
     * @param {Object} element - Original element
     * @param {string} widgetType - Original widget type
     * @param {Object} context - Converter context
     * @returns {Object} Converted section with widgets
     */
    convertToContainer(components, element, widgetType, context) {
      const childWidgets = [];
      
      // Create individual widgets for each component
      
      // Icon widget (if present)
      if (components.icon) {
        childWidgets.push({
          elType: 'widget',
          id: context.generateElementId(),
          widgetType: 'icon',
          settings: {
            selected_icon: components.icon,
            view: 'default',
            align: 'center',
            _element_id: '',
            _css_classes: ''
          },
          elements: [],
          isInner: true
        });
      }
      
      // Image widget (if present and no icon)
      if (components.image && !components.icon) {
        childWidgets.push({
          elType: 'widget',
          id: context.generateElementId(),
          widgetType: 'image',
          settings: {
            image: {
              url: components.image.url,
              id: components.image.id || '',
              alt: components.image.alt || ''
            },
            image_size: 'medium',
            align: 'center',
            _element_id: '',
            _css_classes: ''
          },
          elements: [],
          isInner: true
        });
      }
      
      // Heading widget (if present)
      if (components.heading) {
        childWidgets.push({
          elType: 'widget',
          id: context.generateElementId(),
          widgetType: 'heading',
          settings: {
            title: components.heading.title,
            header_size: components.heading.tag || 'h3',
            align: components.heading.align || 'center',
            _element_id: '',
            _css_classes: ''
          },
          elements: [],
          isInner: true
        });
      }
      
      // Text widget (if present)
      if (components.text) {
        childWidgets.push({
          elType: 'widget',
          id: context.generateElementId(),
          widgetType: 'text-editor',
          settings: {
            editor: components.text,
            _element_id: '',
            _css_classes: ''
          },
          elements: [],
          isInner: true
        });
      }
      
      // Button widget (if present)
      if (components.button) {
        childWidgets.push({
          elType: 'widget',
          id: context.generateElementId(),
          widgetType: 'button',
          settings: {
            text: components.button.text,
            link: components.button.link || { url: '' },
            align: components.button.align || 'center',
            _element_id: '',
            _css_classes: ''
          },
          elements: [],
          isInner: true
        });
      }
      
      // Create column to hold widgets
      const column = {
        elType: 'column',
        id: context.generateElementId(),
        settings: {
          _column_size: 100,
          _inline_size: null,
          _element_id: '',
          _css_classes: ''
        },
        elements: childWidgets,
        isInner: true
      };
      
      // Determine section structure based on layout
      let sectionSettings = {
        layout: 'boxed',
        content_width: 'full',
        _element_id: '',
        _css_classes: `converted-from-${widgetType.replace(/\./g, '-')} composite-fallback`
      };
      
      if (components.layout === 'horizontal') {
        // For horizontal layout, we could split into multiple columns
        // But for simplicity, we'll use a single column with horizontal alignment
        sectionSettings.content_position = 'middle';
      }
      
      // Create section
      const convertedSection = {
        elType: 'section',
        id: context.generateElementId(),
        settings: sectionSettings,
        elements: [column],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [
        'Complex structure converted to container with individual widgets',
        'Original layout may not be fully preserved'
      ];
      
      convertedSection._conversionMeta = {
        originalType: widgetType,
        converter: 'CompositeWidgetConverter',
        conversionType: 'container',
        dataLoss: true,
        warnings: warnings,
        source: 'registry',
        layout: components.layout,
        componentCount: childWidgets.length,
        timestamp: new Date().toISOString()
      };
      
      return convertedSection;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'CompositeWidgetConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'icon-box', 'icon_box', 'feature-box', 'feature_box',
          'info-box', 'info_box', 'service-box', 'service_box',
          '*-box', '*_box', '*box*', 'card', '*card*'
        ]
      };
    }
  }

  /**
   * FormConverter
   * Handles conversion of form widgets from various themes/plugins
   * Converts to Elementor form widget with field definitions
   * Note: Form submission handlers cannot be fully preserved (requires backend)
   */
  class FormConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches form patterns
      const formPatterns = ['form', 'contact-form', 'contact_form', 'cf7', 'gravity', 'wpforms', 'ninja-form'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return formPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract form data
      const formData = this.extractFormData(settings, renderedContent);
      
      if (!formData || !formData.fields || formData.fields.length === 0) {
        return null;
      }
      
      // Create Elementor form widget settings
      const elementorSettings = this.createElementorFormSettings(formData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'form',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata with warnings about form submission
      const warnings = [
        'Form submission handler may need reconfiguration on target site',
        'Backend form processing logic cannot be transferred automatically'
      ];
      let dataLoss = false;
      
      // Check for data loss
      if (formData.advancedSettings && Object.keys(formData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedFormSettings(formData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some form settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      // Always warn about submission handlers
      if (formData.actionUrl || formData.emailRecipient) {
        warnings.push('Form action URL or email recipient preserved but may require reconnection');
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'FormConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        fieldCount: formData.fields.length,
        timestamp: new Date().toISOString()
      };
      
      // Log warning about form submission handler limitations
      context.logger.logDataLoss(widgetType, [
        'Form submission handlers require backend configuration',
        'Action URLs and email recipients may need to be updated'
      ]);
      
      return convertedWidget;
    }

    /**
     * Extract form data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Form data with fields array and settings
     */
    extractFormData(settings, renderedContent) {
      const formData = {
        fields: [],
        actionUrl: null,
        emailRecipient: null,
        submitButtonText: 'Submit',
        advancedSettings: {}
      };
      
      // Try to extract fields from settings first
      const fieldsFromSettings = this.extractFieldsFromSettings(settings);
      if (fieldsFromSettings.length > 0) {
        formData.fields = fieldsFromSettings;
      }
      
      // Extract form action settings
      if (settings.form_action) {
        formData.actionUrl = settings.form_action;
      } else if (settings.action) {
        formData.actionUrl = settings.action;
      } else if (settings.action_url) {
        formData.actionUrl = settings.action_url;
      }
      
      // Extract email recipient
      if (settings.email_to) {
        formData.emailRecipient = settings.email_to;
      } else if (settings.recipient_email) {
        formData.emailRecipient = settings.recipient_email;
      } else if (settings.email) {
        formData.emailRecipient = settings.email;
      }
      
      // Extract submit button text
      if (settings.submit_button_text) {
        formData.submitButtonText = settings.submit_button_text;
      } else if (settings.button_text) {
        formData.submitButtonText = settings.button_text;
      } else if (settings.submit_text) {
        formData.submitButtonText = settings.submit_text;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['redirect_url', 'success_message', 'error_message', 'validation', 'captcha', 'honeypot'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          formData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no fields found in settings, try to extract from HTML
      if (formData.fields.length === 0 && renderedContent) {
        const fieldsFromHtml = this.extractFieldsFromHtml(renderedContent);
        if (fieldsFromHtml.length > 0) {
          formData.fields = fieldsFromHtml;
        }
        
        // Try to extract action URL from form tag
        if (!formData.actionUrl) {
          const actionMatch = renderedContent.match(/<form[^>]+action=["']([^"']+)["']/i);
          if (actionMatch) {
            formData.actionUrl = actionMatch[1];
          }
        }
        
        // Try to extract submit button text
        // First try input with value attribute
        let submitMatch = renderedContent.match(/<input[^>]*type=["']submit["'][^>]*value=["']([^"']+)["']/i);
        if (submitMatch) {
          formData.submitButtonText = submitMatch[1].trim();
        } else {
          // Try button with text content
          submitMatch = renderedContent.match(/<button[^>]*type=["']submit["'][^>]*>([^<]+)<\/button>/i);
          if (submitMatch) {
            formData.submitButtonText = submitMatch[1].trim();
          }
        }
      }
      
      return formData.fields.length > 0 ? formData : null;
    }

    /**
     * Extract form fields from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of field objects
     */
    extractFieldsFromSettings(settings) {
      const fields = [];
      
      // Format 1: fields array with objects
      if (settings.fields && Array.isArray(settings.fields)) {
        settings.fields.forEach(field => {
          if (typeof field === 'object') {
            fields.push(this.normalizeFieldData(field));
          }
        });
      }
      
      // Format 2: form_fields array
      if (settings.form_fields && Array.isArray(settings.form_fields)) {
        settings.form_fields.forEach(field => {
          if (typeof field === 'object') {
            fields.push(this.normalizeFieldData(field));
          }
        });
      }
      
      // Format 3: inputs array (Gravity Forms style)
      if (settings.inputs && Array.isArray(settings.inputs)) {
        settings.inputs.forEach(input => {
          if (typeof input === 'object') {
            fields.push(this.normalizeFieldData(input));
          }
        });
      }
      
      return fields;
    }

    /**
     * Normalize field data from various formats
     * @param {Object} fieldData - Raw field data
     * @returns {Object} Normalized field object
     */
    normalizeFieldData(fieldData) {
      const normalized = {
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        name: '',
        options: []
      };
      
      // Extract field type
      if (fieldData.type) {
        normalized.type = this.mapFieldType(fieldData.type);
      } else if (fieldData.field_type) {
        normalized.type = this.mapFieldType(fieldData.field_type);
      } else if (fieldData.inputType) {
        normalized.type = this.mapFieldType(fieldData.inputType);
      }
      
      // Extract label
      if (fieldData.label) {
        normalized.label = fieldData.label;
      } else if (fieldData.field_label) {
        normalized.label = fieldData.field_label;
      } else if (fieldData.title) {
        normalized.label = fieldData.title;
      }
      
      // Extract placeholder
      if (fieldData.placeholder) {
        normalized.placeholder = fieldData.placeholder;
      } else if (fieldData.field_placeholder) {
        normalized.placeholder = fieldData.field_placeholder;
      }
      
      // Extract required flag
      if (fieldData.required !== undefined) {
        normalized.required = !!fieldData.required;
      } else if (fieldData.is_required !== undefined) {
        normalized.required = !!fieldData.is_required;
      } else if (fieldData.isRequired !== undefined) {
        normalized.required = !!fieldData.isRequired;
      }
      
      // Extract field name
      if (fieldData.name) {
        normalized.name = fieldData.name;
      } else if (fieldData.field_name) {
        normalized.name = fieldData.field_name;
      } else if (fieldData.id) {
        normalized.name = fieldData.id;
      } else {
        // Generate name from label
        normalized.name = normalized.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      }
      
      // Extract options for select/radio/checkbox fields
      if (fieldData.options && Array.isArray(fieldData.options)) {
        normalized.options = fieldData.options.map(opt => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          } else if (typeof opt === 'object') {
            return {
              label: opt.label || opt.text || opt.value || '',
              value: opt.value || opt.label || opt.text || ''
            };
          }
          return { label: '', value: '' };
        });
      } else if (fieldData.choices && Array.isArray(fieldData.choices)) {
        normalized.options = fieldData.choices.map(choice => ({
          label: choice.text || choice.label || choice.value || '',
          value: choice.value || choice.text || choice.label || ''
        }));
      }
      
      return normalized;
    }

    /**
     * Map field type to Elementor form field type
     * @param {string} fieldType - Original field type
     * @returns {string} Elementor field type
     */
    mapFieldType(fieldType) {
      const typeMap = {
        // Text inputs
        'text': 'text',
        'input': 'text',
        'textfield': 'text',
        'text_field': 'text',
        
        // Email
        'email': 'email',
        'email_field': 'email',
        
        // Textarea
        'textarea': 'textarea',
        'text_area': 'textarea',
        'message': 'textarea',
        
        // Number
        'number': 'number',
        'numeric': 'number',
        
        // Tel
        'tel': 'tel',
        'phone': 'tel',
        'telephone': 'tel',
        
        // URL
        'url': 'url',
        'website': 'url',
        
        // Select
        'select': 'select',
        'dropdown': 'select',
        'select_field': 'select',
        
        // Radio
        'radio': 'radio',
        'radio_button': 'radio',
        'radio_buttons': 'radio',
        
        // Checkbox
        'checkbox': 'checkbox',
        'checkboxes': 'checkbox',
        
        // Date
        'date': 'date',
        'date_field': 'date',
        
        // Time
        'time': 'time',
        'time_field': 'time',
        
        // File upload
        'file': 'upload',
        'upload': 'upload',
        'file_upload': 'upload',
        
        // Hidden
        'hidden': 'hidden',
        
        // Acceptance (terms)
        'acceptance': 'acceptance',
        'terms': 'acceptance',
        'agree': 'acceptance'
      };
      
      const normalizedType = fieldType.toLowerCase().replace(/[-\s]/g, '_');
      return typeMap[normalizedType] || 'text';
    }

    /**
     * Extract form fields from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of field objects
     */
    extractFieldsFromHtml(html) {
      if (!html) return [];
      
      const fields = [];
      
      // Find all input fields
      const inputRegex = /<input[^>]*>/gi;
      const inputMatches = html.match(inputRegex);
      
      if (inputMatches) {
        inputMatches.forEach(inputTag => {
          // Skip submit buttons and hidden fields (unless they're important)
          const typeMatch = inputTag.match(/type=["']([^"']+)["']/i);
          const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';
          
          if (type === 'submit' || type === 'button') {
            return; // Skip submit buttons
          }
          
          const field = this.parseInputField(inputTag, type);
          if (field) {
            fields.push(field);
          }
        });
      }
      
      // Find all textarea fields
      const textareaRegex = /<textarea[^>]*>[\s\S]*?<\/textarea>/gi;
      const textareaMatches = html.match(textareaRegex);
      
      if (textareaMatches) {
        textareaMatches.forEach(textareaTag => {
          const field = this.parseTextareaField(textareaTag);
          if (field) {
            fields.push(field);
          }
        });
      }
      
      // Find all select fields
      const selectRegex = /<select[^>]*>[\s\S]*?<\/select>/gi;
      const selectMatches = html.match(selectRegex);
      
      if (selectMatches) {
        selectMatches.forEach(selectTag => {
          const field = this.parseSelectField(selectTag);
          if (field) {
            fields.push(field);
          }
        });
      }
      
      return fields;
    }

    /**
     * Parse input field from HTML tag
     * @param {string} inputTag - Input HTML tag
     * @param {string} type - Input type
     * @returns {Object|null} Parsed field object
     */
    parseInputField(inputTag, type) {
      const field = {
        type: this.mapFieldType(type),
        label: '',
        placeholder: '',
        required: false,
        name: '',
        options: []
      };
      
      // Extract name
      const nameMatch = inputTag.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        field.name = nameMatch[1];
        // Use name as label if no label found
        field.label = nameMatch[1].replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Extract placeholder
      const placeholderMatch = inputTag.match(/placeholder=["']([^"']+)["']/i);
      if (placeholderMatch) {
        field.placeholder = placeholderMatch[1];
        // Use placeholder as label if no label
        if (!field.label) {
          field.label = placeholderMatch[1];
        }
      }
      
      // Extract required
      if (inputTag.match(/required/i)) {
        field.required = true;
      }
      
      // Extract aria-label as fallback for label
      if (!field.label) {
        const ariaLabelMatch = inputTag.match(/aria-label=["']([^"']+)["']/i);
        if (ariaLabelMatch) {
          field.label = ariaLabelMatch[1];
        }
      }
      
      return field.name ? field : null;
    }

    /**
     * Parse textarea field from HTML tag
     * @param {string} textareaTag - Textarea HTML tag
     * @returns {Object|null} Parsed field object
     */
    parseTextareaField(textareaTag) {
      const field = {
        type: 'textarea',
        label: '',
        placeholder: '',
        required: false,
        name: '',
        options: []
      };
      
      // Extract name
      const nameMatch = textareaTag.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        field.name = nameMatch[1];
        field.label = nameMatch[1].replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Extract placeholder
      const placeholderMatch = textareaTag.match(/placeholder=["']([^"']+)["']/i);
      if (placeholderMatch) {
        field.placeholder = placeholderMatch[1];
        if (!field.label) {
          field.label = placeholderMatch[1];
        }
      }
      
      // Extract required
      if (textareaTag.match(/required/i)) {
        field.required = true;
      }
      
      return field.name ? field : null;
    }

    /**
     * Parse select field from HTML tag
     * @param {string} selectTag - Select HTML tag
     * @returns {Object|null} Parsed field object
     */
    parseSelectField(selectTag) {
      const field = {
        type: 'select',
        label: '',
        placeholder: '',
        required: false,
        name: '',
        options: []
      };
      
      // Extract name
      const nameMatch = selectTag.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        field.name = nameMatch[1];
        field.label = nameMatch[1].replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Extract required
      if (selectTag.match(/required/i)) {
        field.required = true;
      }
      
      // Extract options
      const optionRegex = /<option[^>]*>([^<]+)<\/option>/gi;
      const optionMatches = selectTag.matchAll(optionRegex);
      
      for (const match of optionMatches) {
        const optionText = match[1].trim();
        const valueMatch = match[0].match(/value=["']([^"']+)["']/i);
        const optionValue = valueMatch ? valueMatch[1] : optionText;
        
        // Skip empty or placeholder options
        if (optionText && optionText.toLowerCase() !== 'select' && optionText !== '---') {
          field.options.push({
            label: optionText,
            value: optionValue
          });
        }
      }
      
      return field.name ? field : null;
    }

    /**
     * Create Elementor form widget settings
     * @param {Object} formData - Extracted form data
     * @returns {Object} Elementor form widget settings
     */
    createElementorFormSettings(formData) {
      const settings = {
        form_name: 'Converted Form',
        form_fields: [],
        submit_button_text: formData.submitButtonText || 'Submit',
        button_width: 'auto'
      };
      
      // Convert fields to Elementor format
      formData.fields.forEach((field, index) => {
        const elementorField = {
          custom_id: field.name || `field_${index + 1}`,
          field_type: field.type,
          field_label: field.label || `Field ${index + 1}`,
          placeholder: field.placeholder || '',
          required: field.required ? 'true' : 'false',
          width: '100'
        };
        
        // Add options for select/radio/checkbox fields
        if (field.options && field.options.length > 0) {
          elementorField.field_options = field.options.map(opt => 
            `${opt.label}|${opt.value}`
          ).join('\n');
        }
        
        settings.form_fields.push(elementorField);
      });
      
      // Add email action if recipient is available
      if (formData.emailRecipient) {
        settings.email_to = formData.emailRecipient;
        settings.email_subject = '[Converted Form] New Submission';
        settings.email_content = '[all-fields]';
      }
      
      // Add redirect if action URL is available
      if (formData.actionUrl) {
        settings.redirect_url = formData.actionUrl;
      }
      
      // Success message
      settings.success_message = formData.advancedSettings.success_message || 'Thank you! Your form has been submitted.';
      
      // Error message
      settings.error_message = formData.advancedSettings.error_message || 'There was an error submitting the form. Please try again.';
      
      return settings;
    }

    /**
     * Get unmapped form settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedFormSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor forms
      const commonUnmappable = ['captcha', 'honeypot', 'validation', 'conditional_logic'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'FormConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'form', 'contact-form', 'contact_form', 'cf7', 'contact-form-7',
          'gravity-form', 'gravityform', 'wpforms', 'ninja-form', 'ninja_form',
          '*form*', '*contact*'
        ]
      };
    }
  }

  // Create global converter registry and logger
  const converterRegistry = new ConverterRegistry();
  const conversionLogger = new ConversionLogger();

  // Register VideoConverter
  const videoConverter = new VideoConverter();
  converterRegistry.registerConverter(
    ['*video*', '*player*', '*youtube*', '*vimeo*'],
    videoConverter,
    10
  );

  // Register GalleryConverter
  const galleryConverter = new GalleryConverter();
  converterRegistry.registerConverter(
    ['*gallery*', '*image-grid*', '*photo-gallery*', '*portfolio-grid*', '*images*'],
    galleryConverter,
    10
  );

  // Register SliderConverter
  const sliderConverter = new SliderConverter();
  converterRegistry.registerConverter(
    ['*slider*', '*slideshow*', '*swiper*', '*slide*'],
    sliderConverter,
    10
  );

  // Register CompositeWidgetConverter
  const compositeWidgetConverter = new CompositeWidgetConverter();
  converterRegistry.registerConverter(
    ['*icon-box*', '*icon_box*', '*feature-box*', '*feature_box*', 
     '*info-box*', '*info_box*', '*service-box*', '*service_box*',
     '*-box', '*_box', '*card*'],
    compositeWidgetConverter,
    10
  );

  // Register FormConverter
  const formConverter = new FormConverter();
  converterRegistry.registerConverter(
    ['*form*', '*contact*', '*cf7*', '*gravity*', '*wpforms*', '*ninja*'],
    formConverter,
    10
  );

  /**
   * IconListConverter
   * Handles conversion of icon list and feature list widgets from various themes/plugins
   * Converts to Elementor icon-list widget with list items
   */
  class IconListConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches icon list patterns
      const iconListPatterns = ['icon-list', 'icon_list', 'feature-list', 'feature_list', 
                                 'checklist', 'check-list', 'list-icon', 'list_icon'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Must contain one of the patterns
      const matchesPattern = iconListPatterns.some(pattern => widgetTypeLower.includes(pattern));
      
      // Exclude icon-box widgets (handled by CompositeWidgetConverter)
      if (widgetTypeLower.includes('icon-box') || widgetTypeLower.includes('icon_box')) {
        return false;
      }
      
      return matchesPattern;
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract icon list data
      const iconListData = this.extractIconListData(settings, renderedContent, context);
      
      if (!iconListData || !iconListData.items || iconListData.items.length === 0) {
        return null;
      }
      
      // Create Elementor icon-list widget settings
      const elementorSettings = this.createElementorIconListSettings(iconListData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'icon-list',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (iconListData.advancedSettings && Object.keys(iconListData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedIconListSettings(iconListData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some icon list settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'IconListConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        itemCount: iconListData.items.length,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract icon list data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {Object|null} Icon list data with items array and settings
     */
    extractIconListData(settings, renderedContent, context) {
      const iconListData = {
        items: [],
        layout: 'traditional',
        iconPosition: 'left',
        advancedSettings: {}
      };
      
      // Try to extract items from settings first
      const itemsFromSettings = this.extractItemsFromSettings(settings, context);
      if (itemsFromSettings.length > 0) {
        iconListData.items = itemsFromSettings;
      }
      
      // Extract layout settings
      if (settings.layout !== undefined) {
        iconListData.layout = settings.layout;
        iconListData.advancedSettings.layout = settings.layout;
      }
      if (settings.icon_position !== undefined) {
        iconListData.iconPosition = settings.icon_position;
      }
      if (settings.icon_align !== undefined) {
        iconListData.iconPosition = settings.icon_align === 'right' ? 'right' : 'left';
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['icon_size', 'icon_color', 'text_color', 'divider', 'space_between'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          iconListData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no items found in settings, try to extract from HTML
      if (iconListData.items.length === 0 && renderedContent) {
        const itemsFromHtml = this.extractItemsFromHtml(renderedContent);
        if (itemsFromHtml.length > 0) {
          iconListData.items = itemsFromHtml;
        }
      }
      
      return iconListData.items.length > 0 ? iconListData : null;
    }

    /**
     * Extract list items from settings object
     * @param {Object} settings - Widget settings
     * @param {Object} context - Converter context
     * @returns {Array} Array of item objects
     */
    extractItemsFromSettings(settings, context) {
      const items = [];
      
      // Format 1: items array with objects
      if (settings.items && Array.isArray(settings.items)) {
        settings.items.forEach(item => {
          if (typeof item === 'object') {
            items.push(this.normalizeItemData(item, context));
          }
        });
      }
      
      // Format 2: list_items array
      if (settings.list_items && Array.isArray(settings.list_items)) {
        settings.list_items.forEach(item => {
          if (typeof item === 'object') {
            items.push(this.normalizeItemData(item, context));
          }
        });
      }
      
      // Format 3: features array (common in feature lists)
      if (settings.features && Array.isArray(settings.features)) {
        settings.features.forEach(item => {
          if (typeof item === 'object') {
            items.push(this.normalizeItemData(item, context));
          }
        });
      }
      
      // Format 4: icon_list array
      if (settings.icon_list && Array.isArray(settings.icon_list)) {
        settings.icon_list.forEach(item => {
          if (typeof item === 'object') {
            items.push(this.normalizeItemData(item, context));
          }
        });
      }
      
      return items;
    }

    /**
     * Normalize item data from various formats
     * @param {Object} itemData - Raw item data
     * @param {Object} context - Converter context
     * @returns {Object} Normalized item object
     */
    normalizeItemData(itemData, context) {
      const normalized = {
        icon: null,
        text: '',
        link: null
      };
      
      // Extract icon
      if (itemData.icon) {
        if (typeof itemData.icon === 'string') {
          normalized.icon = { value: itemData.icon, library: 'fa-solid' };
        } else if (typeof itemData.icon === 'object') {
          normalized.icon = itemData.icon;
        }
      } else if (itemData.selected_icon) {
        normalized.icon = itemData.selected_icon;
      } else if (itemData.icon_class) {
        normalized.icon = { value: itemData.icon_class, library: 'fa-solid' };
      }
      
      // Extract text
      if (itemData.text) {
        normalized.text = itemData.text;
      } else if (itemData.title) {
        normalized.text = itemData.title;
      } else if (itemData.label) {
        normalized.text = itemData.label;
      } else if (itemData.content) {
        normalized.text = itemData.content;
      }
      
      // Extract link
      if (itemData.link) {
        if (typeof itemData.link === 'string') {
          normalized.link = { url: itemData.link, is_external: '', nofollow: '' };
        } else if (typeof itemData.link === 'object' && itemData.link.url) {
          normalized.link = itemData.link;
        }
      } else if (itemData.url) {
        normalized.link = { url: itemData.url, is_external: '', nofollow: '' };
      } else if (itemData.href) {
        normalized.link = { url: itemData.href, is_external: '', nofollow: '' };
      }
      
      return normalized;
    }

    /**
     * Extract list items from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of item objects
     */
    extractItemsFromHtml(html) {
      if (!html) return [];
      
      const items = [];
      
      // Try to find list items with common patterns
      // Pattern 1: <li> tags with icons
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      const liMatches = html.matchAll(liRegex);
      
      for (const match of liMatches) {
        const itemHtml = match[1];
        const item = this.parseItemFromHtml(itemHtml);
        if (item && item.text) {
          items.push(item);
        }
      }
      
      // If no <li> tags found, try <div> with icon classes
      if (items.length === 0) {
        const divRegex = /<div[^>]*class=["'][^"']*(?:icon-list-item|list-item|feature-item)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
        const divMatches = html.matchAll(divRegex);
        
        for (const match of divMatches) {
          const itemHtml = match[1];
          const item = this.parseItemFromHtml(itemHtml);
          if (item && item.text) {
            items.push(item);
          }
        }
      }
      
      return items;
    }

    /**
     * Parse individual list item from HTML
     * @param {string} itemHtml - HTML content of a single item
     * @returns {Object|null} Parsed item object
     */
    parseItemFromHtml(itemHtml) {
      if (!itemHtml) return null;
      
      const item = {
        icon: null,
        text: '',
        link: null
      };
      
      // Extract icon from <i> tag or SVG
      const iconMatch = itemHtml.match(/<i[^>]*class=["']([^"']*(?:fa-|fas |far |fab |icon)[^"']*)["']/i);
      if (iconMatch) {
        item.icon = { value: iconMatch[1].trim(), library: 'fa-solid' };
      } else {
        // Try to find SVG icon
        const svgMatch = itemHtml.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        if (svgMatch) {
          item.icon = { value: svgMatch[0], library: 'svg' };
        }
      }
      
      // Extract text content
      // Remove icon HTML first
      let textContent = itemHtml.replace(/<i[^>]*>[\s\S]*?<\/i>/gi, '');
      textContent = textContent.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
      
      // Try to find text in <span>, <div>, or direct text
      const spanMatch = textContent.match(/<span[^>]*>([^<]+)<\/span>/i);
      if (spanMatch) {
        item.text = spanMatch[1].trim();
      } else {
        const divMatch = textContent.match(/<div[^>]*>([^<]+)<\/div>/i);
        if (divMatch) {
          item.text = divMatch[1].trim();
        } else {
          // Extract plain text (remove all HTML tags)
          item.text = textContent.replace(/<[^>]+>/g, '').trim();
        }
      }
      
      // Extract link
      const linkMatch = itemHtml.match(/<a[^>]*href=["']([^"']+)["']/i);
      if (linkMatch) {
        item.link = { url: linkMatch[1], is_external: '', nofollow: '' };
      }
      
      return item.text ? item : null;
    }

    /**
     * Create Elementor icon-list widget settings
     * @param {Object} iconListData - Extracted icon list data
     * @returns {Object} Elementor icon-list widget settings
     */
    createElementorIconListSettings(iconListData) {
      const settings = {
        icon_list: [],
        view: iconListData.layout || 'traditional',
        layout: 'traditional'
      };
      
      // Convert items to Elementor format
      iconListData.items.forEach((item, index) => {
        const elementorItem = {
          text: item.text || `Item ${index + 1}`
        };
        
        // Add icon if available
        if (item.icon) {
          elementorItem.selected_icon = item.icon;
        } else {
          // Default to a checkmark icon if no icon provided
          elementorItem.selected_icon = { value: 'fas fa-check', library: 'fa-solid' };
        }
        
        // Add link if available
        if (item.link) {
          elementorItem.link = item.link;
        } else {
          elementorItem.link = { url: '', is_external: '', nofollow: '' };
        }
        
        // Add unique ID for the item
        elementorItem._id = this.generateItemId();
        
        settings.icon_list.push(elementorItem);
      });
      
      // Set icon position
      if (iconListData.iconPosition) {
        settings.icon_align = iconListData.iconPosition === 'right' ? 'right' : 'left';
      }
      
      return settings;
    }

    /**
     * Generate unique ID for list item
     * @returns {string} 7-character alphanumeric ID
     */
    generateItemId() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
      let id = '';
      for (let i = 0; i < 7; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }
      return id;
    }

    /**
     * Get unmapped icon list settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedIconListSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor icon-list
      const commonUnmappable = ['animation', 'hover_animation', 'icon_hover_color'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'IconListConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'icon-list', 'icon_list', 'feature-list', 'feature_list',
          'checklist', 'check-list', 'list-icon', 'list_icon',
          'wd_icon_list', 'custom_icon_list', '*icon-list*', '*icon_list*'
        ]
      };
    }
  }

  // Register IconListConverter
  const iconListConverter = new IconListConverter();
  converterRegistry.registerConverter(
    ['*icon-list*', '*icon_list*', '*feature-list*', '*feature_list*', 
     '*checklist*', '*check-list*', '*list-icon*', '*list_icon*'],
    iconListConverter,
    10
  );

  /**
   * TestimonialConverter
   * Handles conversion of testimonial and review widgets from various themes/plugins
   * Converts to Elementor testimonial widget
   */
  class TestimonialConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches testimonial patterns
      const testimonialPatterns = ['testimonial', 'review', 'quote', 'customer-review', 'customer_review'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return testimonialPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract testimonial data
      const testimonialData = this.extractTestimonialData(settings, renderedContent, context);
      
      if (!testimonialData || !testimonialData.content) {
        return null;
      }
      
      // Create Elementor testimonial widget settings
      const elementorSettings = this.createElementorTestimonialSettings(testimonialData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'testimonial',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (!testimonialData.authorName) {
        warnings.push('Author name not found');
        dataLoss = true;
      }
      if (testimonialData.advancedSettings && Object.keys(testimonialData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedTestimonialSettings(testimonialData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some testimonial settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'TestimonialConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        hasAuthor: !!testimonialData.authorName,
        hasImage: !!testimonialData.authorImage,
        hasRating: testimonialData.rating !== null,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract testimonial data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {Object} context - Converter context
     * @returns {Object|null} Testimonial data
     */
    extractTestimonialData(settings, renderedContent, context) {
      const testimonialData = {
        content: '',
        authorName: '',
        authorTitle: '',
        authorImage: null,
        rating: null,
        advancedSettings: {}
      };
      
      // Extract content from settings
      if (settings.content) {
        testimonialData.content = settings.content;
      } else if (settings.testimonial_content) {
        testimonialData.content = settings.testimonial_content;
      } else if (settings.quote) {
        testimonialData.content = settings.quote;
      } else if (settings.text) {
        testimonialData.content = settings.text;
      } else if (settings.review_content) {
        testimonialData.content = settings.review_content;
      } else if (settings.description) {
        testimonialData.content = settings.description;
      }
      
      // Extract author name from settings
      if (settings.author) {
        testimonialData.authorName = settings.author;
      } else if (settings.author_name) {
        testimonialData.authorName = settings.author_name;
      } else if (settings.name) {
        testimonialData.authorName = settings.name;
      } else if (settings.testimonial_name) {
        testimonialData.authorName = settings.testimonial_name;
      } else if (settings.reviewer_name) {
        testimonialData.authorName = settings.reviewer_name;
      }
      
      // Extract author title/role from settings
      if (settings.author_title) {
        testimonialData.authorTitle = settings.author_title;
      } else if (settings.title) {
        testimonialData.authorTitle = settings.title;
      } else if (settings.job_title) {
        testimonialData.authorTitle = settings.job_title;
      } else if (settings.role) {
        testimonialData.authorTitle = settings.role;
      } else if (settings.position) {
        testimonialData.authorTitle = settings.position;
      } else if (settings.company) {
        testimonialData.authorTitle = settings.company;
      }
      
      // Extract author image from settings
      if (settings.author_image) {
        testimonialData.authorImage = settings.author_image.url || settings.author_image;
      } else if (settings.image) {
        testimonialData.authorImage = settings.image.url || settings.image;
      } else if (settings.testimonial_image) {
        testimonialData.authorImage = settings.testimonial_image.url || settings.testimonial_image;
      } else if (settings.avatar) {
        testimonialData.authorImage = settings.avatar.url || settings.avatar;
      } else if (settings.photo) {
        testimonialData.authorImage = settings.photo.url || settings.photo;
      }
      
      // Extract rating from settings
      if (settings.rating !== undefined) {
        testimonialData.rating = parseFloat(settings.rating);
      } else if (settings.stars !== undefined) {
        testimonialData.rating = parseFloat(settings.stars);
      } else if (settings.score !== undefined) {
        testimonialData.rating = parseFloat(settings.score);
      } else if (settings.review_rating !== undefined) {
        testimonialData.rating = parseFloat(settings.review_rating);
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['layout', 'alignment', 'show_separator', 'separator_style', 'animation'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          testimonialData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no content found in settings, try to extract from HTML
      if (!testimonialData.content && renderedContent) {
        const extractedData = this.extractTestimonialFromHtml(renderedContent);
        if (extractedData.content) {
          testimonialData.content = extractedData.content;
        }
        if (!testimonialData.authorName && extractedData.authorName) {
          testimonialData.authorName = extractedData.authorName;
        }
        if (!testimonialData.authorTitle && extractedData.authorTitle) {
          testimonialData.authorTitle = extractedData.authorTitle;
        }
        if (!testimonialData.authorImage && extractedData.authorImage) {
          testimonialData.authorImage = extractedData.authorImage;
        }
        if (testimonialData.rating === null && extractedData.rating !== null) {
          testimonialData.rating = extractedData.rating;
        }
      }
      
      return testimonialData.content ? testimonialData : null;
    }

    /**
     * Extract testimonial data from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Object} Extracted testimonial data
     */
    extractTestimonialFromHtml(html) {
      if (!html) return { content: '', authorName: '', authorTitle: '', authorImage: null, rating: null };
      
      const data = {
        content: '',
        authorName: '',
        authorTitle: '',
        authorImage: null,
        rating: null
      };
      
      // Extract testimonial content (quote text)
      // Look for blockquote
      const blockquoteMatch = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
      if (blockquoteMatch) {
        // Remove inner HTML tags but keep the text
        data.content = blockquoteMatch[1].replace(/<[^>]+>/g, ' ').trim();
      } else {
        // Look for quote class
        const quoteMatch = html.match(/<(?:div|p)[^>]*class=["'][^"']*(?:quote|content|text|testimonial-content)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i);
        if (quoteMatch) {
          data.content = quoteMatch[1].replace(/<[^>]+>/g, ' ').trim();
        } else {
          // Look for paragraph tags
          const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (pMatch) {
            data.content = pMatch[1].replace(/<[^>]+>/g, ' ').trim();
          }
        }
      }
      
      // Extract author name
      // Look for author, name, or cite class/tag
      const authorPatterns = [
        /<(?:cite|span|div|h[1-6])[^>]*class=["'][^"']*(?:author|name|reviewer)[^"']*["'][^>]*>([^<]+)<\/(?:cite|span|div|h[1-6])>/i,
        /<cite[^>]*>([^<]+)<\/cite>/i,
        /<(?:div|span)[^>]*class=["'][^"']*name[^"']*["'][^>]*>([^<]+)<\/(?:div|span)>/i
      ];
      
      for (const pattern of authorPatterns) {
        const match = html.match(pattern);
        if (match) {
          data.authorName = match[1].trim();
          break;
        }
      }
      
      // Extract author title/role
      const titlePatterns = [
        /<(?:span|div|p)[^>]*class=["'][^"']*(?:title|role|position|job|company)[^"']*["'][^>]*>([^<]+)<\/(?:span|div|p)>/i,
        /<(?:small|em)[^>]*>([^<]+)<\/(?:small|em)>/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = html.match(pattern);
        if (match) {
          // Make sure it's not the author name again
          if (match[1].trim() !== data.authorName) {
            data.authorTitle = match[1].trim();
            break;
          }
        }
      }
      
      // Extract author image
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) {
        data.authorImage = imgMatch[1];
      }
      
      // Extract rating (look for star icons or rating numbers)
      // Look for filled stars (Font Awesome)
      const starMatches = html.match(/<i[^>]*class=["'][^"']*(?:fa-star|star)[^"']*["'][^>]*>/gi);
      if (starMatches) {
        // Count filled stars vs empty stars
        const filledStars = starMatches.filter(star => 
          !star.includes('fa-star-o') && 
          !star.includes('far fa-star') && 
          !star.includes('empty')
        ).length;
        if (filledStars > 0) {
          data.rating = filledStars;
        }
      } else {
        // Look for rating number
        const ratingMatch = html.match(/(?:rating|score)["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)/i);
        if (ratingMatch) {
          data.rating = parseFloat(ratingMatch[1]);
        } else {
          // Look for data-rating attribute
          const dataRatingMatch = html.match(/data-rating=["'](\d+(?:\.\d+)?)["']/i);
          if (dataRatingMatch) {
            data.rating = parseFloat(dataRatingMatch[1]);
          }
        }
      }
      
      return data;
    }

    /**
     * Create Elementor testimonial widget settings
     * @param {Object} testimonialData - Extracted testimonial data
     * @returns {Object} Elementor testimonial widget settings
     */
    createElementorTestimonialSettings(testimonialData) {
      const settings = {
        testimonial_content: testimonialData.content,
        testimonial_name: testimonialData.authorName || '',
        testimonial_job: testimonialData.authorTitle || '',
        testimonial_alignment: 'center'
      };
      
      // Add author image if available
      if (testimonialData.authorImage) {
        settings.testimonial_image = {
          url: testimonialData.authorImage,
          id: ''
        };
      }
      
      // Add rating if available (Elementor uses 0-5 scale)
      if (testimonialData.rating !== null) {
        // Ensure rating is between 0 and 5
        let rating = testimonialData.rating;
        if (rating > 5) {
          // If rating is out of 10, convert to out of 5
          rating = rating / 2;
        }
        rating = Math.max(0, Math.min(5, rating));
        
        settings.testimonial_rating = rating.toString();
      }
      
      return settings;
    }

    /**
     * Get unmapped testimonial settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedTestimonialSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor testimonial
      const commonUnmappable = ['animation', 'separator_style', 'show_separator'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'TestimonialConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'testimonial', 'review', 'quote', 'customer-review', 'customer_review',
          'wd_testimonial', 'custom_testimonial', '*testimonial*', '*review*', '*quote*'
        ]
      };
    }
  }

  // Register TestimonialConverter
  const testimonialConverter = new TestimonialConverter();
  converterRegistry.registerConverter(
    ['*testimonial*', '*review*', '*quote*', '*customer-review*', '*customer_review*'],
    testimonialConverter,
    10
  );

  /**
   * PricingTableConverter
   * Handles conversion of pricing table and plan widgets from various themes/plugins
   * Converts to Elementor price-table widget with pricing data
   */
  class PricingTableConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches pricing table patterns
      const pricingPatterns = ['pricing', 'price-table', 'price_table', 'price-box', 'price_box', 
                                'plan', 'pricing-box', 'pricing_box', 'pricing-table', 'pricing_table'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return pricingPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract pricing table data
      const pricingData = this.extractPricingData(settings, renderedContent);
      
      if (!pricingData || (!pricingData.price && !pricingData.features.length)) {
        return null;
      }
      
      // Create Elementor price-table widget settings
      const elementorSettings = this.createElementorPricingSettings(pricingData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'price-table',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (pricingData.advancedSettings && Object.keys(pricingData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedPricingSettings(pricingData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some pricing settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'PricingTableConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        featureCount: pricingData.features.length,
        timestamp: new Date().toISOString()
      };
      
      // Store feature count in settings metadata for easier access
      if (!convertedWidget.settings._meta) {
        convertedWidget.settings._meta = {};
      }
      convertedWidget.settings._meta.featureCount = pricingData.features.length;
      
      return convertedWidget;
    }

    /**
     * Extract pricing table data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Pricing data with price, features, and button
     */
    extractPricingData(settings, renderedContent) {
      const pricingData = {
        title: '',
        price: '',
        currency: '$',
        period: '',
        features: [],
        buttonText: '',
        buttonLink: '',
        featured: false,
        advancedSettings: {}
      };
      
      // Extract title
      if (settings.title) {
        pricingData.title = settings.title;
      } else if (settings.heading) {
        pricingData.title = settings.heading;
      } else if (settings.plan_name) {
        pricingData.title = settings.plan_name;
      } else if (settings.name) {
        pricingData.title = settings.name;
      }
      
      // Extract price
      if (settings.price !== undefined) {
        pricingData.price = settings.price.toString();
      } else if (settings.amount !== undefined) {
        pricingData.price = settings.amount.toString();
      } else if (settings.cost !== undefined) {
        pricingData.price = settings.cost.toString();
      } else if (settings.value !== undefined) {
        pricingData.price = settings.value.toString();
      }
      
      // Extract currency
      if (settings.currency) {
        pricingData.currency = settings.currency;
      } else if (settings.currency_symbol) {
        pricingData.currency = settings.currency_symbol;
      } else if (settings.price_currency) {
        pricingData.currency = settings.price_currency;
      }
      
      // Extract period
      if (settings.period) {
        pricingData.period = settings.period;
      } else if (settings.duration) {
        pricingData.period = settings.duration;
      } else if (settings.billing_cycle) {
        pricingData.period = settings.billing_cycle;
      } else if (settings.price_period) {
        pricingData.period = settings.price_period;
      }
      
      // Extract features
      const featuresFromSettings = this.extractFeaturesFromSettings(settings);
      if (featuresFromSettings.length > 0) {
        pricingData.features = featuresFromSettings;
      }
      
      // Extract button
      if (settings.button_text) {
        pricingData.buttonText = settings.button_text;
      } else if (settings.btn_text) {
        pricingData.buttonText = settings.btn_text;
      } else if (settings.cta_text) {
        pricingData.buttonText = settings.cta_text;
      } else if (settings.link_text) {
        pricingData.buttonText = settings.link_text;
      }
      
      if (settings.button_link) {
        pricingData.buttonLink = settings.button_link.url || settings.button_link;
      } else if (settings.link) {
        pricingData.buttonLink = settings.link.url || settings.link;
      } else if (settings.url) {
        pricingData.buttonLink = settings.url;
      } else if (settings.cta_link) {
        pricingData.buttonLink = settings.cta_link.url || settings.cta_link;
      }
      
      // Extract featured flag
      if (settings.featured !== undefined) {
        pricingData.featured = !!settings.featured;
      } else if (settings.is_featured !== undefined) {
        pricingData.featured = !!settings.is_featured;
      } else if (settings.highlight !== undefined) {
        pricingData.featured = !!settings.highlight;
      } else if (settings.popular !== undefined) {
        pricingData.featured = !!settings.popular;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['ribbon_text', 'badge', 'icon', 'image', 'description', 'subtitle'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          pricingData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no data found in settings, try to extract from HTML
      if (!pricingData.price && !pricingData.features.length && renderedContent) {
        const extractedData = this.extractPricingFromHtml(renderedContent);
        if (extractedData.price) {
          pricingData.price = extractedData.price;
        }
        if (extractedData.currency) {
          pricingData.currency = extractedData.currency;
        }
        if (extractedData.period) {
          pricingData.period = extractedData.period;
        }
        if (!pricingData.title && extractedData.title) {
          pricingData.title = extractedData.title;
        }
        if (extractedData.features.length > 0) {
          pricingData.features = extractedData.features;
        }
        if (!pricingData.buttonText && extractedData.buttonText) {
          pricingData.buttonText = extractedData.buttonText;
        }
        if (!pricingData.buttonLink && extractedData.buttonLink) {
          pricingData.buttonLink = extractedData.buttonLink;
        }
      }
      
      return (pricingData.price || pricingData.features.length > 0) ? pricingData : null;
    }

    /**
     * Extract features from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of feature strings
     */
    extractFeaturesFromSettings(settings) {
      const features = [];
      
      // Format 1: features array with strings or objects
      if (settings.features && Array.isArray(settings.features)) {
        settings.features.forEach(feature => {
          if (typeof feature === 'string') {
            features.push(feature);
          } else if (typeof feature === 'object') {
            // Handle object format with text property
            if (feature.text) {
              features.push(feature.text);
            } else if (feature.feature) {
              features.push(feature.feature);
            } else if (feature.title) {
              features.push(feature.title);
            } else if (feature.content) {
              features.push(feature.content);
            }
          }
        });
      }
      
      // Format 2: feature_list array
      if (settings.feature_list && Array.isArray(settings.feature_list)) {
        settings.feature_list.forEach(item => {
          if (typeof item === 'string') {
            features.push(item);
          } else if (typeof item === 'object' && item.text) {
            features.push(item.text);
          }
        });
      }
      
      // Format 3: items array
      if (settings.items && Array.isArray(settings.items)) {
        settings.items.forEach(item => {
          if (typeof item === 'string') {
            features.push(item);
          } else if (typeof item === 'object' && item.text) {
            features.push(item.text);
          }
        });
      }
      
      // Format 4: Individual feature properties (feature_1, feature_2, etc.)
      let featureIndex = 1;
      while (settings[`feature_${featureIndex}`]) {
        features.push(settings[`feature_${featureIndex}`]);
        featureIndex++;
      }
      
      return features;
    }

    /**
     * Extract pricing data from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Object} Extracted pricing data
     */
    extractPricingFromHtml(html) {
      if (!html) return { title: '', price: '', currency: '$', period: '', features: [], buttonText: '', buttonLink: '' };
      
      const data = {
        title: '',
        price: '',
        currency: '$',
        period: '',
        features: [],
        buttonText: '',
        buttonLink: ''
      };
      
      // Extract title (heading)
      const titleMatch = html.match(/<h[1-6][^>]*class=["'][^"']*(?:title|heading|name|plan)[^"']*["'][^>]*>([^<]+)<\/h[1-6]>/i);
      if (titleMatch) {
        data.title = titleMatch[1].trim();
      } else {
        const h3Match = html.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        if (h3Match) {
          data.title = h3Match[1].trim();
        }
      }
      
      // Extract price with currency and period
      // Look for price container
      const pricePatterns = [
        /<(?:div|span)[^>]*class=["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i,
        /<(?:div|span)[^>]*class=["'][^"']*amount[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i,
        /<(?:div|span)[^>]*class=["'][^"']*cost[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i
      ];
      
      let priceHtml = '';
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          priceHtml = match[1];
          break;
        }
      }
      
      if (priceHtml) {
        // Extract currency symbol
        const currencyMatch = priceHtml.match(/([£$€¥₹])/);
        if (currencyMatch) {
          data.currency = currencyMatch[1];
        }
        
        // Extract price number
        const priceMatch = priceHtml.match(/(\d+(?:[.,]\d+)?)/);
        if (priceMatch) {
          data.price = priceMatch[1].replace(',', '');
        }
        
        // Extract period
        const periodMatch = priceHtml.match(/\/(month|mo|year|yr|week|wk|day)/i);
        if (periodMatch) {
          data.period = periodMatch[1];
        }
      }
      
      // If no price found yet, try to find price anywhere in the HTML
      if (!data.price) {
        const anyPriceMatch = html.match(/([£$€¥₹])\s*(\d+(?:[.,]\d+)?)/);
        if (anyPriceMatch) {
          data.currency = anyPriceMatch[1];
          data.price = anyPriceMatch[2].replace(',', '');
        }
      }
      
      // Extract features (look for list items)
      const featurePatterns = [
        /<ul[^>]*class=["'][^"']*(?:feature|list|item)[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i,
        /<ul[^>]*>([\s\S]*?)<\/ul>/i
      ];
      
      for (const pattern of featurePatterns) {
        const match = html.match(pattern);
        if (match) {
          const listHtml = match[1];
          const liMatches = listHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
          
          for (const liMatch of liMatches) {
            const featureText = liMatch[1].replace(/<[^>]+>/g, '').trim();
            if (featureText) {
              data.features.push(featureText);
            }
          }
          
          if (data.features.length > 0) {
            break;
          }
        }
      }
      
      // Extract button
      const buttonMatch = html.match(/<(?:a|button)[^>]*class=["'][^"']*(?:button|btn|cta)[^"']*["'][^>]*>([^<]+)<\/(?:a|button)>/i);
      if (buttonMatch) {
        data.buttonText = buttonMatch[1].trim();
        
        const hrefMatch = html.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) {
          data.buttonLink = hrefMatch[1];
        }
      }
      
      return data;
    }

    /**
     * Create Elementor price-table widget settings
     * @param {Object} pricingData - Extracted pricing data
     * @returns {Object} Elementor price-table widget settings
     */
    createElementorPricingSettings(pricingData) {
      const settings = {
        heading: pricingData.title || 'Basic Plan',
        price: pricingData.price || '0',
        currency_symbol: pricingData.currency || '$',
        period: pricingData.period || 'month',
        button_text: pricingData.buttonText || 'Sign Up',
        currency_format: 'before'
      };
      
      // Add button link if available
      if (pricingData.buttonLink) {
        settings.link = {
          url: pricingData.buttonLink,
          is_external: '',
          nofollow: ''
        };
      }
      
      // Add features
      if (pricingData.features.length > 0) {
        settings.features_list = pricingData.features.map(feature => ({
          item_text: feature,
          item_icon: {
            value: 'fas fa-check',
            library: 'fa-solid'
          }
        }));
      }
      
      // Add featured ribbon if applicable
      if (pricingData.featured) {
        settings.ribbon_title = 'Popular';
        settings.show_ribbon = 'yes';
        settings.ribbon_horizontal_position = 'right';
      }
      
      return settings;
    }

    /**
     * Get unmapped pricing settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedPricingSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor price-table
      const commonUnmappable = ['icon', 'image', 'description', 'subtitle', 'badge'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'PricingTableConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'pricing', 'price-table', 'price_table', 'price-box', 'price_box',
          'plan', 'pricing-box', 'pricing_box', 'pricing-table', 'pricing_table',
          'wd_pricing', 'custom_pricing', '*pricing*', '*price-table*', '*price_table*'
        ]
      };
    }
  }

  // Register PricingTableConverter
  const pricingTableConverter = new PricingTableConverter();
  converterRegistry.registerConverter(
    ['*pricing*', '*price*', '*plan*'],
    pricingTableConverter,
    10
  );

  /**
   * SocialIconsConverter
   * Handles conversion of social media icon widgets from various themes/plugins
   * Converts to Elementor social-icons widget with platform links
   */
  class SocialIconsConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches social icons patterns
      const socialPatterns = ['social', 'social-icons', 'social_icons', 'social-links', 
                              'social_links', 'share-buttons', 'share_buttons', 'social-media'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return socialPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract social icons data
      const socialData = this.extractSocialIconsData(settings, renderedContent);
      
      if (!socialData || !socialData.icons || socialData.icons.length === 0) {
        return null;
      }
      
      // Create Elementor social-icons widget settings
      const elementorSettings = this.createElementorSocialIconsSettings(socialData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'social-icons',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (socialData.advancedSettings && Object.keys(socialData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedSocialSettings(socialData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some social icon settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'SocialIconsConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        iconCount: socialData.icons.length,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract social icons data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Social icons data with icons array and settings
     */
    extractSocialIconsData(settings, renderedContent) {
      const socialData = {
        icons: [],
        shape: 'circle',
        colorScheme: 'official',
        advancedSettings: {}
      };
      
      // Try to extract icons from settings first
      const iconsFromSettings = this.extractIconsFromSettings(settings);
      if (iconsFromSettings.length > 0) {
        socialData.icons = iconsFromSettings;
      }
      
      // Extract style settings
      if (settings.shape !== undefined) {
        socialData.shape = settings.shape;
      } else if (settings.icon_shape !== undefined) {
        socialData.shape = settings.icon_shape;
      } else if (settings.style !== undefined) {
        // Map common style values to Elementor shapes
        const styleMap = {
          'circle': 'circle',
          'rounded': 'circle',
          'square': 'square',
          'rounded-square': 'square'
        };
        socialData.shape = styleMap[settings.style] || 'circle';
      }
      
      if (settings.color_scheme !== undefined) {
        socialData.colorScheme = settings.color_scheme;
      } else if (settings.colors !== undefined) {
        socialData.colorScheme = settings.colors;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['size', 'spacing', 'hover_animation', 'border_width', 'border_radius'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          socialData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no icons found in settings, try to extract from HTML
      if (socialData.icons.length === 0 && renderedContent) {
        const iconsFromHtml = this.extractIconsFromHtml(renderedContent);
        if (iconsFromHtml.length > 0) {
          socialData.icons = iconsFromHtml;
        }
      }
      
      return socialData.icons.length > 0 ? socialData : null;
    }

    /**
     * Extract social icons from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of icon objects
     */
    extractIconsFromSettings(settings) {
      const icons = [];
      
      // Format 1: icons array with objects
      if (settings.icons && Array.isArray(settings.icons)) {
        settings.icons.forEach(icon => {
          if (typeof icon === 'object') {
            const normalizedIcon = this.normalizeIconData(icon);
            if (normalizedIcon) {
              icons.push(normalizedIcon);
            }
          }
        });
      }
      
      // Format 2: social_links array
      if (settings.social_links && Array.isArray(settings.social_links)) {
        settings.social_links.forEach(link => {
          if (typeof link === 'object') {
            const normalizedIcon = this.normalizeIconData(link);
            if (normalizedIcon) {
              icons.push(normalizedIcon);
            }
          }
        });
      }
      
      // Format 3: networks array
      if (settings.networks && Array.isArray(settings.networks)) {
        settings.networks.forEach(network => {
          if (typeof network === 'object') {
            const normalizedIcon = this.normalizeIconData(network);
            if (normalizedIcon) {
              icons.push(normalizedIcon);
            }
          }
        });
      }
      
      // Format 4: social_icons array
      if (settings.social_icons && Array.isArray(settings.social_icons)) {
        settings.social_icons.forEach(socialIcon => {
          if (typeof socialIcon === 'object') {
            const normalizedIcon = this.normalizeIconData(socialIcon);
            if (normalizedIcon) {
              icons.push(normalizedIcon);
            }
          }
        });
      }
      
      // Format 5: Individual icon properties (facebook_url, twitter_url, etc.)
      const commonPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 
                               'pinterest', 'tiktok', 'snapchat', 'whatsapp', 'telegram'];
      commonPlatforms.forEach(platform => {
        const urlKey = `${platform}_url`;
        const linkKey = `${platform}_link`;
        
        if (settings[urlKey]) {
          icons.push({
            platform: platform,
            url: settings[urlKey]
          });
        } else if (settings[linkKey]) {
          const url = typeof settings[linkKey] === 'object' ? settings[linkKey].url : settings[linkKey];
          if (url) {
            icons.push({
              platform: platform,
              url: url
            });
          }
        }
      });
      
      return icons;
    }

    /**
     * Normalize icon data from various formats
     * @param {Object} iconData - Raw icon data
     * @returns {Object|null} Normalized icon object
     */
    normalizeIconData(iconData) {
      const normalized = {
        platform: '',
        url: ''
      };
      
      // Extract platform/network name
      if (iconData.platform) {
        normalized.platform = iconData.platform;
      } else if (iconData.network) {
        normalized.platform = iconData.network;
      } else if (iconData.type) {
        normalized.platform = iconData.type;
      } else if (iconData.name) {
        normalized.platform = iconData.name;
      } else if (iconData.social) {
        normalized.platform = iconData.social;
      }
      
      // Extract URL
      if (iconData.url) {
        normalized.url = typeof iconData.url === 'object' ? iconData.url.url : iconData.url;
      } else if (iconData.link) {
        normalized.url = typeof iconData.link === 'object' ? iconData.link.url : iconData.link;
      } else if (iconData.href) {
        normalized.url = iconData.href;
      }
      
      // If no platform specified but URL exists, try to detect from URL
      if (!normalized.platform && normalized.url) {
        normalized.platform = this.detectPlatformFromUrl(normalized.url);
      }
      
      // Normalize platform name to Elementor format
      if (normalized.platform) {
        normalized.platform = this.mapPlatformName(normalized.platform);
      }
      
      return (normalized.platform && normalized.url) ? normalized : null;
    }

    /**
     * Detect social platform from URL
     * @param {string} url - Social media URL
     * @returns {string} Detected platform name
     */
    detectPlatformFromUrl(url) {
      if (!url) return '';
      
      const urlLower = url.toLowerCase();
      
      // Platform detection patterns
      const platformPatterns = {
        'facebook': /facebook\.com|fb\.com|fb\.me/,
        'twitter': /twitter\.com|x\.com/,
        'instagram': /instagram\.com/,
        'linkedin': /linkedin\.com/,
        'youtube': /youtube\.com|youtu\.be/,
        'pinterest': /pinterest\.com/,
        'tiktok': /tiktok\.com/,
        'snapchat': /snapchat\.com/,
        'whatsapp': /whatsapp\.com|wa\.me/,
        'telegram': /telegram\.org|t\.me/,
        'reddit': /reddit\.com/,
        'tumblr': /tumblr\.com/,
        'vimeo': /vimeo\.com/,
        'github': /github\.com/,
        'dribbble': /dribbble\.com/,
        'behance': /behance\.net/,
        'medium': /medium\.com/,
        'discord': /discord\.gg|discord\.com/,
        'twitch': /twitch\.tv/,
        'spotify': /spotify\.com/,
        'soundcloud': /soundcloud\.com/
      };
      
      for (const [platform, pattern] of Object.entries(platformPatterns)) {
        if (pattern.test(urlLower)) {
          return platform;
        }
      }
      
      return '';
    }

    /**
     * Map platform name to Elementor social icon type
     * @param {string} platformName - Platform name from source
     * @returns {string} Elementor platform name
     */
    mapPlatformName(platformName) {
      if (!platformName) return '';
      
      const normalized = platformName.toLowerCase().trim();
      
      // Direct mapping for common variations
      const platformMap = {
        // Facebook
        'facebook': 'facebook',
        'fb': 'facebook',
        'facebook-f': 'facebook',
        'facebook-square': 'facebook',
        
        // Twitter/X
        'twitter': 'twitter',
        'x': 'twitter',
        'twitter-square': 'twitter',
        
        // Instagram
        'instagram': 'instagram',
        'ig': 'instagram',
        'instagram-square': 'instagram',
        
        // LinkedIn
        'linkedin': 'linkedin',
        'linkedin-in': 'linkedin',
        'linkedin-square': 'linkedin',
        
        // YouTube
        'youtube': 'youtube',
        'youtube-square': 'youtube',
        
        // Pinterest
        'pinterest': 'pinterest',
        'pinterest-p': 'pinterest',
        'pinterest-square': 'pinterest',
        
        // TikTok
        'tiktok': 'tiktok',
        
        // Snapchat
        'snapchat': 'snapchat',
        'snapchat-ghost': 'snapchat',
        'snapchat-square': 'snapchat',
        
        // WhatsApp
        'whatsapp': 'whatsapp',
        'whatsapp-square': 'whatsapp',
        
        // Telegram
        'telegram': 'telegram',
        'telegram-plane': 'telegram',
        
        // Reddit
        'reddit': 'reddit',
        'reddit-alien': 'reddit',
        'reddit-square': 'reddit',
        
        // Tumblr
        'tumblr': 'tumblr',
        'tumblr-square': 'tumblr',
        
        // Vimeo
        'vimeo': 'vimeo',
        'vimeo-v': 'vimeo',
        'vimeo-square': 'vimeo',
        
        // GitHub
        'github': 'github',
        'github-alt': 'github',
        'github-square': 'github',
        
        // Dribbble
        'dribbble': 'dribbble',
        'dribbble-square': 'dribbble',
        
        // Behance
        'behance': 'behance',
        'behance-square': 'behance',
        
        // Medium
        'medium': 'medium',
        'medium-m': 'medium',
        
        // Discord
        'discord': 'discord',
        
        // Twitch
        'twitch': 'twitch',
        
        // Spotify
        'spotify': 'spotify',
        
        // SoundCloud
        'soundcloud': 'soundcloud',
        
        // Email
        'email': 'envelope',
        'mail': 'envelope',
        'envelope': 'envelope',
        
        // RSS
        'rss': 'rss',
        'rss-square': 'rss',
        
        // Website/Link
        'website': 'link',
        'link': 'link',
        'url': 'link'
      };
      
      // Return mapped name or original if not found
      return platformMap[normalized] || normalized;
    }

    /**
     * Extract social icons from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of icon objects
     */
    extractIconsFromHtml(html) {
      if (!html) return [];
      
      const icons = [];
      
      // Find all anchor tags with social media links
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      const linkMatches = html.matchAll(linkRegex);
      
      for (const match of linkMatches) {
        const url = match[1];
        const linkTag = match[0];
        
        // Detect platform from URL
        const platform = this.detectPlatformFromUrl(url);
        
        if (platform) {
          // Try to extract icon class for additional context
          const iconMatch = linkTag.match(/class=["']([^"']*(?:fa-|icon-)[^"']*)["']/i);
          let detectedPlatform = platform;
          
          if (iconMatch) {
            const iconClass = iconMatch[1];
            // Try to extract platform from icon class
            const iconPlatform = this.extractPlatformFromIconClass(iconClass);
            if (iconPlatform) {
              detectedPlatform = iconPlatform;
            }
          }
          
          icons.push({
            platform: this.mapPlatformName(detectedPlatform),
            url: url
          });
        }
      }
      
      return icons;
    }

    /**
     * Extract platform name from icon class
     * @param {string} iconClass - Icon CSS class
     * @returns {string} Platform name or empty string
     */
    extractPlatformFromIconClass(iconClass) {
      if (!iconClass) return '';
      
      const classLower = iconClass.toLowerCase();
      
      // Common icon class patterns
      const patterns = [
        /fa-([a-z-]+)/,           // Font Awesome: fa-facebook
        /icon-([a-z-]+)/,         // Generic: icon-twitter
        /social-([a-z-]+)/,       // Social: social-instagram
        /([a-z]+)-icon/           // Platform-icon: facebook-icon
      ];
      
      for (const pattern of patterns) {
        const match = classLower.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      return '';
    }

    /**
     * Create Elementor social-icons widget settings
     * @param {Object} socialData - Extracted social icons data
     * @returns {Object} Elementor social-icons widget settings
     */
    createElementorSocialIconsSettings(socialData) {
      const settings = {
        social_icon_list: [],
        shape: socialData.shape || 'circle',
        color_source: socialData.colorScheme === 'official' ? 'official' : 'custom',
        view: 'default'
      };
      
      // Convert icons to Elementor format
      socialData.icons.forEach(icon => {
        const elementorIcon = {
          social_icon: {
            value: `fab fa-${icon.platform}`,
            library: 'fa-brands'
          },
          link: {
            url: icon.url,
            is_external: 'on',
            nofollow: ''
          }
        };
        
        settings.social_icon_list.push(elementorIcon);
      });
      
      return settings;
    }

    /**
     * Get unmapped social icon settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedSocialSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor social-icons
      const commonUnmappable = ['hover_animation', 'border_width', 'border_radius'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'SocialIconsConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'social', 'social-icons', 'social_icons', 'social-links', 'social_links',
          'share-buttons', 'share_buttons', 'social-media', 'social_media',
          'wd_social', 'custom_social', '*social*', '*share*'
        ]
      };
    }
  }

  // Register SocialIconsConverter
  const socialIconsConverter = new SocialIconsConverter();
  converterRegistry.registerConverter(
    ['*social*', '*share*'],
    socialIconsConverter,
    10
  );

  /**
   * CountdownConverter
   * Handles conversion of countdown timer widgets from various themes/plugins
   * Converts to Elementor countdown widget with target date and labels
   */
  class CountdownConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches countdown patterns
      const countdownPatterns = ['countdown', 'timer', 'count-down', 'count_down', 'deadline'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return countdownPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract countdown data
      const countdownData = this.extractCountdownData(settings, renderedContent);
      
      if (!countdownData || !countdownData.targetDate) {
        return null;
      }
      
      // Create Elementor countdown widget settings
      const elementorSettings = this.createElementorCountdownSettings(countdownData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'countdown',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (countdownData.completionAction && countdownData.completionAction !== 'none') {
        // Elementor countdown has limited completion actions
        const supportedActions = ['none', 'hide', 'redirect', 'message'];
        if (!supportedActions.includes(countdownData.completionAction)) {
          warnings.push(`Completion action "${countdownData.completionAction}" may not be fully supported`);
          dataLoss = true;
        }
      }
      
      if (countdownData.advancedSettings && Object.keys(countdownData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedCountdownSettings(countdownData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some countdown settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'CountdownConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        targetDate: countdownData.targetDate,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract countdown data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Countdown data with target date and settings
     */
    extractCountdownData(settings, renderedContent) {
      const countdownData = {
        targetDate: null,
        labels: {
          days: 'Days',
          hours: 'Hours',
          minutes: 'Minutes',
          seconds: 'Seconds'
        },
        completionAction: 'none',
        completionMessage: '',
        completionRedirectUrl: '',
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        advancedSettings: {}
      };
      
      // Try to extract target date from settings first
      const targetDate = this.extractTargetDateFromSettings(settings);
      if (targetDate) {
        countdownData.targetDate = targetDate;
      }
      
      // Extract labels from settings
      if (settings.label_days !== undefined) {
        countdownData.labels.days = settings.label_days;
      } else if (settings.days_label !== undefined) {
        countdownData.labels.days = settings.days_label;
      }
      
      if (settings.label_hours !== undefined) {
        countdownData.labels.hours = settings.label_hours;
      } else if (settings.hours_label !== undefined) {
        countdownData.labels.hours = settings.hours_label;
      }
      
      if (settings.label_minutes !== undefined) {
        countdownData.labels.minutes = settings.label_minutes;
      } else if (settings.minutes_label !== undefined) {
        countdownData.labels.minutes = settings.minutes_label;
      }
      
      if (settings.label_seconds !== undefined) {
        countdownData.labels.seconds = settings.label_seconds;
      } else if (settings.seconds_label !== undefined) {
        countdownData.labels.seconds = settings.seconds_label;
      }
      
      // Extract completion action
      if (settings.expire_action !== undefined) {
        countdownData.completionAction = this.mapCompletionAction(settings.expire_action);
      } else if (settings.completion_action !== undefined) {
        countdownData.completionAction = this.mapCompletionAction(settings.completion_action);
      } else if (settings.on_complete !== undefined) {
        countdownData.completionAction = this.mapCompletionAction(settings.on_complete);
      }
      
      // Extract completion message
      if (settings.expire_message !== undefined) {
        countdownData.completionMessage = settings.expire_message;
      } else if (settings.completion_message !== undefined) {
        countdownData.completionMessage = settings.completion_message;
      } else if (settings.message !== undefined) {
        countdownData.completionMessage = settings.message;
      }
      
      // Extract redirect URL
      if (settings.expire_redirect_url !== undefined) {
        countdownData.completionRedirectUrl = typeof settings.expire_redirect_url === 'object' 
          ? settings.expire_redirect_url.url 
          : settings.expire_redirect_url;
      } else if (settings.redirect_url !== undefined) {
        countdownData.completionRedirectUrl = typeof settings.redirect_url === 'object' 
          ? settings.redirect_url.url 
          : settings.redirect_url;
      }
      
      // Extract show/hide settings for time units
      if (settings.show_days !== undefined) {
        countdownData.showDays = !!settings.show_days;
      }
      if (settings.show_hours !== undefined) {
        countdownData.showHours = !!settings.show_hours;
      }
      if (settings.show_minutes !== undefined) {
        countdownData.showMinutes = !!settings.show_minutes;
      }
      if (settings.show_seconds !== undefined) {
        countdownData.showSeconds = !!settings.show_seconds;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['separator', 'digit_style', 'animation', 'evergreen', 'evergreen_days'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          countdownData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no target date found in settings, try to extract from HTML
      if (!countdownData.targetDate && renderedContent) {
        const dateFromHtml = this.extractTargetDateFromHtml(renderedContent);
        if (dateFromHtml) {
          countdownData.targetDate = dateFromHtml;
        }
      }
      
      return countdownData.targetDate ? countdownData : null;
    }

    /**
     * Extract target date from settings object
     * @param {Object} settings - Widget settings
     * @returns {string|null} ISO date string or null
     */
    extractTargetDateFromSettings(settings) {
      // Format 1: date and time as separate fields
      if (settings.date && settings.time) {
        return this.combineDateAndTime(settings.date, settings.time);
      }
      
      // Format 2: due_date field
      if (settings.due_date) {
        return this.normalizeDate(settings.due_date);
      }
      
      // Format 3: target_date field
      if (settings.target_date) {
        return this.normalizeDate(settings.target_date);
      }
      
      // Format 4: countdown_date field
      if (settings.countdown_date) {
        return this.normalizeDate(settings.countdown_date);
      }
      
      // Format 5: end_date field
      if (settings.end_date) {
        return this.normalizeDate(settings.end_date);
      }
      
      // Format 6: timestamp field (Unix timestamp)
      if (settings.timestamp) {
        return this.timestampToDate(settings.timestamp);
      }
      
      // Format 7: expire_date field
      if (settings.expire_date) {
        return this.normalizeDate(settings.expire_date);
      }
      
      // Format 8: datetime field
      if (settings.datetime) {
        return this.normalizeDate(settings.datetime);
      }
      
      return null;
    }

    /**
     * Extract target date from HTML content
     * @param {string} html - HTML content to parse
     * @returns {string|null} ISO date string or null
     */
    extractTargetDateFromHtml(html) {
      if (!html) return null;
      
      // Try to find data attributes with date/timestamp
      const dataDateMatch = html.match(/data-(?:date|countdown|target|due)=["']([^"']+)["']/i);
      if (dataDateMatch) {
        return this.normalizeDate(dataDateMatch[1]);
      }
      
      // Try to find data-timestamp attribute
      const dataTimestampMatch = html.match(/data-timestamp=["'](\d+)["']/i);
      if (dataTimestampMatch) {
        return this.timestampToDate(parseInt(dataTimestampMatch[1]));
      }
      
      // Try to find data-time attribute (Unix timestamp)
      const dataTimeMatch = html.match(/data-time=["'](\d+)["']/i);
      if (dataTimeMatch) {
        return this.timestampToDate(parseInt(dataTimeMatch[1]));
      }
      
      // Try to find ISO date in data attributes
      const isoDateMatch = html.match(/data-[^=]+=["'](\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?)["']/i);
      if (isoDateMatch) {
        return this.normalizeDate(isoDateMatch[1]);
      }
      
      return null;
    }

    /**
     * Combine separate date and time strings
     * @param {string} date - Date string
     * @param {string} time - Time string
     * @returns {string} ISO date string
     */
    combineDateAndTime(date, time) {
      try {
        // Handle various date formats
        const dateStr = date.includes('T') ? date.split('T')[0] : date;
        const timeStr = time.includes(':') ? time : '00:00:00';
        
        const combined = `${dateStr}T${timeStr}`;
        const dateObj = new Date(combined);
        
        if (isNaN(dateObj.getTime())) {
          return null;
        }
        
        return dateObj.toISOString();
      } catch (e) {
        return null;
      }
    }

    /**
     * Normalize date string to ISO format
     * @param {string|Date} date - Date in various formats
     * @returns {string|null} ISO date string or null
     */
    normalizeDate(date) {
      if (!date) return null;
      
      try {
        // If already a Date object
        if (date instanceof Date) {
          return date.toISOString();
        }
        
        // If it's a string, try to parse it
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
          return null;
        }
        
        return dateObj.toISOString();
      } catch (e) {
        return null;
      }
    }

    /**
     * Convert Unix timestamp to ISO date string
     * @param {number} timestamp - Unix timestamp (seconds or milliseconds)
     * @returns {string|null} ISO date string or null
     */
    timestampToDate(timestamp) {
      if (!timestamp) return null;
      
      try {
        // Convert to milliseconds if timestamp is in seconds
        const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        const dateObj = new Date(ms);
        
        if (isNaN(dateObj.getTime())) {
          return null;
        }
        
        return dateObj.toISOString();
      } catch (e) {
        return null;
      }
    }

    /**
     * Map completion action to Elementor format
     * @param {string} action - Original action value
     * @returns {string} Elementor action value
     */
    mapCompletionAction(action) {
      if (!action) return 'none';
      
      const actionLower = action.toLowerCase().trim();
      
      // Map common action values
      const actionMap = {
        'none': 'none',
        'hide': 'hide',
        'hidden': 'hide',
        'remove': 'hide',
        'redirect': 'redirect',
        'url': 'redirect',
        'link': 'redirect',
        'message': 'message',
        'show_message': 'message',
        'display_message': 'message',
        'text': 'message'
      };
      
      return actionMap[actionLower] || 'none';
    }

    /**
     * Create Elementor countdown widget settings
     * @param {Object} countdownData - Extracted countdown data
     * @returns {Object} Elementor countdown widget settings
     */
    createElementorCountdownSettings(countdownData) {
      const settings = {
        due_date: countdownData.targetDate,
        label_days: countdownData.labels.days,
        label_hours: countdownData.labels.hours,
        label_minutes: countdownData.labels.minutes,
        label_seconds: countdownData.labels.seconds,
        show_days: countdownData.showDays ? 'yes' : '',
        show_hours: countdownData.showHours ? 'yes' : '',
        show_minutes: countdownData.showMinutes ? 'yes' : '',
        show_seconds: countdownData.showSeconds ? 'yes' : '',
        expire_actions: []
      };
      
      // Add completion action
      if (countdownData.completionAction === 'hide') {
        settings.expire_actions.push('hide');
      } else if (countdownData.completionAction === 'redirect' && countdownData.completionRedirectUrl) {
        settings.expire_actions.push('redirect');
        settings.expire_redirect_url = {
          url: countdownData.completionRedirectUrl,
          is_external: '',
          nofollow: ''
        };
      } else if (countdownData.completionAction === 'message' && countdownData.completionMessage) {
        settings.expire_actions.push('message');
        settings.message_after_expire = countdownData.completionMessage;
      }
      
      return settings;
    }

    /**
     * Get unmapped countdown settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedCountdownSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor countdown
      const commonUnmappable = ['separator', 'digit_style', 'animation', 'evergreen', 'evergreen_days'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'CountdownConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'countdown', 'timer', 'count-down', 'count_down', 'deadline',
          'countdown-timer', 'countdown_timer', 'wd_countdown', 'custom_countdown',
          '*countdown*', '*timer*', '*deadline*'
        ]
      };
    }
  }

  // Register CountdownConverter
  const countdownConverter = new CountdownConverter();
  converterRegistry.registerConverter(
    ['*countdown*', '*timer*', '*deadline*'],
    countdownConverter,
    10
  );

  /**
   * AccordionTabsConverter
   * Handles conversion of accordion and tabs widgets from various themes/plugins
   * Converts to Elementor accordion or tabs widget based on type
   */
  class AccordionTabsConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches accordion or tabs patterns
      const accordionTabsPatterns = ['accordion', 'tabs', 'tab', 'toggle', 'collapse', 'panel'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return accordionTabsPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract accordion/tabs data
      const accordionTabsData = this.extractAccordionTabsData(settings, renderedContent, widgetType);
      
      if (!accordionTabsData || !accordionTabsData.items || accordionTabsData.items.length === 0) {
        return null;
      }
      
      // Determine target widget type (accordion or tabs)
      const targetWidgetType = accordionTabsData.type;
      
      // Create Elementor accordion/tabs widget settings
      const elementorSettings = this.createElementorAccordionTabsSettings(accordionTabsData, targetWidgetType);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: targetWidgetType,
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (accordionTabsData.advancedSettings && Object.keys(accordionTabsData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedAccordionTabsSettings(accordionTabsData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'AccordionTabsConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        targetWidgetType: targetWidgetType,
        itemCount: accordionTabsData.items.length,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract accordion/tabs data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @param {string} widgetType - Original widget type
     * @returns {Object|null} Accordion/tabs data with items array
     */
    extractAccordionTabsData(settings, renderedContent, widgetType) {
      const accordionTabsData = {
        type: this.determineWidgetType(widgetType, settings),
        items: [],
        activeItem: null,
        advancedSettings: {}
      };
      
      // Try to extract items from settings first
      const itemsFromSettings = this.extractItemsFromSettings(settings);
      if (itemsFromSettings.length > 0) {
        accordionTabsData.items = itemsFromSettings;
      }
      
      // Extract active item index
      if (settings.active_item !== undefined) {
        accordionTabsData.activeItem = parseInt(settings.active_item) || 0;
      } else if (settings.active_tab !== undefined) {
        accordionTabsData.activeItem = parseInt(settings.active_tab) || 0;
      } else if (settings.active_index !== undefined) {
        accordionTabsData.activeItem = parseInt(settings.active_index) || 0;
      } else if (settings.default_active !== undefined) {
        accordionTabsData.activeItem = parseInt(settings.default_active) || 0;
      }
      
      // Store other advanced settings for data loss tracking
      const advancedKeys = ['animation', 'icon', 'icon_active', 'collapsible', 'multiple', 'transition'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          accordionTabsData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no items found in settings, try to extract from HTML
      if (accordionTabsData.items.length === 0 && renderedContent) {
        const itemsFromHtml = this.extractItemsFromHtml(renderedContent, accordionTabsData.type);
        if (itemsFromHtml.length > 0) {
          accordionTabsData.items = itemsFromHtml;
        }
      }
      
      return accordionTabsData.items.length > 0 ? accordionTabsData : null;
    }

    /**
     * Determine whether to create accordion or tabs widget
     * @param {string} widgetType - Original widget type
     * @param {Object} settings - Widget settings
     * @returns {string} 'accordion' or 'tabs'
     */
    determineWidgetType(widgetType, settings) {
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Check explicit type in settings
      if (settings.type) {
        const typeLower = settings.type.toLowerCase();
        if (typeLower.includes('tab')) {
          return 'tabs';
        }
        if (typeLower.includes('accordion') || typeLower.includes('collapse')) {
          return 'accordion';
        }
      }
      
      // Check widget type name
      if (widgetTypeLower.includes('tab')) {
        return 'tabs';
      }
      
      // Default to accordion for toggle, collapse, panel, and accordion
      return 'accordion';
    }

    /**
     * Extract items from settings object
     * @param {Object} settings - Widget settings
     * @returns {Array} Array of item objects with title and content
     */
    extractItemsFromSettings(settings) {
      const items = [];
      
      // Format 1: items array
      if (settings.items && Array.isArray(settings.items)) {
        settings.items.forEach(item => {
          if (typeof item === 'object') {
            items.push({
              title: item.title || item.tab_title || item.heading || item.label || '',
              content: item.content || item.tab_content || item.description || item.text || ''
            });
          }
        });
      }
      
      // Format 2: tabs array
      if (settings.tabs && Array.isArray(settings.tabs)) {
        settings.tabs.forEach(tab => {
          if (typeof tab === 'object') {
            items.push({
              title: tab.title || tab.tab_title || tab.heading || '',
              content: tab.content || tab.tab_content || tab.description || ''
            });
          }
        });
      }
      
      // Format 3: panels array
      if (settings.panels && Array.isArray(settings.panels)) {
        settings.panels.forEach(panel => {
          if (typeof panel === 'object') {
            items.push({
              title: panel.title || panel.heading || panel.label || '',
              content: panel.content || panel.description || panel.text || ''
            });
          }
        });
      }
      
      // Format 4: accordion_items array
      if (settings.accordion_items && Array.isArray(settings.accordion_items)) {
        settings.accordion_items.forEach(item => {
          if (typeof item === 'object') {
            items.push({
              title: item.title || item.heading || '',
              content: item.content || item.description || ''
            });
          }
        });
      }
      
      // Format 5: toggles array
      if (settings.toggles && Array.isArray(settings.toggles)) {
        settings.toggles.forEach(toggle => {
          if (typeof toggle === 'object') {
            items.push({
              title: toggle.title || toggle.heading || '',
              content: toggle.content || toggle.description || ''
            });
          }
        });
      }
      
      return items;
    }

    /**
     * Extract items from HTML content
     * @param {string} html - HTML content to parse
     * @param {string} type - Widget type (accordion or tabs)
     * @returns {Array} Array of item objects with title and content
     */
    extractItemsFromHtml(html, type) {
      if (!html) return [];
      
      const items = [];
      
      if (type === 'tabs') {
        // Extract tabs structure
        items.push(...this.extractTabsFromHtml(html));
      } else {
        // Extract accordion structure
        items.push(...this.extractAccordionFromHtml(html));
      }
      
      return items;
    }

    /**
     * Extract tabs from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of tab items
     */
    extractTabsFromHtml(html) {
      const items = [];
      
      // Try to find tab navigation and content panels
      // Common pattern: tab titles in one container, content in another
      
      // Pattern 1: Look for tab titles with data-tab or similar attributes
      const tabTitleRegex = /<(?:li|a|button|div)[^>]*(?:class|data-[^=]*)=["'][^"']*(?:tab-title|tab-link|nav-tab)[^"']*["'][^>]*>(.*?)<\/(?:li|a|button|div)>/gi;
      const titleMatches = [...html.matchAll(tabTitleRegex)];
      
      // Pattern 2: Look for tab content panels
      const tabContentRegex = /<(?:div|section)[^>]*(?:class|data-[^=]*)=["'][^"']*(?:tab-content|tab-panel|tab-pane)[^"']*["'][^>]*>(.*?)<\/(?:div|section)>/gi;
      const contentMatches = [...html.matchAll(tabContentRegex)];
      
      // Match titles with content
      const maxItems = Math.max(titleMatches.length, contentMatches.length);
      for (let i = 0; i < maxItems; i++) {
        const title = titleMatches[i] ? this.stripHtmlTags(titleMatches[i][1]).trim() : `Tab ${i + 1}`;
        const content = contentMatches[i] ? contentMatches[i][1].trim() : '';
        
        if (title || content) {
          items.push({ title, content });
        }
      }
      
      // If no structured tabs found, try generic approach
      if (items.length === 0) {
        items.push(...this.extractGenericTabsFromHtml(html));
      }
      
      return items;
    }

    /**
     * Extract accordion from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of accordion items
     */
    extractAccordionFromHtml(html) {
      const items = [];
      
      // Pattern 1: Look for accordion items with title and content
      const accordionItemRegex = /<(?:div|section)[^>]*(?:class|data-[^=]*)=["'][^"']*(?:accordion-item|panel|toggle-item)[^"']*["'][^>]*>(.*?)<\/(?:div|section)>/gi;
      const itemMatches = [...html.matchAll(accordionItemRegex)];
      
      itemMatches.forEach(match => {
        const itemHtml = match[1];
        
        // Extract title (usually in a heading or button)
        const titleRegex = /<(?:h[1-6]|button|a|div)[^>]*(?:class|data-[^=]*)=["'][^"']*(?:accordion-title|panel-title|toggle-title|accordion-header)[^"']*["'][^>]*>(.*?)<\/(?:h[1-6]|button|a|div)>/i;
        const titleMatch = itemHtml.match(titleRegex);
        const title = titleMatch ? this.stripHtmlTags(titleMatch[1]).trim() : '';
        
        // Extract content (usually in a div)
        const contentRegex = /<(?:div|section)[^>]*(?:class|data-[^=]*)=["'][^"']*(?:accordion-content|panel-content|toggle-content|accordion-body)[^"']*["'][^>]*>(.*?)<\/(?:div|section)>/i;
        const contentMatch = itemHtml.match(contentRegex);
        const content = contentMatch ? contentMatch[1].trim() : '';
        
        if (title || content) {
          items.push({ title, content });
        }
      });
      
      // If no structured accordion found, try generic approach
      if (items.length === 0) {
        items.push(...this.extractGenericAccordionFromHtml(html));
      }
      
      return items;
    }

    /**
     * Extract tabs using generic approach (fallback)
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of tab items
     */
    extractGenericTabsFromHtml(html) {
      const items = [];
      
      // Look for any list items that might be tabs
      const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi;
      const listMatches = [...html.matchAll(listItemRegex)];
      
      if (listMatches.length > 0) {
        listMatches.forEach((match, index) => {
          const title = this.stripHtmlTags(match[1]).trim();
          if (title) {
            items.push({
              title: title,
              content: '' // No content available in generic extraction
            });
          }
        });
      }
      
      return items;
    }

    /**
     * Extract accordion using generic approach (fallback)
     * @param {string} html - HTML content to parse
     * @returns {Array} Array of accordion items
     */
    extractGenericAccordionFromHtml(html) {
      const items = [];
      
      // Look for heading + content pairs
      const headingContentRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>\s*<(?:div|p)[^>]*>(.*?)<\/(?:div|p)>/gi;
      const matches = [...html.matchAll(headingContentRegex)];
      
      matches.forEach(match => {
        const title = this.stripHtmlTags(match[2]).trim();
        const content = match[3].trim();
        
        if (title || content) {
          items.push({ title, content });
        }
      });
      
      return items;
    }

    /**
     * Strip HTML tags from string
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    stripHtmlTags(html) {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Create Elementor accordion/tabs widget settings
     * @param {Object} accordionTabsData - Extracted accordion/tabs data
     * @param {string} targetWidgetType - Target widget type (accordion or tabs)
     * @returns {Object} Elementor accordion/tabs widget settings
     */
    createElementorAccordionTabsSettings(accordionTabsData, targetWidgetType) {
      const settings = {};
      
      // Create items array in Elementor format
      if (targetWidgetType === 'tabs') {
        settings.tabs = accordionTabsData.items.map((item, index) => ({
          _id: this.generateItemId(),
          tab_title: item.title,
          tab_content: item.content
        }));
      } else {
        // Accordion format
        settings.tabs = accordionTabsData.items.map((item, index) => ({
          _id: this.generateItemId(),
          tab_title: item.title,
          tab_content: item.content
        }));
      }
      
      // Set default active item
      if (accordionTabsData.activeItem !== null) {
        settings.selected_tab = accordionTabsData.activeItem + 1; // Elementor uses 1-based index
      }
      
      return settings;
    }

    /**
     * Generate unique item ID
     * @returns {string} 7-character hex ID
     */
    generateItemId() {
      return Math.random().toString(16).substr(2, 7);
    }

    /**
     * Get unmapped accordion/tabs settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedAccordionTabsSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor accordion/tabs
      const commonUnmappable = ['animation', 'icon', 'icon_active', 'collapsible', 'multiple', 'transition'];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'AccordionTabsConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'accordion', 'tabs', 'tab', 'toggle', 'collapse', 'panel',
          'accordion-item', 'tab-item', 'toggle-item', 'panel-item',
          'wd_accordion', 'wd_tabs', 'custom_accordion', 'custom_tabs',
          '*accordion*', '*tabs*', '*tab*', '*toggle*', '*collapse*', '*panel*'
        ]
      };
    }
  }

  // Register AccordionTabsConverter
  const accordionTabsConverter = new AccordionTabsConverter();
  converterRegistry.registerConverter(
    ['*accordion*', '*tabs*', '*tab*', '*toggle*', '*collapse*', '*panel*'],
    accordionTabsConverter,
    10
  );

  /**
   * ProgressCounterConverter
   * Handles conversion of progress bar and counter widgets from various themes/plugins
   * Converts to Elementor progress or counter widget based on type
   */
  class ProgressCounterConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches progress bar or counter patterns
      const progressCounterPatterns = [
        'progress', 'skill-bar', 'skill_bar', 'skillbar',
        'counter', 'stats', 'stat', 'number-counter', 'number_counter'
      ];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return progressCounterPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Determine widget type (progress bar or counter)
      const targetType = this.determineTargetType(widgetType, settings, renderedContent);
      
      if (!targetType) {
        return null;
      }
      
      // Extract data based on target type
      let extractedData;
      if (targetType === 'progress') {
        extractedData = this.extractProgressData(settings, renderedContent);
      } else {
        extractedData = this.extractCounterData(settings, renderedContent);
      }
      
      if (!extractedData) {
        return null;
      }
      
      // Create Elementor widget settings
      const elementorSettings = targetType === 'progress'
        ? this.createElementorProgressSettings(extractedData)
        : this.createElementorCounterSettings(extractedData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: targetType,
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (extractedData.advancedSettings && Object.keys(extractedData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedSettings(extractedData.advancedSettings, targetType);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'ProgressCounterConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        targetType: targetType,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Determine target widget type (progress or counter)
     * @param {string} widgetType - Original widget type
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {string|null} 'progress' or 'counter' or null
     */
    determineTargetType(widgetType, settings, renderedContent) {
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Check widget type for explicit indicators
      const progressIndicators = ['progress', 'skill', 'bar'];
      const counterIndicators = ['counter', 'stats', 'stat', 'number'];
      
      const hasProgressIndicator = progressIndicators.some(ind => widgetTypeLower.includes(ind));
      const hasCounterIndicator = counterIndicators.some(ind => widgetTypeLower.includes(ind));
      
      // If widget type clearly indicates one type
      if (hasProgressIndicator && !hasCounterIndicator) {
        return 'progress';
      }
      if (hasCounterIndicator && !hasProgressIndicator) {
        return 'counter';
      }
      
      // Check settings for type indicators
      if (settings.percentage !== undefined || settings.percent !== undefined || 
          settings.progress !== undefined || settings.skill_level !== undefined) {
        return 'progress';
      }
      
      if (settings.ending_number !== undefined || settings.target_number !== undefined ||
          settings.end_value !== undefined || settings.counter_value !== undefined) {
        return 'counter';
      }
      
      // Check HTML for indicators
      if (renderedContent) {
        if (renderedContent.includes('progress-bar') || renderedContent.includes('skill-bar') ||
            renderedContent.match(/width:\s*\d+%/)) {
          return 'progress';
        }
        
        if (renderedContent.includes('counter') || renderedContent.includes('count-up') ||
            renderedContent.match(/data-(?:to|target|end)=["']\d+["']/)) {
          return 'counter';
        }
      }
      
      // Default to progress if ambiguous
      return 'progress';
    }

    /**
     * Extract progress bar data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Progress data with percentage and title
     */
    extractProgressData(settings, renderedContent) {
      const progressData = {
        percentage: null,
        title: '',
        innerText: '',
        advancedSettings: {}
      };
      
      // Extract percentage from settings
      if (settings.percentage !== undefined) {
        progressData.percentage = this.normalizePercentage(settings.percentage);
      } else if (settings.percent !== undefined) {
        progressData.percentage = this.normalizePercentage(settings.percent);
      } else if (settings.progress !== undefined) {
        progressData.percentage = this.normalizePercentage(settings.progress);
      } else if (settings.skill_level !== undefined) {
        progressData.percentage = this.normalizePercentage(settings.skill_level);
      } else if (settings.value !== undefined) {
        progressData.percentage = this.normalizePercentage(settings.value);
      }
      
      // Extract title from settings
      if (settings.title !== undefined) {
        progressData.title = settings.title;
      } else if (settings.skill_name !== undefined) {
        progressData.title = settings.skill_name;
      } else if (settings.label !== undefined) {
        progressData.title = settings.label;
      } else if (settings.name !== undefined) {
        progressData.title = settings.name;
      }
      
      // Extract inner text (percentage display)
      if (settings.inner_text !== undefined) {
        progressData.innerText = settings.inner_text;
      } else if (settings.display_percentage !== undefined) {
        progressData.innerText = settings.display_percentage ? '%' : '';
      }
      
      // Store advanced settings for data loss tracking
      const advancedKeys = ['animation', 'duration', 'color', 'bar_color', 'background_color', 'height', 'border_radius'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          progressData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no percentage found in settings, try to extract from HTML
      if (progressData.percentage === null && renderedContent) {
        const percentageFromHtml = this.extractPercentageFromHtml(renderedContent);
        if (percentageFromHtml !== null) {
          progressData.percentage = percentageFromHtml;
        }
        
        // Try to extract title from HTML if not found in settings
        if (!progressData.title) {
          const titleFromHtml = this.extractTitleFromHtml(renderedContent);
          if (titleFromHtml) {
            progressData.title = titleFromHtml;
          }
        }
      }
      
      // Percentage is required for progress bar
      return progressData.percentage !== null ? progressData : null;
    }

    /**
     * Extract counter data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Counter data with target number and title
     */
    extractCounterData(settings, renderedContent) {
      const counterData = {
        endingNumber: null,
        startingNumber: 0,
        title: '',
        suffix: '',
        prefix: '',
        duration: 2000,
        separator: ',',
        advancedSettings: {}
      };
      
      // Extract ending number from settings
      if (settings.ending_number !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.ending_number);
      } else if (settings.target_number !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.target_number);
      } else if (settings.end_value !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.end_value);
      } else if (settings.counter_value !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.counter_value);
      } else if (settings.number !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.number);
      } else if (settings.value !== undefined) {
        counterData.endingNumber = this.normalizeNumber(settings.value);
      }
      
      // Extract starting number from settings
      if (settings.starting_number !== undefined) {
        counterData.startingNumber = this.normalizeNumber(settings.starting_number);
      } else if (settings.start_value !== undefined) {
        counterData.startingNumber = this.normalizeNumber(settings.start_value);
      } else if (settings.from !== undefined) {
        counterData.startingNumber = this.normalizeNumber(settings.from);
      }
      
      // Extract title from settings
      if (settings.title !== undefined) {
        counterData.title = settings.title;
      } else if (settings.label !== undefined) {
        counterData.title = settings.label;
      } else if (settings.name !== undefined) {
        counterData.title = settings.name;
      }
      
      // Extract suffix and prefix
      if (settings.suffix !== undefined) {
        counterData.suffix = settings.suffix;
      } else if (settings.number_suffix !== undefined) {
        counterData.suffix = settings.number_suffix;
      }
      
      if (settings.prefix !== undefined) {
        counterData.prefix = settings.prefix;
      } else if (settings.number_prefix !== undefined) {
        counterData.prefix = settings.number_prefix;
      }
      
      // Extract duration
      if (settings.duration !== undefined) {
        counterData.duration = this.normalizeNumber(settings.duration);
      } else if (settings.animation_duration !== undefined) {
        counterData.duration = this.normalizeNumber(settings.animation_duration);
      }
      
      // Extract separator
      if (settings.separator !== undefined) {
        counterData.separator = settings.separator;
      } else if (settings.thousand_separator !== undefined) {
        counterData.separator = settings.thousand_separator;
      }
      
      // Store advanced settings for data loss tracking
      const advancedKeys = ['animation', 'easing', 'decimal_places', 'decimal_separator'];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          counterData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no ending number found in settings, try to extract from HTML
      if (counterData.endingNumber === null && renderedContent) {
        const numberFromHtml = this.extractNumberFromHtml(renderedContent);
        if (numberFromHtml !== null) {
          counterData.endingNumber = numberFromHtml;
        }
        
        // Try to extract title from HTML if not found in settings
        if (!counterData.title) {
          const titleFromHtml = this.extractTitleFromHtml(renderedContent);
          if (titleFromHtml) {
            counterData.title = titleFromHtml;
          }
        }
      }
      
      // Ending number is required for counter
      return counterData.endingNumber !== null ? counterData : null;
    }

    /**
     * Normalize percentage value to 0-100 range
     * @param {*} value - Percentage value (can be string, number, or decimal)
     * @returns {number|null} Normalized percentage or null
     */
    normalizePercentage(value) {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      // Convert to number
      let num = parseFloat(value);
      
      if (isNaN(num)) {
        return null;
      }
      
      // If value is between 0 and 1, assume it's a decimal (e.g., 0.75 = 75%)
      if (num > 0 && num <= 1) {
        num = num * 100;
      }
      
      // Clamp to 0-100 range
      num = Math.max(0, Math.min(100, num));
      
      return num;
    }

    /**
     * Normalize number value
     * @param {*} value - Number value (can be string or number)
     * @returns {number|null} Normalized number or null
     */
    normalizeNumber(value) {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      // Remove common formatting characters
      if (typeof value === 'string') {
        value = value.replace(/[,\s]/g, '');
      }
      
      const num = parseFloat(value);
      
      return isNaN(num) ? null : num;
    }

    /**
     * Extract percentage from HTML content
     * @param {string} html - HTML content to parse
     * @returns {number|null} Extracted percentage or null
     */
    extractPercentageFromHtml(html) {
      if (!html) return null;
      
      // Try to find data-percentage attribute
      const dataPercentMatch = html.match(/data-(?:percentage|percent|progress|value)=["'](\d+(?:\.\d+)?)["']/i);
      if (dataPercentMatch) {
        return this.normalizePercentage(dataPercentMatch[1]);
      }
      
      // Try to find width style with percentage
      const widthStyleMatch = html.match(/width:\s*(\d+(?:\.\d+)?)%/i);
      if (widthStyleMatch) {
        return this.normalizePercentage(widthStyleMatch[1]);
      }
      
      // Try to find aria-valuenow attribute
      const ariaValueMatch = html.match(/aria-valuenow=["'](\d+(?:\.\d+)?)["']/i);
      if (ariaValueMatch) {
        return this.normalizePercentage(ariaValueMatch[1]);
      }
      
      // Try to find percentage in text content
      const textPercentMatch = html.match(/>(\d+(?:\.\d+)?)%</);
      if (textPercentMatch) {
        return this.normalizePercentage(textPercentMatch[1]);
      }
      
      return null;
    }

    /**
     * Extract number from HTML content
     * @param {string} html - HTML content to parse
     * @returns {number|null} Extracted number or null
     */
    extractNumberFromHtml(html) {
      if (!html) return null;
      
      // Try to find data attributes with numbers
      const dataNumberMatch = html.match(/data-(?:to|target|end|number|value)=["'](\d+(?:\.\d+)?)["']/i);
      if (dataNumberMatch) {
        return this.normalizeNumber(dataNumberMatch[1]);
      }
      
      // Try to find number in counter-specific classes
      const counterMatch = html.match(/class=["'][^"']*counter[^"']*["'][^>]*>(\d+(?:,\d+)*(?:\.\d+)?)</i);
      if (counterMatch) {
        return this.normalizeNumber(counterMatch[1]);
      }
      
      // Try to find large numbers in text content
      const largeNumberMatch = html.match(/>(\d{2,}(?:,\d+)*(?:\.\d+)?)</);
      if (largeNumberMatch) {
        return this.normalizeNumber(largeNumberMatch[1]);
      }
      
      return null;
    }

    /**
     * Extract title from HTML content
     * @param {string} html - HTML content to parse
     * @returns {string|null} Extracted title or null
     */
    extractTitleFromHtml(html) {
      if (!html) return null;
      
      // Try to find title in heading tags
      const headingMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
      if (headingMatch) {
        return headingMatch[1].trim();
      }
      
      // Try to find title in data attribute
      const dataTitleMatch = html.match(/data-(?:title|label|name)=["']([^"']+)["']/i);
      if (dataTitleMatch) {
        return dataTitleMatch[1].trim();
      }
      
      // Try to find title in span or div with title/label class
      const titleClassMatch = html.match(/class=["'][^"']*(?:title|label|name)[^"']*["'][^>]*>([^<]+)</i);
      if (titleClassMatch) {
        return titleClassMatch[1].trim();
      }
      
      return null;
    }

    /**
     * Create Elementor progress widget settings
     * @param {Object} progressData - Extracted progress data
     * @returns {Object} Elementor progress widget settings
     */
    createElementorProgressSettings(progressData) {
      const settings = {
        percent: {
          size: progressData.percentage,
          unit: '%'
        },
        title: progressData.title || 'Progress',
        display_percentage: 'show'
      };
      
      // Set inner text if specified
      if (progressData.innerText !== undefined && progressData.innerText !== '') {
        settings.inner_text = progressData.innerText;
      }
      
      return settings;
    }

    /**
     * Create Elementor counter widget settings
     * @param {Object} counterData - Extracted counter data
     * @returns {Object} Elementor counter widget settings
     */
    createElementorCounterSettings(counterData) {
      const settings = {
        ending_number: counterData.endingNumber,
        starting_number: counterData.startingNumber,
        title: counterData.title || 'Counter',
        duration: counterData.duration,
        thousand_separator: counterData.separator
      };
      
      // Add suffix and prefix if specified
      if (counterData.suffix) {
        settings.suffix = counterData.suffix;
      }
      
      if (counterData.prefix) {
        settings.prefix = counterData.prefix;
      }
      
      return settings;
    }

    /**
     * Get unmapped settings for data loss tracking
     * @param {Object} advancedSettings - Original advanced settings
     * @param {string} targetType - Target widget type (progress or counter)
     * @returns {Array} Array of unmapped setting keys
     */
    getUnmappedSettings(advancedSettings, targetType) {
      const unmapped = [];
      
      if (targetType === 'progress') {
        // Settings that are commonly not mappable to Elementor progress
        const commonUnmappable = ['animation', 'duration', 'border_radius'];
        
        Object.keys(advancedSettings).forEach(key => {
          if (commonUnmappable.includes(key)) {
            unmapped.push(key);
          }
        });
      } else {
        // Settings that are commonly not mappable to Elementor counter
        const commonUnmappable = ['animation', 'easing', 'decimal_places', 'decimal_separator'];
        
        Object.keys(advancedSettings).forEach(key => {
          if (commonUnmappable.includes(key)) {
            unmapped.push(key);
          }
        });
      }
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'ProgressCounterConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'progress', 'progress-bar', 'progress_bar', 'skill-bar', 'skill_bar', 'skillbar',
          'counter', 'number-counter', 'number_counter', 'stats', 'stat',
          'wd_progress', 'wd_counter', 'custom_progress', 'custom_counter',
          '*progress*', '*skill*', '*counter*', '*stats*'
        ]
      };
    }
  }

  // Register ProgressCounterConverter
  const progressCounterConverter = new ProgressCounterConverter();
  converterRegistry.registerConverter(
    ['*progress*', '*skill*', '*counter*', '*stats*', '*stat*'],
    progressCounterConverter,
    10
  );

  /**
   * MapConverter
   * Handles conversion of map widgets from various themes/plugins
   * Converts to Elementor google_maps widget with location data
   */
  class MapConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      // Check if widget type matches map patterns
      const mapPatterns = ['map', 'google', 'gmaps', 'location'];
      const widgetTypeLower = widgetType.toLowerCase();
      
      return mapPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract map data
      const mapData = this.extractMapData(settings, renderedContent);
      
      if (!mapData || (!mapData.address && !mapData.lat && !mapData.lng)) {
        return null;
      }
      
      // Create Elementor map settings
      const elementorSettings = this.createElementorMapSettings(mapData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'google_maps',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check for data loss
      if (mapData.markers && mapData.markers.length > 1) {
        warnings.push('Multiple markers detected - only first marker preserved (Elementor free supports single location)');
        dataLoss = true;
      }
      
      if (mapData.customStyles) {
        warnings.push('Custom map styles not preserved');
        dataLoss = true;
      }
      
      if (mapData.advancedSettings && Object.keys(mapData.advancedSettings).length > 0) {
        const unmappedSettings = this.getUnmappedSettings(mapData.advancedSettings);
        if (unmappedSettings.length > 0) {
          warnings.push(`Some advanced settings could not be mapped: ${unmappedSettings.join(', ')}`);
          dataLoss = true;
        }
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'MapConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        hasCoordinates: !!(mapData.lat && mapData.lng),
        hasAddress: !!mapData.address,
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract map data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Map data with location, zoom, and markers
     */
    extractMapData(settings, renderedContent) {
      const mapData = {
        lat: null,
        lng: null,
        address: null,
        zoom: 10,
        markers: [],
        customStyles: false,
        advancedSettings: {}
      };
      
      // Try to extract from settings first
      // Format 1: Direct lat/lng properties
      if (settings.lat !== undefined && settings.lng !== undefined) {
        mapData.lat = this.parseCoordinate(settings.lat);
        mapData.lng = this.parseCoordinate(settings.lng);
      } else if (settings.latitude !== undefined && settings.longitude !== undefined) {
        mapData.lat = this.parseCoordinate(settings.latitude);
        mapData.lng = this.parseCoordinate(settings.longitude);
      }
      
      // Format 2: Location object
      if (settings.location && typeof settings.location === 'object') {
        if (settings.location.lat !== undefined) {
          mapData.lat = this.parseCoordinate(settings.location.lat);
        }
        if (settings.location.lng !== undefined) {
          mapData.lng = this.parseCoordinate(settings.location.lng);
        }
        if (settings.location.address) {
          mapData.address = settings.location.address;
        }
      }
      
      // Format 3: Coordinates object
      if (settings.coordinates && typeof settings.coordinates === 'object') {
        if (settings.coordinates.lat !== undefined) {
          mapData.lat = this.parseCoordinate(settings.coordinates.lat);
        }
        if (settings.coordinates.lng !== undefined) {
          mapData.lng = this.parseCoordinate(settings.coordinates.lng);
        }
      }
      
      // Format 4: Address string
      if (settings.address && typeof settings.address === 'string') {
        mapData.address = settings.address;
      } else if (settings.map_address) {
        mapData.address = settings.map_address;
      } else if (settings.location_address) {
        mapData.address = settings.location_address;
      }
      
      // Extract zoom level
      if (settings.zoom !== undefined) {
        mapData.zoom = parseInt(settings.zoom) || 10;
      } else if (settings.zoom_level !== undefined) {
        mapData.zoom = parseInt(settings.zoom_level) || 10;
      } else if (settings.map_zoom !== undefined) {
        mapData.zoom = parseInt(settings.map_zoom) || 10;
      }
      
      // Extract markers
      if (settings.markers && Array.isArray(settings.markers)) {
        mapData.markers = settings.markers.map(marker => this.parseMarker(marker));
      } else if (settings.marker && typeof settings.marker === 'object') {
        mapData.markers = [this.parseMarker(settings.marker)];
      }
      
      // Check for custom styles
      if (settings.map_style || settings.custom_style || settings.styles) {
        mapData.customStyles = true;
      }
      
      // Store advanced settings for data loss tracking
      const advancedKeys = [
        'map_type', 'street_view', 'scroll_wheel', 'draggable', 
        'disable_ui', 'marker_icon', 'info_window', 'clustering'
      ];
      advancedKeys.forEach(key => {
        if (settings[key] !== undefined) {
          mapData.advancedSettings[key] = settings[key];
        }
      });
      
      // If no location data found in settings, try to extract from HTML
      if (!mapData.lat && !mapData.lng && !mapData.address && renderedContent) {
        const htmlData = this.extractMapDataFromHtml(renderedContent);
        if (htmlData) {
          mapData.lat = htmlData.lat || mapData.lat;
          mapData.lng = htmlData.lng || mapData.lng;
          mapData.address = htmlData.address || mapData.address;
          mapData.zoom = htmlData.zoom || mapData.zoom;
        }
      }
      
      return (mapData.lat && mapData.lng) || mapData.address ? mapData : null;
    }

    /**
     * Parse coordinate value (handles string and number formats)
     * @param {string|number} value - Coordinate value
     * @returns {number|null} Parsed coordinate or null
     */
    parseCoordinate(value) {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    }

    /**
     * Parse marker object
     * @param {Object} marker - Marker data
     * @returns {Object} Parsed marker
     */
    parseMarker(marker) {
      return {
        lat: this.parseCoordinate(marker.lat || marker.latitude),
        lng: this.parseCoordinate(marker.lng || marker.longitude),
        title: marker.title || marker.name || '',
        description: marker.description || marker.info || ''
      };
    }

    /**
     * Extract map data from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Object|null} Extracted map data or null
     */
    extractMapDataFromHtml(html) {
      if (!html) return null;
      
      const mapData = {
        lat: null,
        lng: null,
        address: null,
        zoom: null
      };
      
      // Try to find Google Maps iframe
      const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']*maps\.google\.com[^"']*)["']/i);
      if (iframeMatch) {
        const iframeSrc = iframeMatch[1];
        
        // Extract coordinates from iframe URL
        const coordMatch = iframeSrc.match(/[@!](-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          mapData.lat = parseFloat(coordMatch[1]);
          mapData.lng = parseFloat(coordMatch[2]);
        }
        
        // Extract zoom from iframe URL
        const zoomMatch = iframeSrc.match(/[,&]z=(\d+)/);
        if (zoomMatch) {
          mapData.zoom = parseInt(zoomMatch[1]);
        }
        
        // Extract address from iframe URL (q parameter)
        const addressMatch = iframeSrc.match(/[?&]q=([^&]+)/);
        if (addressMatch) {
          mapData.address = decodeURIComponent(addressMatch[1].replace(/\+/g, ' '));
        }
      }
      
      // Try to find data attributes with coordinates
      const dataLatMatch = html.match(/data-lat(?:itude)?=["']([^"']+)["']/i);
      const dataLngMatch = html.match(/data-lng|data-lon(?:gitude)?=["']([^"']+)["']/i);
      if (dataLatMatch && dataLngMatch) {
        mapData.lat = parseFloat(dataLatMatch[1]);
        mapData.lng = parseFloat(dataLngMatch[1]);
      }
      
      // Try to find data-address attribute
      const dataAddressMatch = html.match(/data-(?:address|location)=["']([^"']+)["']/i);
      if (dataAddressMatch) {
        mapData.address = dataAddressMatch[1];
      }
      
      // Try to find data-zoom attribute
      const dataZoomMatch = html.match(/data-zoom=["']([^"']+)["']/i);
      if (dataZoomMatch) {
        mapData.zoom = parseInt(dataZoomMatch[1]);
      }
      
      return (mapData.lat && mapData.lng) || mapData.address ? mapData : null;
    }

    /**
     * Create Elementor map widget settings
     * @param {Object} mapData - Extracted map data
     * @returns {Object} Elementor map widget settings
     */
    createElementorMapSettings(mapData) {
      const settings = {};
      
      // Set address (preferred method in Elementor)
      if (mapData.address) {
        settings.address = mapData.address;
      } else if (mapData.lat && mapData.lng) {
        // If no address but we have coordinates, create a coordinate string
        settings.address = `${mapData.lat},${mapData.lng}`;
      }
      
      // Set zoom level
      settings.zoom = {
        size: mapData.zoom || 10
      };
      
      // Set height (default)
      settings.height = {
        size: 300,
        unit: 'px'
      };
      
      // Enable prevent scroll (common default)
      settings.prevent_scroll = 'yes';
      
      return settings;
    }

    /**
     * Get list of unmapped advanced settings
     * @param {Object} advancedSettings - Advanced settings from original widget
     * @returns {Array<string>} List of unmapped setting keys
     */
    getUnmappedSettings(advancedSettings) {
      const unmapped = [];
      
      // Settings that are commonly not mappable to Elementor free google_maps
      const commonUnmappable = [
        'map_type', 'street_view', 'scroll_wheel', 'draggable',
        'disable_ui', 'marker_icon', 'info_window', 'clustering',
        'custom_style', 'map_style', 'styles'
      ];
      
      Object.keys(advancedSettings).forEach(key => {
        if (commonUnmappable.includes(key)) {
          unmapped.push(key);
        }
      });
      
      return unmapped;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'MapConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'map', 'google-map', 'google_map', 'googlemap', 'gmaps', 'gmap',
          'location', 'location-map', 'location_map',
          'wd_map', 'custom_map', 'fusion_map',
          '*map*', '*google*', '*gmaps*', '*location*'
        ]
      };
    }
  }

  // Register MapConverter
  const mapConverter = new MapConverter();
  converterRegistry.registerConverter(
    ['*map*', '*google*', '*gmaps*', '*location*'],
    mapConverter,
    10
  );

  /**
   * AudioConverter
   * Handles conversion of audio player widgets from various themes/plugins
   * Supports self-hosted audio files and streaming service embeds
   */
  class AudioConverter extends BaseConverter {
    /**
     * Check if this converter can handle the widget
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @returns {boolean} True if this converter can handle the widget
     */
    canConvert(element, widgetType) {
      const widgetTypeLower = widgetType.toLowerCase();
      
      // Exclude video-related widgets
      if (widgetTypeLower.includes('video') || widgetTypeLower.includes('youtube') || 
          widgetTypeLower.includes('vimeo')) {
        return false;
      }
      
      // Check if widget type matches audio patterns
      const audioPatterns = ['audio', 'music', 'podcast', 'sound'];
      return audioPatterns.some(pattern => widgetTypeLower.includes(pattern));
    }

    /**
     * Perform the conversion
     * @param {Object} element - The widget element
     * @param {string} widgetType - The widget type
     * @param {Object} context - Shared utilities and helpers
     * @returns {Object|null} Converted widget or null if conversion failed
     */
    convert(element, widgetType, context) {
      const settings = element.settings || {};
      const renderedContent = element.renderedContent || '';
      
      // Extract audio data
      const audioData = this.extractAudioData(settings, renderedContent);
      
      if (!audioData || !audioData.url) {
        return null;
      }
      
      // Create Elementor audio widget settings
      const elementorSettings = this.createElementorAudioSettings(audioData);
      
      // Create converted widget
      const convertedWidget = {
        elType: 'widget',
        id: context.generateElementId(),
        widgetType: 'audio',
        settings: {
          ...elementorSettings,
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
      
      // Add conversion metadata
      const warnings = [];
      let dataLoss = false;
      
      // Check if any advanced audio settings were lost
      if (settings.playlist || settings.tracks) {
        warnings.push('Playlist functionality not supported in Elementor audio widget');
        dataLoss = true;
      }
      
      convertedWidget._conversionMeta = {
        originalType: widgetType,
        converter: 'AudioConverter',
        dataLoss: dataLoss,
        warnings: warnings,
        source: 'registry',
        timestamp: new Date().toISOString()
      };
      
      return convertedWidget;
    }

    /**
     * Extract audio data from settings or rendered HTML
     * @param {Object} settings - Widget settings
     * @param {string} renderedContent - Rendered HTML content
     * @returns {Object|null} Audio data with url and optional properties
     */
    extractAudioData(settings, renderedContent) {
      const audioData = {
        url: null,
        title: '',
        autoplay: false,
        loop: false,
        controls: true,
        preload: 'metadata'
      };
      
      // Try to extract from settings first
      if (settings.audio_url) {
        audioData.url = settings.audio_url;
      } else if (settings.url) {
        audioData.url = settings.url;
      } else if (settings.src) {
        audioData.url = settings.src;
      } else if (settings.file) {
        // Handle file object format
        if (typeof settings.file === 'object' && settings.file.url) {
          audioData.url = settings.file.url;
        } else if (typeof settings.file === 'string') {
          audioData.url = settings.file;
        }
      } else if (settings.audio && typeof settings.audio === 'object' && settings.audio.url) {
        audioData.url = settings.audio.url;
      } else if (settings.media && typeof settings.media === 'object' && settings.media.url) {
        audioData.url = settings.media.url;
      }
      
      // Extract title from settings
      if (settings.title) {
        audioData.title = settings.title;
      } else if (settings.audio_title) {
        audioData.title = settings.audio_title;
      } else if (settings.name) {
        audioData.title = settings.name;
      }
      
      // Extract audio options from settings
      if (settings.autoplay !== undefined) {
        audioData.autoplay = !!settings.autoplay;
      }
      if (settings.loop !== undefined) {
        audioData.loop = !!settings.loop;
      }
      if (settings.controls !== undefined) {
        audioData.controls = !!settings.controls;
      }
      if (settings.preload !== undefined) {
        audioData.preload = settings.preload;
      }
      
      // If no URL found in settings, try to extract from HTML
      if (!audioData.url && renderedContent) {
        const extractedData = this.extractAudioDataFromHtml(renderedContent);
        if (extractedData.url) {
          audioData.url = extractedData.url;
          if (extractedData.title && !audioData.title) {
            audioData.title = extractedData.title;
          }
        }
      }
      
      return audioData.url ? audioData : null;
    }

    /**
     * Extract audio data from HTML content
     * @param {string} html - HTML content to parse
     * @returns {Object} Extracted audio data with url and optional title
     */
    extractAudioDataFromHtml(html) {
      const result = {
        url: null,
        title: ''
      };
      
      if (!html) return result;
      
      // Try to find audio tag with src
      const audioTagMatch = html.match(/<audio[^>]+src=["']([^"']+)["']/i);
      if (audioTagMatch) {
        result.url = audioTagMatch[1];
      }
      
      // Try to find source tag inside audio
      if (!result.url) {
        const sourceTagMatch = html.match(/<source[^>]+src=["']([^"']+)["'][^>]*type=["']audio\//i);
        if (sourceTagMatch) {
          result.url = sourceTagMatch[1];
        } else {
          // Try without type attribute
          const sourceMatch = html.match(/<audio[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/i);
          if (sourceMatch) {
            result.url = sourceMatch[1];
          }
        }
      }
      
      // Try to find iframe with audio embed (SoundCloud, Spotify, etc.)
      if (!result.url) {
        const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']*(?:soundcloud|spotify|mixcloud)[^"']*)["']/i);
        if (iframeMatch) {
          result.url = iframeMatch[1];
        }
      }
      
      // Try to find data attributes with audio URLs
      if (!result.url) {
        const dataUrlMatch = html.match(/data-(?:audio-)?(?:url|src)=["']([^"']+)["']/i);
        if (dataUrlMatch) {
          result.url = dataUrlMatch[1];
        }
      }
      
      // Try to extract title from HTML
      const titleMatch = html.match(/<(?:h[1-6]|div|span)[^>]*class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([^<]+)</i);
      if (titleMatch) {
        result.title = titleMatch[1].trim();
      }
      
      return result;
    }

    /**
     * Create Elementor audio widget settings
     * @param {Object} audioData - Extracted audio data
     * @returns {Object} Elementor audio widget settings
     */
    createElementorAudioSettings(audioData) {
      const settings = {};
      
      // Set audio URL - Elementor expects an object with url property
      if (typeof audioData.url === 'string') {
        settings.audio = { url: audioData.url };
      } else if (typeof audioData.url === 'object' && audioData.url.url) {
        settings.audio = audioData.url;
      }
      
      // Set title if available
      if (audioData.title) {
        settings.title = audioData.title;
      }
      
      // Set audio player options
      if (audioData.autoplay) {
        settings.autoplay = 'yes';
      }
      
      if (audioData.loop) {
        settings.loop = 'yes';
      }
      
      if (!audioData.controls) {
        settings.controls = 'no';
      }
      
      if (audioData.preload) {
        settings.preload = audioData.preload;
      }
      
      return settings;
    }

    /**
     * Get converter metadata
     * @returns {Object} Metadata about this converter
     */
    getMetadata() {
      return {
        name: 'AudioConverter',
        version: '1.0.0',
        author: 'Elementor Copier',
        supportedWidgets: [
          'audio', 'audio-player', 'audio-embed', 'music', 'music-player',
          'podcast', 'podcast-player', 'sound', 'media-audio',
          'wd_audio', 'custom_audio', '*audio*', '*music*', '*podcast*', '*sound*'
        ]
      };
    }
  }

  // Register AudioConverter with higher priority than VideoConverter
  // This ensures audio widgets are checked before video widgets (which also match *player*)
  const audioConverter = new AudioConverter();
  converterRegistry.registerConverter(
    ['*audio*', '*music*', '*podcast*', '*sound*'],
    audioConverter,
    15  // Higher priority than VideoConverter (10) to handle audio_player widgets correctly
  );

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
   * Create context object with shared utilities for converters
   * @returns {Object} Context object with helper functions
   */
  function createConverterContext() {
    return {
      extractImageUrl,
      extractTextContent,
      extractHeadingData,
      extractButtonData,
      extractIconData,
      generateElementId,
      sanitizer: getSanitizer(),
      logger: conversionLogger,
      // Style preservation utilities
      preserveCssClasses,
      extractInlineStyles,
      mapStylesToElementorSettings,
      applyStylePreservation
    };
  }

  /**
   * Add conversion metadata to a converted widget
   * @param {Object} widget - Converted widget
   * @param {string} originalType - Original widget type
   * @param {string} converter - Converter name or method used
   * @param {Object} options - Additional metadata options
   * @returns {Object} Widget with metadata
   */
  function addConversionMetadata(widget, originalType, converter, options = {}) {
    if (!widget) return widget;
    
    widget._conversionMeta = {
      originalType: originalType,
      converter: converter,
      dataLoss: options.dataLoss || false,
      warnings: options.warnings || [],
      source: options.source || 'pattern-matching',
      timestamp: new Date().toISOString()
    };
    
    return widget;
  }

  /**
   * Intelligently convert custom widget to standard Elementor widget
   * Analyzes the widget content and settings to determine the best standard widget match
   * 
   * @param {Object} element - The custom widget element
   * @param {string} widgetType - The custom widget type
   * @returns {Object|null} Converted standard widget or null if no conversion possible
   */
  function convertCustomWidgetToStandard(element, widgetType) {
    const settings = element.settings || {};
    const renderedContent = element.renderedContent || '';

    // 1. Check registry for specialized converter
    const converter = converterRegistry.getConverter(widgetType);
    if (converter && converter.canConvert(element, widgetType)) {
      try {
        const context = createConverterContext();
        let result = converter.convert(element, widgetType, context);
        if (result) {
          // Apply style preservation
          result = applyStylePreservation(result, element, widgetType);
          
          // Add conversion metadata
          const metadata = result._conversionMeta || {};
          addConversionMetadata(result, widgetType, converter.constructor.name, {
            dataLoss: metadata.dataLoss || false,
            warnings: metadata.warnings || [],
            source: 'registry'
          });
          
          // Log success with metadata
          conversionLogger.logConversionSuccess(
            widgetType, 
            result.widgetType, 
            converter.constructor.name,
            {
              dataLoss: result._conversionMeta.dataLoss,
              warnings: result._conversionMeta.warnings
            }
          );
          return result;
        }
      } catch (error) {
        conversionLogger.logConversionError(widgetType, error, element);
        // Fall through to pattern-based conversion
      }
    }

    // 2. Fall back to existing pattern-based conversion
    let convertedWidget = null;
    let converterMethod = null;
    
    // Image-based widgets (pix-img-box, image-box, etc.)
    if (widgetType.includes('img') || widgetType.includes('image')) {
      const imageUrl = extractImageUrl(settings, renderedContent);
      if (imageUrl) {
        converterMethod = 'Pattern: Image';
        convertedWidget = {
          elType: 'widget',
          id: generateElementId(),
          widgetType: 'image',
          settings: {
            image: {
              url: imageUrl,
              id: settings.image?.id || '',
              alt: settings.image?.alt || ''
            },
            image_size: 'full',
            _element_id: '',
            _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
          },
          elements: [],
          isInner: element.isInner || false
        };
      }
    }

    // Heading widgets
    if (!convertedWidget && (widgetType.includes('heading') || widgetType.includes('title'))) {
      const headingData = extractHeadingData(settings, renderedContent);
      if (headingData.title) {
        converterMethod = 'Pattern: Heading';
        convertedWidget = {
          elType: 'widget',
          id: generateElementId(),
          widgetType: 'heading',
          settings: {
            title: headingData.title,
            header_size: headingData.tag || 'h2',
            align: headingData.align || '',
            _element_id: '',
            _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
          },
          elements: [],
          isInner: element.isInner || false
        };
      }
    }

    // Text/content widgets
    if (!convertedWidget && (widgetType.includes('text') || widgetType.includes('content') || widgetType.includes('editor'))) {
      const textContent = extractTextContent(settings, renderedContent);
      if (textContent) {
        converterMethod = 'Pattern: Text';
        convertedWidget = {
          elType: 'widget',
          id: generateElementId(),
          widgetType: 'text-editor',
          settings: {
            editor: textContent,
            _element_id: '',
            _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
          },
          elements: [],
          isInner: element.isInner || false
        };
      }
    }

    // Button widgets
    if (!convertedWidget && (widgetType.includes('button') || widgetType.includes('btn'))) {
      const buttonData = extractButtonData(settings, renderedContent);
      if (buttonData.text) {
        converterMethod = 'Pattern: Button';
        convertedWidget = {
          elType: 'widget',
          id: generateElementId(),
          widgetType: 'button',
          settings: {
            text: buttonData.text,
            link: buttonData.link || { url: '' },
            align: buttonData.align || 'center',
            _element_id: '',
            _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
          },
          elements: [],
          isInner: element.isInner || false
        };
      }
    }

    // Icon widgets
    if (!convertedWidget && widgetType.includes('icon') && !widgetType.includes('box')) {
      const iconData = extractIconData(settings, renderedContent);
      if (iconData.icon) {
        converterMethod = 'Pattern: Icon';
        convertedWidget = {
          elType: 'widget',
          id: generateElementId(),
          widgetType: 'icon',
          settings: {
            selected_icon: iconData.icon,
            view: 'default',
            _element_id: '',
            _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
          },
          elements: [],
          isInner: element.isInner || false
        };
      }
    }

    // Divider widgets
    if (!convertedWidget && (widgetType.includes('divider') || widgetType.includes('separator'))) {
      converterMethod = 'Pattern: Divider';
      convertedWidget = {
        elType: 'widget',
        id: generateElementId(),
        widgetType: 'divider',
        settings: {
          style: 'solid',
          weight: { size: 1, unit: 'px' },
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
    }

    // Spacer widgets
    if (!convertedWidget && (widgetType.includes('spacer') || widgetType.includes('space'))) {
      converterMethod = 'Pattern: Spacer';
      convertedWidget = {
        elType: 'widget',
        id: generateElementId(),
        widgetType: 'spacer',
        settings: {
          space: { size: 50, unit: 'px' },
          _element_id: '',
          _css_classes: `converted-from-${widgetType.replace(/\./g, '-')}`
        },
        elements: [],
        isInner: element.isInner || false
      };
    }

    // If pattern-based conversion succeeded, add metadata and log
    if (convertedWidget && converterMethod) {
      // Apply style preservation
      convertedWidget = applyStylePreservation(convertedWidget, element, widgetType);
      
      addConversionMetadata(convertedWidget, widgetType, converterMethod, {
        dataLoss: false,
        warnings: [],
        source: 'pattern-matching'
      });
      
      conversionLogger.logConversionSuccess(
        widgetType, 
        convertedWidget.widgetType, 
        converterMethod
      );
      
      return convertedWidget;
    }

    // 3. No conversion available
    return null;
  }

  /**
   * Helper: Extract image URL from settings or rendered content
   */
  function extractImageUrl(settings, renderedContent) {
    // Check settings first
    if (settings.image?.url) return settings.image.url;
    if (settings.img?.url) return settings.img.url;
    if (settings.src) return settings.src;

    // Parse from rendered HTML
    if (renderedContent) {
      const imgMatch = renderedContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) return imgMatch[1];
    }

    return null;
  }

  /**
   * Helper: Extract heading data from settings or rendered content
   */
  function extractHeadingData(settings, renderedContent) {
    const result = { title: '', tag: 'h2', align: '' };

    // Check settings
    if (settings.title) result.title = settings.title;
    if (settings.heading) result.title = settings.heading;
    if (settings.header_size) result.tag = settings.header_size;
    if (settings.tag) result.tag = settings.tag;
    if (settings.align) result.align = settings.align;

    // Parse from rendered HTML if no title in settings
    if (!result.title && renderedContent) {
      const headingMatch = renderedContent.match(/<(h[1-6])[^>]*>([^<]+)<\/\1>/i);
      if (headingMatch) {
        result.tag = headingMatch[1];
        result.title = headingMatch[2].trim();
      }
    }

    return result;
  }

  /**
   * Helper: Extract text content from settings or rendered content
   */
  function extractTextContent(settings, renderedContent) {
    // Check settings
    if (settings.editor) return settings.editor;
    if (settings.content) return settings.content;
    if (settings.text) return settings.text;

    // Use rendered content
    if (renderedContent) {
      // Clean up the HTML a bit
      return renderedContent.trim();
    }

    return null;
  }

  /**
   * Helper: Extract button data from settings or rendered content
   */
  function extractButtonData(settings, renderedContent) {
    const result = { text: '', link: null, align: 'center' };

    // Check settings
    if (settings.text) result.text = settings.text;
    if (settings.button_text) result.text = settings.button_text;
    if (settings.link) result.link = settings.link;
    if (settings.url) result.link = { url: settings.url };
    if (settings.align) result.align = settings.align;

    // Parse from rendered HTML
    if (!result.text && renderedContent) {
      const buttonMatch = renderedContent.match(/<(?:a|button)[^>]*>([^<]+)<\/(?:a|button)>/i);
      if (buttonMatch) result.text = buttonMatch[1].trim();

      const hrefMatch = renderedContent.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) result.link = { url: hrefMatch[1] };
    }

    return result;
  }

  /**
   * Helper: Extract icon data from settings or rendered content
   */
  function extractIconData(settings, renderedContent) {
    const result = { icon: null };

    // Check settings
    if (settings.selected_icon) result.icon = settings.selected_icon;
    if (settings.icon) result.icon = settings.icon;

    // Parse from rendered HTML
    if (!result.icon && renderedContent) {
      const iconMatch = renderedContent.match(/class=["']([^"']*(?:fa|icon)[^"']*)["']/i);
      if (iconMatch) {
        result.icon = { value: iconMatch[1], library: 'fa-solid' };
      }
    }

    return result;
  }

  /**
   * Style Preservation Utilities
   * Functions for preserving CSS classes and inline styles during conversion
   */

  /**
   * Preserve CSS classes from original widget
   * Extracts classes from settings and rendered HTML, adds conversion marker
   * 
   * @param {Object} element - Original widget element
   * @param {string} originalType - Original widget type
   * @param {Object} existingSettings - Existing settings object to merge with
   * @returns {string} Combined CSS classes string
   */
  function preserveCssClasses(element, originalType, existingSettings = {}) {
    const classes = [];
    
    // Add conversion marker class
    const markerClass = `converted-from-${originalType.replace(/\./g, '-')}`;
    classes.push(markerClass);
    
    // Extract classes from original settings
    if (element.settings) {
      if (element.settings._css_classes) {
        classes.push(element.settings._css_classes);
      }
      if (element.settings.css_classes) {
        classes.push(element.settings.css_classes);
      }
      if (element.settings.className) {
        classes.push(element.settings.className);
      }
      if (element.settings.class) {
        classes.push(element.settings.class);
      }
    }
    
    // Extract classes from rendered HTML
    if (element.renderedContent) {
      const classMatches = element.renderedContent.match(/class=["']([^"']+)["']/gi);
      if (classMatches) {
        classMatches.forEach(match => {
          const classValue = match.match(/class=["']([^"']+)["']/i);
          if (classValue && classValue[1]) {
            // Split multiple classes and filter out common framework classes
            const htmlClasses = classValue[1].split(/\s+/).filter(cls => {
              // Keep custom classes, filter out common framework classes
              return cls && 
                     !cls.startsWith('elementor-') && 
                     !cls.startsWith('e-') &&
                     cls !== 'widget' &&
                     cls !== 'widget-container';
            });
            classes.push(...htmlClasses);
          }
        });
      }
    }
    
    // Include existing classes from settings
    if (existingSettings._css_classes) {
      classes.push(existingSettings._css_classes);
    }
    
    // Remove duplicates and join
    const uniqueClasses = [...new Set(classes.filter(c => c && c.trim()))];
    return uniqueClasses.join(' ').trim();
  }

  /**
   * Extract inline styles from rendered HTML
   * Parses style attributes and returns structured style object
   * 
   * @param {string} renderedContent - HTML content to parse
   * @returns {Object} Parsed style properties
   */
  function extractInlineStyles(renderedContent) {
    const styles = {};
    
    if (!renderedContent) {
      return styles;
    }
    
    // Find all style attributes
    const styleMatches = renderedContent.match(/style=["']([^"']+)["']/gi);
    if (!styleMatches) {
      return styles;
    }
    
    // Parse each style attribute
    styleMatches.forEach(match => {
      const styleValue = match.match(/style=["']([^"']+)["']/i);
      if (styleValue && styleValue[1]) {
        const styleString = styleValue[1];
        
        // Parse individual CSS properties
        const properties = styleString.split(';').filter(p => p.trim());
        properties.forEach(property => {
          const [key, value] = property.split(':').map(s => s.trim());
          if (key && value) {
            // Convert kebab-case to camelCase
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            
            // Store the first occurrence (don't override)
            if (!styles[camelKey]) {
              styles[camelKey] = value;
            }
          }
        });
      }
    });
    
    return styles;
  }

  /**
   * Map CSS properties to Elementor settings
   * Converts inline styles to Elementor's setting format
   * 
   * @param {Object} styles - Parsed inline styles from extractInlineStyles
   * @param {string} widgetType - Target widget type for context-specific mapping
   * @returns {Object} Elementor settings object
   */
  function mapStylesToElementorSettings(styles, widgetType = '') {
    const settings = {};
    
    if (!styles || typeof styles !== 'object') {
      return settings;
    }
    
    // Color mappings
    if (styles.color) {
      settings.text_color = styles.color;
      settings.color = styles.color;
    }
    
    if (styles.backgroundColor) {
      settings.background_color = styles.backgroundColor;
    }
    
    // Spacing mappings - convert to Elementor's format
    if (styles.padding) {
      settings.padding = parseSpacing(styles.padding);
    }
    
    if (styles.margin) {
      settings.margin = parseSpacing(styles.margin);
    }
    
    if (styles.paddingTop) {
      if (!settings.padding) settings.padding = {};
      settings.padding.top = parseSingleSpacing(styles.paddingTop);
    }
    
    if (styles.paddingRight) {
      if (!settings.padding) settings.padding = {};
      settings.padding.right = parseSingleSpacing(styles.paddingRight);
    }
    
    if (styles.paddingBottom) {
      if (!settings.padding) settings.padding = {};
      settings.padding.bottom = parseSingleSpacing(styles.paddingBottom);
    }
    
    if (styles.paddingLeft) {
      if (!settings.padding) settings.padding = {};
      settings.padding.left = parseSingleSpacing(styles.paddingLeft);
    }
    
    if (styles.marginTop) {
      if (!settings.margin) settings.margin = {};
      settings.margin.top = parseSingleSpacing(styles.marginTop);
    }
    
    if (styles.marginRight) {
      if (!settings.margin) settings.margin = {};
      settings.margin.right = parseSingleSpacing(styles.marginRight);
    }
    
    if (styles.marginBottom) {
      if (!settings.margin) settings.margin = {};
      settings.margin.bottom = parseSingleSpacing(styles.marginBottom);
    }
    
    if (styles.marginLeft) {
      if (!settings.margin) settings.margin = {};
      settings.margin.left = parseSingleSpacing(styles.marginLeft);
    }
    
    // Typography mappings
    if (styles.fontSize) {
      const parsed = parseFontSize(styles.fontSize);
      if (parsed) {
        settings.typography_font_size = parsed;
      }
    }
    
    if (styles.fontWeight) {
      settings.typography_font_weight = styles.fontWeight;
    }
    
    if (styles.fontFamily) {
      settings.typography_font_family = styles.fontFamily.replace(/['"]/g, '');
    }
    
    if (styles.lineHeight) {
      const parsed = parseLineHeight(styles.lineHeight);
      if (parsed) {
        settings.typography_line_height = parsed;
      }
    }
    
    if (styles.letterSpacing) {
      const parsed = parseSingleSpacing(styles.letterSpacing);
      if (parsed) {
        settings.typography_letter_spacing = parsed;
      }
    }
    
    if (styles.textAlign) {
      settings.align = styles.textAlign;
      settings.text_align = styles.textAlign;
    }
    
    if (styles.textTransform) {
      settings.typography_text_transform = styles.textTransform;
    }
    
    if (styles.textDecoration) {
      settings.typography_text_decoration = styles.textDecoration;
    }
    
    // Border mappings
    if (styles.borderWidth) {
      settings.border_width = parseSpacing(styles.borderWidth);
    }
    
    if (styles.borderColor) {
      settings.border_color = styles.borderColor;
    }
    
    if (styles.borderStyle) {
      settings.border_border = styles.borderStyle;
    }
    
    if (styles.borderRadius) {
      settings.border_radius = parseSpacing(styles.borderRadius);
    }
    
    // Width and height
    if (styles.width) {
      const parsed = parseDimension(styles.width);
      if (parsed) {
        settings.width = parsed;
      }
    }
    
    if (styles.height) {
      const parsed = parseDimension(styles.height);
      if (parsed) {
        settings.height = parsed;
      }
    }
    
    // Display and positioning
    if (styles.display) {
      settings.display = styles.display;
    }
    
    if (styles.position) {
      settings.position = styles.position;
    }
    
    // Opacity
    if (styles.opacity) {
      settings.opacity = parseFloat(styles.opacity);
    }
    
    return settings;
  }

  /**
   * Parse spacing value (padding/margin) to Elementor format
   * Handles shorthand notation (e.g., "10px 20px")
   * 
   * @param {string} value - CSS spacing value
   * @returns {Object} Elementor spacing object with top, right, bottom, left, unit
   */
  function parseSpacing(value) {
    if (!value) return null;
    
    const parts = value.trim().split(/\s+/);
    const spacing = { unit: 'px', isLinked: false };
    
    // Extract unit from first value
    const unitMatch = parts[0].match(/[a-z%]+$/i);
    if (unitMatch) {
      spacing.unit = unitMatch[0];
    }
    
    // Parse values (remove units)
    const values = parts.map(p => parseFloat(p) || 0);
    
    if (values.length === 1) {
      // Single value: all sides
      spacing.top = values[0];
      spacing.right = values[0];
      spacing.bottom = values[0];
      spacing.left = values[0];
      spacing.isLinked = true;
    } else if (values.length === 2) {
      // Two values: top/bottom, left/right
      spacing.top = values[0];
      spacing.right = values[1];
      spacing.bottom = values[0];
      spacing.left = values[1];
    } else if (values.length === 3) {
      // Three values: top, left/right, bottom
      spacing.top = values[0];
      spacing.right = values[1];
      spacing.bottom = values[2];
      spacing.left = values[1];
    } else if (values.length === 4) {
      // Four values: top, right, bottom, left
      spacing.top = values[0];
      spacing.right = values[1];
      spacing.bottom = values[2];
      spacing.left = values[3];
    }
    
    return spacing;
  }

  /**
   * Parse single spacing value to Elementor format
   * 
   * @param {string} value - CSS spacing value (e.g., "10px", "2em")
   * @returns {Object} Elementor spacing object with size and unit
   */
  function parseSingleSpacing(value) {
    if (!value) return null;
    
    const match = value.match(/^([-\d.]+)([a-z%]*)$/i);
    if (!match) return null;
    
    return {
      size: parseFloat(match[1]) || 0,
      unit: match[2] || 'px'
    };
  }

  /**
   * Parse font size to Elementor format
   * 
   * @param {string} value - CSS font-size value
   * @returns {Object} Elementor font size object
   */
  function parseFontSize(value) {
    if (!value) return null;
    
    const match = value.match(/^([\d.]+)([a-z%]*)$/i);
    if (!match) return null;
    
    return {
      size: parseFloat(match[1]) || 0,
      unit: match[2] || 'px'
    };
  }

  /**
   * Parse line height to Elementor format
   * 
   * @param {string} value - CSS line-height value
   * @returns {Object} Elementor line height object
   */
  function parseLineHeight(value) {
    if (!value) return null;
    
    // Line height can be unitless (e.g., "1.5") or with units (e.g., "24px")
    const match = value.match(/^([\d.]+)([a-z%]*)$/i);
    if (!match) return null;
    
    return {
      size: parseFloat(match[1]) || 0,
      unit: match[2] || 'em'
    };
  }

  /**
   * Parse dimension (width/height) to Elementor format
   * 
   * @param {string} value - CSS dimension value
   * @returns {Object} Elementor dimension object
   */
  function parseDimension(value) {
    if (!value) return null;
    
    const match = value.match(/^([\d.]+)([a-z%]*)$/i);
    if (!match) return null;
    
    return {
      size: parseFloat(match[1]) || 0,
      unit: match[2] || 'px'
    };
  }

  /**
   * Apply style preservation to a converted widget
   * Integrates CSS classes and inline styles into widget settings
   * 
   * @param {Object} convertedWidget - The converted widget object
   * @param {Object} originalElement - The original element with styles
   * @param {string} originalType - Original widget type
   * @returns {Object} Widget with preserved styles
   */
  function applyStylePreservation(convertedWidget, originalElement, originalType) {
    if (!convertedWidget || !convertedWidget.settings) {
      return convertedWidget;
    }
    
    // Preserve CSS classes
    const preservedClasses = preserveCssClasses(
      originalElement, 
      originalType, 
      convertedWidget.settings
    );
    
    if (preservedClasses) {
      convertedWidget.settings._css_classes = preservedClasses;
    }
    
    // Extract and map inline styles
    if (originalElement.renderedContent) {
      const inlineStyles = extractInlineStyles(originalElement.renderedContent);
      const mappedStyles = mapStylesToElementorSettings(
        inlineStyles, 
        convertedWidget.widgetType
      );
      
      // Merge mapped styles into settings (don't override existing settings)
      Object.keys(mappedStyles).forEach(key => {
        if (!convertedWidget.settings[key]) {
          convertedWidget.settings[key] = mappedStyles[key];
        }
      });
      
      // Track if styles were preserved in metadata
      if (Object.keys(mappedStyles).length > 0) {
        if (!convertedWidget._conversionMeta) {
          convertedWidget._conversionMeta = {};
        }
        if (!convertedWidget._conversionMeta.warnings) {
          convertedWidget._conversionMeta.warnings = [];
        }
        convertedWidget._conversionMeta.stylesPreserved = Object.keys(mappedStyles);
      }
    }
    
    return convertedWidget;
  }

  /**
   * Count total elements in a tree structure
   * @param {Object} element - Root element
   * @returns {number} Total element count
   */
  function countElements(element) {
    if (!element) return 0;
    
    let count = 1; // Count this element
    
    if (element.elements && Array.isArray(element.elements)) {
      for (const child of element.elements) {
        count += countElements(child);
      }
    }
    
    return count;
  }

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

      // Reset logger for this conversion batch
      conversionLogger.reset();
      
      // Count total elements for summary
      const totalElements = countElements(extensionData.data);

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
      
      // Log summary of conversions
      conversionLogger.logSummary(totalElements);
      
      return converted;

    } catch (error) {
      console.error('Error converting to native format:', error);
      
      // Log summary even on error
      const totalElements = extensionData?.data ? countElements(extensionData.data) : 0;
      if (totalElements > 0) {
        conversionLogger.logSummary(totalElements);
      }
      
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
      widgetType.includes('_') && !isStandardElementorWidget(widgetType) || // Other custom widgets with underscores
      converterRegistry.hasConverter(widgetType) && !isStandardElementorWidget(widgetType) // Has a registered converter
    );

    // If custom widget, try to convert to standard Elementor widget
    if (isCustomWidget) {
      console.log(`[FormatConverter] Custom widget detected: "${widgetType}"`);

      // Try intelligent conversion first
      const intelligentConversion = convertCustomWidgetToStandard(element, widgetType);
      if (intelligentConversion) {
        console.log(`[FormatConverter] ✓ Converted "${widgetType}" to "${intelligentConversion.widgetType}"`);
        return intelligentConversion;
      }

      // Fallback to HTML widget if conversion not possible
      if (element.renderedContent) {
        conversionLogger.logConversionFallback(widgetType, 'No converter available', true);
        let fallbackWidget = {
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
        
        // Apply style preservation to fallback widget
        fallbackWidget = applyStylePreservation(fallbackWidget, element, widgetType);
        
        // Add conversion metadata for fallback
        addConversionMetadata(fallbackWidget, widgetType, 'HTML Fallback', {
          dataLoss: true,
          warnings: ['Widget converted to HTML - not editable as structured content'],
          source: 'fallback'
        });
        
        return fallbackWidget;
      } else {
        // No rendered content available
        conversionLogger.logConversionFallback(widgetType, 'No converter available and no rendered content', false);
      }
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

  // Export functions and classes
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS
    module.exports = {
      convertToNativeFormat,
      convertClipboardData,
      generateElementId,
      mapWidgetType,
      validateOutput,
      addConversionMetadata,
      countElements,
      BaseConverter,
      ConverterRegistry,
      ConversionLogger,
      converterRegistry,
      conversionLogger,
      // Specialized converters
      VideoConverter,
      GalleryConverter,
      SliderConverter,
      CompositeWidgetConverter,
      FormConverter,
      IconListConverter,
      TestimonialConverter,
      PricingTableConverter,
      SocialIconsConverter,
      CountdownConverter,
      AccordionTabsConverter,
      ProgressCounterConverter,
      MapConverter,
      AudioConverter,
      // Style preservation utilities
      preserveCssClasses,
      extractInlineStyles,
      mapStylesToElementorSettings,
      applyStylePreservation
    };
  } else {
    // Browser
    window.ElementorFormatConverter = {
      convertToNativeFormat,
      convertClipboardData,
      generateElementId,
      mapWidgetType,
      validateOutput,
      addConversionMetadata,
      countElements,
      BaseConverter,
      ConverterRegistry,
      ConversionLogger,
      converterRegistry,
      conversionLogger,
      // Specialized converters
      VideoConverter,
      GalleryConverter,
      SliderConverter,
      CompositeWidgetConverter,
      FormConverter,
      IconListConverter,
      TestimonialConverter,
      PricingTableConverter,
      SocialIconsConverter,
      CountdownConverter,
      AccordionTabsConverter,
      ProgressCounterConverter,
      MapConverter,
      AudioConverter,
      // Style preservation utilities
      preserveCssClasses,
      extractInlineStyles,
      mapStylesToElementorSettings,
      applyStylePreservation
    };
    console.log('[ElementorFormatConverter] Exported to window');
  }

})();
