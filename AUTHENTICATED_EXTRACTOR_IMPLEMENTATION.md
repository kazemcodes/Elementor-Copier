# Authenticated Extractor Implementation

## Overview

The `AuthenticatedExtractor` class has been successfully implemented as part of Task 15. This extractor enables the Elementor Widget Copier plugin to access private and protected content from source WordPress sites using WordPress login credentials.

## Implementation Details

### File Location
- **Path**: `includes/extractor/class-authenticated-extractor.php`
- **Namespace**: `ElementorCopier\Extractor`
- **Interface**: Implements `ExtractorInterface`

### Key Features

#### 1. WordPress Login Functionality
- Authenticates via `wp-login.php` endpoint
- Supports standard WordPress username/password authentication
- Handles login redirects (302/301 status codes)
- Provides Persian error messages for authentication failures

#### 2. Cookie-Based Session Management
- Extracts and stores authentication cookies from login response
- Maintains session state across multiple requests
- Automatically includes cookies in all subsequent requests
- Implements session cleanup on logout

#### 3. Authenticated REST API Access
- Uses authenticated cookies to access protected REST API endpoints
- Retrieves posts and pages with any status (draft, private, pending, etc.)
- Extracts post meta including `_elementor_data`
- Supports both `/wp-json/wp/v2/posts` and `/wp-json/wp/v2/pages` endpoints

#### 4. Admin-AJAX Fallback
- Implements fallback to `admin-ajax.php` if REST API fails
- Attempts to fetch nonce from admin pages for AJAX requests
- Tries Elementor-specific AJAX actions for data retrieval
- Provides multiple extraction paths for maximum compatibility

#### 5. Post Meta Retrieval with Authentication
- Extracts `_elementor_data` from post meta
- Handles different meta storage formats (array, string)
- Validates JSON structure before returning
- Provides detailed error messages in Persian

#### 6. Logout and Session Cleanup
- Implements explicit logout method
- Clears cookies and session data
- Automatically cleans up on object destruction
- Prevents session leaks

#### 7. Error Handling for Authentication Failures
- Comprehensive error codes for different failure scenarios
- Persian and English error messages
- Detailed error information for debugging
- Actionable suggestions for users

#### 8. Integration with SourceConnector
- Seamlessly integrates with existing connector infrastructure
- Automatically selected when credentials are provided
- Falls back to other methods if authentication fails
- Maintains consistent interface with other extractors

## Class Methods

### Public Methods

#### `__construct( string $source_url = '' )`
Initializes the extractor with optional source URL.

#### `can_extract( string $url ): bool`
Checks if extraction is possible by attempting authentication.

#### `get_pages(): array`
Retrieves list of pages from source site (including private pages).

#### `get_posts(): array`
Retrieves list of posts from source site (including private posts).

#### `get_elementor_data( int $post_id ): array`
Extracts Elementor data for a specific post/page ID.

#### `set_auth( array $auth ): void`
Sets authentication credentials (username and password).

#### `get_last_error(): array`
Returns the last error that occurred during extraction.

#### `logout(): void`
Logs out from WordPress and cleans up session data.

### Private Methods

#### `authenticate(): bool`
Performs WordPress login and stores authentication cookies.

#### `fetch_nonce(): void`
Attempts to extract nonce from admin pages for AJAX requests.

#### `get_posts_by_type( string $type ): array`
Internal method to fetch posts or pages by type.

#### `fetch_via_rest_api( int $post_id ): array`
Fetches Elementor data using authenticated REST API.

#### `fetch_via_admin_ajax( int $post_id ): array`
Fetches Elementor data using admin-ajax as fallback.

#### `extract_elementor_from_meta( array $meta ): string`
Extracts Elementor JSON data from post meta array.

#### `parse_and_validate_json( string $json_string, int $post_id ): array`
Parses and validates Elementor JSON data.

#### `get_auth_headers(): array`
Generates authentication headers for requests.

#### `set_error( string $code, string $message, string $message_en, array $details = array() ): void`
Sets error information with Persian and English messages.

## Usage Example

