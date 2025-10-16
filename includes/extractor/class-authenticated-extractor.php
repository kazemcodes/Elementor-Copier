<?php
/**
 * Authenticated Extractor Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Extractor;

use ElementorCopier\Security\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * AuthenticatedExtractor extracts Elementor data using WordPress authentication
 * Logs in to WordPress and uses cookie-based session to access protected content
 */
class AuthenticatedExtractor implements ExtractorInterface {

    /**
     * Source site URL
     *
     * @var string
     */
    private $source_url = '';

    /**
     * Authentication credentials
     *
     * @var array
     */
    private $auth = array();

    /**
     * Request timeout in seconds
     *
     * @var int
     */
    private $timeout = 30;

    /**
     * Last error information
     *
     * @var array
     */
    private $last_error = array();

    /**
     * Security handler
     *
     * @var Auth
     */
    private $auth_handler;

    /**
     * Authentication cookies
     *
     * @var array
     */
    private $cookies = array();

    /**
     * Whether user is authenticated
     *
     * @var bool
     */
    private $is_authenticated = false;

    /**
     * Session nonce for AJAX requests
     *
     * @var string
     */
    private $nonce = '';

    /**
     * Constructor
     *
     * @param string $source_url Source site URL.
     */
    public function __construct( string $source_url = '' ) {
        $this->auth_handler = new Auth();
        
        if ( ! empty( $source_url ) ) {
            $this->source_url = $this->auth_handler->sanitize_url( $source_url );
        }
    }

    /**
     * Check if this extractor can extract data from the given URL
     *
     * @param string $url Source site URL.
     * @return bool True if authentication is possible.
     */
    public function can_extract( string $url ): bool {
        $this->source_url = $this->auth_handler->sanitize_url( $url );
        
        if ( empty( $this->source_url ) ) {
            $this->set_error(
                'invalid_url',
                __( 'آدرس سایت نامعتبر است', 'elementor-copier' ),
                'Invalid URL'
            );
            return false;
        }

        // Check if credentials are provided
        if ( empty( $this->auth['username'] ) || empty( $this->auth['password'] ) ) {
            $this->set_error(
                'no_credentials',
                __( 'نام کاربری یا رمز عبور ارائه نشده است', 'elementor-copier' ),
                'No credentials provided'
            );
            return false;
        }

        // Try to authenticate
        return $this->authenticate();
    }

    /**
     * Authenticate with WordPress login
     *
     * @return bool True if authentication successful.
     */
    private function authenticate(): bool {
        if ( $this->is_authenticated ) {
            return true;
        }

        $login_url = trailingslashit( $this->source_url ) . 'wp-login.php';
        
        // Prepare login credentials
        $login_data = array(
            'log'         => $this->auth['username'],
            'pwd'         => $this->auth['password'],
            'rememberme'  => 'forever',
            'redirect_to' => trailingslashit( $this->source_url ) . 'wp-admin/',
        );

        // Perform login request
        $response = wp_remote_post(
            $login_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
                'body'      => $login_data,
                'headers'   => array(
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'login_request_failed',
                __( 'درخواست ورود به سیستم ناموفق بود', 'elementor-copier' ),
                'Login request failed',
                array( 'error' => $response->get_error_message() )
            );
            return false;
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        // WordPress login redirects on success (302) or shows login page again on failure (200)
        if ( $http_code !== 302 && $http_code !== 301 ) {
            $this->set_error(
                'authentication_failed',
                __( 'نام کاربری یا رمز عبور اشتباه است', 'elementor-copier' ),
                'Invalid username or password',
                array( 'http_code' => $http_code )
            );
            return false;
        }

        // Extract cookies from response
        $cookies = wp_remote_retrieve_cookies( $response );
        
        if ( empty( $cookies ) ) {
            $this->set_error(
                'no_cookies',
                __( 'کوکی‌های احراز هویت دریافت نشد', 'elementor-copier' ),
                'No authentication cookies received'
            );
            return false;
        }

        // Store cookies for subsequent requests
        $this->cookies = $cookies;
        $this->is_authenticated = true;

        // Try to get nonce for AJAX requests
        $this->fetch_nonce();

        return true;
    }

    /**
     * Fetch nonce for AJAX requests
     *
     * @return void
     */
    private function fetch_nonce(): void {
        // Try to get nonce from admin page
        $admin_url = trailingslashit( $this->source_url ) . 'wp-admin/';
        
        $response = wp_remote_get(
            $admin_url,
            array(
                'timeout'   => 15,
                'sslverify' => true,
                'cookies'   => $this->cookies,
            )
        );

        if ( is_wp_error( $response ) ) {
            return;
        }

        $body = wp_remote_retrieve_body( $response );
        
        // Try to extract nonce from inline scripts
        // Common nonce patterns in WordPress admin
        if ( preg_match( '/"nonce":"([^"]+)"/', $body, $matches ) ) {
            $this->nonce = $matches[1];
        } elseif ( preg_match( '/wpApiSettings\s*=\s*{[^}]*"nonce":"([^"]+)"/', $body, $matches ) ) {
            $this->nonce = $matches[1];
        }
    }

    /**
     * Get list of pages from source site
     *
     * @return array List of pages.
     */
    public function get_pages(): array {
        return $this->get_posts_by_type( 'page' );
    }

    /**
     * Get list of posts from source site
     *
     * @return array List of posts.
     */
    public function get_posts(): array {
        return $this->get_posts_by_type( 'post' );
    }

    /**
     * Get posts by type using authenticated REST API
     *
     * @param string $type Post type ('post' or 'page').
     * @return array List of posts/pages.
     */
    private function get_posts_by_type( string $type ): array {
        if ( ! $this->is_authenticated && ! $this->authenticate() ) {
            return array();
        }

        $endpoint = $type === 'page' ? 'pages' : 'posts';
        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2/' . $endpoint;
        
        // Add parameters to get more results including private posts
        $rest_url = add_query_arg(
            array(
                'per_page' => 100,
                'orderby'  => 'modified',
                'order'    => 'desc',
                'status'   => 'any', // Get all statuses with authentication
            ),
            $rest_url
        );

        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
                'cookies'   => $this->cookies,
                'headers'   => $this->get_auth_headers(),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'fetch_failed',
                sprintf( __( 'خطا در دریافت %s', 'elementor-copier' ), $type === 'page' ? __( 'صفحات', 'elementor-copier' ) : __( 'نوشته‌ها', 'elementor-copier' ) ),
                sprintf( 'Failed to fetch %s', $type ),
                array( 'error' => $response->get_error_message() )
            );
            return array();
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        if ( $http_code !== 200 ) {
            $this->set_error(
                'http_error',
                sprintf( __( 'خطای HTTP در دریافت %s: %d', 'elementor-copier' ), $type === 'page' ? __( 'صفحات', 'elementor-copier' ) : __( 'نوشته‌ها', 'elementor-copier' ), $http_code ),
                sprintf( 'HTTP Error fetching %s: %d', $type, $http_code ),
                array( 'http_code' => $http_code )
            );
            return array();
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );

        if ( ! is_array( $data ) ) {
            $this->set_error(
                'invalid_response',
                __( 'پاسخ نامعتبر از سرور', 'elementor-copier' ),
                'Invalid response from server'
            );
            return array();
        }

        $items = array();

        foreach ( $data as $item ) {
            $items[] = array(
                'id'     => $item['id'] ?? 0,
                'title'  => isset( $item['title']['rendered'] ) ? $item['title']['rendered'] : __( 'بدون عنوان', 'elementor-copier' ),
                'link'   => $item['link'] ?? '',
                'type'   => $type,
                'status' => $item['status'] ?? 'publish',
            );
        }

        return $items;
    }

