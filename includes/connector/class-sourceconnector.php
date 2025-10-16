<?php
/**
 * Source Site Connector Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Connector;

use ElementorCopier\Security\Auth;
use ElementorCopier\Extractor\RestApiExtractor;
use ElementorCopier\Extractor\AuthenticatedExtractor;
use ElementorCopier\Extractor\WebScraper;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * SourceConnector class handles connection to remote WordPress sites
 * and retrieves Elementor content information
 */
class SourceConnector {

    /**
     * Authentication credentials
     *
     * @var array
     */
    private $auth = array();

    /**
     * Source site URL
     *
     * @var string
     */
    private $source_url = '';

    /**
     * Detected extraction method
     *
     * @var string
     */
    private $extraction_method = '';

    /**
     * Connection timeout in seconds
     *
     * @var int
     */
    private $timeout = 30;

    /**
     * Security instance
     *
     * @var Auth
     */
    private $auth_handler;

    /**
     * Extractor instance
     *
     * @var \ElementorCopier\Extractor\ExtractorInterface
     */
    private $extractor;

    /**
     * Constructor
     */
    public function __construct() {
        $this->auth_handler = new Auth();
    }

    /**
     * Connect to source site and test connection
     *
     * @param string $url Source site URL.
     * @param array  $auth Optional authentication credentials.
     * @return bool True if connection successful.
     */
    public function connect( string $url, array $auth = array() ): bool {
        // Sanitize and validate URL
        $this->source_url = $this->auth_handler->sanitize_url( $url );
        
        if ( empty( $this->source_url ) ) {
            return false;
        }

        $this->auth = $auth;

        // Test connection
        $response = $this->test_connection();
        
        return $response['success'];
    }

