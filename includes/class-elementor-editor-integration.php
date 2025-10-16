<?php
/**
 * Elementor Editor Integration
 * 
 * Adds paste functionality directly in the Elementor editor interface
 *
 * @package ElementorCopier
 */

namespace ElementorCopier;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Elementor Editor Integration Class
 */
class ElementorEditorIntegration {

    /**
     * Constructor
     */
    public function __construct() {
        // Add paste button to Elementor editor
        add_action( 'elementor/editor/before_enqueue_scripts', array( $this, 'enqueue_editor_scripts' ) );
        
        // Add AJAX handler for paste in editor
        add_action( 'wp_ajax_elementor_copier_paste_in_editor', array( $this, 'handle_paste_in_editor' ) );
        
        // Add custom Elementor panel section
        add_action( 'elementor/editor/footer', array( $this, 'add_paste_panel' ) );
    }

    /**
     * Enqueue scripts for Elementor editor
     */
    public function enqueue_editor_scripts() {
        // Enqueue editor integration script
        wp_enqueue_script(
            'elementor-copier-editor',
            ELEMENTOR_COPIER_PLUGIN_URL . 'assets/js/elementor-editor.js',
            array( 'jquery', 'elementor-editor' ),
            ELEMENTOR_COPIER_VERSION,
            true
        );

        // Enqueue editor styles
        wp_enqueue_style(
            'elementor-copier-editor',
            ELEMENTOR_COPIER_PLUGIN_URL . 'assets/css/elementor-editor.css',
            array(),
            ELEMENTOR_COPIER_VERSION
        );

        // Localize script with AJAX URL and nonce
        wp_localize_script(
            'elementor-copier-editor',
            'elementorCopierEditor',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce' => wp_create_nonce( 'elementor_copier_paste_in_editor' ),
                'i18n' => array(
                    'pasteButton' => __( 'Paste from Clipboard', 'elementor-copier' ),
                    'pasteButtonPersian' => __( 'جایگذاری از کلیپ‌بورد', 'elementor-copier' ),
                    'pasteSuccess' => __( 'Element pasted successfully!', 'elementor-copier' ),
                    'pasteError' => __( 'Failed to paste element. Please try again.', 'elementor-copier' ),
                    'invalidData' => __( 'Invalid clipboard data. Please copy an element first.', 'elementor-copier' ),
                    'noClipboard' => __( 'Clipboard API not available. Please use HTTPS.', 'elementor-copier' ),
                    'processing' => __( 'Processing...', 'elementor-copier' ),
                    'readingClipboard' => __( 'Reading clipboard...', 'elementor-copier' ),
                    'importing' => __( 'Importing element...', 'elementor-copier' ),
                )
            )
        );
    }

    /**
     * Add paste panel to Elementor editor
     */
    public function add_paste_panel() {
        ?>
        <div id="elementor-copier-paste-panel" style="display: none;">
            <div class="elementor-copier-paste-container">
                <button id="elementor-copier-paste-btn" class="elementor-button elementor-button-success">
                    <i class="eicon-clipboard"></i>
                    <span class="elementor-copier-btn-text"><?php esc_html_e( 'Paste from Clipboard', 'elementor-copier' ); ?></span>
                    <span class="elementor-copier-btn-text-persian"><?php esc_html_e( 'جایگذاری از کلیپ‌بورد', 'elementor-copier' ); ?></span>
                </button>
                <div id="elementor-copier-paste-status" class="elementor-copier-status"></div>
            </div>
        </div>
        <?php
    }

    /**
     * Handle paste in editor AJAX request
     */
    public function handle_paste_in_editor() {
        // Verify nonce
        check_ajax_referer( 'elementor_copier_paste_in_editor', 'nonce' );

        // Check user capabilities
        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_send_json_error( array(
                'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' )
            ) );
        }

        // Get clipboard data from request
        $clipboard_data = isset( $_POST['clipboard_data'] ) ? wp_unslash( $_POST['clipboard_data'] ) : '';
        
        if ( empty( $clipboard_data ) ) {
            wp_send_json_error( array(
                'message' => __( 'No clipboard data received.', 'elementor-copier' )
            ) );
        }

        // Decode JSON data
        $data = json_decode( $clipboard_data, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid JSON data.', 'elementor-copier' )
            ) );
        }

        // Validate data structure
        if ( ! $this->validate_clipboard_data( $data ) ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid clipboard data structure.', 'elementor-copier' )
            ) );
        }

        // Get post ID from request
        $post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
        
        if ( ! $post_id ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid post ID.', 'elementor-copier' )
            ) );
        }

        // Process and sanitize element data
        $element_data = $this->process_element_data( $data['data'] );

        // Return the processed element data for Elementor to insert
        wp_send_json_success( array(
            'message' => __( 'Element data processed successfully.', 'elementor-copier' ),
            'elementData' => $element_data,
            'elementType' => $data['elementType'],
            'metadata' => isset( $data['metadata'] ) ? $data['metadata'] : array()
        ) );
    }

    /**
     * Validate clipboard data structure
     */
    private function validate_clipboard_data( $data ) {
        // Check required fields
        if ( ! isset( $data['type'] ) || $data['type'] !== 'elementor-copier' ) {
            return false;
        }

        if ( ! isset( $data['version'] ) || ! isset( $data['elementType'] ) || ! isset( $data['data'] ) ) {
            return false;
        }

        return true;
    }

    /**
     * Process and sanitize element data
     */
    private function process_element_data( $element_data ) {
        // Sanitize element data recursively
        $sanitized = $this->sanitize_element_recursive( $element_data );

        return $sanitized;
    }

    /**
     * Recursively sanitize element data
     */
    private function sanitize_element_recursive( $data ) {
        if ( ! is_array( $data ) ) {
            return $data;
        }

        $sanitized = array();

        foreach ( $data as $key => $value ) {
            if ( is_array( $value ) ) {
                $sanitized[ $key ] = $this->sanitize_element_recursive( $value );
            } elseif ( is_string( $value ) ) {
                // Sanitize based on key
                if ( $key === 'editor' || $key === 'content' || strpos( $key, 'html' ) !== false ) {
                    // Allow HTML for content fields
                    $sanitized[ $key ] = wp_kses_post( $value );
                } elseif ( strpos( $key, 'url' ) !== false || strpos( $key, 'link' ) !== false ) {
                    // Sanitize URLs
                    $sanitized[ $key ] = esc_url_raw( $value );
                } else {
                    // Default text sanitization
                    $sanitized[ $key ] = sanitize_text_field( $value );
                }
            } else {
                $sanitized[ $key ] = $value;
            }
        }

        return $sanitized;
    }
}
<?php
/**
 * Elementor Editor Integration
 * 
 * Adds "Paste from Clipboard" functionality directly in the Elementor editor
 *
 * @package ElementorCopier
 */

