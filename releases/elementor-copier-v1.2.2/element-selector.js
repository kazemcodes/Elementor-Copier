/**
 * Elementor Copier - Advanced Element Selector
 * Chrome DevTools-style element highlighting and selection
 */

class ElementSelector {
  constructor() {
    this.enabled = false;
    this.currentElement = null;
    this.overlay = null;
    this.tooltip = null;
    this.onSelectCallback = null;
    
    this.init();
  }

  init() {
    this.createOverlay();
    this.createTooltip();
    this.attachEventListeners();
  }

  createOverlay() {
    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'elementor-copier-overlay';
    this.overlay.style.display = 'none';
    
    // Create layers (margin, padding, content)
    this.overlayMargin = document.createElement('div');
    this.overlayMargin.className = 'elementor-copier-overlay-margin';
    
    this.overlayPadding = document.createElement('div');
    this.overlayPadding.className = 'elementor-copier-overlay-padding';
    
    this.overlayContent = document.createElement('div');
    this.overlayContent.className = 'elementor-copier-overlay-content';
    
    this.overlay.appendChild(this.overlayMargin);
    this.overlay.appendChild(this.overlayPadding);
    this.overlay.appendChild(this.overlayContent);
    
    document.body.appendChild(this.overlay);
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'elementor-copier-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  attachEventListeners() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  enable(callback) {
    this.enabled = true;
    this.onSelectCallback = callback;
    
    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);
    
