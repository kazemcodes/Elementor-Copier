<?php
/**
 * Plugin Name: Elementor Widget Copier
 * Plugin URI: https://github.com/yourusername/elementor-copier
 * Description: Copy Elementor widgets, sections, and pages from any WordPress site to your local site. Features full Persian (Farsi) language support with RTL interface.
 * Description (fa_IR): کپی ویجت‌ها، بخش‌ها و صفحات المنتور از هر سایت وردپرسی به سایت محلی شما. با پشتیبانی کامل از زبان فارسی و رابط کاربری راست به چپ.
 * Version: 1.0.0
 * Author: Kazem Moridi
 * Author URI: https://github.com/kazemmoridi
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: elementor-copier
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.4
 * Network: false
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Define plugin constants
define( 'ELEMENTOR_COPIER_VERSION', '1.0.0' );
define( 'ELEMENTOR_COPIER_PLUGIN_FILE', __FILE__ );
define( 'ELEMENTOR_COPIER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ELEMENTOR_COPIER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'ELEMENTOR_COPIER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Autoloader for namespaced classes
spl_autoload_register( function ( $class ) {
    // Project-specific namespace prefix
    $prefix = 'ElementorCopier\\';

    // Base directory for the namespace prefix
    $base_dir = ELEMENTOR_COPIER_PLUGIN_DIR . 'includes/';

    // Does the class use the namespace prefix?
    $len = strlen( $prefix );
    if ( strncmp( $prefix, $class, $len ) !== 0 ) {
        // No, move to the next registered autoloader
        return;
    }

    // Get the relative class name
    $relative_class = substr( $class, $len );

    // Replace namespace separators with directory separators
    $file_path = $base_dir . str_replace( '\\', '/', $relative_class );
    
    // Convert class name to file name format
    $file_parts = explode( '/', $file_path );
    $class_name = array_pop( $file_parts );
    
    // Convert CamelCase to kebab-case
    $kebab_case = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $class_name ) );
    
    // Also try without hyphens (for files like adminpage instead of admin-page)
    $no_hyphen = str_replace( '-', '', $kebab_case );
    
    // Build directory path (make it case-insensitive for Windows)
    $dir_path = ! empty( $file_parts ) ? implode( '/', $file_parts ) . '/' : $base_dir;
    
    // Try lowercase directory path as well
    $dir_path_lower = strtolower( $dir_path );
    
    // Try multiple file name variations
    $file_variations = array(
        // Standard: class-admin-page.php
        $dir_path . 'class-' . $kebab_case . '.php',
        $dir_path_lower . 'class-' . $kebab_case . '.php',
        // No hyphen: class-adminpage.php
        $dir_path . 'class-' . $no_hyphen . '.php',
        $dir_path_lower . 'class-' . $no_hyphen . '.php',
        // Interface files
        $dir_path . 'interface-' . $kebab_case . '.php',
        $dir_path_lower . 'interface-' . $kebab_case . '.php',
        $dir_path . 'interface-' . $no_hyphen . '.php',
        $dir_path_lower . 'interface-' . $no_hyphen . '.php',
        // Trait files
        $dir_path . 'trait-' . $kebab_case . '.php',
        $dir_path_lower . 'trait-' . $kebab_case . '.php',
        $dir_path . 'trait-' . $no_hyphen . '.php',
        $dir_path_lower . 'trait-' . $no_hyphen . '.php',
    );
    
    // Try each variation
    foreach ( $file_variations as $file ) {
        if ( file_exists( $file ) ) {
            require_once $file;
            return;
        }
    }
} );

/**
 * Custom error logger for debugging
 */
function elementor_copier_log( $message, $level = 'INFO' ) {
    $log_file = WP_CONTENT_DIR . '/elementor-copier-debug.log';
    $timestamp = date( 'Y-m-d H:i:s' );
    $log_message = "[{$timestamp}] [{$level}] {$message}\n";
    error_log( $log_message, 3, $log_file );
}

/**
 * Initialize the plugin
 */