namespace ElementorCopier;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Elementor Editor Integration Class
 */
class ElementorEditorIntegration {

    /**
     * Constructor
     */
    public function __construct() {
        // Add paste button to Elementor editor panel
        add_action( 'elementor/editor/before_enqueue_scripts', array( $this, 'enqueue_editor_scripts' ) );
        
        // Add AJAX handler for paste operation
        add_action( 'wp_ajax_elementor_copier_paste_in_editor', array( $this, 'handle_paste_ajax' ) );
        
        // Add custom Elementor panel tab
        add_action( 'elementor/editor/after_enqueue_styles', array( $this, 'enqueue_editor_styles' ) );
    }

    /**
     * Enqueue scripts in Elementor editor
     */
    public function enqueue_editor_scripts() {
        wp_enqueue_script(
            'elementor-copier-editor',
            ELEMENTOR_COPIER_PLUGIN_URL . 'assets/js/elementor-editor.js',
            array( 'jquery', 'elementor-editor' ),
            ELEMENTOR_COPIER_VERSION,
            true
        );

        wp_localize_script(
            'elementor-copier-editor',
            'elementorCopierEditor',
            array(
                'ajaxUrl' => admin_url( 'admin-ajax.php' ),
                'nonce' => wp_create_nonce( 'elementor_copier_paste' ),
                'i18n' => array(
                    'pasteButton' => __( 'Paste from Clipboard', 'elementor-copier' ),
                    'pasteButtonPersian' => __( 'جایگذاری از کلیپ‌بورد', 'elementor-copier' ),
                    'pasteSuccess' => __( 'Element pasted successfully!', 'elementor-copier' ),
                    'pasteError' => __( 'Failed to paste element. Please try again.', 'elementor-copier' ),
                    'invalidData' => __( 'Invalid clipboard data. Please copy an element first.', 'elementor-copier' ),
                    'noClipboard' => __( 'Clipboard API not available. Please use HTTPS.', 'elementor-copier' ),
                    'processing' => __( 'Processing...', 'elementor-copier' ),
                    'downloadingMedia' => __( 'Downloading media...', 'elementor-copier' ),
                    'insertingElement' => __( 'Inserting element...', 'elementor-copier' ),
                )
            )
        );
    }

    /**
     * Enqueue styles in Elementor editor
     */
    public function enqueue_editor_styles() {
        wp_enqueue_style(
            'elementor-copier-editor',
            ELEMENTOR_COPIER_PLUGIN_URL . 'assets/css/elementor-editor.css',
            array(),
            ELEMENTOR_COPIER_VERSION
        );
    }

