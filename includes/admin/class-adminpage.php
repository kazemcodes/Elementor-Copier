<?php
/**
 * Admin Page Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Admin;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * AdminPage Class
 *
 * Handles the Persian RTL admin interface for the Elementor Widget Copier plugin.
 */
class AdminPage {

    /**
     * Page slug
     *
     * @var string
     */
    private $page_slug = 'elementor-copier';

    /**
     * Constructor
     */
    public function __construct() {
        $this->log( 'AdminPage constructor called' );
        
        try {
            $this->log( 'Registering admin_menu action...' );
            add_action( 'admin_menu', array( $this, 'register_menu' ) );
            $this->log( 'admin_menu action registered' );
            
            $this->log( 'Registering admin_enqueue_scripts action...' );
            add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
            $this->log( 'admin_enqueue_scripts action registered' );
            
            $this->log( 'AdminPage constructor completed successfully' );
        } catch ( \Throwable $e ) {
            $this->log( 'EXCEPTION in AdminPage constructor: ' . $e->getMessage(), 'ERROR' );
        }
    }
    
    /**
     * Log helper function
     */
    private function log( $message, $level = 'INFO' ) {
        $log_file = WP_CONTENT_DIR . '/elementor-copier-debug.log';
        $timestamp = date( 'Y-m-d H:i:s' );
        $log_message = "[{$timestamp}] [AdminPage] [{$level}] {$message}\n";
        error_log( $log_message, 3, $log_file );
    }

    /**
     * Register admin menu with Persian text
     */
    public function register_menu() {
        $this->log( 'register_menu() called - adding submenu page' );
        
        $hook = add_submenu_page(
            'tools.php',
            __( 'Elementor Widget Copier', 'elementor-copier' ),
            __( 'Elementor Widget Copier', 'elementor-copier' ),
            'edit_pages',
            $this->page_slug,
            array( $this, 'render_page' )
        );
        
        $this->log( 'Submenu page added with hook: ' . $hook );
        $this->log( 'Menu should appear under Tools menu' );
    }

    /**
     * Render admin page with Persian RTL interface
     */
    public function render_page() {
        // Verify user capabilities
        if ( ! current_user_can( 'edit_pages' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'elementor-copier' ) );
        }

        ?>
        <div class="wrap elementor-copier-admin" dir="rtl">
            <h1><?php esc_html_e( 'Elementor Widget Copier', 'elementor-copier' ); ?></h1>
            
