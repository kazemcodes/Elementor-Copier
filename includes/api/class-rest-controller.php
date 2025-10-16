<?php
/**
 * REST API Controller
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\API;

use ElementorCopier\Security\Auth;
use ElementorCopier\Import\Importer;
use ElementorCopier\ErrorLogger;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * RestController Class
 *
 * Handles REST API endpoints for importing widgets from remote sites.
 */
class RestController {

    /**
     * API namespace
     *
     * @var string
     */
    private $namespace = 'elementor-copier/v1';

    /**
     * Auth instance
     *
     * @var Auth
     */
    private $auth;

    /**
     * Importer instance
     *
     * @var Importer
     */
    private $importer;

    /**
     * Constructor
     */
    public function __construct() {
        $this->log( 'RestController constructor called - using lazy loading' );
        // Don't create instances here - lazy load them when needed
        $this->log( 'RestController constructor completed (lazy loading enabled)' );
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
     * Get Importer instance (lazy loading)
     */
    private function get_importer() {
        if ( null === $this->importer ) {
            $this->log( 'Lazy loading Importer instance...' );
            $this->importer = new Importer();
            $this->log( 'Importer instance created' );
        }
        return $this->importer;
    }
    
    /**
     * Log helper function
     */
    private function log( $message, $level = 'INFO' ) {
        $log_file = WP_CONTENT_DIR . '/elementor-copier-debug.log';
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[{$timestamp}] [RestController] [{$level}] {$message}\n";
        error_log( $log_message, 3, $log_file );
    }

    /**
     * Register REST API routes
     *
     * @return void
     */
    public function register_routes() {
        // Import endpoint
        register_rest_route(
            $this->namespace,
            '/import',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'import_endpoint' ),
                'permission_callback' => array( $this, 'authenticate_request' ),
                'args'                => $this->get_import_endpoint_args(),
            )
        );

