<?php
/**
 * Error Logger Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ErrorLogger Class
 *
 * Centralized error logging and handling for the plugin.
 */
class ErrorLogger {

	/**
	 * Log levels
	 */
	const LEVEL_ERROR   = 'error';
	const LEVEL_WARNING = 'warning';
	const LEVEL_INFO    = 'info';
	const LEVEL_DEBUG   = 'debug';

	/**
	 * Error categories
	 */
	const CATEGORY_CONNECTION    = 'connection';
	const CATEGORY_AUTHENTICATION = 'authentication';
	const CATEGORY_VALIDATION    = 'validation';
	const CATEGORY_IMPORT        = 'import';
	const CATEGORY_EXPORT        = 'export';
	const CATEGORY_MEDIA         = 'media';
	const CATEGORY_GENERAL       = 'general';

	/**
	 * Log an error message
	 *
	 * @param string $message  Error message.
	 * @param string $category Error category.
	 * @param string $level    Log level.
	 * @param array  $context  Additional context data.
	 * @return void
	 */
	public static function log( $message, $category = self::CATEGORY_GENERAL, $level = self::LEVEL_ERROR, $context = array() ) {
		// Only log if WP_DEBUG is enabled
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		// Format the log message
		$formatted_message = self::format_log_message( $message, $category, $level, $context );

		// Write to WordPress debug log
		if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
			error_log( $formatted_message );
		}

