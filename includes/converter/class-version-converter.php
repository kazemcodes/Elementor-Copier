<?php
/**
 * Version Converter Class
 *
 * @package ElementorCopier
 */

namespace ElementorCopier\Converter;

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * VersionConverter Class
 *
 * Handles conversion of Elementor data between different versions for universal compatibility.
 */
class VersionConverter {

    /**
     * Deprecated widget type mappings
     *
     * @var array
     */
    private $deprecated_widgets = array(
        'image-box'      => 'image',
        'icon-box'       => 'icon',
        'image-carousel' => 'image-gallery',
        'posts'          => 'archive-posts',
    );

    /**
     * Detect Elementor version from data structure
     *
     * @param array $data Elementor data.
     * @return string Version string (e.g., '1.x', '2.x', '3.x').
     */
    public function detect_version( array $data ): string {
        if ( empty( $data ) || ! is_array( $data ) ) {
            return '3.x'; // Default to current
        }

        // Get first element to analyze structure
        $first_element = is_array( $data ) ? reset( $data ) : $data;
        
        if ( ! is_array( $first_element ) ) {
            return '3.x';
        }

        // Version 1.x indicators
        if ( $this->has_v1_structure( $first_element ) ) {
            return '1.x';
        }

        // Version 2.x indicators
        if ( $this->has_v2_structure( $first_element ) ) {
            return '2.x';
        }

        // Default to 3.x (current)
        return '3.x';
    }

