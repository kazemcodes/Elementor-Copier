/**
 * Elementor Editor Integration
 * Adds paste functionality directly in Elementor editor
 */

(function($) {
    'use strict';

    // Wait for Elementor to be ready
    $(window).on('elementor:init', function() {
        console.log('Elementor Copier: Editor integration loaded');

        // Add paste button to Elementor panel
        addPasteButtonToPanel();

        // Listen for paste button clicks
        setupPasteButton();
    });

    /**
     * Add paste button to Elementor panel
     */
    function addPasteButtonToPanel() {
        // Wait for panel to be ready
        elementor.on('panel:init', function() {
            // Add button to panel header
            const $panelHeader = $('#elementor-panel-header-menu-button');
            
            if ($panelHeader.length) {
                // Create paste button
                const $pasteBtn = $('<button>', {
                    id: 'elementor-copier-paste-btn',
                    class: 'elementor-button elementor-button-success',
                    html: '<i class="eicon-clipboard"></i> <span>' + elementorCopierEditor.i18n.pasteButton + '</span>'
                });

                // Insert after menu button
                $pasteBtn.insertAfter($panelHeader);

                console.log('Elementor Copier: Paste button added to panel');
            }
        });
    }

    /**
     * Setup paste button click handler
     */
    function setupPasteButton() {
        $(document).on('click', '#elementor-copier-paste-btn', function(e) {
            e.preventDefault();
            handlePasteClick();
        });

        // Also add keyboard shortcut (Ctrl+Shift+V)
        $(document).on('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                handlePasteClick();
            }
        });
    }

    /**
     * Handle paste button click
     */
    async function handlePasteClick() {
        console.log('Elementor Copier: Paste button clicked');

        // Check if Clipboard API is available
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            showNotification(elementorCopierEditor.i18n.noClipboard, 'error');
            return;
        }

        // Show processing status
        showNotification(elementorCopierEditor.i18n.readingClipboard, 'info');

        try {
            // Read clipboard
            const clipboardText = await navigator.clipboard.readText();
            console.log('Clipboard read successfully');

            // Parse JSON
            let clipboardData;
            try {
                clipboardData = JSON.parse(clipboardText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                showNotification(elementorCopierEditor.i18n.invalidData, 'error');
                return;
            }

            // Validate data
            if (!clipboardData.type || clipboardData.type !== 'elementor-copier') {
                showNotification(elementorCopierEditor.i18n.invalidData, 'error');
                return;
            }

            console.log('Clipboard data validated:', clipboardData);

            // Show importing status
            showNotification(elementorCopierEditor.i18n.importing, 'info');

            // Get current post ID
            const postId = elementor.config.document.id;

            // Send to server for processing
            const response = await $.ajax({
                url: elementorCopierEditor.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'elementor_copier_paste_in_editor',
                    nonce: elementorCopierEditor.nonce,
                    clipboard_data: clipboardText,
                    post_id: postId
                }
            });

            if (response.success) {
                console.log('Server processing successful:', response.data);

                // Insert element into Elementor
                insertElementIntoEditor(response.data.elementData, response.data.elementType);

                // Show success message
                showNotification(elementorCopierEditor.i18n.pasteSuccess, 'success');
            } else {
                console.error('Server error:', response.data);
                showNotification(response.data.message || elementorCopierEditor.i18n.pasteError, 'error');
            }

        } catch (error) {
            console.error('Paste error:', error);
            showNotification(elementorCopierEditor.i18n.pasteError, 'error');
        }
    }

    /**
     * Insert element into Elementor editor
     */
    function insertElementIntoEditor(elementData, elementType) {
        console.log('Inserting element into editor:', elementType, elementData);

        try {
            // Get the current container (section/column)
            const container = elementor.getPreviewContainer();

            if (!container) {
                console.error('No container found');
                showNotification('Please select a location to paste the element', 'error');
                return;
            }

            // Create element based on type
            let model;

            if (elementType === 'widget') {
                // Add widget
                model = $e.run('document/elements/create', {
                    container: container,
                    model: {
                        elType: elementData.elType,
                        widgetType: elementData.widgetType,
                        settings: elementData.settings || {}
                    }
                });
            } else if (elementType === 'section') {
                // Add section
                model = $e.run('document/elements/create', {
                    container: elementor.getPreviewContainer(),
                    model: {
                        elType: 'section',
                        settings: elementData.settings || {},
                        elements: elementData.elements || []
                    }
                });
            } else if (elementType === 'column') {
                // Add column
                const section = container.model.get('elType') === 'section' ? container : container.parent;
                
                model = $e.run('document/elements/create', {
                    container: section,
                    model: {
                        elType: 'column',
                        settings: elementData.settings || {},
                        elements: elementData.elements || []
                    }
                });
            } else if (elementType === 'page') {
                // Add all sections from page
                if (elementData.elements && elementData.elements.length > 0) {
                    elementData.elements.forEach(function(sectionData) {
                        $e.run('document/elements/create', {
                            container: elementor.getPreviewContainer(),
                            model: sectionData
                        });
                    });
                }
            }

            console.log('Element inserted successfully:', model);

            // Refresh preview
            elementor.reloadPreview();

        } catch (error) {
            console.error('Error inserting element:', error);
            showNotification('Failed to insert element: ' + error.message, 'error');
        }
    }

    /**
     * Show notification in Elementor
     */
    function showNotification(message, type) {
        // Use Elementor's notification system if available
        if (elementorCommon && elementorCommon.dialogsManager) {
            elementorCommon.dialogsManager.createWidget('alert', {
                message: message,
                type: type || 'info'
            }).show();
        } else {
            // Fallback to console
            console.log('[Elementor Copier] ' + message);
            
            // Also show browser notification
            if (type === 'success') {
                alert('✓ ' + message);
            } else if (type === 'error') {
                alert('✗ ' + message);
            }
        }
    }

})(jQuery);
/**
 * Elementor Editor Integration
 * Adds "Paste from Clipboard" button to Elementor editor
 */

