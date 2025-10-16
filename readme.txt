=== Elementor Widget Copier ===
Contributors: yourusername
Tags: elementor, widgets, copy, transfer, migration, persian, farsi, rtl
Requires at least: 5.6
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Copy Elementor widgets, sections, and pages from ANY WordPress site with full Persian language support.

== Description ==

Elementor Widget Copier is a two-part system consisting of a Chrome browser extension and a WordPress plugin that work together to enable administrators to seamlessly copy Elementor widgets, sections, or full pages from ANY Elementor website to their local WordPress site. The Chrome extension extracts Elementor data directly from the HTML source of any Elementor-powered website through a simple right-click interface, while the WordPress plugin receives and imports this data. This approach eliminates the need for API access, authentication, or plugin installation on source sites. Perfect for Persian-speaking developers and site administrators who need to replicate design elements from any Elementor-powered site.

= Key Features =

* **Chrome Extension + WordPress Plugin** - Two-part system for seamless copy/paste workflow
* **Simple Copy/Paste Workflow** - Copy from any site with right-click, paste in WordPress admin
* **No Source Site Access Required** - Extract data from HTML, no plugin installation needed on source
* **Visual Element Selection** - Highlight mode shows exactly what you're copying
* **Full Persian Language Support** - Complete Persian (Farsi) interface with RTL styling (کپی ویجت المنتور)
* **Universal Elementor Compatibility** - Works with ALL Elementor versions from 1.0 to latest
* **Copy Individual Widgets** - Transfer specific Elementor widgets from any site
* **Copy Entire Sections** - Move complete sections with all contained widgets
* **Copy Full Pages** - Duplicate entire Elementor page layouts
* **Automatic Media Handling** - Downloads and uploads media files automatically
* **Clipboard-Based Transfer** - Secure, local data transfer through browser clipboard
* **Version Conversion** - Automatically converts old Elementor formats to current version
* **Preserve Styling** - Maintains all widget settings, styles, and configurations
* **Easy to Use** - Simple Persian admin interface under Tools menu (ابزارها)

= How It Works =

**Part 1: Chrome Extension (Copy)**
1. Install Chrome extension from Chrome Web Store
2. Visit any Elementor-powered website
3. Right-click on any element or use highlight mode
4. Select "Copy Widget/Section/Page"
5. Data is extracted and copied to clipboard

**Part 2: WordPress Plugin (Paste)**
1. Install plugin on your WordPress site
2. Navigate to Tools > کپی ویجت المنتور (Elementor Widget Copier)
3. Click "جایگذاری از کلیپ‌بورد" (Paste from Clipboard)
4. Preview shows element type and source
5. Choose target (new page, existing page, or template)
6. Select media handling (download or keep URLs)
7. Click "وارد کردن" (Import)
8. Done! Edit in Elementor

The Chrome extension extracts Elementor data directly from HTML attributes on any website, formats it as structured JSON, and copies it to your clipboard. The WordPress plugin reads the clipboard, validates the data, downloads media files, converts between Elementor versions if needed, and uses Elementor's native APIs to insert data locally, ensuring full compatibility and proper CSS regeneration.

= Requirements =

**Chrome Extension:**
* Chrome 88+ or Edge 88+ (Chromium-based browsers)
* Clipboard API support (HTTPS or localhost)

**WordPress Plugin:**
* WordPress 5.6 or higher
* PHP 7.4 or higher
* Elementor 1.0 or higher on LOCAL site (Elementor Pro not required)
* Modern browser with Clipboard API support
* HTTPS recommended for clipboard access

= Use Cases =

* Copying designs from client sites or demo sites
* Migrating designs between development and production sites
* Replicating widgets across multiple sites without dual installation
* Creating template libraries from existing sites
* Learning from and adapting designs from other Elementor sites
* Backing up and restoring Elementor content
* Working with sites where you cannot install plugins

== Installation ==

This system requires TWO components: Chrome Extension + WordPress Plugin

= Part 1: Chrome Extension Installation =

**From Chrome Web Store (Recommended):**
1. Visit Chrome Web Store
2. Search for "Elementor Copier"
3. Click "Add to Chrome"
4. Extension icon appears in toolbar

**Manual Installation (Development):**
1. Download extension from GitHub
2. Open Chrome and go to chrome://extensions/
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the chrome-extension folder
6. Extension is ready!

= Part 2: WordPress Plugin Installation =

**Automatic Installation:**
1. Log in to your WordPress admin panel
2. Navigate to Plugins > Add New
3. Search for "Elementor Widget Copier"
4. Click "Install Now" and then "Activate"

**Manual Installation:**
1. Download the plugin ZIP file
2. Log in to your WordPress admin panel
3. Navigate to Plugins > Add New > Upload Plugin
4. Choose the downloaded ZIP file and click "Install Now"
5. Click "Activate Plugin"

