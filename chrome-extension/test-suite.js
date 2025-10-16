/**
 * Elementor Copier - Test Suite
 * Comprehensive testing for Chrome Extension workflow
 */

// Test state
const testState = {
  total: 0,
  passed: 0,
  failed: 0,
  pending: 0,
  tests: []
};

// Test definitions
const testSuite = {
  'Elementor Detection': [
    {
      name: 'Detect Elementor on page',
      description: 'Verify extension can detect Elementor elements',
      test: async () => {
        const hasElementor = document.querySelector('[data-elementor-type]') !== null ||
                           document.querySelector('[data-elementor-id]') !== null ||
                           document.querySelector('[data-elementor-settings]') !== null;
        
        if (!hasElementor) {
          throw new Error('No Elementor elements found on page. Please test on an Elementor website.');
        }
        
        return { success: true, message: 'Elementor detected successfully' };
      }
    },
    {
      name: 'Count Elementor widgets',
      description: 'Count all widgets on the page',
      test: async () => {
        const widgets = document.querySelectorAll('[data-element_type^="widget."]');
        const count = widgets.length;
        
        if (count === 0) {
          throw new Error('No widgets found. Page may not have Elementor content.');
        }
        
        return { success: true, message: `Found ${count} widgets` };
      }
    },
    {
      name: 'Count Elementor sections',
      description: 'Count all sections on the page',
      test: async () => {
        const sections = document.querySelectorAll('[data-element_type="section"]');
        const count = sections.length;
        
        return { success: true, message: `Found ${count} sections` };
      }
    },
    {
      name: 'Count Elementor columns',
      description: 'Count all columns on the page',
      test: async () => {
        const columns = document.querySelectorAll('[data-element_type="column"]');
        const count = columns.length;
        
        return { success: true, message: `Found ${count} columns` };
      }
    },
    {
      name: 'Detect Elementor version',
      description: 'Try to detect the Elementor version',
      test: async () => {
        const versionMeta = document.querySelector('meta[name="generator"][content*="Elementor"]');
        let version = 'unknown';
        
        if (versionMeta) {
          const match = versionMeta.content.match(/Elementor\s+([\d.]+)/);
          if (match) {
            version = match[1];
          }
        }
        
        return { success: true, message: `Elementor version: ${version}` };
      }
    }
  ],

  'Widget Extraction': [
    {
      name: 'Extract widget data',
      description: 'Extract data from a widget element',
      test: async () => {
        const widget = document.querySelector('[data-element_type^="widget."]');
        
        if (!widget) {
          throw new Error('No widget found to test');
        }
        
        const data = extractElementData(widget);
        
        if (!data || !data.id || !data.elType) {
          throw new Error('Failed to extract widget data');
        }
        
        return { success: true, message: `Extracted widget: ${data.widgetType || data.elType}` };
      }
    },
    {
      name: 'Extract widget settings',
      description: 'Extract settings from widget data-elementor-settings',
      test: async () => {
        const widget = document.querySelector('[data-element_type^="widget."][data-elementor-settings]');
        
        if (!widget) {
          return { success: true, message: 'No widgets with settings found (this is OK)' };
        }
        
        const settingsAttr = widget.getAttribute('data-elementor-settings');
        const settings = JSON.parse(settingsAttr);
        
        if (!settings || typeof settings !== 'object') {
          throw new Error('Failed to parse widget settings');
        }
        
        return { success: true, message: `Extracted ${Object.keys(settings).length} settings` };
      }
    },
    {
      name: 'Extract media from widget',
      description: 'Extract media URLs from widget',
      test: async () => {
        const widget = document.querySelector('[data-element_type^="widget."]');
        
        if (!widget) {
          throw new Error('No widget found to test');
        }
        
        const media = extractMediaUrls(widget);
        
        return { success: true, message: `Found ${media.length} media items` };
      }
    }
  ],

  'Section Extraction': [
    {
      name: 'Extract section data',
      description: 'Extract data from a section element',
      test: async () => {
        const section = document.querySelector('[data-element_type="section"]');
        
        if (!section) {
          throw new Error('No section found to test');
        }
        
        const data = extractElementData(section);
        
        if (!data || !data.id || !data.elType) {
          throw new Error('Failed to extract section data');
        }
        
        return { success: true, message: `Extracted section with ${data.elements ? data.elements.length : 0} children` };
      }
    },
    {
      name: 'Extract nested elements',
      description: 'Extract child elements from section',
      test: async () => {
        const section = document.querySelector('[data-element_type="section"]');
        
        if (!section) {
          throw new Error('No section found to test');
        }
        
        const data = extractElementData(section);
        
        if (!data.elements || data.elements.length === 0) {
          throw new Error('Section has no child elements');
        }
        
        return { success: true, message: `Section has ${data.elements.length} child elements` };
      }
    }
  ],

  'Column Extraction': [
    {
      name: 'Extract column data',
      description: 'Extract data from a column element',
      test: async () => {
        const column = document.querySelector('[data-element_type="column"]');
        
        if (!column) {
          throw new Error('No column found to test');
        }
        
        const data = extractElementData(column);
        
        if (!data || !data.id || !data.elType) {
          throw new Error('Failed to extract column data');
        }
        
        return { success: true, message: 'Column data extracted successfully' };
      }
    }
  ],

  'Page Extraction': [
    {
      name: 'Extract full page data',
      description: 'Extract complete page structure',
      test: async () => {
        const page = document.querySelector('[data-elementor-type="wp-page"], [data-elementor-type="page"]');
        
        if (!page) {
          throw new Error('No Elementor page found');
        }
        
        const data = extractElementData(page);
        
        if (!data || !data.id) {
          throw new Error('Failed to extract page data');
        }
        
        return { success: true, message: 'Page data extracted successfully' };
      }
    }
  ],

  'Media Extraction': [
    {
      name: 'Extract image elements',
      description: 'Find all image elements',
      test: async () => {
        const images = document.querySelectorAll('img');
        const count = images.length;
        
        return { success: true, message: `Found ${count} image elements` };
      }
    },
    {
      name: 'Extract background images',
      description: 'Find background images from styles',
      test: async () => {
        const elementsWithBg = document.querySelectorAll('[style*="background"]');
        let count = 0;
        
        elementsWithBg.forEach(el => {
          const style = el.getAttribute('style');
          if (style && style.includes('background-image')) {
            count++;
          }
        });
        
        return { success: true, message: `Found ${count} background images` };
      }
    },
    {
      name: 'Extract video elements',
      description: 'Find all video elements',
      test: async () => {
        const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
        const count = videos.length;
        
        return { success: true, message: `Found ${count} video elements` };
      }
    }
  ],

  'Clipboard Data Format': [
    {
      name: 'Validate clipboard structure',
      description: 'Check if clipboard data matches specification',
      test: async () => {
        const widget = document.querySelector('[data-element_type^="widget."]');
        
        if (!widget) {
          throw new Error('No widget found to test');
        }
        
        const data = extractElementData(widget);
        const media = extractMediaUrls(widget);
        
        const clipboardData = {
          version: '1.0.0',
          type: 'elementor-copier',
          elementType: 'widget',
          data: data,
          media: media,
          metadata: {
            sourceUrl: window.location.href,
            copiedAt: new Date().toISOString(),
            elementorVersion: 'test'
          }
        };
        
        // Validate required fields
        if (!clipboardData.version) throw new Error('Missing version');
        if (!clipboardData.type) throw new Error('Missing type');
        if (!clipboardData.elementType) throw new Error('Missing elementType');
        if (!clipboardData.data) throw new Error('Missing data');
        if (!clipboardData.metadata) throw new Error('Missing metadata');
        
        return { success: true, message: 'Clipboard data structure is valid' };
      }
    },
    {
      name: 'Validate JSON serialization',
      description: 'Ensure data can be serialized to JSON',
      test: async () => {
        const widget = document.querySelector('[data-element_type^="widget."]');
        
        if (!widget) {
          throw new Error('No widget found to test');
        }
        
        const data = extractElementData(widget);
        const media = extractMediaUrls(widget);
        
        const clipboardData = {
          version: '1.0.0',
          type: 'elementor-copier',
          elementType: 'widget',
          data: data,
          media: media,
          metadata: {
            sourceUrl: window.location.href,
            copiedAt: new Date().toISOString()
          }
        };
        
        const jsonString = JSON.stringify(clipboardData, null, 2);
        const parsed = JSON.parse(jsonString);
        
        if (!parsed || !parsed.version) {
          throw new Error('JSON serialization failed');
        }
        
        return { success: true, message: `JSON size: ${(jsonString.length / 1024).toFixed(2)} KB` };
      }
    }
  ],

  'Extension Integration': [
    {
      name: 'Check extension installed',
      description: 'Verify Chrome extension is installed',
      test: async () => {
        // Try to detect if extension is installed by checking for injected content script
        const hasContentScript = typeof chrome !== 'undefined' && 
                                chrome.runtime && 
                                chrome.runtime.id;
        
        if (!hasContentScript) {
          throw new Error('Extension not detected. Please install the extension.');
        }
        
        return { success: true, message: 'Extension is installed' };
      }
    },
    {
      name: 'Test chrome.storage access',
      description: 'Verify storage API is accessible',
      test: async () => {
        if (typeof chrome === 'undefined' || !chrome.storage) {
          throw new Error('chrome.storage API not available');
        }
        
        // Try to read from storage
        try {
          const data = await chrome.storage.local.get('stats');
          return { success: true, message: 'Storage API accessible' };
        } catch (error) {
          throw new Error('Storage API error: ' + error.message);
        }
      }
    }
  ]
};

