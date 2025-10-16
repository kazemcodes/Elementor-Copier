<?php
/**
 * Web Scraper Extractor Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Extractor;

use ElementorCopier\Security\Auth;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * WebScraper extracts Elementor data by scraping public HTML pages
 */
class WebScraper implements ExtractorInterface {

    /**
     * Source site URL
     *
     * @var string
     */
    private $source_url = '';

    /**
     * Authentication credentials (not typically used for public scraping)
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
     * Cached pages list
     *
     * @var array
     */
    private $cached_pages = array();

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
     * @return bool True if HTML is accessible.
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

        // Test if we can fetch HTML
        $response = wp_remote_get(
            $this->source_url,
            array(
                'timeout'   => 10,
                'sslverify' => true,
                'headers'   => array(
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'fetch_failed',
                __( 'دریافت صفحه ممکن نیست', 'elementor-copier' ),
                'Cannot fetch page',
                array( 'error' => $response->get_error_message() )
            );
            return false;
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        if ( $http_code !== 200 ) {
            $this->set_error(
                'http_error',
                sprintf( __( 'خطای HTTP: %d', 'elementor-copier' ), $http_code ),
                sprintf( 'HTTP Error: %d', $http_code ),
                array( 'http_code' => $http_code )
            );
            return false;
        }

        return true;
    }

    /**
     * Get list of pages from source site
     *
     * @return array List of pages.
     */
    public function get_pages(): array {
        if ( ! empty( $this->cached_pages ) ) {
            return $this->cached_pages;
        }

        // Try to extract pages from sitemap or HTML
        $pages = $this->extract_pages_from_sitemap();
        
        if ( empty( $pages ) ) {
            // Fallback: Try to extract from homepage links
            $pages = $this->extract_pages_from_homepage();
        }

        $this->cached_pages = $pages;
        
        return $pages;
    }

    /**
     * Get list of posts from source site
     *
     * @return array List of posts.
     */
    public function get_posts(): array {
        // Try to extract posts from sitemap or blog page
        $posts = $this->extract_posts_from_sitemap();
        
        if ( empty( $posts ) ) {
            // Fallback: Try to extract from blog page
            $posts = $this->extract_posts_from_blog_page();
        }

        return $posts;
    }

    /**
     * Extract pages from XML sitemap
     *
     * @return array List of pages.
     */
    private function extract_pages_from_sitemap(): array {
        $pages = array();
        
        // Common sitemap URLs
        $sitemap_urls = array(
            trailingslashit( $this->source_url ) . 'sitemap.xml',
            trailingslashit( $this->source_url ) . 'sitemap_index.xml',
            trailingslashit( $this->source_url ) . 'wp-sitemap.xml',
            trailingslashit( $this->source_url ) . 'page-sitemap.xml',
        );

        foreach ( $sitemap_urls as $sitemap_url ) {
            $response = wp_remote_get(
                $sitemap_url,
                array(
                    'timeout'   => 15,
                    'sslverify' => true,
                )
            );

            if ( is_wp_error( $response ) ) {
                continue;
            }

            $http_code = wp_remote_retrieve_response_code( $response );
            if ( $http_code !== 200 ) {
                continue;
            }

            $body = wp_remote_retrieve_body( $response );
            
            // Parse XML
            $xml = $this->parse_xml( $body );
            
            if ( $xml ) {
                $extracted = $this->extract_urls_from_sitemap_xml( $xml );
                $pages = array_merge( $pages, $extracted );
            }
        }

        return $pages;
    }

    /**
     * Parse XML content
     *
     * @param string $xml_content XML content.
     * @return \SimpleXMLElement|false Parsed XML or false on failure.
     */
    private function parse_xml( string $xml_content ) {
        // Suppress XML parsing errors
        libxml_use_internal_errors( true );
        
        try {
            $xml = simplexml_load_string( $xml_content );
            libxml_clear_errors();
            return $xml;
        } catch ( \Exception $e ) {
            libxml_clear_errors();
            return false;
        }
    }

    /**
     * Extract URLs from sitemap XML
     *
     * @param \SimpleXMLElement $xml Parsed XML.
     * @return array List of pages.
     */
    private function extract_urls_from_sitemap_xml( $xml ): array {
        $pages = array();
        
        // Handle sitemap index
        if ( isset( $xml->sitemap ) ) {
            foreach ( $xml->sitemap as $sitemap ) {
                if ( isset( $sitemap->loc ) ) {
                    $sitemap_url = (string) $sitemap->loc;
                    
                    // Fetch sub-sitemap
                    $response = wp_remote_get(
                        $sitemap_url,
                        array(
                            'timeout'   => 15,
                            'sslverify' => true,
                        )
                    );

                    if ( ! is_wp_error( $response ) ) {
                        $body = wp_remote_retrieve_body( $response );
                        $sub_xml = $this->parse_xml( $body );
                        
                        if ( $sub_xml ) {
                            $pages = array_merge( $pages, $this->extract_urls_from_sitemap_xml( $sub_xml ) );
                        }
                    }
                }
            }
        }

        // Handle URL entries
        if ( isset( $xml->url ) ) {
            foreach ( $xml->url as $url_entry ) {
                if ( isset( $url_entry->loc ) ) {
                    $url = (string) $url_entry->loc;
                    
                    // Extract page ID from URL if possible
                    $page_id = $this->extract_post_id_from_url( $url );
                    
                    // Extract title from URL
                    $title = $this->extract_title_from_url( $url );
                    
                    $pages[] = array(
                        'id'    => $page_id,
                        'title' => $title,
                        'link'  => $url,
                        'type'  => 'page',
                    );
                }
            }
        }

        return $pages;
    }

    /**
     * Extract pages from homepage links
     *
     * @return array List of pages.
     */
    private function extract_pages_from_homepage(): array {
        $pages = array();
        
        $response = wp_remote_get(
            $this->source_url,
            array(
                'timeout'   => 15,
                'sslverify' => true,
                'headers'   => array(
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return $pages;
        }

        $body = wp_remote_retrieve_body( $response );
        
        // Extract links from HTML
        $links = $this->extract_links_from_html( $body );
        
        foreach ( $links as $link ) {
            $page_id = $this->extract_post_id_from_url( $link['url'] );
            
            $pages[] = array(
                'id'    => $page_id,
                'title' => $link['title'],
                'link'  => $link['url'],
                'type'  => 'page',
            );
        }

        return $pages;
    }

    /**
     * Extract posts from sitemap
     *
     * @return array List of posts.
     */
    private function extract_posts_from_sitemap(): array {
        $posts = array();
        
        // Common post sitemap URLs
        $sitemap_urls = array(
            trailingslashit( $this->source_url ) . 'post-sitemap.xml',
            trailingslashit( $this->source_url ) . 'sitemap-posts.xml',
        );

        foreach ( $sitemap_urls as $sitemap_url ) {
            $response = wp_remote_get(
                $sitemap_url,
                array(
                    'timeout'   => 15,
                    'sslverify' => true,
                )
            );

            if ( is_wp_error( $response ) ) {
                continue;
            }

            $http_code = wp_remote_retrieve_response_code( $response );
            if ( $http_code !== 200 ) {
                continue;
            }

            $body = wp_remote_retrieve_body( $response );
            
            // Parse XML
            $xml = $this->parse_xml( $body );
            
            if ( $xml ) {
                $extracted = $this->extract_urls_from_sitemap_xml( $xml );
                
                // Mark as posts
                foreach ( $extracted as &$item ) {
                    $item['type'] = 'post';
                }
                
                $posts = array_merge( $posts, $extracted );
            }
        }

        return $posts;
    }

    /**
     * Extract posts from blog page
     *
     * @return array List of posts.
     */
    private function extract_posts_from_blog_page(): array {
        $posts = array();
        
        // Try common blog URLs
        $blog_urls = array(
            trailingslashit( $this->source_url ) . 'blog/',
            trailingslashit( $this->source_url ),
        );

        foreach ( $blog_urls as $blog_url ) {
            $response = wp_remote_get(
                $blog_url,
                array(
                    'timeout'   => 15,
                    'sslverify' => true,
                    'headers'   => array(
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ),
                )
            );

            if ( is_wp_error( $response ) ) {
                continue;
            }

            $body = wp_remote_retrieve_body( $response );
            
            // Extract post links from HTML
            $links = $this->extract_links_from_html( $body );
            
            foreach ( $links as $link ) {
                $post_id = $this->extract_post_id_from_url( $link['url'] );
                
                $posts[] = array(
                    'id'    => $post_id,
                    'title' => $link['title'],
                    'link'  => $link['url'],
                    'type'  => 'post',
                );
            }

            if ( ! empty( $posts ) ) {
                break;
            }
        }

        return $posts;
    }

    /**
     * Extract links from HTML content
     *
     * @param string $html HTML content.
     * @return array List of links with title and URL.
     */
    private function extract_links_from_html( string $html ): array {
        $links = array();
        
        // Use DOMDocument to parse HTML
        $dom = new \DOMDocument();
        
        // Suppress HTML parsing errors
        libxml_use_internal_errors( true );
        
        // Load HTML with UTF-8 encoding
        $dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
        
        libxml_clear_errors();
        
        // Get all anchor tags
        $anchors = $dom->getElementsByTagName( 'a' );
        
        foreach ( $anchors as $anchor ) {
            $href = $anchor->getAttribute( 'href' );
            $title = trim( $anchor->textContent );
            
            // Filter internal links only
            if ( $this->is_internal_link( $href ) ) {
                $links[] = array(
                    'url'   => $href,
                    'title' => ! empty( $title ) ? $title : __( 'بدون عنوان', 'elementor-copier' ),
                );
            }
        }

        return $links;
    }

    /**
     * Check if a link is internal to the source site
     *
     * @param string $url URL to check.
     * @return bool True if internal link.
     */
    private function is_internal_link( string $url ): bool {
        if ( empty( $url ) ) {
            return false;
        }

        // Skip anchors and javascript
        if ( strpos( $url, '#' ) === 0 || strpos( $url, 'javascript:' ) === 0 ) {
            return false;
        }

        // Relative URLs are internal
        if ( strpos( $url, '/' ) === 0 && strpos( $url, '//' ) !== 0 ) {
            return true;
        }

        // Check if URL starts with source domain
        $source_host = wp_parse_url( $this->source_url, PHP_URL_HOST );
        $url_host = wp_parse_url( $url, PHP_URL_HOST );
        
        return $source_host === $url_host;
    }

    /**
     * Extract post ID from URL
     *
     * @param string $url URL to parse.
     * @return int Post ID or 0 if not found.
     */
    private function extract_post_id_from_url( string $url ): int {
        // Try to extract ?p=123 or ?page_id=123
        if ( preg_match( '/[?&]p=(\d+)/', $url, $matches ) ) {
            return (int) $matches[1];
        }
        
        if ( preg_match( '/[?&]page_id=(\d+)/', $url, $matches ) ) {
            return (int) $matches[1];
        }

        // Generate a pseudo-ID from URL hash for pretty permalinks
        return abs( crc32( $url ) );
    }

    /**
     * Extract title from URL
     *
     * @param string $url URL to parse.
     * @return string Extracted title.
     */
    private function extract_title_from_url( string $url ): string {
        $path = wp_parse_url( $url, PHP_URL_PATH );
        
        if ( empty( $path ) ) {
            return __( 'بدون عنوان', 'elementor-copier' );
        }

        // Get last segment
        $segments = array_filter( explode( '/', $path ) );
        $last_segment = end( $segments );
        
        if ( empty( $last_segment ) ) {
            return __( 'بدون عنوان', 'elementor-copier' );
        }

        // Convert slug to title
        $title = str_replace( array( '-', '_' ), ' ', $last_segment );
        $title = ucwords( $title );
        
        return $title;
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

        // Find the page URL from cached pages
        $page_url = $this->find_page_url_by_id( $post_id );
        
        if ( empty( $page_url ) ) {
            $this->set_error(
                'page_not_found',
                __( 'صفحه مورد نظر یافت نشد', 'elementor-copier' ),
                'Page not found',
                array( 'post_id' => $post_id )
            );
            return array();
        }

        // Fetch HTML
        $html = $this->fetch_html( $page_url );
        
        if ( empty( $html ) ) {
            return array();
        }

        // Try multiple extraction methods
        $elementor_data = $this->extract_from_inline_scripts( $html );
        
        if ( empty( $elementor_data ) ) {
            $elementor_data = $this->extract_from_ajax_requests( $page_url );
        }
        
        if ( empty( $elementor_data ) ) {
            $elementor_data = $this->extract_from_data_attributes( $html );
        }

        if ( empty( $elementor_data ) ) {
            $this->set_error(
                'no_elementor_data',
                __( 'داده المنتور در این صفحه یافت نشد', 'elementor-copier' ),
                'No Elementor data found on this page',
                array( 'post_id' => $post_id, 'url' => $page_url )
            );
            return array();
        }

        return $elementor_data;
    }

    /**
     * Find page URL by post ID
     *
     * @param int $post_id Post ID.
     * @return string Page URL or empty string.
     */
    private function find_page_url_by_id( int $post_id ): string {
        // Check cached pages
        foreach ( $this->cached_pages as $page ) {
            if ( isset( $page['id'] ) && $page['id'] === $post_id ) {
                return $page['link'] ?? '';
            }
        }

        // Try to construct URL
        $url = trailingslashit( $this->source_url ) . '?p=' . $post_id;
        
        return $url;
    }

    /**
     * Fetch HTML content from URL
     *
     * @param string $url URL to fetch.
     * @return string HTML content.
     */
    private function fetch_html( string $url ): string {
        $response = wp_remote_get(
            $url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
                'headers'   => array(
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            $this->set_error(
                'fetch_failed',
                __( 'خطا در دریافت صفحه', 'elementor-copier' ),
                'Failed to fetch page',
                array( 'error' => $response->get_error_message() )
            );
            return '';
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        
        if ( $http_code !== 200 ) {
            $this->set_error(
                'http_error',
                sprintf( __( 'خطای HTTP: %d', 'elementor-copier' ), $http_code ),
                sprintf( 'HTTP Error: %d', $http_code ),
                array( 'http_code' => $http_code )
            );
            return '';
        }

        return wp_remote_retrieve_body( $response );
    }

    /**
     * Extract Elementor data from inline scripts (elementorFrontendConfig)
     *
     * @param string $html HTML content.
     * @return array Elementor data.
     */
    private function extract_from_inline_scripts( string $html ): array {
        // Look for elementorFrontendConfig
        if ( preg_match( '/var\s+elementorFrontendConfig\s*=\s*({.+?});/s', $html, $matches ) ) {
            $config_json = $matches[1];
            $config = json_decode( $config_json, true );
            
            if ( is_array( $config ) && isset( $config['elements'] ) ) {
                return $config['elements'];
            }
        }

        // Look for elementor data in script tags
        if ( preg_match_all( '/<script[^>]*>.*?var\s+elementorData\s*=\s*({.+?});.*?<\/script>/s', $html, $matches ) ) {
            foreach ( $matches[1] as $data_json ) {
                $data = json_decode( $data_json, true );
                
                if ( is_array( $data ) && ! empty( $data ) ) {
                    return $data;
                }
            }
        }

        // Look for Elementor data in any JSON structure
        if ( preg_match_all( '/({[^{}]*"elType"[^{}]*})/s', $html, $matches ) ) {
            $all_data = array();
            
            foreach ( $matches[1] as $json_str ) {
                $data = json_decode( $json_str, true );
                
                if ( is_array( $data ) && isset( $data['elType'] ) ) {
                    $all_data[] = $data;
                }
            }
            
            if ( ! empty( $all_data ) ) {
                return $all_data;
            }
        }

        return array();
    }

    /**
     * Extract Elementor data from AJAX requests
     *
     * @param string $page_url Page URL.
     * @return array Elementor data.
     */
    private function extract_from_ajax_requests( string $page_url ): array {
        // Try to get post ID from URL
        $post_id = $this->extract_post_id_from_url( $page_url );
        
        if ( $post_id <= 0 ) {
            return array();
        }

        // Try common AJAX endpoints
        $ajax_url = trailingslashit( $this->source_url ) . 'wp-admin/admin-ajax.php';
        
        $response = wp_remote_post(
            $ajax_url,
            array(
                'timeout' => 15,
                'body'    => array(
                    'action'  => 'elementor_ajax',
                    'post_id' => $post_id,
                ),
            )
        );

        if ( is_wp_error( $response ) ) {
            return array();
        }

        $body = wp_remote_retrieve_body( $response );
        $data = json_decode( $body, true );
        
        if ( is_array( $data ) && isset( $data['data'] ) ) {
            return $data['data'];
        }

        return array();
    }

    /**
     * Extract Elementor data from data attributes in HTML
     *
     * @param string $html HTML content.
     * @return array Elementor data.
     */
    private function extract_from_data_attributes( string $html ): array {
        // Look for data-elementor-data attributes
        if ( preg_match_all( '/data-elementor-data=["\']({.+?})["\']/s', $html, $matches ) ) {
            foreach ( $matches[1] as $data_json ) {
                // Decode HTML entities
                $data_json = html_entity_decode( $data_json );
                
                $data = json_decode( $data_json, true );
                
                if ( is_array( $data ) && ! empty( $data ) ) {
                    return $data;
                }
            }
        }

        // Look for data-settings attributes on Elementor elements
        $dom = new \DOMDocument();
        libxml_use_internal_errors( true );
        $dom->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
        libxml_clear_errors();
        
        $xpath = new \DOMXPath( $dom );
        $elements = $xpath->query( '//*[@data-elementor-type]' );
        
        $all_data = array();
        
        foreach ( $elements as $element ) {
            $settings = $element->getAttribute( 'data-settings' );
            
            if ( ! empty( $settings ) ) {
                $settings = html_entity_decode( $settings );
                $data = json_decode( $settings, true );
                
                if ( is_array( $data ) ) {
                    $all_data[] = $data;
                }
            }
        }

        return $all_data;
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