    this.showHint();
  }

  disable() {
    this.enabled = false;
    this.onSelectCallback = null;
    
    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    
    this.hideOverlay();
    this.hideTooltip();
    this.hideHint();
  }

  handleMouseMove(event) {
    if (!this.enabled) return;
    
    event.stopPropagation();
    
    const element = this.getElementorElement(event.target);
    if (element && element !== this.currentElement) {
      this.currentElement = element;
      this.highlightElement(element);
      this.updateTooltip(element, event);
    }
  }

  handleClick(event) {
    if (!this.enabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = this.getElementorElement(event.target);
    if (element && this.onSelectCallback) {
      this.selectElement(element);
      this.onSelectCallback(element);
    }
  }

  handleKeyDown(event) {
    if (!this.enabled) return;
    
    // ESC to cancel
    if (event.key === 'Escape') {
      event.preventDefault();
      this.disable();
    }
    
    // Arrow keys to navigate
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectParent();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectFirstChild();
    }
  }

  getElementorElement(target) {
    // Find closest Elementor element
    let element = target;
    
    while (element && element !== document.body) {
      // Check for Elementor data attributes
      if (element.hasAttribute('data-element_type') ||
          element.classList.contains('elementor-element') ||
          element.classList.contains('elementor-section') ||
          element.classList.contains('elementor-column') ||
          element.classList.contains('elementor-widget')) {
        return element;
      }
      element = element.parentElement;
    }
    
    return null;
  }

  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    // Get box model values
    const margin = {
      top: parseFloat(computedStyle.marginTop) || 0,
      right: parseFloat(computedStyle.marginRight) || 0,
      bottom: parseFloat(computedStyle.marginBottom) || 0,
      left: parseFloat(computedStyle.marginLeft) || 0
    };
    
    const padding = {
      top: parseFloat(computedStyle.paddingTop) || 0,
      right: parseFloat(computedStyle.paddingRight) || 0,
      bottom: parseFloat(computedStyle.paddingBottom) || 0,
      left: parseFloat(computedStyle.paddingLeft) || 0
    };
    
    // Position overlay
    this.overlay.style.display = 'block';
    
    // Margin box
    this.overlayMargin.style.top = (rect.top - margin.top + window.scrollY) + 'px';
    this.overlayMargin.style.left = (rect.left - margin.left + window.scrollX) + 'px';
    this.overlayMargin.style.width = (rect.width + margin.left + margin.right) + 'px';
    this.overlayMargin.style.height = (rect.height + margin.top + margin.bottom) + 'px';
    
    // Padding box
    this.overlayPadding.style.top = (rect.top + window.scrollY) + 'px';
    this.overlayPadding.style.left = (rect.left + window.scrollX) + 'px';
    this.overlayPadding.style.width = rect.width + 'px';
    this.overlayPadding.style.height = rect.height + 'px';
    
    // Content box
    this.overlayContent.style.top = (rect.top + padding.top + window.scrollY) + 'px';
    this.overlayContent.style.left = (rect.left + padding.left + window.scrollX) + 'px';
    this.overlayContent.style.width = (rect.width - padding.left - padding.right) + 'px';
    this.overlayContent.style.height = (rect.height - padding.top - padding.bottom) + 'px';
  }

  updateTooltip(element, event) {
    const elementType = this.getElementType(element);
    const elementId = element.getAttribute('data-id') || element.id || '';
    const widgetType = element.getAttribute('data-widget_type') || '';
    const rect = element.getBoundingClientRect();
    
    // Build tooltip content
    let html = '<span class="elementor-copier-tooltip-tag">' + elementType + '</span>';
    
    if (elementId) {
      html += '<span class="elementor-copier-tooltip-id">#' + elementId + '</span>';
    }
    
    if (widgetType) {
      html += '<span class="elementor-copier-tooltip-class">.' + widgetType + '</span>';
    }
    
    html += '<span class="elementor-copier-tooltip-size">' + 
            Math.round(rect.width) + ' × ' + Math.round(rect.height) + '</span>';
    
    html += '<span class="elementor-copier-tooltip-type ' + elementType.toLowerCase() + '">' + 
            elementType + '</span>';
    
    // Count children
    const childCount = this.countElementorChildren(element);
    if (childCount > 0) {
      html += '<span class="elementor-copier-tooltip-size"> • ' + childCount + ' items</span>';
    }
    
    this.tooltip.innerHTML = html;
    this.tooltip.style.display = 'block';
    
    // Position tooltip
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 8;
    let left = rect.left;
    
    // Keep tooltip in viewport
    if (top < 0) {
      top = rect.bottom + 8;
    }
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    
    this.tooltip.style.top = (top + window.scrollY) + 'px';
    this.tooltip.style.left = (left + window.scrollX) + 'px';
  }

  getElementType(element) {
    const elementType = element.getAttribute('data-element_type');
    
    if (elementType) {
      if (elementType.startsWith('widget')) return 'Widget';
      if (elementType === 'section') return 'Section';
      if (elementType === 'column') return 'Column';
    }
    
    if (element.classList.contains('elementor-section')) return 'Section';
    if (element.classList.contains('elementor-column')) return 'Column';
    if (element.classList.contains('elementor-widget')) return 'Widget';
    
    return 'Element';
  }

  countElementorChildren(element) {
    return element.querySelectorAll('[data-element_type]').length;
  }

  selectElement(element) {
    // Flash animation
    this.overlayContent.parentElement.classList.add('elementor-copier-copying');
    setTimeout(() => {
      this.overlayContent.parentElement.classList.remove('elementor-copier-copying');
    }, 600);
  }

  selectParent() {
    if (this.currentElement) {
      const parent = this.getElementorElement(this.currentElement.parentElement);
      if (parent) {
        this.currentElement = parent;
        this.highlightElement(parent);
        this.updateTooltip(parent, { clientX: 0, clientY: 0 });
      }
    }
  }

  selectFirstChild() {
    if (this.currentElement) {
      const child = this.currentElement.querySelector('[data-element_type]');
      if (child) {
        this.currentElement = child;
        this.highlightElement(child);
        this.updateTooltip(child, { clientX: 0, clientY: 0 });
      }
    }
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  showHint() {
    const hint = document.createElement('div');
    hint.className = 'elementor-copier-hint';
    hint.innerHTML = 'Click to copy • <kbd>↑</kbd><kbd>↓</kbd> Navigate • <kbd>ESC</kbd> Cancel';
    document.body.appendChild(hint);
    
    this.hintElement = hint;
    
    setTimeout(() => {
      if (hint.parentElement) {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 300);
      }
    }, 3000);
  }

  hideHint() {
    if (this.hintElement && this.hintElement.parentElement) {
      this.hintElement.remove();
    }
  }

  destroy() {
    this.disable();
    
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.remove();
    }
    
    if (this.tooltip && this.tooltip.parentElement) {
      this.tooltip.remove();
    }
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.ElementSelector = ElementSelector;
}
