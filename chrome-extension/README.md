# Elementor Copier - Chrome Extension

Copy Elementor widgets, sections, and pages from any website with a simple right-click!

## 🚀 Features

- **Right-Click to Copy** - Context menu integration for easy copying
- **Visual Highlighting** - See exactly what you're copying
- **Multiple Element Types** - Copy widgets, sections, columns, or entire pages
- **Clipboard Integration** - Data copied directly to clipboard
- **Elementor Detection** - Automatically detects Elementor websites
- **Stats Display** - See how many elements are on the page
- **No Authentication** - Works on any public Elementor site

## 📦 Installation

### From Chrome Web Store (Coming Soon)
1. Visit Chrome Web Store
2. Search for "Elementor Copier"
3. Click "Add to Chrome"

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Extension is now installed!

## 🎯 Complete Workflow Guide

### Overview: Copy/Paste Workflow

The Elementor Copier uses a simple 3-step workflow:

```
1. COPY (Chrome Extension)
   ↓
2. CLIPBOARD (Browser)
   ↓
3. PASTE (WordPress Plugin)
```

### Step 1: Visit an Elementor Website

1. **Open any Elementor-powered website** in Chrome
   - Can be any public website
   - No special access needed
   - Works on any Elementor version

2. **Extension automatically detects Elementor**
   - Badge shows element count (e.g., "12")
   - Badge turns green if Elementor found
   - Badge turns red if no Elementor

3. **Verify detection**
   - Click extension icon to see stats
   - Check widget/section/column counts
   - Confirm page is ready for copying

### Step 2: Copy Elements (3 Methods)

#### Method 1: Context Menu (Right-Click) - Recommended

**Best for:** Quick copying of specific elements

1. **Navigate to element you want**
   - Scroll to the widget/section
   - Identify what you want to copy

2. **Right-click on the element**
   - Click directly on the element
   - Context menu appears

3. **Select "Elementor Copier" from menu**
   - Submenu expands with options

4. **Choose what to copy:**
   - **Copy Widget** - Single widget only
   - **Copy Section** - Entire section with all widgets
   - **Copy Column** - Column layout with widgets
   - **Copy Entire Page** - Full page structure

5. **Wait for confirmation**
   - Success notification appears
   - Badge shows checkmark
   - Data is in clipboard

**Tips:**
- Right-click directly on element (not empty space)
- For widgets, click on widget content
- For sections, click on section background
- If unsure, use highlight mode instead

#### Method 2: Highlight Mode (Visual Selection) - Most Intuitive

**Best for:** Visual learners, finding elements, exploring page structure

1. **Enable highlight mode**
   - Click extension icon in toolbar
   - Click "Enable Highlight Mode" button
   - Cursor changes to crosshair

2. **Hover over elements**
   - Move mouse over page
   - Elements highlight with colored overlays:
     - **Blue** = Widgets (individual elements)
     - **Green** = Sections (containers)
     - **Orange** = Columns (layout)
   - Tooltip shows element type and name

3. **Click to copy**
   - Click any highlighted element
   - Success notification appears
   - Data copied to clipboard

4. **Disable when done**
   - Click extension icon
   - Click "Disable Highlight Mode"
   - Or press Escape key

**Tips:**
- Hover slowly to see all elements
- Nested elements highlight separately
- Click the specific element you want
- Use zoom if elements are small
- Disable mode to interact with page normally

#### Method 3: Extension Popup - Quick Actions

**Best for:** Copying entire pages, checking stats, viewing clipboard

1. **Click extension icon** in toolbar
   - Popup window opens

2. **View page information:**
   - Elementor detection status
   - Element counts (widgets, sections, columns)
   - Last copied item info

3. **Quick actions:**
   - **Enable Highlight Mode** - Start visual selection
   - **Copy Entire Page** - Copy full page structure
   - **View Clipboard** - See current clipboard data
   - **Clear Clipboard** - Reset clipboard

4. **Check last copied:**
   - See what was last copied
   - View timestamp
   - Verify before pasting

