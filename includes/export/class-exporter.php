<?php
/**
 * Exporter Class
 *
 * Handles extraction of Elementor widget, section, and page data.
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Export;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Exporter Class
 *
 * Extracts Elementor data and prepares it for export.
 */
class Exporter {

    /**
     * Export a single widget
     *
     * @param int    $post_id   The post ID containing the widget.
     * @param string $widget_id The widget ID to export.
     * @return array|WP_Error Widget data array or WP_Error on failure.
     */
    public function export_widget( $post_id, $widget_id ) {
        // Validate post ID
        if ( ! $this->validate_post_id( $post_id ) ) {
            return new \WP_Error(
                'invalid_post_id',
                __( 'Invalid post ID provided.', 'elementor-copier' )
            );
        }

        // Get Elementor data
        $elementor_data = $this->get_elementor_data( $post_id );
        if ( is_wp_error( $elementor_data ) ) {
            return $elementor_data;
        }

        // Find the specific widget
        $widget_data = $this->find_widget_by_id( $elementor_data, $widget_id );
        if ( ! $widget_data ) {
            return new \WP_Error(
                'widget_not_found',
                __( 'Widget not found in the specified post.', 'elementor-copier' )
            );
        }

        // Extract media URLs
        $media_urls = $this->extract_media_urls( $widget_data );

        // Prepare payload
        return $this->prepare_payload( $widget_data, 'widget', $media_urls );
    }

    /**
     * Export a section with all its widgets
     *
     * @param int    $post_id    The post ID containing the section.
     * @param string $section_id The section ID to export.
     * @return array|WP_Error Section data array or WP_Error on failure.
     */
    public function export_section( $post_id, $section_id ) {
        // Validate post ID
        if ( ! $this->validate_post_id( $post_id ) ) {
            return new \WP_Error(
                'invalid_post_id',
                __( 'Invalid post ID provided.', 'elementor-copier' )
            );
        }

        // Get Elementor data
        $elementor_data = $this->get_elementor_data( $post_id );
        if ( is_wp_error( $elementor_data ) ) {
            return $elementor_data;
        }

        // Find the specific section
        $section_data = $this->find_section_by_id( $elementor_data, $section_id );
        if ( ! $section_data ) {
            return new \WP_Error(
                'section_not_found',
                __( 'Section not found in the specified post.', 'elementor-copier' )
            );
        }

        // Extract media URLs from all widgets in the section
        $media_urls = $this->extract_media_urls( $section_data );

        // Prepare payload
        return $this->prepare_payload( $section_data, 'section', $media_urls );
    }

    /**
     * Export a full page with all sections and widgets
     *
     * @param int $post_id The post ID to export.
     * @return array|WP_Error Page data array or WP_Error on failure.
     */
    public function export_page( $post_id ) {
        // Validate post ID
        if ( ! $this->validate_post_id( $post_id ) ) {
            return new \WP_Error(
                'invalid_post_id',
                __( 'Invalid post ID provided.', 'elementor-copier' )
            );
        }

        // Get Elementor data
        $elementor_data = $this->get_elementor_data( $post_id );
        if ( is_wp_error( $elementor_data ) ) {
            return $elementor_data;
        }

        // Extract media URLs from entire page
        $media_urls = $this->extract_media_urls( $elementor_data );

        // Prepare payload with all page data
        return $this->prepare_payload( $elementor_data, 'page', $media_urls );
    }

    /**
     * Get Elementor data from a post
     *
     * @param int $post_id The post ID.
     * @return array|WP_Error Elementor data array or WP_Error on failure.
     */
    private function get_elementor_data( $post_id ) {
        // Check if Elementor is loaded
        if ( ! did_action( 'elementor/loaded' ) ) {
            return new \WP_Error(
                'elementor_not_loaded',
                __( 'Elementor is not loaded.', 'elementor-copier' )
            );
        }

        // Get the document
        $document = \Elementor\Plugin::instance()->documents->get( $post_id );
        
        if ( ! $document ) {
            return new \WP_Error(
                'document_not_found',
                __( 'Elementor document not found for this post.', 'elementor-copier' )
            );
        }

        // Get elements data
        $data = $document->get_elements_data();

        if ( empty( $data ) ) {
            return new \WP_Error(
                'no_elementor_data',
                __( 'No Elementor data found for this post.', 'elementor-copier' )
            );
        }

        return $data;
    }

