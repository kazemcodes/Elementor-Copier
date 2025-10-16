# Requirements Document

## Introduction

The Native Elementor Paste feature transforms the Chrome extension into a standalone solution that enables users to copy Elementor elements from any website and paste them directly into the Elementor editor, mimicking the native Elementor copy/paste behavior. This eliminates the need for any WordPress plugins (except the official Elementor plugin itself). The extension will intercept the Elementor editor's clipboard operations and inject properly formatted data that Elementor recognizes as if it came from its own copy operation.

## Requirements

### Requirement 1: Elementor Editor Detection and Integration

**User Story:** As a user working in the Elementor editor, I want the extension to seamlessly integrate with the native editor interface, so that I can paste copied elements using standard keyboard shortcuts or the paste button.

#### Acceptance Criteria

1. WHEN the extension loads on a page THEN the system SHALL detect if the Elementor editor is active by checking for `window.elementor` and `window.elementorFrontend`
2. WHEN the Elementor editor is detected THEN the system SHALL inject scripts into the editor context to intercept paste operations
3. WHEN the user is in the Elementor editor THEN the system SHALL monitor for paste events (Ctrl+V, Cmd+V, right-click paste)
4. WHEN a paste event is detected THEN the system SHALL check if the clipboard contains data from the Chrome extension
5. WHEN extension data is found in clipboard THEN the system SHALL convert it to Elementor's native format and trigger Elementor's paste handler
6. WHEN the Elementor editor interface loads THEN the system SHALL ensure compatibility with Elementor's React-based UI
7. WHEN multiple Elementor editor instances exist THEN the system SHALL handle each instance independently

### Requirement 2: Native Elementor Data Format Conversion

**User Story:** As a user pasting copied elements, I want the data to be in Elementor's exact native format, so that all settings, styles, and content are preserved exactly as if I copied from within Elementor itself.

#### Acceptance Criteria

1. WHEN converting extension data THEN the system SHALL transform it to match Elementor's internal clipboard format structure
2. WHEN Elementor's native format requires specific fields THEN the system SHALL generate all required fields including `elType`, `settings`, `elements`, `widgetType`, and `isInner`
3. WHEN converting widget data THEN the system SHALL preserve all widget settings in the exact structure Elementor expects
4. WHEN converting section data THEN the system SHALL maintain the hierarchical structure with columns and nested widgets
5. WHEN converting column data THEN the system SHALL preserve column width settings and responsive breakpoints
6. WHEN converting any element THEN the system SHALL generate unique element IDs in Elementor's format (8-character hexadecimal)
7. WHEN the source Elementor version differs from target THEN the system SHALL attempt to convert deprecated widget types and settings
8. WHEN conversion is complete THEN the system SHALL validate the output matches Elementor's schema

### Requirement 3: Clipboard Format Compatibility

**User Story:** As a user copying elements from external sites, I want the extension to store data in a format that works with Elementor's clipboard system, so that paste operations work seamlessly.

#### Acceptance Criteria

1. WHEN copying an element THEN the system SHALL store data in the clipboard in both extension format and Elementor native format
2. WHEN writing to clipboard THEN the system SHALL use the same MIME type that Elementor uses for clipboard operations
3. WHEN Elementor reads the clipboard THEN the system SHALL ensure the data structure is indistinguishable from native Elementor copy operations
4. WHEN the clipboard contains extension data THEN the system SHALL include a marker to identify it as external data
5. WHEN pasting into Elementor THEN the system SHALL trigger Elementor's native paste handler with the converted data
6. WHEN the clipboard API is not available THEN the system SHALL provide fallback mechanisms for data transfer

### Requirement 4: Media URL Handling Without Plugin

**User Story:** As a user pasting elements with images, I want media URLs to be preserved and functional, so that images display correctly without requiring media downloads.

#### Acceptance Criteria

1. WHEN copying elements with media THEN the system SHALL preserve all image URLs in the Elementor data structure
2. WHEN pasting elements with external media URLs THEN the system SHALL keep the original URLs intact
3. WHEN media URLs are from the source site THEN the system SHALL ensure they are absolute URLs that work cross-domain
4. WHEN background images are present THEN the system SHALL preserve CSS background-image URLs
5. WHEN video URLs are present THEN the system SHALL maintain video embed codes and URLs
6. WHEN the user pastes content THEN the system SHALL display a notification about external media URLs
7. IF media URLs become broken THEN the system SHALL provide guidance on manually updating them in Elementor

### Requirement 5: Elementor Editor Context Injection

**User Story:** As a developer, I want the extension to safely inject code into the Elementor editor context, so that it can interact with Elementor's internal APIs without breaking the editor.

#### Acceptance Criteria