**Tips:**
- Use for quick page copies
- Check stats before copying
- Verify clipboard data before pasting
- Keep popup open while browsing

### Step 3: Paste in WordPress

#### Prerequisites
- WordPress plugin installed and activated
- Logged in as Administrator or Editor
- Elementor installed on WordPress site
- Clipboard contains copied data

#### Paste Workflow

1. **Navigate to WordPress admin**
   - Open your WordPress site
   - Log in to admin panel
   - Ensure you're using HTTPS

2. **Open Elementor Copier**
   - Go to **Tools** menu
   - Click **کپی ویجت المنتور** (Elementor Widget Copier)
   - Plugin page loads

3. **Click "Paste from Clipboard"**
   - Click **"جایگذاری از کلیپ‌بورد"** button
   - Browser may ask for clipboard permission
   - Grant permission if requested

4. **Review data preview**
   - Element type shown (widget/section/page)
   - Source URL displayed
   - Copy timestamp shown
   - Verify this is correct data

5. **Choose import target:**

   **Option A: New Page**
   - Select **"صفحه جدید"** (New Page)
   - Enter page title
   - Content will create new page

   **Option B: Existing Page**
   - Select **"صفحه موجود"** (Existing Page)
   - Choose page from dropdown
   - Select position:
     - **Top** - Add to beginning
     - **Bottom** - Add to end
     - **Replace** - Replace all content

   **Option C: Template**
   - Select **"قالب"** (Template)
   - Enter template name
   - Saves as reusable template

6. **Configure media handling:**

   **Option A: Download to Media Library** (Recommended)
   - All images/videos downloaded
   - Uploaded to your media library
   - URLs updated automatically
   - Takes longer but fully local

   **Option B: Keep Original URLs**
   - Uses source site URLs
   - Faster import
   - Depends on source site availability
   - May break if source changes

7. **Click "Import"**
   - Click **"وارد کردن"** button
   - Progress bar shows status
   - Wait for completion

8. **Success!**
   - Success message appears in Persian
   - Link to edit page in Elementor
   - Click link to open Elementor editor

9. **Verify import**
   - Check all elements imported
   - Verify styling is correct
   - Test any interactive elements
   - Regenerate CSS if needed (Elementor → Tools)

### Advanced Workflows

#### Workflow 1: Building Template Library

1. Browse Elementor demo sites
2. Copy interesting widgets/sections
3. Paste as templates in WordPress
4. Build your template library
5. Reuse across projects

#### Workflow 2: Multi-Site Replication

1. Copy from production site
2. Paste to staging site
3. Test changes
4. Copy back to production
5. Maintain consistency

#### Workflow 3: Client Site Migration

1. Copy from client's old site
2. Paste to new site
3. Customize as needed
4. No plugin needed on old site
5. Clean migration

#### Workflow 4: Learning & Adaptation

1. Find well-designed Elementor site
2. Copy elements to study
3. Paste to test site
4. Analyze structure and settings
5. Learn best practices

### Workflow Tips

**Before Copying:**
- ✅ Verify Elementor is detected
- ✅ Check element count makes sense
- ✅ Identify exactly what you want
- ✅ Use highlight mode to explore

**During Copying:**
- ✅ Wait for success notification
- ✅ Don't copy too many items at once
- ✅ Check clipboard in popup
- ✅ Copy again if unsure

**Before Pasting:**
- ✅ Verify clipboard has data
- ✅ Check data preview
- ✅ Choose correct target
- ✅ Decide on media handling

**After Pasting:**
- ✅ Verify import success
- ✅ Check all elements present
- ✅ Test in Elementor editor
- ✅ Regenerate CSS if needed
- ✅ Clear cache

**Troubleshooting:**
- ❌ Copy fails → Try parent element
- ❌ Paste fails → Check clipboard data
- ❌ Import fails → Verify Elementor active
- ❌ Styling wrong → Regenerate CSS
- ❌ Media missing → Use download option

## 🎨 Visual Guide

