<?php
/**
 * WordPress MO Compiler
 * 
 * This file can be loaded in WordPress admin to compile the .mo file
 * Place this in wp-content/plugins/elementor-copier/languages/ and access via WordPress
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    // If not in WordPress, try to load WordPress
    $wp_load_paths = array(
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../wp-load.php',
    );
    
    $wp_loaded = false;
    foreach ( $wp_load_paths as $wp_load ) {
        if ( file_exists( $wp_load ) ) {
            require_once $wp_load;
            $wp_loaded = true;
            break;
        }
    }
    
    if ( ! $wp_loaded ) {
        die( 'WordPress not found. Please run this script through WordPress.' );
    }
}

// Check if user has admin capabilities
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( 'You do not have sufficient permissions to access this page.' );
}

/**
 * Compile PO to MO
 */
function elementor_copier_compile_mo() {
    $po_file = __DIR__ . '/elementor-copier-fa_IR.po';
    $mo_file = __DIR__ . '/elementor-copier-fa_IR.mo';
    
    if ( ! file_exists( $po_file ) ) {
        return array(
            'success' => false,
            'message' => 'PO file not found: ' . $po_file
        );
    }
    
    // Use WordPress's MO class if available
    if ( ! class_exists( 'MO' ) ) {
        require_once ABSPATH . WPINC . '/pomo/mo.php';
    }
    
    if ( ! class_exists( 'PO' ) ) {
        require_once ABSPATH . WPINC . '/pomo/po.php';
    }
    
    // Import PO file
    $po = new PO();
    if ( ! $po->import_from_file( $po_file ) ) {
        return array(
            'success' => false,
            'message' => 'Failed to import PO file'
        );
    }
    
    // Export to MO file
    $mo = new MO();
    $mo->entries = $po->entries;
    $mo->headers = $po->headers;
    
    if ( ! $mo->export_to_file( $mo_file ) ) {
        return array(
            'success' => false,
            'message' => 'Failed to export MO file'
        );
    }
    
    return array(
        'success' => true,
        'message' => 'Successfully compiled MO file',
        'translations' => count( $po->entries ),
        'mo_file' => $mo_file
    );
}

// Compile the MO file
$result = elementor_copier_compile_mo();

// Output result
header( 'Content-Type: text/html; charset=utf-8' );
?>
<!DOCTYPE html>
<html>
<head>
    <title>Elementor Copier - Translation Compiler</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f0f0f1;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .success {
            color: #00a32a;
            padding: 15px;
            background: #f0f6fc;
            border-left: 4px solid #00a32a;
            margin: 20px 0;
        }
        .error {
            color: #d63638;
            padding: 15px;
            background: #fcf0f1;
            border-left: 4px solid #d63638;
            margin: 20px 0;
        }
        h1 {
            color: #1d2327;
        }
        .info {
            color: #646970;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Elementor Copier - Translation Compiler</h1>
        
        <?php if ( $result['success'] ): ?>
            <div class="success">
                <strong>✓ Success!</strong><br>
                <?php echo esc_html( $result['message'] ); ?><br>
                <div class="info">
                    Translations: <?php echo esc_html( $result['translations'] ); ?><br>
                    MO File: <?php echo esc_html( $result['mo_file'] ); ?>
                </div>
            </div>
        <?php else: ?>
            <div class="error">
                <strong>✗ Error!</strong><br>
                <?php echo esc_html( $result['message'] ); ?>
            </div>
        <?php endif; ?>
        
        <p><a href="<?php echo admin_url(); ?>">← Back to Dashboard</a></p>
    </div>
</body>
</html>