    /**
     * Check if data has Elementor 1.x structure
     *
     * @param array $element Element data.
     * @return bool True if v1.x structure detected.
     */
    private function has_v1_structure( array $element ): bool {
        // V1 used 'widgetType' without namespace
        if ( isset( $element['widgetType'] ) && is_string( $element['widgetType'] ) ) {
            // V1 widget types didn't have namespace prefix
            if ( strpos( $element['widgetType'], '-' ) === false ) {
                return true;
            }
        }

        // V1 used simpler settings structure
        if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
            // V1 didn't have responsive settings
            $has_responsive = false;
            foreach ( $element['settings'] as $key => $value ) {
                if ( strpos( $key, '_tablet' ) !== false || strpos( $key, '_mobile' ) !== false ) {
                    $has_responsive = true;
                    break;
                }
            }
            
            if ( ! $has_responsive && ! empty( $element['settings'] ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if data has Elementor 2.x structure
     *
     * @param array $element Element data.
     * @return bool True if v2.x structure detected.
     */
    private function has_v2_structure( array $element ): bool {
        // V2 introduced responsive settings but used older typography structure
        if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
            // Check for V2 typography structure (without size units)
            foreach ( $element['settings'] as $key => $value ) {
                if ( strpos( $key, 'typography' ) !== false && is_array( $value ) ) {
                    // V2 typography didn't have 'size' as object with 'unit'
                    if ( isset( $value['font_size'] ) && ! is_array( $value['font_size'] ) ) {
                        return true;
                    }
                }
            }

            // V2 had responsive settings but simpler structure
            $has_tablet = false;
            $has_mobile = false;
            foreach ( $element['settings'] as $key => $value ) {
                if ( strpos( $key, '_tablet' ) !== false ) {
                    $has_tablet = true;
                }
                if ( strpos( $key, '_mobile' ) !== false ) {
                    $has_mobile = true;
                }
            }
            
            if ( $has_tablet || $has_mobile ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Convert data to current Elementor format
     *
     * @param array  $data         Elementor data.
     * @param string $from_version Source version.
     * @return array Converted data.
     */
    public function convert_to_current( array $data, string $from_version ): array {
        if ( empty( $data ) || ! is_array( $data ) ) {
            return $data;
        }

        // No conversion needed for current version
        if ( $from_version === '3.x' ) {
            return $data;
        }

        // Convert based on source version
        switch ( $from_version ) {
            case '1.x':
                $data = $this->convert_v1_to_v3( $data );
                break;
            case '2.x':
                $data = $this->convert_v2_to_v3( $data );
                break;
        }

        // Handle deprecated widgets regardless of version
        $data = $this->handle_deprecated_widgets( $data );

        return $data;
    }

    /**
     * Convert Elementor 1.x data to 3.x format
     *
     * @param array $data V1 data.
     * @return array V3 data.
     */
    private function convert_v1_to_v3( array $data ): array {
        if ( ! is_array( $data ) ) {
            return $data;
        }

        $converted = array();

        foreach ( $data as $element ) {
            if ( ! is_array( $element ) ) {
                $converted[] = $element;
                continue;
            }

            // Update widget structure
            $element = $this->update_widget_structure( $element, '1.x' );

            // Recursively convert child elements
            if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
                $element['elements'] = $this->convert_v1_to_v3( $element['elements'] );
            }

            $converted[] = $element;
        }

        return $converted;
    }

    /**
     * Convert Elementor 2.x data to 3.x format
     *
     * @param array $data V2 data.
     * @return array V3 data.
     */
    private function convert_v2_to_v3( array $data ): array {
        if ( ! is_array( $data ) ) {
            return $data;
        }

        $converted = array();

        foreach ( $data as $element ) {
            if ( ! is_array( $element ) ) {
                $converted[] = $element;
                continue;
            }

            // Update widget structure
            $element = $this->update_widget_structure( $element, '2.x' );

            // Recursively convert child elements
            if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
                $element['elements'] = $this->convert_v2_to_v3( $element['elements'] );
            }

            $converted[] = $element;
        }

        return $converted;
    }

    /**
     * Update widget structure for version compatibility
     *
     * @param array  $widget       Widget data.
     * @param string $from_version Source version.
     * @return array Updated widget data.
     */
    private function update_widget_structure( array $widget, string $from_version ): array {
        if ( ! isset( $widget['settings'] ) || ! is_array( $widget['settings'] ) ) {
            return $widget;
        }

        switch ( $from_version ) {
            case '1.x':
                $widget['settings'] = $this->convert_v1_settings( $widget['settings'] );
                break;
            case '2.x':
                $widget['settings'] = $this->convert_v2_settings( $widget['settings'] );
                break;
        }

        return $widget;
    }

    /**
     * Convert V1 settings to V3 format
     *
     * @param array $settings V1 settings.
     * @return array V3 settings.
     */
    private function convert_v1_settings( array $settings ): array {
        $converted = array();

        foreach ( $settings as $key => $value ) {
            // Convert typography settings
            if ( strpos( $key, 'typography' ) !== false && is_string( $value ) ) {
                // V1 had simple string values, V3 uses structured arrays
                $converted[ $key ] = array(
                    'font_family' => $value,
                );
            }
            // Convert spacing/dimensions
            elseif ( in_array( $key, array( 'margin', 'padding', 'border_radius' ), true ) && ! is_array( $value ) ) {
                // V1 used single values, V3 uses arrays with units
                $converted[ $key ] = array(
                    'top'    => $value,
                    'right'  => $value,
                    'bottom' => $value,
                    'left'   => $value,
                    'unit'   => 'px',
                );
            }
            // Convert color settings
            elseif ( strpos( $key, 'color' ) !== false && is_string( $value ) ) {
                // Ensure color format is correct
                $converted[ $key ] = $this->normalize_color( $value );
            }
            // Keep other settings as-is
            else {
                $converted[ $key ] = $value;
            }
        }

        return $converted;
    }

    /**
     * Convert V2 settings to V3 format
     *
     * @param array $settings V2 settings.
     * @return array V3 settings.
     */
    private function convert_v2_settings( array $settings ): array {
        $converted = array();

        foreach ( $settings as $key => $value ) {
            // Convert typography settings
            if ( strpos( $key, 'typography' ) !== false && is_array( $value ) ) {
                // V2 typography structure needs unit conversion
                if ( isset( $value['font_size'] ) && ! is_array( $value['font_size'] ) ) {
                    $value['font_size'] = array(
                        'size' => $value['font_size'],
                        'unit' => 'px',
                    );
                }
                if ( isset( $value['line_height'] ) && ! is_array( $value['line_height'] ) ) {
                    $value['line_height'] = array(
                        'size' => $value['line_height'],
                        'unit' => 'em',
                    );
                }
                $converted[ $key ] = $value;
            }
            // Convert responsive settings structure
            elseif ( strpos( $key, '_tablet' ) !== false || strpos( $key, '_mobile' ) !== false ) {
                // V2 responsive settings need to be structured properly
                $converted[ $key ] = $value;
            }
            // Keep other settings as-is
            else {
                $converted[ $key ] = $value;
            }
        }

        return $converted;
    }

    /**
     * Handle deprecated widget types
     *
     * @param array $data Elementor data.
     * @return array Data with deprecated widgets converted.
     */
    private function handle_deprecated_widgets( array $data ): array {
        if ( ! is_array( $data ) ) {
            return $data;
        }

        $converted = array();

        foreach ( $data as $element ) {
            if ( ! is_array( $element ) ) {
                $converted[] = $element;
                continue;
            }

            // Check if this is a deprecated widget
            if ( isset( $element['widgetType'] ) && isset( $this->deprecated_widgets[ $element['widgetType'] ] ) ) {
                // Map to new widget type
                $element['widgetType'] = $this->deprecated_widgets[ $element['widgetType'] ];
                
                // Update settings if needed
                $element = $this->update_deprecated_widget_settings( $element );
            }

            // Recursively handle child elements
            if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
                $element['elements'] = $this->handle_deprecated_widgets( $element['elements'] );
            }

            $converted[] = $element;
        }

        return $converted;
    }

    /**
     * Update settings for deprecated widgets
     *
     * @param array $widget Widget data.
     * @return array Updated widget data.
     */
    private function update_deprecated_widget_settings( array $widget ): array {
        if ( ! isset( $widget['widgetType'] ) || ! isset( $widget['settings'] ) ) {
            return $widget;
        }

        // Handle specific widget type conversions
        switch ( $widget['widgetType'] ) {
            case 'image':
                // image-box -> image: move box settings to image settings
                if ( isset( $widget['settings']['box_title'] ) ) {
                    $widget['settings']['caption'] = $widget['settings']['box_title'];
                    unset( $widget['settings']['box_title'] );
                }
                break;

            case 'icon':
                // icon-box -> icon: similar conversion
                if ( isset( $widget['settings']['box_title'] ) ) {
                    $widget['settings']['title'] = $widget['settings']['box_title'];
                    unset( $widget['settings']['box_title'] );
                }
                break;

            case 'image-gallery':
                // image-carousel -> image-gallery: convert carousel settings
                if ( isset( $widget['settings']['slides_to_show'] ) ) {
                    $widget['settings']['columns'] = $widget['settings']['slides_to_show'];
                    unset( $widget['settings']['slides_to_show'] );
                }
                break;
        }

        return $widget;
    }

    /**
     * Normalize color value
     *
     * @param string $color Color value.
     * @return string Normalized color.
     */
    private function normalize_color( string $color ): string {
        // Remove whitespace
        $color = trim( $color );

        // Ensure hex colors have #
        if ( preg_match( '/^[0-9A-Fa-f]{6}$/', $color ) ) {
            return '#' . $color;
        }

        // Ensure 3-digit hex colors have #
        if ( preg_match( '/^[0-9A-Fa-f]{3}$/', $color ) ) {
            return '#' . $color;
        }

        return $color;
    }

    /**
     * Validate converted data structure
     *
     * @param array $data Converted data.
     * @return bool True if valid.
     */
    public function validate_converted_data( array $data ): bool {
        if ( empty( $data ) ) {
            return true; // Empty is valid
        }

        if ( ! is_array( $data ) ) {
            return false;
        }

        // Check each element has required properties
        foreach ( $data as $element ) {
            if ( ! is_array( $element ) ) {
                return false;
            }

            // Must have elType or widgetType
            if ( ! isset( $element['elType'] ) && ! isset( $element['widgetType'] ) ) {
                return false;
            }

            // Must have id
            if ( ! isset( $element['id'] ) ) {
                return false;
            }

            // Recursively validate child elements
            if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
                if ( ! $this->validate_converted_data( $element['elements'] ) ) {
                    return false;
                }
            }
        }

        return true;
    }
}