### Extension Popup
```
┌─────────────────────────────┐
│  Elementor Copier           │
│  v1.0.0                     │
├─────────────────────────────┤
│  ✓ Elementor Detected       │
├─────────────────────────────┤
│  Elements on this page:     │
│  Widgets:    12             │
│  Sections:   4              │
│  Columns:    8              │
├─────────────────────────────┤
│  [Enable Highlight Mode]    │
├─────────────────────────────┤
│  Last Copied:               │
│  Heading Widget             │
│  2 minutes ago              │
│  [View Clipboard]           │
└─────────────────────────────┘
```

### Context Menu
```
Right-click on element →
  Elementor Copier →
    ├─ Copy Widget
    ├─ Copy Section
    ├─ Copy Column
    ├─ Copy Entire Page
    ├─ ─────────────
    └─ Enable Highlight Mode
```

## 🔧 Technical Details

### Clipboard Data Format Specification

The extension uses a standardized JSON format for data transfer between the Chrome extension and WordPress plugin. This format ensures compatibility and includes all necessary information for accurate import.

#### Complete Data Structure

```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget|section|column|page",
  "data": {
    "id": "abc123",
    "elType": "widget|section|column|container",
    "widgetType": "heading|text-editor|image|button|...",
    "settings": {
      "title": "Hello World",
      "size": "h2",
      "color": "#000000",
      "_element_id": "custom-id",
      "_css_classes": "custom-class"
    },
    "elements": [
      {
        "id": "def456",
        "elType": "widget",
        "widgetType": "text-editor",
        "settings": {
          "editor": "<p>Content here</p>"
        }
      }
    ]
  },
  "media": [
    {
      "id": "media_001",
      "url": "https://source.com/wp-content/uploads/2025/01/image.jpg",
      "type": "image",
      "alt": "Image description",
      "width": 1920,
      "height": 1080,
      "size": 245678,
      "mime": "image/jpeg"
    },
    {
      "id": "media_002",
      "url": "https://source.com/wp-content/uploads/2025/01/bg.jpg",
      "type": "background-image",
      "alt": "",
      "width": 2560,
      "height": 1440
    }
  ],
  "metadata": {
    "sourceUrl": "https://source-site.com/sample-page",
    "copiedAt": "2025-10-15T12:34:56Z",
    "elementorVersion": "3.16.0",
    "pageTitle": "Sample Page",
    "pageId": 123,
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "extensionVersion": "1.0.0"
  }
}
```

#### Field Descriptions

**Root Level Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Format version (currently "1.0.0") for compatibility |
| `type` | string | Yes | Always "elementor-copier" to identify data source |
| `elementType` | string | Yes | High-level type: "widget", "section", "column", or "page" |
| `data` | object | Yes | Core Elementor element data |
| `media` | array | No | Array of media references found in element |
| `metadata` | object | Yes | Context information about the copy operation |

**Data Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique element identifier (e.g., "abc123") |
| `elType` | string | Yes | Elementor element type: "widget", "section", "column", "container" |
| `widgetType` | string | Conditional | Widget type (required if elType is "widget") |
| `settings` | object | Yes | All widget/element settings as key-value pairs |
| `elements` | array | No | Child elements (for sections/columns) - recursive structure |

**Settings Object:**
- Contains all Elementor settings for the element
- Keys vary by widget type
- Common keys: `title`, `color`, `size`, `align`, `_element_id`, `_css_classes`
- Preserves all custom settings and styling

**Media Array Objects:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for this media item |
| `url` | string | Yes | Full URL to media file on source site |
| `type` | string | Yes | Media type: "image", "background-image", "video" |
| `alt` | string | No | Alt text for images |
| `width` | number | No | Image/video width in pixels |
| `height` | number | No | Image/video height in pixels |
| `size` | number | No | File size in bytes |
| `mime` | string | No | MIME type (e.g., "image/jpeg", "video/mp4") |

