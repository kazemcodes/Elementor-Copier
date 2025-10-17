# Requirements Document

## Introduction

This document defines requirements for enhancing the intelligent HTML conversion system in the Elementor Copier extension. The current system converts custom widgets to standard Elementor widgets but has limited coverage. This enhancement will expand support to handle every possible scenario users may encounter when copying elements between different WordPress sites with various themes and plugins.

## Glossary

- **Extension**: The Elementor Copier browser extension
- **Custom Widget**: A non-standard Elementor widget created by themes or plugins (e.g., pix-img-box, wd_banner)
- **Standard Widget**: A native Elementor widget (e.g., image, heading, text-editor)
- **Format Converter**: The module responsible for converting extension data to Elementor's native format
- **Widget Conversion**: The process of transforming a custom widget into a standard Elementor widget
- **Rendered Content**: The HTML output of a widget as displayed on the page
- **Widget Settings**: The configuration data stored in a widget's settings object
- **Fallback Conversion**: Converting a widget to an HTML widget when no better conversion is available
- **Extraction Pattern**: A method for extracting data from widget settings or rendered HTML
- **Composite Widget**: A custom widget that contains multiple types of content (e.g., image + text + button)
- **Container Element**: An Elementor section or column that holds other elements

## Requirements

### Requirement 1

**User Story:** As a user copying elements between sites, I want all video widgets to be converted to editable Elementor video widgets, so that I can modify video sources and settings after pasting

#### Acceptance Criteria

1. WHEN a custom video widget is detected, THE Format Converter SHALL extract the video URL from settings or rendered HTML
2. WHEN a video URL is found, THE Format Converter SHALL create a standard Elementor video widget with the extracted URL
3. WHEN the video source is YouTube, THE Format Converter SHALL preserve the video ID and create a YouTube video widget
4. WHEN the video source is Vimeo, THE Format Converter SHALL preserve the video ID and create a Vimeo video widget
5. WHEN the video is self-hosted, THE Format Converter SHALL create a hosted video widget with the video file URL

### Requirement 2

**User Story:** As a user copying gallery elements, I want gallery widgets to be converted to editable Elementor gallery widgets, so that I can manage images after pasting

#### Acceptance Criteria

1. WHEN a custom gallery widget is detected, THE Format Converter SHALL extract all image URLs from settings or rendered HTML
2. WHEN multiple images are found, THE Format Converter SHALL create a standard Elementor image gallery widget
3. WHEN gallery images have captions, THE Format Converter SHALL preserve the caption text for each image
4. WHEN gallery layout settings exist, THE Format Converter SHALL map them to Elementor gallery layout options
5. WHEN fewer than three images are found, THE Format Converter SHALL create an image carousel widget instead

### Requirement 3

**User Story:** As a user copying slider elements, I want slider widgets to be converted to editable Elementor slides, so that I can edit individual slides after pasting

#### Acceptance Criteria

1. WHEN a custom slider widget is detected, THE Format Converter SHALL extract all slide data from settings or rendered HTML
2. WHEN slide data is found, THE Format Converter SHALL create a standard Elementor slides widget
3. WHEN each slide contains an image, THE Format Converter SHALL preserve the image URL in the slide settings
4. WHEN each slide contains text content, THE Format Converter SHALL preserve the text in the slide settings
5. WHEN slider navigation settings exist, THE Format Converter SHALL map them to Elementor slides navigation options

### Requirement 4

**User Story:** As a user copying form elements, I want form widgets to be converted to editable Elementor forms, so that I can modify form fields after pasting

#### Acceptance Criteria

1. WHEN a custom form widget is detected, THE Format Converter SHALL extract all form field definitions from settings or rendered HTML
2. WHEN form fields are found, THE Format Converter SHALL create a standard Elementor form widget
3. WHEN each field has a label, THE Format Converter SHALL preserve the label text in the form field settings
4. WHEN each field has a type, THE Format Converter SHALL map the field type to Elementor form field types
5. WHEN form submission settings exist, THE Format Converter SHALL preserve the action URL or email address

### Requirement 5

**User Story:** As a user copying icon list elements, I want icon lists to be converted to editable Elementor icon lists, so that I can modify list items after pasting

#### Acceptance Criteria

