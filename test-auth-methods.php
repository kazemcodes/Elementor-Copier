<?php
/**
 * Test script for Auth class new methods
 * 
 * This script tests the newly added methods to the Auth class:
 * - authenticate_api_request
 * - validate_widget_data
 * - validate_post_id
 * - verify_admin_capability
 * 
 * Run this from WordPress admin or via WP-CLI
 */

// Load WordPress
require_once dirname(__FILE__) . '/../../../wp-load.php';

// Ensure we have the Auth class
if (!class_exists('ElementorCopier\Security\Auth')) {
    die("Auth class not found. Make sure the plugin is activated.\n");
}

$auth = new ElementorCopier\Security\Auth();

echo "=== Testing Auth Class New Methods ===\n\n";

// Test 1: validate_widget_data
echo "Test 1: validate_widget_data\n";
echo "------------------------------\n";

// Valid widget data
$valid_widget = array(
    'id' => 'widget123',
    'elType' => 'widget',
    'widgetType' => 'heading',
    'settings' => array(
        'title' => 'Test Heading',
    ),
);

$result = $auth->validate_widget_data($valid_widget);
echo "Valid widget data: " . ($result['valid'] ? "PASS" : "FAIL - " . $result['message']) . "\n";

// Invalid widget data (missing elType)
$invalid_widget = array(
    'id' => 'widget123',
    'settings' => array(),
);

$result = $auth->validate_widget_data($invalid_widget);
echo "Invalid widget data (missing elType): " . (!$result['valid'] ? "PASS" : "FAIL") . "\n";

// Invalid widget data (widget without widgetType)
$invalid_widget2 = array(
    'id' => 'widget123',
    'elType' => 'widget',
    'settings' => array(),
);

$result = $auth->validate_widget_data($invalid_widget2);
echo "Invalid widget data (missing widgetType): " . (!$result['valid'] ? "PASS" : "FAIL") . "\n";

// Valid section data
$valid_section = array(
    'id' => 'section123',
    'elType' => 'section',
    'settings' => array(),
    'elements' => array(
        array(
            'id' => 'column123',
            'elType' => 'column',
            'settings' => array(),
            'elements' => array(),
        ),
    ),
);

$result = $auth->validate_widget_data($valid_section);
echo "Valid section data: " . ($result['valid'] ? "PASS" : "FAIL - " . $result['message']) . "\n";

echo "\n";

// Test 2: validate_post_id
echo "Test 2: validate_post_id\n";
echo "------------------------\n";

// Invalid post ID (0)
$result = $auth->validate_post_id(0);
echo "Invalid post ID (0): " . (!$result['valid'] ? "PASS" : "FAIL") . "\n";

// Invalid post ID (negative)
$result = $auth->validate_post_id(-5);
echo "Invalid post ID (negative): " . (!$result['valid'] ? "PASS" : "FAIL") . "\n";

// Non-existent post ID
$result = $auth->validate_post_id(999999);
echo "Non-existent post ID: " . (!$result['valid'] ? "PASS" : "FAIL") . "\n";

// Try to find a valid post
$posts = get_posts(array('numberposts' => 1, 'post_type' => 'any'));
if (!empty($posts)) {
    $result = $auth->validate_post_id($posts[0]->ID);
    echo "Valid post ID: " . ($result['valid'] ? "PASS" : "FAIL - " . $result['message']) . "\n";
} else {
    echo "Valid post ID: SKIPPED (no posts found)\n";
}

echo "\n";

// Test 3: verify_admin_capability
echo "Test 3: verify_admin_capability\n";
echo "--------------------------------\n";

$result = $auth->verify_admin_capability();
if (is_user_logged_in()) {
    if (current_user_can('manage_options') || current_user_can('edit_pages')) {
        echo "Admin capability check: " . ($result['allowed'] ? "PASS" : "FAIL") . "\n";
    } else {
        echo "Admin capability check: " . (!$result['allowed'] ? "PASS" : "FAIL") . "\n";
    }
} else {
    echo "Admin capability check (not logged in): " . (!$result['allowed'] ? "PASS" : "FAIL") . "\n";
}

echo "\n";

// Test 4: authenticate_api_request (basic test)
echo "Test 4: authenticate_api_request\n";
echo "---------------------------------\n";

// Create a mock REST request
if (class_exists('WP_REST_Request')) {
    $request = new WP_REST_Request('GET', '/test');
    
    $result = $auth->authenticate_api_request($request);
    
    if (is_user_logged_in() && (current_user_can('manage_options') || current_user_can('edit_pages'))) {
        echo "API authentication (logged in user): " . ($result === true ? "PASS" : "FAIL") . "\n";
    } else {
        echo "API authentication (no auth): " . (is_wp_error($result) ? "PASS" : "FAIL") . "\n";
    }
} else {
    echo "API authentication: SKIPPED (WP_REST_Request not available)\n";
}

echo "\n=== All Tests Complete ===\n";
