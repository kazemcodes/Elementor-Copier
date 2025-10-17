# Real-World Widget Test Data

This directory contains real-world widget samples collected from popular WordPress themes to test the enhanced HTML conversion system.

## Test Data Files

### test-data-woodmart.json
Widget samples from the **WoodMart** theme, a popular WooCommerce theme.

**Widgets included:**
- `wd_banner` - Banner with image, text overlay, and button
- `wd_info_box` - Info box with icon, title, and description
- `wd_products` - Product grid widget
- `wd_video` - Video player widget
- `wd_gallery` - Image gallery with lightbox
- `wd_countdown_timer` - Countdown timer for sales
- `wd_pricing_tables` - Pricing table widget
- `wd_social_icons` - Social media icons

### test-data-avada.json
Widget samples from the **Avada** theme, one of the best-selling WordPress themes.

**Widgets included:**
- `fusion_slider` - Full-featured slider with multiple slides
- `fusion_pricing_table` - Pricing table with features
- `fusion_testimonials` - Testimonial carousel
- `fusion_fontawesome` - Icon with text content
- `fusion_progress` - Animated progress bar
- `fusion_counter_box` - Animated counter with icon
- `fusion_accordion` - Collapsible accordion panels
- `fusion_tabs` - Tabbed content sections
- `fusion_map` - Embedded Google Map
- `fusion_youtube` - YouTube video embed

### test-data-divi.json
Widget samples from the **Divi** theme by Elegant Themes.

**Widgets included:**
- `et_pb_video` - Video module with YouTube/Vimeo support
- `et_pb_gallery` - Image gallery module
- `et_pb_contact_form` - Contact form with custom fields
- `et_pb_slider` - Full-width slider module
- `et_pb_testimonial` - Single testimonial module
- `et_pb_pricing_tables` - Pricing table module
- `et_pb_countdown_timer` - Countdown timer module
- `et_pb_social_media_follow` - Social media icons module

## Test Data Structure

Each test data file follows this structure:

```json
{
  "theme": "Theme Name",
  "description": "Description of the theme",
  "widgets": [
    {
      "name": "Widget Display Name",
      "widgetType": "technical_widget_type",
      "description": "What this widget does",
      "element": {
        "elType": "widget",
        "widgetType": "technical_widget_type",
        "settings": { /* Widget settings */ },
        "renderedContent": "<div>...</div>",
        "elements": [],
        "isInner": false
      },
      "expectedConversion": {
        "widgetType": "expected_elementor_widget_type",
        "description": "Expected conversion behavior"
      }
    }
  ]
}
```

## Running Tests

### Run all real-world widget tests:
```bash
node chrome-extension/test-real-world-widgets.js
```

This will:
1. Load all test data files
2. Convert each widget using the format converter
3. Compare actual conversion results with expected results
4. Generate a detailed report with:
   - Pass/fail status for each widget
   - Success rate by theme
   - Success rate by converter
   - Success rate by target widget type
   - Detailed failure information

### Expected Output:
```
=== Real-World Widget Conversion Test Suite ===

============================================================
Testing WoodMart Theme Widgets
============================================================

Test 1: WoodMart Banner (wd_banner)
Description: Banner widget with image, text overlay, and button
✓ PASS: Converted to "section" as expected
  Converter: CompositeWidgetConverter
  Source: settings

...

============================================================
Overall Test Summary
============================================================

Total Tests: 26
Passed: 24 (92.3%)
Failed: 2 (7.7%)

Results by Theme:
  WoodMart: 8/8 passed (100.0%)
  Avada: 9/10 passed (90.0%)
  Divi: 7/8 passed (87.5%)

Results by Converter:
  VideoConverter: 3/3 passed (100.0%)
  GalleryConverter: 3/3 passed (100.0%)
  ...
```

## Adding New Test Data

To add test data for a new theme:

1. Create a new JSON file: `test-data-[theme-name].json`
2. Follow the structure shown above
3. Add the filename to the `testDataFiles` array in `test-real-world-widgets.js`
4. Run the test suite to verify

### Collecting Widget Data

To collect real widget data from a live site:

1. Install the Elementor Copier extension
2. Navigate to a page with the target widget
3. Open browser DevTools Console
4. Copy the widget using the extension
5. In the console, inspect the copied data structure
6. Extract the relevant widget element and settings
7. Add to the appropriate test data file

## Purpose

These test data files serve multiple purposes:

1. **Regression Testing**: Ensure new changes don't break existing conversions
2. **Coverage Validation**: Verify that all common widget types are handled
3. **Converter Development**: Provide real examples when building new converters
4. **Documentation**: Show what real-world widgets look like
5. **Quality Assurance**: Measure conversion success rates across themes

## Notes

- Test data represents typical widget configurations, not all possible variations
- Some widgets may have additional settings not captured in these samples
- Expected conversions are based on the best available Elementor widget match
- Fallback to HTML widget is acceptable when no better conversion exists
- Data is anonymized (example URLs, placeholder content)

## Maintenance

Test data should be updated when:
- New theme versions introduce widget changes
- New converters are added that could handle existing widgets better
- Edge cases are discovered that should be tested
- New popular themes emerge that should be supported

## Related Files

- `elementor-format-converter.js` - Main conversion logic
- `test-converter-integration.js` - Integration tests for the conversion pipeline
- `test-*-converter.js` - Unit tests for individual converters