1. WHEN a custom icon list widget is detected, THE Format Converter SHALL extract all list items from settings or rendered HTML
2. WHEN list items are found, THE Format Converter SHALL create a standard Elementor icon list widget
3. WHEN each item has an icon, THE Format Converter SHALL preserve the icon class or SVG in the list item settings
4. WHEN each item has text, THE Format Converter SHALL preserve the text content in the list item settings
5. WHEN each item has a link, THE Format Converter SHALL preserve the link URL in the list item settings

### Requirement 6

**User Story:** As a user copying testimonial elements, I want testimonials to be converted to editable Elementor testimonials, so that I can modify testimonial content after pasting

#### Acceptance Criteria

1. WHEN a custom testimonial widget is detected, THE Format Converter SHALL extract testimonial content from settings or rendered HTML
2. WHEN testimonial content is found, THE Format Converter SHALL create a standard Elementor testimonial widget
3. WHEN the testimonial has an author name, THE Format Converter SHALL preserve the name in the testimonial settings
4. WHEN the testimonial has an author image, THE Format Converter SHALL preserve the image URL in the testimonial settings
5. WHEN the testimonial has a rating, THE Format Converter SHALL preserve the rating value in the testimonial settings

### Requirement 7

**User Story:** As a user copying pricing table elements, I want pricing tables to be converted to editable Elementor pricing tables, so that I can modify prices and features after pasting

#### Acceptance Criteria

1. WHEN a custom pricing table widget is detected, THE Format Converter SHALL extract pricing data from settings or rendered HTML
2. WHEN pricing data is found, THE Format Converter SHALL create a standard Elementor pricing table widget
3. WHEN the table has a price, THE Format Converter SHALL preserve the price value and currency in the settings
4. WHEN the table has feature items, THE Format Converter SHALL preserve all feature text in the settings
5. WHEN the table has a call-to-action button, THE Format Converter SHALL preserve the button text and link in the settings

### Requirement 8

**User Story:** As a user copying countdown timer elements, I want countdown timers to be converted to editable Elementor countdown widgets, so that I can modify the target date after pasting

#### Acceptance Criteria

1. WHEN a custom countdown widget is detected, THE Format Converter SHALL extract the target date from settings or rendered HTML
2. WHEN a target date is found, THE Format Converter SHALL create a standard Elementor countdown widget
3. WHEN the countdown has custom labels, THE Format Converter SHALL preserve the label text in the settings
4. WHEN the countdown has a completion action, THE Format Converter SHALL map it to Elementor countdown actions
5. WHEN the countdown format is specified, THE Format Converter SHALL preserve the display format in the settings

### Requirement 9

**User Story:** As a user copying social icon elements, I want social icons to be converted to editable Elementor social icons, so that I can modify links after pasting

#### Acceptance Criteria

1. WHEN a custom social icons widget is detected, THE Format Converter SHALL extract all social links from settings or rendered HTML
2. WHEN social links are found, THE Format Converter SHALL create a standard Elementor social icons widget
3. WHEN each icon has a platform type, THE Format Converter SHALL map it to Elementor social icon types
4. WHEN each icon has a URL, THE Format Converter SHALL preserve the URL in the icon settings
5. WHEN icon styling exists, THE Format Converter SHALL map style settings to Elementor social icon styles

### Requirement 10

**User Story:** As a user copying composite widgets, I want complex widgets with multiple content types to be converted to appropriate container structures, so that all content is preserved and editable

#### Acceptance Criteria

1. WHEN a composite widget with image and text is detected, THE Format Converter SHALL create a section containing separate image and text widgets
2. WHEN a composite widget with icon, heading, and text is detected, THE Format Converter SHALL create an icon-box widget with all content
3. WHEN a composite widget structure cannot be mapped, THE Format Converter SHALL create a container with individual widgets for each content type
4. WHEN composite widget layout is horizontal, THE Format Converter SHALL create a section with columns for each content piece
5. WHEN composite widget layout is vertical, THE Format Converter SHALL create a section with stacked widgets

### Requirement 11

**User Story:** As a user copying accordion or tab elements, I want them to be converted to editable Elementor accordions or tabs, so that I can modify the content after pasting

#### Acceptance Criteria

