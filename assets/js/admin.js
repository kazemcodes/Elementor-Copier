/**
 * Admin Interface JavaScript
 * Elementor Widget Copier - Persian RTL Interface
 */

(function($) {
    'use strict';

    /**
     * Elementor Copier Admin Object
     */
    const ElementorCopierAdmin = {
        
        /**
         * Selected content data
         */
        selectedContent: [],

        /**
         * Initialize
         */
        init: function() {
            this.bindEvents();
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            // Source URL validation
            $('#source-url').on('blur', this.validateUrl.bind(this));
            $('#source-url').on('input', this.clearUrlValidation.bind(this));

            // Authentication method change
            $('input[name="auth_method"]').on('change', this.handleAuthMethodChange.bind(this));

            // Load content button
            $('#load-content-btn').on('click', this.handleLoadContent.bind(this));

            // Target type change
            $('input[name="target_type"]').on('change', this.handleTargetTypeChange.bind(this));

            // Copy button click
            $('#copy-content-btn').on('click', this.handleCopyContent.bind(this));
        },

        /**
         * Handle authentication method change
         */
        handleAuthMethodChange: function(e) {
            const method = $('input[name="auth_method"]:checked').val();
            
            if (method === 'public') {
                $('#auth-credentials').hide();
            } else {
                $('#auth-credentials').show();
            }
        },

        /**
         * Handle target type change
         */
        handleTargetTypeChange: function(e) {
            const targetType = $('input[name="target_type"]:checked').val();
            
            // Hide all target options
            $('.target-options').hide();
            
            // Show relevant options based on selection
            if (targetType === 'new_page') {
                $('#new-page-options').show();
            } else if (targetType === 'existing_page') {
                $('#existing-page-options').show();
                // Load existing pages if not already loaded
                this.loadExistingPages();
            } else if (targetType === 'template') {
                $('#template-options').show();
            }
        },

        /**
         * Load existing pages for selection
         */
        loadExistingPages: function() {
            const $select = $('#existing-page-select');
            
            // Check if already loaded
            if ($select.find('option').length > 1) {
                return;
            }

            const self = this;
            
            // Show loading state
            $select.prop('disabled', true);
            $select.html('<option value="">' + elementorCopierAdmin.strings.loadingPages + '</option>');

            // Load pages via AJAX
            $.ajax({
                url: elementorCopierAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'elementor_copier_get_local_pages',
                    nonce: elementorCopierAdmin.nonce
                },
                success: function(response) {
                    if (response.success && response.data && response.data.pages) {
                        self.populatePageSelect(response.data.pages);
                    } else {
                        $select.html('<option value="">' + elementorCopierAdmin.strings.noContent + '</option>');
                    }
                },
                error: function() {
                    $select.html('<option value="">' + elementorCopierAdmin.strings.copyError + '</option>');
                },
                complete: function() {
                    $select.prop('disabled', false);
                }
            });
        },

        /**
         * Populate page select dropdown
         */
        populatePageSelect: function(pages) {
            const $select = $('#existing-page-select');
            $select.html('<option value="">' + elementorCopierAdmin.strings.selectExistingPage + '</option>');
            
            pages.forEach(function(page) {
                $select.append(
                    $('<option></option>')
                        .attr('value', page.id)
                        .text(page.title + ' (ID: ' + page.id + ')')
                );
            });
        },

        /**
         * Handle load content action
         */
        handleLoadContent: function(e) {
            e.preventDefault();

            // Validate source URL
            if (!this.validateUrl()) {
                this.showMessage('error', elementorCopierAdmin.strings.enterUrl);
                return;
            }

            const self = this;
            const $button = $('#load-content-btn');
            const $spinner = $('#load-content-spinner');
            const authMethod = $('input[name="auth_method"]:checked').val();

            // Validate credentials if needed
            if (authMethod !== 'public') {
                const username = $('#auth-username').val().trim();
                const password = $('#auth-password').val().trim();
                
                if (!username || !password) {
                    this.showMessage('error', elementorCopierAdmin.strings.enterCredentials);
                    return;
                }
            }

            // Prepare data
            const data = {
                action: 'elementor_copier_load_content',
                nonce: elementorCopierAdmin.nonce,
                source_url: $('#source-url').val().trim(),
                auth_method: authMethod,
                username: $('#auth-username').val().trim(),
                password: $('#auth-password').val().trim()
            };

            // Update UI
            $button.prop('disabled', true);
            $spinner.addClass('is-active').show();
            $('#elementor-copier-messages').empty();

            // Send AJAX request
            $.ajax({
                url: elementorCopierAdmin.ajaxUrl,
                type: 'POST',
                data: data,
                success: function(response) {
                    if (response.success && response.data) {
                        // Combine pages and posts into a single content array
                        const content = [];
                        
                        if (response.data.pages && response.data.pages.length > 0) {
                            content.push(...response.data.pages);
                        }
                        
                        if (response.data.posts && response.data.posts.length > 0) {
                            content.push(...response.data.posts);
                        }
                        
                        self.renderContentTree(content);
                        $('#content-tree-section').show();
                        $('#target-selection-section').show();
                        
                        // Show extraction method info
                        if (response.data.extraction_method) {
                            console.log('Extraction method:', response.data.extraction_method);
                        }
                    } else {
                        self.showMessage('error', response.data?.message || elementorCopierAdmin.strings.connectionFailed);
                    }
                },
                error: function(xhr, status, error) {
                    self.showMessage('error', elementorCopierAdmin.strings.connectionFailed);
                },
                complete: function() {
                    $button.prop('disabled', false);
                    $spinner.removeClass('is-active').hide();
                }
            });
        },

        /**
         * Render content tree with hierarchical structure
         */
        renderContentTree: function(content) {
            const $container = $('#content-tree-container');
            $container.empty();

            if (!content || content.length === 0) {
                $container.html('<p style="text-align: center; color: #646970; padding: 20px;">' + 
                    elementorCopierAdmin.strings.noContent + '</p>');
                return;
            }

            // Create hierarchical tree structure
            const $tree = $('<ul class="content-tree-root"></ul>');
            
            content.forEach(function(page) {
                const $pageItem = self.createTreeItem(page, 'page');
                
                // Add sections if available
                if (page.elements && page.elements.length > 0) {
                    const $sectionsList = $('<ul class="content-tree-children"></ul>');
                    
                    page.elements.forEach(function(element) {
                        if (element.type === 'section') {
                            const $sectionItem = self.createTreeItem(element, 'section', page.id);
                            
                            // Add widgets within section if available
                            if (element.widgets && element.widgets.length > 0) {
                                const $widgetsList = $('<ul class="content-tree-children"></ul>');
                                
                                element.widgets.forEach(function(widget) {
                                    const $widgetItem = self.createTreeItem(widget, 'widget', page.id, element.id);
                                    $widgetsList.append($widgetItem);
                                });
                                
                                $sectionItem.append($widgetsList);
                            }
                            
                            $sectionsList.append($sectionItem);
                        } else if (element.type === 'widget') {
                            // Direct widget (not in a section)
                            const $widgetItem = self.createTreeItem(element, 'widget', page.id);
                            $sectionsList.append($widgetItem);
                        }
                    });
                    
                    $pageItem.append($sectionsList);
                }
                
                $tree.append($pageItem);
            });

            $container.append($tree);
        },

        /**
         * Create tree item element
         */
        createTreeItem: function(item, type, pageId, sectionId) {
            const self = this;
            const itemId = item.id || item.post_id;
            const itemTitle = item.title || 'Untitled';
            const hasChildren = (type === 'page' && item.elements && item.elements.length > 0) ||
                               (type === 'section' && item.widgets && item.widgets.length > 0);
            
            // Create unique identifier for the item
            let dataValue = itemId;
            if (type === 'widget' && sectionId) {
                dataValue = pageId + '-' + sectionId + '-' + itemId;
            } else if (type === 'section' || (type === 'widget' && pageId)) {
                dataValue = pageId + '-' + itemId;
            }
            
            const $li = $('<li class="tree-item tree-item-' + type + '"></li>');
            
            // Create expand/collapse toggle for items with children
            let $toggle = '';
            if (hasChildren) {
                $toggle = $('<span class="tree-toggle" data-expanded="true">▼</span>');
                $toggle.on('click', function(e) {
                    e.stopPropagation();
                    self.toggleTreeItem($(this));
                });
            } else {
                $toggle = $('<span class="tree-toggle-spacer"></span>');
            }
            
            // Create checkbox
            const $checkbox = $('<input type="checkbox" class="tree-checkbox" ' +
                'data-type="' + type + '" ' +
                'data-id="' + itemId + '" ' +
                'data-page-id="' + (pageId || itemId) + '" ' +
                (sectionId ? 'data-section-id="' + sectionId + '" ' : '') +
                'value="' + dataValue + '">');
            
            // Handle checkbox change for parent-child relationships
            $checkbox.on('change', function(e) {
                e.stopPropagation();
                self.handleTreeCheckboxChange($(this));
            });
            
            // Create label
            const $label = $('<label class="tree-label">' +
                '<span class="tree-item-title">' + itemTitle + '</span>' +
                '<span class="tree-item-type type-' + type + '">' + type + '</span>' +
                '</label>');
            
            // Assemble the item
            const $itemContent = $('<div class="tree-item-content"></div>');
            $itemContent.append($toggle);
            $itemContent.append($checkbox);
            $itemContent.append($label);
            
            $li.append($itemContent);
            
            return $li;
        },

        /**
         * Toggle tree item expand/collapse
         */
        toggleTreeItem: function($toggle) {
            const $li = $toggle.closest('.tree-item');
            const $children = $li.children('.content-tree-children');
            const isExpanded = $toggle.data('expanded');
            
            if (isExpanded) {
                $children.slideUp(200);
                $toggle.text('▶').data('expanded', false);
            } else {
                $children.slideDown(200);
                $toggle.text('▼').data('expanded', true);
            }
        },

        /**
         * Handle tree checkbox change with parent-child logic
         */
        handleTreeCheckboxChange: function($checkbox) {
            const isChecked = $checkbox.is(':checked');
            const $li = $checkbox.closest('.tree-item');
            
            // If checking a parent, check all children
            if (isChecked) {
                $li.find('.content-tree-children .tree-checkbox').prop('checked', true);
            } else {
                // If unchecking a parent, uncheck all children
                $li.find('.content-tree-children .tree-checkbox').prop('checked', false);
            }
            
            // Update parent checkboxes based on children state
            this.updateParentCheckboxes($li);
            
            // Update selected content array
            this.updateSelectedContent();
        },

        /**
         * Update parent checkboxes based on children state
         */
        updateParentCheckboxes: function($li) {
            const $parentLi = $li.parent('.content-tree-children').parent('.tree-item');
            
            if ($parentLi.length > 0) {
                const $parentCheckbox = $parentLi.children('.tree-item-content').find('.tree-checkbox');
                const $siblingCheckboxes = $li.siblings('.tree-item').find('> .tree-item-content > .tree-checkbox');
                const $allSiblings = $siblingCheckboxes.add($li.children('.tree-item-content').find('.tree-checkbox'));
                
                // Check if all siblings are checked
                const allChecked = $allSiblings.length > 0 && $allSiblings.filter(':checked').length === $allSiblings.length;
                const someChecked = $allSiblings.filter(':checked').length > 0;
                
                if (allChecked) {
                    $parentCheckbox.prop('checked', true).prop('indeterminate', false);
                } else if (someChecked) {
                    $parentCheckbox.prop('checked', false).prop('indeterminate', true);
                } else {
                    $parentCheckbox.prop('checked', false).prop('indeterminate', false);
                }
                
                // Recursively update parent's parent
                this.updateParentCheckboxes($parentLi);
            }
        },

        /**
         * Update selected content array from checkboxes
         */
        updateSelectedContent: function() {
            this.selectedContent = [];
            const self = this;
            
            $('#content-tree-container .tree-checkbox:checked').each(function() {
                const $checkbox = $(this);
                const type = $checkbox.data('type');
                const id = $checkbox.data('id');
                const pageId = $checkbox.data('page-id');
                const sectionId = $checkbox.data('section-id');
                
                // Only add if not a child of another selected item
                const $parentCheckboxes = $checkbox.closest('.tree-item').parents('.tree-item').find('> .tree-item-content > .tree-checkbox:checked');
                
                if ($parentCheckboxes.length === 0) {
                    self.selectedContent.push({
                        type: type,
                        id: id,
                        pageId: pageId,
                        sectionId: sectionId || null,
                        value: $checkbox.val()
                    });
                }
            });
            
            // Update copy button state
            $('#copy-content-btn').prop('disabled', this.selectedContent.length === 0);
        },



        /**
         * Validate URL
         */
        validateUrl: function() {
            const $urlInput = $('#source-url');
            const url = $urlInput.val().trim();

            if (!url) {
                return false;
            }

            // Basic URL validation
            const urlPattern = /^https?:\/\/.+/i;
            
            if (!urlPattern.test(url)) {
                this.showMessage('error', elementorCopierAdmin.strings.invalidUrl);
                return false;
            }

            return true;
        },

        /**
         * Clear URL validation message
         */
        clearUrlValidation: function() {
            $('#elementor-copier-messages').empty();
        },

        /**
         * Handle copy content action with batch processing
         */
        handleCopyContent: function(e) {
            e.preventDefault();

            if (this.selectedContent.length === 0) {
                this.showMessage('error', elementorCopierAdmin.strings.selectContent);
                return;
            }

            // Validate target selection
            const targetValidation = this.validateTargetSelection();
            if (!targetValidation.valid) {
                this.showMessage('error', targetValidation.message);
                return;
            }

            const self = this;
            const $button = $('#copy-content-btn');
            const $spinner = $('#copy-content-spinner');

            // Update UI
            $button.prop('disabled', true);
            $spinner.addClass('is-active').show();
            $('#elementor-copier-messages').empty();

            // Show initial progress
            this.showProgressIndicator(0, this.selectedContent.length);

            // Process items sequentially to avoid overwhelming the server
            this.processBatchItems(0, [], function(results) {
                // All items processed
                const successCount = results.filter(function(r) { return r.success; }).length;
                const errorCount = results.filter(function(r) { return !r.success; }).length;

                // Hide progress indicator
                self.hideProgressIndicator();

                // Show final message
                if (errorCount === 0) {
                    self.showMessage('success', elementorCopierAdmin.strings.copySuccess + ' (' + successCount + ' ' + elementorCopierAdmin.strings.items + ')');
                } else if (successCount === 0) {
                    self.showMessage('error', elementorCopierAdmin.strings.copyError);
                } else {
                    self.showMessage('warning', 
                        successCount + ' ' + elementorCopierAdmin.strings.itemsCopied + 
                        ', ' + errorCount + ' ' + elementorCopierAdmin.strings.itemsFailed);
                }

                // Reset selection
                self.selectedContent = [];
                $('#content-tree-container .tree-checkbox').prop('checked', false).prop('indeterminate', false);
                $button.prop('disabled', true);
                $spinner.removeClass('is-active').hide();
            });
        },

        /**
         * Validate target selection
         */
        validateTargetSelection: function() {
            const targetType = $('input[name="target_type"]:checked').val();
            
            if (targetType === 'new_page') {
                const pageTitle = $('#new-page-title').val().trim();
                if (!pageTitle) {
                    return {
                        valid: false,
                        message: elementorCopierAdmin.strings.enterPageTitle
                    };
                }
            } else if (targetType === 'existing_page') {
                const pageId = $('#existing-page-select').val();
                if (!pageId) {
                    return {
                        valid: false,
                        message: elementorCopierAdmin.strings.selectExistingPage
                    };
                }
            } else if (targetType === 'template') {
                const templateTitle = $('#template-title').val().trim();
                if (!templateTitle) {
                    return {
                        valid: false,
                        message: elementorCopierAdmin.strings.enterTemplateTitle
                    };
                }
            }
            
            return { valid: true };
        },

        /**
         * Get target selection data
         */
        getTargetSelectionData: function() {
            const targetType = $('input[name="target_type"]:checked').val();
            const data = {
                target_type: targetType
            };
            
            if (targetType === 'new_page') {
                data.page_title = $('#new-page-title').val().trim();
            } else if (targetType === 'existing_page') {
                data.page_id = $('#existing-page-select').val();
                data.position = $('input[name="insert_position"]:checked').val();
            } else if (targetType === 'template') {
                data.template_title = $('#template-title').val().trim();
                data.template_type = $('#template-type').val();
            }
            
            return data;
        },

        /**
         * Process batch items sequentially
         */
        processBatchItems: function(index, results, callback) {
            const self = this;
            
            if (index >= this.selectedContent.length) {
                // All items processed
                callback(results);
                return;
            }

            const item = this.selectedContent[index];
            
            // Update progress
            this.showProgressIndicator(index + 1, this.selectedContent.length);

            // Extract and copy the item
            this.extractAndCopyContent(item, function(success, message) {
                results.push({
                    success: success,
                    item: item,
                    message: message
                });

                // Process next item
                self.processBatchItems(index + 1, results, callback);
            });
        },

        /**
         * Extract and copy content from source site
         */
        extractAndCopyContent: function(item, callback) {
            const self = this;
            
            // Get target selection data
            const targetData = this.getTargetSelectionData();
            
            // Determine what to extract based on item type
            let extractData = {
                action: 'elementor_copier_import_content',
                nonce: elementorCopierAdmin.nonce,
                source_url: $('#source-url').val().trim(),
                post_id: item.pageId,
                auth_method: $('input[name="auth_method"]:checked').val(),
                username: $('#auth-username').val().trim(),
                password: $('#auth-password').val().trim()
            };

            // Add element-specific data for sections and widgets
            if (item.type === 'section') {
                extractData.element_id = item.id;
                extractData.element_type = 'section';
            } else if (item.type === 'widget') {
                extractData.element_id = item.id;
                extractData.element_type = 'widget';
                if (item.sectionId) {
                    extractData.section_id = item.sectionId;
                }
            } else if (item.type === 'page') {
                extractData.element_type = 'page';
            }

            // Add target selection data
            Object.assign(extractData, targetData);

            $.ajax({
                url: elementorCopierAdmin.ajaxUrl,
                type: 'POST',
                data: extractData,
                success: function(response) {
                    if (response.success && response.data) {
                        // Data imported successfully
                        console.log('Imported ' + item.type + ' (ID: ' + item.id + '):', response.data);
                        callback(true, response.data.message || 'Success');
                    } else {
                        console.error('Failed to import ' + item.type + ' (ID: ' + item.id + ')');
                        callback(false, response.data?.message || 'Import failed');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error importing ' + item.type + ' (ID: ' + item.id + '):', error);
                    callback(false, 'Network error: ' + error);
                }
            });
        },

        /**
         * Show progress indicator
         */
        showProgressIndicator: function(current, total) {
            const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
            const progressText = elementorCopierAdmin.strings.processing + ' ' + current + ' / ' + total + ' (' + percentage + '%)';
            
            // Create or update progress bar
            let $progressBar = $('#batch-progress-bar');
            if ($progressBar.length === 0) {
                $progressBar = $('<div id="batch-progress-bar" class="batch-progress-bar">' +
                    '<div class="progress-bar-fill"></div>' +
                    '<div class="progress-bar-text"></div>' +
                    '</div>');
                $('#copy-content-spinner').after($progressBar);
            }
            
            $progressBar.find('.progress-bar-fill').css('width', percentage + '%');
            $progressBar.find('.progress-bar-text').text(progressText);
            $progressBar.show();
        },

        /**
         * Hide progress indicator
         */
        hideProgressIndicator: function() {
            $('#batch-progress-bar').fadeOut(300, function() {
                $(this).remove();
            });
        },

        /**
         * Show message
         */
        showMessage: function(type, message) {
            const $messages = $('#elementor-copier-messages');
            const noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
            
            const $notice = $('<div class="notice ' + noticeClass + ' is-dismissible">' +
                '<p>' + message + '</p>' +
                '</div>');

            $messages.empty().append($notice);

            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
        }
    };

    /**
     * Initialize on document ready
     */
    $(document).ready(function() {
        ElementorCopierAdmin.init();
    });

})(jQuery);