(function($) {
    'use strict';

    // Wait for Elementor to be ready
    $(window).on('elementor:init', function() {
        console.log('Elementor Copier: Initializing editor integration');

        // Add paste button to Elementor panel
        addPasteButtonToPanel();

        // Add keyboard shortcut (Ctrl+Shift+V)
        addKeyboardShortcut();
    });

    /**
     * Add paste button to Elementor panel
     */
    function addPasteButtonToPanel() {
        // Wait for panel to be ready
        elementor.on('panel:init', function() {
            console.log('Elementor Copier: Panel initialized, adding paste button');

            // Add button to panel footer
            addPasteButton();
        });
    }

    /**
     * Add paste button to panel
     */
    function addPasteButton() {
        // Create button HTML
        const buttonHtml = `
            <div id="elementor-copier-paste-btn" class="elementor-copier-paste-button">
                <button type="button" class="elementor-button elementor-button-success">
                    <i class="eicon-clipboard" aria-hidden="true"></i>
                    <span class="elementor-button-title">${elementorCopierEditor.i18n.pasteButtonPersian}</span>
                </button>
            </div>
        `;

        // Try to add to panel footer
        const $panelFooter = $('#elementor-panel-footer-tools');
        
        if ($panelFooter.length) {
            $panelFooter.prepend(buttonHtml);
            console.log('Elementor Copier: Paste button added to panel footer');
        } else {
            // Fallback: Add to panel header
            const $panelHeader = $('#elementor-panel-header-menu-button');
            if ($panelHeader.length) {
                $panelHeader.after(buttonHtml);
                console.log('Elementor Copier: Paste button added to panel header');
            }
        }

        // Attach click handler
        $(document).on('click', '#elementor-copier-paste-btn button', function(e) {
            e.preventDefault();
            handlePasteClick();
        });
    }

    /**
     * Handle paste button click
     */
    async function handlePasteClick() {
        console.log('Elementor Copier: Paste button clicked');

        // Check if Clipboard API is available
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            showNotification(elementorCopierEditor.i18n.noClipboard, 'error');
            return;
        }

        try {
            // Show loading state
            showNotification(elementorCopierEditor.i18n.processing, 'info');

            // Read clipboard
            const clipboardText = await navigator.clipboard.readText();
            console.log('Elementor Copier: Clipboard read successfully');

            // Parse JSON
            let clipboardData;
            try {
                clipboardData = JSON.parse(clipboardText);
            } catch (e) {
                console.error('Elementor Copier: Invalid JSON in clipboard', e);
                showNotification(elementorCopierEditor.i18n.invalidData, 'error');
                return;
            }

            // Validate data
            if (!validateClipboardData(clipboardData)) {
                showNotification(elementorCopierEditor.i18n.invalidData, 'error');
                return;
            }

            // Show media download option
            const downloadMedia = await showMediaDownloadDialog();

            // Send to server for processing
            await processAndInsertElement(clipboardData, downloadMedia);

        } catch (error) {
            console.error('Elementor Copier: Error reading clipboard', error);
            showNotification(elementorCopierEditor.i18n.pasteError, 'error');
        }
    }

    /**
     * Validate clipboard data
     */
    function validateClipboardData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required fields
        if (!data.type || data.type !== 'elementor-copier') {
            return false;
        }

        if (!data.elementType || !data.data) {
            return false;
        }

        return true;
    }

    /**
     * Show media download dialog
     */
    function showMediaDownloadDialog() {
        return new Promise((resolve) => {
            // Create dialog
            const dialog = elementorCommon.dialogsManager.createWidget('confirm', {
                id: 'elementor-copier-media-dialog',
                headerMessage: 'Download Media?',
                message: 'Do you want to download images and videos to your media library? (Recommended)',
                position: {
                    my: 'center center',
                    at: 'center center'
                },
                strings: {
                    confirm: 'Yes, Download',
                    cancel: 'No, Keep Original URLs'
                },
                onConfirm: function() {
                    resolve(true);
                },
                onCancel: function() {
                    resolve(false);
                }
            });

            dialog.show();
        });
    }

    /**
     * Process and insert element
     */
    async function processAndInsertElement(clipboardData, downloadMedia) {
        // Get current post ID
        const postId = elementor.config.document.id;

        // Show processing notification
        if (downloadMedia) {
            showNotification(elementorCopierEditor.i18n.downloadingMedia, 'info');
        } else {
            showNotification(elementorCopierEditor.i18n.insertingElement, 'info');
        }

        // Send AJAX request
        try {
            const response = await $.ajax({
                url: elementorCopierEditor.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'elementor_copier_paste_in_editor',
                    nonce: elementorCopierEditor.nonce,
                    clipboard_data: JSON.stringify(clipboardData),
                    post_id: postId,
                    download_media: downloadMedia
                }
            });

            if (response.success) {
                console.log('Elementor Copier: Element processed successfully', response.data);

                // Insert element into Elementor
                insertElementIntoEditor(response.data.element, response.data.elementType);

                // Show success notification
                showNotification(elementorCopierEditor.i18n.pasteSuccess, 'success');
            } else {
                console.error('Elementor Copier: Server error', response.data);
                showNotification(response.data.message || elementorCopierEditor.i18n.pasteError, 'error');
            }
        } catch (error) {
            console.error('Elementor Copier: AJAX error', error);
            showNotification(elementorCopierEditor.i18n.pasteError, 'error');
        }
    }

    /**
     * Insert element into Elementor editor
     */
    function insertElementIntoEditor(elementData, elementType) {
        console.log('Elementor Copier: Inserting element', elementType, elementData);

        // Get the current container or create new section
        const container = elementor.getPreviewContainer();

        if (!container) {
            console.error('Elementor Copier: No container found');
            return;
        }

        // Insert based on element type
        switch (elementType) {
            case 'widget':
                insertWidget(elementData, container);
                break;
            case 'section':
                insertSection(elementData);
                break;
            case 'column':
                insertColumn(elementData, container);
                break;
            case 'page':
                insertPage(elementData);
                break;
            default:
                console.error('Elementor Copier: Unknown element type', elementType);
        }

        // Refresh preview
        elementor.reloadPreview();
    }

    /**
     * Insert widget
     */
    function insertWidget(widgetData, container) {
        // Use Elementor's API to create widget
        $e.run('document/elements/create', {
            model: widgetData,
            container: container
        });
    }

    /**
     * Insert section
     */
    function insertSection(sectionData) {
        // Create section at the end of the document
        $e.run('document/elements/create', {
            model: sectionData,
            container: elementor.getPreviewContainer()
        });
    }

    /**
     * Insert column
     */
    function insertColumn(columnData, container) {
        // Insert column into current section
        $e.run('document/elements/create', {
            model: columnData,
            container: container
        });
    }

    /**
     * Insert page (multiple sections)
     */
    function insertPage(pageData) {
        // Insert all sections from page
        if (pageData.elements && Array.isArray(pageData.elements)) {
            pageData.elements.forEach(function(sectionData) {
                insertSection(sectionData);
            });
        }
    }

    /**
     * Add keyboard shortcut (Ctrl+Shift+V)
     */
    function addKeyboardShortcut() {
        $(document).on('keydown', function(e) {
            // Ctrl+Shift+V or Cmd+Shift+V
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                handlePasteClick();
            }
        });
    }

    /**
     * Show notification
     */
    function showNotification(message, type) {
        // Use Elementor's notification system
        if (elementorCommon && elementorCommon.dialogsManager) {
            elementorCommon.helpers.showNotification(message, type);
        } else {
            // Fallback to alert
            alert(message);
        }
    }

})(jQuery);
