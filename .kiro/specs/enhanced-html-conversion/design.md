# Design Document: Enhanced HTML Conversion System

## Overview

This design extends the existing intelligent widget conversion system in the Elementor Copier extension to provide comprehensive coverage for all common widget types. The current system handles basic widgets (images, headings, text, buttons, icons, dividers, spacers) but lacks support for complex widgets like videos, galleries, sliders, forms, and composite widgets.

The enhanced system will maintain the existing architecture while adding:
- A plugin-based converter registry for extensibility
- Specialized converters for 14 additional widget categories
- Enhanced extraction patterns for complex data structures
- Improved fallback mechanisms with detailed logging
- Style preservation across conversions

**Design Rationale**: The plugin architecture allows the system to grow without modifying core conversion logic, making it easier to add new widget types as they're discovered in the wild. This approach also enables community contributions and custom converters for specific themes or plugins.

## Architecture

### Current Architecture (Preserved)

The existing `elementor-format-converter.js` module provides:
- Main conversion pipeline (`convertToNativeFormat`, `convertElement`)
- Basic widget detection and conversion (`convertCustomWidgetToStandard`)
- Helper functions for extracting data from settings and HTML
- Version compatibility and widget type mapping
- Validation and sanitization integration

### Enhanced Architecture

```
┌─────────────────────────────────────────────────────────┐
│         ElementorFormatConverter (Core)                 │
│  - convertToNativeFormat()                              │
│  - convertElement()                                     │
│  - validateOutput()                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├──> ConverterRegistry
                 │    - registerConverter()
                 │    - getConverter()
                 │    - hasConverter()
                 │
                 ├──> convertCustomWidgetToStandard()
                 │    (Enhanced with registry lookup)
                 │
                 └──> Specialized Converters (Plugins)
                      ├─ VideoConverter
                      ├─ GalleryConverter
                      ├─ SliderConverter
                      ├─ FormConverter
                      ├─ IconListConverter
                      ├─ TestimonialConverter
                      ├─ PricingTableConverter
                      ├─ CountdownConverter
                      ├─ SocialIconsConverter
                      ├─ CompositeWidgetConverter
                      ├─ AccordionTabsConverter
                      ├─ ProgressCounterConverter
                      ├─ MapConverter
                      └─ AudioConverter
```

**Design Rationale**: The registry pattern allows converters to be registered at runtime without modifying the core converter. Each specialized converter encapsulates the logic for detecting and converting a specific widget category, keeping the codebase modular and testable.

## Components and Interfaces

### 1. Converter Registry

**Purpose**: Manage registration and lookup of specialized widget converters.

**Interface**:
```javascript
class ConverterRegistry {
  constructor()
  
  // Register a converter for one or more widget type patterns
  registerConverter(patterns, converter)
  
  // Get converter for a specific widget type
  getConverter(widgetType)
  
  // Check if converter exists for widget type
  hasConverter(widgetType)
}
```

**Pattern Matching**: Converters are registered with patterns (strings or regex) that match widget types:
- Exact match: `'wd_video'`
- Prefix match: `'video*'` matches `video-player`, `video-embed`, etc.
- Regex: `/video|player/i` matches any widget containing "video" or "player"

**Design Rationale**: Pattern-based matching allows a single converter to handle multiple related widget types (e.g., all video widgets regardless of theme/plugin naming conventions).

### 2. Base Converter Interface

All specialized converters implement this interface:

```javascript
class BaseConverter {
  // Check if this converter can handle the widget
  canConvert(element, widgetType)
  
  // Perform the conversion
  convert(element, widgetType, context)
  
  // Get converter metadata
  getMetadata()
}
```

**Context Object**: Provides access to helper functions and utilities:
```javascript
{
  extractImageUrl,
  extractTextContent,
  extractHeadingData,
  extractButtonData,
  extractIconData,
  generateElementId,
  sanitizer,
  logger
}
```

**Design Rationale**: The base interface ensures consistency across all converters while the context object provides shared utilities without tight coupling.

### 3. Enhanced Core Converter

Modifications to `convertCustomWidgetToStandard()`:

