<?php
/**
 * Core Plugin Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main Plugin Class
 *
 * The main class that initializes and runs the plugin.
 */
final class Plugin {

    /**
     * Instance
     *
     * @var Plugin The single instance of the class.
     */
    private static $_instance = null;

    /**
     * REST Controller instance
     *
     * @var API\RestController
     */
    private $rest_controller;

    /**
     * Instance
     *
     * Ensures only one instance of the class is loaded or can be loaded.
     *
     * @return Plugin An instance of the class.
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     *
     * Perform some compatibility checks to make sure basic requirements are met.
     * If all compatibility checks pass, initialize the functionality.
     */
    private function __construct() {
        $this->log( 'Plugin constructor called' );
        $this->init();
    }

    /**
     * Initialize the plugin
     *
     * Load the plugin functionality only after all plugins are loaded.
     */
    public function init() {
        $this->log( 'Plugin init() called' );
        
        // Load plugin text domain for translations
        add_action( 'init', array( $this, 'load_textdomain' ) );
        $this->log( 'Text domain action registered' );

        // Initialize plugin components
        $this->log( 'About to initialize components...' );
        $this->init_components();
        $this->log( 'Components initialized' );

        // Register hooks
        $this->log( 'About to register hooks...' );
        $this->register_hooks();
        $this->log( 'Hooks registered' );
    }
    
    /**
     * Log helper function
     */
    private function log( $message, $level = 'INFO' ) {
        $log_file = WP_CONTENT_DIR . '/elementor-copier-debug.log';
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[{$timestamp}] [Plugin] [{$level}] {$message}\n";
        error_log( $log_message, 3, $log_file );
    }

    /**
     * Load plugin text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'elementor-copier',
            false,
            dirname( ELEMENTOR_COPIER_PLUGIN_BASENAME ) . '/languages'
        );
    }

    /**
     * Initialize plugin components
     */
    private function init_components() {
        $this->log( 'init_components() START' );
        
        try {
            // Initialize admin interface (only in admin area)
            $this->log( 'Checking if should load AdminPage...' );
            $this->log( 'is_admin(): ' . ( is_admin() ? 'YES' : 'NO' ) );
            
            if ( is_admin() ) {
                $this->log( 'Checking if AdminPage class exists...' );
                if ( class_exists( '\ElementorCopier\Admin\AdminPage' ) ) {
                    $this->log( 'AdminPage class exists, creating instance...' );
                    new Admin\AdminPage();
                    $this->log( 'AdminPage instance created successfully' );
                } else {
                    $this->log( 'AdminPage class does NOT exist', 'WARNING' );
                }
            }

            // Initialize REST API controller
            $this->log( 'Checking if RestController class exists...' );
            if ( class_exists( '\ElementorCopier\API\RestController' ) ) {
                $this->log( 'RestController class exists, creating instance...' );
                $this->rest_controller = new API\RestController();
                $this->log( 'RestController instance created successfully' );
            } else {
                $this->log( 'RestController class does NOT exist', 'WARNING' );
            }

            // Initialize AJAX handler (only in admin area)
            if ( is_admin() ) {
                $this->log( 'Checking if AjaxHandler class exists...' );
                if ( class_exists( '\ElementorCopier\Ajax\AjaxHandler' ) ) {
                    $this->log( 'AjaxHandler class exists, creating instance...' );
                    new Ajax\AjaxHandler();
                    $this->log( 'AjaxHandler instance created successfully' );
                } else {
                    $this->log( 'AjaxHandler class does NOT exist', 'WARNING' );
                }
            }

            // Initialize Elementor Editor Integration
            $this->log( 'Checking if ElementorEditorIntegration class exists...' );
            if ( class_exists( '\ElementorCopier\ElementorEditorIntegration' ) ) {
                $this->log( 'ElementorEditorIntegration class exists, creating instance...' );
                new ElementorEditorIntegration();
                $this->log( 'ElementorEditorIntegration instance created successfully' );
            } else {
                $this->log( 'ElementorEditorIntegration class does NOT exist - loading manually', 'WARNING' );
                $editor_file = ELEMENTOR_COPIER_PLUGIN_DIR . 'includes/class-elementor-editor-integration.php';
                if ( file_exists( $editor_file ) ) {
                    require_once $editor_file;
                    new ElementorEditorIntegration();
                    $this->log( 'ElementorEditorIntegration loaded and instantiated' );
                }
            }
            
            $this->log( 'init_components() completed successfully' );
            
        } catch ( \Throwable $e ) {
            // Log error but don't crash
            $this->log( 'EXCEPTION in init_components(): ' . $e->getMessage(), 'ERROR' );
            $this->log( 'Exception File: ' . $e->getFile() . ':' . $e->getLine(), 'ERROR' );
            $this->log( 'Stack Trace: ' . $e->getTraceAsString(), 'ERROR' );
        }
        
        $this->log( 'init_components() END' );
    }

    /**
     * Register WordPress hooks
     */
    private function register_hooks() {
        // Hook to initialize REST API routes
        add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

        // Hook to enqueue admin scripts and styles
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Register REST API routes via the RestController
        if ( $this->rest_controller ) {
            $this->rest_controller->register_routes();
        }
    }

    /**
     * Enqueue admin assets
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueue_admin_assets( $hook ) {
        // Only load assets on our plugin's admin page
        // This will be implemented when AdminPage is created
    }

    /**
     * Get plugin version
     *
     * @return string Plugin version.
     */
    public function get_version() {
        return ELEMENTOR_COPIER_VERSION;
    }

    /**
     * Get plugin directory path
     *
     * @return string Plugin directory path.
     */
    public function get_plugin_path() {
        return ELEMENTOR_COPIER_PLUGIN_DIR;
    }

    /**
     * Get plugin directory URL
     *
     * @return string Plugin directory URL.
     */
    public function get_plugin_url() {
        return ELEMENTOR_COPIER_PLUGIN_URL;
    }

    /**
     * Prevent cloning
     */
    private function __clone() {
        _doing_it_wrong(
            __FUNCTION__,
            esc_html__( 'Cloning is forbidden.', 'elementor-copier' ),
            ELEMENTOR_COPIER_VERSION
        );
    }

    /**
     * Prevent unserializing
     */
    public function __wakeup() {
        _doing_it_wrong(
            __FUNCTION__,
            esc_html__( 'Unserializing instances of this class is forbidden.', 'elementor-copier' ),
            ELEMENTOR_COPIER_VERSION
        );
    }
}
