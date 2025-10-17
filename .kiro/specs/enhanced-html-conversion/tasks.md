# Implementation Plan

## Overview
This implementation plan extends the existing intelligent widget conversion system in `elementor-format-converter.js` to provide comprehensive coverage for all common widget types. The current system handles basic widgets (images, headings, text, buttons, icons, dividers, spacers) but lacks support for complex widgets like videos, galleries, sliders, forms, and composite widgets.

## Current State Analysis
The existing `elementor-format-converter.js` has:
- ✓ Basic conversion pipeline (`convertToNativeFormat`, `convertElement`)
- ✓ Pattern-based widget detection for 7 widget types (image, heading, text, button, icon, divider, spacer)
- ✓ Helper functions for extracting data from settings and HTML
- ✓ Version compatibility and widget type mapping
- ✓ Validation and sanitization integration
- ✗ No plugin architecture for extensibility
- ✗ No specialized converters for complex widgets
- ✗ Limited logging for conversion tracking
- ✗ No style preservation system

## Tasks

- [x] 1. Implement core converter infrastructure





  - Create ConverterRegistry class for managing specialized converters
  - Create BaseConverter interface/class that all converters will extend
  - Create context object with shared utilities for converters
  - Modify `convertCustomWidgetToStandard()` to check registry before pattern matching
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
-

- [x] 2. Implement enhanced logging system




  - Create ConversionLogger class with methods for success, warning, fallback, and error logging
  - Add conversion metadata tracking (_conversionMeta) to conversion results
  - Integrate logger into `convertCustomWidgetToStandard()` for all conversion paths
  - Add summary logging for batch conversions
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 3. Implement style preservation utilities




  - Create function to preserve CSS classes from original widgets
  - Create function to extract inline styles from rendered HTML
  - Create function to map CSS properties to Elementor settings (colors, spacing, typography)
  - Integrate style preservation into conversion pipeline
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_
-

- [x] 4. Implement VideoConverter




  - Create VideoConverter class extending BaseConverter
  - Implement detection for video widget patterns (video, player, youtube, vimeo)
  - Implement extraction of video URLs from settings and HTML
  - Implement video type detection (YouTube, Vimeo, self-hosted)
  - Implement conversion to Elementor video widget with appropriate settings
  - Register VideoConverter with the registry
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5. Implement GalleryConverter





  - Create GalleryConverter class extending BaseConverter
  - Implement detection for gallery widget patterns
  - Implement extraction of multiple image URLs from settings and HTML
  - Implement caption and layout extraction
  - Implement conversion to image-gallery or image-carousel based on image count
  - Register GalleryConverter with the registry
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
-

- [x] 6. Implement SliderConverter




  - Create SliderConverter class extending BaseConverter
  - Implement detection for slider widget patterns
  - Implement extraction of slide data (images, text, buttons) from settings and HTML
  - Implement extraction of slider settings (autoplay, navigation)
  - Implement conversion to Elementor slides widget with individual slide elements
  - Register SliderConverter with the registry
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
-

- [x] 7. Implement CompositeWidgetConverter




  - Create CompositeWidgetConverter class extending BaseConverter
  - Implement detection for composite widget patterns (icon-box, feature-box, info-box)
  - Implement analysis of widget structure to identify components
  - Implement conversion to icon-box widget when structure matches
  - Implement fallback to container with individual widgets for complex structures
  - Implement layout detection (horizontal vs vertical)
  - Register CompositeWidgetConverter with the registry
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


