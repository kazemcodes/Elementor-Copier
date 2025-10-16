<?php
/**
 * Test Translation Loading
 * 
 * This script tests if the Persian translations load correctly.
 * Run this through WordPress or as a standalone test.
 */

// Try to load WordPress if not already loaded
if ( ! defined( 'ABSPATH' ) ) {
    $wp_load_paths = array(
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../wp-load.php',
        __DIR__ . '/../wp-load.php',
    );
    
    foreach ( $wp_load_paths as $wp_load ) {
        if ( file_exists( $wp_load ) ) {
            require_once $wp_load;
            break;
        }
    }
}

// If WordPress is loaded, test with WordPress functions
if ( defined( 'ABSPATH' ) ) {
    echo "<h2>Testing Elementor Copier Translations (WordPress Mode)</h2>\n";
    
    // Load the text domain
    $loaded = load_plugin_textdomain(
        'elementor-copier',
        false,
        dirname( plugin_basename( __FILE__ ) ) . '/languages'
    );
    
    echo "<p><strong>Text domain loaded:</strong> " . ( $loaded ? 'Yes' : 'No' ) . "</p>\n";
    
    // Test some translations
    $test_strings = array(
        'Elementor Widget Copier',
        'Source Site URL',
        'Load Content',
        'Copy',
        'Loading...',
        'Connection successful',
        'Connection failed',
        'Import successful',
    );
    
    echo "<h3>Translation Tests:</h3>\n";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>\n";
    echo "<tr><th>English</th><th>Translated</th><th>Status</th></tr>\n";
    
    foreach ( $test_strings as $string ) {
        $translated = __( $string, 'elementor-copier' );
        $is_translated = ( $translated !== $string );
        $status = $is_translated ? '✓ Translated' : '✗ Not translated';
        $color = $is_translated ? 'green' : 'red';
        
        echo "<tr>";
        echo "<td>" . esc_html( $string ) . "</td>";
        echo "<td dir='rtl'>" . esc_html( $translated ) . "</td>";
        echo "<td style='color: $color;'>" . esc_html( $status ) . "</td>";
        echo "</tr>\n";
    }
    
    echo "</table>\n";
    
} else {
    // Standalone mode - just verify files exist
    echo "=== Testing Elementor Copier Translations (Standalone Mode) ===\n\n";
    
    $files = array(
        'languages/elementor-copier.pot' => 'Translation Template',
        'languages/elementor-copier-fa_IR.po' => 'Persian PO File',
        'languages/elementor-copier-fa_IR.mo' => 'Persian MO File (Compiled)',
    );
    
    echo "File Check:\n";
    echo str_repeat( '-', 60 ) . "\n";
    
    $all_exist = true;
    foreach ( $files as $file => $description ) {
        $exists = file_exists( __DIR__ . '/' . $file );
        $status = $exists ? '✓' : '✗';
        $size = $exists ? filesize( __DIR__ . '/' . $file ) : 0;
        
        echo sprintf( "%s %-40s %s\n", $status, $description, $exists ? "($size bytes)" : "(missing)" );
        
        if ( ! $exists ) {
            $all_exist = false;
        }
    }
    
    echo str_repeat( '-', 60 ) . "\n";
    
    if ( $all_exist ) {
        echo "\n✓ All translation files exist!\n";
        
        // Check MO file structure
        $mo_file = __DIR__ . '/languages/elementor-copier-fa_IR.mo';
        $mo_data = file_get_contents( $mo_file );
        
        // Check magic number
        $magic = unpack( 'V', substr( $mo_data, 0, 4 ) )[1];
        $expected_magic = 0x950412de;
        
        echo "\nMO File Validation:\n";
        echo str_repeat( '-', 60 ) . "\n";
        
        if ( $magic === $expected_magic ) {
            echo "✓ Magic number is correct (0x" . dechex( $magic ) . ")\n";
            
            // Get number of strings
            $num_strings = unpack( 'V', substr( $mo_data, 8, 4 ) )[1];
            echo "✓ Number of translations: $num_strings\n";
            
            echo "\n✓ MO file appears to be valid!\n";
        } else {
            echo "✗ Invalid magic number: 0x" . dechex( $magic ) . "\n";
            echo "  Expected: 0x" . dechex( $expected_magic ) . "\n";
        }
    } else {
        echo "\n✗ Some translation files are missing!\n";
    }
    
    echo "\n=== Test Complete ===\n";
}
