# Design Document

## Overview

The Elementor Widget Copier system consists of two integrated components: a Chrome browser extension for data extraction and a WordPress plugin for data import. The Chrome extension runs in the user's browser and extracts Elementor data directly from the HTML DOM of any Elementor-powered website. The WordPress plugin provides a Persian-language admin interface for receiving clipboard data and importing it into the local Elementor installation. This design eliminates the need for API access, authentication, or remote plugin installation, providing a simple copy/paste workflow.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Chrome Extension                            │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ Background   │  │  Content     │               │    │
│  │  │  Service     │◄─┤   Script     │               │    │
│  │  │  Worker      │  │              │               │    │
│  │  └──────┬───────┘  └──────┬───────┘               │    │
│  │         │                  │                        │    │
│  │         │                  │                        │    │
│  │  ┌──────▼──────────────────▼───────┐               │    │
│  │  │      Clipboard API               │               │    │
│  │  └──────────────────────────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User copies data
                         │ User pastes in WordPress
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                WordPress Admin Panel                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Elementor Copier Plugin                     │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Admin      │  │   Import     │               │    │
│  │  │   Page       │─►│   Handler    │               │    │
│  │  │  (Persian)   │  │              │               │    │
│  │  └──────────────┘  └──────┬───────┘               │    │
│  │                            │                        │    │
│  │                     ┌──────▼───────┐               │    │
│  │                     │  Elementor   │               │    │
│  │                     │     API      │               │    │
│  │                     └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Detection Phase**: Content script detects Elementor elements in DOM
2. **Extraction Phase**: User selects element → Content script extracts data from HTML attributes
3. **Copy Phase**: Background script formats data as JSON → Writes to clipboard
4. **Paste Phase**: User opens WordPress admin → Clicks paste button → JavaScript reads clipboard
5. **Import Phase**: Plugin validates data → Downloads media → Inserts into Elementor → Regenerates CSS

---

## Components and Interfaces

### Chrome Extension Components

#### 1. Manifest Configuration (manifest.json)
- **Purpose**: Defines extension metadata, permissions, and component files
- **Key Permissions**:
  - `contextMenus`: Create right-click menu options
  - `clipboardWrite`: Write data to clipboard
  - `activeTab`: Access current tab content
  - `host_permissions`: Access all HTTP/HTTPS sites
- **Content Scripts**: Inject content.js and highlight.css into all pages
- **Background Service Worker**: background.js for context menu and message handling

#### 2. Background Service Worker (background.js)
- **Responsibilities**:
  - Create and manage context menu items on extension install
  - Handle context menu click events
  - Route messages between content script and popup
  - Manage clipboard write operations
  - Display browser notifications
  - Update extension badge
- **Key Functions**:
  - `chrome.runtime.onInstalled`: Initialize context menus
  - `chrome.contextMenus.onClicked`: Handle menu selections
  - `chrome.runtime.onMessage`: Process messages from content script
  - `copyToClipboard(data)`: Write JSON to clipboard using Clipboard API

#### 3. Content Script (content.js)
- **Responsibilities**:
  - Detect Elementor elements in page DOM
  - Extract data from HTML attributes
  - Manage highlight mode and visual overlays
  - Handle user interactions (hover, click)
  - Communicate with background script
- **Key Classes**:
  - `ElementorCopier`: Main controller class
- **Key Methods**:
  - `detectElementor()`: Check for Elementor indicators
  - `extractElementData(element, type)`: Parse element attributes and build JSON
  - `extractChildElements(parent)`: Recursively extract nested elements
  - `extractMediaUrls(element)`: Find all media references
  - `copyToClipboard(data)`: Send data to background for clipboard write
  - `toggleHighlightMode()`: Enable/disable visual element selection
  - `highlightElement(element)`: Show overlay on hover
- **Elementor Detection Selectors**:
  - `[data-elementor-type]`
  - `[data-elementor-id]`
  - `[data-elementor-settings]`
  - `.elementor-element`
  - `.elementor-widget`
  - `.elementor-section`

#### 4. Popup Interface (popup/popup.html, popup.js, popup.css)
- **Responsibilities**:
  - Display extension status and statistics
  - Provide quick action buttons
  - Show clipboard history
  - Display element list
- **UI Elements**:
  - Status indicator (Elementor detected/not detected)
  - Element count display
  - Toggle highlight mode button
  - Copy entire page button
  - Show elements list button
  - Clipboard viewer
  - Instructions section
