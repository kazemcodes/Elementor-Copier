# 🔄 MUST REMOVE AND RELOAD EXTENSION

## The Issue
Chrome has **cached the old service worker** with the module configuration. A simple reload won't work.

## What We Fixed
1. Removed `"type": "module"` from manifest.json
2. Commented out `importScripts('donation-manager.js')` in background.js
3. Service worker will now load as a classic script (no crash)

## YOU MUST DO THIS:

### Option 1: Remove and Re-add (RECOMMENDED)
1. Go to `chrome://extensions/`
2. Find "Elementor Copier"
3. Click **"Remove"** button
4. Click **"Load unpacked"** button
5. Select the `chrome-extension` folder
6. Extension will load with fresh service worker

### Option 2: Hard Reload
1. Go to `chrome://extensions/`
2. **Toggle OFF** the Elementor Copier extension
3. Wait 5 seconds
4. **Toggle ON** the extension
5. Click the **reload icon** (circular arrow)
6. Check service worker status - should say "active"

## How to Verify It Worked:
1. Go to `chrome://extensions/`
2. Find "Elementor Copier"
3. Look for "service worker" link
4. Should show **"active"** or **"inactive"** (not "crashed")
5. Click "service worker" to open console
6. Should see logs, no errors

## After Successful Reload:
1. Refresh your test page
2. Enable highlight mode
3. Click a section
4. Should see:
   ```
   [Copy] Using direct Clipboard API
   ✓ Copied to clipboard via Clipboard API
   ```
5. Success notification appears!
6. Section is copied to clipboard

## Note About Donation Manager:
The donation manager feature is temporarily disabled to fix the crash. This only affects:
- Usage counter
- Donation reminders (every 25 uses)
- Welcome message on first install

The core copy/paste functionality is **not affected** and will work perfectly!
