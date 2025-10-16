# 📥 How to Download Elementor Copier

## ⚠️ Important: Download the Correct File

When downloading Elementor Copier from GitHub Releases, **only download the extension ZIP file**, not the source code archives.

### ✅ Correct File to Download

Look for the file named:
```
elementor-copier-v1.2.0.zip
```
(or whatever the current version is)

This is the **built extension** ready to install in Chrome.

### ❌ Do NOT Download These Files

GitHub automatically creates these files, but they are **NOT** the extension:
- ❌ `Source code (zip)` - This is the raw source code, not the built extension
- ❌ `Source code (tar.gz)` - This is also raw source code

These source code archives will **NOT** work as a Chrome extension!

## 📦 Installation Steps

1. **Download** the correct file: `elementor-copier-v*.zip`
2. **Extract** the ZIP file to a folder
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable** "Developer mode" (toggle in top-right)
5. **Click** "Load unpacked"
6. **Select** the extracted `chrome-extension` folder
7. **Done!** The extension is now installed

## 🎯 Visual Guide

### On the Releases Page

You'll see something like this:

```
📦 Assets
  elementor-copier-v1.2.0.zip    ← ✅ DOWNLOAD THIS
  Source code (zip)              ← ❌ DON'T DOWNLOAD
  Source code (tar.gz)           ← ❌ DON'T DOWNLOAD
```

**Always download the `elementor-copier-v*.zip` file!**

## 🤔 Why Two Different ZIP Files?

- **`elementor-copier-v*.zip`** = Built extension (ready to use)
  - Contains only the extension files
  - Properly structured for Chrome
  - This is what you want!

- **`Source code (zip)`** = Raw repository code
  - Contains all project files
  - Includes documentation, build scripts, etc.
  - Not structured for Chrome
  - For developers only

## 💡 Quick Check

After extracting, you should see a folder structure like this:

```
chrome-extension/
├── manifest.json          ← Should be here!
├── background.js
├── content-v2.js
├── popup/
├── icons/
└── ... (other extension files)
```

If you see folders like `.github/`, `docs/`, or files like `README.md` at the root level, you downloaded the wrong file!

## 🆘 Still Confused?

### Direct Download Link

Use this direct link format (replace VERSION with current version):
```
https://github.com/kazemcodes/Elementor-Copier/releases/download/vVERSION/elementor-copier-vVERSION.zip
```

Example for v1.2.0:
```
https://github.com/kazemcodes/Elementor-Copier/releases/download/v1.2.0/elementor-copier-v1.2.0.zip
```

### Need Help?

- Check [INSTALLATION.md](INSTALLATION.md) for detailed instructions
- Open an [issue](https://github.com/kazemcodes/Elementor-Copier/issues) if you're stuck
- Make sure you're downloading from the [Releases page](https://github.com/kazemcodes/Elementor-Copier/releases)

## 📝 For Developers

If you want to build from source:
1. Clone the repository
2. Run `.\build-extension.ps1`
3. The built extension will be in `releases/` folder

---

**Remember:** Only download `elementor-copier-v*.zip` from the Assets section! 🎯