- **Key Functions**:
  - `checkSiteStatus()`: Query content script for Elementor detection
  - `toggleHighlightMode()`: Send message to enable highlight mode
  - `copyPage()`: Trigger full page copy
  - `viewClipboard()`: Read and display clipboard content

#### 5. Highlight Styles (styles/highlight.css)
- **Purpose**: Visual styling for element highlighting
- **Features**:
  - Color-coded overlays by element type
  - Smooth transitions and animations
  - Info tooltips
  - Crosshair cursor in highlight mode
  - RTL support for Persian text

---

### WordPress Plugin Components

#### 1. Main Plugin File (elementor-copier.php)
- **Purpose**: Plugin initialization and WordPress integration
- **Responsibilities**:
  - Define plugin metadata (name, version, author)
  - Check for Elementor plugin activation
  - Initialize plugin classes
  - Register activation/deactivation hooks
  - Load text domain for translations
- **Key Hooks**:
  - `plugins_loaded`: Initialize plugin after WordPress loads
  - `admin_notices`: Display warnings if Elementor not active

#### 2. Admin Page Class (includes/admin/class-adminpage.php)
- **Purpose**: Render and manage the WordPress admin interface
- **Responsibilities**:
  - Register admin menu item under Tools
  - Render admin page with Persian interface
  - Enqueue JavaScript and CSS files
  - Handle AJAX requests for paste and import
  - Display success/error messages
- **Key Methods**:
  - `add_menu_page()`: Register "کپی ویجت المنتور" menu item
  - `render_page()`: Output HTML for admin interface
  - `enqueue_scripts()`: Load admin.js and admin-rtl.css
  - `handle_paste_request()`: Process clipboard data from AJAX
- **UI Sections**:
  - Paste from clipboard section with button
  - Data preview area
  - Import options (new page, existing page, template)
  - Media handling options
  - Progress indicators
  - Instructions in Persian

#### 3. Import Handler Class (includes/import/class-import-handler.php)
- **Purpose**: Process and import Elementor data
- **Responsibilities**:
  - Validate clipboard JSON structure
  - Sanitize all data for security
  - Download and import media files
  - Insert data into Elementor pages
  - Regenerate Elementor CSS
  - Handle version compatibility
- **Key Methods**:
  - `validate_data($json)`: Check JSON structure and required fields
  - `sanitize_data($data)`: Clean HTML and settings
  - `import_element($data, $target)`: Insert into Elementor
  - `download_media($urls)`: Fetch and upload media files
  - `update_media_urls($data, $mapping)`: Replace URLs with local ones
  - `regenerate_css($post_id)`: Trigger Elementor CSS regeneration
- **Validation Rules**:
  - Check for required fields: version, type, elementType, data
  - Validate JSON structure matches Elementor format
  - Sanitize HTML using `wp_kses_post()`
  - Validate media URLs and file types

#### 4. Media Handler Class (includes/media/class-media-handler.php)
- **Purpose**: Download and manage media files
- **Responsibilities**:
  - Extract media URLs from Elementor data
  - Download files from remote URLs
  - Upload to WordPress media library
  - Create URL mapping for data updates
  - Handle errors and retries
- **Key Methods**:
  - `extract_media_urls($data)`: Find all image/video URLs
  - `download_file($url)`: Fetch remote file
  - `upload_to_library($file)`: Add to WordPress media library
  - `check_existing($filename)`: Avoid duplicate uploads
- **Supported Media Types**:
  - Images: jpg, jpeg, png, gif, svg, webp
  - Videos: mp4, webm, ogg
  - Background images from CSS

#### 5. REST API Controller (includes/api/class-rest-controller.php)
- **Purpose**: Provide REST API endpoints for AJAX operations
- **Responsibilities**:
  - Register REST routes
  - Handle paste requests
  - Handle import requests
  - Verify nonces and permissions
  - Return JSON responses
- **Endpoints**:
  - `POST /wp-json/elementor-copier/v1/paste`: Receive clipboard data
  - `POST /wp-json/elementor-copier/v1/import`: Trigger import operation
  - `GET /wp-json/elementor-copier/v1/status`: Check plugin status
- **Security**:
  - Verify `manage_options` or `edit_pages` capability
  - Check WordPress nonces
  - Sanitize all input data

#### 6. JavaScript (assets/js/admin.js)
- **Purpose**: Handle client-side interactions
- **Responsibilities**:
  - Read clipboard using Clipboard API
  - Send AJAX requests to REST endpoints
  - Update UI with responses
  - Show progress indicators
  - Handle errors
