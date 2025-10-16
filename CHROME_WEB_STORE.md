# Chrome Web Store Submission Guide

This guide will help you submit Elementor Copier to the Chrome Web Store.

## Prerequisites

1. Google account
2. Chrome Web Store developer account ($5 one-time fee)
3. Built extension ZIP file (`releases/elementor-copier-v1.0.0.zip`)

## Submission Steps

### 1. Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the $5 one-time registration fee
3. Complete your developer profile

### 2. Prepare Assets

You'll need:

#### Required Images
- **Icon**: 128x128px (already in `chrome-extension/icons/icon-128.png`)
- **Small Promo Tile**: 440x280px
- **Marquee Promo Tile**: 1400x560px (optional but recommended)
- **Screenshots**: At least 1, up to 5 (1280x800 or 640x400)

#### Store Listing Information

**Name**
```
Elementor Copier
```

**Summary** (132 characters max)
```
Copy and paste Elementor sections across different WordPress sites with ease! Smart widget conversion included.
```

**Description**
```
Elementor Copier makes it easy to copy and paste Elementor sections between different WordPress sites. Perfect for web developers, designers, and agencies working on multiple WordPress projects.

KEY FEATURES:
• Cross-Site Copy & Paste - Copy from one site, paste to another
• Smart Widget Conversion - Automatically converts unavailable custom widgets to HTML
• Visual Highlighting - Hover to identify sections before copying
• One-Click Operation - Simple right-click context menu
• Media Preservation - Maintains all images and media URLs
• Version Compatible - Works across different Elementor versions
• Secure - Content sanitization and XSS protection

HOW TO USE:
1. Right-click on any Elementor section
2. Select "Copy Elementor Section"
3. Go to your target site's Elementor editor
4. Press Ctrl+V (or Cmd+V on Mac)
5. Done! Your section is pasted with all content

SUPPORTED ELEMENTS:
✓ Sections and columns
✓ All standard Elementor widgets
✓ Custom third-party widgets (converted to HTML)
✓ Images and media
✓ Styling and responsive settings

PERFECT FOR:
• Web developers managing multiple WordPress sites
• Agencies building client websites
• Freelancers working on various projects
• Anyone who needs to reuse Elementor designs

PRIVACY & SECURITY:
• No data sent to external servers
• All operations happen locally in your browser
• Content sanitization removes harmful scripts
• Open source and transparent

SUPPORT:
Need help? Visit our GitHub repository for documentation and support.

Made with ❤️ for the WordPress & Elementor community
```

**Category**
```
Productivity
```

**Language**
```
English
```

### 3. Privacy Policy

**Privacy Policy URL**
```
https://github.com/yourusername/elementor-copier/blob/main/PRIVACY.md
```

Create a PRIVACY.md file in your repository with:
- What data is collected (none)
- How data is used (locally only)
- Third-party services (none)

### 4. Upload Extension

1. Click "New Item" in the developer dashboard
2. Upload `releases/elementor-copier-v1.0.0.zip`
3. Fill in all the store listing information
4. Upload all required images
5. Select appropriate categories and languages

### 5. Pricing & Distribution

- **Price**: Free
- **Regions**: All regions
- **Visibility**: Public

### 6. Submit for Review

1. Review all information
2. Click "Submit for Review"
3. Wait for approval (typically 1-3 business days)

## After Approval

### Update README
Update the Chrome Web Store link in:
- `README.md`
- `INSTALLATION.md`
- `QUICKSTART.md`

### Announce Release
- Create GitHub release
- Share on social media
- Update documentation

## Future Updates

To update the extension:
1. Update version in `manifest.json`
2. Run `build-extension.ps1`
3. Upload new ZIP to Chrome Web Store
4. Submit for review

## Tips for Approval

✅ **Do:**
- Provide clear, accurate description
- Include high-quality screenshots
- Test thoroughly before submission
- Follow Chrome Web Store policies
- Respond quickly to review feedback

❌ **Don't:**
- Use misleading descriptions
- Include copyrighted images
- Request unnecessary permissions
- Violate Chrome Web Store policies

## Support

If you need help with submission:
- [Chrome Web Store Developer Support](https://support.google.com/chrome_webstore/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)

## Donation

Support development:
**Bitcoin**: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`
