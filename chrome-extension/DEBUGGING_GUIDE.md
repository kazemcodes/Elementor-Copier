# Debugging Guide - Empty Paste Issue

## Problem
Paste operation executes successfully but elements don't appear correctly:
- Empty sections appear initially
- Then Elementor's own sections appear instead of copied content

## Enhanced Logging Added

### 1. Copy Operation Logging (`content-v2.js`)
```
[Extract] ========== EXTRACTING ELEMENT DATA ==========
[Extract] Element type: section/column/widget
[Extract] Element ID: xxx
[Extract] Settings attribute found: {...}
[Extract] Found X child elements
[Extract] ✓ Extraction complete
```

**What to check:**
- Are child elements being extracted? (should show > 0 for sections)
- Are settings being parsed correctly?
- Is the element type correct?

### 2. Format Conversion Logging (`elementor-format-converter.js`)
```
[FormatConverter] ========== CONVERSION START ==========
[FormatConverter] Input element type: section
[FormatConverter] Input children count: X
[FormatConverter] After conversion: {...}
[FormatConverter] Converted children count: X
[FormatConverter] ✓ Conversion successful
```

**What to check:**
- Are children preserved after conversion?
- Is the element structure maintained?
- Does sanitization remove any data?

### 3. Paste Preparation Logging (`paste-interceptor.js`)
```
[Paste Interceptor] ========== INJECTING INTO ELEMENTOR ==========
[Paste Interceptor] Native data to inject: {...}
[Paste Interceptor] Element type: section
[Paste Interceptor] Is array: true/false
```

**What to check:**
- Is the data structure correct before injection?
- Is it an array or single object?
- Does it have the expected properties?

### 4. Elementor Injection Logging (`editor-injector.js`)
```
[ElementorCopier] ========== PASTE OPERATION START ==========
[ElementorCopier] Raw element data received: {...}
[ElementorCopier] First element: {...}
[ElementorCopier] Child elements count: X
[ElementorCopier] --- METHOD 1: document/elements/create ---
[ElementorCopier] Target container ID: document
[ElementorCopier] Container type: document
[ElementorCopier] Creating element 1/1: section
[ElementorCopier] Element data: {...}
[ElementorCopier] ✓ Element created successfully
[ElementorCopier] Element in DOM check: true/false
```

**What to check:**
- Is the element data complete when it reaches Elementor?
- Does the element appear in DOM after creation?
- What container is being used?

## Diagnostic Steps

### Step 1: Check Copy Operation
1. Right-click and copy a section
2. Look for `[Extract]` logs in console
3. **Verify:**
   - Element type is correct (section/column/widget)
   - Child elements count > 0 for sections
   - Settings are being extracted
   - Final data structure looks complete

### Step 2: Check Format Conversion
1. After copy, look for `[FormatConverter]` logs
2. **Verify:**
   - Input and output have same structure
   - Children count matches before/after
   - No data loss during sanitization

### Step 3: Check Paste Preparation
1. Press Ctrl+V in Elementor editor
2. Look for `[Paste Interceptor]` logs
3. **Verify:**
   - Data structure is correct
   - Element type matches what was copied
   - Data is not empty or malformed

### Step 4: Check Elementor Injection
1. Look for `[ElementorCopier]` logs
2. **Verify:**
   - Element data is complete
   - Container is valid (usually "document")
   - Element creation succeeds
   - Element appears in DOM (check after 100ms)

## Common Issues & Solutions

### Issue 1: Empty Sections
**Symptoms:** Section pastes but has no content
**Possible causes:**
- Child elements not extracted during copy
- Children lost during format conversion
- Children not included in paste data

**Check logs for:**
```
[Extract] Found 0 child elements  ← Should be > 0
[FormatConverter] Input children count: 0  ← Should match extracted count
```

### Issue 2: Wrong Element Type
**Symptoms:** Different element appears than what was copied
**Possible causes:**
- Element type detection failed during copy
- Element type changed during conversion
- Elementor doesn't recognize the element type

**Check logs for:**
```
[Extract] Element type: unknown  ← Should be section/column/widget
[ElementorCopier] First element type: unknown  ← Should match copied type
```

### Issue 3: Settings Not Applied
**Symptoms:** Element pastes but looks different
**Possible causes:**
- Settings not extracted from source
- Settings removed during sanitization
- Settings format incompatible with target

**Check logs for:**
```
[Extract] No settings attribute found  ← Should find settings
[FormatConverter] Data after sanitization: {...}  ← Check if settings removed
```

### Issue 4: Element Not in DOM
**Symptoms:** Logs show success but nothing visible
**Possible causes:**
- Element created but not rendered
- Element created in wrong container
- Elementor version incompatibility

**Check logs for:**
```
[ElementorCopier] Element in DOM check: false  ← Should be true
[ElementorCopier] Target container ID: ???  ← Should be valid container
```

## Next Steps

1. **Reload extension** and test with enhanced logging
2. **Copy a simple section** (with 1-2 widgets)
3. **Paste in editor** and collect all console logs
4. **Share the logs** focusing on:
   - `[Extract]` - What was copied
   - `[FormatConverter]` - How it was converted
   - `[ElementorCopier]` - What was injected
   - DOM check results

## Expected Log Flow

```
COPY:
[Extract] ========== EXTRACTING ELEMENT DATA ==========
[Extract] Element type: section
[Extract] Found 2 child elements (columns)
[Extract] ✓ Extraction complete

PASTE:
[Paste Interceptor] ========== INJECTING INTO ELEMENTOR ==========
[FormatConverter] ========== CONVERSION START ==========
[FormatConverter] Input children count: 2
[FormatConverter] ✓ Conversion successful
[ElementorCopier] ========== PASTE OPERATION START ==========
[ElementorCopier] Child elements count: 2
[ElementorCopier] ✓ Element created successfully: section
[ElementorCopier] Element in DOM check: true
```

If any step shows 0 children or missing data, that's where the problem is!