```javascript
function convertCustomWidgetToStandard(element, widgetType) {
  // 1. Check registry for specialized converter
  const converter = converterRegistry.getConverter(widgetType);
  if (converter && converter.canConvert(element, widgetType)) {
    try {
      const result = converter.convert(element, widgetType, context);
      if (result) {
        logConversionSuccess(widgetType, result.widgetType);
        return result;
      }
    } catch (error) {
      logConversionError(widgetType, error, element);
    }
  }
  
  // 2. Fall back to existing pattern-based conversion
  // (existing code for image, heading, text, button, etc.)
  
  // 3. Final fallback to HTML widget
  if (element.renderedContent) {
    logFallbackConversion(widgetType, 'No converter available');
    return createHtmlWidget(element, widgetType);
  }
  
  return null;
}
```

**Design Rationale**: The three-tier approach (registry → patterns → HTML fallback) ensures maximum conversion success while maintaining backward compatibility with existing logic.

## Data Models

### Converter Registration Entry

```javascript
{
  patterns: ['video*', /video|player/i],
  converter: VideoConverter,
  priority: 10,  // Higher priority converters checked first
  metadata: {
    name: 'Video Converter',
    version: '1.0.0',
    author: 'Elementor Copier',
    supportedWidgets: ['video-player', 'video-embed', ...]
  }
}
```

### Conversion Result

```javascript
{
  elType: 'widget',
  id: '8-char-hex-id',
  widgetType: 'video',
  settings: {
    // Widget-specific settings
    video_type: 'youtube',
    youtube_url: 'https://...',
    // Standard Elementor settings
    _element_id: '',
    _css_classes: 'converted-from-custom-video'
  },
  elements: [],
  isInner: false,
  
  // Conversion metadata (optional, for logging)
  _conversionMeta: {
    originalType: 'wd_video_player',
    converter: 'VideoConverter',
    dataLoss: false,
    warnings: []
  }
}
```

### Extraction Pattern Result

```javascript
{
  success: true,
  data: {
    // Extracted data specific to widget type
  },
  confidence: 0.95,  // 0-1 scale, how confident we are in the extraction
  source: 'settings' | 'html' | 'hybrid',
  warnings: []
}
```

**Design Rationale**: The confidence score allows converters to decide whether to proceed with conversion or fall back. Low confidence conversions can be logged for improvement.

## Specialized Converters

### 1. VideoConverter

**Handles**: Video player widgets from various themes/plugins

**Detection Patterns**: `video`, `player`, `youtube`, `vimeo`, `media-video`

**Extraction Strategy**:
1. Check settings for: `video_url`, `youtube_url`, `vimeo_url`, `video_type`, `src`
2. Parse HTML for: `<iframe>` with YouTube/Vimeo URLs, `<video>` tags
3. Extract video ID from URLs using regex patterns
4. Determine video type (YouTube, Vimeo, self-hosted)

**Output**: Elementor `video` widget with appropriate settings

**Design Rationale**: Video widgets vary significantly across themes, but they all ultimately embed videos via iframe or video tags. By checking both settings and HTML, we maximize detection success.

### 2. GalleryConverter

**Handles**: Image gallery and grid widgets

**Detection Patterns**: `gallery`, `image-grid`, `photo-gallery`, `portfolio-grid`

**Extraction Strategy**:
1. Check settings for: `images` array, `gallery_items`, `attachments`
2. Parse HTML for: multiple `<img>` tags, `<figure>` elements
3. Extract image URLs, IDs, captions, and alt text
4. Detect layout settings: columns, spacing, lightbox

**Output**: 
- Elementor `image-gallery` widget (3+ images)
- Elementor `image-carousel` widget (< 3 images or carousel layout detected)

**Design Rationale**: The 3-image threshold aligns with Elementor's UX patterns where galleries are better for multiple images and carousels for fewer items or when animation is desired.

### 3. SliderConverter

**Handles**: Slider and slideshow widgets

**Detection Patterns**: `slider`, `slideshow`, `carousel`, `swiper`

**Extraction Strategy**:
1. Check settings for: `slides` array, `items`, `slide_content`
2. Parse HTML for: slide containers, slide content (images, text, buttons)
3. Extract per-slide data: background image, heading, description, button
4. Extract slider settings: autoplay, navigation, pagination

**Output**: Elementor `slides` widget with individual slide elements

**Design Rationale**: Sliders are complex composite widgets. By extracting each slide's components separately, we preserve editability rather than flattening to HTML.