= Post-Installation Setup =

**Verify Chrome Extension:**
1. Extension icon appears in Chrome toolbar
2. Visit any Elementor website
3. Badge should show element count
4. Right-click should show "Elementor Copier" menu

**Verify WordPress Plugin:**
1. Ensure Elementor is installed and activated
2. Verify plugin is activated
3. Navigate to Tools > کپی ویجت المنتور (Elementor Widget Copier)
4. Interface loads without errors

**You're Ready!**
- No setup needed on source sites
- No API keys required
- No authentication for public sites
- Just copy and paste!

== Frequently Asked Questions ==

= Do I need to install this plugin on both sites? =

No! Only install the plugin on your LOCAL site (where you want to import content). The plugin can extract data from any source site without requiring installation there.

= Do I need Elementor Pro? =

No, the plugin works with the free version of Elementor. Elementor Pro is not required on either site.

= What Elementor versions are supported? =

The plugin supports ALL Elementor versions from 1.0 to the latest version. It automatically detects and converts between different Elementor data formats, ensuring universal compatibility.

= Does this work with any Elementor widget? =

Yes, the plugin copies all Elementor widgets including custom widgets from third-party addons, as long as the same widgets are available on your local site.

= What happens if my local site doesn't have a widget that exists on the source? =

The import will fail with an error message in Persian. Ensure your local site has the same Elementor addons installed for best results.

= Is the interface available in Persian? =

Yes! The entire plugin interface is in Persian (Farsi) with full RTL (right-to-left) support. All labels, buttons, messages, and help text are displayed in Persian.

= What authentication methods are supported? =

The plugin supports three authentication methods:
* **Public Access** - For publicly published pages (no credentials needed)
* **WordPress Credentials** - Username and password for private content
* **Application Password** - Secure API access (recommended for private content)

= Is my data secure during transfer? =

Yes, the plugin validates and sanitizes all data before import. We strongly recommend using HTTPS for all connections. Application passwords provide secure authentication without exposing your main password.

= Can I copy widgets from any WordPress site? =

Yes, as long as the source site has Elementor installed and the content is either public or you have authentication credentials.

= What about media files (images, videos)? =

The plugin automatically downloads media from the source site and uploads it to your local site's media library, updating all URLs accordingly.

= Will this work with my theme? =

Yes, the plugin works independently of your theme. It only interacts with Elementor data.

= Can I undo a copy operation? =

The plugin doesn't include an undo feature. You'll need to manually delete the imported widget/section from your local site if needed.

= Does this affect the source site? =

No, the source site is only read from. No changes are made to the source site during the copy operation.

= What if I get a connection error? =

Check that:
* The source site URL is correct and accessible
* The source site is using HTTPS (recommended)
* If using authentication, credentials are correct
* Your server allows outbound HTTP requests
* The source site has Elementor installed

== Screenshots ==

1. Admin interface showing template selection and target URL input
2. Successful widget copy confirmation message
3. Application password setup in WordPress user profile
4. Copied widget appearing in Elementor editor on target site

== Usage ==

= Complete Copy/Paste Workflow =

**Step 1: Copy from Any Elementor Website (Chrome Extension)**

1. **Visit any Elementor-powered website** in Chrome
2. **Choose your copy method:**

   **Method A: Right-Click (Context Menu)**
   - Right-click on any element
   - Select "Elementor Copier" from menu
   - Choose: Copy Widget / Copy Section / Copy Column / Copy Entire Page
   - Success notification appears

   **Method B: Highlight Mode (Visual)**
   - Click extension icon in toolbar
   - Click "Enable Highlight Mode"
   - Hover over elements (they highlight with colors)
   - Click any element to copy
   - Success notification appears

   **Method C: Extension Popup**
   - Click extension icon
   - View page stats
   - Click "Copy Entire Page" for full page
   - Or enable highlight mode from popup

3. **Verify copy successful:**
   - Success notification shows
   - Badge shows checkmark
   - Data is in clipboard

**Step 2: Paste into WordPress (WordPress Plugin)**

1. **Open WordPress admin** on your site
2. **Navigate to Tools > کپی ویجت المنتور** (Elementor Widget Copier)
3. **Click "جایگذاری از کلیپ‌بورد"** (Paste from Clipboard)
4. **Review preview:**
   - Element type shown
   - Source URL displayed
   - Timestamp shown
5. **Choose target:**
   - **صفحه جدید** (New Page) - Create new page
   - **صفحه موجود** (Existing Page) - Add to existing
   - **قالب** (Template) - Save as template
6. **Select media handling:**
   - Download to Media Library (recommended)
   - Keep Original URLs (faster)