**Metadata Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourceUrl` | string | Yes | Full URL of source page |
| `copiedAt` | string | Yes | ISO 8601 timestamp of copy operation |
| `elementorVersion` | string | No | Detected Elementor version on source |
| `pageTitle` | string | No | Title of source page |
| `pageId` | number | No | WordPress post ID of source page |
| `userAgent` | string | No | Browser user agent string |
| `extensionVersion` | string | Yes | Chrome extension version |

#### Element Type Examples

**Widget Example (Heading):**
```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget",
  "data": {
    "id": "a1b2c3d",
    "elType": "widget",
    "widgetType": "heading",
    "settings": {
      "title": "Welcome to Our Site",
      "size": "h1",
      "align": "center",
      "color": "#333333",
      "typography_typography": "custom",
      "typography_font_size": {
        "unit": "px",
        "size": 48
      }
    }
  },
  "media": [],
  "metadata": {
    "sourceUrl": "https://example.com/home",
    "copiedAt": "2025-10-15T10:00:00Z",
    "elementorVersion": "3.16.0"
  }
}
```

**Section Example (with nested widgets):**
```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "section",
  "data": {
    "id": "section1",
    "elType": "section",
    "settings": {
      "layout": "boxed",
      "gap": "default",
      "background_background": "classic",
      "background_color": "#f5f5f5"
    },
    "elements": [
      {
        "id": "column1",
        "elType": "column",
        "settings": {
          "_column_size": 50
        },
        "elements": [
          {
            "id": "widget1",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Column 1 Heading"
            }
          }
        ]
      },
      {
        "id": "column2",
        "elType": "column",
        "settings": {
          "_column_size": 50
        },
        "elements": [
          {
            "id": "widget2",
            "elType": "widget",
            "widgetType": "text-editor",
            "settings": {
              "editor": "<p>Column 2 content</p>"
            }
          }
        ]
      }
    ]
  },
  "media": [],
  "metadata": {
    "sourceUrl": "https://example.com/about",
    "copiedAt": "2025-10-15T11:00:00Z"
  }
}
```

**Widget with Media Example (Image):**
```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget",
  "data": {
    "id": "img123",
    "elType": "widget",
    "widgetType": "image",
    "settings": {
      "image": {
        "url": "https://source.com/wp-content/uploads/2025/01/hero.jpg",
        "id": 456
      },
      "image_size": "full",
      "align": "center",
      "caption": "Hero Image"
    }
  },
  "media": [
    {
      "id": "media_hero",
      "url": "https://source.com/wp-content/uploads/2025/01/hero.jpg",
      "type": "image",
      "alt": "Hero Image",
      "width": 1920,
      "height": 1080,
      "mime": "image/jpeg"
    }
  ],
  "metadata": {
    "sourceUrl": "https://source.com/home",
    "copiedAt": "2025-10-15T12:00:00Z"
  }
}
```

### How It Works

#### 1. Detection Phase
```javascript
// Scans page for Elementor indicators
- Looks for [data-elementor-type] attributes
- Finds .elementor-element classes
- Counts widgets, sections, columns
- Updates badge with count
```

#### 2. Extraction Phase
```javascript
// Extracts data from HTML attributes
- Reads data-elementor-type
- Parses data-elementor-settings JSON
- Extracts data-elementor-id
- Reads data-widget_type
- Recursively processes child elements
```

#### 3. Media Detection
```javascript
// Finds all media references
- Scans settings for image URLs
- Extracts background images from CSS
- Finds video URLs
- Collects all media metadata
```

#### 4. Formatting Phase
```javascript
// Structures data in standard format
- Creates root object with version
- Adds element type classification
- Includes complete settings
- Attaches media array
- Adds metadata context
```

#### 5. Clipboard Phase
```javascript
// Writes to clipboard
- Converts to JSON string
- Uses Clipboard API
- Writes to clipboard
- Shows success notification
- Updates badge
```

#### 6. Storage Phase
```javascript
// Backup to chrome.storage
- Saves to local storage
- Keeps last copied item
- Updates popup display
- Enables clipboard viewer
```

### Data Validation

The WordPress plugin validates clipboard data:

**Required Checks:**
- ✅ Valid JSON format
- ✅ `type` field equals "elementor-copier"
- ✅ `version` field present
- ✅ `elementType` is valid value
- ✅ `data` object exists
- ✅ `data.elType` matches `elementType`

**Optional Checks:**
- ⚠️ `elementorVersion` compatibility
- ⚠️ Media URLs accessibility
- ⚠️ Widget type availability locally

**Security Checks:**
- 🔒 HTML sanitization
- 🔒 URL validation
- 🔒 XSS prevention
- 🔒 File type validation

### Permissions Required

| Permission | Purpose | Required |
|------------|---------|----------|
| `contextMenus` | Add right-click menu items | Yes |
| `clipboardWrite` | Copy data to clipboard | Yes |
| `activeTab` | Access current tab content | Yes |
| `storage` | Store last copied data | Yes |
| `host_permissions` | Access all websites for extraction | Yes |

### Browser API Usage

**Clipboard API:**
```javascript
navigator.clipboard.writeText(jsonString)
  .then(() => showSuccess())
  .catch(err => showError(err));