    /**
     * Find a widget by ID in Elementor data
     *
     * @param array  $data      Elementor data array.
     * @param string $widget_id Widget ID to find.
     * @return array|null Widget data or null if not found.
     */
    private function find_widget_by_id( $data, $widget_id ) {
        foreach ( $data as $element ) {
            // Check if this is the widget we're looking for
            if ( isset( $element['id'] ) && $element['id'] === $widget_id ) {
                return $element;
            }

            // Recursively search in child elements
            if ( ! empty( $element['elements'] ) ) {
                $found = $this->find_widget_by_id( $element['elements'], $widget_id );
                if ( $found ) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * Find a section by ID in Elementor data
     *
     * @param array  $data       Elementor data array.
     * @param string $section_id Section ID to find.
     * @return array|null Section data or null if not found.
     */
    private function find_section_by_id( $data, $section_id ) {
        foreach ( $data as $element ) {
            // Check if this is the section we're looking for
            if ( isset( $element['id'] ) && $element['id'] === $section_id && $element['elType'] === 'section' ) {
                return $element;
            }
        }

        return null;
    }

    /**
     * Extract media URLs from widget data
     *
     * @param array $data Widget or section data.
     * @return array Array of media URLs with their IDs.
     */
    private function extract_media_urls( $data ) {
        $media = array();

        // Recursively search for media in the data
        $this->search_for_media( $data, $media );

        return $media;
    }

    /**
     * Recursively search for media URLs in data
     *
     * @param mixed $data  Data to search.
     * @param array &$media Reference to media array to populate.
     */
    private function search_for_media( $data, &$media ) {
        if ( is_array( $data ) ) {
            foreach ( $data as $key => $value ) {
                // Check for common media fields
                if ( in_array( $key, array( 'url', 'image', 'background_image', 'bg_image' ), true ) ) {
                    if ( is_array( $value ) && isset( $value['url'] ) ) {
                        // Image object with URL and ID
                        $media[] = array(
                            'url' => $value['url'],
                            'id'  => isset( $value['id'] ) ? $value['id'] : null,
                        );
                    } elseif ( is_string( $value ) && $this->is_media_url( $value ) ) {
                        // Direct URL string
                        $media[] = array(
                            'url' => $value,
                            'id'  => null,
                        );
                    }
                }

                // Recursively search nested arrays
                if ( is_array( $value ) ) {
                    $this->search_for_media( $value, $media );
                }
            }
        }
    }

    /**
     * Check if a string is a media URL
     *
     * @param string $url URL to check.
     * @return bool True if it's a media URL.
     */
    private function is_media_url( $url ) {
        if ( ! is_string( $url ) || empty( $url ) ) {
            return false;
        }

        // Check if it's a valid URL
        if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return false;
        }

        // Check for common media file extensions
        $media_extensions = array( 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'mp4', 'webm', 'pdf' );
        $extension = strtolower( pathinfo( $url, PATHINFO_EXTENSION ) );

        return in_array( $extension, $media_extensions, true );
    }

    /**
     * Prepare export payload with metadata
     *
     * @param array  $data       Widget, section, or page data.
     * @param string $type       Type of export (widget, section, page).
     * @param array  $media_urls Array of media URLs.
     * @return array Formatted payload.
     */
    private function prepare_payload( $data, $type, $media_urls ) {
        $payload = array(
            'type'     => $type,
            'data'     => $data,
            'media'    => $media_urls,
            'metadata' => array(
                'elementor_version' => defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : 'unknown',
                'export_date'       => current_time( 'mysql' ),
                'export_timestamp'  => time(),
                'wordpress_version' => get_bloginfo( 'version' ),
                'php_version'       => PHP_VERSION,
            ),
        );

        // Add type-specific metadata
        if ( 'widget' === $type && isset( $data['widgetType'] ) ) {
            $payload['widget_type'] = $data['widgetType'];
        }

        if ( isset( $data['id'] ) ) {
            $payload['id'] = $data['id'];
        }

        if ( isset( $data['settings'] ) ) {
            $payload['settings'] = $data['settings'];
        }

        if ( isset( $data['elements'] ) ) {
            $payload['elements'] = $data['elements'];
        }

        return $payload;
    }

    /**
     * Validate post ID
     *
     * @param int $post_id Post ID to validate.
     * @return bool True if valid.
     */
    private function validate_post_id( $post_id ) {
        if ( ! is_numeric( $post_id ) || $post_id <= 0 ) {
            return false;
        }

        $post = get_post( $post_id );
        if ( ! $post ) {
            return false;
        }

        return true;
    }
}