7. **Click "وارد کردن"** (Import)
8. **Success!** Edit page in Elementor

= Quick Workflow Example =

**Copy a widget in 30 seconds:**
1. Visit Elementor site → Right-click widget → Copy Widget (5 sec)
2. Go to WordPress admin → Tools → Elementor Copier (10 sec)
3. Paste from Clipboard → Select New Page → Import (15 sec)
4. Done! Widget is now on your site

= Chrome Extension Features =

**Automatic Detection:**
- Detects Elementor on page load
- Shows element count in badge
- Works on any Elementor version

**Visual Highlighting:**
- Blue = Widgets
- Green = Sections
- Orange = Columns
- Hover tooltips show element info

**Multiple Copy Methods:**
- Right-click context menu
- Visual highlight mode
- Extension popup actions

**Smart Data Extraction:**
- Extracts from HTML attributes
- Parses JSON settings
- Finds all media URLs
- Preserves styling

= WordPress Plugin Features =

**Simple Paste Interface:**
- One-click paste from clipboard
- Data preview before import
- Persian language interface
- RTL layout support

**Flexible Import:**
- Create new pages
- Add to existing pages
- Save as templates
- Batch import

**Media Handling:**
- Downloads images/videos
- Uploads to media library
- Updates URLs automatically
- Progress indication

= Clipboard Data Format =

The system uses structured JSON format:
- Version information for compatibility
- Element type classification
- Complete Elementor settings
- Media array with URLs
- Metadata (source, timestamp, version)

See Chrome extension documentation for complete format specification.

== Troubleshooting ==

= Chrome Extension Issues =

**Extension Not Detecting Elementor:**
* Refresh the page (Ctrl+R or Cmd+R)
* Verify site actually uses Elementor (check page source)
* Check browser console for errors (F12)
* Try different page on same site
* Reinstall extension if needed

**Copy Not Working:**
* Check browser clipboard permissions
* Ensure site uses HTTPS or localhost (required for Clipboard API)
* Try copying again
* Check extension popup for error messages
* Disable conflicting browser extensions
* View browser console (F12) for errors

**Highlight Mode Not Working:**
* Disable and re-enable highlight mode
* Refresh the page
* Check if page has Elementor elements
* Try different element types
* Check browser console for errors

**Data Extraction Fails:**
* Try copying parent element (section instead of widget)
* Check if element has data-elementor-settings attribute
* Verify Elementor data is in HTML (view page source)
* Try copying entire page instead

= WordPress Plugin Issues =

**Paste Button Not Working:**
* Ensure clipboard contains valid Elementor Copier data
* Check browser supports Clipboard API
* Try copying from extension again
* Use HTTPS (required for Clipboard API)
* Check browser console (F12) for errors

**Invalid Clipboard Data Error:**
* Copy data from Chrome extension again
* Verify clipboard wasn't overwritten
* Check data format in extension popup
* Ensure you copied an Elementor element

**Import Fails:**
* Verify Elementor is installed and activated
* Check you have sufficient permissions
* Ensure target page exists (for existing page option)
* Try creating new page instead
* Check WordPress debug log for details

**Media Download Fails:**
* Verify source site allows external access to media
* Check your site has sufficient storage space
* Ensure PHP allow_url_fopen is enabled
* Try "Keep Original URLs" option instead
* Check file size limits in PHP settings

**Persian Text Not Displaying:**
* Set WordPress language to Persian (fa_IR)
* Clear browser cache and hard refresh
* Verify plugin language files exist
* Check browser supports RTL rendering

= Browser Compatibility =

**Chrome Extension:**
* Chrome 88+ required
* Edge 88+ (Chromium) supported
* Brave (latest) supported
* Opera (latest) supported
* Firefox not yet supported
* Safari not yet supported

**WordPress Plugin (Clipboard API):**
* Chrome 66+ supported
* Firefox 63+ supported
* Safari 13.1+ supported
* Edge 79+ supported
* HTTPS or localhost required

= Common Issues =

**Clipboard API Not Available:**
* Use HTTPS instead of HTTP
* Update browser to latest version
* Try different browser (Chrome, Edge, Brave)
* Check browser clipboard permissions

**Large Page Timeout:**
* Increase PHP max_execution_time (300+ seconds)
* Increase PHP memory_limit (256M+)
* Copy smaller sections instead of full page
* Import in batches

**Version Incompatibility:**
* Plugin automatically converts versions
* Update Elementor on local site
* Check if custom widgets are available locally
* Review conversion warnings in debug log

**Widget Styling Wrong:**
* Go to Elementor > Tools > Regenerate CSS
* Clear caching plugins
* Hard refresh browser (Ctrl+F5)
* Check fonts and theme settings match

