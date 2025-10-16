# Elementor Copier Extension - Release Build

## Installation Instructions

### Step 1: Load the Extension

1. Open Chrome and go to: `chrome://extensions`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select this `release` folder
5. The extension should now appear in your extensions list

### Step 2: Verify Installation

You should see:
- Extension name: "Elementor Copier"
- Version: 1.0.0
- No errors displayed
- Extension icon in your browser toolbar

### Step 3: Test Copy Function

1. Go to any WordPress site with Elementor
2. Right-click on any Elementor widget
3. Select "Copy Widget" from the context menu
4. You should see a success message

### Step 4: Test Paste Function

1. Go to YOUR WordPress site
2. Open a page in Elementor editor
3. Click on a section or column
4. Press **Ctrl+V** (or Cmd+V on Mac)
5. The widget should appear!

## Console Messages

Open browser console (F12) and look for:

```
🚀 [v2.0] Content script starting...
🔧 [v2.0] About to inject critical classes...
[Inline] Injection script added to HEAD
[Inline] ElementorEditorDetector injected
[Inline] EditorContextInjector injected
✨ [v2.0] Elementor Copier: Content script loaded - NEW VERSION
```

## Features

- Copy widgets, sections, columns, and pages
- Paste directly into Elementor editor (no plugin needed)
- Preserves all settings and styles
- Handles media URLs automatically
- Version compatibility (Elementor 2.x, 3.x, 4.x)
- Content sanitization for security

## Requirements

- Chrome 109+ (or Edge, Brave)
- WordPress with Elementor plugin
- Clipboard permissions

## Version

**Version**: 1.0.0 (v2.0 internal)
**Release Date**: October 16, 2025
