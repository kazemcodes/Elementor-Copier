# Version Compatibility Manager Guide

## Overview

The Version Compatibility Manager handles version detection, comparison, and automatic data migration between different Elementor versions. This ensures that elements copied from one Elementor version can be pasted correctly into another version, even when widget types or settings have changed.

## Features

✅ **Version Detection**: Automatically detects Elementor version from `window.elementor` or `window.elementorFrontendConfig`  
✅ **Version Comparison**: Compare versions to determine compatibility  
✅ **Widget Type Migration**: Automatically rename deprecated widget types  
✅ **Setting Migration**: Transform old setting names to new ones  
✅ **Nested Element Support**: Recursively apply migrations to all nested elements  
✅ **Compatibility Warnings**: Notify users about potential incompatibilities  
✅ **Flexible Rule System**: Easy to add new migration rules

## Usage

### Basic Usage

```javascript
// Initialize the manager
const manager = new VersionCompatibilityManager();

// Detect current Elementor version
const currentVersion = manager.detectVersion();
console.log('Elementor version:', currentVersion); // "3.5.2"

// Check compatibility between versions
const compatibility = manager.isCompatible('2.9.0', '3.5.0');
console.log(compatibility);
// {
//   compatible: true,
//   warning: false,
//   message: 'Versions are compatible'
// }

// Convert element data from one version to another
const elementData = {
  elType: 'widget',
  widgetType: 'heading',
  settings: { tag: 'h2' },
  elements: []
};

const result = manager.convertVersion(elementData, '2.9.0', '3.5.0');
console.log(result.data.settings);
// { header_size: 'h2' } - 'tag' was renamed to 'header_size'
```

### Advanced Usage

#### Get Conversion Rules

```javascript
// Get all conversion rules between two versions
const rules = manager.getConversionRules('2.9.0', '3.5.0');
console.log(rules);
// [
//   { type: 'widget_rename', sourcePattern: 'image-box', targetPattern: 'icon-box' },
//   { type: 'setting_rename', widgetType: 'heading', sourcePattern: 'tag', targetPattern: 'header_size' }
// ]
```

#### Apply Rules Manually

```javascript
// Apply specific rules to data
const rules = [
  {
    type: 'setting_rename',
    widgetType: 'heading',
    sourcePattern: 'tag',
    targetPattern: 'header_size'
  }
];

const converted = manager.applyConversionRules(elementData, rules);
```

#### Get User Notifications

```javascript
const result = manager.convertVersion(elementData, '2.9.0', '3.5.0');
const notification = manager.getNotificationMessage(result);

console.log(notification);
// {
//   type: 'info',
//   message: 'Element converted from Elementor 2.9.0 to 3.5.0. 2 compatibility adjustments applied.'
// }
```

## Migration Rules

### Widget Type Migrations

The manager includes built-in widget type migrations:

| Source Version | Old Widget Type | New Widget Type |
|----------------|-----------------|-----------------|
| 2.x → 3.x      | `image-box`     | `icon-box`      |
| 2.x → 3.x      | `icon-list`     | `icon-list-item`|

### Setting Migrations

The manager includes built-in setting migrations:

| Widget Type | Old Setting | New Setting    |
|-------------|-------------|----------------|
| `heading`   | `tag`       | `header_size`  |
| `button`    | `size`      | `button_size`  |
| `image`     | `caption`   | `caption_text` |

## Compatibility Matrix

The manager uses a compatibility matrix to determine version compatibility:

| Source | Compatible With | Warning For |
|--------|----------------|-------------|
| 2.x    | 2.x, 3.x       | 4.x         |
| 3.x    | 2.x, 3.x, 4.x  | -           |
| 4.x    | 3.x, 4.x       | 2.x         |

## API Reference

### `detectVersion()`
Detects the current Elementor version from the window object.

**Returns:** `string | null` - Version string or null if not detected

```javascript
const version = manager.detectVersion();
// "3.5.2"
```