**Cannot See Plugin Menu:**
* Verify logged in as Administrator or Editor
* Check plugin is activated
* Look under Tools > کپی ویجت المنتور
* Clear WordPress cache

== Changelog ==

= 1.0.0 =
* Initial release
* Chrome browser extension for data extraction
* WordPress plugin for data import
* Simple copy/paste workflow via clipboard
* Right-click context menu for copying
* Visual highlight mode with color-coded overlays
* Extension popup with stats and quick actions
* Automatic Elementor detection
* Smart data extraction from HTML attributes
* Structured JSON clipboard format
* One-click paste interface in WordPress
* Data preview before import
* Full Persian (Farsi) language support with RTL interface
* Universal Elementor compatibility (versions 1.0 to latest)
* Widget copying functionality
* Section copying functionality
* Column copying functionality
* Page copying functionality
* Automatic version conversion between Elementor formats
* Automatic media handling (download and upload)
* Target selection (new page, existing page, template)
* Media handling options (download or keep URLs)
* Persian admin interface with RTL styling
* Comprehensive error handling with Persian messages
* Security features (sanitization, validation, capability checks)
* Browser compatibility (Chrome, Edge, Brave, Opera)
* Clipboard API integration
* No source site access required

== Upgrade Notice ==

= 1.0.0 =
Initial release of Elementor Widget Copier with Chrome extension and WordPress plugin. Simple copy/paste workflow with full Persian language support. Copy from ANY Elementor website with just a right-click!

== Developer Notes ==

= Architecture =

The plugin uses a single-site architecture:
* Installed only on the target (local) site
* Extracts data from remote source sites using multiple methods
* No installation or configuration required on source sites
* All processing happens locally

= Extraction Methods =

The plugin implements three extraction methods with automatic fallback:

1. **REST API Extractor** - Uses WordPress REST API endpoints (/wp-json/wp/v2/)
2. **Authenticated Extractor** - Uses WordPress login and authenticated sessions
3. **Web Scraper** - Parses public HTML and inline JavaScript

= Version Conversion =

The plugin includes a version converter that:
* Detects Elementor version from data structure
* Converts Elementor 1.x format to current format
* Converts Elementor 2.x format to current format
* Handles deprecated widget types
* Updates settings structure for compatibility

= Hooks and Filters =

The plugin provides several hooks for developers:

**Actions:**
* `elementor_copier_before_extract` - Fires before data extraction
* `elementor_copier_after_extract` - Fires after data extraction
* `elementor_copier_before_import` - Fires before widget import
* `elementor_copier_after_import` - Fires after widget import
* `elementor_copier_before_version_convert` - Fires before version conversion
* `elementor_copier_after_version_convert` - Fires after version conversion

**Filters:**
* `elementor_copier_extraction_method` - Filter the extraction method selection
* `elementor_copier_extracted_data` - Filter extracted data before processing
* `elementor_copier_import_data` - Filter import data before insertion
* `elementor_copier_media_handling` - Enable/disable media handling
* `elementor_copier_conversion_rules` - Customize version conversion rules

= AJAX Endpoints =

* `wp_ajax_elementor_copier_connect` - Test connection to source site
* `wp_ajax_elementor_copier_load_content` - Load content tree from source
* `wp_ajax_elementor_copier_extract_data` - Extract specific content
* `wp_ajax_elementor_copier_import` - Import content to local site

= REST API Endpoints =

* `POST /wp-json/elementor-copier/v1/import` - Import widget data (legacy)
* `GET /wp-json/elementor-copier/v1/health` - Check plugin health

= Namespaces =

All classes use the `ElementorCopier` namespace:
* `ElementorCopier\Plugin` - Core plugin class
* `ElementorCopier\Admin\AdminPage` - Persian admin interface
* `ElementorCopier\Connector\SourceConnector` - Source site connection
* `ElementorCopier\Extractor\*` - Extraction method classes
* `ElementorCopier\Converter\VersionConverter` - Version conversion
* `ElementorCopier\Import\Importer` - Import functionality
* `ElementorCopier\Security\Auth` - Security and authentication

= Contributing =

Contributions are welcome! Visit the GitHub repository to report issues or submit pull requests. Persian language improvements are especially appreciated.

== Privacy Policy ==

Elementor Widget Copier does not collect, store, or transmit any personal data to third parties. All data extraction and import operations occur directly between your local site and source sites. The plugin:

* Does not store authentication credentials permanently
* Does not send data to external servers
* Does not track usage or analytics
* Only communicates with source sites you explicitly specify
* Processes all data locally on your WordPress installation

Application passwords and WordPress credentials are used only for the duration of the extraction process and are not stored by the plugin.

== Support ==

For support, please visit the WordPress.org support forum for this plugin or check the documentation on the plugin website.
