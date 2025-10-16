<?php
/**
 * Test Authenticated Extractor
 * 
 * This file tests the AuthenticatedExtractor class functionality
 * Run this from WordPress admin or via WP-CLI
 */

// Load WordPress
require_once __DIR__ . '/elementor-copier.php';

use ElementorCopier\Extractor\AuthenticatedExtractor;

// Test configuration
$test_source_url = 'https://example.com'; // Replace with actual test site
$test_username = 'testuser'; // Replace with actual username
$test_password = 'testpass'; // Replace with actual password

echo "=== Testing AuthenticatedExtractor ===\n\n";

// Test 1: Create instance
echo "Test 1: Creating AuthenticatedExtractor instance...\n";
$extractor = new AuthenticatedExtractor( $test_source_url );
echo "✓ Instance created successfully\n\n";

// Test 2: Set authentication credentials
echo "Test 2: Setting authentication credentials...\n";
$extractor->set_auth( array(
    'username' => $test_username,
    'password' => $test_password,
) );
echo "✓ Credentials set successfully\n\n";

// Test 3: Check if can extract (will attempt authentication)
echo "Test 3: Testing authentication capability...\n";
$can_extract = $extractor->can_extract( $test_source_url );
if ( $can_extract ) {
    echo "✓ Authentication successful\n\n";
} else {
    echo "✗ Authentication failed\n";
    $error = $extractor->get_last_error();
    echo "Error: " . ( $error['message'] ?? 'Unknown error' ) . "\n";
    echo "Details: " . print_r( $error, true ) . "\n\n";
}

// Test 4: Get pages (if authenticated)
if ( $can_extract ) {
    echo "Test 4: Fetching pages from source site...\n";
    $pages = $extractor->get_pages();
    echo "✓ Found " . count( $pages ) . " pages\n";
    if ( ! empty( $pages ) ) {
        echo "Sample page: " . print_r( $pages[0], true ) . "\n";
    }
    echo "\n";
}

// Test 5: Get posts (if authenticated)
if ( $can_extract ) {
    echo "Test 5: Fetching posts from source site...\n";
    $posts = $extractor->get_posts();
    echo "✓ Found " . count( $posts ) . " posts\n";
    if ( ! empty( $posts ) ) {
        echo "Sample post: " . print_r( $posts[0], true ) . "\n";
    }
    echo "\n";
}

// Test 6: Get Elementor data for a specific post (if authenticated and posts exist)
if ( $can_extract && ! empty( $posts ) ) {
    echo "Test 6: Fetching Elementor data for post ID " . $posts[0]['id'] . "...\n";
    $elementor_data = $extractor->get_elementor_data( $posts[0]['id'] );
    if ( ! empty( $elementor_data ) ) {
        echo "✓ Elementor data retrieved successfully\n";
        echo "Data structure: " . ( is_array( $elementor_data ) ? 'Array with ' . count( $elementor_data ) . ' elements' : 'Not an array' ) . "\n";
    } else {
        echo "✗ No Elementor data found\n";
        $error = $extractor->get_last_error();
        echo "Error: " . ( $error['message'] ?? 'Unknown error' ) . "\n";
    }
    echo "\n";
}

// Test 7: Logout
echo "Test 7: Testing logout functionality...\n";
$extractor->logout();
echo "✓ Logout completed\n\n";

echo "=== All tests completed ===\n";