    /**
     * Handle paste AJAX request
     */
    public function handle_paste_ajax() {
        // Verify nonce
        check_ajax_referer( 'elementor_copier_paste', 'nonce' );

        // Check user capabilities
        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_send_json_error( array(
                'message' => __( 'You do not have permission to perform this action.', 'elementor-copier' )
            ) );
        }

        // Get clipboard data from request
        $clipboard_data = isset( $_POST['clipboard_data'] ) ? wp_unslash( $_POST['clipboard_data'] ) : '';
        
        if ( empty( $clipboard_data ) ) {
            wp_send_json_error( array(
                'message' => __( 'No clipboard data received.', 'elementor-copier' )
            ) );
        }

        // Decode JSON
        $data = json_decode( $clipboard_data, true );

        if ( json_last_error() !== JSON_ERROR_NONE ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid JSON data.', 'elementor-copier' )
            ) );
        }

        // Validate data structure
        if ( ! $this->validate_clipboard_data( $data ) ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid clipboard data structure.', 'elementor-copier' )
            ) );
        }

        // Get post ID where we're pasting
        $post_id = isset( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : 0;
        
        if ( ! $post_id ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid post ID.', 'elementor-copier' )
            ) );
        }

        // Get section ID where to insert (optional)
        $section_id = isset( $_POST['section_id'] ) ? sanitize_text_field( $_POST['section_id'] ) : '';

        // Process media downloads if requested
        $download_media = isset( $_POST['download_media'] ) && $_POST['download_media'] === 'true';
        
        if ( $download_media && isset( $data['media'] ) && is_array( $data['media'] ) ) {
            $data = $this->process_media_downloads( $data );
        }

        // Prepare element data for Elementor
        $element_data = $this->prepare_element_data( $data['data'] );

        // Return the processed element data
        wp_send_json_success( array(
            'message' => __( 'Element ready to insert', 'elementor-copier' ),
            'element' => $element_data,
            'elementType' => $data['elementType'],
            'metadata' => isset( $data['metadata'] ) ? $data['metadata'] : array()
        ) );
    }

    /**
     * Validate clipboard data structure
     */
    private function validate_clipboard_data( $data ) {
        if ( ! is_array( $data ) ) {
            return false;
        }

        // Check required fields
        $required_fields = array( 'version', 'type', 'elementType', 'data' );
        
        foreach ( $required_fields as $field ) {
            if ( ! isset( $data[ $field ] ) ) {
                return false;
            }
        }

        // Verify type
        if ( $data['type'] !== 'elementor-copier' ) {
            return false;
        }

        // Verify element type
        $valid_types = array( 'widget', 'section', 'column', 'page' );
        if ( ! in_array( $data['elementType'], $valid_types, true ) ) {
            return false;
        }

        return true;
    }

    /**
     * Process media downloads
     */
    private function process_media_downloads( $data ) {
        if ( ! isset( $data['media'] ) || ! is_array( $data['media'] ) ) {
            return $data;
        }

        require_once ELEMENTOR_COPIER_PLUGIN_DIR . 'includes/import/class-mediaimporter.php';
        $media_importer = new \ElementorCopier\Import\MediaImporter();

        $url_map = array();

        foreach ( $data['media'] as $media_item ) {
            if ( ! isset( $media_item['url'] ) ) {
                continue;
            }

            $old_url = $media_item['url'];
            
            // Download and import media
            $attachment_id = $media_importer->import_media( $old_url );
            
            if ( $attachment_id && ! is_wp_error( $attachment_id ) ) {
                $new_url = wp_get_attachment_url( $attachment_id );
                if ( $new_url ) {
                    $url_map[ $old_url ] = array(
                        'url' => $new_url,
                        'id' => $attachment_id
                    );
                }
            }
        }

        // Replace URLs in element data
        if ( ! empty( $url_map ) ) {
            $data['data'] = $this->replace_media_urls( $data['data'], $url_map );
        }

        return $data;
    }

    /**
     * Replace media URLs in element data
     */
    private function replace_media_urls( $element_data, $url_map ) {
        $json = wp_json_encode( $element_data );
        
        foreach ( $url_map as $old_url => $new_data ) {
            $json = str_replace( $old_url, $new_data['url'], $json );
        }
        
        return json_decode( $json, true );
    }

    /**
     * Prepare element data for Elementor
     */
    private function prepare_element_data( $element_data ) {
        // Ensure element has required Elementor fields
        if ( ! isset( $element_data['id'] ) ) {
            $element_data['id'] = $this->generate_element_id();
        }

        // Recursively process child elements
        if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
            foreach ( $element_data['elements'] as $key => $child ) {
                $element_data['elements'][ $key ] = $this->prepare_element_data( $child );
            }
        }

        return $element_data;
    }

    /**
     * Generate unique element ID
     */
    private function generate_element_id() {
        return dechex( mt_rand() );
    }
}
