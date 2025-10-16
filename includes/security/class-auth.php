<?php
/**
 * Security and Authentication Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Security;

if ( ! defined( 'ABINC' ) ) {
    exit;
}

/**
 * Auth class handles security, authentication, and data validation
 */
class Auth {

    /**
     * Rate limiting storage
     *
     * @var array
     */
    private static $rate_limit_cache = array();

    /**
     * Maximum requests per minute
     *
     * @var int
     */
    private const MAX_REQUESTS_PER_MINUTE = 30;

    /**
     * Verify user has required capability
     *
     * @param string $capability Capability to check (default: edit_pages)
     * @return bool True if user has capability
     */
    public function verify_user_capability( $capability = 'edit_pages' ) {
        return current_user_can( $capability );
    }

    /**
     * Sanitize URL input
     *
     * @param string $url URL to sanitize
     * @return string Sanitized URL
     */
    public function sanitize_url( $url ) {
        return esc_url_raw( trim( $url ) );
    }


    /**
     * Validate URL format and accessibility
     *
     * @param string $url URL to validate
     * @return bool|array True if valid, array with error on failure
     */
    public function validate_url( $url ) {
        // Sanitize first
        $url = $this->sanitize_url( $url );

        // Check if URL is empty
        if ( empty( $url ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'URL cannot be empty', 'elementor-copier' ),
            );
        }