    /**
     * Get Elementor data for a specific post/page
     *
     * @param int $post_id Post or page ID.
     * @return array Elementor data structure.
     */
    public function get_elementor_data( int $post_id ): array {
        if ( ! $this->is_authenticated && ! $this->authenticate() ) {
            return array();
        }

        if ( $post_id <= 0 ) {
            $this->set_error(
                'invalid_post_id',
                __( 'شناسه نوشته نامعتبر است', 'elementor-copier' ),
                'Invalid post ID'
            );
            return array();
        }

        // Try REST API first with authentication
        $elementor_data = $this->fetch_via_rest_api( $post_id );
        
        if ( ! empty( $elementor_data ) ) {
            return $elementor_data;
        }

        // Fallback to admin-ajax method
        $elementor_data = $this->fetch_via_admin_ajax( $post_id );
        
        if ( ! empty( $elementor_data ) ) {
            return $elementor_data;
        }

        $this->set_error(
            'no_elementor_data',
            __( 'داده المنتور در این نوشته یافت نشد', 'elementor-copier' ),
            'No Elementor data found in this post',
            array( 'post_id' => $post_id )
        );
        
        return array();
    }

    /**
     * Fetch Elementor data via authenticated REST API
     *
     * @param int $post_id Post ID.
     * @return array Elementor data.
     */
    private function fetch_via_rest_api( int $post_id ): array {
        // Try both posts and pages endpoints
        $endpoints = array(
            'posts/' . $post_id,
            'pages/' . $post_id,
        );

        foreach ( $endpoints as $endpoint ) {
            $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2/' . $endpoint;
            
            $response = wp_remote_get(
                $rest_url,
                array(
                    'timeout'   => $this->timeout,
                    'sslverify' => true,
                    'cookies'   => $this->cookies,
                    'headers'   => $this->get_auth_headers(),
                )
            );

            if ( is_wp_error( $response ) ) {
                continue;
            }

            $http_code = wp_remote_retrieve_response_code( $response );
            
            if ( $http_code === 200 ) {
                $body = wp_remote_retrieve_body( $response );
                $data = json_decode( $body, true );
                
                if ( is_array( $data ) && isset( $data['meta'] ) ) {
                    $elementor_data = $this->extract_elementor_from_meta( $data['meta'] );
                    
                    if ( ! empty( $elementor_data ) ) {
                        return $this->parse_and_validate_json( $elementor_data, $post_id );
                    }
                }
            }
        }

        return array();
    }

