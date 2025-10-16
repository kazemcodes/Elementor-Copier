# Elementor Editor Paste Feature

## 🎉 New Feature: Paste Directly in Elementor Editor!

You can now paste copied Elementor elements **directly in the Elementor editor** - no need to go to a separate admin page!

---

## ✨ What's New

### Before (Old Way):
1. Copy element with Chrome extension
2. Go to WordPress Admin → Tools → Elementor Widget Copier
3. Click "Paste from Clipboard"
4. Choose target and import
5. Open page in Elementor editor

### After (New Way):
1. Copy element with Chrome extension
2. **Open any page in Elementor editor**
3. **Click "Paste from Clipboard" button** (in editor panel)
4. Done! Element is inserted immediately

---

## 🚀 How to Use

### Step 1: Copy Element (Same as Before)

1. Visit any Elementor website
2. Right-click on element
3. Select "Elementor Copier" → "Copy Widget/Section/Page"
4. Success notification appears

### Step 2: Paste in Elementor Editor (NEW!)

1. **Open Elementor Editor:**
   - Go to any page in WordPress
   - Click "Edit with Elementor"
   - Elementor editor opens

2. **Find the Paste Button:**
   - Look in the Elementor panel (left side)
   - You'll see a green button: **"جایگذاری از کلیپ‌بورد"** (Paste from Clipboard)
   - Or use keyboard shortcut: **Ctrl+Shift+V** (Cmd+Shift+V on Mac)

3. **Click the Paste Button:**
   - Button is located in the panel footer or header
   - Green button with clipboard icon

4. **Choose Media Handling:**
   - Dialog appears: "Download Media?"
   - **"Yes, Download"** - Downloads images to your media library (recommended)
   - **"No, Keep Original URLs"** - Uses source URLs (faster but depends on source site)

5. **Element is Inserted:**
   - Element appears in the editor immediately
   - You can drag, edit, and customize it
   - No page reload needed!

---

## 🎯 Features

### ✅ Direct Insertion
- Paste directly into Elementor editor
- No need to leave the editor
- Instant preview

### ✅ Smart Positioning
- Elements are inserted at current position
- Works with sections, columns, and widgets
- Maintains structure and hierarchy

### ✅ Media Handling
- Choose to download media or keep original URLs
- Progress indication during download
- Automatic URL replacement

### ✅ Keyboard Shortcut
- **Ctrl+Shift+V** (Windows/Linux)
- **Cmd+Shift+V** (Mac)
- Works anywhere in Elementor editor

### ✅ Visual Feedback
- Loading indicators
- Success/error notifications
- Progress messages

### ✅ Persian Language Support
- Button text in Persian: "جایگذاری از کلیپ‌بورد"
- All notifications in Persian
- RTL layout support

---

## 📍 Button Location

The paste button appears in the Elementor panel:

```
┌─────────────────────────────┐
│   Elementor Panel           │
├─────────────────────────────┤
│   [Panel Header]            │
│                             │
│   [Elements/Widgets]        │
│                             │
│   [Settings]                │
│                             │
│   ...                       │
│                             │
├─────────────────────────────┤
│   [📋 Paste from Clipboard] │ ← HERE!
│   [Other Tools]             │
└─────────────────────────────┘
```

---

## 🔧 Technical Details

### Files Added

1. **`includes/class-elementor-editor-integration.php`**
   - PHP class for editor integration
   - Handles AJAX requests
   - Processes clipboard data
   - Downloads media

2. **`assets/js/elementor-editor.js`**
   - JavaScript for editor UI
   - Adds paste button
   - Handles clipboard reading
   - Inserts elements into editor

3. **`assets/css/elementor-editor.css`**
   - Styles for paste button
   - Notification styles
   - Dialog customization
   - RTL support

### How It Works

1. **Button Injection:**
   - JavaScript adds button to Elementor panel on load
   - Button is styled to match Elementor's design

2. **Clipboard Reading:**
   - Uses Clipboard API to read data
   - Validates JSON structure
   - Checks for required fields

3. **Server Processing:**
   - Sends data to WordPress via AJAX
   - Server validates and processes data
   - Downloads media if requested
   - Returns processed element data

