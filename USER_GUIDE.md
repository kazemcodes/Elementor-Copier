# 📘 Elementor Copier - Complete User Guide

## 🚀 Quick Start

### Installation
1. Download `elementor-copier-v1.0.0.zip` from releases
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extracted folder
5. The extension icon will appear in your toolbar

### First Use
1. Navigate to any WordPress site with Elementor
2. Open the Elementor editor
3. Press `Ctrl+Shift+C` to activate the element selector
4. Click on any element to copy it
5. Go to another Elementor editor and press `Ctrl+V` to paste

---

## ⌨️ Keyboard Shortcuts

### Primary Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Shift+C` | Enable Selector | Activates the Chrome DevTools-style element selector |
| `Ctrl+Shift+X` | Disable Selector | Deactivates the element selector |
| `Alt+C` | Quick Copy | Instantly copies the currently hovered element |
| `Ctrl+V` | Paste Element | Pastes the copied element in Elementor editor |
| `ESC` | Cancel | Exits selection mode without copying |

### Navigation (In Selector Mode)
| Key | Action | Description |
|-----|--------|-------------|
| `↑` | Parent Element | Selects the parent element in the hierarchy |
| `↓` | Child Element | Selects the first child element |
| `Click` | Copy Element | Copies the highlighted element |

---

## 🎯 Element Selection Methods

### Method 1: Keyboard Selector (Recommended)
**Best for: Precise element selection**

1. Press `Ctrl+Shift+C` to enable selector mode
2. Move your mouse over elements to see the highlight
3. Use `↑` and `↓` arrows to navigate the element hierarchy
4. Click to copy the selected element
5. Press `ESC` to cancel if needed

**Visual Feedback:**
- **Blue overlay**: Content area
- **Green overlay**: Padding area
- **Orange overlay**: Margin area
- **Tooltip**: Shows element type, ID, and dimensions

### Method 2: Context Menu (Right-Click)
**Best for: Quick access without keyboard**

1. Right-click on any Elementor element
2. Select "Elementor Copier" from the context menu
3. Choose "Copy Widget" or "Copy Section"
4. Element is copied to clipboard

### Method 3: Quick Copy (Alt+C)
**Best for: Rapid copying workflow**

1. Hover over the element you want to copy
2. Press `Alt+C`
3. Element is instantly copied

---

## 🎨 Understanding the Visual Highlighter

### Chrome DevTools-Style Overlay

When you enable the selector (`Ctrl+Shift+C`), you'll see a multi-layer overlay similar to Chrome DevTools:

```
┌─────────────────────────────────┐
│   Orange (Margin)               │
│  ┌───────────────────────────┐  │
│  │ Green (Padding)           │  │
│  │ ┌─────────────────────┐   │  │
│  │ │ Blue (Content)      │   │  │
│  │ │                     │   │  │
│  │ └─────────────────────┘   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Tooltip Information

The tooltip displays:
- **Element Type**: Section, Column, or Widget name
- **Element ID**: Unique Elementor element identifier
- **Dimensions**: Width × Height in pixels
- **Child Count**: Number of nested elements
- **Color Badge**: Visual indicator of element type

**Badge Colors:**
- 🟢 **Green**: Sections
- 🟡 **Yellow**: Columns
- 🔵 **Blue**: Widgets

---

## 📋 Copying Elements

### What Gets Copied?

When you copy an element, the extension captures:

✅ **Complete Element Data**
- All content (text, images, videos)
- All styling and design settings
- All responsive settings (mobile, tablet, desktop)
- All animations and effects
- All custom CSS
- All widget-specific settings

✅ **Nested Elements**
- All child elements and their settings
- Complete section/column structure
- Widget configurations

✅ **Media Files**
- Image URLs (preserved from source)
- Video URLs
- Background images
- Icon libraries

### Element Types Supported

| Element Type | Description | Copy Support |
|--------------|-------------|--------------|
| **Section** | Full-width container with columns | ✅ Complete |
| **Column** | Individual column with widgets | ✅ Complete |
| **Widget** | Any Elementor widget (standard or custom) | ✅ Complete |
| **Inner Section** | Nested sections within columns | ✅ Complete |
| **Custom Widgets** | Third-party widgets | ✅ Converted to HTML |

---

## 📥 Pasting Elements

### In Elementor Editor

1. Open the Elementor editor where you want to paste
2. Click in the area where you want to add the element
3. Press `Ctrl+V` or right-click and select "Paste"
4. The element will be inserted with all settings preserved

### Paste Locations

You can paste:
- **Into empty sections**: Creates new section
- **Into existing sections**: Adds as new column
- **Into columns**: Adds as new widget
- **At page level**: Creates new section at cursor position

### What Happens During Paste?

1. **Element Detection**: Extension detects Elementor editor
2. **Data Injection**: Injects element data into Elementor
3. **Media Handling**: Preserves or converts media URLs
4. **Widget Conversion**: Converts custom widgets if needed
5. **Rendering**: Elementor renders the pasted element

---

## 🔧 Advanced Features

### Smart Element Detection

The extension uses intelligent algorithms to find the best element to copy:

**Priority Order:**
1. **Section** (highest priority)
2. **Column** (medium priority)
3. **Widget** (lowest priority)

When you click on a widget inside a column, you can:
- Click directly on the widget → Copies the widget
- Press `↑` → Selects the parent column
- Press `↑` again → Selects the parent section

### Element Hierarchy Navigation

```
Section (Press ↑ to select)
  └─ Column (Press ↑ to select)
      └─ Widget (Currently selected)
          └─ Inner Element (Press ↓ to select)