### 4. FormConverter

**Handles**: Contact forms and form builders

**Detection Patterns**: `form`, `contact-form`, `cf7`, `gravity-form`, `wpforms`

**Extraction Strategy**:
1. Check settings for: `fields` array, `form_fields`, `inputs`
2. Parse HTML for: `<input>`, `<textarea>`, `<select>` elements
3. Extract field properties: type, label, placeholder, required, name
4. Extract form settings: action URL, method, email recipient

**Output**: Elementor `form` widget with field definitions

**Limitations**: Form submission handlers cannot be preserved (requires backend). Action URL is preserved but may not work on target site.

**Design Rationale**: While we can't preserve backend functionality, preserving the form structure allows users to reconnect it to their own form handlers or use Elementor Pro's form actions.

### 5. IconListConverter

**Handles**: Icon list and feature list widgets

**Detection Patterns**: `icon-list`, `feature-list`, `checklist`, `list-icon`

**Extraction Strategy**:
1. Check settings for: `items` array, `list_items`, `features`
2. Parse HTML for: list items with icons (`<li>`, `<div>` with icon classes)
3. Extract per-item data: icon class/SVG, text, link URL
4. Detect icon library: FontAwesome, custom, SVG

**Output**: Elementor `icon-list` widget with list items

**Design Rationale**: Icon lists are common in feature sections. Preserving them as structured data rather than HTML maintains editability.

### 6. TestimonialConverter

**Handles**: Testimonial and review widgets

**Detection Patterns**: `testimonial`, `review`, `quote`, `customer-review`

**Extraction Strategy**:
1. Check settings for: `content`, `author`, `image`, `rating`, `title`
2. Parse HTML for: quote text, author name, author image, star ratings
3. Extract testimonial components: quote, author, role, company, image, rating

**Output**: Elementor `testimonial` widget

**Design Rationale**: Testimonials have a consistent structure across themes, making them good candidates for conversion.

### 7. PricingTableConverter

**Handles**: Pricing table and plan widgets

**Detection Patterns**: `pricing`, `price-table`, `plan`, `pricing-box`

**Extraction Strategy**:
1. Check settings for: `price`, `currency`, `features`, `button_text`, `button_link`
2. Parse HTML for: price value, currency symbol, feature list, CTA button
3. Extract pricing components: title, price, period, features array, button

**Output**: Elementor `price-table` widget

**Design Rationale**: Pricing tables are highly structured, making them ideal for conversion to editable widgets.

### 8. CountdownConverter

**Handles**: Countdown timer widgets

**Detection Patterns**: `countdown`, `timer`, `count-down`, `deadline`

**Extraction Strategy**:
1. Check settings for: `date`, `time`, `timestamp`, `due_date`, `labels`
2. Parse HTML for: data attributes with timestamps, countdown structure
3. Extract countdown settings: target date/time, labels, completion action

**Output**: Elementor `countdown` widget

**Limitations**: Dynamic countdowns (e.g., "3 days from now") converted to fixed dates.

**Design Rationale**: Fixed dates are more predictable and maintainable than relative dates when copying between sites.

### 9. SocialIconsConverter

**Handles**: Social media icon widgets

**Detection Patterns**: `social`, `social-icons`, `social-links`, `share-buttons`

**Extraction Strategy**:
1. Check settings for: `icons` array, `social_links`, `networks`
2. Parse HTML for: social media links, icon classes, platform detection
3. Extract per-icon data: platform type, URL, icon style
4. Map platform names to Elementor's social icon types

**Output**: Elementor `social-icons` widget

**Design Rationale**: Social icons are simple but common. Preserving them as structured data allows easy URL updates.

### 10. CompositeWidgetConverter

**Handles**: Complex widgets with multiple content types (icon boxes, feature boxes, info boxes)

**Detection Patterns**: `icon-box`, `feature-box`, `info-box`, `service-box`, `*-box`

**Extraction Strategy**:
1. Analyze widget structure to identify components: icon, image, heading, text, button
2. Check if components map to Elementor's `icon-box` widget (icon + heading + description)
3. If not, create a container structure with individual widgets

**Output**:
- Elementor `icon-box` widget (if structure matches)
- Section with column containing individual widgets (if complex)

