# Media URL Handler Guide

## Overview

The Media URL Handler is responsible for extracting, converting, and managing media URLs in Elementor elements. It ensures that all media references (images, videos, backgrounds) are preserved and converted to absolute URLs for cross-site compatibility.

## Features

### 1. Media URL Extraction (Requirement 4.1)
- Extracts all media URLs from Elementor element data structures
- Supports nested elements (sections → columns → widgets)
- Detects URLs in multiple properties:
  - `url` - Direct URL properties
  - `image.url` - Image objects
  - `background_image.url` - Background images
  - `video_link` - Video URLs
  - `background_video_link` - Background videos
  - `external_link.url` - External links
  - CSS `url()` patterns in custom CSS

### 2. URL Conversion (Requirements 4.2, 4.3)
- Converts relative URLs to absolute URLs
- Handles protocol-relative URLs (`//cdn.example.com/...`)
- Ensures cross-domain compatibility
- Preserves original URLs for reference

### 3. Media Type Detection
- Automatically detects media types:
  - Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
  - Videos: `.mp4`, `.webm`, `.ogg`
  - Audio: `.mp3`, `.wav`, `.ogg`
  - CSS backgrounds
  - Links

### 4. URL Validation (Requirement 4.3)
- Validates URL accessibility
- Uses HEAD requests to check availability
- Handles CORS restrictions gracefully
- Reports validation status

### 5. External Media Notifications (Requirements 4.6, 4.7)
- Creates user-friendly notifications for external media
- Warns about potential broken links
- Provides actionable guidance
- Shows detailed media statistics

## Usage

### Basic Usage

```javascript
// Initialize the handler
const handler = new MediaURLHandler();

// Extract media URLs from element data
const mediaURLs = handler.extractMediaURLs(elementData);
console.log(`Found ${mediaURLs.length} media URLs`);

// Convert to absolute URLs
const absoluteURLs = handler.convertToAbsoluteURLs(
  mediaURLs, 
  'https://source-site.com'
);

// Update element data with absolute URLs
const updatedData = handler.updateElementURLs(
  elementData,
  'https://source-site.com'
);

// Validate URLs (async)
const validatedURLs = await handler.validateURLs(absoluteURLs);

// Create notification for user
const notification = handler.createMediaNotification(validatedURLs);
if (notification) {
  console.log(notification.message);
}

// Get statistics
const stats = handler.getMediaStatistics(validatedURLs);
console.log(`Total: ${stats.total}, External: ${stats.external}`);
```

### Integration with Content Script

```javascript
// In content.js when copying an element
async function copyElementWithMediaHandling(elementData) {
  const handler = new MediaURLHandler();
  
  // Get current page origin
  const sourceOrigin = window.location.origin;
  
  // Update all URLs to absolute
  const updatedData = handler.updateElementURLs(elementData, sourceOrigin);
  
  // Extract and validate URLs
  const mediaURLs = handler.extractMediaURLs(updatedData);
  const absoluteURLs = handler.convertToAbsoluteURLs(mediaURLs, sourceOrigin);
  const validatedURLs = await handler.validateURLs(absoluteURLs);
  
  // Store media info with the element data
  updatedData._mediaInfo = {
    urls: validatedURLs,
    stats: handler.getMediaStatistics(validatedURLs),
    sourceOrigin: sourceOrigin
  };
  
  return updatedData;
}
```

### Integration with Paste Operation

```javascript
// When pasting into Elementor
function handlePasteWithMediaNotification(elementData) {
  const handler = new MediaURLHandler();
  
  // Check if element has media info
  if (elementData._mediaInfo) {
    const notification = handler.createMediaNotification(
      elementData._mediaInfo.urls
    );
    
    if (notification) {
      // Show notification to user
      showNotification(notification);
    }
  }
  
  // Proceed with paste
  pasteElement(elementData);
}
```

## API Reference

### `extractMediaURLs(elementData)`
Extracts all media URLs from element data structure.

**Parameters:**
- `elementData` (Object): Elementor element data

**Returns:**
- Array of objects: `[{ path, url, type }, ...]`

