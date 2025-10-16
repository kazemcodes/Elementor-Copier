# Requirements Document

## Introduction

The Elementor Copier Chrome extension is experiencing a critical failure in the copy-to-clipboard functionality. While the extension successfully detects Elementor elements, extracts their data, and prepares clipboard data, the actual clipboard write operation is not being triggered. Users click on elements in highlight mode, see the extraction logs, but the data never reaches the clipboard. This spec addresses the root cause of this failure and implements a robust clipboard write mechanism.

## Glossary

- **Content Script**: JavaScript code injected into web pages that can access the DOM
- **Background Script**: Service worker that handles extension-level operations
- **Offscreen Document**: Hidden HTML page used for clipboard operations in Manifest V3
- **Clipboard API**: Browser API for reading/writing clipboard data
- **Message Passing**: Chrome extension communication mechanism between scripts

## Requirements

### Requirement 1: Diagnose Clipboard Write Failure

**User Story:** As a developer, I want to identify why the clipboard write is not being triggered, so that I can fix the root cause of the copy failure.

#### Acceptance Criteria

1. WHEN element data is extracted THEN the System SHALL log the extraction completion with data size
2. WHEN copyToClipboardWithRetry is called THEN the System SHALL log the function entry with parameters
3. WHEN a message is sent to background script THEN the System SHALL log the message action and data type
4. WHEN background script receives the message THEN the System SHALL log the receipt with sender information
5. WHEN offscreen document is invoked THEN the System SHALL log the clipboard write attempt
6. IF any step fails THEN the System SHALL log the specific failure point with error details
7. WHEN clipboard write completes THEN the System SHALL log success confirmation
8. WHEN the callback is invoked THEN the System SHALL log the callback execution with response data

### Requirement 2: Fix Click Handler Callback Chain

**User Story:** As a user clicking on an Elementor element, I want the copy operation to complete successfully, so that I can paste the element into my WordPress site.

#### Acceptance Criteria

1. WHEN an element is clicked in highlight mode THEN the System SHALL invoke the appropriate copy function with a valid callback
2. WHEN extractElementData completes THEN the System SHALL pass the extracted data to processClipboardData
3. WHEN processClipboardData completes THEN the System SHALL pass the processed data to copyToClipboardWithRetry
4. WHEN copyToClipboardWithRetry is called THEN the System SHALL verify the callback parameter is a function
5. IF the callback is undefined or null THEN the System SHALL create a default callback function
6. WHEN the copy operation completes THEN the System SHALL invoke the callback with success status
7. WHEN the callback is invoked THEN the System SHALL trigger user notification
8. WHEN notification is shown THEN the System SHALL display the element type and success message

### Requirement 3: Implement Robust Message Passing

**User Story:** As a developer, I want reliable message passing between content script and background script, so that clipboard operations never fail silently.

#### Acceptance Criteria

1. WHEN sending a message to background THEN the System SHALL verify chrome.runtime is available
2. WHEN chrome.runtime.sendMessage is called THEN the System SHALL include a response callback
3. WHEN the response callback is invoked THEN the System SHALL check for chrome.runtime.lastError
4. IF chrome.runtime.lastError exists THEN the System SHALL log the error and attempt retry
5. WHEN background script receives copyToClipboard message THEN the System SHALL validate the data parameter exists
6. WHEN data validation passes THEN the System SHALL forward the request to offscreen document
7. WHEN offscreen document completes THEN the System SHALL send response back to content script
8. IF message passing fails after retries THEN the System SHALL invoke error callback with detailed error

### Requirement 4: Enhance Offscreen Document Clipboard Write

**User Story:** As a user, I want the clipboard write to succeed reliably, so that I can copy elements without errors.

#### Acceptance Criteria

1. WHEN offscreen document receives copyToClipboard message THEN the System SHALL verify navigator.clipboard is available
2. WHEN navigator.clipboard is available THEN the System SHALL convert data to JSON string
3. WHEN JSON string is created THEN the System SHALL call navigator.clipboard.writeText with the string
4. WHEN writeText completes successfully THEN the System SHALL send success response to background
5. IF writeText fails THEN the System SHALL attempt fallback clipboard write method
6. WHEN fallback method is used THEN the System SHALL create a textarea element and use document.execCommand
7. WHEN any clipboard write succeeds THEN the System SHALL log success with data size
8. IF all clipboard write methods fail THEN the System SHALL send error response with failure reason

### Requirement 5: Add Comprehensive Error Handling

**User Story:** As a user, I want clear error messages when copy fails, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN any clipboard operation fails THEN the System SHALL create a detailed error object with code and message
2. WHEN error is created THEN the System SHALL include technical details for debugging
3. WHEN error is created THEN the System SHALL include user-friendly message with actionable guidance
4. WHEN error occurs THEN the System SHALL display browser notification with error message
5. WHEN error notification is shown THEN the System SHALL include troubleshooting suggestions
6. WHEN maximum retries are reached THEN the System SHALL log all retry attempts with timestamps
7. WHEN error is logged THEN the System SHALL store error in chrome.storage for debugging
8. WHEN user opens extension popup THEN the System SHALL display recent errors if any exist

### Requirement 6: Implement Fallback Copy Mechanisms

**User Story:** As a user, I want alternative copy methods if the primary method fails, so that I can still copy elements even with browser restrictions.

#### Acceptance Criteria

1. WHEN primary clipboard write fails THEN the System SHALL attempt offscreen document method
2. WHEN offscreen document method fails THEN the System SHALL attempt direct content script clipboard write
3. WHEN direct clipboard write is attempted THEN the System SHALL use navigator.clipboard.writeText in content script context
4. IF all automatic methods fail THEN the System SHALL store data in chrome.storage
5. WHEN data is stored in chrome.storage THEN the System SHALL display notification with manual copy instructions
6. WHEN manual copy is needed THEN the System SHALL provide extension popup button to retrieve stored data
7. WHEN user clicks popup copy button THEN the System SHALL display data in copyable text area
8. WHEN any fallback succeeds THEN the System SHALL log which method succeeded

### Requirement 7: Add Clipboard Verification

**User Story:** As a developer, I want to verify clipboard content after write, so that I can confirm the operation succeeded correctly.

#### Acceptance Criteria

1. WHEN clipboard write reports success THEN the System SHALL attempt to read clipboard content
2. WHEN clipboard content is read THEN the System SHALL verify it matches the written data
3. WHEN verification is performed THEN the System SHALL parse JSON to ensure validity
4. WHEN JSON parsing succeeds THEN the System SHALL verify required fields exist
5. WHEN verification passes THEN the System SHALL log confirmation with data summary
6. IF verification fails THEN the System SHALL log warning and attempt re-write
7. WHEN re-write is attempted THEN the System SHALL use alternative clipboard method
8. IF verification fails after re-write THEN the System SHALL notify user of potential clipboard issue

### Requirement 8: Improve User Feedback

**User Story:** As a user, I want immediate visual feedback when I copy an element, so that I know the operation succeeded.

#### Acceptance Criteria

1. WHEN element is clicked THEN the System SHALL show loading indicator on the element
2. WHEN clipboard write starts THEN the System SHALL display "Copying..." notification
3. WHEN clipboard write succeeds THEN the System SHALL show success animation on the element
4. WHEN success animation plays THEN the System SHALL display green checkmark overlay for 2 seconds
5. WHEN success occurs THEN the System SHALL show browser notification with element type
6. WHEN notification is displayed THEN the System SHALL include element ID and source URL
7. WHEN copy completes THEN the System SHALL update extension badge with checkmark
8. IF copy fails THEN the System SHALL show red X overlay and error notification
