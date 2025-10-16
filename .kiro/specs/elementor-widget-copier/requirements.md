# Requirements Document

## Introduction

The Elementor Widget Copier is a two-part system consisting of a Chrome browser extension and a WordPress plugin that work together to enable administrators to seamlessly copy Elementor widgets, sections, or full pages from ANY Elementor website to their local WordPress site. The Chrome extension extracts Elementor data directly from the HTML source of any Elementor site through a simple right-click interface, while the WordPress plugin receives and imports this data. This approach eliminates the need for API access, authentication, or plugin installation on source sites. The system provides a simple copy/paste workflow similar to copying text, making it accessible to users of all technical levels. The WordPress plugin features full Persian (Farsi) language support as the primary interface language.

## Requirements

### Requirement 1: Chrome Extension - Element Detection and Selection

**User Story:** As a user browsing any Elementor website, I want to easily identify and select Elementor elements through a visual interface, so that I can copy the exact widget, section, or page I need.

#### Acceptance Criteria

1. WHEN the extension is installed and a page loads THEN the system SHALL automatically detect if the page uses Elementor by checking for Elementor-specific HTML attributes and classes
2. WHEN Elementor is detected THEN the system SHALL update the extension badge to show the number of Elementor elements found on the page
3. WHEN the user right-clicks on any element THEN the system SHALL display a context menu with options: "Copy Widget", "Copy Section", "Copy Column", "Copy Entire Page"
4. WHEN the user enables highlight mode THEN the system SHALL visually highlight Elementor elements on hover with color-coded overlays (blue for widgets, green for sections, orange for columns)
5. WHEN hovering over an element in highlight mode THEN the system SHALL display an info tooltip showing the element type and widget name
6. WHEN the user clicks an element in highlight mode THEN the system SHALL automatically copy that element's data to the clipboard
7. WHEN the extension popup is opened THEN the system SHALL display site status, element count, and quick action buttons
8. WHEN no Elementor is detected THEN the system SHALL display an appropriate message in the extension popup

### Requirement 2: Chrome Extension - Data Extraction from HTML

**User Story:** As a user who has selected an Elementor element, I want the extension to extract complete and accurate data from the HTML source, so that all design elements, settings, and content are preserved for import.

#### Acceptance Criteria

1. WHEN an element is selected for copying THEN the system SHALL extract data from HTML attributes including data-elementor-type, data-elementor-id, data-elementor-settings, and data-widget_type
2. WHEN extracting widget data THEN the system SHALL parse the data-elementor-settings JSON attribute to retrieve all widget configuration
3. WHEN extracting section data THEN the system SHALL recursively extract all child columns and widgets within that section
4. WHEN extracting page data THEN the system SHALL extract the complete page structure including all sections, columns, and widgets
5. WHEN extracting any element THEN the system SHALL identify and collect all media URLs (images, background images, videos) referenced in the element
6. WHEN extracting content THEN the system SHALL preserve text content, HTML markup, links, and styling information
7. WHEN data extraction is complete THEN the system SHALL create a standardized JSON payload with version, type, data, media array, and metadata fields
8. WHEN the Elementor version can be detected THEN the system SHALL include it in the metadata for compatibility checking
9. IF data extraction fails THEN the system SHALL log the error and show a user-friendly notification

### Requirement 3: Chrome Extension - Clipboard Management

**User Story:** As a user who has extracted Elementor data, I want the extension to copy it to my clipboard in a structured format, so that I can easily paste it into my WordPress admin panel.

#### Acceptance Criteria

1. WHEN data extraction is complete THEN the system SHALL format the data as a JSON string with proper indentation
2. WHEN copying to clipboard THEN the system SHALL use the Clipboard API to write the JSON data
3. WHEN the copy operation succeeds THEN the system SHALL display a success notification showing what was copied (e.g., "Widget copied to clipboard!")
4. WHEN the copy operation fails THEN the system SHALL display an error notification with guidance
5. WHEN data is copied THEN the system SHALL update the extension badge with a checkmark indicator
6. WHEN the extension popup is opened THEN the system SHALL display information about the last copied item including type and timestamp
7. WHEN the user clicks "View Clipboard" in the popup THEN the system SHALL display a preview of the clipboard data
8. WHEN the user clicks "Clear Clipboard" THEN the system SHALL clear the clipboard and reset the last copied item display