```

**Chrome Storage API:**
```javascript
chrome.storage.local.set({
  lastCopied: data,
  timestamp: Date.now()
});
```

**Chrome Context Menus API:**
```javascript
chrome.contextMenus.create({
  id: 'copy-widget',
  title: 'Copy Widget',
  contexts: ['all']
});
```

**Chrome Notifications API:**
```javascript
chrome.notifications.create({
  type: 'basic',
  title: 'Elementor Copier',
  message: 'Widget copied to clipboard!'
});
```

## 🎯 Supported Elements

| Element Type | Description | Color Code |
|-------------|-------------|------------|
| **Widget** | Individual Elementor widgets | Blue |
| **Section** | Full sections with all content | Green |
| **Column** | Column layouts | Orange |
| **Page** | Entire Elementor page | Purple |

## 🔐 Privacy & Security

### Privacy
- **No Data Collection** - Extension doesn't collect any user data
- **Local Processing** - All data extraction happens locally
- **No External Servers** - No data sent to external servers
- **Open Source** - Code is fully transparent
- **Clipboard Only** - Data only goes to your clipboard

### Content Sanitization
The extension includes comprehensive security sanitization to protect against malicious content:

- **HTML Sanitization** - Removes dangerous tags (`<script>`, `<iframe>`, etc.)
- **Event Handler Removal** - Strips onclick, onload, and other event handlers
- **URL Validation** - Blocks `javascript:`, `data:`, and other dangerous protocols
- **CSS Sanitization** - Removes JavaScript execution attempts in CSS
- **Settings Validation** - Validates data types and structure
- **XSS Protection** - Prevents cross-site scripting attacks

**What Gets Blocked:**
- Script tags and inline JavaScript
- Dangerous HTML elements (iframe, object, embed)
- Event handler attributes (onclick, onerror, etc.)
- JavaScript URLs (javascript:, data:, vbscript:)
- Malicious CSS patterns (expression(), behavior:)

**What's Preserved:**
- Safe HTML structure and content
- Legitimate URLs (https://, http://, relative paths)
- Safe CSS properties and values
- All Elementor settings and configurations

For more details, see:
- [Content Sanitizer Guide](CONTENT_SANITIZER_GUIDE.md)
- [Sanitization Quick Reference](SANITIZATION_QUICK_REFERENCE.md)

## 🧪 Testing

### Automated Test Suite
The extension includes a comprehensive test suite to validate all functionality:

1. **Open Test Suite:**
   - Navigate to any Elementor website
   - Open `test-suite.html` in your browser

2. **Run Tests:**
   - Click "Run All Tests" button
   - Review results and logs

3. **Test Categories:**
   - Elementor Detection (5 tests)
   - Widget Extraction (3 tests)
   - Section Extraction (2 tests)
   - Column Extraction (1 test)
   - Page Extraction (1 test)
   - Media Extraction (3 tests)
   - Clipboard Format (2 tests)
   - Extension Integration (2 tests)

### Manual Testing
See `TESTING_QUICK_START.md` for detailed manual testing instructions.

### Test Documentation
- `TEST_VALIDATION_REPORT.md` - Complete test validation report
- `TESTING_QUICK_START.md` - Quick start guide for testing
- `test-suite.html` - Interactive test interface
- `test-suite.js` - Test implementation

## 🐛 Troubleshooting

### Extension Not Detecting Elementor

**Symptoms:**
- Badge shows red indicator or no count
- Context menu doesn't show Elementor options
- Popup says "No Elementor detected"

**Solutions:**
1. **Refresh the page** - Press Ctrl+R (Cmd+R on Mac)
2. **Verify Elementor is present:**
   - Right-click → Inspect Element (F12)
   - Search for `data-elementor-type` in HTML
   - Look for `.elementor-element` classes
3. **Check page is fully loaded** - Wait for page to finish loading
4. **Try different page** - Some pages may not use Elementor
5. **Check browser console:**
   - Press F12 → Console tab
   - Look for extension errors
   - Report errors if found
6. **Reinstall extension:**
   - Remove extension
   - Restart browser
   - Reinstall extension

**Common Causes:**
- Page doesn't actually use Elementor
- Elementor data is loaded dynamically (AJAX)
- Site uses custom Elementor implementation
- Browser extension conflicts

### Copy Not Working

**Symptoms:**
- No success notification appears
- Clipboard remains empty
- Error notification shows

**Solutions:**
1. **Check clipboard permissions:**
   - Click extension icon
   - Check for permission warnings
   - Grant clipboard access if requested
2. **Verify HTTPS:**
   - Clipboard API requires HTTPS or localhost
   - Check URL starts with `https://`
