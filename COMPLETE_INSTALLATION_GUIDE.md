# Complete Installation Guide - Elementor Copier

## Overview

The Elementor Copier system consists of **TWO parts**:

1. **Chrome Extension** - For copying Elementor elements from any website
2. **WordPress Plugin** - For pasting elements into your WordPress site

Both are required for the complete workflow!

---

## Part 1: Install Chrome Extension

### Step 1: Extract the Extension

1. Locate the file: `releases/elementor-copier-v1.0.0.zip`
2. Extract it to a folder (e.g., `elementor-extension/`)
3. Remember this folder location

### Step 2: Load in Chrome

1. Open Chrome browser
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the folder where you extracted the extension
6. Extension icon should appear in your toolbar

### Step 3: Verify Installation

1. Visit any Elementor website (e.g., https://elementor.com/library/)
2. Extension badge should show element count
3. Right-click anywhere → You should see "Elementor Copier" in menu
4. Click extension icon → Popup should open

✅ **Chrome Extension is ready!**

---

## Part 2: Install WordPress Plugin

### Step 1: Upload Plugin

1. Log in to your WordPress admin panel
2. Go to: **Plugins → Add New**
3. Click **"Upload Plugin"** button at the top
4. Click **"Choose File"**
5. Select: `releases/elementor-copier-plugin-v1.0.0.zip`
6. Click **"Install Now"**
7. Wait for installation to complete
8. Click **"Activate Plugin"**

### Step 2: Verify Installation

1. Look in the left sidebar menu
2. Go to: **Tools** menu
3. You should see: **"Elementor Widget Copier"** (or in Persian: **"کپی ویجت المنتور"**)
4. Click on it to open the admin page

✅ **WordPress Plugin is ready!**

---

## Complete Workflow: Copy & Paste

### Step 1: Copy from Any Elementor Website

**Method 1: Right-Click Menu (Easiest)**

1. Visit any Elementor-powered website
2. Right-click on any element (heading, image, section, etc.)
3. Select **"Elementor Copier"** from the context menu
4. Choose what to copy:
   - **Copy Widget** - Single widget only
   - **Copy Section** - Entire section with all widgets
   - **Copy Column** - Column layout
   - **Copy Entire Page** - Full page structure
5. Success notification appears
6. ✅ Data is now in your clipboard!

**Method 2: Highlight Mode (Visual)**

1. Click the extension icon in toolbar
2. Click **"Enable Highlight Mode"**
3. Hover over elements - they highlight with colors:
   - **Blue** = Widgets
   - **Green** = Sections
   - **Orange** = Columns
4. Click any highlighted element to copy
5. ✅ Data is copied!

**Method 3: Extension Popup**

1. Click extension icon
2. View page statistics
3. Click **"Copy Entire Page"** for full page
4. ✅ Data is copied!

### Step 2: Paste into Your WordPress Site

1. **Open WordPress Admin**
   - Go to your WordPress site
   - Log in to admin panel
   - **Important:** Must use HTTPS (not HTTP)

2. **Navigate to Plugin Page**
   - Go to: **Tools → Elementor Widget Copier**
   - Or in Persian: **ابزارها → کپی ویجت المنتور**

3. **Click "Paste from Clipboard"**
   - Click the **"جایگذاری از کلیپ‌بورد"** button
   - Browser may ask for clipboard permission → Click **"Allow"**

4. **Review Preview**
   - Element type is shown (widget/section/page)
   - Source URL is displayed
   - Copy timestamp is shown
   - Verify this is the correct element

5. **Choose Import Target**

   **Option A: Create New Page**
   - Select **"صفحه جدید"** (New Page)
   - Enter page title
   - Element will be inserted as page content

   **Option B: Add to Existing Page**
   - Select **"صفحه موجود"** (Existing Page)
   - Choose page from dropdown
   - Select position: Top / Bottom / Replace

   **Option C: Save as Template**
   - Select **"قالب"** (Template)
   - Enter template name
   - Saves to Elementor template library

6. **Configure Media Handling**

   **Option A: Download to Media Library** (Recommended)
   - All images/videos are downloaded
   - Uploaded to your WordPress media library
   - URLs updated automatically
   - Takes longer but fully local

   **Option B: Keep Original URLs**
   - Uses source site URLs
   - Faster import
   - Depends on source site availability

7. **Click "Import"**
   - Click **"وارد کردن"** (Import) button
   - Wait for process to complete
   - Don't close browser tab

8. **Success!**
   - Success message appears in Persian
   - Link to edit page in Elementor
   - Click link to open Elementor editor
   - ✅ Element is imported!

---

## Troubleshooting

### Chrome Extension Issues

**Problem: Extension not detecting Elementor**
- ✅ Refresh the page (Ctrl+R)
- ✅ Verify site actually uses Elementor
- ✅ Check badge shows element count

**Problem: Copy not working**
- ✅ Ensure site uses HTTPS (not HTTP)
- ✅ Grant clipboard permissions when prompted
- ✅ Try copying again

**Problem: "window is not defined" error**
- ✅ Remove old extension completely
- ✅ Close and reopen Chrome
- ✅ Extract ZIP to NEW folder
- ✅ Load from NEW folder (not chrome-extension/ source folder)

### WordPress Plugin Issues

**Problem: Can't find plugin menu**
- ✅ Check under **Tools** menu
- ✅ Ensure plugin is activated
- ✅ Try refreshing WordPress admin

**Problem: Paste button not working**
- ✅ Ensure WordPress uses HTTPS (required for Clipboard API)
- ✅ Grant clipboard permission when prompted
- ✅ Verify clipboard has data (copy again from extension)
- ✅ Try different browser (Chrome, Edge, Firefox)

**Problem: "Invalid clipboard data" error**
- ✅ Copy element again from Chrome extension
- ✅ Don't copy other text between copy and paste
- ✅ Paste immediately after copying

**Problem: Import fails**
- ✅ Verify Elementor plugin is installed and activated
- ✅ Check you have sufficient permissions (Administrator or Editor)
- ✅ Try creating new page instead of updating existing
- ✅ Check WordPress debug log for errors

---

## System Requirements

### Chrome Extension
- ✅ Chrome 88+ (or Edge 88+, Brave, Opera)
- ✅ Manifest V3 support
- ✅ Clipboard API support

### WordPress Plugin
- ✅ WordPress 5.6 or higher
- ✅ PHP 7.4 or higher
- ✅ Elementor plugin installed and activated
- ✅ HTTPS connection (required for Clipboard API)
- ✅ Modern browser (Chrome 66+, Firefox 63+, Safari 13.1+, Edge 79+)

---

## Quick Reference

### File Locations

**Chrome Extension:**
- ZIP: `releases/elementor-copier-v1.0.0.zip`
- Size: ~15 KB

**WordPress Plugin:**
- ZIP: `releases/elementor-copier-plugin-v1.0.0.zip`
- Size: ~XXX KB

### Access Points

**Chrome Extension:**
- Extension icon in toolbar
- Right-click context menu
- Popup interface

**WordPress Plugin:**
- WordPress Admin → Tools → Elementor Widget Copier
- Or: ابزارها → کپی ویجت المنتور

---

## Support

### Documentation
- Main README: `README.md`
- Chrome Extension Guide: `chrome-extension/README.md`
- Release Notes: `RELEASE_NOTES.md`

### Issues
- GitHub Issues: Report bugs and problems
- Check existing issues first
- Provide detailed information

---

## Success Checklist

Before you start:
- [ ] Chrome extension installed and working
- [ ] WordPress plugin installed and activated
- [ ] Elementor plugin installed on WordPress
- [ ] WordPress site uses HTTPS
- [ ] Browser supports Clipboard API

Test the workflow:
- [ ] Visit Elementor demo site
- [ ] Copy a simple heading widget
- [ ] Go to WordPress admin
- [ ] Paste from clipboard
- [ ] Import to new page
- [ ] Verify in Elementor editor

✅ **If all steps work, you're ready to use Elementor Copier!**

---

## Tips for Best Results

1. **Start Simple:** Test with simple widgets (headings, text) before complex sections
2. **Use HTTPS:** Both source and target sites should use HTTPS
3. **Download Media:** For production sites, always download media to your library
4. **Test First:** Test imports on staging site before production
5. **Create Backups:** Backup your site before importing to existing pages
6. **Check Permissions:** Ensure you have edit_pages capability
7. **Clear Cache:** Clear WordPress cache after importing
8. **Regenerate CSS:** Use Elementor → Tools → Regenerate CSS if styling looks wrong

---

**Ready to copy Elementor elements with ease!** 🚀

For questions or issues, check the documentation or open a GitHub issue.