        // Health check endpoint
        register_rest_route(
            $this->namespace,
            '/status',
            array(
                'methods'             => \WP_REST_Server::READABLE,
                'callback'            => array( $this, 'health_check_endpoint' ),
                'permission_callback' => array( $this, 'authenticate_request' ),
            )
        );
    }

    /**
     * Get import endpoint arguments schema
     *
     * @return array Endpoint arguments.
     */
    private function get_import_endpoint_args() {
        return array(
            'type'           => array(
                'required'          => true,
                'type'              => 'string',
                'enum'              => array( 'widget', 'section', 'page' ),
                'description'       => __( 'Type of content to import (widget, section, or page).', 'elementor-copier' ),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => array( $this, 'validate_type' ),
            ),
            'data'           => array(
                'required'          => true,
                'type'              => 'object',
                'description'       => __( 'Elementor widget/section/page data in JSON format.', 'elementor-copier' ),
                'validate_callback' => array( $this, 'validate_data' ),
            ),
            'target_post_id' => array(
                'required'          => true,
                'type'              => 'integer',
                'description'       => __( 'Target post ID where content will be imported.', 'elementor-copier' ),
                'sanitize_callback' => 'absint',
                'validate_callback' => array( $this, 'validate_post_id' ),
            ),
            'position'       => array(
                'required'          => false,
                'type'              => 'string',
                'enum'              => array( 'top', 'bottom', 'replace' ),
                'default'           => 'bottom',
                'description'       => __( 'Position where content will be inserted (top, bottom, or replace).', 'elementor-copier' ),
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'options'        => array(
                'required'    => false,
                'type'        => 'object',
                'default'     => array(),
                'description' => __( 'Additional import options.', 'elementor-copier' ),
            ),
        );
    }

    /**
     * Import endpoint handler
     *
     * @param \WP_REST_Request $request The REST API request object.
     * @return \WP_REST_Response REST API response.
     */
    public function import_endpoint( $request ) {
        ErrorLogger::log_info(
            'Import request received',
            ErrorLogger::CATEGORY_IMPORT,
            array(
                'user_id' => get_current_user_id(),
                'ip'      => $request->get_header( 'X-Forwarded-For' ) ?: $_SERVER['REMOTE_ADDR'],
            )
        );

        // Validate the request
        $validation = $this->validate_import_request( $request );
        if ( is_wp_error( $validation ) ) {
            ErrorLogger::log_validation_error(
                'Import request validation failed: ' . $validation->get_error_message(),
                array(
                    'error_code' => $validation->get_error_code(),
                    'error_data' => $validation->get_error_data(),
                )
            );
            return $this->error_response( $validation );
        }

        // Get request parameters
        $type           = $request->get_param( 'type' );
        $data           = $request->get_param( 'data' );
        $target_post_id = $request->get_param( 'target_post_id' );
        $position       = $request->get_param( 'position' ) ?: 'bottom';
        $options        = $request->get_param( 'options' ) ?: array();

        // Sanitize the widget data
        $sanitized_data = $this->get_auth()->sanitize_widget_data( $data );

        // Check if Elementor is active
        if ( ! did_action( 'elementor/loaded' ) ) {
            $error = ErrorLogger::create_error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 500 ),
                ErrorLogger::CATEGORY_IMPORT
            );
            return $this->error_response( $error );
        }

        // Perform the import based on type
        try {
            $result = null;

            ErrorLogger::log_info(
                'Starting import operation',
                ErrorLogger::CATEGORY_IMPORT,
                array(
                    'type'           => $type,
                    'target_post_id' => $target_post_id,
                    'position'       => $position,
                )
            );

            switch ( $type ) {
                case 'widget':
                    $result = $this->get_importer()->import_widget( $sanitized_data, $target_post_id, $position );
                    break;

                case 'section':
                    $result = $this->get_importer()->import_section( $sanitized_data, $target_post_id, $position );
                    break;

                case 'page':
                    $result = $this->get_importer()->import_page( $sanitized_data, $target_post_id );
                    break;

                default:
                    $error = ErrorLogger::create_error(
                        'invalid_type',
                        sprintf(
                            /* translators: %s: provided type */
                            __( 'Invalid import type: %s', 'elementor-copier' ),
                            $type
                        ),
                        array( 'status' => 400 ),
                        ErrorLogger::CATEGORY_VALIDATION
                    );
                    return $this->error_response( $error );
            }

            // Check if import was successful
            if ( is_wp_error( $result ) ) {
                ErrorLogger::log_import_error(
                    'Import operation failed: ' . $result->get_error_message(),
                    array(
                        'type'           => $type,
                        'target_post_id' => $target_post_id,
                        'error_code'     => $result->get_error_code(),
                    )
                );
                return $this->error_response( $result );
            }

            ErrorLogger::log_info(
                'Import operation completed successfully',
                ErrorLogger::CATEGORY_IMPORT,
                array(
                    'type'           => $type,
                    'target_post_id' => $target_post_id,
                    'result'         => $result,
                )
            );

            // Return success response
            return $this->success_response(
                array(
                    'message'     => sprintf(
                        /* translators: %s: content type */
                        __( '%s imported successfully.', 'elementor-copier' ),
                        ucfirst( $type )
                    ),
                    'post_id'     => $target_post_id,
                    'import_data' => $result,
                ),
                201
            );

        } catch ( \Exception $e ) {
            $error = ErrorLogger::handle_exception( $e, ErrorLogger::CATEGORY_IMPORT );
            return $this->error_response( $error );
        }
    }

    /**
     * Health check endpoint handler
     *
     * @param \WP_REST_Request $request The REST API request object.
     * @return \WP_REST_Response REST API response.
     */
    public function health_check_endpoint( $request ) {
        // Check if Elementor is active
        $elementor_active = did_action( 'elementor/loaded' );

        // Get plugin version
        $plugin_version = defined( 'ELEMENTOR_COPIER_VERSION' ) ? ELEMENTOR_COPIER_VERSION : '1.0.0';

        // Get Elementor version if active
        $elementor_version = null;
        if ( $elementor_active && defined( 'ELEMENTOR_VERSION' ) ) {
            $elementor_version = ELEMENTOR_VERSION;
        }

        return $this->success_response(
            array(
                'status'            => 'ok',
                'message'           => __( 'Elementor Copier is active and ready.', 'elementor-copier' ),
                'plugin_version'    => $plugin_version,
                'elementor_active'  => $elementor_active,
                'elementor_version' => $elementor_version,
                'wordpress_version' => get_bloginfo( 'version' ),
                'php_version'       => phpversion(),
            )
        );
    }

    /**
     * Authenticate REST API request
     *
     * @param \WP_REST_Request $request The REST API request object.
     * @return bool|WP_Error True if authenticated, WP_Error otherwise.
     */
    public function authenticate_request( $request ) {
        $result = $this->get_auth()->authenticate_api_request( $request );
        
        if ( is_wp_error( $result ) ) {
            ErrorLogger::log_authentication_error(
                'API authentication failed: ' . $result->get_error_message(),
                array(
                    'error_code' => $result->get_error_code(),
                    'user_id'    => get_current_user_id(),
                    'endpoint'   => $request->get_route(),
                )
            );
        }
        
        return $result;
    }

    /**
     * Validate import request
     *
     * @param \WP_REST_Request $request The REST API request object.
     * @return bool|WP_Error True if valid, WP_Error otherwise.
     */
    public function validate_import_request( $request ) {
        // Validate type
        $type = $request->get_param( 'type' );
        if ( empty( $type ) ) {
            return new \WP_Error(
                'missing_type',
                __( 'Missing required parameter: type', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Validate data
        $data = $request->get_param( 'data' );
        if ( empty( $data ) || ! is_array( $data ) ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid or missing data parameter. Must be a valid JSON object.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Validate widget data structure
        $data_validation = $this->get_auth()->validate_widget_data( $data );
        if ( is_array( $data_validation ) && isset( $data_validation['valid'] ) && ! $data_validation['valid'] ) {
            return new \WP_Error(
                'invalid_widget_data',
                $data_validation['message'],
                array( 'status' => 400 )
            );
        }

        // Validate target post ID
        $target_post_id = $request->get_param( 'target_post_id' );
        if ( empty( $target_post_id ) ) {
            return new \WP_Error(
                'missing_post_id',
                __( 'Missing required parameter: target_post_id', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        $post_validation = $this->get_auth()->validate_post_id( $target_post_id );
        if ( is_array( $post_validation ) && isset( $post_validation['valid'] ) && ! $post_validation['valid'] ) {
            return new \WP_Error(
                'invalid_post_id',
                $post_validation['message'],
                array( 'status' => 400 )
            );
        }

        return true;
    }

    /**
     * Validate type parameter
     *
     * @param string           $value   The parameter value.
     * @param \WP_REST_Request $request The REST API request object.
     * @param string           $param   The parameter name.
     * @return bool True if valid, false otherwise.
     */
    public function validate_type( $value, $request, $param ) {
        $valid_types = array( 'widget', 'section', 'page' );
        return in_array( $value, $valid_types, true );
    }

    /**
     * Validate data parameter
     *
     * @param mixed            $value   The parameter value.
     * @param \WP_REST_Request $request The REST API request object.
     * @param string           $param   The parameter name.
     * @return bool True if valid, false otherwise.
     */
    public function validate_data( $value, $request, $param ) {
        return is_array( $value ) && ! empty( $value );
    }

    /**
     * Validate post ID parameter
     *
     * @param int              $value   The parameter value.
     * @param \WP_REST_Request $request The REST API request object.
     * @param string           $param   The parameter name.
     * @return bool True if valid, false otherwise.
     */
    public function validate_post_id( $value, $request, $param ) {
        $value = absint( $value );
        return $value > 0 && get_post( $value ) !== null;
    }

    /**
     * Create success response
     *
     * @param array $data   Response data.
     * @param int   $status HTTP status code.
     * @return \WP_REST_Response REST API response.
     */
    private function success_response( $data, $status = 200 ) {
        return new \WP_REST_Response(
            array(
                'success' => true,
                'data'    => $data,
            ),
            $status
        );
    }

    /**
     * Create error response
     *
     * @param \WP_Error $error WP_Error object.
     * @return \WP_REST_Response REST API response.
     */
    private function error_response( $error ) {
        $status = 500;
        
        // Get status from error data if available
        $error_data = $error->get_error_data();
        if ( is_array( $error_data ) && isset( $error_data['status'] ) ) {
            $status = $error_data['status'];
        }

        return new \WP_REST_Response(
            array(
                'success' => false,
                'error'   => array(
                    'code'    => $error->get_error_code(),
                    'message' => $error->get_error_message(),
                    'data'    => $error_data,
                ),
            ),
            $status
        );
    }
}