function elementor_copier_init() {
    elementor_copier_log( '=== PLUGIN INITIALIZATION START ===' );
    
    // Prevent multiple initializations
    static $initialized = false;
    if ( $initialized ) {
        elementor_copier_log( 'Already initialized, skipping', 'WARNING' );
        return;
    }
    
    elementor_copier_log( 'Setting initialized flag to true' );
    $initialized = true;

    // Log WordPress and PHP environment
    elementor_copier_log( 'WordPress Version: ' . get_bloginfo( 'version' ) );
    elementor_copier_log( 'PHP Version: ' . PHP_VERSION );
    elementor_copier_log( 'Plugin Directory: ' . ELEMENTOR_COPIER_PLUGIN_DIR );
    
    // Check if we're in admin
    elementor_copier_log( 'Is Admin: ' . ( is_admin() ? 'YES' : 'NO' ) );
    elementor_copier_log( 'Is AJAX: ' . ( wp_doing_ajax() ? 'YES' : 'NO' ) );
    
    // Check if Elementor is active (skip check for now to allow plugin to load)
    elementor_copier_log( 'Checking Elementor status...' );
    if ( ! did_action( 'elementor/loaded' ) ) {
        elementor_copier_log( 'Elementor is NOT loaded - showing notice', 'WARNING' );
        add_action( 'admin_notices', 'elementor_copier_missing_elementor_notice' );
        // Don't return - let plugin load anyway for debugging
    } else {
        elementor_copier_log( 'Elementor is loaded - OK' );
    }

    // Check if Plugin class exists
    elementor_copier_log( 'Checking if Plugin class exists...' );
    if ( ! class_exists( '\ElementorCopier\Plugin' ) ) {
        elementor_copier_log( 'Plugin class does NOT exist!', 'ERROR' );
        
        // Try to manually load it
        $plugin_file = ELEMENTOR_COPIER_PLUGIN_DIR . 'includes/class-plugin.php';
        elementor_copier_log( 'Attempting to load: ' . $plugin_file );
        
        if ( file_exists( $plugin_file ) ) {
            elementor_copier_log( 'Plugin file exists, requiring it...' );
            require_once $plugin_file;
            elementor_copier_log( 'Plugin file loaded' );
        } else {
            elementor_copier_log( 'Plugin file does NOT exist!', 'ERROR' );
            add_action( 'admin_notices', 'elementor_copier_class_missing_notice' );
            return;
        }
    } else {
        elementor_copier_log( 'Plugin class exists - OK' );
    }

    // Initialize the plugin with error handling
    try {
        elementor_copier_log( 'Attempting to create Plugin instance...' );
        
        if ( class_exists( '\ElementorCopier\Plugin' ) ) {
            elementor_copier_log( 'Calling Plugin::instance()...' );
            \ElementorCopier\Plugin::instance();
            elementor_copier_log( 'Plugin instance created successfully!' );
        } else {
            elementor_copier_log( 'Plugin class still does not exist after loading', 'ERROR' );
        }
        
    } catch ( \Throwable $e ) {
        // Catch all errors and exceptions
        elementor_copier_log( 'EXCEPTION CAUGHT: ' . $e->getMessage(), 'ERROR' );
        elementor_copier_log( 'Exception File: ' . $e->getFile() . ':' . $e->getLine(), 'ERROR' );
        elementor_copier_log( 'Stack Trace: ' . $e->getTraceAsString(), 'ERROR' );
        
        add_action( 'admin_notices', function() use ( $e ) {
            elementor_copier_error_notice( $e->getMessage() );
        } );
    }
    
    elementor_copier_log( '=== PLUGIN INITIALIZATION END ===' );
}
add_action( 'plugins_loaded', 'elementor_copier_init', 999 );

/**
 * Display admin notice if Elementor is not active
 */
function elementor_copier_missing_elementor_notice() {
    $message = sprintf(
        /* translators: 1: Plugin name 2: Elementor */
        esc_html__( '"%1$s" requires "%2$s" to be installed and activated.', 'elementor-copier' ),
        '<strong>' . esc_html__( 'Elementor Widget Copier', 'elementor-copier' ) . '</strong>',
        '<strong>' . esc_html__( 'Elementor', 'elementor-copier' ) . '</strong>'
    );

    printf( '<div class="notice notice-warning is-dismissible"><p>%s</p></div>', wp_kses_post( $message ) );
}

/**
 * Display admin notice if plugin class is missing
 */
function elementor_copier_class_missing_notice() {
    $message = sprintf(
        /* translators: %s: Plugin name */
        esc_html__( '%s: Plugin files are missing or corrupted. Please reinstall the plugin.', 'elementor-copier' ),
        '<strong>' . esc_html__( 'Elementor Widget Copier', 'elementor-copier' ) . '</strong>'
    );

    printf( '<div class="notice notice-error is-dismissible"><p>%s</p></div>', wp_kses_post( $message ) );
}

/**
 * Display admin notice for plugin errors
 *
 * @param string $error_message The error message to display.
 */
function elementor_copier_error_notice( $error_message ) {
    $message = sprintf(
        /* translators: 1: Plugin name 2: Error message */
        esc_html__( '%1$s Error: %2$s', 'elementor-copier' ),
        '<strong>' . esc_html__( 'Elementor Widget Copier', 'elementor-copier' ) . '</strong>',
        esc_html( $error_message )
    );

    printf( '<div class="notice notice-error is-dismissible"><p>%s</p></div>', wp_kses_post( $message ) );
}

/**
 * Activation hook
 */
function elementor_copier_activate() {
    // Check WordPress version
    if ( version_compare( get_bloginfo( 'version' ), '5.6', '<' ) ) {
        deactivate_plugins( ELEMENTOR_COPIER_PLUGIN_BASENAME );
        wp_die(
            esc_html__( 'Elementor Widget Copier requires WordPress 5.6 or higher.', 'elementor-copier' ),
            esc_html__( 'Plugin Activation Error', 'elementor-copier' ),
            array( 'back_link' => true )
        );
    }

    // Check PHP version
    if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
        deactivate_plugins( ELEMENTOR_COPIER_PLUGIN_BASENAME );
        wp_die(
            esc_html__( 'Elementor Widget Copier requires PHP 7.4 or higher.', 'elementor-copier' ),
            esc_html__( 'Plugin Activation Error', 'elementor-copier' ),
            array( 'back_link' => true )
        );
    }

    // Flush rewrite rules for REST API
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'elementor_copier_activate' );

/**
 * Deactivation hook
 */
function elementor_copier_deactivate() {
    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'elementor_copier_deactivate' );
