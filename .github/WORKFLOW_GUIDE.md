# GitHub Actions Workflow Guide

## Overview

This repository uses GitHub Actions to automatically build and release the Elementor Copier extension whenever changes are pushed to the main branch.

## Workflow: Build and Release Extension

**File:** `.github/workflows/build-and-release.yml`

### Triggers

The workflow runs when:
1. **Push to main branch** with changes to:
   - `chrome-extension/**` (any file in the extension folder)
   - `build-extension.ps1` (build script)
   - `.github/workflows/build-and-release.yml` (workflow itself)

2. **Manual trigger** via GitHub Actions UI (workflow_dispatch)

### What It Does

1. **Checkout Code** - Gets the latest code from the repository
2. **Get Version** - Reads version from `chrome-extension/manifest.json`
3. **Check Existing Release** - Verifies if a release with this version already exists
4. **Build Extension** - Runs `build-extension.ps1` to create the ZIP file (only if release doesn't exist)
5. **Create Release** - Creates a GitHub release with the built ZIP (only if release doesn't exist)
6. **Skip Duplicate** - Logs a message if release already exists

### Release Details

Each release includes:
- **Tag:** `v{version}` (e.g., `v1.0.0`)
- **Title:** `Elementor Copier v{version}`
- **Body:** Installation instructions, changelog link, donation info
- **Asset:** `elementor-copier-v{version}.zip`

### Requirements

- **Runner:** Windows (required for PowerShell script)
- **Permissions:** Write access to releases (automatic via GITHUB_TOKEN)

## How to Release a New Version

### Automatic Release (Recommended)

1. **Update version** in `chrome-extension/manifest.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Commit and push** to main:
   ```bash
   git add chrome-extension/manifest.json
   git commit -m "Bump version to 1.0.1"
   git push origin main
   ```

3. **Wait for workflow** to complete (check Actions tab)

4. **Verify release** at https://github.com/kazemcodes/elementor-copy/releases

### Manual Trigger

1. Go to **Actions** tab on GitHub
2. Select **Build and Release Extension** workflow
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow** button

### Manual Release (Without Workflow)

If you prefer to create releases manually:

1. **Build locally:**
   ```powershell
   .\build-extension.ps1
   ```

2. **Create release on GitHub:**
   - Go to Releases → Draft a new release
   - Tag: `v1.0.1`
   - Upload: `releases/elementor-copier-v1.0.1.zip`
   - Publish

## Troubleshooting

### Workflow Fails

**Check:**
- Build script exists and is executable
- Manifest.json is valid JSON
- Version format is correct (e.g., "1.0.0")
- GitHub token has proper permissions

**View logs:**
- Go to Actions tab
- Click on failed workflow run
- Expand failed step to see error

### Release Not Created

**Possible reasons:**
1. Release with same version already exists
2. Build script failed
3. ZIP file not created
4. Permissions issue

**Solution:**
- Check workflow logs
- Verify version is unique
- Test build script locally

### Duplicate Releases

The workflow automatically prevents duplicate releases by checking if a release with the same version tag already exists. If it does, the workflow skips the build and release steps.

## Best Practices

1. **Version Bumping:**
   - Follow semantic versioning (MAJOR.MINOR.PATCH)
   - Update version before pushing changes
   - Document changes in CHANGELOG.md

2. **Testing:**
   - Test extension locally before pushing
   - Verify build script works
   - Check manifest.json validity

3. **Release Notes:**
   - Update CHANGELOG.md with each release
   - Include breaking changes
   - List new features and bug fixes

4. **Monitoring:**
   - Watch Actions tab for workflow status
   - Enable notifications for failed workflows
   - Review release assets after creation

## Workflow Permissions

The workflow uses:
- `GITHUB_TOKEN` - Automatic token for creating releases
- `GH_TOKEN` - For checking existing releases with GitHub CLI

Both are provided automatically by GitHub Actions.

## Customization

### Change Trigger Paths

Edit the `paths` section:
```yaml
paths:
  - 'chrome-extension/**'
  - 'build-extension.ps1'
  - 'your-custom-path/**'
```

### Modify Release Body

Edit the `body` section in the "Create Release" step:
```yaml
body: |
  Your custom release notes here
```

### Add More Steps

Add steps before or after existing ones:
```yaml
- name: Your Custom Step
  run: |
    echo "Custom action"
```

## Support

For workflow issues:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Open an Issue](https://github.com/kazemcodes/elementor-copy/issues)

For extension support:
**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`