4. **Element Insertion:**
   - Uses Elementor's API (`$e.run`)
   - Inserts element at current position
   - Refreshes preview automatically

---

## 🎨 Supported Element Types

### ✅ Widgets
- Single widgets (heading, text, image, button, etc.)
- Inserted at current cursor position
- All settings preserved

### ✅ Sections
- Full sections with all columns and widgets
- Inserted at end of page or current position
- Structure maintained

### ✅ Columns
- Column layouts with widgets
- Inserted into current section
- Responsive settings preserved

### ✅ Pages
- Multiple sections
- Entire page structure
- All elements included

---

## 🔒 Security

### Validation
- ✅ Nonce verification
- ✅ Capability checks (`edit_pages`)
- ✅ Data structure validation
- ✅ JSON parsing with error handling

### Sanitization
- ✅ All input sanitized
- ✅ URLs validated
- ✅ HTML cleaned
- ✅ XSS prevention

---

## 🐛 Troubleshooting

### Button Not Appearing

**Problem:** Can't find paste button in Elementor editor

**Solutions:**
1. ✅ Ensure WordPress plugin is updated
2. ✅ Clear browser cache (Ctrl+Shift+R)
3. ✅ Reload Elementor editor
4. ✅ Check browser console for errors (F12)

### Paste Not Working

**Problem:** Click button but nothing happens

**Solutions:**
1. ✅ Ensure clipboard has data (copy again from Chrome extension)
2. ✅ Check WordPress uses HTTPS (required for Clipboard API)
3. ✅ Grant clipboard permission when prompted
4. ✅ Check browser console for errors

### Element Not Inserting

**Problem:** Paste succeeds but element doesn't appear

**Solutions:**
1. ✅ Refresh Elementor preview
2. ✅ Check element was inserted (scroll down)
3. ✅ Try inserting into different section
4. ✅ Check WordPress debug log

### Media Not Downloading

**Problem:** Images don't download or show broken

**Solutions:**
1. ✅ Check source URLs are accessible
2. ✅ Verify PHP `allow_url_fopen` is enabled
3. ✅ Check disk space on server
4. ✅ Try "Keep Original URLs" option

---

## 💡 Tips & Best Practices

### For Best Results:

1. **Use HTTPS:**
   - Both source and WordPress site should use HTTPS
   - Required for Clipboard API

2. **Download Media:**
   - Always download media for production sites
   - Keeps your site independent of source

3. **Test First:**
   - Test on staging site before production
   - Try simple elements before complex ones

4. **Save Often:**
   - Save your work before pasting
   - Create backup before major imports

5. **Check Preview:**
   - Always preview after pasting
   - Verify styling and layout
   - Test responsive design

6. **Use Keyboard Shortcut:**
   - **Ctrl+Shift+V** is faster than clicking
   - Works from anywhere in editor

---

## 🆚 Comparison with Admin Page Method

| Feature | Editor Paste (NEW) | Admin Page (OLD) |
|---------|-------------------|------------------|
| **Speed** | ⚡ Instant | 🐌 Slower (page navigation) |
| **Workflow** | 🎯 Direct | 🔄 Multi-step |
| **Preview** | ✅ Immediate | ❌ Must open editor |
| **Editing** | ✅ Instant | ❌ Must save first |
| **Convenience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation:** Use the new editor paste method for faster workflow!

---

## 📦 Installation

The feature is **automatically included** in the WordPress plugin. Just update to the latest version:

1. Download latest plugin ZIP
2. Update plugin in WordPress
3. Open Elementor editor
4. Paste button appears automatically!

---

## 🎓 Video Tutorial (Coming Soon)

A video tutorial showing the new paste feature will be available soon.

---

## 🤝 Feedback

Love this feature? Have suggestions? Let us know!

- GitHub Issues: Report bugs
- GitHub Discussions: Share feedback
- Feature requests welcome!

---

## 🎉 Enjoy the New Feature!

Paste Elementor elements faster than ever with direct editor integration!

**Workflow:**
1. Copy (Chrome extension)
2. Paste (Elementor editor)
3. Done!

No more switching between admin pages. Everything happens in the editor! 🚀