### `parseVersion(version)`
Parses a version string into components.

**Parameters:**
- `version` (string) - Version string (e.g., "3.5.2")

**Returns:** `object` - Parsed version object

```javascript
const parsed = manager.parseVersion('3.5.2');
// { major: 3, minor: 5, patch: 2, full: '3.5.2' }
```

### `getVersionFamily(version)`
Gets the version family (e.g., "3.x" from "3.5.2").

**Parameters:**
- `version` (string) - Version string

**Returns:** `string` - Version family

```javascript
const family = manager.getVersionFamily('3.5.2');
// "3.x"
```

### `compareVersions(version1, version2)`
Compares two version strings.

**Parameters:**
- `version1` (string) - First version
- `version2` (string) - Second version

**Returns:** `number` - -1 if v1 < v2, 0 if equal, 1 if v1 > v2

```javascript
manager.compareVersions('3.5.2', '4.0.0'); // -1
manager.compareVersions('3.5.2', '3.5.2'); // 0
manager.compareVersions('4.0.0', '3.5.2'); // 1
```

### `isCompatible(sourceVersion, targetVersion)`
Checks if two versions are compatible.

**Parameters:**
- `sourceVersion` (string) - Source Elementor version
- `targetVersion` (string) - Target Elementor version

**Returns:** `object` - Compatibility result

```javascript
const result = manager.isCompatible('3.5.2', '4.0.0');
// {
//   compatible: true,
//   warning: false,
//   message: 'Versions are compatible'
// }
```

### `getConversionRules(sourceVersion, targetVersion)`
Gets conversion rules for migrating between versions.

**Parameters:**
- `sourceVersion` (string) - Source version
- `targetVersion` (string) - Target version

**Returns:** `Array` - Array of conversion rules

```javascript
const rules = manager.getConversionRules('2.9.0', '3.5.0');
```

### `applyConversionRules(data, rules)`
Applies conversion rules to element data.

**Parameters:**
- `data` (object) - Element data to convert
- `rules` (Array) - Conversion rules to apply

**Returns:** `object` - Converted data

```javascript
const converted = manager.applyConversionRules(elementData, rules);
```

### `convertVersion(data, sourceVersion, targetVersion)`
Converts data from source version to target version.

**Parameters:**
- `data` (object) - Element data to convert
- `sourceVersion` (string) - Source Elementor version
- `targetVersion` (string) - Target Elementor version

**Returns:** `object` - Result with converted data and compatibility info

```javascript
const result = manager.convertVersion(elementData, '2.9.0', '3.5.0');
// {
//   data: { /* converted data */ },
//   compatibility: { compatible: true, warning: false, message: '...' },
//   rulesApplied: 2,
//   sourceVersion: '2.9.0',
//   targetVersion: '3.5.0'
// }
```

### `getNotificationMessage(conversionResult)`
Gets a user-friendly notification message for version conversion.

**Parameters:**
- `conversionResult` (object) - Result from `convertVersion()`

**Returns:** `object` - Notification object with type and message

```javascript
const notification = manager.getNotificationMessage(result);
// {
//   type: 'info',
//   message: 'Element converted from Elementor 2.9.0 to 3.5.0...'
// }
```

## Adding New Migration Rules

### Adding Widget Type Migrations

Edit the `widgetMigrations` object in the constructor:

```javascript
this.widgetMigrations = {
  '2.x_to_3.x': {
    'image-box': 'icon-box',
    'icon-list': 'icon-list-item',
    'your-old-widget': 'your-new-widget'  // Add here
  },
  '3.x_to_4.x': {
    'another-old-widget': 'another-new-widget'  // Add here
  }
};
```

### Adding Setting Migrations

Edit the `settingMigrations` object in the constructor:

```javascript
this.settingMigrations = {
  'heading': {
    'tag': 'header_size',
    'old_setting': 'new_setting'  // Add here
  },
  'your-widget': {
    'old_prop': 'new_prop'  // Add here
  }
};
```