**Layout Detection**:
- Horizontal layout → section with columns
- Vertical layout → section with stacked widgets
- Grid layout → section with multiple columns

**Design Rationale**: Composite widgets are the most challenging because they combine multiple content types. The two-tier approach (icon-box vs. container) balances editability with structure preservation.

### 11. AccordionTabsConverter

**Handles**: Accordion and tabs widgets

**Detection Patterns**: `accordion`, `tabs`, `toggle`, `collapse`

**Extraction Strategy**:
1. Check settings for: `items` array, `tabs`, `panels`
2. Parse HTML for: accordion/tab structure, titles, content panels
3. Extract per-item data: title, content HTML, active state

**Output**:
- Elementor `accordion` widget (for accordions)
- Elementor `tabs` widget (for tabs)

**Design Rationale**: Accordions and tabs have similar data structures, allowing a single converter to handle both with different output types.

### 12. ProgressCounterConverter

**Handles**: Progress bars and animated counters

**Detection Patterns**: `progress`, `skill-bar`, `counter`, `stats`, `number-counter`

**Extraction Strategy**:
1. Check settings for: `percentage`, `value`, `max`, `title`, `number`
2. Parse HTML for: progress bar width, counter target number, labels
3. Determine widget type: progress bar vs. counter

**Output**:
- Elementor `progress` widget (for progress bars)
- Elementor `counter` widget (for number counters)

**Design Rationale**: Progress bars and counters are visually different but structurally similar (both show a value/percentage).

### 13. MapConverter

**Handles**: Map widgets (Google Maps, etc.)

**Detection Patterns**: `map`, `google-map`, `location`, `gmaps`

**Extraction Strategy**:
1. Check settings for: `lat`, `lng`, `address`, `zoom`, `markers`
2. Parse HTML for: iframe with Google Maps URL, data attributes with coordinates
3. Extract map settings: location, zoom level, markers, map type

**Output**: Elementor `google_maps` widget

**Limitations**: Custom map styles and advanced features may not transfer.

**Design Rationale**: Basic map functionality (location, zoom, markers) is sufficient for most use cases and can be enhanced after pasting.

### 14. AudioConverter

**Handles**: Audio player widgets

**Detection Patterns**: `audio`, `music`, `podcast`, `sound`, `media-audio`

**Extraction Strategy**:
1. Check settings for: `audio_url`, `src`, `file`, `title`
2. Parse HTML for: `<audio>` tags, audio file URLs, embed codes
3. Extract audio settings: URL, title, controls visibility

**Output**: Elementor `audio` widget

**Design Rationale**: Audio widgets are less common but follow similar patterns to video widgets.

## Error Handling

### Conversion Error Logging

Enhanced logging system for tracking conversion success and failures:

```javascript
class ConversionLogger {
  logConversionSuccess(originalType, convertedType, converter)
  logConversionFallback(originalType, reason, hasRenderedContent)
  logConversionError(originalType, error, element)
  logDataLoss(originalType, lostData)
  logSummary(totalElements, conversions, fallbacks, errors)
}
```

**Log Levels**:
- **Success**: Widget converted to standard Elementor widget
- **Warning**: Conversion succeeded but with data loss
- **Fallback**: Converted to HTML widget (no better option available)
- **Error**: Conversion failed completely

**Log Output** (console):
```
[FormatConverter] ✓ Converted "wd_video_player" to "video" (VideoConverter)
[FormatConverter] ⚠ Converted "custom_gallery" to "image-gallery" with data loss: [captions]
[FormatConverter] ⚠ No converter for "wd_banner", using HTML widget fallback
[FormatConverter] ✗ Conversion failed for "broken_widget": Invalid settings structure
[FormatConverter] Summary: 45 elements, 38 converted, 5 fallbacks, 2 errors
```

**Design Rationale**: Detailed logging helps users understand what happened during conversion and helps developers identify patterns for new converters.

### Error Recovery

**Strategy**: Fail gracefully at the widget level, never fail the entire conversion.

1. **Converter Error**: If a specialized converter throws an error, fall back to pattern-based conversion
2. **Pattern Conversion Error**: If pattern-based conversion fails, fall back to HTML widget
3. **HTML Widget Error**: If HTML widget creation fails, skip the widget and log error
4. **Validation Error**: If converted widget fails validation, try HTML widget fallback