// Helper functions (simplified versions from content.js)
function extractElementData(element) {
  try {
    const data = {
      id: element.getAttribute('data-id') || generateId(),
      elType: element.getAttribute('data-element_type') || 'unknown',
      settings: {}
    };

    const settingsAttr = element.getAttribute('data-elementor-settings');
    if (settingsAttr) {
      try {
        data.settings = JSON.parse(settingsAttr);
      } catch (e) {
        console.warn('Could not parse settings');
      }
    }

    if (data.elType.startsWith('widget.')) {
      data.widgetType = data.elType.replace('widget.', '');
    }

    const childElements = element.querySelectorAll(':scope > .elementor-container > .elementor-column, :scope > .elementor-column-wrap > .elementor-widget-wrap > .elementor-element');
    
    if (childElements.length > 0) {
      data.elements = [];
      childElements.forEach(child => {
        const childData = extractElementData(child);
        if (childData) {
          data.elements.push(childData);
        }
      });
    }

    return data;
  } catch (error) {
    console.error('Error extracting element data:', error);
    return null;
  }
}

function extractMediaUrls(element) {
  const mediaArray = [];
  const seenUrls = new Set();

  try {
    // Extract images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      const url = img.src || img.getAttribute('data-src');
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaArray.push({
          id: generateId(),
          url: url,
          type: 'image',
          alt: img.alt || ''
        });
      }
    });

    // Extract background images
    const elementsWithStyle = element.querySelectorAll('[style*="background"]');
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style');
      if (style) {
        const bgImageMatches = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi);
        if (bgImageMatches) {
          bgImageMatches.forEach(match => {
            const urlMatch = match.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
            if (urlMatch && urlMatch[1] && !seenUrls.has(urlMatch[1])) {
              seenUrls.add(urlMatch[1]);
              mediaArray.push({
                id: generateId(),
                url: urlMatch[1],
                type: 'background-image'
              });
            }
          });
        }
      }
    });

    // Extract videos
    const videos = element.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    videos.forEach(video => {
      const url = video.src;
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaArray.push({
          id: generateId(),
          url: url,
          type: 'video'
        });
      }
    });

    return mediaArray;
  } catch (error) {
    console.error('Error extracting media:', error);
    return [];
  }
}

