# GitHub Workflow Fix - 403 Error Resolution

## Problem

The GitHub Actions workflow was failing with a 403 error when trying to create releases:

```
⚠️ GitHub release failed with status: 403
Error: Too many retries. Aborting...
```

## Root Causes

### 1. Missing Permissions
The workflow didn't have explicit permission to write to the repository contents (needed for creating releases).

### 2. Incorrect Repository URL
The repository was renamed from `elementor-copy` to `Elementor-Copier`, but URLs throughout the project weren't updated.

## Solutions Applied

### 1. Added Workflow Permissions

Updated `.github/workflows/build-and-release.yml` to include:

```yaml
permissions:
  contents: write
```

This grants the `GITHUB_TOKEN` permission to:
- Create releases
- Upload release assets
- Create tags

### 2. Updated All Repository URLs

Replaced all occurrences of:
- `kazemcodes/elementor-copy` → `kazemcodes/Elementor-Copier`

**Files Updated:**
- `chrome-extension/manifest.json`
- `chrome-extension/README.md`
- `chrome-extension/popup/popup.js`
- `chrome-extension/donation-manager.js`
- `README.md`
- `INSTALLATION.md`
- `BUILD_GUIDE.md`
- `GITHUB_DISTRIBUTION.md`
- `.github/WORKFLOW_GUIDE.md`
- `.github/workflows/build-and-release.yml`
- `FIRST_RELEASE.md`
- `UPDATES_SUMMARY.md`
- `DONATION_FEATURES.md`

## How GitHub Actions Permissions Work

### Default Permissions
By default, `GITHUB_TOKEN` has limited permissions for security reasons.

### Required Permissions for Releases
To create releases, the workflow needs:
- `contents: write` - Create releases, upload assets, create tags

### Permission Levels
```yaml
permissions:
  contents: write    # Create releases, push code
  issues: write      # Create/modify issues
  pull-requests: write  # Create/modify PRs
  packages: write    # Publish packages
```

For this workflow, we only need `contents: write`.

## Testing the Fix

### Before Next Push

1. **Verify permissions** in workflow file:
   ```yaml
   permissions:
     contents: write
   ```

2. **Check repository settings**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions"
   - Ensure "Read and write permissions" is selected

3. **Verify URLs** are correct:
   ```bash
   # Search for old URL
   grep -r "elementor-copy" . --exclude-dir=.git --exclude-dir=node_modules
   ```

### After Push

1. **Watch workflow run**:
   - Go to Actions tab
   - Click on the running workflow
   - Monitor each step

2. **Expected behavior**:
   - ✅ Checkout code
   - ✅ Get version from manifest
   - ✅ Check if release exists
   - ✅ Build extension
   - ✅ Create release (should succeed now)

3. **Verify release**:
   - Go to Releases tab
   - Should see new release with ZIP file attached

## Troubleshooting

### If 403 Error Persists

1. **Check repository settings**:
   ```
   Settings → Actions → General → Workflow permissions
   → Select "Read and write permissions"
   → Save
   ```

2. **Verify branch protection**:
   - Settings → Branches
   - Check if main branch has restrictions
   - Ensure Actions can create tags/releases

3. **Check organization settings** (if applicable):
   - Organization settings might override repository settings
   - Contact organization admin if needed

### If Release Already Exists

The workflow will skip creation and show:
```
Release v1.1.0 already exists. Skipping release creation.
```

To create a new release:
1. Update version in `manifest.json`
2. Push changes
3. Workflow will create new release

### If Build Fails

Check:
- `build-extension.ps1` exists
- All required files are present
- Manifest.json is valid JSON

## Alternative: Manual Release

If automated release still fails, you can create releases manually:

1. **Build locally**:
   ```powershell
   .\build-extension.ps1
   ```

2. **Create release on GitHub**:
   - Go to Releases → Draft a new release
   - Tag: `v1.1.0`
   - Upload: `releases/elementor-copier-v1.1.0.zip`
   - Publish

## Repository Settings Checklist

Before pushing:

- [x] Workflow has `permissions: contents: write`
- [x] All URLs updated to `Elementor-Copier`
- [ ] Repository settings allow Actions to create releases
- [ ] No branch protection blocking releases
- [ ] Version in manifest.json is correct

## Next Steps

1. **Commit these changes**:
   ```bash
   git add .
   git commit -m "Fix GitHub Actions permissions and update repository URLs"
   git push origin main
   ```

2. **Monitor workflow**:
   - Watch Actions tab
   - Should complete successfully now

3. **Verify release**:
   - Check Releases tab
   - Download and test ZIP file

## Summary

The 403 error was caused by:
1. ❌ Missing `contents: write` permission
2. ❌ Incorrect repository URLs

Fixed by:
1. ✅ Adding explicit permissions to workflow
2. ✅ Updating all URLs to correct repository name

The workflow should now successfully create releases automatically! 🎉

---

**Last Updated**: 2025-10-16
**Status**: Fixed and ready to test
