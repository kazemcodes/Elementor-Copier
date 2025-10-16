<?php
/**
 * Menu Diagnostic Script
 * 
 * Add this to your theme's functions.php temporarily to check if menu is registered
 */

// Check when admin_menu fires
add_action('admin_menu', function() {
    error_log('=== ADMIN_MENU HOOK FIRED ===');
    error_log('Current user can edit_pages: ' . (current_user_can('edit_pages') ? 'YES' : 'NO'));
}, 1);

// Check what's in the Tools submenu after everything loads
add_action('admin_menu', function() {
    global $submenu;
    
    error_log('=== CHECKING TOOLS SUBMENU ===');
    
    if (isset($submenu['tools.php'])) {
        error_log('Tools submenu exists');
        error_log('Tools submenu items: ' . print_r($submenu['tools.php'], true));
        
        // Check specifically for elementor-copier
        $found = false;
        foreach ($submenu['tools.php'] as $item) {
            if (isset($item[2]) && $item[2] === 'elementor-copier') {
                $found = true;
                error_log('✓ Elementor Copier menu item FOUND!');
                error_log('Menu details: ' . print_r($item, true));
            }
        }
        
        if (!$found) {
            error_log('✗ Elementor Copier menu item NOT FOUND in Tools submenu');
        }
    } else {
        error_log('Tools submenu does NOT exist!');
    }
}, 999);

// Also check the global menu
add_action('admin_menu', function() {
    global $menu;
    error_log('=== MAIN MENU ===');
    error_log('Main menu items: ' . print_r($menu, true));
}, 999);