```

### Custom Widget Handling

For custom widgets not available on the target site:
- Extension automatically converts to HTML widget
- Preserves all styling and content
- Maintains responsive behavior
- Includes inline CSS

---

## 💡 Pro Tips & Best Practices

### Workflow Optimization

1. **Use Keyboard Shortcuts**: Much faster than context menu
2. **Navigate Hierarchy**: Use arrow keys to select exact element
3. **Quick Copy Mode**: Use `Alt+C` for rapid copying
4. **Visual Confirmation**: Watch for the green flash animation

### Common Workflows

**Copying Multiple Elements:**
```
1. Press Ctrl+Shift+C
2. Click first element → Copied
3. Press Ctrl+Shift+C again
4. Click second element → Copied
5. Paste both in order
```

**Copying Entire Sections:**
```
1. Hover over any element in the section
2. Press ↑ until section is highlighted
3. Click to copy entire section
```

**Copying Specific Widgets:**
```
1. Press Ctrl+Shift+C
2. Click directly on the widget
3. Verify tooltip shows widget name
4. Click to copy
```

### Performance Tips

- **Copy smaller elements first**: Test with widgets before sections
- **Check media URLs**: Ensure images are accessible from target site
- **Use same Elementor version**: Best compatibility
- **Clear clipboard**: If experiencing issues, copy a new element

---

## 🐛 Troubleshooting

### Element Not Copying

**Problem**: Nothing happens when clicking element

**Solutions:**
1. Verify you're in Elementor editor (not preview mode)
2. Check that element has `data-element_type` attribute
3. Try using `Alt+C` instead
4. Refresh the page and try again
5. Check browser console for errors

### Paste Not Working

**Problem**: Ctrl+V doesn't paste element

**Solutions:**
1. Ensure you're in Elementor editor (not WordPress admin)
2. Click inside the editor canvas first
3. Try right-click → Paste instead
4. Check if clipboard has data (open popup to verify)
5. Verify Elementor is fully loaded

### Visual Highlighter Not Showing

**Problem**: No overlay appears when hovering

**Solutions:**
1. Press `Ctrl+Shift+C` to enable selector
2. Check if CSS is loaded (inspect page)
3. Try disabling other extensions
4. Refresh the page
5. Reinstall the extension

### Custom Widgets Not Working

**Problem**: Custom widget doesn't work after paste

**Solutions:**
1. Install the required plugin on target site
2. Use HTML widget conversion (automatic)
3. Manually recreate widget settings
4. Check widget compatibility

### Media Not Loading

**Problem**: Images don't show after paste

**Solutions:**
1. Verify source images are publicly accessible
2. Check image URLs in copied data
3. Re-upload images to target site
4. Use absolute URLs instead of relative

---

## 🔒 Privacy & Security

### Data Handling

- **Local Processing**: All operations happen in your browser
- **No Server Upload**: Data never leaves your computer
- **No Tracking**: Zero analytics or tracking
- **No Data Collection**: Extension doesn't collect any information

### Clipboard Security

- **Content Sanitization**: Removes potentially harmful scripts
- **Safe Paste**: Validates data before insertion
- **XSS Protection**: Filters malicious code
- **Secure Storage**: Uses browser's secure clipboard API

### Permissions Explained

| Permission | Why Needed | What It Does |
|------------|------------|--------------|
| `activeTab` | Access current page | Read Elementor elements |
| `clipboardWrite` | Copy to clipboard | Store element data |
| `clipboardRead` | Read from clipboard | Retrieve element data |
| `contextMenus` | Right-click menu | Add copy options |
| `scripting` | Inject scripts | Enable paste functionality |

---

## 📊 Extension Popup

### Status Indicators

**🟢 Elementor Detected**
- Extension is active and ready
- Shows element counts on page
- All features available

**🟡 Checking...**
- Extension is loading
- Scanning for Elementor
- Wait a moment

**🔴 Not Detected**
- Not on an Elementor page
- Extension inactive
- Navigate to Elementor editor

### Statistics Display

The popup shows:
- **Widgets**: Total number of widgets on page
- **Sections**: Total number of sections
- **Columns**: Total number of columns

### Last Copied Element

Shows information about the most recently copied element:
- Element type (Section/Column/Widget)
- Time of copy
- Quick actions (View Data, Copy Again)

---

## 🎓 Video Tutorials

### Coming Soon
- Basic copying and pasting
- Advanced element selection
- Keyboard shortcuts mastery
- Troubleshooting common issues
- Pro workflow tips

---

## 🆘 Getting Help

### Support Channels

1. **GitHub Issues**: Report bugs and request features
2. **Documentation**: Check this guide and README
3. **Community**: Join discussions on GitHub

### Before Asking for Help

Please provide:
- Chrome version
- Extension version
- Elementor version
- WordPress version
- Steps to reproduce issue
- Browser console errors (if any)

---

## 🎉 Success Stories

### Use Cases

**Web Development Agencies:**
- Reuse designs across client projects
- Create template libraries
- Speed up development by 50%

**Freelance Developers:**
- Build faster with reusable components
- Maintain consistency across projects
- Reduce repetitive work

**Site Builders:**
- Copy sections from demo sites
- Create personal template collections
- Experiment with different layouts

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

## 🤝 Contributing

Want to improve Elementor Copier? Check out our [Contributing Guide](CONTRIBUTING.md).

---

## 💰 Support Development

If you find this extension helpful, consider supporting development:

**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for the Elementor community**

*Last updated: v1.0.0 - October 2025*