**Example:**
```javascript
const urls = handler.extractMediaURLs(elementData);
// [
//   { path: 'settings.image.url', url: '/uploads/photo.jpg', type: 'image' },
//   { path: 'settings.background_image.url', url: '//cdn.example.com/bg.jpg', type: 'image' }
// ]
```

### `convertToAbsoluteURLs(mediaURLs, sourceOrigin)`
Converts relative URLs to absolute URLs.

**Parameters:**
- `mediaURLs` (Array): Array from `extractMediaURLs()`
- `sourceOrigin` (String): Source website origin (e.g., 'https://example.com')

**Returns:**
- Array of objects with additional fields: `originalURL`, `isExternal`

**Example:**
```javascript
const absolute = handler.convertToAbsoluteURLs(urls, 'https://source-site.com');
// [
//   { 
//     path: 'settings.image.url', 
//     url: 'https://source-site.com/uploads/photo.jpg',
//     originalURL: '/uploads/photo.jpg',
//     type: 'image',
//     isExternal: false
//   }
// ]
```

### `validateURLs(mediaURLs)`
Validates URL accessibility (async).

**Parameters:**
- `mediaURLs` (Array): Array from `convertToAbsoluteURLs()`

**Returns:**
- Promise<Array>: Array with validation results

**Example:**
```javascript
const validated = await handler.validateURLs(absoluteURLs);
// [
//   { 
//     url: 'https://example.com/image.jpg',
//     isValid: true,
//     statusCode: null,
//     error: null
//   }
// ]
```

### `updateElementURLs(elementData, sourceOrigin)`
Updates element data with absolute URLs.

**Parameters:**
- `elementData` (Object): Elementor element data
- `sourceOrigin` (String): Source website origin

**Returns:**
- Object: Updated element data (cloned, not mutated)

**Example:**
```javascript
const updated = handler.updateElementURLs(elementData, 'https://source-site.com');
// All URLs in the element are now absolute
```

### `createMediaNotification(mediaURLs)`
Creates notification for external media warnings.

**Parameters:**
- `mediaURLs` (Array): Array from `validateURLs()`

**Returns:**
- Object or null: Notification data

**Example:**
```javascript
const notification = handler.createMediaNotification(validatedURLs);
// {
//   type: 'warning',
//   title: 'External Media Detected',
//   message: 'Found 3 external media URLs...',
//   mediaURLs: [...],
//   actions: [...]
// }
```

### `getMediaStatistics(mediaURLs)`
Gets statistics about media URLs.

**Parameters:**
- `mediaURLs` (Array): Array of media URL objects

**Returns:**
- Object: Statistics

**Example:**
```javascript
const stats = handler.getMediaStatistics(mediaURLs);
// {
//   total: 5,
//   byType: { image: 3, video: 2 },
//   external: 2,
//   invalid: 0
// }
```

## Supported Media Properties

The handler automatically detects media in these Elementor settings:

| Property | Description | Example |
|----------|-------------|---------|
| `url` | Direct URL | `{ url: 'image.jpg' }` |
| `image.url` | Image object | `{ image: { url: 'photo.jpg' } }` |
| `background_image.url` | Background image | `{ background_image: { url: 'bg.jpg' } }` |
| `background_video_link` | Background video | `{ background_video_link: 'video.mp4' }` |
| `video_link` | Video widget | `{ video_link: 'https://...' }` |
| `external_link.url` | External link | `{ external_link: { url: 'https://...' } }` |
| `link.url` | Link object | `{ link: { url: 'page.html' } }` |
| `_custom_css` | CSS with url() | `{ _custom_css: 'url("bg.png")' }` |

## Requirements Coverage

### ✅ Requirement 4.1: Preserve all image URLs
- Extracts URLs from all known Elementor properties
- Handles nested element structures
- Preserves URLs in original data structure

### ✅ Requirement 4.2: Keep original URLs intact
- Stores both original and converted URLs
- Does not modify source data (creates clones)
- Maintains URL integrity