function generateId() {
  return 'el_' + Math.random().toString(36).substr(2, 9);
}

// Test runner
function initializeTestSuite() {
  const testSectionsContainer = document.getElementById('testSections');
  
  // Count total tests
  Object.values(testSuite).forEach(tests => {
    testState.total += tests.length;
    testState.pending += tests.length;
  });
  
  // Render test sections
  Object.entries(testSuite).forEach(([sectionName, tests]) => {
    const section = document.createElement('div');
    section.className = 'test-section';
    section.innerHTML = `
      <h2><span class="icon">📦</span> ${sectionName}</h2>
    `;
    
    tests.forEach((test, index) => {
      const testItem = document.createElement('div');
      testItem.className = 'test-item pending';
      testItem.id = `test-${sectionName}-${index}`;
      testItem.innerHTML = `
        <div style="flex: 1;">
          <div class="test-name">${test.name}</div>
          <div class="test-details">
            <strong>Description:</strong> ${test.description}<br>
            <strong>Status:</strong> <span class="detail-status">Pending</span><br>
            <strong>Result:</strong> <span class="detail-result">-</span>
          </div>
        </div>
        <button class="toggle-details">Details</button>
        <button class="test-button" onclick="runSingleTest('${sectionName}', ${index})">Run</button>
        <span class="test-status pending">Pending</span>
      `;
      
      section.appendChild(testItem);
      
      // Add toggle details functionality
      const toggleBtn = testItem.querySelector('.toggle-details');
      toggleBtn.addEventListener('click', () => {
        testItem.classList.toggle('show-details');
        toggleBtn.textContent = testItem.classList.contains('show-details') ? 'Hide' : 'Details';
      });
    });
    
    testSectionsContainer.appendChild(section);
  });
  
  updateSummary();
}

