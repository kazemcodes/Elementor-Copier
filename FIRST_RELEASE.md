# Creating Your First Release

This guide will help you create the first release of Elementor Copier on GitHub.

## Prerequisites

✅ Repository is on GitHub: https://github.com/kazemcodes/elementor-copy
✅ GitHub Actions is enabled (should be by default)
✅ You have push access to the main branch

## Option 1: Automatic Release (Recommended)

The easiest way to create your first release is to let GitHub Actions do it automatically.

### Steps

1. **Verify the current version** in `chrome-extension/manifest.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Commit and push** all changes to main branch:
   ```bash
   git add .
   git commit -m "Setup automated releases and remove Chrome Web Store references"
   git push origin main
   ```

3. **Watch the workflow run:**
   - Go to https://github.com/kazemcodes/elementor-copy/actions
   - You should see "Build and Release Extension" workflow running
   - Click on it to see progress

4. **Check the release:**
   - Once workflow completes, go to https://github.com/kazemcodes/elementor-copy/releases
   - You should see "Elementor Copier v1.0.0" release
   - Download the ZIP to verify it works

### Expected Timeline

- Workflow starts: Immediately after push
- Build completes: ~2-3 minutes
- Release created: Automatically after build

## Option 2: Manual Release

If you prefer to create the first release manually:

### Steps

1. **Build the extension locally:**
   ```powershell
   .\build-extension.ps1
   ```

2. **Verify the build:**
   - Check `releases/elementor-copier-v1.0.0.zip` exists
   - Extract and test the extension

3. **Create GitHub release:**
   - Go to https://github.com/kazemcodes/elementor-copy/releases
   - Click "Draft a new release"
   - Fill in:
     - **Tag:** `v1.0.0`
     - **Title:** `Elementor Copier v1.0.0`
     - **Description:** Copy from the workflow template or write your own
   - Upload `releases/elementor-copier-v1.0.0.zip`
   - Click "Publish release"

## After First Release

### Update README Badge

The GitHub Release badge will automatically show the latest version:
```markdown
[![GitHub Release](https://img.shields.io/github/v/release/kazemcodes/elementor-copy?logo=github)](https://github.com/kazemcodes/elementor-copy/releases)
```

### Test Installation

1. Download the ZIP from your release
2. Extract it
3. Load in Chrome as unpacked extension
4. Test all features

### Announce the Release

Consider sharing on:
- GitHub Discussions
- WordPress forums
- Elementor community
- Social media

## Future Releases

For subsequent releases:

1. **Make your changes** to the extension
2. **Update version** in `manifest.json`:
   ```json
   {
     "version": "1.0.1"  // Increment version
   }
   ```
3. **Update CHANGELOG.md** with changes
4. **Commit and push** to main branch
5. **GitHub Actions** handles the rest!

## Versioning Guide

Follow semantic versioning:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

Examples:
- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature (e.g., new keyboard shortcut)
- `2.0.0` - Breaking change (e.g., new manifest version)

## Troubleshooting

### Workflow doesn't trigger

**Check:**
- Changes were pushed to `main` branch
- Changes include files in `chrome-extension/` folder
- GitHub Actions is enabled in repository settings

**Solution:**
- Try manual trigger: Actions → Build and Release Extension → Run workflow

### Build fails

**Check:**
- `build-extension.ps1` exists
- `manifest.json` is valid JSON
- All required files are present

**Solution:**
- Run build script locally to see errors
- Fix issues and push again

### Release not created

**Check:**
- Build step completed successfully
- Release with same version doesn't already exist
- GitHub token has proper permissions

**Solution:**
- Check workflow logs for errors
- Verify version is unique
- Try manual release as fallback

## Verification Checklist

After creating your first release:

- [ ] Release appears at https://github.com/kazemcodes/elementor-copy/releases
- [ ] ZIP file is attached to release
- [ ] ZIP file can be downloaded
- [ ] Extension can be extracted from ZIP
- [ ] Extension loads in Chrome without errors
- [ ] All features work as expected
- [ ] Version badge shows correct version
- [ ] Installation instructions are clear

## Next Steps

1. ✅ Create first release
2. ✅ Test installation process
3. ✅ Update documentation if needed
4. ✅ Gather user feedback
5. ✅ Plan next version features

## Support

Need help?
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Open an Issue](https://github.com/kazemcodes/elementor-copy/issues)
- [Workflow Guide](.github/WORKFLOW_GUIDE.md)

**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`

---

**Ready to release?** Just push your changes to main and let GitHub Actions do the work! 🚀
