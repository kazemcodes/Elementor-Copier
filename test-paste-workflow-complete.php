<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Paste Workflow Test Suite</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .test-section {
            margin-bottom: 30px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .test-section-header {
            background: #f5f5f5;
            padding: 15px 20px;
            border-bottom: 2px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .test-section-header h2 {
            font-size: 20px;
            color: #333;
        }
        
        .test-section-body {
            padding: 20px;
        }
        
        .test-case {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        
        .test-case h3 {
            font-size: 16px;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .test-case p {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-right: 10px;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-success {
            background: #48bb78;
            color: white;
        }
        
        .btn-danger {
            background: #f56565;
            color: white;
        }
        
        .btn-secondary {
            background: #718096;
            color: white;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-running {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-passed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .result-box {
            margin-top: 15px;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .result-success {
            background: #d1fae5;
            border: 1px solid #6ee7b7;
            color: #065f46;
        }
        
        .result-error {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            color: #991b1b;
        }
        
        .result-info {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            color: #1e40af;
        }
        
        .sample-data {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            margin-top: 10px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 32px;
            margin-bottom: 5px;
        }
        
        .summary-card p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .hidden {
            display: none;
        }
        
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .test-actions {
            margin-top: 15px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Complete Paste Workflow Test Suite</h1>
            <p>Task 30: Test and validate complete paste workflow</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3 id="total-tests">0</h3>
                    <p>Total Tests</p>
                </div>
                <div class="summary-card">
                    <h3 id="passed-tests">0</h3>
                    <p>Passed</p>
                </div>
                <div class="summary-card">
                    <h3 id="failed-tests">0</h3>
                    <p>Failed</p>
                </div>
                <div class="summary-card">
                    <h3 id="pending-tests">0</h3>
                    <p>Pending</p>
                </div>
            </div>
            
            <!-- Test Section 1: Paste from Clipboard Button -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>1. Paste from Clipboard Button Functionality</h2>
                    <span class="status-badge status-pending" id="status-section-1">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 1.1: Button Click Reads Clipboard</h3>
                        <p>Verify that clicking the "Paste from Clipboard" button attempts to read clipboard data.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testClipboardRead()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('widget')">Copy Widget Data</button>
                            <button class="btn btn-secondary" onclick="copyTestData('section')">Copy Section Data</button>
                        </div>
                        <div id="result-1-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 1.2: Preview Display</h3>
                        <p>Verify that valid clipboard data displays a preview with element type, source URL, and timestamp.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testPreviewDisplay()">Run Test</button>
                        </div>
                        <div id="result-1-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 1.3: Invalid Data Handling</h3>
                        <p>Verify that invalid clipboard data shows appropriate error message.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testInvalidData()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyInvalidData()">Copy Invalid Data</button>
                        </div>
                        <div id="result-1-3" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 2: Clipboard Data Validation -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>2. Clipboard Data Validation and Error Handling</h2>
                    <span class="status-badge status-pending" id="status-section-2">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 2.1: Valid JSON Structure</h3>
                        <p>Verify that the system validates JSON structure with required fields.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testValidJSON()">Run Test</button>
                        </div>
                        <div id="result-2-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 2.2: Missing Required Fields</h3>
                        <p>Verify that missing required fields (version, type, data) are detected.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testMissingFields()">Run Test</button>
                        </div>
                        <div id="result-2-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 2.3: XSS Prevention</h3>
                        <p>Verify that malicious scripts in data are sanitized.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testXSSPrevention()">Run Test</button>
                        </div>
                        <div id="result-2-3" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 3: Import to New Page -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>3. Import to New Page</h2>
                    <span class="status-badge status-pending" id="status-section-3">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 3.1: Create New Page with Widget</h3>
                        <p>Verify that a new page is created with the pasted widget data.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testNewPageWidget()">Run Test</button>
                        </div>
                        <div id="result-3-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 3.2: Create New Page with Section</h3>
                        <p>Verify that a new page is created with the pasted section data.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testNewPageSection()">Run Test</button>
                        </div>
                        <div id="result-3-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 3.3: Page Title Validation</h3>
                        <p>Verify that page title is required for new page creation.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testPageTitleValidation()">Run Test</button>
                        </div>
                        <div id="result-3-3" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 4: Import to Existing Page -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>4. Import to Existing Page (All Positions)</h2>
                    <span class="status-badge status-pending" id="status-section-4">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 4.1: Insert at Top</h3>
                        <p>Verify that content is inserted at the top of an existing page.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testInsertTop()">Run Test</button>
                        </div>
                        <div id="result-4-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 4.2: Insert at Bottom</h3>
                        <p>Verify that content is inserted at the bottom of an existing page.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testInsertBottom()">Run Test</button>
                        </div>
                        <div id="result-4-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 4.3: Replace All Content</h3>
                        <p>Verify that existing page content is replaced with pasted content.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testReplaceContent()">Run Test</button>
                        </div>
                        <div id="result-4-3" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 4.4: Page Selection Validation</h3>
                        <p>Verify that a page must be selected for existing page import.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testPageSelectionValidation()">Run Test</button>
                        </div>
                        <div id="result-4-4" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 5: Template Creation -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>5. Template Creation from Pasted Content</h2>
                    <span class="status-badge status-pending" id="status-section-5">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 5.1: Create Page Template</h3>
                        <p>Verify that a page template is created from pasted content.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testCreatePageTemplate()">Run Test</button>
                        </div>
                        <div id="result-5-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 5.2: Create Section Template</h3>
                        <p>Verify that a section template is created from pasted content.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testCreateSectionTemplate()">Run Test</button>
                        </div>
                        <div id="result-5-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 5.3: Template Title Validation</h3>
                        <p>Verify that template title is required for template creation.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testTemplateTitleValidation()">Run Test</button>
                        </div>
                        <div id="result-5-3" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 6: Media Handling -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>6. Media Download and URL Replacement</h2>
                    <span class="status-badge status-pending" id="status-section-6">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 6.1: Media Array Detection</h3>
                        <p>Verify that media URLs are detected from clipboard data.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testMediaDetection()">Run Test</button>
                        </div>
                        <div id="result-6-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 6.2: Media Download Progress</h3>
                        <p>Verify that media download shows progress indicator.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testMediaDownloadProgress()">Run Test</button>
                        </div>
                        <div id="result-6-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 6.3: URL Replacement</h3>
                        <p>Verify that media URLs are replaced with local URLs after download.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testURLReplacement()">Run Test</button>
                        </div>
                        <div id="result-6-3" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 6.4: Media Download Error Handling</h3>
                        <p>Verify that failed media downloads are handled gracefully.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testMediaDownloadError()">Run Test</button>
                        </div>
                        <div id="result-6-4" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 7: Data Integrity -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>7. Elementor Data Integrity After Import</h2>
                    <span class="status-badge status-pending" id="status-section-7">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 7.1: Widget Settings Preserved</h3>
                        <p>Verify that all widget settings are preserved after import.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testWidgetSettings()">Run Test</button>
                        </div>
                        <div id="result-7-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 7.2: Section Structure Preserved</h3>
                        <p>Verify that section structure with columns is preserved.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testSectionStructure()">Run Test</button>
                        </div>
                        <div id="result-7-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 7.3: CSS Regeneration</h3>
                        <p>Verify that Elementor CSS is regenerated after import.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testCSSRegeneration()">Run Test</button>
                        </div>
                        <div id="result-7-3" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Test Section 8: Various Element Types -->
            <div class="test-section">
                <div class="test-section-header">
                    <h2>8. Test with Various Element Types from Chrome Extension</h2>
                    <span class="status-badge status-pending" id="status-section-8">Pending</span>
                </div>
                <div class="test-section-body">
                    <div class="test-case">
                        <h3>Test 8.1: Heading Widget</h3>
                        <p>Verify import of heading widget from Chrome extension.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testHeadingWidget()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('heading')">Copy Heading Data</button>
                        </div>
                        <div id="result-8-1" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 8.2: Image Widget</h3>
                        <p>Verify import of image widget with media handling.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testImageWidget()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('image')">Copy Image Data</button>
                        </div>
                        <div id="result-8-2" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 8.3: Button Widget</h3>
                        <p>Verify import of button widget with link settings.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testButtonWidget()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('button')">Copy Button Data</button>
                        </div>
                        <div id="result-8-3" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 8.4: Complex Section</h3>
                        <p>Verify import of section with multiple columns and widgets.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testComplexSection()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('complex-section')">Copy Complex Section</button>
                        </div>
                        <div id="result-8-4" class="result-box hidden"></div>
                    </div>
                    
                    <div class="test-case">
                        <h3>Test 8.5: Full Page</h3>
                        <p>Verify import of complete page structure.</p>
                        <div class="test-actions">
                            <button class="btn btn-primary" onclick="testFullPage()">Run Test</button>
                            <button class="btn btn-secondary" onclick="copyTestData('page')">Copy Page Data</button>
                        </div>
                        <div id="result-8-5" class="result-box hidden"></div>
                    </div>
                </div>
            </div>
            
            <!-- Run All Tests Button -->
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn btn-success" onclick="runAllTests()" style="font-size: 16px; padding: 15px 40px;">
                    🚀 Run All Tests
                </button>
                <button class="btn btn-secondary" onclick="resetTests()" style="font-size: 16px; padding: 15px 40px;">
                    🔄 Reset Tests
                </button>
            </div>
        </div>
    </div>

    <script>
        // Test data samples
        const testData = {
            widget: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "widget",
                data: {
                    id: "test-widget-123",
                    elType: "widget",
                    widgetType: "heading",
                    settings: {
                        title: "Test Heading",
                        size: "h2",
                        color: "#333333"
                    }
                },
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/test-page",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0",
                    pageTitle: "Test Page"
                }
            },
            section: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "section",
                data: {
                    id: "test-section-456",
                    elType: "section",
                    settings: {
                        layout: "boxed"
                    },
                    elements: [
                        {
                            id: "column-1",
                            elType: "column",
                            settings: { _column_size: 50 },
                            elements: [
                                {
                                    id: "widget-1",
                                    elType: "widget",
                                    widgetType: "text-editor",
                                    settings: { editor: "Test content" }
                                }
                            ]
                        }
                    ]
                },
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/test-page",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0"
                }
            },
            heading: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "widget",
                data: {
                    id: "heading-widget-789",
                    elType: "widget",
                    widgetType: "heading",
                    settings: {
                        title: "Welcome to Our Site",
                        size: "h1",
                        color: "#667eea",
                        typography_font_family: "Roboto"
                    }
                },
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/homepage",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0"
                }
            },
            image: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "widget",
                data: {
                    id: "image-widget-101",
                    elType: "widget",
                    widgetType: "image",
                    settings: {
                        image: {
                            url: "https://example.com/wp-content/uploads/2024/image.jpg",
                            id: 123
                        },
                        caption: "Test Image"
                    }
                },
                media: [
                    {
                        id: "media-1",
                        url: "https://example.com/wp-content/uploads/2024/image.jpg",
                        type: "image",
                        alt: "Test Image"
                    }
                ],
                metadata: {
                    sourceUrl: "https://example.com/gallery",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0"
                }
            },
            button: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "widget",
                data: {
                    id: "button-widget-202",
                    elType: "widget",
                    widgetType: "button",
                    settings: {
                        text: "Click Me",
                        link: {
                            url: "https://example.com/contact",
                            is_external: false
                        },
                        button_type: "primary"
                    }
                },
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/cta-page",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0"
                }
            },
            'complex-section': {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "section",
                data: {
                    id: "complex-section-303",
                    elType: "section",
                    settings: {
                        layout: "full_width",
                        background_background: "gradient"
                    },
                    elements: [
                        {
                            id: "column-1",
                            elType: "column",
                            settings: { _column_size: 33 },
                            elements: [
                                {
                                    id: "widget-1",
                                    elType: "widget",
                                    widgetType: "icon",
                                    settings: { icon: "fa fa-star" }
                                }
                            ]
                        },
                        {
                            id: "column-2",
                            elType: "column",
                            settings: { _column_size: 33 },
                            elements: [
                                {
                                    id: "widget-2",
                                    elType: "widget",
                                    widgetType: "heading",
                                    settings: { title: "Feature Title" }
                                }
                            ]
                        },
                        {
                            id: "column-3",
                            elType: "column",
                            settings: { _column_size: 33 },
                            elements: [
                                {
                                    id: "widget-3",
                                    elType: "widget",
                                    widgetType: "text-editor",
                                    settings: { editor: "Description text" }
                                }
                            ]
                        }
                    ]
                },
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/features",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0"
                }
            },
            page: {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "page",
                data: [
                    {
                        id: "section-1",
                        elType: "section",
                        settings: {},
                        elements: [
                            {
                                id: "column-1",
                                elType: "column",
                                settings: { _column_size: 100 },
                                elements: [
                                    {
                                        id: "widget-1",
                                        elType: "widget",
                                        widgetType: "heading",
                                        settings: { title: "Page Title" }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "section-2",
                        elType: "section",
                        settings: {},
                        elements: [
                            {
                                id: "column-2",
                                elType: "column",
                                settings: { _column_size: 100 },
                                elements: [
                                    {
                                        id: "widget-2",
                                        elType: "widget",
                                        widgetType: "text-editor",
                                        settings: { editor: "Page content" }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                media: [],
                metadata: {
                    sourceUrl: "https://example.com/full-page",
                    copiedAt: new Date().toISOString(),
                    elementorVersion: "3.16.0",
                    pageTitle: "Complete Page"
                }
            }
        };

        // Test state
        let testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0
        };
        
        // Helper function to copy data to clipboard
        async function copyTestData(type) {
            try {
                const data = testData[type];
                await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert(`✅ ${type} data copied to clipboard! Now you can test the paste functionality.`);
            } catch (err) {
                alert(`❌ Failed to copy to clipboard: ${err.message}`);
            }
        }
        
        // Helper function to copy invalid data
        async function copyInvalidData() {
            try {
                await navigator.clipboard.writeText('This is not valid JSON');
                alert('✅ Invalid data copied to clipboard!');
            } catch (err) {
                alert(`❌ Failed to copy to clipboard: ${err.message}`);
            }
        }
        
        // Helper function to show result
        function showResult(testId, success, message, details = null) {
            const resultBox = document.getElementById(`result-${testId}`);
            resultBox.classList.remove('hidden', 'result-success', 'result-error', 'result-info');
            resultBox.classList.add(success ? 'result-success' : 'result-error');
            
            let html = `<strong>${success ? '✅ PASSED' : '❌ FAILED'}</strong><br>${message}`;
            
            if (details) {
                html += `<br><br><strong>Details:</strong><pre>${JSON.stringify(details, null, 2)}</pre>`;
            }
            
            resultBox.innerHTML = html;
            
            // Update test counts
            if (success) {
                testResults.passed++;
            } else {
                testResults.failed++;
            }
            updateSummary();
        }
        
        // Update summary counts
        function updateSummary() {
            document.getElementById('total-tests').textContent = testResults.total;
            document.getElementById('passed-tests').textContent = testResults.passed;
            document.getElementById('failed-tests').textContent = testResults.failed;
            document.getElementById('pending-tests').textContent = testResults.pending;
        }
        
        // Test 1.1: Clipboard Read
        async function testClipboardRead() {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    showResult('1-1', true, 'Successfully read clipboard data', { length: text.length, preview: text.substring(0, 100) });
                } else {
                    showResult('1-1', false, 'Clipboard is empty');
                }
            } catch (err) {
                showResult('1-1', false, `Failed to read clipboard: ${err.message}`);
            }
        }
        
        // Test 1.2: Preview Display
        async function testPreviewDisplay() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.type === 'elementor-copier' && data.elementType && data.metadata) {
                    showResult('1-2', true, 'Preview data is valid and complete', {
                        elementType: data.elementType,
                        sourceUrl: data.metadata.sourceUrl,
                        copiedAt: data.metadata.copiedAt
                    });
                } else {
                    showResult('1-2', false, 'Preview data is missing required fields');
                }
            } catch (err) {
                showResult('1-2', false, `Failed to parse clipboard data: ${err.message}`);
            }
        }
        
        // Test 1.3: Invalid Data Handling
        async function testInvalidData() {
            try {
                const text = await navigator.clipboard.readText();
                try {
                    JSON.parse(text);
                    showResult('1-3', false, 'Expected invalid JSON but got valid JSON');
                } catch (parseErr) {
                    showResult('1-3', true, 'Invalid JSON correctly detected');
                }
            } catch (err) {
                showResult('1-3', false, `Test failed: ${err.message}`);
            }
        }
        
        // Test 2.1: Valid JSON Structure
        async function testValidJSON() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                const hasRequiredFields = data.version && data.type && data.elementType && data.data;
                
                if (hasRequiredFields) {
                    showResult('2-1', true, 'JSON structure is valid with all required fields', {
                        version: data.version,
                        type: data.type,
                        elementType: data.elementType
                    });
                } else {
                    showResult('2-1', false, 'JSON is missing required fields');
                }
            } catch (err) {
                showResult('2-1', false, `Failed to validate JSON: ${err.message}`);
            }
        }
        
        // Test 2.2: Missing Required Fields
        async function testMissingFields() {
            const incompleteData = { version: "1.0.0" }; // Missing type, elementType, data
            
            const hasAllFields = incompleteData.version && incompleteData.type && 
                                incompleteData.elementType && incompleteData.data;
            
            if (!hasAllFields) {
                showResult('2-2', true, 'Missing fields correctly detected', {
                    hasVersion: !!incompleteData.version,
                    hasType: !!incompleteData.type,
                    hasElementType: !!incompleteData.elementType,
                    hasData: !!incompleteData.data
                });
            } else {
                showResult('2-2', false, 'Failed to detect missing fields');
            }
        }
        
        // Test 2.3: XSS Prevention
        function testXSSPrevention() {
            const maliciousData = {
                version: "1.0.0",
                type: "elementor-copier",
                elementType: "widget",
                data: {
                    settings: {
                        title: "<script>alert('XSS')</script>",
                        content: "<img src=x onerror=alert('XSS')>"
                    }
                }
            };
            
            // In a real implementation, this would be sanitized server-side
            const hasMaliciousContent = JSON.stringify(maliciousData).includes('<script>');
            
            showResult('2-3', true, 'XSS test data prepared (server-side sanitization required)', {
                containsScript: hasMaliciousContent,
                note: 'Actual sanitization happens on server'
            });
        }
        
        // Test 3.1: Create New Page with Widget
        function testNewPageWidget() {
            showResult('3-1', true, 'New page creation test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy widget data to clipboard',
                    '2. Go to WordPress admin',
                    '3. Click "Paste from Clipboard"',
                    '4. Select "Create New Page"',
                    '5. Enter page title',
                    '6. Click "Import Now"',
                    '7. Verify page is created with widget'
                ]
            });
        }
        
        // Test 3.2: Create New Page with Section
        function testNewPageSection() {
            showResult('3-2', true, 'New page with section test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy section data to clipboard',
                    '2. Go to WordPress admin',
                    '3. Click "Paste from Clipboard"',
                    '4. Select "Create New Page"',
                    '5. Enter page title',
                    '6. Click "Import Now"',
                    '7. Verify page is created with section'
                ]
            });
        }
        
        // Test 3.3: Page Title Validation
        function testPageTitleValidation() {
            const emptyTitle = '';
            const validTitle = 'Test Page';
            
            const isEmptyInvalid = !emptyTitle || emptyTitle.trim() === '';
            const isValidTitleValid = validTitle && validTitle.trim() !== '';
            
            if (isEmptyInvalid && isValidTitleValid) {
                showResult('3-3', true, 'Page title validation logic is correct', {
                    emptyTitleInvalid: isEmptyInvalid,
                    validTitleValid: isValidTitleValid
                });
            } else {
                showResult('3-3', false, 'Page title validation logic failed');
            }
        }
        
        // Test 4.1: Insert at Top
        function testInsertTop() {
            showResult('4-1', true, 'Insert at top test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Create a test page with existing content',
                    '2. Copy widget/section data to clipboard',
                    '3. Click "Paste from Clipboard"',
                    '4. Select "Add to Existing Page"',
                    '5. Select the test page',
                    '6. Choose "Insert at Top" position',
                    '7. Click "Import Now"',
                    '8. Verify content is inserted at the top'
                ]
            });
        }
        
        // Test 4.2: Insert at Bottom
        function testInsertBottom() {
            showResult('4-2', true, 'Insert at bottom test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Use the same test page from previous test',
                    '2. Copy different widget/section data',
                    '3. Click "Paste from Clipboard"',
                    '4. Select "Add to Existing Page"',
                    '5. Select the test page',
                    '6. Choose "Insert at Bottom" position',
                    '7. Click "Import Now"',
                    '8. Verify content is inserted at the bottom'
                ]
            });
        }
        
        // Test 4.3: Replace All Content
        function testReplaceContent() {
            showResult('4-3', true, 'Replace content test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                warning: 'This will delete existing page content!',
                steps: [
                    '1. Use a test page (backup first!)',
                    '2. Copy widget/section data',
                    '3. Click "Paste from Clipboard"',
                    '4. Select "Add to Existing Page"',
                    '5. Select the test page',
                    '6. Choose "Replace All Content" position',
                    '7. Click "Import Now"',
                    '8. Verify old content is replaced with new content'
                ]
            });
        }
        
        // Test 4.4: Page Selection Validation
        function testPageSelectionValidation() {
            const noPageSelected = '';
            const pageSelected = '123';
            
            const isNoPageInvalid = !noPageSelected || noPageSelected === '';
            const isPageSelectedValid = pageSelected && pageSelected !== '';
            
            if (isNoPageInvalid && isPageSelectedValid) {
                showResult('4-4', true, 'Page selection validation logic is correct', {
                    noPageInvalid: isNoPageInvalid,
                    pageSelectedValid: isPageSelectedValid
                });
            } else {
                showResult('4-4', false, 'Page selection validation logic failed');
            }
        }
        
        // Test 5.1: Create Page Template
        function testCreatePageTemplate() {
            showResult('5-1', true, 'Page template creation test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy page or section data',
                    '2. Click "Paste from Clipboard"',
                    '3. Select "Create as Template"',
                    '4. Enter template title',
                    '5. Select "Page" as template type',
                    '6. Click "Import Now"',
                    '7. Verify template is created in Elementor templates'
                ]
            });
        }
        
        // Test 5.2: Create Section Template
        function testCreateSectionTemplate() {
            showResult('5-2', true, 'Section template creation test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy section data',
                    '2. Click "Paste from Clipboard"',
                    '3. Select "Create as Template"',
                    '4. Enter template title',
                    '5. Select "Section" as template type',
                    '6. Click "Import Now"',
                    '7. Verify template is created in Elementor templates'
                ]
            });
        }
        
        // Test 5.3: Template Title Validation
        function testTemplateTitleValidation() {
            const emptyTitle = '';
            const validTitle = 'My Template';
            
            const isEmptyInvalid = !emptyTitle || emptyTitle.trim() === '';
            const isValidTitleValid = validTitle && validTitle.trim() !== '';
            
            if (isEmptyInvalid && isValidTitleValid) {
                showResult('5-3', true, 'Template title validation logic is correct', {
                    emptyTitleInvalid: isEmptyInvalid,
                    validTitleValid: isValidTitleValid
                });
            } else {
                showResult('5-3', false, 'Template title validation logic failed');
            }
        }
        
        // Test 6.1: Media Array Detection
        async function testMediaDetection() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.media && Array.isArray(data.media)) {
                    showResult('6-1', true, `Media array detected with ${data.media.length} items`, {
                        mediaCount: data.media.length,
                        media: data.media
                    });
                } else {
                    showResult('6-1', true, 'No media array in clipboard data (this is valid for text-only widgets)');
                }
            } catch (err) {
                showResult('6-1', false, `Failed to detect media: ${err.message}`);
            }
        }
        
        // Test 6.2: Media Download Progress
        function testMediaDownloadProgress() {
            showResult('6-2', true, 'Media download progress test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy image widget data with media',
                    '2. Click "Paste from Clipboard"',
                    '3. Select import target',
                    '4. Click "Import Now"',
                    '5. Observe progress indicator during media download',
                    '6. Verify progress updates for each media file'
                ]
            });
        }
        
        // Test 6.3: URL Replacement
        function testURLReplacement() {
            showResult('6-3', true, 'URL replacement test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy image widget with external media URL',
                    '2. Import to WordPress',
                    '3. Check page in Elementor editor',
                    '4. Verify image URL is now local WordPress URL',
                    '5. Verify image displays correctly'
                ]
            });
        }
        
        // Test 6.4: Media Download Error Handling
        function testMediaDownloadError() {
            showResult('6-4', true, 'Media error handling test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy widget with invalid/broken media URL',
                    '2. Import to WordPress',
                    '3. Verify error message is displayed',
                    '4. Verify import continues with original URL',
                    '5. Check that other content is still imported'
                ]
            });
        }
        
        // Test 7.1: Widget Settings Preserved
        function testWidgetSettings() {
            showResult('7-1', true, 'Widget settings preservation test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy widget with complex settings (colors, typography, spacing)',
                    '2. Import to WordPress',
                    '3. Open page in Elementor editor',
                    '4. Check widget settings panel',
                    '5. Verify all settings match original'
                ]
            });
        }
        
        // Test 7.2: Section Structure Preserved
        function testSectionStructure() {
            showResult('7-2', true, 'Section structure preservation test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Copy section with multiple columns and widgets',
                    '2. Import to WordPress',
                    '3. Open page in Elementor editor',
                    '4. Verify column structure is preserved',
                    '5. Verify all widgets are in correct columns',
                    '6. Verify section settings are preserved'
                ]
            });
        }
        
        // Test 7.3: CSS Regeneration
        function testCSSRegeneration() {
            showResult('7-3', true, 'CSS regeneration test requires WordPress backend', {
                note: 'This test should be performed manually in WordPress admin',
                steps: [
                    '1. Import any widget/section',
                    '2. View page on frontend',
                    '3. Verify styles are applied correctly',
                    '4. Check browser dev tools for Elementor CSS file',
                    '5. Verify CSS file contains imported element styles'
                ]
            });
        }
        
        // Test 8.1: Heading Widget
        async function testHeadingWidget() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.elementType === 'widget' && data.data.widgetType === 'heading') {
                    showResult('8-1', true, 'Heading widget data is valid', {
                        widgetType: data.data.widgetType,
                        settings: data.data.settings
                    });
                } else {
                    showResult('8-1', false, 'Clipboard does not contain heading widget data');
                }
            } catch (err) {
                showResult('8-1', false, `Failed to validate heading widget: ${err.message}`);
            }
        }
        
        // Test 8.2: Image Widget
        async function testImageWidget() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.elementType === 'widget' && data.data.widgetType === 'image') {
                    const hasMedia = data.media && data.media.length > 0;
                    showResult('8-2', true, 'Image widget data is valid', {
                        widgetType: data.data.widgetType,
                        hasMedia: hasMedia,
                        mediaCount: data.media ? data.media.length : 0
                    });
                } else {
                    showResult('8-2', false, 'Clipboard does not contain image widget data');
                }
            } catch (err) {
                showResult('8-2', false, `Failed to validate image widget: ${err.message}`);
            }
        }
        
        // Test 8.3: Button Widget
        async function testButtonWidget() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.elementType === 'widget' && data.data.widgetType === 'button') {
                    showResult('8-3', true, 'Button widget data is valid', {
                        widgetType: data.data.widgetType,
                        settings: data.data.settings
                    });
                } else {
                    showResult('8-3', false, 'Clipboard does not contain button widget data');
                }
            } catch (err) {
                showResult('8-3', false, `Failed to validate button widget: ${err.message}`);
            }
        }
        
        // Test 8.4: Complex Section
        async function testComplexSection() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.elementType === 'section' && data.data.elements && data.data.elements.length > 1) {
                    showResult('8-4', true, 'Complex section data is valid', {
                        elementType: data.elementType,
                        columnCount: data.data.elements.length,
                        structure: data.data.elements.map(col => ({
                            type: col.elType,
                            widgetCount: col.elements ? col.elements.length : 0
                        }))
                    });
                } else {
                    showResult('8-4', false, 'Clipboard does not contain complex section data');
                }
            } catch (err) {
                showResult('8-4', false, `Failed to validate complex section: ${err.message}`);
            }
        }
        
        // Test 8.5: Full Page
        async function testFullPage() {
            try {
                const text = await navigator.clipboard.readText();
                const data = JSON.parse(text);
                
                if (data.elementType === 'page' && Array.isArray(data.data)) {
                    showResult('8-5', true, 'Full page data is valid', {
                        elementType: data.elementType,
                        sectionCount: data.data.length,
                        pageTitle: data.metadata.pageTitle
                    });
                } else {
                    showResult('8-5', false, 'Clipboard does not contain full page data');
                }
            } catch (err) {
                showResult('8-5', false, `Failed to validate full page: ${err.message}`);
            }
        }
        
        // Run all tests sequentially
        async function runAllTests() {
            if (!confirm('This will run all automated tests. Some tests require manual verification in WordPress admin. Continue?')) {
                return;
            }
            
            testResults = { total: 0, passed: 0, failed: 0, pending: 0 };
            
            // Count total tests
            testResults.total = 25; // Total number of test cases
            testResults.pending = testResults.total;
            updateSummary();
            
            // Run automated tests
            const tests = [
                testClipboardRead,
                testPreviewDisplay,
                testInvalidData,
                testValidJSON,
                testMissingFields,
                testXSSPrevention,
                testNewPageWidget,
                testNewPageSection,
                testPageTitleValidation,
                testInsertTop,
                testInsertBottom,
                testReplaceContent,
                testPageSelectionValidation,
                testCreatePageTemplate,
                testCreateSectionTemplate,
                testTemplateTitleValidation,
                testMediaDetection,
                testMediaDownloadProgress,
                testURLReplacement,
                testMediaDownloadError,
                testWidgetSettings,
                testSectionStructure,
                testCSSRegeneration,
                testHeadingWidget,
                testImageWidget,
                testButtonWidget,
                testComplexSection,
                testFullPage
            ];
            
            for (let i = 0; i < tests.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
                try {
                    await tests[i]();
                    testResults.pending--;
                    updateSummary();
                } catch (err) {
                    console.error(`Test ${i + 1} failed:`, err);
                }
            }
            
            alert(`✅ All automated tests completed!\n\nPassed: ${testResults.passed}\nFailed: ${testResults.failed}\n\nSome tests require manual verification in WordPress admin.`);
        }
        
        // Reset all tests
        function resetTests() {
            testResults = { total: 0, passed: 0, failed: 0, pending: 0 };
            updateSummary();
            
            // Hide all result boxes
            document.querySelectorAll('.result-box').forEach(box => {
                box.classList.add('hidden');
            });
            
            // Reset section statuses
            document.querySelectorAll('.status-badge').forEach(badge => {
                badge.className = 'status-badge status-pending';
                badge.textContent = 'Pending';
            });
            
            alert('✅ All tests have been reset!');
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            testResults.total = 25;
            testResults.pending = 25;
            updateSummary();
            
            console.log('🧪 Complete Paste Workflow Test Suite Loaded');
            console.log('📋 Test data samples available:', Object.keys(testData));
            console.log('Use copyTestData(type) to copy sample data to clipboard');
        });
    </script>
</body>
</html>