            <div class="elementor-copier-container">
                <!-- Paste from Clipboard Section (NEW!) -->
                <div class="elementor-copier-section elementor-copier-paste-section">
                    <h2><?php esc_html_e( '📋 Paste from Chrome Extension', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Copy Elementor elements using the Chrome extension, then paste here directly!', 'elementor-copier' ); ?>
                    </p>
                    
                    <div class="paste-instructions">
                        <p><strong><?php esc_html_e( 'How it works:', 'elementor-copier' ); ?></strong></p>
                        <ol>
                            <li><?php esc_html_e( 'Install the Elementor Copier Chrome extension', 'elementor-copier' ); ?></li>
                            <li><?php esc_html_e( 'Visit any Elementor website', 'elementor-copier' ); ?></li>
                            <li><?php esc_html_e( 'Right-click on widget/section → "Copy Elementor Widget"', 'elementor-copier' ); ?></li>
                            <li><?php esc_html_e( 'Come back here and click "Paste from Clipboard"', 'elementor-copier' ); ?></li>
                        </ol>
                    </div>
                    
                    <p class="submit">
                        <button 
                            type="button" 
                            id="paste-from-clipboard-btn" 
                            class="button button-primary button-large"
                        >
                            <?php esc_html_e( '📋 Paste from Clipboard', 'elementor-copier' ); ?>
                        </button>
                        <span id="paste-spinner" class="spinner" style="display: none;"></span>
                    </p>
                    
                    <!-- Paste Preview -->
                    <div id="paste-preview-container" style="display: none;">
                        <h3><?php esc_html_e( 'Preview:', 'elementor-copier' ); ?></h3>
                        <div id="paste-preview" class="paste-preview-box"></div>
                        
                        <!-- Target Selection for Pasted Content -->
                        <div id="paste-target-selection" class="paste-target-selection">
                            <h3><?php esc_html_e( 'Import To:', 'elementor-copier' ); ?></h3>
                            
                            <table class="form-table" role="presentation">
                                <tr>
                                    <th scope="row">
                                        <?php esc_html_e( 'Target Type', 'elementor-copier' ); ?>
                                    </th>
                                    <td>
                                        <fieldset>
                                            <label>
                                                <input 
                                                    type="radio" 
                                                    name="paste_target_type" 
                                                    value="new_page" 
                                                    checked
                                                />
                                                <?php esc_html_e( 'Create New Page', 'elementor-copier' ); ?>
                                            </label>
                                            <br />
                                            <label>
                                                <input 
                                                    type="radio" 
                                                    name="paste_target_type" 
                                                    value="existing_page"
                                                />
                                                <?php esc_html_e( 'Add to Existing Page', 'elementor-copier' ); ?>
                                            </label>
                                            <br />
                                            <label>
                                                <input 
                                                    type="radio" 
                                                    name="paste_target_type" 
                                                    value="template"
                                                />
                                                <?php esc_html_e( 'Create as Template', 'elementor-copier' ); ?>
                                            </label>
                                        </fieldset>
                                    </td>
                                </tr>
                            </table>

                            <!-- New Page Options -->
                            <div id="paste-new-page-options" class="paste-target-options">
                                <table class="form-table" role="presentation">
                                    <tr>
                                        <th scope="row">
                                            <label for="paste-new-page-title">
                                                <?php esc_html_e( 'Page Title', 'elementor-copier' ); ?>
                                            </label>
                                        </th>
                                        <td>
                                            <input 
                                                type="text" 
                                                id="paste-new-page-title" 
                                                name="paste_new_page_title" 
                                                class="regular-text" 
                                                placeholder="<?php esc_attr_e( 'Enter page title', 'elementor-copier' ); ?>"
                                            />
                                            <p class="description">
                                                <?php esc_html_e( 'Enter a title for the new page.', 'elementor-copier' ); ?>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Existing Page Options -->
                            <div id="paste-existing-page-options" class="paste-target-options" style="display: none;">
                                <table class="form-table" role="presentation">
                                    <tr>
                                        <th scope="row">
                                            <label for="paste-target-page">
                                                <?php esc_html_e( 'Select Page', 'elementor-copier' ); ?>
                                            </label>
                                        </th>
                                        <td>
                                            <select id="paste-target-page" name="paste_target_page" class="regular-text">
                                                <option value=""><?php esc_html_e( 'Select a page...', 'elementor-copier' ); ?></option>
                                                <!-- Options will be populated via JavaScript -->
                                            </select>
                                            <p class="description">
                                                <?php esc_html_e( 'Select an existing page to add content to.', 'elementor-copier' ); ?>
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <?php esc_html_e( 'Position', 'elementor-copier' ); ?>
                                        </th>
                                        <td>
                                            <fieldset>
                                                <label>
                                                    <input type="radio" name="paste_position" value="top" />
                                                    <?php esc_html_e( 'Insert at Top', 'elementor-copier' ); ?>
                                                </label>
                                                <br />
                                                <label>
                                                    <input type="radio" name="paste_position" value="bottom" checked />
                                                    <?php esc_html_e( 'Insert at Bottom', 'elementor-copier' ); ?>
                                                </label>
                                                <br />
                                                <label>
                                                    <input type="radio" name="paste_position" value="replace" />
                                                    <?php esc_html_e( 'Replace All Content', 'elementor-copier' ); ?>
                                                </label>
                                            </fieldset>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Template Options -->
                            <div id="paste-template-options" class="paste-target-options" style="display: none;">
                                <table class="form-table" role="presentation">
                                    <tr>
                                        <th scope="row">
                                            <label for="paste-template-title">
                                                <?php esc_html_e( 'Template Title', 'elementor-copier' ); ?>
                                            </label>
                                        </th>
                                        <td>
                                            <input 
                                                type="text" 
                                                id="paste-template-title" 
                                                name="paste_template_title" 
                                                class="regular-text" 
                                                placeholder="<?php esc_attr_e( 'Enter template title', 'elementor-copier' ); ?>"
                                            />
                                            <p class="description">
                                                <?php esc_html_e( 'Enter a title for the template.', 'elementor-copier' ); ?>
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row">
                                            <label for="paste-template-type">
                                                <?php esc_html_e( 'Template Type', 'elementor-copier' ); ?>
                                            </label>
                                        </th>
                                        <td>
                                            <select 
                                                id="paste-template-type" 
                                                name="paste_template_type" 
                                                class="regular-text"
                                            >
                                                <option value="page"><?php esc_html_e( 'Page', 'elementor-copier' ); ?></option>
                                                <option value="section"><?php esc_html_e( 'Section', 'elementor-copier' ); ?></option>
                                            </select>
                                            <p class="description">
                                                <?php esc_html_e( 'Select the type of template to create.', 'elementor-copier' ); ?>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p class="submit">
                                <button 
                                    type="button" 
                                    id="import-pasted-content-btn" 
                                    class="button button-primary button-large"
                                >
                                    <?php esc_html_e( 'Import Now', 'elementor-copier' ); ?>
                                </button>
                                <button 
                                    type="button" 
                                    id="cancel-paste-btn" 
                                    class="button button-secondary"
                                >
                                    <?php esc_html_e( 'Cancel', 'elementor-copier' ); ?>
                                </button>
                                <span id="import-spinner" class="spinner" style="display: none;"></span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 2px solid #eee;" />
                
                <div class="elementor-copier-section">
                    <h2><?php esc_html_e( '🌐 Or Copy from URL (Advanced)', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Alternative method: Connect to a source site via URL', 'elementor-copier' ); ?>
                    </p>
                </div>
                
                <!-- Source URL Section -->
                <div class="elementor-copier-section">
                    <h2><?php esc_html_e( 'Source Site URL', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Enter the URL of the source WordPress site to copy content from.', 'elementor-copier' ); ?>
                    </p>
                    
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">
                                <label for="source-url">
                                    <?php esc_html_e( 'Source Site URL', 'elementor-copier' ); ?>
                                </label>
                            </th>
                            <td>
                                <input 
                                    type="url" 
                                    id="source-url" 
                                    name="source_url" 
                                    class="regular-text" 
                                    placeholder="https://example.com"
                                    dir="ltr"
                                />
                                <p class="description">
                                    <?php esc_html_e( 'Enter the full URL including https://', 'elementor-copier' ); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Authentication Options Section -->
                <div class="elementor-copier-section">
                    <h2><?php esc_html_e( 'Authentication', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Choose how to access the source site content.', 'elementor-copier' ); ?>
                    </p>
                    
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">
                                <?php esc_html_e( 'Authentication Method', 'elementor-copier' ); ?>
                            </th>
                            <td>
                                <fieldset>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="auth_method" 
                                            value="public" 
                                            checked
                                        />
                                        <?php esc_html_e( 'Public Access (Published Pages Only)', 'elementor-copier' ); ?>
                                    </label>
                                    <br />
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="auth_method" 
                                            value="credentials"
                                        />
                                        <?php esc_html_e( 'WordPress Credentials', 'elementor-copier' ); ?>
                                    </label>
                                    <br />
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="auth_method" 
                                            value="app_password"
                                        />
                                        <?php esc_html_e( 'Application Password', 'elementor-copier' ); ?>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                    </table>

                    <!-- Credentials Fields (hidden by default) -->
                    <div id="auth-credentials" style="display: none;">
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="auth-username">
                                        <?php esc_html_e( 'Username', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <input 
                                        type="text" 
                                        id="auth-username" 
                                        name="auth_username" 
                                        class="regular-text" 
                                        dir="ltr"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="auth-password">
                                        <?php esc_html_e( 'Password', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <input 
                                        type="password" 
                                        id="auth-password" 
                                        name="auth_password" 
                                        class="regular-text" 
                                        dir="ltr"
                                    />
                                    <p class="description">
                                        <?php esc_html_e( 'For Application Password method, use the generated application password.', 'elementor-copier' ); ?>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- Load Content Button -->
                <div class="elementor-copier-section">
                    <p class="submit">
                        <button 
                            type="button" 
                            id="load-content-btn" 
                            class="button button-primary button-large"
                        >
                            <?php esc_html_e( 'Load Content', 'elementor-copier' ); ?>
                        </button>
                        <span id="load-content-spinner" class="spinner" style="display: none;"></span>
                    </p>
                </div>

                <!-- Content Tree Display (placeholder) -->
                <div id="content-tree-section" class="elementor-copier-section" style="display: none;">
                    <h2><?php esc_html_e( 'Available Content', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Select pages, sections, or widgets to copy.', 'elementor-copier' ); ?>
                    </p>
                    
                    <div id="content-tree-container" class="elementor-copier-tree">
                        <!-- Content tree will be populated via JavaScript -->
                    </div>
                </div>

                <!-- Target Selection Section -->
                <div id="target-selection-section" class="elementor-copier-section" style="display: none;">
                    <h2><?php esc_html_e( 'Target Selection', 'elementor-copier' ); ?></h2>
                    <p class="description">
                        <?php esc_html_e( 'Choose where to import the selected content.', 'elementor-copier' ); ?>
                    </p>
                    
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row">
                                <?php esc_html_e( 'Import To', 'elementor-copier' ); ?>
                            </th>
                            <td>
                                <fieldset>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="target_type" 
                                            value="new_page" 
                                            checked
                                        />
                                        <?php esc_html_e( 'Create New Page', 'elementor-copier' ); ?>
                                    </label>
                                    <br />
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="target_type" 
                                            value="existing_page"
                                        />
                                        <?php esc_html_e( 'Add to Existing Page', 'elementor-copier' ); ?>
                                    </label>
                                    <br />
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="target_type" 
                                            value="template"
                                        />
                                        <?php esc_html_e( 'Create as Template', 'elementor-copier' ); ?>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                    </table>

                    <!-- New Page Options -->
                    <div id="new-page-options" class="target-options">
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="new-page-title">
                                        <?php esc_html_e( 'Page Title', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <input 
                                        type="text" 
                                        id="new-page-title" 
                                        name="new_page_title" 
                                        class="regular-text" 
                                        placeholder="<?php esc_attr_e( 'Enter page title', 'elementor-copier' ); ?>"
                                    />
                                    <p class="description">
                                        <?php esc_html_e( 'Enter a title for the new page.', 'elementor-copier' ); ?>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Existing Page Options -->
                    <div id="existing-page-options" class="target-options" style="display: none;">
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="existing-page-select">
                                        <?php esc_html_e( 'Select Page', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <select 
                                        id="existing-page-select" 
                                        name="existing_page_id" 
                                        class="regular-text"
                                    >
                                        <option value=""><?php esc_html_e( 'Select a page...', 'elementor-copier' ); ?></option>
                                        <!-- Options will be populated via JavaScript -->
                                    </select>
                                    <p class="description">
                                        <?php esc_html_e( 'Select an existing page to add content to.', 'elementor-copier' ); ?>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <?php esc_html_e( 'Position', 'elementor-copier' ); ?>
                                </th>
                                <td>
                                    <fieldset>
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="insert_position" 
                                                value="top"
                                            />
                                            <?php esc_html_e( 'Insert at Top', 'elementor-copier' ); ?>
                                        </label>
                                        <br />
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="insert_position" 
                                                value="bottom" 
                                                checked
                                            />
                                            <?php esc_html_e( 'Insert at Bottom', 'elementor-copier' ); ?>
                                        </label>
                                        <br />
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="insert_position" 
                                                value="replace"
                                            />
                                            <?php esc_html_e( 'Replace All Content', 'elementor-copier' ); ?>
                                        </label>
                                    </fieldset>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Template Options -->
                    <div id="template-options" class="target-options" style="display: none;">
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row">
                                    <label for="template-title">
                                        <?php esc_html_e( 'Template Title', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <input 
                                        type="text" 
                                        id="template-title" 
                                        name="template_title" 
                                        class="regular-text" 
                                        placeholder="<?php esc_attr_e( 'Enter template title', 'elementor-copier' ); ?>"
                                    />
                                    <p class="description">
                                        <?php esc_html_e( 'Enter a title for the template.', 'elementor-copier' ); ?>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="template-type">
                                        <?php esc_html_e( 'Template Type', 'elementor-copier' ); ?>
                                    </label>
                                </th>
                                <td>
                                    <select 
                                        id="template-type" 
                                        name="template_type" 
                                        class="regular-text"
                                    >
                                        <option value="page"><?php esc_html_e( 'Page', 'elementor-copier' ); ?></option>
                                        <option value="section"><?php esc_html_e( 'Section', 'elementor-copier' ); ?></option>
                                    </select>
                                    <p class="description">
                                        <?php esc_html_e( 'Select the type of template to create.', 'elementor-copier' ); ?>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Copy Button -->
                    <p class="submit">
                        <button 
                            type="button" 
                            id="copy-content-btn" 
                            class="button button-primary button-large"
                            disabled
                        >
                            <?php esc_html_e( 'Copy', 'elementor-copier' ); ?>
                        </button>
                        <span id="copy-content-spinner" class="spinner" style="display: none;"></span>
                    </p>
                </div>

                <!-- Status Messages -->
                <div id="elementor-copier-messages"></div>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue admin assets (CSS, RTL CSS, and JavaScript)
     *
     * @param string $hook The current admin page hook.
     */
    public function enqueue_assets( $hook ) {
        // Only load on our plugin page
        if ( 'tools_page_' . $this->page_slug !== $hook ) {
            return;
        }

        try {
            // Enqueue base CSS
            $css_file = ELEMENTOR_COPIER_PLUGIN_DIR . 'assets/css/admin.css';
            if ( file_exists( $css_file ) ) {
                wp_enqueue_style(
                    'elementor-copier-admin',
                    ELEMENTOR_COPIER_PLUGIN_URL . 'assets/css/admin.css',
                    array(),
                    ELEMENTOR_COPIER_VERSION
                );
            }

            // Enqueue RTL CSS for Persian interface
            if ( is_rtl() ) {
                $rtl_css_file = ELEMENTOR_COPIER_PLUGIN_DIR . 'assets/css/admin-rtl.css';
                if ( file_exists( $rtl_css_file ) ) {
                    wp_enqueue_style(
                        'elementor-copier-admin-rtl',
                        ELEMENTOR_COPIER_PLUGIN_URL . 'assets/css/admin-rtl.css',
                        array( 'elementor-copier-admin' ),
                        ELEMENTOR_COPIER_VERSION
                    );
                }
            }

            // Enqueue JavaScript
            $js_file = ELEMENTOR_COPIER_PLUGIN_DIR . 'assets/js/admin.js';
            if ( file_exists( $js_file ) ) {
                wp_enqueue_script(
                    'elementor-copier-admin',
                    ELEMENTOR_COPIER_PLUGIN_URL . 'assets/js/admin.js',
                    array( 'jquery' ),
                    ELEMENTOR_COPIER_VERSION,
                    true
                );

                // Localize script with AJAX URL, nonce, and Persian strings
                wp_localize_script(
                    'elementor-copier-admin',
                    'elementorCopierAdmin',
                    array(
                        'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
                        'nonce'     => wp_create_nonce( 'elementor_copier_nonce' ),
                        'strings'   => array(
                            'enterUrl'          => __( 'Please enter a source URL.', 'elementor-copier' ),
                            'invalidUrl'        => __( 'Please enter a valid URL starting with http:// or https://', 'elementor-copier' ),
                            'loading'           => __( 'Loading...', 'elementor-copier' ),
                            'loadingContent'    => __( 'Loading content...', 'elementor-copier' ),
                            'connectionFailed'  => __( 'Connection failed. Please check the URL and try again.', 'elementor-copier' ),
                            'noContent'         => __( 'No Elementor content found on the source site.', 'elementor-copier' ),
                            'selectContent'     => __( 'Please select content to copy.', 'elementor-copier' ),
                            'copying'           => __( 'Copying content...', 'elementor-copier' ),
                            'copySuccess'       => __( 'Content copied successfully!', 'elementor-copier' ),
                            'copyError'         => __( 'Error copying content. Please try again.', 'elementor-copier' ),
                            'enterCredentials'  => __( 'Please enter username and password.', 'elementor-copier' ),
                            'processing'        => __( 'Processing', 'elementor-copier' ),
                            'items'             => __( 'items', 'elementor-copier' ),
                            'itemsCopied'       => __( 'items copied', 'elementor-copier' ),
                            'itemsFailed'       => __( 'items failed', 'elementor-copier' ),
                            'enterPageTitle'    => __( 'Please enter a page title.', 'elementor-copier' ),
                            'selectExistingPage' => __( 'Please select an existing page.', 'elementor-copier' ),
                            'enterTemplateTitle' => __( 'Please enter a template title.', 'elementor-copier' ),
                            'loadingPages'      => __( 'Loading pages...', 'elementor-copier' ),
                        ),
                    )
                );
            }
        } catch ( \Throwable $e ) {
            // Silently fail - don't crash the admin
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'Elementor Copier: Asset enqueue error - ' . $e->getMessage() );
            }
        }
    }
}