```php
use ElementorCopier\Extractor\AuthenticatedExtractor;

// Create extractor instance
$extractor = new AuthenticatedExtractor( 'https://source-site.com' );

// Set authentication credentials
$extractor->set_auth( array(
    'username' => 'admin',
    'password' => 'secure_password',
) );

// Check if authentication is possible
if ( $extractor->can_extract( 'https://source-site.com' ) ) {
    
    // Get list of pages (including private)
    $pages = $extractor->get_pages();
    
    // Get list of posts (including private)
    $posts = $extractor->get_posts();
    
    // Get Elementor data for a specific post
    if ( ! empty( $posts ) ) {
        $elementor_data = $extractor->get_elementor_data( $posts[0]['id'] );
        
        if ( ! empty( $elementor_data ) ) {
            // Process Elementor data
            echo "Successfully extracted Elementor data!";
        } else {
            // Handle error
            $error = $extractor->get_last_error();
            echo "Error: " . $error['message'];
        }
    }
    
    // Logout when done
    $extractor->logout();
    
} else {
    // Authentication failed
    $error = $extractor->get_last_error();
    echo "Authentication failed: " . $error['message'];
}
```

## Integration with SourceConnector

The `SourceConnector` class has been updated to support the `AuthenticatedExtractor`:

```php
// In SourceConnector::initialize_extractor()
case 'authenticated':
    $this->extractor = new AuthenticatedExtractor( $this->source_url );
    $this->extractor->set_auth( $this->auth );
    break;
```

The connector automatically selects the authenticated method when:
1. REST API is not accessible
2. Username and password credentials are provided
3. Before falling back to web scraping

## Error Codes

The following error codes are used by the AuthenticatedExtractor:

| Code | Persian Message | English Message | Description |
|------|----------------|-----------------|-------------|
| `invalid_url` | آدرس سایت نامعتبر است | Invalid URL | URL validation failed |
| `no_credentials` | نام کاربری یا رمز عبور ارائه نشده است | No credentials provided | Missing username or password |
| `login_request_failed` | درخواست ورود به سیستم ناموفق بود | Login request failed | HTTP request to login endpoint failed |
| `authentication_failed` | نام کاربری یا رمز عبور اشتباه است | Invalid username or password | Login credentials rejected |
| `no_cookies` | کوکی‌های احراز هویت دریافت نشد | No authentication cookies received | No cookies in login response |
| `fetch_failed` | خطا در دریافت صفحات/نوشته‌ها | Failed to fetch pages/posts | Error retrieving content list |
| `http_error` | خطای HTTP در دریافت | HTTP Error fetching | HTTP error during request |
| `invalid_response` | پاسخ نامعتبر از سرور | Invalid response from server | Response parsing failed |
| `invalid_post_id` | شناسه نوشته نامعتبر است | Invalid post ID | Post ID validation failed |
| `no_elementor_data` | داده المنتور در این نوشته یافت نشد | No Elementor data found | No Elementor data in post |
| `invalid_json` | داده المنتور نامعتبر است (JSON) | Invalid Elementor data (JSON) | JSON parsing error |
| `invalid_structure` | ساختار داده المنتور نامعتبر است | Invalid Elementor data structure | Data structure validation failed |

## Requirements Coverage

This implementation satisfies the following requirements:

### Requirement 2.1
✓ Implements authenticated WordPress access as one of the extraction methods

### Requirement 2.2
✓ Uses WordPress REST API endpoints with authentication

### Requirement 2.3
✓ Accepts WordPress username/password to access private content

### Requirement 2.6
✓ Extracts complete widget data including all settings and configurations

### Requirement 5.2
✓ Uses secure HTTPS connections when available

### Requirement 10.8
✓ Implements multiple fallback methods (REST API + admin-ajax)

## Security Considerations

1. **Credential Handling**: Credentials are only stored in memory during the session
2. **HTTPS**: All requests use SSL verification by default
3. **Session Cleanup**: Automatic logout on object destruction prevents session leaks
4. **Input Sanitization**: All URLs are sanitized using the Auth class
5. **Error Messages**: Detailed errors for debugging without exposing sensitive data

## Testing

A test file has been created at `test-authenticated-extractor.php` to verify functionality:

```bash
# Run from WordPress root
php test-authenticated-extractor.php
```

The test covers:
1. Instance creation
2. Credential setting
3. Authentication capability
4. Page retrieval
5. Post retrieval
6. Elementor data extraction
7. Logout functionality

## Future Enhancements

Potential improvements for future versions:

1. **Application Password Support**: Add support for WordPress application passwords
2. **OAuth Support**: Implement OAuth authentication for better security
3. **Session Caching**: Cache authenticated sessions for performance
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Multi-Site Support**: Handle WordPress multisite installations
6. **Cookie Persistence**: Optional cookie storage for repeated access

## Conclusion

The `AuthenticatedExtractor` class successfully implements all required functionality for authenticated data extraction from WordPress sites. It provides a robust, secure, and user-friendly way to access private Elementor content with comprehensive error handling and Persian language support.