### Requirement 4: WordPress Plugin - Paste from Clipboard Interface

**User Story:** As a WordPress administrator, I want a simple interface to paste Elementor data from my clipboard, so that I can quickly import elements copied with the Chrome extension.

#### Acceptance Criteria

1. WHEN the plugin admin page loads THEN the system SHALL display a "Paste from Clipboard" section with a prominent paste button in Persian
2. WHEN the paste button is clicked THEN the system SHALL use JavaScript to read the clipboard content via the Clipboard API
3. WHEN clipboard data is read THEN the system SHALL validate that it contains valid Elementor Copier JSON format
4. WHEN valid data is detected THEN the system SHALL display a preview showing the element type, source URL, and copy timestamp
5. WHEN the preview is shown THEN the system SHALL enable import options including: create new page, add to existing page, or save as template
6. WHEN invalid or no data is found THEN the system SHALL display a Persian error message explaining the issue
7. WHEN the clipboard contains non-Elementor data THEN the system SHALL show a message: "داده‌های المنتور در کلیپ‌بورد یافت نشد"
8. WHEN the paste interface is displayed THEN the system SHALL include instructions in Persian on how to use the Chrome extension

### Requirement 5: WordPress Plugin - Data Validation and Import

**User Story:** As a WordPress administrator, I want the plugin to safely validate and import pasted Elementor data, so that the content integrates correctly with my local Elementor installation.

#### Acceptance Criteria

1. WHEN clipboard data is received THEN the system SHALL validate the JSON structure matches the expected Elementor Copier format
2. WHEN validating data THEN the system SHALL check for required fields: version, type, elementType, data, and metadata
3. WHEN the data structure is valid THEN the system SHALL sanitize all HTML content and settings to prevent XSS attacks
4. WHEN media URLs are present THEN the system SHALL validate URL formats and optionally download media to local media library
5. WHEN the user selects import options THEN the system SHALL create the target page/post or retrieve the existing one based on selection
6. WHEN inserting data THEN the system SHALL use Elementor's API to properly insert the widget/section JSON into the page structure
7. WHEN import is complete THEN the system SHALL regenerate Elementor CSS and clear relevant caches
8. WHEN import succeeds THEN the system SHALL display a success message in Persian with a link to edit the page in Elementor
9. IF import fails THEN the system SHALL display a detailed error message in Persian with troubleshooting suggestions

### Requirement 6: WordPress Plugin - Media Handling

**User Story:** As a WordPress administrator, I want media files from copied elements to be automatically downloaded and imported, so that images and other media display correctly on my site.

#### Acceptance Criteria

1. WHEN imported data contains media URLs THEN the system SHALL display a media handling option: "Download to Media Library" or "Keep Original URLs"
2. WHEN "Download to Media Library" is selected THEN the system SHALL download each media file from the source URL
3. WHEN downloading media THEN the system SHALL show a progress indicator in Persian for each file being downloaded
4. WHEN a media file is downloaded THEN the system SHALL upload it to the WordPress media library and get the new local URL
5. WHEN media is uploaded THEN the system SHALL update the Elementor data JSON to reference the new local media URLs
6. IF a media download fails THEN the system SHALL log the error, display a warning in Persian, and continue with original URL
7. WHEN media already exists in the library (based on filename) THEN the system SHALL provide an option to skip or re-download
8. WHEN all media is processed THEN the system SHALL display a summary showing successful downloads and any failures

### Requirement 7: WordPress Plugin - Persian Admin Interface

**User Story:** As a Persian-speaking WordPress administrator, I want the entire plugin interface in Persian language with RTL support, so that I can use it comfortably in my native language.

#### Acceptance Criteria

