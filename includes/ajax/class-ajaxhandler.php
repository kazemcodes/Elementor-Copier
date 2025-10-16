<?php
/**
 * AJAX Handler Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Ajax;

use ElementorCopier\Export\Exporter;
use ElementorCopier\Security\Auth;
use ElementorCopier\ErrorLogger;
use ElementorCopier\Connector\SourceConnector;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * AJAX Handler Class
 *
 * Handles AJAX requests from the admin interface.
 */
class AjaxHandler {

    /**
     * Auth instance
     *
     * @var Auth
     */
    private $auth;

    /**
     * Exporter instance
     *
     * @var Exporter
     */
    private $exporter;

    /**
     * Constructor
     */
    public function __construct() {
        $this->log( 'AjaxHandler constructor called - using lazy loading' );
        // Don't create instances here - lazy load them when needed
        $this->register_actions();
        $this->log( 'AjaxHandler constructor completed (lazy loading enabled)' );
    }
    
    /**
     * Get Auth instance (lazy loading)
     */
    private function get_auth() {
        if ( null === $this->auth ) {
            $this->log( 'Lazy loading Auth instance...' );
            $this->auth = new Auth();
            $this->log( 'Auth instance created' );
        }
        return $this->auth;
    }
    
    /**
     * Get Exporter instance (lazy loading)
     */
    private function get_exporter() {
        if ( null === $this->exporter ) {
            $this->log( 'Lazy loading Exporter instance...' );
            $this->exporter = new Exporter();
            $this->log( 'Exporter instance created' );
        }
        return $this->exporter;
    }
    
    /**
     * Log helper function
     */
    private function log( $message, $level = 'INFO' ) {
        $log_file = WP_CONTENT_DIR . '/elementor-copier-debug.log';
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[{$timestamp}] [AjaxHandler] [{$level}] {$message}\n";
        error_log( $log_message, 3, $log_file );
    }

    /**
     * Register AJAX actions
     */
    public function register_actions() {
        // AJAX action for getting templates
        add_action( 'wp_ajax_elementor_copier_get_templates', array( $this, 'handle_get_templates' ) );

        // AJAX action for copying widget
        add_action( 'wp_ajax_elementor_copier_copy_widget', array( $this, 'handle_copy_widget' ) );

        // AJAX action for loading content from source site
        add_action( 'wp_ajax_elementor_copier_load_content', array( $this, 'handle_load_content' ) );

        // AJAX action for extracting specific data from source site
        add_action( 'wp_ajax_elementor_copier_extract_data', array( $this, 'handle_extract_data' ) );

        // AJAX action for getting local pages
        add_action( 'wp_ajax_elementor_copier_get_local_pages', array( $this, 'handle_get_local_pages' ) );

        // AJAX action for importing content with target selection
        add_action( 'wp_ajax_elementor_copier_import_content', array( $this, 'handle_import_content' ) );

        // AJAX action for paste from clipboard
        add_action( 'wp_ajax_elementor_copier_paste_clipboard', array( $this, 'handle_paste_clipboard' ) );
    }

    /**
     * Handle get templates AJAX request
     *
     * Fetches available Elementor templates from the current site.
     */
    public function handle_get_templates() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            ErrorLogger::log_authentication_error(
                'Nonce verification failed for get_templates request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            ErrorLogger::log_authentication_error(
                'User lacks admin capability for get_templates request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        try {
            // Check if Elementor is active
            if ( ! did_action( 'elementor/loaded' ) ) {
                ErrorLogger::log_export_error( 'Elementor is not active on source site' );
                wp_send_json_error(
                    array(
                        'message' => __( 'Elementor is not active. Please install and activate Elementor.', 'elementor-copier' ),
                    ),
                    500
                );
            }

            $templates = $this->get_elementor_templates();

            ErrorLogger::log_info(
                'Templates retrieved successfully',
                ErrorLogger::CATEGORY_EXPORT,
                array( 'count' => count( $templates ) )
            );

            wp_send_json_success(
                array(
                    'templates' => $templates,
                    'message'   => __( 'Templates retrieved successfully.', 'elementor-copier' ),
                )
            );
        } catch ( \Exception $e ) {
            ErrorLogger::log_export_error(
                'Exception while retrieving templates: ' . $e->getMessage(),
                array(
                    'exception' => get_class( $e ),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                )
            );
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'Failed to retrieve templates: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Handle copy widget AJAX request
     *
     * Initiates the widget copy operation to the target site.
     */
    public function handle_copy_widget() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            ErrorLogger::log_authentication_error(
                'Nonce verification failed for copy_widget request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            ErrorLogger::log_authentication_error(
                'User lacks admin capability for copy_widget request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Get and validate input parameters
        $post_id        = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
        $element_id     = isset( $_POST['element_id'] ) ? sanitize_text_field( wp_unslash( $_POST['element_id'] ) ) : '';
        $element_type   = isset( $_POST['element_type'] ) ? sanitize_text_field( wp_unslash( $_POST['element_type'] ) ) : 'widget';
        $target_url     = isset( $_POST['target_url'] ) ? esc_url_raw( wp_unslash( $_POST['target_url'] ) ) : '';
        $target_post_id = isset( $_POST['target_post_id'] ) ? intval( $_POST['target_post_id'] ) : 0;
        $position       = isset( $_POST['position'] ) ? sanitize_text_field( wp_unslash( $_POST['position'] ) ) : 'bottom';
        $username       = isset( $_POST['username'] ) ? sanitize_text_field( wp_unslash( $_POST['username'] ) ) : '';
        $app_password   = isset( $_POST['app_password'] ) ? sanitize_text_field( wp_unslash( $_POST['app_password'] ) ) : '';

        // Validate required fields
        if ( empty( $post_id ) || empty( $element_id ) || empty( $target_url ) || empty( $target_post_id ) ) {
            ErrorLogger::log_validation_error(
                'Missing required parameters for copy_widget',
                array(
                    'post_id'        => $post_id,
                    'element_id'     => $element_id ? 'present' : 'missing',
                    'target_url'     => $target_url ? 'present' : 'missing',
                    'target_post_id' => $target_post_id,
                )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Missing required parameters. Please ensure all fields are filled out.', 'elementor-copier' ),
                ),
                400
            );
        }

        // Validate target URL
        if ( ! $this->get_auth()->validate_url( $target_url ) ) {
            ErrorLogger::log_validation_error(
                'Invalid target URL provided',
                array( 'target_url' => $target_url )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Invalid target URL. Please enter a valid website URL (e.g., https://example.com).', 'elementor-copier' ),
                ),
                400
            );
        }

        // Validate authentication credentials
        if ( empty( $username ) || empty( $app_password ) ) {
            ErrorLogger::log_validation_error(
                'Missing authentication credentials',
                array(
                    'username'     => $username ? 'present' : 'missing',
                    'app_password' => $app_password ? 'present' : 'missing',
                )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Authentication credentials are required. Please provide username and application password.', 'elementor-copier' ),
                ),
                400
            );
        }