    /**
     * Fetch Elementor data via admin-ajax
     *
     * @param int $post_id Post ID.
     * @return array Elementor data.
     */
    private function fetch_via_admin_ajax( int $post_id ): array {
        $ajax_url = trailingslashit( $this->source_url ) . 'wp-admin/admin-ajax.php';
        
        // Try to get post meta via custom AJAX action
        $ajax_data = array(
            'action'  => 'elementor_get_document_config',
            'post_id' => $post_id,
        );

        if ( ! empty( $this->nonce ) ) {
            $ajax_data['_nonce'] = $this->nonce;
        }

        $response = wp_remote_post(
            $ajax_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
                'cookies'   => $this->cookies,
                'body'      => $ajax_data,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array();
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        if ( $http_code === 200 ) {
            $body = wp_remote_retrieve_body( $response );
            $data = json_decode( $body, true );
            
            // Check if we got Elementor data
            if ( is_array( $data ) && isset( $data['data'] ) ) {
                return $data['data'];
            }
        }

        return array();
    }

    /**
     * Extract Elementor data from post meta
     *
     * @param array $meta Post meta array.
     * @return string Elementor data JSON string.
     */
    private function extract_elementor_from_meta( array $meta ): string {
        // Look for _elementor_data key
        if ( isset( $meta['_elementor_data'] ) ) {
            $data = $meta['_elementor_data'];
            
            // Handle different formats
            if ( is_array( $data ) && ! empty( $data[0] ) ) {
                return $data[0];
            } elseif ( is_string( $data ) ) {
                return $data;
            }
        }

        // Try alternative key names
        $alternative_keys = array(
            'elementor_data',
            '_elementor_edit_mode',
        );

        foreach ( $alternative_keys as $key ) {
            if ( isset( $meta[ $key ] ) ) {
                $data = $meta[ $key ];
                
                if ( is_array( $data ) && ! empty( $data[0] ) ) {
                    return $data[0];
                } elseif ( is_string( $data ) ) {
                    return $data;
                }
            }
        }

        return '';
    }

    /**
     * Parse and validate Elementor JSON data
     *
     * @param string $json_string JSON string.
     * @param int    $post_id Post ID for error reporting.
     * @return array Parsed and validated data.
     */
    private function parse_and_validate_json( string $json_string, int $post_id ): array {
        if ( empty( $json_string ) ) {
            return array();
        }

        // Try to decode JSON
        $data = json_decode( $json_string, true );
        
        if ( json_last_error() !== JSON_ERROR_NONE ) {
            $this->set_error(
                'invalid_json',
                __( 'داده المنتور نامعتبر است (JSON)', 'elementor-copier' ),
                'Invalid Elementor data (JSON)',
                array(
                    'post_id'    => $post_id,
                    'json_error' => json_last_error_msg(),
                )
            );
            return array();
        }

        // Validate basic Elementor structure
        if ( ! is_array( $data ) ) {
            $this->set_error(
                'invalid_structure',
                __( 'ساختار داده المنتور نامعتبر است', 'elementor-copier' ),
                'Invalid Elementor data structure',
                array( 'post_id' => $post_id )
            );
            return array();
        }

        return $data;
    }

    /**
     * Set authentication credentials
     *
     * @param array $auth Authentication credentials.
     * @return void
     */
    public function set_auth( array $auth ): void {
        $this->auth = $auth;
        
        // Reset authentication state when credentials change
        $this->is_authenticated = false;
        $this->cookies = array();
        $this->nonce = '';
    }

    /**
     * Get authentication headers for REST API requests
     *
     * @return array Headers array.
     */
    private function get_auth_headers(): array {
        $headers = array();

        // Add nonce if available
        if ( ! empty( $this->nonce ) ) {
            $headers['X-WP-Nonce'] = $this->nonce;
        }

        return $headers;
    }

    /**
     * Logout and cleanup session
     *
     * @return void
     */
    public function logout(): void {
        if ( ! $this->is_authenticated ) {
            return;
        }

        // Try to logout from WordPress
        $logout_url = trailingslashit( $this->source_url ) . 'wp-login.php?action=logout';
        
        wp_remote_get(
            $logout_url,
            array(
                'timeout'   => 10,
                'sslverify' => true,
                'cookies'   => $this->cookies,
            )
        );

        // Clear session data
        $this->cookies = array();
        $this->nonce = '';
        $this->is_authenticated = false;
    }

    /**
     * Destructor - cleanup session
     */
    public function __destruct() {
        $this->logout();
    }

    /**
     * Get the last error that occurred
     *
     * @return array Error information.
     */
    public function get_last_error(): array {
        return $this->last_error;
    }

    /**
     * Set error information
     *
     * @param string $code Error code.
     * @param string $message Persian error message.
     * @param string $message_en English error message.
     * @param array  $details Additional error details.
     * @return void
     */
    private function set_error( string $code, string $message, string $message_en, array $details = array() ): void {
        $this->last_error = array(
            'code'       => $code,
            'message'    => $message,
            'message_en' => $message_en,
            'details'    => $details,
        );
    }
}