1. WHEN the plugin is activated THEN the system SHALL add a submenu item under "Tools" menu with Persian text "کپی ویجت المنتور"
2. WHEN the admin page loads THEN the system SHALL display all interface elements in Persian (Farsi) language
3. WHEN rendering the interface THEN the system SHALL apply RTL (right-to-left) CSS styling automatically for Persian text
4. WHEN displaying buttons THEN the system SHALL use Persian labels: "جایگذاری از کلیپ‌بورد" (Paste from Clipboard), "وارد کردن" (Import)
5. WHEN showing status messages THEN the system SHALL display them in Persian with appropriate styling for RTL layout
6. WHEN displaying instructions THEN the system SHALL provide clear Persian explanations of how to use the Chrome extension
7. WHEN errors occur THEN the system SHALL show Persian error messages with actionable guidance
8. WHEN the WordPress site language is set to Persian THEN the system SHALL automatically use Persian translations from .po/.mo files

### Requirement 8: Security and Access Control

**User Story:** As a WordPress administrator, I want the system to implement robust security measures, so that only authorized users can import content and the system is protected from malicious data.

#### Acceptance Criteria

1. WHEN accessing the admin interface THEN the system SHALL verify that the current user has 'manage_options' or 'edit_pages' capability
2. WHEN processing AJAX requests THEN the system SHALL verify WordPress nonces for CSRF protection
3. WHEN receiving clipboard data THEN the system SHALL validate and sanitize all HTML content to prevent XSS attacks
4. WHEN processing JSON data THEN the system SHALL validate data types and structure before any database operations
5. WHEN downloading media files THEN the system SHALL validate file types and sizes to prevent malicious uploads
6. WHEN inserting data into Elementor THEN the system SHALL use WordPress and Elementor sanitization functions
7. IF the user lacks sufficient privileges THEN the system SHALL deny access with a Persian error message
8. WHEN any security validation fails THEN the system SHALL log the attempt and display an appropriate error message
9. WHEN importing content THEN the system SHALL scan for potentially malicious scripts or code patterns

### Requirement 9: Chrome Extension - User Experience and Feedback

**User Story:** As a user of the Chrome extension, I want clear visual feedback and intuitive interactions, so that I can easily understand what elements I'm copying and whether operations succeed.

#### Acceptance Criteria

1. WHEN the extension detects Elementor THEN the system SHALL update the extension icon badge with a green indicator and element count
2. WHEN no Elementor is detected THEN the system SHALL show a red indicator on the extension badge
3. WHEN an element is successfully copied THEN the system SHALL display a browser notification with the element type and confirmation
4. WHEN highlight mode is enabled THEN the system SHALL change the cursor to a crosshair and add visual overlays to Elementor elements
5. WHEN hovering over elements in highlight mode THEN the system SHALL show smooth transitions and clear element boundaries
6. WHEN the extension popup is opened THEN the system SHALL display current page status, element statistics, and recent clipboard activity
7. WHEN operations fail THEN the system SHALL display user-friendly error messages with suggestions for resolution
8. WHEN the user interacts with the extension THEN the system SHALL provide immediate visual feedback for all actions

### Requirement 10: Technical Implementation and Compatibility

**User Story:** As a developer, I want both the Chrome extension and WordPress plugin to follow best practices and maintain compatibility, so that the system works reliably across different environments and Elementor versions.

#### Acceptance Criteria

1. WHEN the Chrome extension is built THEN the system SHALL use Manifest V3 format for Chrome extension compatibility
2. WHEN the extension code is organized THEN the system SHALL separate concerns into background.js, content.js, and popup components
3. WHEN the WordPress plugin is structured THEN the system SHALL follow WordPress coding standards and use proper namespacing
4. WHEN the plugin initializes THEN the system SHALL check for Elementor plugin activation and display appropriate warnings if not found
5. WHEN handling Elementor data THEN the system SHALL support Elementor versions 2.0 through latest with version detection
6. WHEN the admin interface is built THEN the system SHALL use WordPress admin styles and enqueue scripts/styles properly
7. WHEN JavaScript is used THEN the system SHALL ensure compatibility with modern browsers and handle clipboard API permissions
8. WHEN the plugin is structured THEN the system SHALL organize files into logical directories: includes/, assets/js/, assets/css/, languages/
9. WHEN both components communicate THEN the system SHALL use a standardized JSON format with versioning for future compatibility
10. WHEN errors occur THEN the system SHALL implement proper error handling and logging without exposing sensitive information
