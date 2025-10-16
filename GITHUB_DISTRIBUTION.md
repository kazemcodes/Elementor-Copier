# GitHub Distribution Guide

This extension is distributed exclusively through GitHub Releases due to Chrome Web Store restrictions.

## Why GitHub Only?

The Chrome Web Store requires a $5 USD registration fee that cannot be paid from certain regions, including Iran. To ensure this extension remains accessible to everyone, it's distributed as a free, open-source project on GitHub.

## Automated Release Process

This repository uses GitHub Actions to automatically build and release the extension whenever changes are pushed to the main branch.

### How It Works

1. **Automatic Build**: When you push changes to `chrome-extension/` folder, the workflow triggers
2. **Version Detection**: Reads version from `manifest.json`
3. **Build Package**: Runs `build-extension.ps1` to create the ZIP file
4. **Create Release**: Automatically creates a GitHub release with the built extension
5. **Skip Duplicates**: Won't create duplicate releases if the version already exists

### Workflow File

The workflow is defined in `.github/workflows/build-and-release.yml`

## Manual Release Process

If you prefer to create releases manually:

1. **Update Version**
   ```json
   // chrome-extension/manifest.json
   {
     "version": "1.0.1"  // Increment version
   }
   ```

2. **Build Extension**
   ```powershell
   .\build-extension.ps1
   ```

3. **Create GitHub Release**
   - Go to [Releases](https://github.com/kazemcodes/Elementor-Copier/releases)
   - Click "Draft a new release"
   - Tag: `v1.0.1`
   - Title: `Elementor Copier v1.0.1`
   - Upload: `releases/elementor-copier-v1.0.1.zip`
   - Publish release

## Installation for Users

Users can install the extension by:

1. Downloading the latest ZIP from [Releases](https://github.com/kazemcodes/Elementor-Copier/releases)
2. Extracting the ZIP file
3. Loading it as an unpacked extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted `chrome-extension` folder

## Benefits of GitHub Distribution

✅ **Free**: No registration fees or payment barriers
✅ **Open Source**: Full transparency and community contributions
✅ **Global Access**: Available to developers worldwide
✅ **Version Control**: Complete history and rollback capability
✅ **Automated**: CI/CD pipeline for seamless releases
✅ **Community Driven**: Issues, PRs, and discussions on GitHub

## Updating the Extension

Users need to manually update by:
1. Downloading the new version
2. Removing the old version from `chrome://extensions/`
3. Loading the new version

**Note**: Unlike Chrome Web Store extensions, GitHub-distributed extensions don't auto-update. Consider adding an update notification feature in future versions.

## Support

If you find this extension helpful, consider supporting development:

**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`

## License

MIT License - Free to use, modify, and distribute.
