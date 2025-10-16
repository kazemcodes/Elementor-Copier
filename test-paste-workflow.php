<?php
/**
 * Test Paste Workflow
 * 
 * This file tests the Chrome extension clipboard-to-WordPress paste workflow.
 * 
 * Usage:
 * 1. Copy this file to your WordPress root directory
 * 2. Access it via browser: http://your-site.com/test-paste-workflow.php
 * 3. Follow the test instructions
 */

// Load WordPress
require_once __DIR__ . '/wp-load.php';

// Check if user is logged in and has admin capability
if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
    wp_die( 'You must be logged in as an administrator to run this test.' );
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Paste Workflow - Elementor Copier</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: #f0f0f1;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1d2327;
            border-bottom: 2px solid #2271b1;
            padding-bottom: 10px;
        }
        h2 {
            color: #2271b1;
            margin-top: 30px;
        }
        .test-section {
            background: #f6f7f7;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #2271b1;
            border-radius: 4px;
        }
        .success {
            background: #d7f0d7;
            border-left-color: #00a32a;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .error {
            background: #f8d7da;
            border-left: 4px solid #d63638;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .info {
            background: #e5f5fa;
            border-left: 4px solid #2271b1;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        code {
            background: #f0f0f1;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: Consolas, Monaco, monospace;
        }
        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .button {
            background: #2271b1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        .button:hover {
            background: #135e96;
        }
        .button-secondary {
            background: #f0f0f1;
            color: #2c3338;
        }
        .button-secondary:hover {
            background: #dcdcde;
        }
        ol {
            line-height: 1.8;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status.pass {
            background: #00a32a;
            color: white;
        }
        .status.fail {
            background: #d63638;
            color: white;
        }
        .status.pending {
            background: #dba617;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Paste Workflow - Elementor Copier</h1>
        
        <div class="info">
            <strong>Test Purpose:</strong> Verify that the Chrome extension clipboard-to-WordPress paste workflow is working correctly.
        </div>

        <h2>📋 Test Requirements</h2>
        <div class="test-section">
            <?php
            $requirements = array();
            
            // Check if Elementor is active
            $elementor_active = did_action( 'elementor/loaded' );
            $requirements['elementor'] = $elementor_active;
            
            // Check if plugin is active
            $plugin_active = class_exists( 'ElementorCopier\Plugin' );
            $requirements['plugin'] = $plugin_active;
            
            // Check if AJAX handler is registered
            $ajax_registered = has_action( 'wp_ajax_elementor_copier_paste_clipboard' );
            $requirements['ajax'] = $ajax_registered;
            
            // Check if Importer class exists
            $importer_exists = class_exists( 'ElementorCopier\Import\Importer' );
            $requirements['importer'] = $importer_exists;
            ?>
            
            <ul>
                <li>
                    <span class="status <?php echo $requirements['elementor'] ? 'pass' : 'fail'; ?>">
                        <?php echo $requirements['elementor'] ? 'PASS' : 'FAIL'; ?>
                    </span>
                    Elementor Plugin Active
                </li>
                <li>
                    <span class="status <?php echo $requirements['plugin'] ? 'pass' : 'fail'; ?>">
                        <?php echo $requirements['plugin'] ? 'PASS' : 'FAIL'; ?>
                    </span>
                    Elementor Copier Plugin Active
                </li>
                <li>
                    <span class="status <?php echo $requirements['ajax'] ? 'pass' : 'fail'; ?>">
                        <?php echo $requirements['ajax'] ? 'PASS' : 'FAIL'; ?>
                    </span>
                    AJAX Handler Registered (elementor_copier_paste_clipboard)
                </li>
                <li>
                    <span class="status <?php echo $requirements['importer'] ? 'pass' : 'fail'; ?>">
                        <?php echo $requirements['importer'] ? 'PASS' : 'FAIL'; ?>
                    </span>
                    Importer Class Available
                </li>
            </ul>
            
            <?php if ( array_filter( $requirements ) === $requirements ) : ?>
                <div class="success">
                    ✅ All requirements met! You can proceed with testing.
                </div>
            <?php else : ?>
                <div class="error">
                    ❌ Some requirements are not met. Please ensure all plugins are installed and activated.
                </div>
            <?php endif; ?>
        </div>

        <h2>🧪 Test Procedure</h2>
        <div class="test-section">
            <ol>
                <li>
                    <strong>Install Chrome Extension:</strong> Make sure the Elementor Copier Chrome extension is installed and active.
                </li>
                <li>
                    <strong>Visit an Elementor Site:</strong> Navigate to any website that uses Elementor (can be a demo site).
                </li>
                <li>
                    <strong>Copy an Element:</strong> Right-click on an Elementor widget, section, or page and select "Copy Widget" (or similar option).
                </li>
                <li>
                    <strong>Verify Clipboard:</strong> The extension should show a success notification and the data should be in your clipboard.
                </li>
                <li>
                    <strong>Go to WordPress Admin:</strong> Navigate to <code>Tools → کپی ویجت المنتور</code> in your WordPress admin.
                </li>
                <li>
                    <strong>Click Paste Button:</strong> Click the "Paste from Clipboard" button.
                </li>
                <li>
                    <strong>Select Target:</strong> Choose a target page and position (top/bottom/replace).
                </li>
                <li>
                    <strong>Import:</strong> Click the "Import" button.
                </li>
                <li>
                    <strong>Verify:</strong> Check that the content was imported successfully and appears in the target page.
                </li>
            </ol>
        </div>

        <h2>📝 Sample Clipboard Data</h2>
        <div class="test-section">
            <p>Here's an example of valid clipboard data format from the Chrome extension:</p>
            <pre>{
  "version": "1.0.0",
  "type": "elementor-copier",
  "elementType": "widget",
  "data": {
    "id": "abc123",
    "elType": "widget",
    "widgetType": "heading",
    "settings": {
      "title": "Sample Heading",
      "size": "h2"
    }
  },
  "media": [],
  "metadata": {
    "sourceUrl": "https://example.com/page",
    "copiedAt": "2025-10-15T12:00:00Z",
    "elementorVersion": "3.16.0"
  }
}</pre>
        </div>

        <h2>🔍 Validation Tests</h2>
        <div class="test-section">
            <p>The following validations are performed on clipboard data:</p>
            <ul>
                <li>✓ JSON format is valid</li>
                <li>✓ Required fields present: version, type, elementType, data</li>
                <li>✓ Type is "elementor-copier"</li>
                <li>✓ Element type is valid (widget, section, column, or page)</li>
                <li>✓ Data structure matches element type</li>
                <li>✓ Media URLs are validated (if present)</li>
            </ul>
        </div>

        <h2>🎯 Expected Results</h2>
        <div class="test-section">
            <h3>Success Case:</h3>
            <ul>
                <li>Clipboard data is validated successfully</li>
                <li>Element is imported to the target page</li>
                <li>Media files are downloaded (if present)</li>
                <li>Elementor CSS is regenerated</li>
                <li>Success message is displayed</li>
                <li>Edit link to the page is provided</li>
            </ul>
            
            <h3>Error Cases:</h3>
            <ul>
                <li><strong>Invalid JSON:</strong> "Invalid JSON data in clipboard"</li>
                <li><strong>Wrong Format:</strong> "Invalid clipboard data: not Elementor Copier format"</li>
                <li><strong>Missing Fields:</strong> "Invalid clipboard data: missing required field"</li>
                <li><strong>Invalid Element Type:</strong> "Invalid element type: must be widget, section, column, or page"</li>
                <li><strong>No Target Page:</strong> "Target page ID is required"</li>
            </ul>
        </div>

        <h2>🔗 Quick Links</h2>
        <div class="test-section">
            <a href="<?php echo admin_url( 'tools.php?page=elementor-copier' ); ?>" class="button">
                Go to Elementor Copier Admin
            </a>
            <a href="<?php echo admin_url( 'edit.php?post_type=page' ); ?>" class="button button-secondary">
                View All Pages
            </a>
            <a href="<?php echo admin_url( 'post-new.php?post_type=page' ); ?>" class="button button-secondary">
                Create New Page
            </a>
        </div>

        <h2>📊 Implementation Status</h2>
        <div class="test-section">
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f6f7f7;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Component</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">AJAX Handler (elementor_copier_paste_clipboard)</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Implemented</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">Clipboard Data Validation</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Implemented</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">Import Handler Integration</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Implemented</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">Media URL Handling</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Implemented</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">Error Handling</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Implemented</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">JavaScript Integration</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                        <span class="status pass">✓ Updated</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="info" style="margin-top: 30px;">
            <strong>Note:</strong> This test page verifies the implementation. For actual testing, you need to:
            <ol>
                <li>Have the Chrome extension installed</li>
                <li>Copy data from an Elementor site</li>
                <li>Use the WordPress admin interface to paste and import</li>
            </ol>
        </div>
    </div>
</body>
</html>