1. WHEN injecting into the editor THEN the system SHALL wait for Elementor's JavaScript to fully load before attempting integration
2. WHEN accessing Elementor APIs THEN the system SHALL use only documented or stable internal APIs
3. WHEN Elementor updates THEN the system SHALL detect version changes and adapt accordingly
4. WHEN injecting scripts THEN the system SHALL avoid conflicts with Elementor's React components
5. WHEN the editor is in preview mode THEN the system SHALL disable paste interception
6. WHEN errors occur in injected code THEN the system SHALL fail gracefully without breaking the editor
7. WHEN the extension updates THEN the system SHALL ensure backward compatibility with older Elementor versions

### Requirement 6: Cross-Site Element Extraction

**User Story:** As a user browsing any Elementor website, I want to copy elements using the same interface as before, so that the extraction process remains familiar and reliable.

#### Acceptance Criteria

1. WHEN the extension detects Elementor on any site THEN the system SHALL enable the context menu and highlight mode
2. WHEN extracting element data THEN the system SHALL parse HTML attributes and inline JSON as before
3. WHEN copying an element THEN the system SHALL extract all settings, content, and media references
4. WHEN the source site uses a different Elementor version THEN the system SHALL note the version for conversion
5. WHEN extraction is complete THEN the system SHALL store data in both extension format and pre-converted Elementor format
6. WHEN the user copies multiple elements THEN the system SHALL maintain a clipboard history
7. WHEN copying from non-Elementor sites THEN the system SHALL display appropriate error messages

### Requirement 7: Paste Operation Interception

**User Story:** As a user in the Elementor editor, I want paste operations to automatically use extension data when available, so that I don't need to perform any special actions beyond standard paste.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+V or Cmd+V in the editor THEN the system SHALL intercept the paste event
2. WHEN the paste event is intercepted THEN the system SHALL check if clipboard contains extension data
3. WHEN extension data is found THEN the system SHALL prevent the default paste behavior and inject converted data
4. WHEN no extension data is found THEN the system SHALL allow normal Elementor paste to proceed
5. WHEN the user clicks Elementor's paste button THEN the system SHALL intercept that action as well
6. WHEN pasting into a specific location THEN the system SHALL respect the user's cursor position or selected container
7. WHEN paste is successful THEN the system SHALL trigger Elementor's history system to allow undo

### Requirement 8: User Feedback and Notifications

**User Story:** As a user pasting elements, I want clear feedback about what was pasted and any potential issues, so that I can verify the operation succeeded.

#### Acceptance Criteria

1. WHEN an element is successfully pasted THEN the system SHALL display a success notification showing the element type
2. WHEN media URLs are external THEN the system SHALL show a warning notification about potential broken links
3. WHEN version conversion occurs THEN the system SHALL notify the user that compatibility adjustments were made
4. WHEN paste fails THEN the system SHALL display an error message with troubleshooting guidance
5. WHEN the Elementor editor is not detected THEN the system SHALL inform the user they must be in edit mode
6. WHEN clipboard data is invalid THEN the system SHALL explain what went wrong and how to fix it
7. WHEN the extension updates THEN the system SHALL show a changelog notification highlighting the native paste feature

### Requirement 9: Compatibility and Version Management

**User Story:** As a user working with different Elementor versions, I want the extension to handle version differences automatically, so that elements paste correctly regardless of version mismatches.

#### Acceptance Criteria

1. WHEN detecting Elementor version THEN the system SHALL read the version from `window.elementor.config.version`
2. WHEN the source version differs from target THEN the system SHALL apply conversion rules for known incompatibilities
3. WHEN widget types have been renamed THEN the system SHALL map old names to new names
4. WHEN settings structures have changed THEN the system SHALL transform settings to the target version format
5. WHEN deprecated features are encountered THEN the system SHALL remove or replace them with modern equivalents
6. WHEN conversion is not possible THEN the system SHALL notify the user and provide the closest alternative
7. WHEN new Elementor versions are released THEN the system SHALL maintain a version compatibility matrix

### Requirement 10: Security and Safety

**User Story:** As a user pasting external content, I want the extension to protect me from malicious code, so that my site remains secure.

#### Acceptance Criteria

1. WHEN extracting data from external sites THEN the system SHALL sanitize all HTML content
2. WHEN converting data THEN the system SHALL strip any JavaScript or event handlers
3. WHEN pasting content THEN the system SHALL validate all URLs are properly formatted
4. WHEN processing settings THEN the system SHALL validate data types match expected schemas
5. WHEN injecting into the editor THEN the system SHALL use Content Security Policy compliant methods
6. WHEN errors occur THEN the system SHALL log them without exposing sensitive information
7. WHEN the user pastes content THEN the system SHALL warn about reviewing external content before publishing