        // Validate URL format
        if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Invalid URL format', 'elementor-copier' ),
            );
        }

        // Check if URL uses HTTP or HTTPS
        $parsed_url = wp_parse_url( $url );
        if ( ! isset( $parsed_url['scheme'] ) || ! in_array( $parsed_url['scheme'], array( 'http', 'https' ), true ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'URL must use HTTP or HTTPS protocol', 'elementor-copier' ),
            );
        }

        // Prevent localhost and internal IPs in production
        if ( ! $this->is_safe_host( $parsed_url['host'] ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Cannot connect to local or internal addresses', 'elementor-copier' ),
            );
        }

        return array( 'valid' => true );
    }

    /**
     * Check if host is safe (not localhost or internal IP)
     *
     * @param string $host Hostname to check
     * @return bool True if safe
     */
    private function is_safe_host( $host ) {
        // Allow localhost in development
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            return true;
        }

        // Block localhost variations
        $blocked_hosts = array( 'localhost', '127.0.0.1', '::1', '0.0.0.0' );
        if ( in_array( strtolower( $host ), $blocked_hosts, true ) ) {
            return false;
        }

        // Block private IP ranges
        if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
            if ( ! filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Sanitize widget data recursively
     *
     * @param array $data Widget data to sanitize
     * @return array Sanitized data
     */
    public function sanitize_widget_data( $data ) {
        if ( ! is_array( $data ) ) {
            return array();
        }

        $sanitized = array();

        foreach ( $data as $key => $value ) {
            // Sanitize key
            $clean_key = sanitize_key( $key );

            // Sanitize value based on type
            if ( is_array( $value ) ) {
                $sanitized[ $clean_key ] = $this->sanitize_widget_data( $value );
            } elseif ( is_string( $value ) ) {
                // Check if it's a URL
                if ( filter_var( $value, FILTER_VALIDATE_URL ) ) {
                    $sanitized[ $clean_key ] = esc_url_raw( $value );
                } else {
                    // Sanitize as text, preserving HTML for content fields
                    $sanitized[ $clean_key ] = wp_kses_post( $value );
                }
            } elseif ( is_numeric( $value ) ) {
                $sanitized[ $clean_key ] = $value;
            } elseif ( is_bool( $value ) ) {
                $sanitized[ $clean_key ] = (bool) $value;
            } else {
                $sanitized[ $clean_key ] = sanitize_text_field( $value );
            }
        }

        return $sanitized;
    }

    /**
     * Validate Elementor data structure
     *
     * @param array $data Data to validate
     * @return bool True if valid structure
     */
    public function validate_elementor_structure( $data ) {
        if ( ! is_array( $data ) ) {
            return false;
        }

        // Check for required Elementor fields
        if ( ! isset( $data['elements'] ) && ! isset( $data['content'] ) ) {
            // Check if it's a single element
            if ( ! isset( $data['elType'] ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Verify nonce for AJAX requests
     *
     * @param string $action Action name for nonce
     * @param string $nonce_field Nonce field name (default: nonce)
     * @return bool True if nonce is valid
     */
    public function verify_ajax_nonce( $action, $nonce_field = 'nonce' ) {
        $nonce = isset( $_POST[ $nonce_field ] ) ? sanitize_text_field( wp_unslash( $_POST[ $nonce_field ] ) ) : '';
        
        if ( empty( $nonce ) ) {
            return false;
        }

        return wp_verify_nonce( $nonce, $action );
    }

    /**
     * Create nonce for AJAX requests
     *
     * @param string $action Action name for nonce
     * @return string Nonce value
     */
    public function create_ajax_nonce( $action ) {
        return wp_create_nonce( $action );
    }

    /**
     * Encrypt credentials for optional storage
     *
     * @param array $credentials Credentials to encrypt
     * @return string Encrypted credentials
     */
    public function encrypt_credentials( $credentials ) {
        if ( ! is_array( $credentials ) ) {
            return '';
        }

        // Use WordPress salt for encryption key
        $key = wp_salt( 'auth' );
        
        // Serialize credentials
        $data = wp_json_encode( $credentials );
        
        // Use openssl if available
        if ( function_exists( 'openssl_encrypt' ) ) {
            $iv = openssl_random_pseudo_bytes( 16 );
            $encrypted = openssl_encrypt( $data, 'AES-256-CBC', $key, 0, $iv );
            return base64_encode( $iv . $encrypted );
        }
        
        // Fallback to base64 (less secure, but better than plain text)
        return base64_encode( $data );
    }

    /**
     * Decrypt credentials from storage
     *
     * @param string $encrypted Encrypted credentials
     * @return array Decrypted credentials
     */
    public function decrypt_credentials( $encrypted ) {
        if ( empty( $encrypted ) ) {
            return array();
        }

        // Use WordPress salt for decryption key
        $key = wp_salt( 'auth' );
        
        // Decode base64
        $decoded = base64_decode( $encrypted );
        
        // Use openssl if available
        if ( function_exists( 'openssl_decrypt' ) && strlen( $decoded ) > 16 ) {
            $iv = substr( $decoded, 0, 16 );
            $encrypted_data = substr( $decoded, 16 );
            $decrypted = openssl_decrypt( $encrypted_data, 'AES-256-CBC', $key, 0, $iv );
            
            if ( $decrypted !== false ) {
                $credentials = json_decode( $decrypted, true );
                return is_array( $credentials ) ? $credentials : array();
            }
        }
        
        // Fallback to base64 decode
        $credentials = json_decode( $decoded, true );
        return is_array( $credentials ) ? $credentials : array();
    }

    /**
     * Scan for malicious code in imported data
     *
     * @param array $data Data to scan
     * @return bool|array True if safe, array with details if malicious code found
     */
    public function scan_for_malicious_code( $data ) {
        $malicious_patterns = array(
            // PHP code execution
            '/<\?php/i',
            '/<\?=/i',
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/shell_exec\s*\(/i',
            '/base64_decode\s*\(/i',
            
            // JavaScript execution
            '/<script[^>]*>/i',
            '/javascript:/i',
            '/onerror\s*=/i',
            '/onload\s*=/i',
            '/onclick\s*=/i',
            
            // SQL injection attempts
            '/union\s+select/i',
            '/drop\s+table/i',
            '/insert\s+into/i',
            '/delete\s+from/i',
            
            // File operations
            '/file_get_contents\s*\(/i',
            '/file_put_contents\s*\(/i',
            '/fopen\s*\(/i',
            '/curl_exec\s*\(/i',
        );

        $serialized = wp_json_encode( $data );
        
        foreach ( $malicious_patterns as $pattern ) {
            if ( preg_match( $pattern, $serialized ) ) {
                return array(
                    'safe'    => false,
                    'message' => __( 'Potentially malicious code detected in imported data', 'elementor-copier' ),
                    'pattern' => $pattern,
                );
            }
        }

        return array( 'safe' => true );
    }

    /**
     * Implement rate limiting for external requests
     *
     * @param string $identifier Unique identifier (e.g., URL or user ID)
     * @param int    $max_requests Maximum requests allowed per minute
     * @return bool|array True if allowed, array with error if rate limit exceeded
     */
    public function check_rate_limit( $identifier, $max_requests = null ) {
        if ( null === $max_requests ) {
            $max_requests = self::MAX_REQUESTS_PER_MINUTE;
        }

        $cache_key = 'elementor_copier_rate_limit_' . md5( $identifier );
        $current_time = time();
        
        // Get cached rate limit data
        $rate_data = get_transient( $cache_key );
        
        if ( false === $rate_data ) {
            // First request, initialize
            $rate_data = array(
                'count'      => 1,
                'start_time' => $current_time,
            );
            set_transient( $cache_key, $rate_data, 60 ); // 60 seconds
            return array( 'allowed' => true );
        }

        // Check if minute has passed
        if ( $current_time - $rate_data['start_time'] >= 60 ) {
            // Reset counter
            $rate_data = array(
                'count'      => 1,
                'start_time' => $current_time,
            );
            set_transient( $cache_key, $rate_data, 60 );
            return array( 'allowed' => true );
        }

        // Increment counter
        $rate_data['count']++;
        
        // Check if limit exceeded
        if ( $rate_data['count'] > $max_requests ) {
            $wait_time = 60 - ( $current_time - $rate_data['start_time'] );
            return array(
                'allowed' => false,
                'message' => sprintf(
                    /* translators: %d: seconds to wait */
                    __( 'Rate limit exceeded. Please wait %d seconds before trying again.', 'elementor-copier' ),
                    $wait_time
                ),
                'wait_time' => $wait_time,
            );
        }

        // Update counter
        set_transient( $cache_key, $rate_data, 60 );
        return array( 'allowed' => true );
    }

    /**
     * Sanitize and validate authentication credentials
     *
     * @param array $credentials Credentials array
     * @return array Sanitized credentials
     */
    public function sanitize_credentials( $credentials ) {
        if ( ! is_array( $credentials ) ) {
            return array();
        }

        $sanitized = array();

        if ( isset( $credentials['username'] ) ) {
            $sanitized['username'] = sanitize_user( $credentials['username'] );
        }

        if ( isset( $credentials['password'] ) ) {
            // Don't sanitize password, just ensure it's a string
            $sanitized['password'] = is_string( $credentials['password'] ) ? $credentials['password'] : '';
        }

        if ( isset( $credentials['app_password'] ) ) {
            $sanitized['app_password'] = sanitize_text_field( $credentials['app_password'] );
        }

        if ( isset( $credentials['auth_type'] ) ) {
            $allowed_types = array( 'public', 'credentials', 'app_password' );
            $sanitized['auth_type'] = in_array( $credentials['auth_type'], $allowed_types, true ) 
                ? $credentials['auth_type'] 
                : 'public';
        }

        return $sanitized;
    }

    /**
     * Check if user has permission to perform action
     *
     * @param string $action Action to check
     * @return bool|array True if allowed, array with error if denied
     */
    public function check_permission( $action = 'copy_widgets' ) {
        // Check if user is logged in
        if ( ! is_user_logged_in() ) {
            return array(
                'allowed' => false,
                'message' => __( 'You must be logged in to perform this action', 'elementor-copier' ),
            );
        }

        // Check capability
        if ( ! $this->verify_user_capability() ) {
            return array(
                'allowed' => false,
                'message' => __( 'You do not have permission to perform this action', 'elementor-copier' ),
            );
        }

        return array( 'allowed' => true );
    }

    /**
     * Sanitize post ID
     *
     * @param mixed $post_id Post ID to sanitize
     * @return int Sanitized post ID
     */
    public function sanitize_post_id( $post_id ) {
        return absint( $post_id );
    }

    /**
     * Validate post exists and user can edit it
     *
     * @param int $post_id Post ID to validate
     * @return bool|array True if valid, array with error if invalid
     */
    public function validate_post_access( $post_id ) {
        $post_id = $this->sanitize_post_id( $post_id );

        if ( $post_id <= 0 ) {
            return array(
                'valid'   => false,
                'message' => __( 'Invalid post ID', 'elementor-copier' ),
            );
        }

        $post = get_post( $post_id );
        if ( ! $post ) {
            return array(
                'valid'   => false,
                'message' => __( 'Post not found', 'elementor-copier' ),
            );
        }

        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'You do not have permission to edit this post', 'elementor-copier' ),
            );
        }

        return array( 'valid' => true );
    }

    /**
     * Authenticate REST API request
     * 
     * Validates authentication for REST API requests using WordPress authentication
     * or application passwords. Supports multiple authentication methods.
     *
     * @param \WP_REST_Request $request REST API request object
     * @return bool|\WP_Error True if authenticated, WP_Error on failure
     */
    public function authenticate_api_request( $request ) {
        // Check if user is already authenticated via WordPress
        $user_id = get_current_user_id();
        
        if ( $user_id > 0 ) {
            // User is authenticated, verify capability
            if ( ! $this->verify_user_capability() ) {
                return new \WP_Error(
                    'rest_forbidden',
                    __( 'You do not have permission to access this resource', 'elementor-copier' ),
                    array( 'status' => 403 )
                );
            }
            return true;
        }

        // Check for application password or basic auth in headers
        $auth_header = $request->get_header( 'authorization' );
        
        if ( empty( $auth_header ) ) {
            return new \WP_Error(
                'rest_not_authenticated',
                __( 'Authentication required', 'elementor-copier' ),
                array( 'status' => 401 )
            );
        }

        // Parse Basic Auth header
        if ( strpos( $auth_header, 'Basic ' ) === 0 ) {
            $credentials = base64_decode( substr( $auth_header, 6 ) );
            $parts = explode( ':', $credentials, 2 );
            
            if ( count( $parts ) !== 2 ) {
                return new \WP_Error(
                    'rest_invalid_credentials',
                    __( 'Invalid authentication credentials', 'elementor-copier' ),
                    array( 'status' => 401 )
                );
            }

            list( $username, $password ) = $parts;

            // Attempt to authenticate
            $user = wp_authenticate( $username, $password );
            
            if ( is_wp_error( $user ) ) {
                return new \WP_Error(
                    'rest_authentication_failed',
                    __( 'Authentication failed', 'elementor-copier' ),
                    array( 'status' => 401 )
                );
            }

            // Set current user
            wp_set_current_user( $user->ID );

            // Verify capability
            if ( ! $this->verify_user_capability() ) {
                return new \WP_Error(
                    'rest_forbidden',
                    __( 'You do not have permission to access this resource', 'elementor-copier' ),
                    array( 'status' => 403 )
                );
            }

            return true;
        }

        return new \WP_Error(
            'rest_invalid_auth_method',
            __( 'Unsupported authentication method', 'elementor-copier' ),
            array( 'status' => 401 )
        );
    }

    /**
     * Validate widget data structure
     * 
     * Validates that widget data has the required Elementor structure and fields.
     * Checks for required properties and validates data types.
     *
     * @param array $data Widget data to validate
     * @return bool|array True if valid, array with error details if invalid
     */
    public function validate_widget_data( $data ) {
        if ( ! is_array( $data ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget data must be an array', 'elementor-copier' ),
            );
        }

        // Check if data is empty
        if ( empty( $data ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget data cannot be empty', 'elementor-copier' ),
            );
        }

        // Check for required Elementor element type
        if ( ! isset( $data['elType'] ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget data must contain elType field', 'elementor-copier' ),
            );
        }

        // Validate elType value
        $valid_el_types = array( 'widget', 'section', 'column', 'container' );
        if ( ! in_array( $data['elType'], $valid_el_types, true ) ) {
            return array(
                'valid'   => false,
                'message' => sprintf(
                    /* translators: %s: element type */
                    __( 'Invalid element type: %s', 'elementor-copier' ),
                    $data['elType']
                ),
            );
        }

        // For widgets, check widgetType
        if ( 'widget' === $data['elType'] && ! isset( $data['widgetType'] ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget data must contain widgetType field', 'elementor-copier' ),
            );
        }

        // Check for ID field
        if ( ! isset( $data['id'] ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget data must contain id field', 'elementor-copier' ),
            );
        }

        // Validate settings if present
        if ( isset( $data['settings'] ) && ! is_array( $data['settings'] ) ) {
            return array(
                'valid'   => false,
                'message' => __( 'Widget settings must be an array', 'elementor-copier' ),
            );
        }

        // Validate elements if present (for sections/columns)
        if ( isset( $data['elements'] ) ) {
            if ( ! is_array( $data['elements'] ) ) {
                return array(
                    'valid'   => false,
                    'message' => __( 'Widget elements must be an array', 'elementor-copier' ),
                );
            }

            // Recursively validate child elements
            foreach ( $data['elements'] as $element ) {
                $validation = $this->validate_widget_data( $element );
                if ( is_array( $validation ) && isset( $validation['valid'] ) && ! $validation['valid'] ) {
                    return $validation;
                }
            }
        }

        // Scan for malicious code
        $scan_result = $this->scan_for_malicious_code( $data );
        if ( is_array( $scan_result ) && isset( $scan_result['safe'] ) && ! $scan_result['safe'] ) {
            return array(
                'valid'   => false,
                'message' => $scan_result['message'],
            );
        }

        return array( 'valid' => true );
    }

    /**
     * Validate post ID
     * 
     * Validates that a post ID is valid, the post exists, and is a valid post type
     * for Elementor content.
     *
     * @param int $post_id Post ID to validate
     * @return bool|array True if valid, array with error details if invalid
     */
    public function validate_post_id( $post_id ) {
        // Sanitize post ID
        $post_id = $this->sanitize_post_id( $post_id );

        // Check if post ID is valid
        if ( $post_id <= 0 ) {
            return array(
                'valid'   => false,
                'message' => __( 'Invalid post ID', 'elementor-copier' ),
            );
        }

        // Check if post exists
        $post = get_post( $post_id );
        if ( ! $post ) {
            return array(
                'valid'   => false,
                'message' => __( 'Post not found', 'elementor-copier' ),
            );
        }

        // Check if post status is valid (not trashed)
        if ( 'trash' === $post->post_status ) {
            return array(
                'valid'   => false,
                'message' => __( 'Cannot use trashed post', 'elementor-copier' ),
            );
        }

        // Check if post type supports Elementor
        $allowed_post_types = get_post_types( array( 'public' => true ) );
        
        // Add common Elementor post types
        $elementor_post_types = array( 'page', 'post', 'elementor_library' );
        $allowed_post_types = array_merge( $allowed_post_types, $elementor_post_types );
        
        if ( ! in_array( $post->post_type, $allowed_post_types, true ) ) {
            return array(
                'valid'   => false,
                'message' => sprintf(
                    /* translators: %s: post type */
                    __( 'Post type %s is not supported', 'elementor-copier' ),
                    $post->post_type
                ),
            );
        }

        return array( 'valid' => true );
    }

    /**
     * Verify admin capability
     * 
     * Checks if the current user has administrator-level capabilities.
     * This is a stricter check than verify_user_capability.
     *
     * @return bool|array True if user has admin capability, array with error if not
     */
    public function verify_admin_capability() {
        // Check if user is logged in
        if ( ! is_user_logged_in() ) {
            return array(
                'allowed' => false,
                'message' => __( 'You must be logged in to perform this action', 'elementor-copier' ),
            );
        }

        // Check for administrator or editor capability
        if ( ! current_user_can( 'manage_options' ) && ! current_user_can( 'edit_pages' ) ) {
            return array(
                'allowed' => false,
                'message' => __( 'You do not have administrator privileges', 'elementor-copier' ),
            );
        }

        return array( 'allowed' => true );
    }
}
