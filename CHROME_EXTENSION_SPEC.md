# Elementor Copier - Chrome Extension Specification

## 🎯 Concept

A Chrome extension that extracts Elementor widget/section/page data directly from the HTML source of any Elementor website, allowing users to:
1. **Right-click** on any Elementor element
2. **Copy** the Elementor data
3. **Paste** directly into their WordPress site using the plugin

---

## 🔧 How It Works

### Step 1: Chrome Extension (Source Site)
1. User visits any Elementor website
2. Extension detects Elementor data in HTML
3. User right-clicks on widget/section
4. Selects "Copy Elementor Widget" from context menu
5. Data is copied to clipboard in special format

### Step 2: WordPress Plugin (Target Site)
1. User goes to their WordPress admin
2. Opens Elementor Copier page
3. Clicks "Paste" button
4. Plugin reads clipboard data
5. Imports directly into Elementor

---

## 📦 Chrome Extension Features

### Detection
- Automatically detect Elementor websites
- Parse `data-elementor-settings` attributes
- Extract widget/section/page JSON data
- Identify element boundaries

### Context Menu
```
Right-click on element →
  ├─ Copy Elementor Widget
  ├─ Copy Elementor Section
  ├─ Copy Entire Page
  └─ View Element Info
```

### Visual Feedback
- Highlight Elementor elements on hover
- Show element type (widget/section/column)
- Display element name
- Show copy confirmation

### Data Extraction
- Extract from `data-elementor-settings`
- Extract from `data-elementor-type`
- Extract from `data-elementor-id`
- Parse nested structures
- Include media URLs
- Preserve all settings

---

## 🎨 Extension UI

### Popup Interface
```
┌─────────────────────────────┐
│  Elementor Copier           │
├─────────────────────────────┤
│                             │
│  ✓ Elementor Detected       │
│                             │
│  Elements on this page:     │
│  • 12 Widgets               │
│  • 4 Sections               │
│  • 2 Columns                │
│                             │
│  [Enable Highlight Mode]    │
│                             │
│  Last Copied:               │
│  Heading Widget             │
│  2 minutes ago              │
│                             │
│  [View Clipboard]           │
│  [Clear Clipboard]          │
│                             │
└─────────────────────────────┘
```

### Highlight Mode
- Overlay on Elementor elements
- Color-coded by type:
  - Blue: Widgets
  - Green: Sections
  - Orange: Columns
- Click to copy
- Hover to see info

---

## 💾 Data Format

### Clipboard Format (JSON)
```json
{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget",
  "data": {
    "id": "abc123",
    "elType": "widget",
    "widgetType": "heading",
    "settings": {
      "title": "Hello World",
      "size": "h2",
      "color": "#000000"
    }
  },
  "media": [
    {
      "id": "img1",
      "url": "https://example.com/image.jpg",
      "type": "image"
    }
  ],
  "metadata": {
    "sourceUrl": "https://example.com",
    "copiedAt": "2025-10-14T21:00:00Z",
    "elementorVersion": "3.16.0"
  }
}
```

---

## 🔌 WordPress Plugin Integration

### New "Paste" Feature

Add to admin page:
```php
<div class="elementor-copier-paste-section">
    <h2>Paste from Clipboard</h2>
    <p>Copy Elementor elements using the Chrome extension, then paste here.</p>
    
    <button id="paste-from-clipboard" class="button button-primary">
        Paste from Clipboard
    </button>
    
    <div id="paste-preview" style="display:none;">
        <!-- Preview of pasted content -->
    </div>
</div>
```

### JavaScript Handler
```javascript
document.getElementById('paste-from-clipboard').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        const data = JSON.parse(text);
        
        if (data.type === 'elementor-copier') {
            // Show preview
            showPreview(data);
            // Enable import button
            enableImport(data);
        }
    } catch (err) {
        alert('No Elementor data found in clipboard');
    }
});
```

---

## 📁 Chrome Extension Structure

```
elementor-copier-extension/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── styles/
│   └── highlight.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── utils/
    ├── extractor.js
    └── parser.js
```

---

## 🚀 Implementation Plan

### Phase 1: Chrome Extension Core
1. Create manifest.json
2. Implement content script for detection
3. Add context menu integration
4. Build data extraction logic
5. Implement clipboard copy

### Phase 2: Visual Features
1. Add highlight mode
2. Create popup UI
3. Add element info display
4. Implement hover effects

### Phase 3: WordPress Integration
1. Add paste button to admin page
2. Implement clipboard read
3. Add data validation
4. Create preview UI
5. Connect to import logic

### Phase 4: Advanced Features
1. Batch copy multiple elements
2. Copy entire page structure
3. Media download handling
4. Version compatibility checks
5. Error handling & validation

---

## 🎯 User Workflow

### Simple Copy/Paste Flow:

**On Source Site (Any Elementor Site):**
1. Install Chrome extension
2. Visit any Elementor website
3. Right-click on widget → "Copy Elementor Widget"
4. ✓ Copied to clipboard!

**On Target Site (Your WordPress):**
1. Go to Tools → Elementor Copier
2. Click "Paste from Clipboard"
3. Preview shows what will be imported
4. Select target page/position
5. Click "Import"
6. ✓ Done!

---

## 🔐 Security Considerations

### Extension Permissions
```json
{
  "permissions": [
    "contextMenus",
    "clipboardWrite",
    "activeTab"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

### Data Validation
- Validate JSON structure
- Sanitize HTML content
- Check for malicious code
- Verify Elementor format
- Limit data size

---

## 🎨 Extension Manifest

```json
{
  "manifest_version": 3,
  "name": "Elementor Copier",
  "version": "1.0.0",
  "description": "Copy Elementor widgets, sections, and pages from any website",
  "permissions": [
    "contextMenus",
    "clipboardWrite",
    "activeTab"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["styles/highlight.css"]
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 💡 Advantages

### Over Current Approach:
✅ No need to connect to source site  
✅ No authentication required  
✅ Works on ANY Elementor site  
✅ No API calls needed  
✅ Instant copy/paste  
✅ Works offline (after copy)  
✅ No server load  
✅ Privacy-friendly  

### User Experience:
✅ Simple right-click workflow  
✅ Visual element selection  
✅ Instant feedback  
✅ No complex setup  
✅ Works like copy/paste text  

---

## 🔄 Migration Path

### Keep Current Features:
- REST API (for programmatic access)
- AJAX handlers (for advanced features)
- Authentication (for private content)

### Add New Features:
- Paste from clipboard
- Chrome extension support
- Visual element picker
- Simplified workflow

### Both Methods Available:
1. **Simple**: Chrome extension + paste (most users)
2. **Advanced**: URL + authentication (power users)

---

## 📝 Next Steps

Would you like me to:

1. **Create the Chrome extension** files?
2. **Update the WordPress plugin** to support paste?
3. **Build both** together?

This approach is much better because:
- No need to scrape entire sites
- Works on any Elementor site
- Simple copy/paste workflow
- No authentication hassles
- Better user experience

Let me know and I'll start building! 🚀