- [x] 8. Implement FormConverter




  - Create FormConverter class extending BaseConverter
  - Implement detection for form widget patterns
  - Implement extraction of form field definitions from settings and HTML
  - Implement field type mapping to Elementor form field types
  - Implement conversion to Elementor form widget with field definitions
  - Add warning logging about form submission handler limitations
  - Register FormConverter with the registry
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Implement IconListConverter





  - Create IconListConverter class extending BaseConverter
  - Implement detection for icon list widget patterns
  - Implement extraction of list items from settings and HTML
  - Implement extraction of icon, text, and link data per item
  - Implement conversion to Elementor icon-list widget
  - Register IconListConverter with the registry
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Implement TestimonialConverter





  - Create TestimonialConverter class extending BaseConverter
  - Implement detection for testimonial widget patterns
  - Implement extraction of testimonial content, author, image, and rating
  - Implement conversion to Elementor testimonial widget
  - Register TestimonialConverter with the registry
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Implement PricingTableConverter





  - Create PricingTableConverter class extending BaseConverter
  - Implement detection for pricing table widget patterns
  - Implement extraction of price, currency, features, and CTA button
  - Implement conversion to Elementor price-table widget
  - Register PricingTableConverter with the registry
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Implement SocialIconsConverter





  - Create SocialIconsConverter class extending BaseConverter
  - Implement detection for social icons widget patterns
  - Implement extraction of social links and platform types
  - Implement platform name mapping to Elementor social icon types
  - Implement conversion to Elementor social-icons widget
  - Register SocialIconsConverter with the registry
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Implement CountdownConverter





  - Create CountdownConverter class extending BaseConverter
  - Implement detection for countdown widget patterns
  - Implement extraction of target date/time from settings and HTML
  - Implement extraction of labels and completion actions
  - Implement conversion to Elementor countdown widget
  - Register CountdownConverter with the registry
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
-

- [x] 14. Implement AccordionTabsConverter




  - Create AccordionTabsConverter class extending BaseConverter
  - Implement detection for accordion and tabs widget patterns
  - Implement extraction of items with titles and content
  - Implement conversion to Elementor accordion or tabs widget based on type
  - Register AccordionTabsConverter with the registry
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
-

- [x] 15. Implement ProgressCounterConverter




  - Create ProgressCounterConverter class extending BaseConverter
  - Implement detection for progress bar and counter widget patterns
  - Implement extraction of values, percentages, and titles
  - Implement conversion to Elementor progress or counter widget based on type
  - Register ProgressCounterConverter with the registry
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 16. Implement MapConverter





  - Create MapConverter class extending BaseConverter
  - Implement detection for map widget patterns
  - Implement extraction of location data (coordinates, address) from settings and HTML
  - Implement extraction of zoom level and markers
  - Implement conversion to Elementor google_maps widget
  - Register MapConverter with the registry
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
-

- [x] 17. Implement AudioConverter




  - Create AudioConverter class extending BaseConverter
  - Implement detection for audio widget patterns
  - Implement extraction of audio URL from settings and HTML
  - Implement extraction of title and controls settings
  - Implement conversion to Elementor audio widget
  - Register AudioConverter with the registry
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 18. Create integration tests
  - [ ]* 18.1 Write integration test for full conversion pipeline with mixed widget types
  - [ ]* 18.2 Write integration test for registry lookup and fallback behavior
  - [ ]* 18.3 Write integration test for style preservation across conversions
  - [ ]* 18.4 Write integration test for error handling and logging
  - _Requirements: All requirements_
-

- [x] 19. Create real-world test data collection





  - [x] 19.1 Collect widget JSON samples from WoodMart theme









-

  - [ ] 19.2 Collect widget JSON samples from Avada theme











  - [ ]* 19.3 Collect widget JSON samples from Divi theme







  - [x] 19.4 Create test suite using real-world widget data









  - _Requirements: All requirements_

-

- [ ] 20. Performance optimization


  - [ ] 20.1 Implement converter lookup caching in registry


  - [ ] 20.2 Implement lazy HTML parsing (only when settings extraction fails)


  - [ ] 20.3 Implement cached HTML parsing for repeated access


  - [ ]* 20.4 Add performance logging for conversion operations
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ]* 21. Documentation
  - [ ]* 21.1 Add JSDoc comments to all new classes and methods
  - [ ]* 21.2 Create developer guide for adding new converters
  - [ ]* 21.3 Document converter patterns and best practices
  - [ ]* 21.4 Update README with new conversion capabilities
  - _Requirements: All requirements_