**Design Rationale**: Users prefer partial success (some widgets as HTML) over complete failure. Each widget conversion is independent.

## Style Preservation

### CSS Class Preservation

All conversions preserve original CSS classes:

```javascript
settings._css_classes = [
  `converted-from-${originalType.replace(/\./g, '-')}`,
  ...originalClasses
].join(' ');
```

**Design Rationale**: Preserving CSS classes maintains visual appearance if the target site has similar styles, and provides a marker for identifying converted widgets.

### Inline Style Extraction

Extract and map inline styles to Elementor settings:

```javascript
function extractAndMapStyles(element) {
  const styles = parseInlineStyles(element.renderedContent);
  const mapped = {};
  
  // Color mapping
  if (styles.color) mapped.text_color = styles.color;
  if (styles.backgroundColor) mapped.background_color = styles.backgroundColor;
  
  // Spacing mapping
  if (styles.padding) mapped.padding = parseSpacing(styles.padding);
  if (styles.margin) mapped.margin = parseSpacing(styles.margin);
  
  // Typography mapping
  if (styles.fontSize) mapped.typography_font_size = parseFontSize(styles.fontSize);
  if (styles.fontWeight) mapped.typography_font_weight = styles.fontWeight;
  
  return mapped;
}
```

**Limitations**: Complex CSS (gradients, transforms, animations) cannot be fully mapped to Elementor settings.

**Design Rationale**: Basic style preservation (colors, spacing, typography) covers 80% of use cases and significantly improves visual consistency.

## Testing Strategy

### Unit Tests

Test each converter independently:

```javascript
describe('VideoConverter', () => {
  test('converts YouTube video from settings', () => {
    const element = {
      widgetType: 'wd_video',
      settings: { youtube_url: 'https://youtube.com/watch?v=abc123' }
    };
    const result = videoConverter.convert(element, 'wd_video', context);
    expect(result.widgetType).toBe('video');
    expect(result.settings.video_type).toBe('youtube');
    expect(result.settings.youtube_url).toContain('abc123');
  });
  
  test('extracts video from iframe HTML', () => {
    const element = {
      widgetType: 'custom_video',
      renderedContent: '<iframe src="https://youtube.com/embed/xyz789"></iframe>'
    };
    const result = videoConverter.convert(element, 'custom_video', context);
    expect(result.settings.youtube_url).toContain('xyz789');
  });
  
  test('handles Vimeo videos', () => {
    // ...
  });
  
  test('handles self-hosted videos', () => {
    // ...
  });
});
```

**Coverage Target**: 80% code coverage for each converter

### Integration Tests

Test the full conversion pipeline:

```javascript
describe('Format Converter Integration', () => {
  test('converts section with mixed widget types', () => {
    const section = createTestSection([
      { widgetType: 'wd_video', ... },
      { widgetType: 'custom_gallery', ... },
      { widgetType: 'unknown_widget', renderedContent: '<div>...</div>' }
    ]);
    
    const result = convertToNativeFormat({ data: section });
    
    expect(result.elements[0].widgetType).toBe('video');
    expect(result.elements[1].widgetType).toBe('image-gallery');
    expect(result.elements[2].widgetType).toBe('html'); // fallback
  });
});
```

### Real-World Testing

Test with actual widget data from popular themes:

- **WoodMart**: `wd_banner`, `wd_products`, `wd_info_box`
- **Avada**: `fusion_slider`, `fusion_pricing_table`, `fusion_testimonials`
- **Divi**: `et_pb_video`, `et_pb_gallery`, `et_pb_contact_form`
- **Astra**: Custom widgets from Astra Pro
- **OceanWP**: Ocean Extra widgets

**Test Data Collection**: Create a library of real widget JSON from these themes for regression testing.

**Design Rationale**: Real-world testing ensures converters work with actual theme implementations, not just theoretical structures.

## Performance Considerations

### Converter Lookup Optimization

Use a two-tier lookup system:

1. **Exact Match Cache**: O(1) lookup for previously seen widget types
2. **Pattern Matching**: O(n) where n = number of registered converters

```javascript
class ConverterRegistry {
  constructor() {
    this.exactMatchCache = new Map();
    this.patternConverters = [];
  }
  
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
}
```

