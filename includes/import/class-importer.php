<?php
/**
 * Importer Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Import;

use ElementorCopier\ErrorLogger;
use ElementorCopier\Converter\VersionConverter;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Importer Class
 *
 * Handles importing of Elementor widgets, sections, and pages.
 */
class Importer {

    /**
     * Version converter instance
     *
     * @var VersionConverter
     */
    private $version_converter;

    /**
     * Media download results
     *
     * @var array
     */
    private $media_results = array(
        'total'      => 0,
        'downloaded' => 0,
        'failed'     => 0,
        'skipped'    => 0,
        'errors'     => array(),
    );

    /**
     * Constructor
     */
    public function __construct() {
        $this->version_converter = new VersionConverter();
    }

    /**
     * Get media download results
     *
     * @return array Media download statistics.
     */
    public function get_media_results() {
        return $this->media_results;
    }

    /**
     * Reset media results
     *
     * @return void
     */
    private function reset_media_results() {
        $this->media_results = array(
            'total'      => 0,
            'downloaded' => 0,
            'failed'     => 0,
            'skipped'    => 0,
            'errors'     => array(),
        );
    }

    /**
     * Import widget to target post
     *
     * @param array  $data           Widget data to import.
     * @param int    $target_post_id Target post ID.
     * @param string $position       Position to insert (top, bottom, replace).
     * @return string|\WP_Error Widget ID on success, WP_Error on failure.
     */
    public function import_widget( $data, $target_post_id, $position = 'bottom' ) {
        // Validate payload
        $validation_error = $this->validate_payload( $data, 'widget' );
        if ( is_wp_error( $validation_error ) ) {
            return $validation_error;
        }

        // Check if Elementor is active
        if ( ! $this->is_elementor_active() ) {
            return new \WP_Error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Verify target post exists and is Elementor-enabled
        $post_check = $this->verify_target_post( $target_post_id );
        if ( is_wp_error( $post_check ) ) {
            return $post_check;
        }

        // Handle media if present in payload
        if ( ! empty( $data['media'] ) ) {
            $widget_data = $this->handle_media( $data['data'], $data['media'] );
        } else {
            $widget_data = $data['data'];
        }

        // Convert data to current Elementor version
        $widget_data = $this->convert_data_version( array( $widget_data ) );
        $widget_data = reset( $widget_data ); // Get first element

        // Get document instance
        $document = \Elementor\Plugin::instance()->documents->get( $target_post_id );
        if ( ! $document ) {
            return new \WP_Error(
                'invalid_post',
                __( 'Could not get Elementor document for target post.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Get existing elements
        $elements = $document->get_elements_data();

        // Insert widget based on position
        $widget_id = $this->generate_unique_id();
        $widget_data['id'] = $widget_id;

        switch ( $position ) {
            case 'top':
                array_unshift( $elements, $widget_data );
                break;
            case 'replace':
                $elements = array( $widget_data );
                break;
            case 'bottom':
            default:
                $elements[] = $widget_data;
                break;
        }

        // Save the updated elements
        $save_result = $this->insert_elementor_data( $target_post_id, $elements );
        if ( is_wp_error( $save_result ) ) {
            return $save_result;
        }

        // Regenerate CSS
        $this->regenerate_css( $target_post_id );

        // Update preview data
        $this->update_preview_data( $target_post_id );

        return $widget_id;
    }

    /**
     * Import section to target post
     *
     * @param array  $data           Section data to import.
     * @param int    $target_post_id Target post ID.
     * @param string $position       Position to insert (top, bottom, replace).
     * @return string|\WP_Error Section ID on success, WP_Error on failure.
     */
    public function import_section( $data, $target_post_id, $position = 'bottom' ) {
        // Validate payload
        $validation_error = $this->validate_payload( $data, 'section' );
        if ( is_wp_error( $validation_error ) ) {
            return $validation_error;
        }

        // Check if Elementor is active
        if ( ! $this->is_elementor_active() ) {
            return new \WP_Error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Verify target post exists and is Elementor-enabled
        $post_check = $this->verify_target_post( $target_post_id );
        if ( is_wp_error( $post_check ) ) {
            return $post_check;
        }

        // Handle media if present in payload
        if ( ! empty( $data['media'] ) ) {
            $section_data = $this->handle_media( $data['data'], $data['media'] );
        } else {
            $section_data = $data['data'];
        }

        // Convert data to current Elementor version
        $section_data = $this->convert_data_version( array( $section_data ) );
        $section_data = reset( $section_data ); // Get first element

        // Get document instance
        $document = \Elementor\Plugin::instance()->documents->get( $target_post_id );
        if ( ! $document ) {
            return new \WP_Error(
                'invalid_post',
                __( 'Could not get Elementor document for target post.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Get existing elements
        $elements = $document->get_elements_data();

        // Insert section based on position
        $section_id = $this->generate_unique_id();
        $section_data['id'] = $section_id;

        // Regenerate IDs for all child elements
        $section_data = $this->regenerate_element_ids( $section_data );

        switch ( $position ) {
            case 'top':
                array_unshift( $elements, $section_data );
                break;
            case 'replace':
                $elements = array( $section_data );
                break;
            case 'bottom':
            default:
                $elements[] = $section_data;
                break;
        }

        // Save the updated elements
        $save_result = $this->insert_elementor_data( $target_post_id, $elements );
        if ( is_wp_error( $save_result ) ) {
            return $save_result;
        }

        // Regenerate CSS
        $this->regenerate_css( $target_post_id );

        // Update preview data
        $this->update_preview_data( $target_post_id );

        return $section_id;
    }

    /**
     * Import full page to target post
     *
     * @param array $data           Page data to import.
     * @param int   $target_post_id Target post ID.
     * @return bool|\WP_Error True on success, WP_Error on failure.
     */
    public function import_page( $data, $target_post_id ) {
        // Validate payload
        $validation_error = $this->validate_payload( $data, 'page' );
        if ( is_wp_error( $validation_error ) ) {
            return $validation_error;
        }

        // Check if Elementor is active
        if ( ! $this->is_elementor_active() ) {
            return new \WP_Error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Verify target post exists and is Elementor-enabled
        $post_check = $this->verify_target_post( $target_post_id );
        if ( is_wp_error( $post_check ) ) {
            return $post_check;
        }

        // Handle media if present in payload
        if ( ! empty( $data['media'] ) ) {
            $page_data = $this->handle_media( $data['data'], $data['media'] );
        } else {
            $page_data = $data['data'];
        }

        // Convert data to current Elementor version
        $page_data = $this->convert_data_version( $page_data );

        // Get document instance
        $document = \Elementor\Plugin::instance()->documents->get( $target_post_id );
        if ( ! $document ) {
            return new \WP_Error(
                'invalid_post',
                __( 'Could not get Elementor document for target post.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Regenerate IDs for all elements
        $page_data = $this->regenerate_element_ids( $page_data );

        // Save the page data (replaces all existing content)
        $save_result = $this->insert_elementor_data( $target_post_id, $page_data );
        if ( is_wp_error( $save_result ) ) {
            return $save_result;
        }

        // Regenerate CSS
        $this->regenerate_css( $target_post_id );

        // Update preview data
        $this->update_preview_data( $target_post_id );

        return true;
    }

    /**
     * Validate JSON payload structure
     *
     * @param array  $data Payload data.
     * @param string $type Expected type (widget, section, page).
     * @return true|\WP_Error True if valid, WP_Error otherwise.
     */
    private function validate_payload( $data, $type ) {
        // Check if data is an array
        if ( ! is_array( $data ) ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid payload: data must be an array.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Check required fields
        if ( ! isset( $data['type'] ) || ! isset( $data['data'] ) ) {
            return new \WP_Error(
                'invalid_data',
                __( 'Invalid payload: missing required fields (type, data).', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Verify type matches expected
        if ( $data['type'] !== $type ) {
            return new \WP_Error(
                'invalid_data',
                sprintf(
                    /* translators: %1$s: expected type, %2$s: actual type */
                    __( 'Invalid payload: expected type "%1$s", got "%2$s".', 'elementor-copier' ),
                    $type,
                    $data['type']
                ),
                array( 'status' => 400 )
            );
        }

        // Validate data structure based on type
        if ( 'widget' === $type ) {
            if ( ! isset( $data['data']['widgetType'] ) && ! isset( $data['data']['elType'] ) ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid widget data: missing widgetType or elType.', 'elementor-copier' ),
                    array( 'status' => 400 )
                );
            }
        } elseif ( 'section' === $type ) {
            if ( ! isset( $data['data']['elType'] ) || 'section' !== $data['data']['elType'] ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid section data: elType must be "section".', 'elementor-copier' ),
                    array( 'status' => 400 )
                );
            }
        } elseif ( 'page' === $type ) {
            if ( ! is_array( $data['data'] ) ) {
                return new \WP_Error(
                    'invalid_data',
                    __( 'Invalid page data: data must be an array of elements.', 'elementor-copier' ),
                    array( 'status' => 400 )
                );
            }
        }

        return true;
    }

    /**
     * Insert Elementor data into post
     *
     * @param int   $post_id Post ID.
     * @param array $data    Elements data.
     * @return bool|\WP_Error True on success, WP_Error on failure.
     */
    private function insert_elementor_data( $post_id, $data ) {
        try {
            $document = \Elementor\Plugin::instance()->documents->get( $post_id );
            if ( ! $document ) {
                return new \WP_Error(
                    'import_failed',
                    __( 'Failed to get document for saving.', 'elementor-copier' ),
                    array( 'status' => 500 )
                );
            }

            // Save elements
            $document->save( array( 'elements' => $data ) );

            return true;
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'import_failed',
                sprintf(
                    /* translators: %s: error message */
                    __( 'Failed to insert Elementor data: %s', 'elementor-copier' ),
                    $e->getMessage()
                ),
                array( 'status' => 500 )
            );
        }
    }

    /**
     * Regenerate CSS for post
     *
     * @param int $post_id Post ID.
     * @return void
     */
    private function regenerate_css( $post_id ) {
        // Clear Elementor cache
        \Elementor\Plugin::instance()->files_manager->clear_cache();

        // Regenerate CSS for this specific post
        $post_css = \Elementor\Core\Files\CSS\Post::create( $post_id );
        $post_css->update();
    }

    /**
     * Update preview data for post
     *
     * @param int $post_id Post ID.
     * @return void
     */
    private function update_preview_data( $post_id ) {
        // Update Elementor edit mode
        update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );

        // Clear post cache
        wp_cache_delete( $post_id, 'posts' );
        wp_cache_delete( $post_id, 'post_meta' );
    }

    /**
     * Check if Elementor is active
     *
     * @return bool True if active, false otherwise.
     */
    private function is_elementor_active() {
        return did_action( 'elementor/loaded' );
    }

    /**
     * Verify target post exists and is valid
     *
     * @param int $post_id Post ID.
     * @return true|\WP_Error True if valid, WP_Error otherwise.
     */
    private function verify_target_post( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) {
            return new \WP_Error(
                'invalid_post',
                __( 'Target post does not exist.', 'elementor-copier' ),
                array( 'status' => 404 )
            );
        }

        // Check if post type supports Elementor
        if ( ! \Elementor\Plugin::instance()->documents->get( $post_id ) ) {
            return new \WP_Error(
                'invalid_post',
                __( 'Target post does not support Elementor.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        return true;
    }

    /**
     * Generate unique ID for elements
     *
     * @return string Unique ID.
     */
    private function generate_unique_id() {
        return dechex( mt_rand() );
    }

    /**
     * Regenerate IDs for element and all children
     *
     * @param array $element Element data.
     * @return array Element data with new IDs.
     */
    private function regenerate_element_ids( $element ) {
        if ( is_array( $element ) ) {
            // Regenerate ID for this element
            if ( isset( $element['id'] ) ) {
                $element['id'] = $this->generate_unique_id();
            }

            // Recursively regenerate IDs for child elements
            if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
                foreach ( $element['elements'] as $key => $child ) {
                    $element['elements'][ $key ] = $this->regenerate_element_ids( $child );
                }
            }
        }

        return $element;
    }

    /**
     * Handle media downloads and URL replacement
     *
     * @param array $data  Widget/section/page data.
     * @param array $media Array of media URLs from export.
     * @return array Data with updated media URLs.
     */
    private function handle_media( $data, $media ) {
        if ( empty( $media ) || ! is_array( $media ) ) {
            return $data;
        }

        // Reset media results for this import
        $this->reset_media_results();
        $this->media_results['total'] = count( $media );

        ErrorLogger::log_info(
            'Starting media download',
            ErrorLogger::CATEGORY_MEDIA,
            array( 'total_files' => $this->media_results['total'] )
        );

        // Build URL mapping (old URL => new URL)
        $url_map = array();

        foreach ( $media as $index => $media_item ) {
            if ( ! isset( $media_item['url'] ) || empty( $media_item['url'] ) ) {
                $this->media_results['skipped']++;
                continue;
            }

            $old_url = $media_item['url'];

            ErrorLogger::log_debug(
                'Processing media file',
                ErrorLogger::CATEGORY_MEDIA,
                array(
                    'index' => $index + 1,
                    'total' => $this->media_results['total'],
                    'url'   => $old_url,
                )
            );

            // Try to download and upload the media
            $new_attachment_id = $this->download_and_upload_media( $old_url );

            if ( ! is_wp_error( $new_attachment_id ) && $new_attachment_id > 0 ) {
                // Get the new URL
                $new_url = wp_get_attachment_url( $new_attachment_id );
                if ( $new_url ) {
                    $url_map[ $old_url ] = array(
                        'url' => $new_url,
                        'id'  => $new_attachment_id,
                    );
                    $this->media_results['downloaded']++;

                    ErrorLogger::log_info(
                        'Media downloaded successfully',
                        ErrorLogger::CATEGORY_MEDIA,
                        array(
                            'old_url'       => $old_url,
                            'new_url'       => $new_url,
                            'attachment_id' => $new_attachment_id,
                        )
                    );
                }
            } else {
                // Log error but continue with graceful degradation
                $error_message = is_wp_error( $new_attachment_id ) ? $new_attachment_id->get_error_message() : 'Unknown error';
                
                ErrorLogger::log_media_error(
                    'Failed to download media: ' . $error_message,
                    array(
                        'url'        => $old_url,
                        'error_code' => is_wp_error( $new_attachment_id ) ? $new_attachment_id->get_error_code() : 'unknown',
                    )
                );

                // Track failure
                $this->media_results['failed']++;
                $this->media_results['errors'][] = array(
                    'url'     => $old_url,
                    'message' => $error_message,
                );

                // Keep original URL (graceful degradation)
                $url_map[ $old_url ] = array(
                    'url' => $old_url,
                    'id'  => null,
                );
            }
        }

        ErrorLogger::log_info(
            'Media download completed',
            ErrorLogger::CATEGORY_MEDIA,
            array(
                'total'      => $this->media_results['total'],
                'downloaded' => $this->media_results['downloaded'],
                'failed'     => $this->media_results['failed'],
                'skipped'    => $this->media_results['skipped'],
            )
        );

        // Replace URLs in the data
        if ( ! empty( $url_map ) ) {
            $data = $this->replace_media_urls( $data, $url_map );
        }

        return $data;
    }

    /**
     * Download media from source and upload to target site
     *
     * @param string $url Media URL to download.
     * @return int|\WP_Error Attachment ID on success, WP_Error on failure.
     */
    private function download_and_upload_media( $url ) {
        // Validate URL
        if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
            return ErrorLogger::create_error(
                'invalid_url',
                __( 'Invalid media URL provided.', 'elementor-copier' ),
                array(),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        ErrorLogger::log_debug(
            'Attempting to download media',
            ErrorLogger::CATEGORY_MEDIA,
            array( 'url' => $url )
        );

        // Check if media already exists by URL
        $existing_attachment = $this->get_attachment_by_url( $url );
        if ( $existing_attachment ) {
            ErrorLogger::log_debug(
                'Media already exists, reusing',
                ErrorLogger::CATEGORY_MEDIA,
                array(
                    'url'           => $url,
                    'attachment_id' => $existing_attachment,
                )
            );
            return $existing_attachment;
        }

        // Download the file
        $temp_file = $this->download_media_file( $url );
        if ( is_wp_error( $temp_file ) ) {
            return $temp_file;
        }

        // Get file name from URL
        $filename = basename( wp_parse_url( $url, PHP_URL_PATH ) );
        
        // Sanitize filename
        $filename = sanitize_file_name( $filename );

        // Upload to media library
        $attachment_id = $this->upload_to_media_library( $temp_file, $filename );

        // Clean up temp file
        if ( file_exists( $temp_file ) ) {
            @unlink( $temp_file );
        }

        if ( ! is_wp_error( $attachment_id ) ) {
            ErrorLogger::log_info(
                'Media downloaded and uploaded successfully',
                ErrorLogger::CATEGORY_MEDIA,
                array(
                    'url'           => $url,
                    'attachment_id' => $attachment_id,
                )
            );
        }

        return $attachment_id;
    }

    /**
     * Download media file to temporary location
     *
     * @param string $url Media URL.
     * @return string|\WP_Error Temporary file path on success, WP_Error on failure.
     */
    private function download_media_file( $url ) {
        // Use WordPress HTTP API
        $response = wp_remote_get(
            $url,
            array(
                'timeout'  => 30,
                'sslverify' => false, // Allow self-signed certificates in development
            )
        );

        if ( is_wp_error( $response ) ) {
            return ErrorLogger::create_error(
                'download_failed',
                sprintf(
                    /* translators: %s: error message */
                    __( 'Failed to download media: %s', 'elementor-copier' ),
                    $response->get_error_message()
                ),
                array( 'url' => $url ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        $response_code = wp_remote_retrieve_response_code( $response );
        if ( 200 !== $response_code ) {
            return ErrorLogger::create_error(
                'download_failed',
                sprintf(
                    /* translators: %d: HTTP response code */
                    __( 'Failed to download media. HTTP response code: %d', 'elementor-copier' ),
                    $response_code
                ),
                array(
                    'url'          => $url,
                    'status_code'  => $response_code,
                ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        $body = wp_remote_retrieve_body( $response );
        if ( empty( $body ) ) {
            return ErrorLogger::create_error(
                'download_failed',
                __( 'Downloaded media file is empty.', 'elementor-copier' ),
                array( 'url' => $url ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        // Create temporary file
        $temp_file = wp_tempnam();
        if ( ! $temp_file ) {
            return ErrorLogger::create_error(
                'temp_file_failed',
                __( 'Failed to create temporary file.', 'elementor-copier' ),
                array( 'url' => $url ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        // Write content to temp file
        $written = file_put_contents( $temp_file, $body );
        if ( false === $written ) {
            @unlink( $temp_file );
            return ErrorLogger::create_error(
                'write_failed',
                __( 'Failed to write media to temporary file.', 'elementor-copier' ),
                array( 'url' => $url ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        return $temp_file;
    }

    /**
     * Upload file to WordPress media library
     *
     * @param string $file_path Path to file.
     * @param string $filename  Desired filename.
     * @return int|\WP_Error Attachment ID on success, WP_Error on failure.
     */
    private function upload_to_media_library( $file_path, $filename ) {
        // Ensure WordPress media functions are available
        if ( ! function_exists( 'wp_handle_sideload' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
            require_once ABSPATH . 'wp-admin/includes/image.php';
        }
        if ( ! function_exists( 'media_handle_sideload' ) ) {
            require_once ABSPATH . 'wp-admin/includes/media.php';
        }

        // Prepare file array for sideload
        $file_array = array(
            'name'     => $filename,
            'tmp_name' => $file_path,
        );

        // Upload the file
        $upload_result = wp_handle_sideload(
            $file_array,
            array(
                'test_form' => false,
                'test_type' => false,
            )
        );

        if ( isset( $upload_result['error'] ) ) {
            return ErrorLogger::create_error(
                'upload_failed',
                sprintf(
                    /* translators: %s: error message */
                    __( 'Failed to upload media: %s', 'elementor-copier' ),
                    $upload_result['error']
                ),
                array( 'filename' => $filename ),
                ErrorLogger::CATEGORY_MEDIA
            );
        }

        // Create attachment post
        $attachment_data = array(
            'post_mime_type' => $upload_result['type'],
            'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
            'post_content'   => '',
            'post_status'    => 'inherit',
        );

        $attachment_id = wp_insert_attachment( $attachment_data, $upload_result['file'] );

        if ( is_wp_error( $attachment_id ) ) {
            ErrorLogger::log_media_error(
                'Failed to create attachment post: ' . $attachment_id->get_error_message(),
                array(
                    'filename'   => $filename,
                    'error_code' => $attachment_id->get_error_code(),
                )
            );
            return $attachment_id;
        }

        // Generate attachment metadata
        $attachment_metadata = wp_generate_attachment_metadata( $attachment_id, $upload_result['file'] );
        wp_update_attachment_metadata( $attachment_id, $attachment_metadata );

        return $attachment_id;
    }

    /**
     * Check if attachment already exists by URL
     *
     * @param string $url Media URL.
     * @return int|false Attachment ID if found, false otherwise.
     */
    private function get_attachment_by_url( $url ) {
        global $wpdb;

        // Try to find by guid (exact match)
        $attachment_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE guid = %s AND post_type = 'attachment' LIMIT 1",
                $url
            )
        );

        if ( $attachment_id ) {
            return (int) $attachment_id;
        }

        // Try to find by filename
        $filename = basename( wp_parse_url( $url, PHP_URL_PATH ) );
        $attachment_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' AND guid LIKE %s LIMIT 1",
                '%' . $wpdb->esc_like( $filename )
            )
        );

        return $attachment_id ? (int) $attachment_id : false;
    }

    /**
     * Convert data to current Elementor version
     *
     * @param array $data Elementor data.
     * @return array Converted data.
     */
    private function convert_data_version( array $data ): array {
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $data;
        }

        // Detect version
        $version = $this->version_converter->detect_version( $data );

        // Log version detection
        ErrorLogger::log_debug(
            'Detected Elementor version',
            ErrorLogger::CATEGORY_IMPORT,
            array( 'version' => $version )
        );

        // Convert if needed
        if ( $version !== '3.x' ) {
            ErrorLogger::log_info(
                'Converting Elementor data from older version',
                ErrorLogger::CATEGORY_IMPORT,
                array(
                    'from_version' => $version,
                    'to_version'   => '3.x',
                )
            );

            $data = $this->version_converter->convert_to_current( $data, $version );

            // Validate converted data
            if ( ! $this->version_converter->validate_converted_data( $data ) ) {
                ErrorLogger::log_error(
                    'Version conversion resulted in invalid data structure',
                    ErrorLogger::CATEGORY_IMPORT,
                    array( 'from_version' => $version )
                );
            } else {
                ErrorLogger::log_info(
                    'Version conversion completed successfully',
                    ErrorLogger::CATEGORY_IMPORT,
                    array( 'from_version' => $version )
                );
            }
        }

        return $data;
    }

    /**
     * Replace media URLs in data recursively
     *
     * @param mixed $data    Data to process.
     * @param array $url_map URL mapping (old => new).
     * @return mixed Processed data.
     */
    private function replace_media_urls( $data, $url_map ) {
        if ( is_array( $data ) ) {
            foreach ( $data as $key => $value ) {
                if ( is_string( $value ) && isset( $url_map[ $value ] ) ) {
                    // Direct URL string replacement
                    $data[ $key ] = $url_map[ $value ]['url'];
                } elseif ( is_array( $value ) ) {
                    // Check if this is an image object with URL and ID
                    if ( isset( $value['url'] ) && isset( $url_map[ $value['url'] ] ) ) {
                        $data[ $key ]['url'] = $url_map[ $value['url'] ]['url'];
                        if ( $url_map[ $value['url'] ]['id'] ) {
                            $data[ $key ]['id'] = $url_map[ $value['url'] ]['id'];
                        }
                    } else {
                        // Recursively process nested arrays
                        $data[ $key ] = $this->replace_media_urls( $value, $url_map );
                    }
                }
            }
        }

        return $data;
    }

    /**
     * Create new page with imported content
     *
     * @param array  $data       Page data to import.
     * @param string $page_title Title for the new page.
     * @return int|\WP_Error Post ID on success, WP_Error on failure.
     */
    public function create_new_page( $data, $page_title ) {
        // Check if Elementor is active
        if ( ! $this->is_elementor_active() ) {
            return new \WP_Error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Create new page
        $new_page = array(
            'post_title'   => sanitize_text_field( $page_title ),
            'post_content' => '',
            'post_status'  => 'draft',
            'post_type'    => 'page',
        );

        $post_id = wp_insert_post( $new_page );

        if ( is_wp_error( $post_id ) ) {
            ErrorLogger::log_import_error(
                'Failed to create new page: ' . $post_id->get_error_message(),
                array(
                    'page_title' => $page_title,
                    'error_code' => $post_id->get_error_code(),
                )
            );
            return $post_id;
        }

        // Enable Elementor for this page
        update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );

        // Import the content to the new page
        $import_result = $this->import_page( $data, $post_id );

        if ( is_wp_error( $import_result ) ) {
            // Delete the page if import failed
            wp_delete_post( $post_id, true );
            return $import_result;
        }

        ErrorLogger::log_info(
            'New page created successfully',
            ErrorLogger::CATEGORY_IMPORT,
            array(
                'post_id'    => $post_id,
                'page_title' => $page_title,
            )
        );

        return $post_id;
    }

    /**
     * Create template with imported content
     *
     * @param array  $data           Template data to import.
     * @param string $template_title Title for the template.
     * @param string $template_type  Type of template (page, section).
     * @return int|\WP_Error Template ID on success, WP_Error on failure.
     */
    public function create_template( $data, $template_title, $template_type = 'page' ) {
        // Check if Elementor is active
        if ( ! $this->is_elementor_active() ) {
            return new \WP_Error(
                'elementor_not_found',
                __( 'Elementor is not active on this site.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Validate template type
        $valid_types = array( 'page', 'section' );
        if ( ! in_array( $template_type, $valid_types, true ) ) {
            return new \WP_Error(
                'invalid_template_type',
                __( 'Invalid template type. Must be page or section.', 'elementor-copier' ),
                array( 'status' => 400 )
            );
        }

        // Create new template post
        $new_template = array(
            'post_title'   => sanitize_text_field( $template_title ),
            'post_content' => '',
            'post_status'  => 'publish',
            'post_type'    => 'elementor_library',
        );

        $template_id = wp_insert_post( $new_template );

        if ( is_wp_error( $template_id ) ) {
            ErrorLogger::log_import_error(
                'Failed to create template: ' . $template_id->get_error_message(),
                array(
                    'template_title' => $template_title,
                    'template_type'  => $template_type,
                    'error_code'     => $template_id->get_error_code(),
                )
            );
            return $template_id;
        }

        // Set template type
        update_post_meta( $template_id, '_elementor_template_type', $template_type );
        update_post_meta( $template_id, '_elementor_edit_mode', 'builder' );

        // Handle media if present in payload
        if ( ! empty( $data['media'] ) ) {
            $template_data = $this->handle_media( $data['data'], $data['media'] );
        } else {
            $template_data = isset( $data['data'] ) ? $data['data'] : $data;
        }

        // Convert data to current Elementor version
        if ( is_array( $template_data ) && ! isset( $template_data['elType'] ) ) {
            // This is a full page data (array of elements)
            $template_data = $this->convert_data_version( $template_data );
        } else {
            // This is a single element
            $template_data = $this->convert_data_version( array( $template_data ) );
        }

        // Regenerate IDs for all elements
        if ( is_array( $template_data ) ) {
            foreach ( $template_data as $key => $element ) {
                $template_data[ $key ] = $this->regenerate_element_ids( $element );
            }
        }

        // Save the template data
        $save_result = $this->insert_elementor_data( $template_id, $template_data );

        if ( is_wp_error( $save_result ) ) {
            // Delete the template if save failed
            wp_delete_post( $template_id, true );
            return $save_result;
        }

        // Regenerate CSS
        $this->regenerate_css( $template_id );

        ErrorLogger::log_info(
            'Template created successfully',
            ErrorLogger::CATEGORY_IMPORT,
            array(
                'template_id'    => $template_id,
                'template_title' => $template_title,
                'template_type'  => $template_type,
            )
        );

        return $template_id;
    }
}
