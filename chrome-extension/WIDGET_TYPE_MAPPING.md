# Widget Type Mapping Documentation

## Overview

The widget type mapping system handles version compatibility between different Elementor versions by automatically converting widget types and settings when copying elements from one version and pasting into another.

## Features

### 1. Widget Type Migrations

Automatically maps old widget types to new ones across Elementor versions:

**2.x → 3.x Migrations:**
- `image-box` → `icon-box`
- `icon-list` → `icon-list-item`

**3.x → 4.x Migrations:**
- Currently no migrations defined (placeholder for future updates)

**Multi-step Migrations:**
- Supports 2.x → 4.x by applying both 2.x→3.x and 3.x→4.x migrations sequentially

### 2. Deprecated Widget Fallbacks

Handles deprecated WordPress widgets with modern Elementor equivalents:

| Deprecated Widget | Modern Equivalent |
|------------------|-------------------|
| `wordpress` | `text-editor` |
| `wp-widget-text` | `text-editor` |
| `wp-widget-media_image` | `image` |
| `wp-widget-media_video` | `video` |
| `wp-widget-media_audio` | `audio` |

### 3. Settings Property Migrations

Automatically renames settings properties when they change between versions:

**Heading Widget:**
- `tag` → `header_size` (Elementor 2.x → 3.x)

**Button Widget:**
- `size` → `button_size`

**Image Widget:**
- `link_to` → `link`

**Icon Widget:**
- `icon` → `selected_icon`

### 4. Settings Value Transformations

Transforms setting values when property names change:

**Heading Widget `header_size`:**
- Supports: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `div`, `span`, `p`
- Ensures values remain valid after property name migration

## API Reference

### `mapWidgetType(widgetType, sourceVersion, targetVersion)`

Maps a widget type from source version to target version.

**Parameters:**
- `widgetType` (string): The original widget type
- `sourceVersion` (string): Source Elementor version (e.g., "2.9.0")
- `targetVersion` (string): Target Elementor version (e.g., "3.5.0")

**Returns:**
- (string): The mapped widget type

**Example:**
```javascript
const mapped = mapWidgetType('image-box', '2.9.0', '3.5.0');
// Returns: 'icon-box'
```

### `convertSettings(settings, elementType, sourceVersion, targetVersion)`

Converts element settings with property migrations.

**Parameters:**
- `settings` (object): Original settings object
- `elementType` (string): Element or widget type
- `sourceVersion` (string): Source Elementor version
- `targetVersion` (string): Target Elementor version

**Returns:**
- (object): Converted settings with migrated properties

**Example:**
```javascript
const settings = {
  title: 'My Heading',
  tag: 'h2',  // Old property
  align: 'center'
};

const converted = convertSettings(settings, 'heading', '2.9.0', '3.5.0');
// Returns: {
//   title: 'My Heading',
//   header_size: 'h2',  // Migrated property
//   align: 'center',
//   _element_id: '',
//   _css_classes: ''
// }
```

## Migration Logic Flow

```
1. Check if widget is deprecated
   ↓ (if yes)
   Apply fallback mapping
   ↓
2. Determine source and target major versions
   ↓
3. Apply version-specific migrations:
   - 2.x → 3.x
   - 3.x → 4.x
   - 2.x → 4.x (multi-step)
   ↓
4. Return mapped widget type
```

## Version Detection

The system extracts major version numbers from version strings:

- `"3.5.2"` → Major version: `"3"`
- `"2.9.14"` → Major version: `"2"`
- `"unknown"` → No migration applied

## Adding New Migrations

### Adding Widget Type Migrations

Edit `WIDGET_TYPE_MIGRATIONS` in `elementor-format-converter.js`:

```javascript
const WIDGET_TYPE_MIGRATIONS = {
  '3.x_to_4.x': {
    'old-widget-name': 'new-widget-name',
    'another-old-widget': 'another-new-widget'
  }
};
```

### Adding Deprecated Widget Fallbacks

Edit `DEPRECATED_WIDGET_FALLBACKS`:

```javascript
const DEPRECATED_WIDGET_FALLBACKS = {
  'deprecated-widget': 'modern-equivalent'
};
```

### Adding Settings Migrations

Edit `SETTING_MIGRATIONS`:

```javascript
const SETTING_MIGRATIONS = {
  'widget-type': {
    'old-property-name': 'new-property-name'
  }
};
```

### Adding Value Transformations

Edit `SETTING_VALUE_TRANSFORMS`:

```javascript
const SETTING_VALUE_TRANSFORMS = {
  'widget-type': {
    'property-name': (value) => {
      // Transform logic
      return transformedValue;
    }
  }
};
```

## Testing

Use the test suite at `chrome-extension/test-widget-mapping.html` to verify:

1. Deprecated widget fallbacks
2. Version 2.x → 3.x migrations
3. Version 2.x → 4.x multi-step migrations
4. Settings property migrations
5. Nested element conversions
6. Unknown version handling

**To run tests:**
1. Open `test-widget-mapping.html` in a browser
2. Click "Run All Tests"
3. Review results for each test case

## Console Logging

The system logs all migrations for debugging:

```
Using fallback for deprecated widget: wordpress → text-editor
Mapping widget type: image-box → icon-box (2.x → 3.x)
Migrating setting: tag → header_size for heading
```

## Error Handling

- **Unknown versions:** No migration applied, original widget type returned
- **Missing migrations:** Widget type passes through unchanged
- **Invalid widget types:** Returns original value without error

## Best Practices

1. **Always specify versions:** Provide accurate source and target versions for best results
2. **Test migrations:** Use the test suite when adding new migrations
3. **Document changes:** Update this file when adding new migrations
4. **Preserve compatibility:** Ensure migrations maintain element functionality
5. **Log migrations:** Keep console logging for debugging in production

## Compatibility Matrix

| Source Version | Target Version | Migration Path | Status |
|---------------|----------------|----------------|--------|
| 2.x | 3.x | Direct | ✅ Supported |
| 2.x | 4.x | Multi-step (2→3→4) | ✅ Supported |
| 3.x | 4.x | Direct | ⚠️ Placeholder |
| 3.x | 3.x | None | ✅ No migration |
| Unknown | Any | None | ✅ Pass-through |

## Future Enhancements

- [ ] Add 3.x → 4.x specific migrations as Elementor 4.x evolves
- [ ] Implement automatic migration rule updates from remote source
- [ ] Add migration preview before applying
- [ ] Support custom user-defined migrations
- [ ] Add migration rollback capability
- [ ] Implement migration analytics and reporting

## Related Files

- `elementor-format-converter.js` - Main implementation
- `test-widget-mapping.html` - Test suite
- `design.md` - Architecture documentation
- `requirements.md` - Feature requirements

## Support

For issues or questions about widget type mapping:
1. Check console logs for migration details
2. Run the test suite to verify functionality
3. Review the requirements document (Requirements 2.7, 9.2, 9.3, 9.4)
4. Check the design document for architecture details