/**
 * Paste from Clipboard Functionality
 */
(function($) {
    'use strict';

    const PasteHandler = {
        pastedData: null,

        init: function() {
            this.bindPasteEvents();
            this.loadPages();
        },

        bindPasteEvents: function() {
            $('#paste-from-clipboard-btn').on('click', this.handlePasteClick.bind(this));
            $('#import-pasted-content-btn').on('click', this.handleImportPasted.bind(this));
            $('#cancel-paste-btn').on('click', this.handleCancelPaste.bind(this));
            $('input[name="paste_target_type"]').on('change', this.handlePasteTargetTypeChange.bind(this));
        },

        /**
         * Handle paste target type change
         */
        handlePasteTargetTypeChange: function(e) {
            const targetType = $('input[name="paste_target_type"]:checked').val();
            
            // Hide all target options
            $('.paste-target-options').hide();
            
            // Show relevant options based on selection
            if (targetType === 'new_page') {
                $('#paste-new-page-options').show();
            } else if (targetType === 'existing_page') {
                $('#paste-existing-page-options').show();
            } else if (targetType === 'template') {
                $('#paste-template-options').show();
            }
        },

        /**
         * Handle paste button click
         */
        handlePasteClick: async function(e) {
            e.preventDefault();
            
            const $button = $('#paste-from-clipboard-btn');
            const $spinner = $('#paste-spinner');
            
            // Check if Clipboard API is available
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                // Clipboard API not available - show manual paste option
                ElementorCopierAdmin.showMessage('warning', 'Clipboard API not available in your browser. Please paste the data manually below.');
                
                // Show manual paste textarea
                this.showManualPasteOption();
                
                console.warn('Clipboard API not available:', {
                    protocol: window.location.protocol,
                    hostname: window.location.hostname,
                    hasClipboard: !!navigator.clipboard,
                    hasReadText: !!(navigator.clipboard && navigator.clipboard.readText)
                });
                
                $button.prop('disabled', false);
                $spinner.removeClass('is-active').hide();
                return;
            }
            
            $button.prop('disabled', true);
            $spinner.addClass('is-active').show();

            try {
                console.log('Reading clipboard...');
                
                // Read from clipboard
                const text = await navigator.clipboard.readText();
                
                console.log('Clipboard read successfully, length:', text.length);
                console.log('First 100 chars:', text.substring(0, 100));
                
                // Parse JSON
                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error('Clipboard does not contain valid JSON data. Please copy an element using the Chrome extension first.');
                }
                
                console.log('JSON parsed successfully:', data);
                
                // Validate it's our format
                if (!data.type || data.type !== 'elementor-copier') {
                    console.error('Invalid data type:', data.type);
                    throw new Error('Invalid data format. Please copy using the Elementor Copier Chrome extension. Found type: ' + (data.type || 'none'));
                }
                
                if (!data.data || !data.elementType) {
                    console.error('Missing required fields:', {hasData: !!data.data, hasElementType: !!data.elementType});
                    throw new Error('Incomplete data. Please copy the element again using the Chrome extension.');
                }
                
                console.log('Data validated successfully');
                
                // Store pasted data
                this.pastedData = data;
                
                // Show preview
                this.showPreview(data);
                
                // Show target selection
                $('#paste-preview-container').slideDown();
                
                ElementorCopierAdmin.showMessage('success', 'Data loaded from clipboard! Select target and click Import.');
                
            } catch (error) {
                console.error('Paste error:', error);
                
                let errorMessage = error.message || 'Unknown error occurred';
                
                // Add helpful context
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Clipboard permission denied. Please allow clipboard access when prompted by your browser.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No data found in clipboard. Please copy an element using the Chrome extension first.';
                }
                
                ElementorCopierAdmin.showMessage('error', 'Paste failed: ' + errorMessage);
            } finally {
                $button.prop('disabled', false);
                $spinner.removeClass('is-active').hide();
            }
        },

        /**
         * Show manual paste option
         */
        showManualPasteOption: function() {
            const $preview = $('#paste-preview');
            
            const html = `
                <div class="manual-paste-container">
                    <h3>Manual Paste</h3>
                    <p>Paste the copied data from Chrome extension here:</p>
                    <textarea id="manual-paste-textarea" rows="10" style="width: 100%; font-family: monospace; font-size: 12px;" placeholder="Paste JSON data here..."></textarea>
                    <p>
                        <button type="button" id="manual-paste-submit-btn" class="button button-primary">
                            Load Data
                        </button>
                    </p>
                </div>
            `;
            
            $preview.html(html);
            $('#paste-preview-container').slideDown();
            
            // Bind manual paste submit
            $('#manual-paste-submit-btn').on('click', this.handleManualPaste.bind(this));
        },

        /**
         * Handle manual paste submit
         */
        handleManualPaste: function(e) {
            e.preventDefault();
            
            const text = $('#manual-paste-textarea').val().trim();
            
            if (!text) {
                ElementorCopierAdmin.showMessage('error', 'Please paste the data first.');
                return;
            }

            try {
                // Parse JSON
                const data = JSON.parse(text);
                
                // Validate it's our format
                if (!data.type || data.type !== 'elementor-copier') {
                    throw new Error('Invalid data format. Please copy using the Elementor Copier Chrome extension.');
                }
                
                if (!data.data || !data.elementType) {
                    throw new Error('Incomplete data. Please copy the element again using the Chrome extension.');
                }
                
                // Store pasted data
                this.pastedData = data;
                
                // Show preview
                this.showPreview(data);
                
                // Show target selection
                $('#paste-preview-container').slideDown();
                
                ElementorCopierAdmin.showMessage('success', 'Data loaded successfully! Select target and click Import.');
                
            } catch (error) {
                console.error('Manual paste error:', error);
                ElementorCopierAdmin.showMessage('error', 'Invalid data: ' + error.message);
            }
        },

        /**
         * Show preview of pasted data
         */
        showPreview: function(data) {
            const $preview = $('#paste-preview');
            
            const elementType = data.elementType || 'unknown';
            const widgetType = data.data?.widgetType || data.data?.elType || 'unknown';
            const sourceUrl = data.metadata?.sourceUrl || 'unknown';
            const copiedAt = data.metadata?.copiedAt || 'unknown';
            const mediaCount = data.media ? data.media.length : 0;
            
            const html = `
                <div class="paste-preview-item">
                    <div class="preview-header">
                        <span class="preview-type type-${elementType}">${elementType}</span>
                        ${widgetType !== 'unknown' ? `<span class="preview-widget-type">${widgetType}</span>` : ''}
                    </div>
                    <div class="preview-details">
                        <div class="preview-detail">
                            <strong>Source:</strong> ${sourceUrl}
                        </div>
                        <div class="preview-detail">
                            <strong>Copied:</strong> ${this.formatDate(copiedAt)}
                        </div>
                        ${data.metadata?.elementorVersion ? `
                        <div class="preview-detail">
                            <strong>Elementor Version:</strong> ${data.metadata.elementorVersion}
                        </div>
                        ` : ''}
                        ${mediaCount > 0 ? `
                        <div class="preview-detail preview-media-count">
                            <strong>Media Files:</strong> ${mediaCount} file${mediaCount !== 1 ? 's' : ''} found
                        </div>
                        ` : ''}
                    </div>
                    ${mediaCount > 0 ? `
                    <div class="preview-media-options">
                        <label class="media-option-label">
                            <input type="checkbox" id="download-media-checkbox" checked />
                            <strong>Download media to local library</strong>
                            <span class="description">Recommended: Downloads images and videos to your media library</span>
                        </label>
                    </div>
                    ` : ''}
                    <div class="preview-data">
                        <details>
                            <summary>View Raw Data</summary>
                            <pre>${JSON.stringify(data, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            `;
            
            $preview.html(html);
        },

        /**
         * Load pages for target selection
         */
        loadPages: function() {
            const $select = $('#paste-target-page');
            
            $.ajax({
                url: elementorCopierAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'elementor_copier_get_local_pages',
                    nonce: elementorCopierAdmin.nonce
                },
                success: function(response) {
                    if (response.success && response.data && response.data.pages) {
                        $select.html('<option value="">Select a page...</option>');
                        response.data.pages.forEach(function(page) {
                            $select.append(
                                $('<option></option>')
                                    .attr('value', page.id)
                                    .text(page.title + ' (ID: ' + page.id + ')')
                            );
                        });
                    }
                }
            });
        },

        /**
         * Handle import pasted content
         */
        handleImportPasted: function(e) {
            e.preventDefault();
            
            if (!this.pastedData) {
                ElementorCopierAdmin.showMessage('error', 'No data to import');
                return;
            }
            
            // Validate target selection based on type
            const targetType = $('input[name="paste_target_type"]:checked').val();
            const validation = this.validatePasteTarget(targetType);
            
            if (!validation.valid) {
                ElementorCopierAdmin.showMessage('error', validation.message);
                return;
            }
            
            // Gather import data based on target type
            const importData = this.getPasteImportData(targetType);
            const downloadMedia = $('#download-media-checkbox').is(':checked');
            const mediaCount = this.pastedData.media ? this.pastedData.media.length : 0;
            
            const $button = $('#import-pasted-content-btn');
            const $spinner = $('#import-spinner');
            
            $button.prop('disabled', true);
            $spinner.addClass('is-active').show();
            
            // Show media progress if downloading media
            if (downloadMedia && mediaCount > 0) {
                this.showMediaProgress(0, mediaCount);
            }
            
            // Send import request
            const ajaxData = {
                action: 'elementor_copier_paste_clipboard',
                nonce: elementorCopierAdmin.nonce,
                clipboard_data: JSON.stringify(this.pastedData),
                target_type: targetType,
                download_media: downloadMedia ? '1' : '0'
            };
            
            // Add target-specific data
            Object.assign(ajaxData, importData);
            
            $.ajax({
                url: elementorCopierAdmin.ajaxUrl,
                type: 'POST',
                data: ajaxData,
                success: function(response) {
                    if (response.success) {
                        // Show success message with media info if applicable
                        let message = 'Content imported successfully!';
                        
                        if (response.data?.media_results) {
                            const results = response.data.media_results;
                            if (results.downloaded > 0) {
                                message += ` ${results.downloaded} media file${results.downloaded !== 1 ? 's' : ''} downloaded.`;
                            }
                            if (results.failed > 0) {
                                message += ` ${results.failed} media file${results.failed !== 1 ? 's' : ''} failed.`;
                            }
                        }
                        
                        ElementorCopierAdmin.showMessage('success', message);
                        
                        // Show edit link if available
                        if (response.data?.edit_url) {
                            const editLink = `<a href="${response.data.edit_url}" target="_blank">Edit in Elementor</a>`;
                            setTimeout(function() {
                                ElementorCopierAdmin.showMessage('success', message + ' ' + editLink);
                            }, 100);
                        }
                        
                        // Reset
                        $('#paste-preview-container').slideUp();
                        PasteHandler.pastedData = null;
                        PasteHandler.hideMediaProgress();
                    } else {
                        ElementorCopierAdmin.showMessage('error', response.data?.message || 'Import failed');
                        PasteHandler.hideMediaProgress();
                    }
                },
                error: function() {
                    ElementorCopierAdmin.showMessage('error', 'Network error during import');
                    PasteHandler.hideMediaProgress();
                },
                complete: function() {
                    $button.prop('disabled', false);
                    $spinner.removeClass('is-active').hide();
                }
            });
        },

        /**
         * Validate paste target selection
         */
        validatePasteTarget: function(targetType) {
            if (targetType === 'new_page') {
                const pageTitle = $('#paste-new-page-title').val().trim();
                if (!pageTitle) {
                    return {
                        valid: false,
                        message: 'Please enter a page title'
                    };
                }
            } else if (targetType === 'existing_page') {
                const pageId = $('#paste-target-page').val();
                if (!pageId) {
                    return {
                        valid: false,
                        message: 'Please select a target page'
                    };
                }
            } else if (targetType === 'template') {
                const templateTitle = $('#paste-template-title').val().trim();
                if (!templateTitle) {
                    return {
                        valid: false,
                        message: 'Please enter a template title'
                    };
                }
            }
            
            return { valid: true };
        },

        /**
         * Get paste import data based on target type
         */
        getPasteImportData: function(targetType) {
            const data = {};
            
            if (targetType === 'new_page') {
                data.page_title = $('#paste-new-page-title').val().trim();
            } else if (targetType === 'existing_page') {
                data.target_page_id = $('#paste-target-page').val();
                data.position = $('input[name="paste_position"]:checked').val();
            } else if (targetType === 'template') {
                data.template_title = $('#paste-template-title').val().trim();
                data.template_type = $('#paste-template-type').val();
            }
            
            return data;
        },

        /**
         * Handle cancel paste
         */
        handleCancelPaste: function(e) {
            e.preventDefault();
            $('#paste-preview-container').slideUp();
            this.pastedData = null;
        },

        /**
         * Show media download progress
         */
        showMediaProgress: function(current, total) {
            const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
            const progressText = `Downloading media: ${current} / ${total} (${percentage}%)`;
            
            // Create or update progress bar
            let $progressBar = $('#paste-media-progress-bar');
            if ($progressBar.length === 0) {
                $progressBar = $('<div id="paste-media-progress-bar" class="media-progress-bar">' +
                    '<div class="progress-bar-fill"></div>' +
                    '<div class="progress-bar-text"></div>' +
                    '</div>');
                $('#import-spinner').after($progressBar);
            }
            
            $progressBar.find('.progress-bar-fill').css('width', percentage + '%');
            $progressBar.find('.progress-bar-text').text(progressText);
            $progressBar.show();
        },

        /**
         * Hide media download progress
         */
        hideMediaProgress: function() {
            $('#paste-media-progress-bar').fadeOut(300, function() {
                $(this).remove();
            });
        },

        /**
         * Format date for display
         */
        formatDate: function(isoString) {
            try {
                const date = new Date(isoString);
                return date.toLocaleString();
            } catch (e) {
                return isoString;
            }
        }
    };

    // Initialize paste handler
    $(document).ready(function() {
        PasteHandler.init();
    });

})(jQuery);