3. **Try again:**
   - Right-click and copy again
   - Use highlight mode instead
   - Try copying parent element (section instead of widget)
4. **Check browser console:**
   - Press F12 → Console tab
   - Look for clipboard errors
   - Check for "Clipboard API not available" message
5. **Test clipboard manually:**
   - Copy some text (Ctrl+C)
   - Paste somewhere (Ctrl+V)
   - If this fails, clipboard is blocked
6. **Disable conflicting extensions:**
   - Disable other clipboard managers
   - Disable privacy extensions temporarily
   - Test with extensions disabled

**Common Causes:**
- HTTP site (not HTTPS)
- Browser clipboard permissions denied
- Conflicting browser extensions
- Browser security settings

### Highlight Mode Not Working

**Symptoms:**
- No colored overlays appear
- Elements don't highlight on hover
- Click doesn't copy

**Solutions:**
1. **Disable and re-enable:**
   - Click extension icon
   - Toggle highlight mode off
   - Toggle highlight mode on
2. **Refresh the page:**
   - Press Ctrl+R (Cmd+R on Mac)
   - Enable highlight mode again
3. **Check for Elementor elements:**
   - Verify page has Elementor content
   - Check badge shows element count
4. **Try different elements:**
   - Hover over different areas
   - Look for sections, not just widgets
   - Try scrolling to different page areas
5. **Check browser console:**
   - Press F12 → Console tab
   - Look for JavaScript errors
   - Check for CSS conflicts
6. **Disable page styles temporarily:**
   - Some sites may hide overlays
   - Check z-index conflicts

**Common Causes:**
- Page CSS conflicts with overlay styles
- JavaScript errors on page
- No Elementor elements in viewport
- Browser zoom level issues

### Data Extraction Fails

**Symptoms:**
- "Could not extract data" error
- Incomplete data in clipboard
- Missing settings or content

**Solutions:**
1. **Try parent element:**
   - Copy section instead of widget
   - Copy entire page
   - Work from larger to smaller elements
2. **Check element attributes:**
   - Right-click → Inspect Element
   - Look for `data-elementor-settings`
   - Verify JSON is valid
3. **Try different element:**
   - Some custom widgets may not extract
   - Try standard Elementor widgets first
4. **Check Elementor version:**
   - Very old versions may have different structure
   - Update Elementor if possible
5. **View extracted data:**
   - Click extension icon
   - Click "View Clipboard"
   - Check what data was extracted

**Common Causes:**
- Custom widget without proper attributes
- Malformed JSON in element settings
- Old Elementor version
- Dynamically loaded content

### Paste Not Working in WordPress