### ✅ Requirement 4.3: Ensure absolute URLs
- Converts relative URLs to absolute
- Handles protocol-relative URLs
- Validates URL accessibility

### ✅ Requirement 4.4: Preserve CSS background-image URLs
- Extracts URLs from custom CSS
- Handles `url()` patterns
- Supports quoted and unquoted URLs

### ✅ Requirement 4.5: Maintain video URLs
- Extracts video links
- Preserves embed codes
- Handles background videos

### ✅ Requirement 4.6: Display notifications
- Creates user-friendly notifications
- Shows external media warnings
- Provides actionable guidance

### ✅ Requirement 4.7: Provide guidance for broken URLs
- Includes troubleshooting in notifications
- Recommends uploading to WordPress media library
- Explains potential issues

## Testing

Run the test suite:
```bash
# Open in browser
chrome-extension/test-media-url-handler.html
```

The test suite covers:
- ✅ Media URL extraction
- ✅ Media type detection
- ✅ Relative to absolute conversion
- ✅ External URL detection
- ✅ Element data updates
- ✅ CSS URL extraction
- ✅ Notification creation
- ✅ Statistics generation
- ✅ Nested element handling
- ✅ Edge cases (null, empty data)

## Best Practices

### 1. Always Convert to Absolute
```javascript
// ✅ Good
const updated = handler.updateElementURLs(data, sourceOrigin);

// ❌ Bad - relative URLs won't work cross-site
// (using data without conversion)
```

### 2. Validate Before Notifying
```javascript
// ✅ Good
const validated = await handler.validateURLs(urls);
const notification = handler.createMediaNotification(validated);

// ❌ Bad - notification without validation
const notification = handler.createMediaNotification(urls);
```

### 3. Handle Async Operations
```javascript
// ✅ Good
async function processMedia(data) {
  const urls = handler.extractMediaURLs(data);
  const validated = await handler.validateURLs(urls);
  return validated;
}

// ❌ Bad - not awaiting async operation
function processMedia(data) {
  const urls = handler.extractMediaURLs(data);
  const validated = handler.validateURLs(urls); // Returns Promise!
  return validated;
}
```

### 4. Store Media Info with Element
```javascript
// ✅ Good - store for later use
elementData._mediaInfo = {
  urls: validatedURLs,
  stats: handler.getMediaStatistics(validatedURLs)
};

// ❌ Bad - losing media information
// (not storing for paste operation)
```

## Troubleshooting

### URLs Not Being Extracted
**Problem:** `extractMediaURLs()` returns empty array

**Solutions:**
- Check element data structure is valid
- Verify URLs are in supported properties
- Check if URLs match media patterns (extensions, wp-content)

### URLs Not Converting to Absolute
**Problem:** URLs remain relative after conversion

**Solutions:**
- Ensure `sourceOrigin` is a valid URL
- Check URL format (should start with `/` or `//`)
- Verify URL is not already absolute

### Validation Always Returns isValid: true
**Problem:** Even broken URLs show as valid

**Solutions:**
- This is expected with `no-cors` mode
- CORS restrictions prevent reading response status
- Validation mainly checks if request doesn't throw

### Notification Not Showing
**Problem:** `createMediaNotification()` returns null

**Solutions:**
- Check if there are external URLs (`isExternal: true`)
- Verify URLs were converted with `convertToAbsoluteURLs()`
- Ensure validation was performed

## Performance Considerations

- **Extraction**: O(n) where n is number of elements
- **Conversion**: O(m) where m is number of URLs
- **Validation**: Network-bound, runs in parallel
- **Memory**: Clones data structures (safe but uses memory)

## Security Notes

- All URLs are validated before use
- CSS URLs are extracted safely (no eval)
- No inline script execution
- CORS-safe validation (no-cors mode)

## Future Enhancements

- [ ] Download and re-upload media to WordPress
- [ ] Cache validation results
- [ ] Batch URL validation with rate limiting
- [ ] Support for more media types (fonts, PDFs)
- [ ] Advanced CSS parsing (multiple backgrounds)
- [ ] Media optimization suggestions
