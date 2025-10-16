<?php
/**
 * Extractor Interface
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Extractor;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * ExtractorInterface defines the contract for all extractor implementations
 */
interface ExtractorInterface {

    /**
     * Check if this extractor can extract data from the given URL
     *
     * @param string $url Source site URL.
     * @return bool True if extraction is possible.
     */
    public function can_extract( string $url ): bool;

    /**
     * Get list of pages from source site
     *
     * @return array List of pages with id, title, link, and type.
     */
    public function get_pages(): array;

    /**
     * Get list of posts from source site
     *
     * @return array List of posts with id, title, link, and type.
     */
    public function get_posts(): array;

    /**
     * Get Elementor data for a specific post/page
     *
     * @param int $post_id Post or page ID.
     * @return array Elementor data structure.
     */
    public function get_elementor_data( int $post_id ): array;

    /**
     * Set authentication credentials
     *
     * @param array $auth Authentication credentials.
     * @return void
     */
    public function set_auth( array $auth ): void;

    /**
     * Get the last error that occurred
     *
     * @return array Error information with code, message, and details.
     */
    public function get_last_error(): array;
}
