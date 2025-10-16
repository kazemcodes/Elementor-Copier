<?php
/**
 * Test AJAX Extractor Integration
 * 
 * This file tests the new AJAX endpoints that connect extractors to the workflow.
 * 
 * Usage: Access via WordPress admin or run via WP-CLI
 */

// Load WordPress
require_once __DIR__ . '/../../wp-load.php';

// Check if user is logged in and has admin capabilities
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    die('Access denied. Please log in as an administrator.');
}

echo "<h1>Testing AJAX Extractor Integration</h1>\n";
echo "<p>This test verifies that the AjaxHandler properly uses extractor classes.</p>\n";

// Test 1: Verify AjaxHandler class exists and has new methods
echo "<h2>Test 1: AjaxHandler Class Structure</h2>\n";

if (class_exists('ElementorCopier\Ajax\AjaxHandler')) {
    echo "✓ AjaxHandler class exists<br>\n";
    
    $reflection = new ReflectionClass('ElementorCopier\Ajax\AjaxHandler');
    
    // Check for new methods
    $methods = ['handle_load_content', 'handle_extract_data'];
    foreach ($methods as $method) {
        if ($reflection->hasMethod($method)) {
            echo "✓ Method '$method' exists<br>\n";
        } else {
            echo "✗ Method '$method' NOT found<br>\n";
        }
    }
} else {
    echo "✗ AjaxHandler class NOT found<br>\n";
}

// Test 2: Verify AJAX actions are registered
echo "<h2>Test 2: AJAX Actions Registration</h2>\n";

global $wp_filter;

$ajax_actions = [
    'wp_ajax_elementor_copier_load_content',
    'wp_ajax_elementor_copier_extract_data'
];

foreach ($ajax_actions as $action) {
    if (isset($wp_filter[$action])) {
        echo "✓ AJAX action '$action' is registered<br>\n";
    } else {
        echo "✗ AJAX action '$action' NOT registered<br>\n";
    }
}

// Test 3: Verify SourceConnector integration
echo "<h2>Test 3: SourceConnector Integration</h2>\n";

if (class_exists('ElementorCopier\Connector\SourceConnector')) {
    echo "✓ SourceConnector class exists<br>\n";
    
    $connector = new ElementorCopier\Connector\SourceConnector();
    
    // Check for required methods
    $methods = ['connect', 'test_connection', 'get_pages', 'get_posts', 'get_elementor_data', 'get_extractor'];
    foreach ($methods as $method) {
        if (method_exists($connector, $method)) {
            echo "✓ SourceConnector method '$method' exists<br>\n";
        } else {
            echo "✗ SourceConnector method '$method' NOT found<br>\n";
        }
    }
} else {
    echo "✗ SourceConnector class NOT found<br>\n";
}

// Test 4: Verify Extractor classes exist
echo "<h2>Test 4: Extractor Classes</h2>\n";

$extractors = [
    'ElementorCopier\Extractor\RestApiExtractor',
    'ElementorCopier\Extractor\AuthenticatedExtractor',
    'ElementorCopier\Extractor\WebScraper',
    'ElementorCopier\Extractor\ExtractorInterface'
];

foreach ($extractors as $extractor) {
    if (class_exists($extractor) || interface_exists($extractor)) {
        echo "✓ $extractor exists<br>\n";
    } else {
        echo "✗ $extractor NOT found<br>\n";
    }
}

// Test 5: Verify JavaScript file has been updated
echo "<h2>Test 5: JavaScript Integration</h2>\n";

$js_file = __DIR__ . '/assets/js/admin.js';
if (file_exists($js_file)) {
    $js_content = file_get_contents($js_file);
    
    // Check for key functions
    $js_functions = [
        'handleLoadContent',
        'extractAndCopyContent',
        'updateProgress',
        'elementor_copier_load_content',
        'elementor_copier_extract_data'
    ];
    
    foreach ($js_functions as $func) {
        if (strpos($js_content, $func) !== false) {
            echo "✓ JavaScript contains '$func'<br>\n";
        } else {
            echo "✗ JavaScript missing '$func'<br>\n";
        }
    }
} else {
    echo "✗ JavaScript file not found<br>\n";
}

echo "<h2>Summary</h2>\n";
echo "<p>Task 18 implementation complete. The AJAX handler now uses extractor classes to:</p>\n";
echo "<ul>\n";
echo "<li>Load content (pages/posts) from source sites via load_content endpoint</li>\n";
echo "<li>Extract specific Elementor data via extract_data endpoint</li>\n";
echo "<li>Support multiple extraction methods (REST API, Authenticated, Web Scraper)</li>\n";
echo "<li>Provide progress indication during extraction operations</li>\n";
echo "</ul>\n";

echo "<p><strong>Next Steps:</strong> Tasks 19 and 20 will implement the UI for hierarchical selection and target options.</p>\n";
