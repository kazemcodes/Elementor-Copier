# WordPress Plugin Installation Troubleshooting

## Error: "Plugin files are missing or corrupted"

This error means the `includes/class-plugin.php` file is missing from the uploaded plugin.

### Solution 1: Re-download and Re-upload

1. **Download fresh ZIP:**
   - Get `releases/elementor-copier-plugin-v1.0.0.zip` from your project
   - Make sure you download the complete file

2. **Delete old plugin:**
   - Go to WordPress Admin → Plugins
   - Deactivate "Elementor Widget Copier" if active
   - Delete the plugin completely

3. **Upload fresh ZIP:**
   - Go to Plugins → Add New → Upload Plugin
   - Choose the fresh ZIP file
   - Click "Install Now"
   - Click "Activate"

### Solution 2: Manual Installation via FTP

If ZIP upload doesn't work, install manually:

1. **Extract ZIP file on your computer:**
   - Extract `elementor-copier-plugin-v1.0.0.zip`
   - You should see these folders/files:
     ```
     elementor-copier.php
     readme.txt
     includes/
     assets/
     languages/
     ```

2. **Upload via FTP:**
   - Connect to your server via FTP
   - Navigate to `/wp-content/plugins/`
   - Create folder: `elementor-copier`
   - Upload ALL files into this folder
   - Final structure should be:
     ```
     /wp-content/plugins/elementor-copier/
       elementor-copier.php
       readme.txt
       includes/
       assets/
       languages/
     ```

3. **Activate in WordPress:**
   - Go to WordPress Admin → Plugins
   - Find "Elementor Widget Copier"
   - Click "Activate"

### Solution 3: Check File Permissions

If files are uploaded but still showing error:

1. **Check file permissions via FTP:**
   - Files should be: `644` (rw-r--r--)
   - Folders should be: `755` (rwxr-xr-x)

2. **Fix permissions:**
   ```bash
   # Via SSH
   cd /wp-content/plugins/elementor-copier
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   ```

### Solution 4: Check Server Requirements

Ensure your server meets requirements:

- **PHP:** 7.4 or higher
- **WordPress:** 5.6 or higher
- **Elementor:** Any version (1.0+)

Check PHP version:
- WordPress Admin → Tools → Site Health → Info → Server

### Solution 5: Enable Debug Mode

To see detailed error messages:

1. **Edit wp-config.php:**
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```

2. **Check debug log:**
   - Location: `/wp-content/debug.log`
   - Look for "Elementor Copier" errors
   - Check what file is missing

3. **Check plugin log:**
   - Location: `/wp-content/elementor-copier-debug.log`
   - Shows detailed plugin initialization

### Common Issues

#### Issue: "Class not found" error

**Cause:** PHP autoloader can't find class files

**Solution:**
- Ensure `includes/` folder exists
- Check file names match class names
- Verify folder structure is correct

#### Issue: Works on localhost but not on remote server

**Cause:** Case-sensitive file systems or missing files

**Solution:**
- Check file names are exactly correct (case-sensitive)
- Ensure ALL files were uploaded
- Check folder permissions

#### Issue: Plugin activates but admin page doesn't appear

**Cause:** Admin page class not loading

**Solution:**
- Verify `includes/admin/class-adminpage.php` exists
- Check file permissions
- Clear WordPress cache
- Deactivate and reactivate plugin

### Verification Checklist

Before uploading, verify ZIP contains:

- [ ] `elementor-copier.php` (main plugin file)
- [ ] `readme.txt` (plugin readme)
- [ ] `includes/class-plugin.php` (main class)
- [ ] `includes/admin/class-adminpage.php` (admin page)
- [ ] `includes/ajax/` (AJAX handlers)
- [ ] `includes/import/` (import classes)
- [ ] `assets/js/admin.js` (JavaScript)
- [ ] `assets/css/admin.css` (styles)
- [ ] `languages/` (translations)

### Testing After Installation

1. **Check plugin is active:**
   - Go to Plugins page
   - "Elementor Widget Copier" should show "Deactivate" button

2. **Check admin page appears:**
   - Go to Tools menu
   - Look for "Elementor Widget Copier" or "کپی ویجت المنتور"

3. **Test paste button:**
   - Open Tools → Elementor Widget Copier
   - Click "Paste from Clipboard" button
   - Should show error or prompt for clipboard permission

4. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Should see "PasteHandler initialized" or similar

### Still Having Issues?

1. **Check debug logs:**
   - `/wp-content/debug.log`
   - `/wp-content/elementor-copier-debug.log`

2. **Verify file structure:**
   ```
   /wp-content/plugins/elementor-copier/
   ├── elementor-copier.php
   ├── readme.txt
   ├── includes/
   │   ├── class-plugin.php
   │   ├── admin/
   │   │   └── class-adminpage.php
   │   ├── ajax/
   │   ├── import/
   │   └── ...
   ├── assets/
   │   ├── js/
   │   │   └── admin.js
   │   └── css/
   │       └── admin.css
   └── languages/
   ```

3. **Contact support:**
   - Provide error messages
   - Share debug log
   - Describe what you've tried

---

## Quick Fix Commands

### Via SSH:

```bash
# Navigate to plugins directory
cd /wp-content/plugins/

# Remove old plugin
rm -rf elementor-copier

# Upload new ZIP and extract
unzip elementor-copier-plugin-v1.0.0.zip -d elementor-copier

# Fix permissions
chmod -R 755 elementor-copier
find elementor-copier -type f -exec chmod 644 {} \;
find elementor-copier -type d -exec chmod 755 {} \;

# Check structure
ls -la elementor-copier/
ls -la elementor-copier/includes/
```

### Via WP-CLI:

```bash
# Deactivate and delete old plugin
wp plugin deactivate elementor-copier
wp plugin delete elementor-copier

# Install from ZIP
wp plugin install /path/to/elementor-copier-plugin-v1.0.0.zip

# Activate
wp plugin activate elementor-copier

# Check status
wp plugin list | grep elementor
```

---

## Prevention

To avoid this issue in future:

1. **Always use the official ZIP** from `releases/` folder
2. **Don't modify files** after creating ZIP
3. **Upload complete ZIP** - don't extract and re-zip
4. **Check file integrity** before uploading
5. **Keep backups** of working versions

---

## Success Indicators

Plugin is installed correctly when:

- ✅ No error messages on Plugins page
- ✅ "Tools → Elementor Widget Copier" menu appears
- ✅ Admin page loads without errors
- ✅ Paste button is visible and clickable
- ✅ No errors in browser console
- ✅ Debug log shows successful initialization

---

**Need more help?** Check the debug logs and share the error messages!