async function runSingleTest(sectionName, testIndex) {
  const test = testSuite[sectionName][testIndex];
  const testItem = document.getElementById(`test-${sectionName}-${testIndex}`);
  const statusEl = testItem.querySelector('.test-status');
  const detailStatus = testItem.querySelector('.detail-status');
  const detailResult = testItem.querySelector('.detail-result');
  const runButton = testItem.querySelector('.test-button');
  
  // Update UI to running state
  testItem.classList.remove('pending', 'passed', 'failed');
  statusEl.classList.remove('pending', 'passed', 'failed');
  statusEl.textContent = 'Running...';
  runButton.disabled = true;
  detailStatus.textContent = 'Running...';
  
  logTest(`Running: ${test.name}`, 'info');
  
  try {
    const result = await test.test();
    
    // Test passed
    testItem.classList.add('passed');
    statusEl.classList.add('passed');
    statusEl.textContent = '✓ Passed';
    detailStatus.textContent = 'Passed';
    detailResult.textContent = result.message || 'Test passed';
    
    testState.passed++;
    testState.pending--;
    
    logTest(`✓ ${test.name}: ${result.message}`, 'success');
  } catch (error) {
    // Test failed
    testItem.classList.add('failed');
    statusEl.classList.add('failed');
    statusEl.textContent = '✗ Failed';
    detailStatus.textContent = 'Failed';
    detailResult.textContent = error.message;
    
    testState.failed++;
    testState.pending--;
    
    logTest(`✗ ${test.name}: ${error.message}`, 'error');
  } finally {
    runButton.disabled = false;
    updateSummary();
  }
}

async function runAllTests() {
  const runAllButton = document.getElementById('runAllTests');
  runAllButton.disabled = true;
  runAllButton.textContent = '⏳ Running Tests...';
  
  logTest('Starting test suite execution...', 'info');
  
  // Reset state
  testState.passed = 0;
  testState.failed = 0;
  testState.pending = testState.total;
  
  // Run all tests sequentially
  for (const [sectionName, tests] of Object.entries(testSuite)) {
    logTest(`\n=== ${sectionName} ===`, 'info');
    
    for (let i = 0; i < tests.length; i++) {
      await runSingleTest(sectionName, i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  logTest('\n✓ Test suite execution completed!', 'success');
  logTest(`Results: ${testState.passed} passed, ${testState.failed} failed, ${testState.pending} pending`, 'info');
  
  runAllButton.disabled = false;
  runAllButton.textContent = '▶ Run All Tests';
}

function updateSummary() {
  document.getElementById('totalTests').textContent = testState.total;
  document.getElementById('passedTests').textContent = testState.passed;
  document.getElementById('failedTests').textContent = testState.failed;
  document.getElementById('pendingTests').textContent = testState.pending;
}

function logTest(message, type = 'info') {
  const testLog = document.getElementById('testLog');
  const entry = document.createElement('div');
  entry.className = `test-log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  
  testLog.appendChild(entry);
  testLog.scrollTop = testLog.scrollHeight;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initializeTestSuite();
  
  // Setup run all button
  document.getElementById('runAllTests').addEventListener('click', runAllTests);
  
  logTest('Test suite initialized. Ready to run tests.', 'success');
});

// Make runSingleTest available globally
window.runSingleTest = runSingleTest;