- **Key Functions**:
  - `pasteFromClipboard()`: Read clipboard and send to server
  - `showPreview(data)`: Display data preview
  - `triggerImport(options)`: Send import request
  - `updateProgress(percent)`: Update progress bar
  - `showMessage(text, type)`: Display admin notices

#### 7. Styles (assets/css/admin-rtl.css)
- **Purpose**: RTL styling for Persian interface
- **Features**:
  - Right-to-left layout
  - Persian font support
  - WordPress admin theme integration
  - Responsive design
  - Loading animations

---

## Data Models

### Clipboard Data Structure

The standardized JSON format used for clipboard transfer:

```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget|section|column|page",
  "data": {
    "id": "unique_element_id",
    "elType": "widget|section|column|container",
    "widgetType": "heading|text-editor|image|button|...",
    "settings": {
      // All widget/element settings
      "title": "Example Title",
      "color": "#000000",
      // ... other settings
    },
    "elements": [
      // Nested child elements (for sections/columns)
    ],
    "content": {
      "text": "Text content",
      "html": "<p>HTML content</p>",
      "images": [],
      "links": []
    }
  },
  "media": [
    {
      "id": "unique_media_id",
      "url": "https://source.com/image.jpg",
      "type": "image|background-image|video",
      "alt": "Alt text",
      "width": 1920,
      "height": 1080
    }
  ],
  "metadata": {
    "sourceUrl": "https://source-site.com/page",
    "copiedAt": "2025-10-15T12:00:00Z",
    "elementorVersion": "3.16.0",
    "pageTitle": "Source Page Title",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Field Descriptions

- **version**: Format version for future compatibility
- **type**: Identifier for Elementor Copier data
- **elementType**: High-level type (widget, section, column, page)
- **data**: Core Elementor element data
  - **id**: Unique element identifier
  - **elType**: Elementor element type
  - **widgetType**: Specific widget type (for widgets)
  - **settings**: All configuration settings as key-value pairs
  - **elements**: Array of child elements (recursive structure)
  - **content**: Extracted content for reference
- **media**: Array of all media references
  - **id**: Unique identifier for this media item
  - **url**: Original source URL
  - **type**: Media type classification
  - **alt/width/height**: Additional metadata
- **metadata**: Context information
  - **sourceUrl**: Original page URL
  - **copiedAt**: ISO 8601 timestamp
  - **elementorVersion**: Detected version
  - **pageTitle**: Source page title
  - **userAgent**: Browser information

### Database Schema

WordPress plugin stores imported data using standard Elementor post meta:

- **Post Meta Key**: `_elementor_data`
- **Value**: JSON array of Elementor elements
- **Additional Meta**:
  - `_elementor_edit_mode`: 'builder'
  - `_elementor_template_type`: 'wp-page' or 'wp-post'
  - `_elementor_version`: Current Elementor version
  - `_elementor_css`: Generated CSS (auto-regenerated)

---

## Error Handling

### Chrome Extension Error Scenarios

1. **Elementor Not Detected**
   - Display: "No Elementor elements found on this page"
   - Action: Disable copy options, show help link

2. **Data Extraction Failed**
   - Display: "Could not extract Elementor data from this element"
   - Action: Log error, suggest trying parent element

3. **Clipboard Write Failed**
   - Display: "Failed to copy to clipboard"
   - Action: Check browser permissions, retry

4. **Invalid Element Selected**
   - Display: "No Elementor element found at this location"
   - Action: Suggest using highlight mode

### WordPress Plugin Error Scenarios

1. **Invalid Clipboard Data**
   - Display (Persian): "داده‌های نامعتبر در کلیپ‌بورد"
   - Action: Show expected format, link to instructions

2. **Elementor Not Installed**
   - Display (Persian): "افزونه المنتور نصب نشده است"
   - Action: Show installation link, disable import

3. **Media Download Failed**
   - Display (Persian): "خطا در دانلود تصویر: [filename]"
   - Action: Continue with original URL, log error

4. **Import Failed**
   - Display (Persian): "خطا در وارد کردن داده‌ها"
   - Action: Show detailed error, offer retry

5. **Permission Denied**
   - Display (Persian): "شما دسترسی لازم را ندارید"
   - Action: Explain required capabilities

6. **Version Incompatibility**
   - Display (Persian): "نسخه المنتور سازگار نیست"
   - Action: Attempt conversion, warn user

### Error Logging

- Chrome extension: `console.error()` with context
- WordPress plugin: `error_log()` with sanitized data
- User-facing: Translated, actionable messages
- Developer-facing: Technical details in logs

---

## Testing Strategy

### Chrome Extension Testing

1. **Unit Tests**
   - Data extraction functions
   - JSON formatting
   - Media URL detection
   - Element type detection

2. **Integration Tests**
   - Context menu creation
   - Clipboard API operations
   - Message passing between components
   - Popup interactions

3. **Manual Testing**
   - Test on various Elementor sites
   - Test different element types
   - Test highlight mode
   - Test on different browsers (Chrome, Edge, Brave)
   - Test with different Elementor versions

4. **Edge Cases**
   - Pages with no Elementor
   - Nested elements
   - Large page structures
   - Missing data attributes
   - Malformed JSON in attributes

### WordPress Plugin Testing

1. **Unit Tests**
   - Data validation functions
   - Sanitization functions
   - Media URL extraction
   - URL mapping

2. **Integration Tests**
   - AJAX request handling
   - REST API endpoints
   - Elementor API integration
   - Media library uploads
   - CSS regeneration

3. **Manual Testing**
   - Paste from clipboard
   - Import to new page
   - Import to existing page
   - Media download
   - Persian interface display
   - RTL layout
   - Different WordPress versions
   - Different Elementor versions

4. **Security Testing**
   - XSS prevention
   - CSRF protection
   - Capability checks
   - Input sanitization
   - SQL injection prevention

5. **Edge Cases**
   - Empty clipboard
   - Invalid JSON
   - Missing media files
   - Large data payloads
   - Elementor not installed
   - Insufficient permissions

### Test Data

Create sample Elementor data for:
- Simple widget (heading, text)
- Widget with media (image, video)
- Section with multiple widgets
- Nested sections
- Full page structure
- Different Elementor versions

---

## File Structure

### Chrome Extension

```
chrome-extension/
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker for context menu and messaging
├── content.js                    # DOM manipulation and data extraction
├── popup/
│   ├── popup.html               # Extension popup interface
│   ├── popup.js                 # Popup logic and interactions
│   └── popup.css                # Popup styling
├── styles/
│   └── highlight.css            # Element highlighting styles
├── icons/
│   ├── icon16.png              # Toolbar icon
│   ├── icon48.png              # Extension management icon
│   ├── icon128.png             # Chrome Web Store icon
│   └── README.md               # Icon guidelines
└── README.md                    # Extension documentation
```

### WordPress Plugin

```
elementor-copier/
├── elementor-copier.php         # Main plugin file
├── includes/
│   ├── admin/
│   │   └── class-adminpage.php # Admin interface
│   ├── import/
│   │   └── class-import-handler.php # Import logic
│   ├── media/
│   │   └── class-media-handler.php # Media downloads
│   └── api/
│       └── class-rest-controller.php # REST API endpoints
├── assets/
│   ├── js/
│   │   └── admin.js            # Admin JavaScript
│   └── css/
│       ├── admin.css           # Admin styles
│       └── admin-rtl.css       # RTL styles for Persian
├── languages/
│   ├── elementor-copier.pot    # Translation template
│   ├── elementor-copier-fa_IR.po # Persian translations
│   └── elementor-copier-fa_IR.mo # Compiled Persian translations
└── README.md                    # Plugin documentation
```

---

## Security Considerations

### Chrome Extension Security

1. **Minimal Permissions**
   - Only request necessary permissions
   - Use `activeTab` instead of broad tab access
   - Limit host permissions to HTTP/HTTPS

2. **Content Security**
   - Validate all extracted data before clipboard write
   - Sanitize HTML content
   - Limit data size to prevent memory issues
   - No eval() or unsafe code execution

3. **User Privacy**
   - No data sent to external servers
   - No tracking or analytics
   - All operations local to browser
   - Clear clipboard data on user request

### WordPress Plugin Security

1. **Authentication & Authorization**
   - Check `manage_options` or `edit_pages` capability
   - Verify user is logged in
   - Use WordPress nonces for CSRF protection
   - Validate all AJAX requests

2. **Input Validation**
   - Validate JSON structure
   - Check data types and formats
   - Sanitize all HTML using `wp_kses_post()`
   - Validate URLs before downloading media
   - Limit file sizes and types

3. **Output Escaping**
   - Escape all output using `esc_html()`, `esc_attr()`, `esc_url()`
   - Use WordPress translation functions with escaping
   - Sanitize before database insertion

4. **Database Security**
   - Use WordPress database API (`$wpdb`)
   - Prepare all queries
   - Sanitize meta keys and values
   - No direct SQL queries

5. **File Upload Security**
   - Validate file types (whitelist)
   - Check file extensions and MIME types
   - Limit file sizes
   - Use WordPress media upload functions
   - Scan for malicious content

6. **XSS Prevention**
   - Sanitize all user input
   - Escape all output
   - Use Content Security Policy headers
   - Validate JSON before parsing

7. **CSRF Protection**
   - Use WordPress nonces
   - Verify nonces on all AJAX requests
   - Check referrer headers

### Data Validation Rules

1. **JSON Structure**
   - Must have `type: "elementor-copier"`
   - Must have `version` field
   - Must have `elementType` field
   - Must have `data` object

2. **Element Data**
   - Validate `elType` is known type
   - Check `widgetType` against whitelist
   - Validate settings structure
   - Limit nesting depth

3. **Media URLs**
   - Must be valid HTTP/HTTPS URLs
   - Check domain is accessible
   - Validate file extensions
   - Limit file sizes

4. **Content**
   - Strip dangerous HTML tags
   - Remove JavaScript
   - Sanitize CSS
   - Validate links

---

## Performance Considerations

### Chrome Extension

1. **DOM Operations**
   - Use efficient selectors
   - Cache DOM queries
   - Debounce hover events
   - Throttle scroll events

2. **Memory Management**
   - Clean up event listeners
   - Remove overlays when not needed
   - Limit clipboard data size
   - Clear cached data

3. **Rendering**
   - Use CSS transforms for overlays
   - Minimize reflows
   - Use requestAnimationFrame for animations

### WordPress Plugin

1. **Database Operations**
   - Batch media uploads
   - Use transients for caching
   - Minimize meta queries
   - Index frequently queried fields

2. **Media Downloads**
   - Download in parallel (with limits)
   - Show progress indicators
   - Handle timeouts gracefully
   - Resume failed downloads

3. **CSS Regeneration**
   - Only regenerate when necessary
   - Use Elementor's built-in methods
   - Clear caches after import

4. **AJAX Requests**
   - Use WordPress REST API
   - Implement proper error handling
   - Show loading states
   - Timeout long requests

---

## Internationalization (i18n)

### Translation Files

1. **POT Template** (`elementor-copier.pot`)
   - Generated from source code
   - Contains all translatable strings
   - Updated with each release

2. **Persian Translation** (`elementor-copier-fa_IR.po/mo`)
   - Complete Persian translations
   - RTL-aware text
   - Cultural adaptations
   - Technical term translations

### Translation Functions

- `__('text', 'elementor-copier')`: Return translated string
- `_e('text', 'elementor-copier')`: Echo translated string
- `esc_html__('text', 'elementor-copier')`: Return escaped translated string
- `esc_html_e('text', 'elementor-copier')`: Echo escaped translated string
- `_n('singular', 'plural', $count, 'elementor-copier')`: Plural forms

### RTL Support

- Load `admin-rtl.css` for Persian
- Mirror layouts automatically
- Adjust icon positions
- Reverse animations
- Test with Persian content

---

## Browser Compatibility

### Chrome Extension

- **Chrome**: 88+ (Manifest V3 support)
- **Edge**: 88+ (Chromium-based)
- **Brave**: Latest
- **Opera**: Latest (Chromium-based)

### WordPress Plugin

- **Browsers**: Modern browsers with Clipboard API support
  - Chrome 66+
  - Firefox 63+
  - Safari 13.1+
  - Edge 79+

### Fallbacks

- Detect Clipboard API support
- Show manual copy instructions if not supported
- Provide alternative methods
- Display compatibility warnings

---

## Deployment

### Chrome Extension

1. **Development**
   - Load unpacked extension in Chrome
   - Test on various sites
   - Debug with DevTools

2. **Production**
   - Create ZIP package
   - Submit to Chrome Web Store
   - Provide screenshots and description
   - Set up update mechanism

### WordPress Plugin

1. **Development**
   - Install on local WordPress
   - Test with different themes
   - Test with different Elementor versions

2. **Production**
   - Create plugin ZIP
   - Submit to WordPress.org (optional)
   - Provide documentation
   - Set up update mechanism
   - Include readme.txt

---

## Maintenance and Updates

### Version Control

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases in Git
- Maintain changelog
- Document breaking changes

### Update Strategy

1. **Chrome Extension**
   - Auto-updates via Chrome Web Store
   - Maintain backward compatibility
   - Test before releasing

2. **WordPress Plugin**
   - WordPress.org auto-updates
   - Check Elementor version compatibility
   - Test with WordPress updates
   - Provide migration scripts if needed

### Monitoring

- Track error logs
- Monitor user feedback
- Check compatibility reports
- Update for new Elementor versions