### Adding Custom Transformation Rules

For complex transformations, you can add custom rules:

```javascript
const customRule = {
  type: 'setting_transform',
  widgetType: 'image',
  sourcePattern: 'size',
  transform: (value) => {
    // Custom transformation logic
    return value === 'large' ? 'full' : value;
  }
};

const rules = manager.getConversionRules(sourceVersion, targetVersion);
rules.push(customRule);
const converted = manager.applyConversionRules(data, rules);
```

## Integration Example

Here's how to integrate the Version Compatibility Manager into the paste workflow:

```javascript
// In your paste handler
async function handlePaste(clipboardData) {
  const manager = new VersionCompatibilityManager();
  
  // Get versions
  const sourceVersion = clipboardData.elementorVersion || '3.0.0';
  const targetVersion = manager.detectVersion();
  
  // Check compatibility
  const compatibility = manager.isCompatible(sourceVersion, targetVersion);
  
  if (!compatibility.compatible) {
    console.error('Incompatible versions:', compatibility.message);
    showNotification('error', compatibility.message);
    return;
  }
  
  // Convert data
  const result = manager.convertVersion(
    clipboardData.element,
    sourceVersion,
    targetVersion
  );
  
  // Show notification
  const notification = manager.getNotificationMessage(result);
  showNotification(notification.type, notification.message);
  
  // Use converted data
  await pasteIntoElementor(result.data);
}
```

## Testing

Open `test-version-compatibility.html` in your browser to run the test suite:

```bash
# Open in browser
chrome-extension/test-version-compatibility.html
```

The test suite includes:
- ✅ Version detection tests
- ✅ Version parsing tests
- ✅ Version comparison tests
- ✅ Compatibility check tests
- ✅ Widget migration tests
- ✅ Setting migration tests
- ✅ Nested element conversion tests
- ✅ Full conversion workflow tests
- ✅ Error handling tests

## Troubleshooting

### Version Not Detected

**Problem:** `detectVersion()` returns `null`

**Solution:** Ensure Elementor is fully loaded before calling. Use polling or wait for Elementor ready event:

```javascript
function waitForElementor() {
  return new Promise((resolve) => {
    const check = () => {
      const version = manager.detectVersion();
      if (version) {
        resolve(version);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}
```

### Conversion Not Applied

**Problem:** Settings not being converted

**Solution:** Check that the widget type matches in the rule:

```javascript
// Rule must specify widget type for setting migrations
{
  type: 'setting_rename',
  widgetType: 'heading',  // Must match element's widgetType
  sourcePattern: 'tag',
  targetPattern: 'header_size'
}
```

### Nested Elements Not Converted

**Problem:** Only top-level elements are converted

**Solution:** The manager automatically handles nested elements. Ensure your data structure includes the `elements` array:

```javascript
{
  elType: 'section',
  elements: [  // Nested elements here
    {
      elType: 'column',
      elements: [/* widgets */]
    }
  ]
}
```

## Requirements Coverage

This implementation satisfies the following requirements:

- ✅ **9.1**: Detect Elementor version from `window.elementor.config.version`
- ✅ **9.2**: Apply conversion rules for version differences
- ✅ **9.3**: Map old widget type names to new names
- ✅ **9.4**: Transform settings to target version format
- ✅ **9.5**: Remove or replace deprecated features
- ✅ **9.6**: Notify user when conversion is not possible
- ✅ **9.7**: Maintain version compatibility matrix

## Next Steps

1. Integrate with the format converter module
2. Add more migration rules as Elementor evolves
3. Implement notification system integration
4. Add telemetry to track common conversion scenarios
5. Create migration guides for users

## Support

For issues or questions about version compatibility:
1. Check the test suite for examples
2. Review the compatibility matrix
3. Add custom rules for your specific use case
4. Report issues with version details and element data
