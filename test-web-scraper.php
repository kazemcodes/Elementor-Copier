<?php
/**
 * Test Web Scraper Extractor
 *
 * This file tests the WebScraper extractor functionality
 */

// Load WordPress
require_once __DIR__ . '/../../../wp-load.php';

use ElementorCopier\Extractor\WebScraper;

echo "=== Testing Web Scraper Extractor ===\n\n";

// Test 1: Create WebScraper instance
echo "Test 1: Creating WebScraper instance...\n";
$scraper = new WebScraper( 'https://example.com' );
echo "✓ WebScraper instance created\n\n";

// Test 2: Test can_extract method
echo "Test 2: Testing can_extract method...\n";
$can_extract = $scraper->can_extract( 'https://wordpress.org' );
if ( $can_extract ) {
    echo "✓ Can extract from WordPress.org\n";
} else {
    $error = $scraper->get_last_error();
    echo "✗ Cannot extract: " . ( $error['message'] ?? 'Unknown error' ) . "\n";
}
echo "\n";

// Test 3: Test get_pages method
echo "Test 3: Testing get_pages method...\n";
$scraper2 = new WebScraper( 'https://wordpress.org' );
$pages = $scraper2->get_pages();
echo "Found " . count( $pages ) . " pages\n";
if ( ! empty( $pages ) ) {
    echo "Sample page: " . ( $pages[0]['title'] ?? 'No title' ) . "\n";
}
echo "\n";

// Test 4: Test error handling
echo "Test 4: Testing error handling...\n";
$scraper3 = new WebScraper();
$result = $scraper3->can_extract( '' );
if ( ! $result ) {
    $error = $scraper3->get_last_error();
    echo "✓ Error handling works: " . ( $error['message'] ?? 'No error message' ) . "\n";
}
echo "\n";

echo "=== All Tests Complete ===\n";