1. WHEN a custom accordion widget is detected, THE Format Converter SHALL extract all accordion items from settings or rendered HTML
2. WHEN accordion items are found, THE Format Converter SHALL create a standard Elementor accordion widget
3. WHEN each item has a title, THE Format Converter SHALL preserve the title text in the accordion item settings
4. WHEN each item has content, THE Format Converter SHALL preserve the content HTML in the accordion item settings
5. WHEN a custom tabs widget is detected, THE Format Converter SHALL create a standard Elementor tabs widget with the same structure

### Requirement 12

**User Story:** As a user copying progress bar or counter elements, I want them to be converted to editable Elementor progress or counter widgets, so that I can modify values after pasting

#### Acceptance Criteria

1. WHEN a custom progress bar widget is detected, THE Format Converter SHALL extract the progress value from settings or rendered HTML
2. WHEN a progress value is found, THE Format Converter SHALL create a standard Elementor progress widget
3. WHEN the progress bar has a title, THE Format Converter SHALL preserve the title in the settings
4. WHEN a custom counter widget is detected, THE Format Converter SHALL create a standard Elementor counter widget
5. WHEN the counter has a target number, THE Format Converter SHALL preserve the number in the counter settings

### Requirement 13

**User Story:** As a user copying map elements, I want map widgets to be converted to editable Elementor map widgets, so that I can modify locations after pasting

#### Acceptance Criteria

1. WHEN a custom map widget is detected, THE Format Converter SHALL extract location data from settings or rendered HTML
2. WHEN location coordinates are found, THE Format Converter SHALL create a standard Elementor Google Maps widget
3. WHEN a location address is found, THE Format Converter SHALL preserve the address in the map settings
4. WHEN map zoom level is specified, THE Format Converter SHALL preserve the zoom level in the settings
5. WHEN multiple markers exist, THE Format Converter SHALL preserve all marker locations in the map settings

### Requirement 14

**User Story:** As a user copying audio player elements, I want audio widgets to be converted to editable Elementor audio widgets, so that I can modify audio sources after pasting

#### Acceptance Criteria

1. WHEN a custom audio widget is detected, THE Format Converter SHALL extract the audio URL from settings or rendered HTML
2. WHEN an audio URL is found, THE Format Converter SHALL create a standard Elementor audio widget
3. WHEN the audio has a title, THE Format Converter SHALL preserve the title in the audio settings
4. WHEN audio player controls are specified, THE Format Converter SHALL map them to Elementor audio widget controls
5. WHEN the audio is from a streaming service, THE Format Converter SHALL preserve the embed URL

### Requirement 15

**User Story:** As a developer maintaining the conversion system, I want a plugin architecture for widget converters, so that new widget types can be added without modifying core code

#### Acceptance Criteria

1. THE Format Converter SHALL provide a registration method for custom widget converters
2. WHEN a converter is registered, THE Format Converter SHALL store it in a converter registry
3. WHEN converting a widget, THE Format Converter SHALL check the registry for a matching converter
4. WHEN a registered converter is found, THE Format Converter SHALL delegate conversion to that converter
5. WHEN no registered converter is found, THE Format Converter SHALL fall back to the default conversion logic

### Requirement 16

**User Story:** As a user copying widgets with custom styling, I want CSS classes and inline styles to be preserved, so that visual appearance is maintained after pasting

#### Acceptance Criteria

1. WHEN a widget has custom CSS classes, THE Format Converter SHALL preserve them in the _css_classes setting
2. WHEN a widget has inline styles, THE Format Converter SHALL extract and preserve them in the appropriate Elementor settings
3. WHEN color values are found in styles, THE Format Converter SHALL map them to Elementor color settings
4. WHEN spacing values are found in styles, THE Format Converter SHALL map them to Elementor spacing settings
5. WHEN typography styles are found, THE Format Converter SHALL map them to Elementor typography settings

### Requirement 17

**User Story:** As a user copying widgets that fail to convert, I want detailed error information, so that I can understand what went wrong and report issues

#### Acceptance Criteria

1. WHEN widget conversion fails, THE Format Converter SHALL log the widget type and error details to the console
2. WHEN conversion fails, THE Format Converter SHALL include the original widget data in the error log
3. WHEN conversion falls back to HTML widget, THE Format Converter SHALL log a warning with the reason
4. WHEN multiple widgets fail in a section, THE Format Converter SHALL log a summary of all failures
5. WHEN conversion succeeds with data loss, THE Format Converter SHALL log a warning about which data was not preserved