    /**
     * Test connection to source site
     *
     * @return array Connection test results with Persian messages.
     */
    public function test_connection(): array {
        if ( empty( $this->source_url ) ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'empty_url',
                    'message'    => __( 'آدرس سایت مبدا خالی است', 'elementor-copier' ),
                    'message_en' => 'Source URL is empty',
                    'suggestion' => __( 'لطفاً آدرس سایت را وارد کنید', 'elementor-copier' ),
                ),
            );
        }

        // Test basic connectivity
        $response = wp_remote_get(
            $this->source_url,
            array(
                'timeout'     => $this->timeout,
                'redirection' => 5,
                'sslverify'   => true,
            )
        );

        if ( is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'connection_failed',
                    'message'    => __( 'اتصال به سایت مبدا برقرار نشد', 'elementor-copier' ),
                    'message_en' => 'Connection to source site failed',
                    'details'    => array(
                        'url'   => $this->source_url,
                        'error' => $response->get_error_message(),
                    ),
                    'suggestion' => __( 'لطفاً آدرس سایت را بررسی کنید و مطمئن شوید که سایت فعال است', 'elementor-copier' ),
                ),
            );
        }

        $http_code = wp_remote_retrieve_response_code( $response );
        if ( $http_code < 200 || $http_code >= 400 ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'http_error',
                    'message'    => sprintf( __( 'خطای HTTP: %d', 'elementor-copier' ), $http_code ),
                    'message_en' => sprintf( 'HTTP Error: %d', $http_code ),
                    'details'    => array(
                        'url'       => $this->source_url,
                        'http_code' => $http_code,
                    ),
                    'suggestion' => __( 'سایت مبدا در دسترس نیست یا خطایی رخ داده است', 'elementor-copier' ),
                ),
            );
        }

        // Detect WordPress
        $is_wordpress = $this->detect_wordpress();
        if ( ! $is_wordpress ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'not_wordpress',
                    'message'    => __( 'سایت مبدا یک سایت وردپرسی نیست', 'elementor-copier' ),
                    'message_en' => 'Source site is not a WordPress site',
                    'details'    => array(
                        'url' => $this->source_url,
                    ),
                    'suggestion' => __( 'این افزونه فقط با سایت‌های وردپرسی کار می‌کند', 'elementor-copier' ),
                ),
            );
        }

        // Detect Elementor
        $elementor_info = $this->detect_elementor();
        if ( ! $elementor_info['has_elementor'] ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'no_elementor',
                    'message'    => __( 'المنتور در سایت مبدا یافت نشد', 'elementor-copier' ),
                    'message_en' => 'Elementor not found on source site',
                    'details'    => array(
                        'url' => $this->source_url,
                    ),
                    'suggestion' => __( 'لطفاً مطمئن شوید که المنتور در سایت مبدا نصب و فعال است', 'elementor-copier' ),
                ),
            );
        }

        // Choose extraction method
        $this->extraction_method = $this->choose_extraction_method();

        // Initialize the appropriate extractor
        $this->initialize_extractor();

        // Get pages and posts count
        $pages_count = 0;
        $posts_count = 0;

        // Try to get counts (non-blocking)
        try {
            $pages = $this->get_pages();
            $pages_count = is_array( $pages ) ? count( $pages ) : 0;
            
            $posts = $this->get_posts();
            $posts_count = is_array( $posts ) ? count( $posts ) : 0;
        } catch ( \Exception $e ) {
            // Counts are optional, continue without them
        }

        return array(
            'success' => true,
            'data'    => array(
                'is_wordpress'      => true,
                'has_elementor'     => true,
                'elementor_version' => $elementor_info['version'],
                'extraction_method' => $this->extraction_method,
                'pages_count'       => $pages_count,
                'posts_count'       => $posts_count,
                'url'               => $this->source_url,
            ),
            'message' => __( 'اتصال با موفقیت برقرار شد', 'elementor-copier' ),
        );
    }

    /**
     * Detect if the source site is WordPress
     *
     * @return bool True if WordPress detected.
     */
    private function detect_wordpress(): bool {
        // Check for REST API endpoint
        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/';
        
        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => 10,
                'sslverify' => true,
            )
        );

        if ( ! is_wp_error( $response ) ) {
            $http_code = wp_remote_retrieve_response_code( $response );
            if ( $http_code === 200 ) {
                $body = wp_remote_retrieve_body( $response );
                $data = json_decode( $body, true );
                
                // Check for WordPress REST API namespace
                if ( isset( $data['namespaces'] ) && is_array( $data['namespaces'] ) ) {
                    return in_array( 'wp/v2', $data['namespaces'], true );
                }
            }
        }

        // Fallback: Check for WordPress meta tags or common patterns
        $response = wp_remote_get(
            $this->source_url,
            array(
                'timeout'   => 10,
                'sslverify' => true,
            )
        );

        if ( ! is_wp_error( $response ) ) {
            $body = wp_remote_retrieve_body( $response );
            
            // Check for WordPress indicators
            if ( strpos( $body, 'wp-content' ) !== false ||
                 strpos( $body, 'wp-includes' ) !== false ||
                 strpos( $body, 'wordpress' ) !== false ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detect if Elementor is installed on source site
     *
     * @return array Elementor detection info.
     */
    private function detect_elementor(): array {
        $result = array(
            'has_elementor' => false,
            'version'       => '',
        );

        // Try to fetch homepage
        $response = wp_remote_get(
            $this->source_url,
            array(
                'timeout'   => 15,
                'sslverify' => true,
            )
        );

        if ( is_wp_error( $response ) ) {
            return $result;
        }

        $body = wp_remote_retrieve_body( $response );

        // Check for Elementor indicators in HTML
        $elementor_indicators = array(
            'elementor-',
            'data-elementor-type',
            'elementor-element',
            'elementor-widget',
            'elementorFrontendConfig',
        );

        foreach ( $elementor_indicators as $indicator ) {
            if ( strpos( $body, $indicator ) !== false ) {
                $result['has_elementor'] = true;
                break;
            }
        }

        // Try to extract version from inline scripts
        if ( $result['has_elementor'] ) {
            if ( preg_match( '/elementor["\']?\s*:\s*["\']?([0-9.]+)/', $body, $matches ) ) {
                $result['version'] = $matches[1];
            } elseif ( preg_match( '/elementor-frontend[^>]*version["\']?\s*:\s*["\']?([0-9.]+)/', $body, $matches ) ) {
                $result['version'] = $matches[1];
            }
        }

        return $result;
    }

    /**
     * Choose the best extraction method based on available access
     *
     * @return string Extraction method name.
     */
    private function choose_extraction_method(): string {
        // Priority order: REST API > Authenticated > Web Scraper
        
        // Try REST API extractor first
        $rest_extractor = new RestApiExtractor( $this->source_url );
        $rest_extractor->set_auth( $this->auth );
        
        if ( $rest_extractor->can_extract( $this->source_url ) ) {
            return 'rest_api';
        }

        // Check if authentication credentials are provided
        if ( ! empty( $this->auth['username'] ) && ! empty( $this->auth['password'] ) ) {
            return 'authenticated';
        }

        // Fallback to web scraper
        return 'web_scraper';
    }

    /**
     * Initialize the appropriate extractor based on extraction method
     *
     * @return void
     */
    private function initialize_extractor(): void {
        switch ( $this->extraction_method ) {
            case 'rest_api':
                $this->extractor = new RestApiExtractor( $this->source_url );
                $this->extractor->set_auth( $this->auth );
                break;

            case 'authenticated':
                $this->extractor = new AuthenticatedExtractor( $this->source_url );
                $this->extractor->set_auth( $this->auth );
                break;

            case 'web_scraper':
                $this->extractor = new WebScraper( $this->source_url );
                $this->extractor->set_auth( $this->auth );
                break;

            default:
                // Fallback to REST API
                $this->extractor = new RestApiExtractor( $this->source_url );
                $this->extractor->set_auth( $this->auth );
                break;
        }
    }

    /**
     * Get list of pages from source site with hierarchical structure
     *
     * @return array List of pages with elements.
     */
    public function get_pages(): array {
        if ( empty( $this->source_url ) ) {
            return array();
        }

        // Use extractor if available
        if ( $this->extractor !== null ) {
            $pages = $this->extractor->get_pages();
            
            // Enhance pages with element structure
            return $this->enhance_pages_with_elements( $pages );
        }

        // Fallback to direct REST API call
        $pages = array();

        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2/pages';
        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
            )
        );

        if ( ! is_wp_error( $response ) ) {
            $http_code = wp_remote_retrieve_response_code( $response );
            if ( $http_code === 200 ) {
                $body = wp_remote_retrieve_body( $response );
                $data = json_decode( $body, true );

                if ( is_array( $data ) ) {
                    foreach ( $data as $page ) {
                        $pages[] = array(
                            'id'    => $page['id'] ?? 0,
                            'title' => $page['title']['rendered'] ?? __( 'بدون عنوان', 'elementor-copier' ),
                            'link'  => $page['link'] ?? '',
                            'type'  => 'page',
                        );
                    }
                }
            }
        }

        // Enhance pages with element structure
        return $this->enhance_pages_with_elements( $pages );
    }

    /**
     * Get list of posts from source site with hierarchical structure
     *
     * @return array List of posts with elements.
     */
    public function get_posts(): array {
        if ( empty( $this->source_url ) ) {
            return array();
        }

        // Use extractor if available
        if ( $this->extractor !== null ) {
            $posts = $this->extractor->get_posts();
            
            // Enhance posts with element structure
            return $this->enhance_pages_with_elements( $posts );
        }

        // Fallback to direct REST API call
        $posts = array();

        $rest_url = trailingslashit( $this->source_url ) . 'wp-json/wp/v2/posts';
        $response = wp_remote_get(
            $rest_url,
            array(
                'timeout'   => $this->timeout,
                'sslverify' => true,
            )
        );

        if ( ! is_wp_error( $response ) ) {
            $http_code = wp_remote_retrieve_response_code( $response );
            if ( $http_code === 200 ) {
                $body = wp_remote_retrieve_body( $response );
                $data = json_decode( $body, true );

                if ( is_array( $data ) ) {
                    foreach ( $data as $post ) {
                        $posts[] = array(
                            'id'    => $post['id'] ?? 0,
                            'title' => $post['title']['rendered'] ?? __( 'بدون عنوان', 'elementor-copier' ),
                            'link'  => $post['link'] ?? '',
                            'type'  => 'post',
                        );
                    }
                }
            }
        }

        // Enhance posts with element structure
        return $this->enhance_pages_with_elements( $posts );
    }

    /**
     * Get the detected extraction method
     *
     * @return string Extraction method.
     */
    public function get_extraction_method(): string {
        return $this->extraction_method;
    }

    /**
     * Get the source URL
     *
     * @return string Source URL.
     */
    public function get_source_url(): string {
        return $this->source_url;
    }

    /**
     * Get Elementor data for a specific post/page
     *
     * @param int $post_id Post or page ID.
     * @return array Elementor data structure.
     */
    public function get_elementor_data( int $post_id ): array {
        if ( $this->extractor === null ) {
            // Initialize extractor if not already done
            if ( empty( $this->extraction_method ) ) {
                $this->extraction_method = $this->choose_extraction_method();
            }
            $this->initialize_extractor();
        }

        if ( $this->extractor === null ) {
            return array(
                'success' => false,
                'error'   => array(
                    'code'       => 'no_extractor',
                    'message'    => __( 'استخراج‌کننده در دسترس نیست', 'elementor-copier' ),
                    'message_en' => 'No extractor available',
                ),
            );
        }

        $data = $this->extractor->get_elementor_data( $post_id );

        if ( empty( $data ) ) {
            $error = $this->extractor->get_last_error();
            return array(
                'success' => false,
                'error'   => ! empty( $error ) ? $error : array(
                    'code'       => 'extraction_failed',
                    'message'    => __( 'خطا در استخراج داده المنتور', 'elementor-copier' ),
                    'message_en' => 'Failed to extract Elementor data',
                ),
            );
        }

        return array(
            'success' => true,
            'data'    => $data,
        );
    }

    /**
     * Get the active extractor instance
     *
     * @return \ElementorCopier\Extractor\ExtractorInterface|null Extractor instance.
     */
    public function get_extractor() {
        return $this->extractor;
    }

    /**
     * Enhance pages/posts with hierarchical element structure
     *
     * @param array $items List of pages or posts.
     * @return array Enhanced list with elements.
     */
    private function enhance_pages_with_elements( array $items ): array {
        $enhanced = array();

        foreach ( $items as $item ) {
            $post_id = $item['id'] ?? 0;
            
            if ( empty( $post_id ) ) {
                continue;
            }

            // Get Elementor data for this page/post
            $elementor_result = $this->get_elementor_data( $post_id );
            
            $item['elements'] = array();
            
            if ( $elementor_result['success'] && ! empty( $elementor_result['data'] ) ) {
                // Parse elements to extract sections and widgets
                $item['elements'] = $this->parse_elementor_elements( $elementor_result['data'] );
            }
            
            $enhanced[] = $item;
        }

        return $enhanced;
    }

    /**
     * Parse Elementor elements into hierarchical structure
     *
     * @param array $elements Elementor elements data.
     * @return array Parsed elements with sections and widgets.
     */
    private function parse_elementor_elements( array $elements ): array {
        $parsed = array();

        foreach ( $elements as $element ) {
            $el_type = $element['elType'] ?? '';
            $el_id = $element['id'] ?? '';

            if ( $el_type === 'section' ) {
                // This is a section
                $section = array(
                    'id'      => $el_id,
                    'type'    => 'section',
                    'title'   => $this->get_element_title( $element, 'section' ),
                    'widgets' => array(),
                );

                // Parse columns and widgets within the section
                if ( ! empty( $element['elements'] ) ) {
                    foreach ( $element['elements'] as $column ) {
                        if ( ! empty( $column['elements'] ) ) {
                            foreach ( $column['elements'] as $widget ) {
                                if ( isset( $widget['widgetType'] ) ) {
                                    $section['widgets'][] = array(
                                        'id'    => $widget['id'] ?? '',
                                        'type'  => 'widget',
                                        'title' => $this->get_element_title( $widget, 'widget' ),
                                    );
                                }
                            }
                        }
                    }
                }

                $parsed[] = $section;
            } elseif ( isset( $element['widgetType'] ) ) {
                // This is a direct widget (not in a section)
                $parsed[] = array(
                    'id'    => $el_id,
                    'type'  => 'widget',
                    'title' => $this->get_element_title( $element, 'widget' ),
                );
            }
        }

        return $parsed;
    }

    /**
     * Get a meaningful title for an element
     *
     * @param array  $element Element data.
     * @param string $type Element type (section, widget).
     * @return string Element title.
     */
    private function get_element_title( array $element, string $type ): string {
        $title = '';

        if ( $type === 'widget' && isset( $element['widgetType'] ) ) {
            // Use widget type as base title
            $title = ucwords( str_replace( array( '-', '_' ), ' ', $element['widgetType'] ) );
        } elseif ( $type === 'section' ) {
            $title = __( 'Section', 'elementor-copier' );
        }

        // Try to get more specific title from settings
        $settings = $element['settings'] ?? array();
        
        if ( ! empty( $settings['title'] ) ) {
            $title .= ': ' . wp_trim_words( $settings['title'], 5 );
        } elseif ( ! empty( $settings['heading'] ) ) {
            $title .= ': ' . wp_trim_words( $settings['heading'], 5 );
        } elseif ( ! empty( $settings['text'] ) ) {
            $text = wp_strip_all_tags( $settings['text'] );
            $title .= ': ' . wp_trim_words( $text, 5 );
        } elseif ( ! empty( $settings['editor'] ) ) {
            $text = wp_strip_all_tags( $settings['editor'] );
            $title .= ': ' . wp_trim_words( $text, 5 );
        }

        return $title;
    }
}