**Design Rationale**: Caching eliminates repeated pattern matching for the same widget types, which is common when copying sections with multiple instances of the same widget.

### HTML Parsing Optimization

Minimize HTML parsing overhead:

1. **Lazy Parsing**: Only parse HTML if settings extraction fails
2. **Cached Parsing**: Parse HTML once, cache the DOM structure
3. **Selective Parsing**: Only parse relevant parts (e.g., only look for `<img>` tags for image extraction)

**Design Rationale**: HTML parsing is expensive. By checking settings first and caching results, we minimize performance impact.

### Conversion Batching

For large sections with many widgets, process in batches:

```javascript
async function convertLargeSection(section, batchSize = 50) {
  const widgets = flattenWidgets(section);
  const batches = chunk(widgets, batchSize);
  
  for (const batch of batches) {
    await Promise.all(batch.map(w => convertWidget(w)));
    // Allow UI to remain responsive
    await nextTick();
  }
}
```

**Design Rationale**: Batching prevents UI freezing when converting very large sections (100+ widgets).

## Migration Path

### Phase 1: Core Infrastructure
1. Implement ConverterRegistry
2. Modify `convertCustomWidgetToStandard()` to use registry
3. Add enhanced logging system
4. Add style preservation utilities

### Phase 2: High-Priority Converters
Implement converters for most common widget types:
1. VideoConverter
2. GalleryConverter
3. SliderConverter
4. CompositeWidgetConverter (icon-box, feature-box)

### Phase 3: Medium-Priority Converters
5. FormConverter
6. IconListConverter
7. TestimonialConverter
8. PricingTableConverter
9. SocialIconsConverter

### Phase 4: Specialized Converters
10. CountdownConverter
11. AccordionTabsConverter
12. ProgressCounterConverter
13. MapConverter
14. AudioConverter

### Phase 5: Polish
- Add comprehensive unit tests
- Collect real-world test data
- Performance optimization
- Documentation

**Design Rationale**: Phased implementation allows early delivery of high-value converters while building toward comprehensive coverage.

## Future Enhancements

### Community Converter Marketplace

Allow users to share custom converters:

```javascript
// User-created converter for a specific theme
class MyThemeConverter extends BaseConverter {
  canConvert(element, widgetType) {
    return widgetType.startsWith('mytheme_');
  }
  
  convert(element, widgetType, context) {
    // Custom conversion logic
  }
}

// Register via UI or config file
converterRegistry.registerConverter(['mytheme_*'], new MyThemeConverter());
```

### Machine Learning-Based Conversion

Train a model to suggest conversions for unknown widgets:

1. Collect conversion examples (input widget → output widget)
2. Train classifier to predict best Elementor widget type
3. Use model for widgets without explicit converters

**Design Rationale**: ML could handle the long tail of rare custom widgets without writing explicit converters.

### Visual Diff Tool

Show users a before/after comparison of converted widgets:

```javascript
{
  original: { widgetType: 'wd_banner', preview: '<img src="...">' },
  converted: { widgetType: 'image', preview: '<img src="...">' },
  changes: ['Lost: animation settings', 'Preserved: image, text, button']
}
```

**Design Rationale**: Visual feedback helps users understand what changed and decide whether to accept the conversion.

## Open Questions

1. **Form Submission Handling**: Should we attempt to preserve form action URLs even though they likely won't work on the target site?
   - **Recommendation**: Yes, preserve URLs but add a warning in the conversion log that forms may need reconfiguration.

2. **Third-Party Service Integration**: How to handle widgets that depend on external services (e.g., Mailchimp forms, Google Maps API keys)?
   - **Recommendation**: Preserve configuration but add warnings. Users will need to reconnect services on the target site.

3. **Custom CSS Preservation**: Should we attempt to extract and preserve custom CSS from `<style>` tags?
   - **Recommendation**: Phase 2 feature. Extract inline styles first, add `<style>` tag extraction later if needed.

4. **Converter Priority**: How to handle conflicts when multiple converters match the same widget type?
   - **Recommendation**: Use priority system (higher priority checked first) and allow converters to return confidence scores.

5. **Backward Compatibility**: How to ensure new converters don't break existing conversions?
   - **Recommendation**: Comprehensive regression test suite with real-world widget data. Version converters and allow rollback if needed.
