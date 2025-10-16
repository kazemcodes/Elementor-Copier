<?php
/**
 * REST API Extractor Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Extractor;

use ElementorCopier\Security\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * RestApiExtractor extracts Elementor data using WordPress REST API
 */
class RestApiExtractor implements ExtractorInterface {

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
     * @return bool True if REST API is accessible.
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

        // Test REST API endpoint
        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2';
        
        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => 10,
                'sslverify' => true,
                'headers'   => $this->get_auth_headers(),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'rest_api_unavailable',
                __( 'REST API در دسترس نیست', 'elementor-copier' ),
                'REST API is not available',
                array( 'error' => $response->get_error_message() )
            );
            return false;
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        // Accept 200 (OK) or 401 (Unauthorized - means API exists but needs auth)
        if ( $http_code === 200 || $http_code === 401 ) {
            return true;
        }

        $this->set_error(
            'rest_api_error',
            sprintf( __( 'خطای REST API: %d', 'elementor-copier' ), $http_code ),
            sprintf( 'REST API Error: %d', $http_code ),
            array( 'http_code' => $http_code )
        );
        
        return false;
    }

    /**
     * Get list of pages from source site
     *
     * @return array List of pages.
     */
    public function get_pages(): array {
        return $this->get_posts_by_type( 'pages' );
    }

    /**
     * Get list of posts from source site
     *
     * @return array List of posts.
     */
    public function get_posts(): array {
        return $this->get_posts_by_type( 'posts' );
    }

    /**
     * Get posts by type (posts or pages)
     *
     * @param string $type Post type ('posts' or 'pages').
     * @return array List of posts/pages.
     */
    private function get_posts_by_type( string $type ): array {
        if ( empty( $this->source_url ) ) {
            $this->set_error(
                'no_source_url',
                __( 'آدرس سایت مبدا تنظیم نشده است', 'elementor-copier' ),
                'Source URL not set'
            );
            return array();
        }

        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2/' . $type;
        
        // Add parameters to get more results
        $rest_url = add_query_arg(
            array(
                'per_page' => 100,
                'orderby'  => 'modified',
                'order'    => 'desc',
            ),
            $rest_url
        );

        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
                'headers'   => $this->get_auth_headers(),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'fetch_failed',
                sprintf( __( 'خطا در دریافت %s', 'elementor-copier' ), $type === 'pages' ? __( 'صفحات', 'elementor-copier' ) : __( 'نوشته‌ها', 'elementor-copier' ) ),
                sprintf( 'Failed to fetch %s', $type ),
                array( 'error' => $response->get_error_message() )
            );
            return array();
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        if ( $http_code !== 200 ) {
            $this->set_error(
                'http_error',
                sprintf( __( 'خطای HTTP در دریافت %s: %d', 'elementor-copier' ), $type === 'pages' ? __( 'صفحات', 'elementor-copier' ) : __( 'نوشته‌ها', 'elementor-copier' ), $http_code ),
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
        $post_type = rtrim( $type, 's' ); // 'posts' -> 'post', 'pages' -> 'page'

        foreach ( $data as $item ) {
            $items[] = array(
                'id'    => $item['id'] ?? 0,
                'title' => isset( $item['title']['rendered'] ) ? $item['title']['rendered'] : __( 'بدون عنوان', 'elementor-copier' ),
                'link'  => $item['link'] ?? '',
                'type'  => $post_type,
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
        if ( empty( $this->source_url ) ) {
            $this->set_error(
                'no_source_url',
                __( 'آدرس سایت مبدا تنظیم نشده است', 'elementor-copier' ),
                'Source URL not set'
            );
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

        // Fetch post meta via REST API
        $post_meta = $this->fetch_post_meta( $post_id );
        
        if ( empty( $post_meta ) ) {
            return array();
        }

        // Extract Elementor data from meta
        $elementor_data = $this->extract_elementor_from_meta( $post_meta );
        
        if ( empty( $elementor_data ) ) {
            $this->set_error(
                'no_elementor_data',
                __( 'داده المنتور در این نوشته یافت نشد', 'elementor-copier' ),
                'No Elementor data found in this post',
                array( 'post_id' => $post_id )
            );
            return array();
        }

        // Validate and parse JSON
        $parsed_data = $this->parse_and_validate_json( $elementor_data, $post_id );
        
        return $parsed_data;
    }

    /**
     * Fetch post meta from REST API
     *
     * @param int $post_id Post ID.
     * @return array Post meta data.
     */
    private function fetch_post_meta( int $post_id ): array {
        // Try to get post with meta - first try posts endpoint
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
                    return $data['meta'];
                }
                
                // If meta is not in response, try to get it separately
                return $this->fetch_meta_separately( $post_id );
            }
        }

        $this->set_error(
            'post_not_found',
            __( 'نوشته مورد نظر یافت نشد', 'elementor-copier' ),
            'Post not found',
            array( 'post_id' => $post_id )
        );
        
        return array();
    }

    /**
     * Fetch meta separately if not included in post response
     *
     * @param int $post_id Post ID.
     * @return array Meta data.
     */
    private function fetch_meta_separately( int $post_id ): array {
        // Some WordPress installations may have custom endpoints for meta
        // Try common patterns
        $meta_endpoints = array(
            'wp-json/wp/v2/posts/' . $post_id . '?_fields=meta',
            'wp-json/wp/v2/pages/' . $post_id . '?_fields=meta',
        );

        foreach ( $meta_endpoints as $endpoint ) {
            $rest_url = trailingslashit( $this->source_url ) . $endpoint;
            
            $response = wp_remote_get(
                $rest_url,
                array(
                    'timeout'   => $this->timeout,
                    'sslverify' => true,
                    'headers'   => $this->get_auth_headers(),
                )
            );

            if ( ! is_wp_error( $response ) ) {
                $http_code = wp_remote_retrieve_response_code( $response );
                
                if ( $http_code === 200 ) {
                    $body = wp_remote_retrieve_body( $response );
                    $data = json_decode( $body, true );
                    
                    if ( is_array( $data ) && isset( $data['meta'] ) ) {
                        return $data['meta'];
                    }
                }
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

        // Check if it's an array of elements (typical Elementor structure)
        if ( ! $this->validate_elementor_structure( $data ) ) {
            $this->set_error(
                'invalid_elementor_structure',
                __( 'ساختار المنتور معتبر نیست', 'elementor-copier' ),
                'Not a valid Elementor structure',
                array( 'post_id' => $post_id )
            );
            return array();
        }

        return $data;
    }

    /**
     * Validate Elementor data structure
     *
     * @param array $data Data to validate.
     * @return bool True if valid Elementor structure.
     */
    private function validate_elementor_structure( array $data ): bool {
        // Empty data is technically valid (empty page)
        if ( empty( $data ) ) {
            return true;
        }

        // Check if it's an array of elements
        if ( ! is_array( $data ) ) {
            return false;
        }

        // Check first element has typical Elementor properties
        $first_element = reset( $data );
        
        if ( ! is_array( $first_element ) ) {
            return false;
        }

        // Typical Elementor element should have 'elType' or 'id'
        $required_keys = array( 'elType', 'id' );
        $has_required = false;
        
        foreach ( $required_keys as $key ) {
            if ( isset( $first_element[ $key ] ) ) {
                $has_required = true;
                break;
            }
        }

        return $has_required;
    }

    /**
     * Set authentication credentials
     *
     * @param array $auth Authentication credentials.
     * @return void
     */
    public function set_auth( array $auth ): void {
        $this->auth = $auth;
    }

    /**
     * Get authentication headers for REST API requests
     *
     * @return array Headers array.
     */
    private function get_auth_headers(): array {
        $headers = array();

        // Check for application password (username:password base64 encoded)
        if ( ! empty( $this->auth['username'] ) && ! empty( $this->auth['password'] ) ) {
            $credentials = $this->auth['username'] . ':' . $this->auth['password'];
            $headers['Authorization'] = 'Basic ' . base64_encode( $credentials );
        }

        // Check for bearer token
        if ( ! empty( $this->auth['token'] ) ) {
            $headers['Authorization'] = 'Bearer ' . $this->auth['token'];
        }

        return $headers;
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
