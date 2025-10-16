<?php
/**
 * Test Version Converter
 *
 * This file tests the VersionConverter class functionality.
 * Run this file from WordPress admin or via WP-CLI.
 */

// Load WordPress
require_once __DIR__ . '/../../../wp-load.php';

// Ensure our plugin is loaded
if ( ! class_exists( 'ElementorCopier\Converter\VersionConverter' ) ) {
    die( 'VersionConverter class not found. Make sure the plugin is activated.' );
}

use ElementorCopier\Converter\VersionConverter;

echo "<h1>Version Converter Test</h1>\n";

$converter = new VersionConverter();

// Test 1: Detect V1 structure
echo "<h2>Test 1: Detect V1 Structure</h2>\n";
$v1_data = array(
    array(
        'id'         => 'abc123',
        'elType'     => 'widget',
        'widgetType' => 'heading',
        'settings'   => array(
            'title'      => 'Test Heading',
            'typography' => 'Arial',
            'color'      => 'FF0000',
        ),
    ),
);

$detected_version = $converter->detect_version( $v1_data );
echo "Detected version: {$detected_version}\n";
echo "Expected: 1.x\n";
echo $detected_version === '1.x' ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 2: Detect V2 structure
echo "<h2>Test 2: Detect V2 Structure</h2>\n";
$v2_data = array(
    array(
        'id'         => 'def456',
        'elType'     => 'widget',
        'widgetType' => 'heading',
        'settings'   => array(
            'title'          => 'Test Heading',
            'title_tablet'   => 'Tablet Heading',
            'typography'     => array(
                'font_size'   => 16,
                'line_height' => 1.5,
            ),
        ),
    ),
);

$detected_version = $converter->detect_version( $v2_data );
echo "Detected version: {$detected_version}\n";
echo "Expected: 2.x\n";
echo $detected_version === '2.x' ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 3: Detect V3 structure
echo "<h2>Test 3: Detect V3 Structure</h2>\n";
$v3_data = array(
    array(
        'id'         => 'ghi789',
        'elType'     => 'widget',
        'widgetType' => 'heading',
        'settings'   => array(
            'title'      => 'Test Heading',
            'typography' => array(
                'font_size' => array(
                    'size' => 16,
                    'unit' => 'px',
                ),
            ),
        ),
    ),
);

$detected_version = $converter->detect_version( $v3_data );
echo "Detected version: {$detected_version}\n";
echo "Expected: 3.x\n";
echo $detected_version === '3.x' ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 4: Convert V1 to V3
echo "<h2>Test 4: Convert V1 to V3</h2>\n";
$converted = $converter->convert_to_current( $v1_data, '1.x' );
echo "Original color: " . $v1_data[0]['settings']['color'] . "\n";
echo "Converted color: " . $converted[0]['settings']['color'] . "\n";
echo "Expected: #FF0000\n";
echo $converted[0]['settings']['color'] === '#FF0000' ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 5: Convert V2 to V3
echo "<h2>Test 5: Convert V2 to V3</h2>\n";
$converted = $converter->convert_to_current( $v2_data, '2.x' );
echo "Original font_size: " . print_r( $v2_data[0]['settings']['typography']['font_size'], true ) . "\n";
echo "Converted font_size: " . print_r( $converted[0]['settings']['typography']['font_size'], true ) . "\n";
echo "Expected: Array with 'size' and 'unit' keys\n";
$has_structure = isset( $converted[0]['settings']['typography']['font_size']['size'] ) &&
                 isset( $converted[0]['settings']['typography']['font_size']['unit'] );
echo $has_structure ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 6: Handle deprecated widgets
echo "<h2>Test 6: Handle Deprecated Widgets</h2>\n";
$deprecated_data = array(
    array(
        'id'         => 'jkl012',
        'elType'     => 'widget',
        'widgetType' => 'image-box',
        'settings'   => array(
            'box_title' => 'My Image Box',
        ),
    ),
);

$converted = $converter->convert_to_current( $deprecated_data, '3.x' );
echo "Original widgetType: image-box\n";
echo "Converted widgetType: " . $converted[0]['widgetType'] . "\n";
echo "Expected: image\n";
echo $converted[0]['widgetType'] === 'image' ? "✓ PASS\n" : "✗ FAIL\n";
echo "Original setting: box_title\n";
echo "Converted setting: " . ( isset( $converted[0]['settings']['caption'] ) ? 'caption' : 'not found' ) . "\n";
echo "Expected: caption\n";
echo isset( $converted[0]['settings']['caption'] ) ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 7: Validate converted data
echo "<h2>Test 7: Validate Converted Data</h2>\n";
$valid_data = array(
    array(
        'id'         => 'valid123',
        'elType'     => 'section',
        'settings'   => array(),
        'elements'   => array(
            array(
                'id'       => 'valid456',
                'elType'   => 'column',
                'settings' => array(),
                'elements' => array(
                    array(
                        'id'         => 'valid789',
                        'elType'     => 'widget',
                        'widgetType' => 'heading',
                        'settings'   => array(),
                    ),
                ),
            ),
        ),
    ),
);

$is_valid = $converter->validate_converted_data( $valid_data );
echo "Validation result: " . ( $is_valid ? 'Valid' : 'Invalid' ) . "\n";
echo "Expected: Valid\n";
echo $is_valid ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

// Test 8: Validate invalid data
echo "<h2>Test 8: Validate Invalid Data</h2>\n";
$invalid_data = array(
    array(
        'settings' => array(), // Missing id and elType
    ),
);

$is_valid = $converter->validate_converted_data( $invalid_data );
echo "Validation result: " . ( $is_valid ? 'Valid' : 'Invalid' ) . "\n";
echo "Expected: Invalid\n";
echo ! $is_valid ? "✓ PASS\n" : "✗ FAIL\n";
echo "\n";

echo "<h2>All Tests Complete!</h2>\n";