		// Optionally trigger a WordPress action for custom logging handlers
		do_action( 'elementor_copier_log', $message, $category, $level, $context );
	}

	/**
	 * Log a connection error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_connection_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_CONNECTION, self::LEVEL_ERROR, $context );
	}

	/**
	 * Log an authentication error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_authentication_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_AUTHENTICATION, self::LEVEL_ERROR, $context );
	}

	/**
	 * Log a validation error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_validation_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_VALIDATION, self::LEVEL_ERROR, $context );
	}

	/**
	 * Log an import error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_import_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_IMPORT, self::LEVEL_ERROR, $context );
	}

	/**
	 * Log an export error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_export_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_EXPORT, self::LEVEL_ERROR, $context );
	}

	/**
	 * Log a media handling error
	 *
	 * @param string $message Error message.
	 * @param array  $context Additional context.
	 * @return void
	 */
	public static function log_media_error( $message, $context = array() ) {
		self::log( $message, self::CATEGORY_MEDIA, self::LEVEL_WARNING, $context );
	}

	/**
	 * Log a warning message
	 *
	 * @param string $message  Warning message.
	 * @param string $category Error category.
	 * @param array  $context  Additional context.
	 * @return void
	 */
	public static function log_warning( $message, $category = self::CATEGORY_GENERAL, $context = array() ) {
		self::log( $message, $category, self::LEVEL_WARNING, $context );
	}

	/**
	 * Log an info message
	 *
	 * @param string $message  Info message.
	 * @param string $category Error category.
	 * @param array  $context  Additional context.
	 * @return void
	 */
	public static function log_info( $message, $category = self::CATEGORY_GENERAL, $context = array() ) {
		self::log( $message, $category, self::LEVEL_INFO, $context );
	}

	/**
	 * Log a debug message
	 *
	 * @param string $message  Debug message.
	 * @param string $category Error category.
	 * @param array  $context  Additional context.
	 * @return void
	 */
	public static function log_debug( $message, $category = self::CATEGORY_GENERAL, $context = array() ) {
		// Only log debug messages if WP_DEBUG is enabled
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		self::log( $message, $category, self::LEVEL_DEBUG, $context );
	}

	/**
	 * Format log message
	 *
	 * @param string $message  Error message.
	 * @param string $category Error category.
	 * @param string $level    Log level.
	 * @param array  $context  Additional context.
	 * @return string Formatted log message.
	 */
	private static function format_log_message( $message, $category, $level, $context ) {
		$timestamp = current_time( 'Y-m-d H:i:s' );
		$level_str = strtoupper( $level );
		$category_str = strtoupper( $category );

		$formatted = sprintf(
			'[%s] Elementor Copier [%s] [%s]: %s',
			$timestamp,
			$level_str,
			$category_str,
			$message
		);

		// Add context if provided
		if ( ! empty( $context ) ) {
			$formatted .= ' | Context: ' . wp_json_encode( $context );
		}

		return $formatted;
	}

	/**
	 * Create user-friendly error message from WP_Error
	 *
	 * @param \WP_Error $error WP_Error object.
	 * @return string User-friendly error message.
	 */
	public static function get_user_friendly_message( $error ) {
		if ( ! is_wp_error( $error ) ) {
			return __( 'An unknown error occurred.', 'elementor-copier' );
		}

		$error_code = $error->get_error_code();
		$error_message = $error->get_error_message();

		// Map error codes to user-friendly messages
		$friendly_messages = array(
			// Connection errors
			'connection_failed'       => __( 'Unable to connect to the target site. Please check the URL and ensure the site is accessible.', 'elementor-copier' ),
			'connection_timeout'      => __( 'Connection to the target site timed out. Please try again.', 'elementor-copier' ),
			'invalid_url'             => __( 'The target URL is invalid. Please enter a valid website URL.', 'elementor-copier' ),

			// Authentication errors
			'invalid_credentials'     => __( 'Authentication failed. Please check your username and application password.', 'elementor-copier' ),
			'insufficient_permissions' => __( 'You do not have sufficient permissions to perform this action.', 'elementor-copier' ),
			'authentication_failed'   => __( 'Authentication failed. Please verify your credentials and try again.', 'elementor-copier' ),

			// Data validation errors
			'invalid_data'            => __( 'The data provided is invalid or corrupted. Please try exporting again.', 'elementor-copier' ),
			'missing_data'            => __( 'Required data is missing. Please ensure all fields are filled out.', 'elementor-copier' ),
			'invalid_post_id'         => __( 'The specified post ID is invalid.', 'elementor-copier' ),
			'post_not_found'          => __( 'The target post could not be found.', 'elementor-copier' ),

			// Import errors
			'import_failed'           => __( 'Failed to import the content. Please check the target site and try again.', 'elementor-copier' ),
			'elementor_not_found'     => __( 'Elementor is not active on the target site. Please install and activate Elementor.', 'elementor-copier' ),
			'invalid_post'            => __( 'The target post is not valid or does not support Elementor.', 'elementor-copier' ),

			// Export errors
			'export_failed'           => __( 'Failed to export the content. Please try again.', 'elementor-copier' ),
			'element_not_found'       => __( 'The selected element could not be found.', 'elementor-copier' ),

			// Media errors
			'media_download_failed'   => __( 'Some media files could not be downloaded. The content was imported with original URLs.', 'elementor-copier' ),
			'media_upload_failed'     => __( 'Failed to upload media to the target site.', 'elementor-copier' ),
		);

		// Return friendly message if available, otherwise return the original error message
		if ( isset( $friendly_messages[ $error_code ] ) ) {
			return $friendly_messages[ $error_code ];
		}

		// For unknown error codes, return the error message with a generic prefix
		return sprintf(
			/* translators: %s: error message */
			__( 'An error occurred: %s', 'elementor-copier' ),
			$error_message
		);
	}

	/**
	 * Create WP_Error with logging
	 *
	 * @param string $code     Error code.
	 * @param string $message  Error message.
	 * @param array  $data     Error data.
	 * @param string $category Error category.
	 * @return \WP_Error WP_Error object.
	 */
	public static function create_error( $code, $message, $data = array(), $category = self::CATEGORY_GENERAL ) {
		// Log the error
		self::log( $message, $category, self::LEVEL_ERROR, array( 'code' => $code, 'data' => $data ) );

		// Create and return WP_Error
		return new \WP_Error( $code, $message, $data );
	}

	/**
	 * Handle exception and convert to WP_Error
	 *
	 * @param \Exception $exception Exception object.
	 * @param string     $category  Error category.
	 * @return \WP_Error WP_Error object.
	 */
	public static function handle_exception( $exception, $category = self::CATEGORY_GENERAL ) {
		$message = $exception->getMessage();
		$code = 'exception_' . strtolower( str_replace( '\\', '_', get_class( $exception ) ) );

		// Log the exception with stack trace
		self::log(
			$message,
			$category,
			self::LEVEL_ERROR,
			array(
				'exception' => get_class( $exception ),
				'file'      => $exception->getFile(),
				'line'      => $exception->getLine(),
				'trace'     => $exception->getTraceAsString(),
			)
		);

		return new \WP_Error( $code, $message, array( 'status' => 500 ) );
	}
}