**Symptoms:**
- Paste button does nothing
- "Invalid data" error in WordPress
- Preview doesn't show

**Solutions:**
1. **Verify plugin installed:**
   - Check WordPress Plugins page
   - Ensure "Elementor Widget Copier" is active
   - Check plugin version matches
2. **Check clipboard data:**
   - Click extension icon
   - Click "View Clipboard"
   - Verify data format is correct
3. **Copy again:**
   - Return to source site
   - Copy element again
   - Ensure success notification appears
4. **Check browser:**
   - Use same browser for copy and paste
   - Ensure clipboard wasn't overwritten
   - Try copying text first to test clipboard
5. **Verify HTTPS:**
   - WordPress admin must use HTTPS
   - Clipboard API requires secure context
6. **Check browser console:**
   - Press F12 in WordPress admin
   - Look for JavaScript errors
   - Check for clipboard read errors

**Common Causes:**
- WordPress plugin not installed
- Clipboard data overwritten
- HTTP instead of HTTPS
- Browser clipboard restrictions
- Different browser used for paste

### Browser Compatibility Issues

**Symptoms:**
- Extension doesn't install
- Features don't work
- Errors in console

**Solutions:**
1. **Update browser:**
   - Chrome 88+ required
   - Edge 88+ required
   - Check browser version
2. **Check Manifest V3 support:**
   - Older browsers don't support Manifest V3
   - Update to latest browser version
3. **Try different browser:**
   - Test in Chrome
   - Test in Edge
   - Test in Brave
4. **Clear browser cache:**
   - Clear browsing data
   - Restart browser
   - Reinstall extension

**Supported Browsers:**
- ✅ Chrome 88+
- ✅ Edge 88+ (Chromium)
- ✅ Brave (Latest)
- ✅ Opera (Latest)
- ❌ Firefox (not yet supported)
- ❌ Safari (not yet supported)

### Performance Issues

**Symptoms:**
- Slow extraction
- Browser freezes
- Large data causes issues

**Solutions:**
1. **Copy smaller sections:**
   - Don't copy entire large pages
   - Copy sections individually
   - Batch smaller imports
2. **Close other tabs:**
   - Free up browser memory
   - Reduce CPU usage
3. **Disable highlight mode:**
   - Highlight mode uses resources
   - Use context menu instead
4. **Check page complexity:**
   - Very complex pages take longer
   - Nested sections increase processing time

### Getting Help

If issues persist:

1. **Check documentation:**
   - Read main [README.md](../README.md)
   - Review [Testing Guide](TESTING_GUIDE.md)
   - Check [Test Validation Report](TEST_VALIDATION_REPORT.md)

2. **Run test suite:**
   - Open `test-suite.html`
   - Run all tests
   - Check which tests fail
   - Report results

3. **Collect information:**
   - Browser version
   - Extension version
   - Source site URL (if public)
   - Error messages
   - Console logs (F12)
   - Steps to reproduce

4. **Report issue:**
   - Open GitHub issue
   - Include collected information
   - Attach screenshots
   - Describe expected vs actual behavior

5. **Community support:**
   - Check existing GitHub issues
   - Search for similar problems
   - Ask in discussions

## 📝 Changelog

### Version 1.0.0 (2025-10-14)
- Initial release
- Context menu integration
- Highlight mode
- Clipboard copy
- Stats display
- Elementor detection

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

GPL v2 or later

## 👨‍💻 Author

**Kazem Moridi**
- GitHub: [@kazemmoridi](https://github.com/kazemmoridi)

## 🔗 Related

- **WordPress Plugin**: Elementor Widget Copier
- **Documentation**: See main README.md
- **Support**: GitHub Issues

## 💡 Tips

1. **Use Highlight Mode** for visual selection
2. **Copy Sections** to get multiple widgets at once
3. **Check Stats** to see what's available
4. **View Clipboard** to verify data before pasting
5. **Bookmark Pages** with elements you want to copy later

## 🎉 Enjoy!

Start copying Elementor elements with ease!

For support or questions, open an issue on GitHub.