        try {
            // Check if Elementor is active
            if ( ! did_action( 'elementor/loaded' ) ) {
                ErrorLogger::log_export_error( 'Elementor is not active on source site' );
                throw new \Exception( __( 'Elementor is not active. Please install and activate Elementor.', 'elementor-copier' ) );
            }

            // Export the element data based on type
            $payload = null;
            switch ( $element_type ) {
                case 'widget':
                    $payload = $this->get_exporter()->export_widget( $post_id, $element_id );
                    break;
                case 'section':
                    $payload = $this->get_exporter()->export_section( $post_id, $element_id );
                    break;
                case 'page':
                    $payload = $this->get_exporter()->export_page( $post_id );
                    break;
                default:
                    ErrorLogger::log_validation_error(
                        'Invalid element type provided',
                        array( 'element_type' => $element_type )
                    );
                    throw new \Exception( __( 'Invalid element type. Must be widget, section, or page.', 'elementor-copier' ) );
            }

            // Check if export returned an error
            if ( is_wp_error( $payload ) ) {
                ErrorLogger::log_export_error(
                    'Export failed: ' . $payload->get_error_message(),
                    array(
                        'post_id'      => $post_id,
                        'element_id'   => $element_id,
                        'element_type' => $element_type,
                        'error_code'   => $payload->get_error_code(),
                    )
                );
                throw new \Exception( ErrorLogger::get_user_friendly_message( $payload ) );
            }

            if ( empty( $payload ) ) {
                ErrorLogger::log_export_error(
                    'Export returned empty payload',
                    array(
                        'post_id'      => $post_id,
                        'element_id'   => $element_id,
                        'element_type' => $element_type,
                    )
                );
                throw new \Exception( __( 'Failed to export element data. The element may not exist or may be empty.', 'elementor-copier' ) );
            }

            ErrorLogger::log_info(
                'Element exported successfully',
                ErrorLogger::CATEGORY_EXPORT,
                array(
                    'post_id'      => $post_id,
                    'element_type' => $element_type,
                )
            );

            // Prepare authentication
            $auth = array(
                'username' => $username,
                'password' => $app_password,
            );

            // Prepare request data
            $request_data = array(
                'target_post_id' => $target_post_id,
                'position'       => $position,
                'payload'        => $payload,
                'options'        => array(
                    'download_media'  => false, // Optional feature, disabled by default
                    'regenerate_css'  => true,
                ),
            );

            // Send to target site
            $response = $this->send_to_target( $target_url, $request_data, $auth );

            if ( $response['success'] ) {
                ErrorLogger::log_info(
                    'Element copied successfully to target site',
                    ErrorLogger::CATEGORY_GENERAL,
                    array(
                        'target_url'     => $target_url,
                        'target_post_id' => $target_post_id,
                        'element_type'   => $element_type,
                    )
                );
                wp_send_json_success(
                    array(
                        'message' => __( 'Element copied successfully to the target site.', 'elementor-copier' ),
                        'data'    => $response['data'],
                    )
                );
            } else {
                ErrorLogger::log_connection_error(
                    'Failed to copy element to target site: ' . $response['message'],
                    array(
                        'target_url'  => $target_url,
                        'status_code' => $response['status_code'],
                    )
                );
                wp_send_json_error(
                    array(
                        'message' => $response['message'],
                    ),
                    $response['status_code']
                );
            }
        } catch ( \Exception $e ) {
            ErrorLogger::log(
                'Exception during copy_widget: ' . $e->getMessage(),
                ErrorLogger::CATEGORY_GENERAL,
                ErrorLogger::LEVEL_ERROR,
                array(
                    'exception' => get_class( $e ),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                )
            );
            wp_send_json_error(
                array(
                    'message' => $e->getMessage(),
                ),
                500
            );
        }
    }

    /**
     * Get Elementor templates
     *
     * Retrieves all posts that have Elementor data.
     *
     * @return array List of templates with their metadata.
     */
    private function get_elementor_templates() {
        // Check if Elementor is active
        if ( ! did_action( 'elementor/loaded' ) ) {
            throw new \Exception( __( 'Elementor is not active.', 'elementor-copier' ) );
        }

        $templates = array();

        // Get all post types that support Elementor
        $post_types = get_post_types(
            array(
                'public' => true,
            )
        );

        // Query posts with Elementor data
        $args = array(
            'post_type'      => $post_types,
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'meta_query'     => array(
                array(
                    'key'     => '_elementor_edit_mode',
                    'value'   => 'builder',
                    'compare' => '=',
                ),
            ),
            'orderby'        => 'title',
            'order'          => 'ASC',
        );

        $query = new \WP_Query( $args );

        if ( $query->have_posts() ) {
            while ( $query->have_posts() ) {
                $query->the_post();
                $post_id = get_the_ID();

                // Get Elementor document
                $document = \Elementor\Plugin::instance()->documents->get( $post_id );

                if ( ! $document ) {
                    continue;
                }

                // Get elements data
                $elements = $document->get_elements_data();

                if ( empty( $elements ) ) {
                    continue;
                }

                // Parse elements to get widgets and sections
                $parsed_elements = $this->parse_elements( $elements, $post_id );

                $templates[] = array(
                    'post_id'   => $post_id,
                    'title'     => get_the_title(),
                    'post_type' => get_post_type(),
                    'edit_url'  => get_edit_post_link( $post_id, 'raw' ),
                    'elements'  => $parsed_elements,
                );
            }
            wp_reset_postdata();
        }

        return $templates;
    }

    /**
     * Parse Elementor elements recursively
     *
     * @param array $elements Elements data.
     * @param int   $post_id  Post ID.
     * @return array Parsed elements.
     */
    private function parse_elements( $elements, $post_id ) {
        $parsed = array();

        foreach ( $elements as $element ) {
            $element_data = array(
                'id'    => $element['id'],
                'type'  => $element['elType'],
                'title' => $this->get_element_title( $element ),
            );

            // Add to parsed list
            $parsed[] = $element_data;

            // Recursively parse child elements
            if ( ! empty( $element['elements'] ) ) {
                $children = $this->parse_elements( $element['elements'], $post_id );
                $parsed   = array_merge( $parsed, $children );
            }
        }

        return $parsed;
    }

    /**
     * Get element title
     *
     * @param array $element Element data.
     * @return string Element title.
     */
    private function get_element_title( $element ) {
        $title = '';

        // Try to get a meaningful title based on element type
        if ( isset( $element['widgetType'] ) ) {
            $title = ucwords( str_replace( array( '-', '_' ), ' ', $element['widgetType'] ) );
        } elseif ( isset( $element['elType'] ) ) {
            $title = ucwords( $element['elType'] );
        }

        // Try to get title from settings
        if ( isset( $element['settings']['title'] ) && ! empty( $element['settings']['title'] ) ) {
            $title .= ': ' . $element['settings']['title'];
        } elseif ( isset( $element['settings']['heading'] ) && ! empty( $element['settings']['heading'] ) ) {
            $title .= ': ' . $element['settings']['heading'];
        } elseif ( isset( $element['settings']['text'] ) && ! empty( $element['settings']['text'] ) ) {
            $text   = wp_strip_all_tags( $element['settings']['text'] );
            $title .= ': ' . wp_trim_words( $text, 5 );
        }

        return $title;
    }

    /**
     * Send data to target site
     *
     * Sends a POST request to the target site's REST API endpoint.
     *
     * @param string $target_url Target site URL.
     * @param array  $data       Data to send.
     * @param array  $auth       Authentication credentials.
     * @return array Response data with success status and message.
     */
    private function send_to_target( $target_url, $data, $auth ) {
        // Construct the API endpoint URL
        $api_url = trailingslashit( $target_url ) . 'wp-json/elementor-copier/v1/import';

        ErrorLogger::log_info(
            'Sending request to target site',
            ErrorLogger::CATEGORY_CONNECTION,
            array(
                'api_url' => $api_url,
                'username' => $auth['username'],
            )
        );

        // Prepare request arguments
        $args = array(
            'method'  => 'POST',
            'timeout' => 30,
            'headers' => array(
                'Content-Type'  => 'application/json',
                'Authorization' => 'Basic ' . base64_encode( $auth['username'] . ':' . $auth['password'] ),
            ),
            'body'    => wp_json_encode( $data ),
        );

        // Send the request
        $response = wp_remote_post( $api_url, $args );

        // Check for errors
        if ( is_wp_error( $response ) ) {
            $error_code = $response->get_error_code();
            $error_message = $response->get_error_message();

            ErrorLogger::log_connection_error(
                'HTTP request failed: ' . $error_message,
                array(
                    'api_url'     => $api_url,
                    'error_code'  => $error_code,
                )
            );

            // Provide more specific error messages based on error code
            $user_message = __( 'Unable to connect to the target site. Please check the URL and ensure the site is accessible.', 'elementor-copier' );
            
            if ( strpos( $error_code, 'timeout' ) !== false ) {
                $user_message = __( 'Connection to the target site timed out. The site may be slow or unreachable. Please try again.', 'elementor-copier' );
            } elseif ( strpos( $error_code, 'ssl' ) !== false ) {
                $user_message = __( 'SSL certificate verification failed. The target site may have an invalid SSL certificate.', 'elementor-copier' );
            } elseif ( strpos( $error_code, 'dns' ) !== false || strpos( $error_code, 'resolve' ) !== false ) {
                $user_message = __( 'Could not resolve the target site URL. Please check that the URL is correct.', 'elementor-copier' );
            }

            return array(
                'success'     => false,
                'message'     => $user_message,
                'status_code' => 500,
            );
        }

        // Get response code
        $status_code = wp_remote_retrieve_response_code( $response );
        $body        = wp_remote_retrieve_body( $response );
        $decoded     = json_decode( $body, true );

        ErrorLogger::log_debug(
            'Received response from target site',
            ErrorLogger::CATEGORY_CONNECTION,
            array(
                'status_code' => $status_code,
                'body_length' => strlen( $body ),
            )
        );

        // Handle different status codes
        if ( $status_code === 200 || $status_code === 201 ) {
            ErrorLogger::log_info(
                'Import successful on target site',
                ErrorLogger::CATEGORY_IMPORT,
                array( 'status_code' => $status_code )
            );
            return array(
                'success'     => true,
                'message'     => isset( $decoded['data']['message'] ) ? $decoded['data']['message'] : __( 'Import successful.', 'elementor-copier' ),
                'data'        => isset( $decoded['data'] ) ? $decoded['data'] : array(),
                'status_code' => $status_code,
            );
        } elseif ( $status_code === 401 ) {
            ErrorLogger::log_authentication_error(
                'Authentication failed on target site',
                array(
                    'status_code' => $status_code,
                    'username'    => $auth['username'],
                )
            );
            return array(
                'success'     => false,
                'message'     => __( 'Authentication failed. Please verify your username and application password are correct.', 'elementor-copier' ),
                'status_code' => $status_code,
            );
        } elseif ( $status_code === 403 ) {
            ErrorLogger::log_authentication_error(
                'Access denied on target site',
                array(
                    'status_code' => $status_code,
                    'username'    => $auth['username'],
                )
            );
            return array(
                'success'     => false,
                'message'     => __( 'Access denied. The user does not have administrator permissions on the target site.', 'elementor-copier' ),
                'status_code' => $status_code,
            );
        } elseif ( $status_code === 404 ) {
            ErrorLogger::log_connection_error(
                'API endpoint not found on target site',
                array(
                    'status_code' => $status_code,
                    'api_url'     => $api_url,
                )
            );
            return array(
                'success'     => false,
                'message'     => __( 'API endpoint not found. Please ensure the Elementor Copier plugin is installed and activated on the target site.', 'elementor-copier' ),
                'status_code' => $status_code,
            );
        } elseif ( $status_code === 400 ) {
            $error_message = isset( $decoded['error']['message'] ) ? $decoded['error']['message'] : __( 'Invalid request data.', 'elementor-copier' );
            ErrorLogger::log_validation_error(
                'Bad request to target site: ' . $error_message,
                array(
                    'status_code' => $status_code,
                    'response'    => $decoded,
                )
            );
            return array(
                'success'     => false,
                'message'     => sprintf(
                    /* translators: %s: error message */
                    __( 'Invalid request: %s', 'elementor-copier' ),
                    $error_message
                ),
                'status_code' => $status_code,
            );
        } elseif ( $status_code === 500 ) {
            $error_message = isset( $decoded['error']['message'] ) ? $decoded['error']['message'] : __( 'Internal server error on target site.', 'elementor-copier' );
            ErrorLogger::log_import_error(
                'Server error on target site: ' . $error_message,
                array(
                    'status_code' => $status_code,
                    'response'    => $decoded,
                )
            );
            return array(
                'success'     => false,
                'message'     => sprintf(
                    /* translators: %s: error message */
                    __( 'Server error on target site: %s', 'elementor-copier' ),
                    $error_message
                ),
                'status_code' => $status_code,
            );
        } else {
            $error_message = isset( $decoded['error']['message'] ) ? $decoded['error']['message'] : __( 'Unknown error occurred.', 'elementor-copier' );
            ErrorLogger::log_connection_error(
                'Unexpected response from target site',
                array(
                    'status_code' => $status_code,
                    'response'    => $decoded,
                )
            );
            return array(
                'success'     => false,
                'message'     => sprintf(
                    /* translators: 1: Status code 2: Error message */
                    __( 'Request failed (HTTP %1$d): %2$s', 'elementor-copier' ),
                    $status_code,
                    $error_message
                ),
                'status_code' => $status_code,
            );
        }
    }

    /**
     * Handle load content AJAX request
     *
     * Loads pages and posts from source site using extractors.
     */
    public function handle_load_content() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            ErrorLogger::log_authentication_error(
                'Nonce verification failed for load_content request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            ErrorLogger::log_authentication_error(
                'User lacks admin capability for load_content request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Get and validate input parameters
        $source_url = isset( $_POST['source_url'] ) ? esc_url_raw( wp_unslash( $_POST['source_url'] ) ) : '';
        $auth_method = isset( $_POST['auth_method'] ) ? sanitize_text_field( wp_unslash( $_POST['auth_method'] ) ) : 'public';
        $username = isset( $_POST['username'] ) ? sanitize_text_field( wp_unslash( $_POST['username'] ) ) : '';
        $password = isset( $_POST['password'] ) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';

        // Validate source URL
        if ( empty( $source_url ) ) {
            ErrorLogger::log_validation_error(
                'Missing source URL for load_content',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'آدرس سایت مبدا الزامی است', 'elementor-copier' ),
                ),
                400
            );
        }

        if ( ! $this->get_auth()->validate_url( $source_url ) ) {
            ErrorLogger::log_validation_error(
                'Invalid source URL provided',
                array( 'source_url' => $source_url )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'آدرس سایت نامعتبر است. لطفاً یک آدرس معتبر وارد کنید', 'elementor-copier' ),
                ),
                400
            );
        }

        // Prepare authentication credentials
        $auth = array();
        if ( $auth_method === 'credentials' && ! empty( $username ) && ! empty( $password ) ) {
            $auth = array(
                'username' => $username,
                'password' => $password,
            );
        }

        try {
            ErrorLogger::log_info(
                'Starting load_content operation',
                ErrorLogger::CATEGORY_CONNECTION,
                array(
                    'source_url'  => $source_url,
                    'auth_method' => $auth_method,
                    'has_auth'    => ! empty( $auth ),
                )
            );

            // Create source connector
            $connector = new SourceConnector();

            // Test connection first
            $connection_result = $connector->connect( $source_url, $auth );

            if ( ! $connection_result ) {
                $test_result = $connector->test_connection();
                
                if ( ! $test_result['success'] ) {
                    ErrorLogger::log_connection_error(
                        'Connection test failed: ' . ( $test_result['error']['message'] ?? 'Unknown error' ),
                        array(
                            'source_url' => $source_url,
                            'error'      => $test_result['error'] ?? array(),
                        )
                    );
                    
                    wp_send_json_error(
                        array(
                            'message' => $test_result['error']['message'] ?? __( 'اتصال به سایت مبدا برقرار نشد', 'elementor-copier' ),
                            'error'   => $test_result['error'] ?? array(),
                        ),
                        500
                    );
                }
            }

            // Get pages and posts
            ErrorLogger::log_info(
                'Fetching pages and posts from source site',
                ErrorLogger::CATEGORY_CONNECTION,
                array( 'source_url' => $source_url )
            );

            $pages = $connector->get_pages();
            $posts = $connector->get_posts();

            ErrorLogger::log_info(
                'Content loaded successfully',
                ErrorLogger::CATEGORY_CONNECTION,
                array(
                    'source_url'  => $source_url,
                    'pages_count' => count( $pages ),
                    'posts_count' => count( $posts ),
                    'method'      => $connector->get_extraction_method(),
                )
            );

            wp_send_json_success(
                array(
                    'message'           => __( 'محتوا با موفقیت بارگذاری شد', 'elementor-copier' ),
                    'pages'             => $pages,
                    'posts'             => $posts,
                    'extraction_method' => $connector->get_extraction_method(),
                    'source_url'        => $source_url,
                )
            );

        } catch ( \Exception $e ) {
            ErrorLogger::log(
                'Exception during load_content: ' . $e->getMessage(),
                ErrorLogger::CATEGORY_CONNECTION,
                ErrorLogger::LEVEL_ERROR,
                array(
                    'exception'  => get_class( $e ),
                    'file'       => $e->getFile(),
                    'line'       => $e->getLine(),
                    'source_url' => $source_url,
                )
            );
            
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'خطا در بارگذاری محتوا: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Handle extract data AJAX request
     *
     * Extracts specific Elementor data from a post/page on source site.
     */
    public function handle_extract_data() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            ErrorLogger::log_authentication_error(
                'Nonce verification failed for extract_data request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            ErrorLogger::log_authentication_error(
                'User lacks admin capability for extract_data request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Get and validate input parameters
        $source_url = isset( $_POST['source_url'] ) ? esc_url_raw( wp_unslash( $_POST['source_url'] ) ) : '';
        $post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
        $auth_method = isset( $_POST['auth_method'] ) ? sanitize_text_field( wp_unslash( $_POST['auth_method'] ) ) : 'public';
        $username = isset( $_POST['username'] ) ? sanitize_text_field( wp_unslash( $_POST['username'] ) ) : '';
        $password = isset( $_POST['password'] ) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';

        // Validate required fields
        if ( empty( $source_url ) || empty( $post_id ) ) {
            ErrorLogger::log_validation_error(
                'Missing required parameters for extract_data',
                array(
                    'source_url' => $source_url ? 'present' : 'missing',
                    'post_id'    => $post_id,
                )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'پارامترهای الزامی وارد نشده‌اند', 'elementor-copier' ),
                ),
                400
            );
        }

        if ( ! $this->get_auth()->validate_url( $source_url ) ) {
            ErrorLogger::log_validation_error(
                'Invalid source URL provided',
                array( 'source_url' => $source_url )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'آدرس سایت نامعتبر است', 'elementor-copier' ),
                ),
                400
            );
        }

        // Prepare authentication credentials
        $auth = array();
        if ( $auth_method === 'credentials' && ! empty( $username ) && ! empty( $password ) ) {
            $auth = array(
                'username' => $username,
                'password' => $password,
            );
        }

        try {
            ErrorLogger::log_info(
                'Starting extract_data operation',
                ErrorLogger::CATEGORY_EXPORT,
                array(
                    'source_url'  => $source_url,
                    'post_id'     => $post_id,
                    'auth_method' => $auth_method,
                )
            );

            // Create source connector
            $connector = new SourceConnector();

            // Connect to source site
            $connection_result = $connector->connect( $source_url, $auth );

            if ( ! $connection_result ) {
                $test_result = $connector->test_connection();
                
                if ( ! $test_result['success'] ) {
                    ErrorLogger::log_connection_error(
                        'Connection failed during extract_data',
                        array(
                            'source_url' => $source_url,
                            'post_id'    => $post_id,
                            'error'      => $test_result['error'] ?? array(),
                        )
                    );
                    
                    wp_send_json_error(
                        array(
                            'message' => $test_result['error']['message'] ?? __( 'اتصال به سایت مبدا برقرار نشد', 'elementor-copier' ),
                            'error'   => $test_result['error'] ?? array(),
                        ),
                        500
                    );
                }
            }

            // Extract Elementor data
            ErrorLogger::log_info(
                'Extracting Elementor data from post',
                ErrorLogger::CATEGORY_EXPORT,
                array(
                    'source_url' => $source_url,
                    'post_id'    => $post_id,
                    'method'     => $connector->get_extraction_method(),
                )
            );

            $result = $connector->get_elementor_data( $post_id );

            if ( ! $result['success'] ) {
                ErrorLogger::log_export_error(
                    'Failed to extract Elementor data: ' . ( $result['error']['message'] ?? 'Unknown error' ),
                    array(
                        'source_url' => $source_url,
                        'post_id'    => $post_id,
                        'error'      => $result['error'] ?? array(),
                    )
                );
                
                wp_send_json_error(
                    array(
                        'message' => $result['error']['message'] ?? __( 'خطا در استخراج داده المنتور', 'elementor-copier' ),
                        'error'   => $result['error'] ?? array(),
                    ),
                    500
                );
            }

            ErrorLogger::log_info(
                'Elementor data extracted successfully',
                ErrorLogger::CATEGORY_EXPORT,
                array(
                    'source_url'   => $source_url,
                    'post_id'      => $post_id,
                    'data_size'    => strlen( wp_json_encode( $result['data'] ) ),
                    'element_count' => is_array( $result['data'] ) ? count( $result['data'] ) : 0,
                )
            );

            wp_send_json_success(
                array(
                    'message'           => __( 'داده المنتور با موفقیت استخراج شد', 'elementor-copier' ),
                    'data'              => $result['data'],
                    'post_id'           => $post_id,
                    'source_url'        => $source_url,
                    'extraction_method' => $connector->get_extraction_method(),
                )
            );

        } catch ( \Exception $e ) {
            ErrorLogger::log(
                'Exception during extract_data: ' . $e->getMessage(),
                ErrorLogger::CATEGORY_EXPORT,
                ErrorLogger::LEVEL_ERROR,
                array(
                    'exception'  => get_class( $e ),
                    'file'       => $e->getFile(),
                    'line'       => $e->getLine(),
                    'source_url' => $source_url,
                    'post_id'    => $post_id,
                )
            );
            
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'خطا در استخراج داده: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Handle get local pages AJAX request
     *
     * Retrieves Elementor-enabled pages from the local site.
     */
    public function handle_get_local_pages() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        try {
            // Check if Elementor is active
            if ( ! did_action( 'elementor/loaded' ) ) {
                wp_send_json_error(
                    array(
                        'message' => __( 'Elementor is not active. Please install and activate Elementor.', 'elementor-copier' ),
                    ),
                    500
                );
            }

            // Get all pages and posts with Elementor data
            $args = array(
                'post_type'      => array( 'page', 'post' ),
                'post_status'    => array( 'publish', 'draft' ),
                'posts_per_page' => -1,
                'meta_query'     => array(
                    array(
                        'key'     => '_elementor_edit_mode',
                        'value'   => 'builder',
                        'compare' => '=',
                    ),
                ),
                'orderby'        => 'title',
                'order'          => 'ASC',
            );

            $query = new \WP_Query( $args );
            $pages = array();

            if ( $query->have_posts() ) {
                while ( $query->have_posts() ) {
                    $query->the_post();
                    $pages[] = array(
                        'id'    => get_the_ID(),
                        'title' => get_the_title(),
                        'type'  => get_post_type(),
                    );
                }
                wp_reset_postdata();
            }

            wp_send_json_success(
                array(
                    'pages'   => $pages,
                    'message' => __( 'Pages retrieved successfully.', 'elementor-copier' ),
                )
            );

        } catch ( \Exception $e ) {
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'Failed to retrieve pages: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Handle import content AJAX request
     *
     * Extracts content from source site and imports to local site with target selection.
     */
    public function handle_import_content() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Get and validate input parameters
        $source_url    = isset( $_POST['source_url'] ) ? esc_url_raw( wp_unslash( $_POST['source_url'] ) ) : '';
        $post_id       = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
        $element_type  = isset( $_POST['element_type'] ) ? sanitize_text_field( wp_unslash( $_POST['element_type'] ) ) : '';
        $element_id    = isset( $_POST['element_id'] ) ? sanitize_text_field( wp_unslash( $_POST['element_id'] ) ) : '';
        $section_id    = isset( $_POST['section_id'] ) ? sanitize_text_field( wp_unslash( $_POST['section_id'] ) ) : '';
        $auth_method   = isset( $_POST['auth_method'] ) ? sanitize_text_field( wp_unslash( $_POST['auth_method'] ) ) : 'public';
        $username      = isset( $_POST['username'] ) ? sanitize_text_field( wp_unslash( $_POST['username'] ) ) : '';
        $password      = isset( $_POST['password'] ) ? sanitize_text_field( wp_unslash( $_POST['password'] ) ) : '';
        $target_type   = isset( $_POST['target_type'] ) ? sanitize_text_field( wp_unslash( $_POST['target_type'] ) ) : 'new_page';

        // Validate required fields
        if ( empty( $source_url ) || empty( $post_id ) || empty( $element_type ) ) {
            wp_send_json_error(
                array(
                    'message' => __( 'Missing required parameters.', 'elementor-copier' ),
                ),
                400
            );
        }

        try {
            // Check if Elementor is active
            if ( ! did_action( 'elementor/loaded' ) ) {
                throw new \Exception( __( 'Elementor is not active. Please install and activate Elementor.', 'elementor-copier' ) );
            }

            // Create connector and extract data
            $connector = new SourceConnector();
            $auth_data = array(
                'method'   => $auth_method,
                'username' => $username,
                'password' => $password,
            );

            if ( ! $connector->connect( $source_url, $auth_data ) ) {
                throw new \Exception( __( 'Failed to connect to source site.', 'elementor-copier' ) );
            }

            // Extract the data based on element type
            $extracted_data = null;
            if ( 'page' === $element_type ) {
                $extracted_data = $connector->extract_page_data( $post_id );
            } elseif ( 'section' === $element_type && ! empty( $element_id ) ) {
                $extracted_data = $connector->extract_section_data( $post_id, $element_id );
            } elseif ( 'widget' === $element_type && ! empty( $element_id ) ) {
                $extracted_data = $connector->extract_widget_data( $post_id, $element_id, $section_id );
            }

            if ( empty( $extracted_data ) ) {
                throw new \Exception( __( 'Failed to extract data from source site.', 'elementor-copier' ) );
            }

            // Import based on target type
            $importer = new \ElementorCopier\Import\Importer();
            $result   = null;

            if ( 'new_page' === $target_type ) {
                $page_title = isset( $_POST['page_title'] ) ? sanitize_text_field( wp_unslash( $_POST['page_title'] ) ) : '';
                if ( empty( $page_title ) ) {
                    throw new \Exception( __( 'Page title is required.', 'elementor-copier' ) );
                }
                $result = $importer->create_new_page( $extracted_data, $page_title );

            } elseif ( 'existing_page' === $target_type ) {
                $page_id  = isset( $_POST['page_id'] ) ? intval( $_POST['page_id'] ) : 0;
                $position = isset( $_POST['position'] ) ? sanitize_text_field( wp_unslash( $_POST['position'] ) ) : 'bottom';
                
                if ( empty( $page_id ) ) {
                    throw new \Exception( __( 'Please select an existing page.', 'elementor-copier' ) );
                }

                // Import based on element type
                if ( 'page' === $element_type ) {
                    $result = $importer->import_page( $extracted_data, $page_id );
                } elseif ( 'section' === $element_type ) {
                    $result = $importer->import_section( $extracted_data, $page_id, $position );
                } elseif ( 'widget' === $element_type ) {
                    $result = $importer->import_widget( $extracted_data, $page_id, $position );
                }

            } elseif ( 'template' === $target_type ) {
                $template_title = isset( $_POST['template_title'] ) ? sanitize_text_field( wp_unslash( $_POST['template_title'] ) ) : '';
                $template_type  = isset( $_POST['template_type'] ) ? sanitize_text_field( wp_unslash( $_POST['template_type'] ) ) : 'page';
                
                if ( empty( $template_title ) ) {
                    throw new \Exception( __( 'Template title is required.', 'elementor-copier' ) );
                }
                $result = $importer->create_template( $extracted_data, $template_title, $template_type );
            }

            if ( is_wp_error( $result ) ) {
                throw new \Exception( $result->get_error_message() );
            }

            wp_send_json_success(
                array(
                    'message' => __( 'Content imported successfully!', 'elementor-copier' ),
                    'result'  => $result,
                )
            );

        } catch ( \Exception $e ) {
            ErrorLogger::log(
                'Exception during import_content: ' . $e->getMessage(),
                ErrorLogger::CATEGORY_IMPORT,
                ErrorLogger::LEVEL_ERROR,
                array(
                    'exception'  => get_class( $e ),
                    'file'       => $e->getFile(),
                    'line'       => $e->getLine(),
                    'source_url' => $source_url,
                    'post_id'    => $post_id,
                )
            );

            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'Import failed: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Handle paste from clipboard AJAX request
     *
     * Receives clipboard data from Chrome extension and imports it.
     */
    public function handle_paste_clipboard() {
        // Verify nonce
        if ( ! check_ajax_referer( 'elementor_copier_nonce', 'nonce', false ) ) {
            ErrorLogger::log_authentication_error(
                'Nonce verification failed for paste_clipboard request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'Security check failed. Please refresh the page and try again.', 'elementor-copier' ),
                ),
                403
            );
        }

        // Verify user capability
        if ( ! $this->get_auth()->verify_admin_capability() ) {
            ErrorLogger::log_authentication_error(
                'User lacks admin capability for paste_clipboard request',
                array( 'user_id' => get_current_user_id() )
            );
            wp_send_json_error(
                array(
                    'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' ),
                ),
                403
            );
        }

        try {
            // Get clipboard data
            $clipboard_data = isset( $_POST['clipboard_data'] ) ? wp_unslash( $_POST['clipboard_data'] ) : '';
            
            if ( empty( $clipboard_data ) ) {
                throw new \Exception( __( 'No clipboard data provided.', 'elementor-copier' ) );
            }

            // Parse JSON data
            $data = json_decode( $clipboard_data, true );
            
            if ( json_last_error() !== JSON_ERROR_NONE ) {
                throw new \Exception( __( 'Invalid JSON data in clipboard.', 'elementor-copier' ) );
            }

            // Validate clipboard data structure
            $validation_result = $this->validate_clipboard_data( $data );
            if ( is_wp_error( $validation_result ) ) {
                throw new \Exception( $validation_result->get_error_message() );
            }

            // Get target selection
            $target_type = isset( $_POST['target_type'] ) ? sanitize_text_field( wp_unslash( $_POST['target_type'] ) ) : 'existing_page';
            $download_media = isset( $_POST['download_media'] ) && '1' === $_POST['download_media'];

            // Validate target type
            if ( ! in_array( $target_type, array( 'new_page', 'existing_page', 'template' ), true ) ) {
                throw new \Exception( __( 'Invalid target type.', 'elementor-copier' ) );
            }

            // Get target-specific parameters
            $target_page_id = 0;
            $position = 'bottom';
            $page_title = '';
            $template_title = '';
            $template_type = 'page';

            if ( 'new_page' === $target_type ) {
                $page_title = isset( $_POST['page_title'] ) ? sanitize_text_field( wp_unslash( $_POST['page_title'] ) ) : '';
                if ( empty( $page_title ) ) {
                    throw new \Exception( __( 'Page title is required for new page creation.', 'elementor-copier' ) );
                }
            } elseif ( 'existing_page' === $target_type ) {
                $target_page_id = isset( $_POST['target_page_id'] ) ? intval( $_POST['target_page_id'] ) : 0;
                $position = isset( $_POST['position'] ) ? sanitize_text_field( wp_unslash( $_POST['position'] ) ) : 'bottom';
                
                if ( empty( $target_page_id ) ) {
                    throw new \Exception( __( 'Target page ID is required.', 'elementor-copier' ) );
                }
                
                // Validate position
                if ( ! in_array( $position, array( 'top', 'bottom', 'replace' ), true ) ) {
                    $position = 'bottom';
                }
            } elseif ( 'template' === $target_type ) {
                $template_title = isset( $_POST['template_title'] ) ? sanitize_text_field( wp_unslash( $_POST['template_title'] ) ) : '';
                $template_type = isset( $_POST['template_type'] ) ? sanitize_text_field( wp_unslash( $_POST['template_type'] ) ) : 'page';
                
                if ( empty( $template_title ) ) {
                    throw new \Exception( __( 'Template title is required for template creation.', 'elementor-copier' ) );
                }
                
                // Validate template type
                if ( ! in_array( $template_type, array( 'page', 'section' ), true ) ) {
                    $template_type = 'page';
                }
            }

            ErrorLogger::log_info(
                'Processing paste from clipboard',
                ErrorLogger::CATEGORY_IMPORT,
                array(
                    'element_type'   => $data['elementType'],
                    'target_type'    => $target_type,
                    'target_page_id' => $target_page_id,
                    'page_title'     => $page_title,
                    'template_title' => $template_title,
                    'position'       => $position,
                    'download_media' => $download_media,
                    'media_count'    => ! empty( $data['media'] ) ? count( $data['media'] ) : 0,
                )
            );

            // Handle target creation based on type
            if ( 'new_page' === $target_type ) {
                // Create new page
                $new_page_id = wp_insert_post(
                    array(
                        'post_title'  => $page_title,
                        'post_status' => 'draft',
                        'post_type'   => 'page',
                    )
                );

                if ( is_wp_error( $new_page_id ) ) {
                    throw new \Exception( $new_page_id->get_error_message() );
                }

                $target_page_id = $new_page_id;
                $position = 'replace'; // For new pages, always replace (empty content)

                // Enable Elementor for this page
                update_post_meta( $target_page_id, '_elementor_edit_mode', 'builder' );

                ErrorLogger::log_info(
                    'Created new page for paste',
                    ErrorLogger::CATEGORY_IMPORT,
                    array(
                        'page_id'    => $target_page_id,
                        'page_title' => $page_title,
                    )
                );
            } elseif ( 'template' === $target_type ) {
                // Create new template
                $template_id = wp_insert_post(
                    array(
                        'post_title'  => $template_title,
                        'post_status' => 'publish',
                        'post_type'   => 'elementor_library',
                        'meta_input'  => array(
                            '_elementor_edit_mode'     => 'builder',
                            '_elementor_template_type' => $template_type,
                        ),
                    )
                );

                if ( is_wp_error( $template_id ) ) {
                    throw new \Exception( $template_id->get_error_message() );
                }

                $target_page_id = $template_id;
                $position = 'replace'; // For templates, always replace

                ErrorLogger::log_info(
                    'Created new template for paste',
                    ErrorLogger::CATEGORY_IMPORT,
                    array(
                        'template_id'    => $target_page_id,
                        'template_title' => $template_title,
                        'template_type'  => $template_type,
                    )
                );
            }

            // Import the data using Importer class
            $importer = new \ElementorCopier\Import\Importer();
            
            // Prepare payload in the format expected by Importer
            $payload = array(
                'type' => $data['elementType'], // widget, section, page
                'data' => $data['data'],
            );

            // Add media if present and download is enabled
            if ( $download_media && ! empty( $data['media'] ) ) {
                $payload['media'] = $data['media'];
            } elseif ( ! $download_media && ! empty( $data['media'] ) ) {
                // Log that media download was skipped
                ErrorLogger::log_info(
                    'Media download skipped by user',
                    ErrorLogger::CATEGORY_MEDIA,
                    array( 'media_count' => count( $data['media'] ) )
                );
            }

            // Import based on element type
            $result = null;
            $element_type = $data['elementType'];

            if ( 'page' === $element_type ) {
                $result = $importer->import_page( $payload, $target_page_id );
            } elseif ( 'section' === $element_type ) {
                $result = $importer->import_section( $payload, $target_page_id, $position );
            } elseif ( 'widget' === $element_type ) {
                $result = $importer->import_widget( $payload, $target_page_id, $position );
            } elseif ( 'column' === $element_type ) {
                // Treat column as section
                $result = $importer->import_section( $payload, $target_page_id, $position );
            } else {
                throw new \Exception( 
                    sprintf(
                        /* translators: %s: element type */
                        __( 'Unsupported element type: %s', 'elementor-copier' ),
                        $element_type
                    )
                );
            }

            if ( is_wp_error( $result ) ) {
                throw new \Exception( $result->get_error_message() );
            }

            // Get media download results if applicable
            $media_results = null;
            if ( $download_media && ! empty( $data['media'] ) ) {
                $media_results = $importer->get_media_results();
            }

            ErrorLogger::log_info(
                'Clipboard data imported successfully',
                ErrorLogger::CATEGORY_IMPORT,
                array(
                    'element_type'   => $element_type,
                    'target_page_id' => $target_page_id,
                    'result'         => $result,
                    'media_results'  => $media_results,
                )
            );

            // Get edit URL for the target page
            $edit_url = get_edit_post_link( $target_page_id, 'raw' );
            if ( $edit_url ) {
                $edit_url = add_query_arg( 'action', 'elementor', $edit_url );
            }

            // Build success message based on target type
            if ( 'new_page' === $target_type ) {
                $message = sprintf(
                    /* translators: %s: page title */
                    __( 'Content imported successfully to new page "%s"!', 'elementor-copier' ),
                    $page_title
                );
            } elseif ( 'template' === $target_type ) {
                $message = sprintf(
                    /* translators: %s: template title */
                    __( 'Content imported successfully to new template "%s"!', 'elementor-copier' ),
                    $template_title
                );
            } else {
                $message = __( 'Content imported successfully from clipboard!', 'elementor-copier' );
            }
            
            $response_data = array(
                'message'  => $message,
                'result'   => $result,
                'edit_url' => $edit_url,
            );

            // Add media results if available
            if ( $media_results ) {
                $response_data['media_results'] = $media_results;
            }

            wp_send_json_success( $response_data );

        } catch ( \Exception $e ) {
            ErrorLogger::log(
                'Exception during paste_clipboard: ' . $e->getMessage(),
                ErrorLogger::CATEGORY_IMPORT,
                ErrorLogger::LEVEL_ERROR,
                array(
                    'exception' => get_class( $e ),
                    'file'      => $e->getFile(),
                    'line'      => $e->getLine(),
                )
            );

            wp_send_json_error(
                array(
                    'message' => sprintf(
                        /* translators: %s: error message */
                        __( 'Import failed: %s', 'elementor-copier' ),
                        $e->getMessage()
                    ),
                ),
                500
            );
        }
    }

    /**
     * Validate clipboard data structure
     *
     * @param array $data Clipboard data.
     * @return true|\WP_Error True if valid, WP_Error otherwise.
     */
    private function validate_clipboard_data( $data ) {
        // Check if data is an array
        if ( ! is_array( $data ) ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid clipboard data: data must be an object.', 'elementor-copier' )
            );
        }

        // Check for required fields
        $required_fields = array( 'version', 'type', 'elementType', 'data' );
        foreach ( $required_fields as $field ) {
            if ( ! isset( $data[ $field ] ) ) {
                return new \WP_Error(
                    'invalid_data',
                    sprintf(
                        /* translators: %s: field name */
                        __( 'Invalid clipboard data: missing required field "%s".', 'elementor-copier' ),
                        $field
                    )
                );
            }
        }

        // Verify type is elementor-copier
        if ( 'elementor-copier' !== $data['type'] ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid clipboard data: not Elementor Copier format.', 'elementor-copier' )
            );
        }

        // Verify elementType is valid
        $valid_types = array( 'widget', 'section', 'column', 'page' );
        if ( ! in_array( $data['elementType'], $valid_types, true ) ) {
            return new \WP_Error(
                'invalid_data',
                sprintf(
                    /* translators: %s: element type */
                    __( 'Invalid element type: %s. Must be widget, section, column, or page.', 'elementor-copier' ),
                    $data['elementType']
                )
            );
        }

        // Validate data structure
        if ( ! is_array( $data['data'] ) ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid clipboard data: data field must be an object.', 'elementor-copier' )
            );
        }

        // For widgets and sections, check for elType
        if ( in_array( $data['elementType'], array( 'widget', 'section', 'column' ), true ) ) {
            if ( ! isset( $data['data']['elType'] ) ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid element data: missing elType field.', 'elementor-copier' )
                );
            }
        }

        // For pages, data should be an array of elements
        if ( 'page' === $data['elementType'] ) {
            if ( ! is_array( $data['data'] ) || empty( $data['data'] ) ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid page data: must be a non-empty array of elements.', 'elementor-copier' )
                );
            }
        }

        ErrorLogger::log_debug(
            'Clipboard data validation passed',
            ErrorLogger::CATEGORY_IMPORT,
            array(
                'element_type' => $data['elementType'],
                'has_media'    => ! empty( $data['media'] ),
            )
        );

        return true;
    }
}



