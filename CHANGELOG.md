# Changelog

All notable changes to Elementor Copier will be documented in this file.

## [1.2.1] - 2025-10-16

### Fixed - Debug Logging
- **Added extensive logging** to diagnose copy issues
- **Content script logs** show copy request details
- **Background script logs** show processing steps
- **Better error messages** for troubleshooting

### Debug
- Added `[Copy]` prefix to copy-related logs
- Added `[Background]` prefix to background script logs
- Log data size and type for each copy operation
- Log response from background script

### Documentation
- Added `COPY_NOT_WORKING_DEBUG.md` - Complete debug guide
- Added `COPY_FROM_FRONTEND_VS_EDITOR.md` - Explains extraction methods

## [1.2.0] - 2025-10-16

### Added - Improved Copy Functionality
- **Elementor API Data Extraction**: Now extracts data directly from Elementor's internal API instead of just HTML
- **Native Elementor Format**: Copies proper Elementor element data with all settings and structure
- **Better Editor Support**: When copying from Elementor editor, gets actual element models with complete data
- **Automatic Fallback**: Falls back to DOM extraction when API is not available (frontend pages)

### Improved
- ✅ **Proper Settings**: All element settings are now preserved correctly
- ✅ **Widget Data**: Widget configurations are copied with full fidelity
- ✅ **Nested Elements**: Child elements maintain proper structure and relationships
- ✅ **Cross-Site Paste**: Pasted elements work better in target Elementor editor

### Technical
- New `elementor-data-extractor.js` module for API-based extraction
- Integrated with Elementor's model system
- Supports both Elementor 2.x and 3.x+ API structures
- Maintains backward compatibility with DOM extraction

## [1.1.0] - 2025-10-16

### Added - Donation Features
- **Usage Counter**: Track how many elements you've copied
- **Milestone Celebrations**: Get congratulated at 10, 50, 100, 250, and 500 copies
- **Welcome Message**: First-time users see a friendly welcome notification
- **Support Section**: New section in popup showing usage stats and donation info
- **User Badges**: Earn badges based on usage (Active User, Power User, Legendary User, etc.)
- **Periodic Reminders**: Gentle donation reminders every 7 days (fully dismissible)
- **One-Click Bitcoin Copy**: Easy copy button for Bitcoin donation address
- **Days Counter**: See how many days you've been using the extension

### Features - Ethical Design
- ✅ **Always Free**: Full functionality regardless of donation
- ✅ **Non-Intrusive**: All reminders are dismissible
- ✅ **Privacy First**: All data stored locally, never sent anywhere
- ✅ **Transparent**: Open source, anyone can verify
- ✅ **Respectful**: Reminders only every 7 days, not on every use

### Technical
- New `donation-manager.js` module for tracking and reminders
- Enhanced popup UI with support section
- Notification button handlers for donation actions
- Local storage for usage statistics
- Milestone detection system

### Documentation
- Added `DONATION_FEATURES.md` - Complete documentation of donation features
- Updated README with donation information
- Added ethical design principles documentation

## [1.0.0] - 2025-10-16

### Added
- Initial release of Elementor Copier Chrome Extension
- Copy and paste Elementor sections across different WordPress sites
- Visual highlighting of Elementor sections on hover
- Right-click context menu for copying sections
- Keyboard shortcut (Ctrl+V) for pasting
- Smart widget conversion for missing custom widgets
- Automatic conversion of Slider Revolution widgets to HTML
- Automatic conversion of WoodMart widgets to HTML
- Media URL preservation from source site
- Version compatibility handling between different Elementor versions
- Content sanitization for security
- Error handling and user notifications
- Support for all standard Elementor widgets
- Support for nested sections and columns
- Responsive settings preservation

### Features
- **Cross-Site Compatibility**: Works across different WordPress installations
- **Custom Widget Handling**: Converts unavailable widgets to HTML widgets
- **Media Preservation**: Maintains all image and media URLs
- **Security**: Sanitizes content to remove harmful scripts
- **User-Friendly**: Simple right-click and paste interface

### Technical
- Manifest V3 compliance
- MAIN world script injection for Elementor API access
- Offscreen document for clipboard operations
- Modular architecture for maintainability
- Comprehensive error handling

### Support
- Bitcoin donations: `bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm`

---

## Future Plans

### Planned Features
- [ ] Support for Elementor templates
- [ ] Batch copy multiple sections
- [ ] History of copied sections
- [ ] Cloud sync for copied content
- [ ] Firefox extension support
- [ ] Edge extension support

### Under Consideration
- [ ] Copy entire pages
- [ ] Widget library
- [ ] Style presets
- [ ] Keyboard shortcuts customization

---

**Note**: This is the first public release. Please report any issues on [GitHub](../../issues).
