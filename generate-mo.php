<?php
/**
 * Generate MO file from PO file
 * Standalone script that doesn't require WordPress
 */

class SimpleMOGenerator {
    
    public function generate_from_po( $po_file, $mo_file ) {
        echo "Reading PO file: $po_file\n";
        
        if ( ! file_exists( $po_file ) ) {
            die( "Error: PO file not found!\n" );
        }
        
        $content = file_get_contents( $po_file );
        $translations = $this->parse_po( $content );
        
        echo "Found " . count( $translations ) . " translations\n";
        
        if ( empty( $translations ) ) {
            die( "Error: No translations found!\n" );
        }
        
        echo "Generating MO file: $mo_file\n";
        $mo_content = $this->create_mo( $translations );
        
        if ( file_put_contents( $mo_file, $mo_content ) === false ) {
            die( "Error: Could not write MO file!\n" );
        }
        
        echo "Success! MO file created.\n";
        echo "File size: " . filesize( $mo_file ) . " bytes\n";
    }
    
    private function parse_po( $content ) {
        $translations = array();
        $lines = explode( "\n", $content );
        
        $current_msgid = '';
        $current_msgstr = '';
        $in_msgid = false;
        $in_msgstr = false;
        
        foreach ( $lines as $line ) {
            $line = trim( $line );
            
            // Skip comments and empty lines
            if ( empty( $line ) || $line[0] === '#' ) {
                // Save previous translation if we have both msgid and msgstr
                if ( ! empty( $current_msgid ) && ! empty( $current_msgstr ) ) {
                    $translations[ $current_msgid ] = $current_msgstr;
                }
                $current_msgid = '';
                $current_msgstr = '';
                $in_msgid = false;
                $in_msgstr = false;
                continue;
            }
            
            // Check for msgid
            if ( strpos( $line, 'msgid ' ) === 0 ) {
                // Save previous translation
                if ( ! empty( $current_msgid ) && ! empty( $current_msgstr ) ) {
                    $translations[ $current_msgid ] = $current_msgstr;
                }
                $current_msgid = $this->extract_string( $line );
                $current_msgstr = '';
                $in_msgid = true;
                $in_msgstr = false;
                continue;
            }
            
            // Check for msgstr
            if ( strpos( $line, 'msgstr ' ) === 0 ) {
                $current_msgstr = $this->extract_string( $line );
                $in_msgid = false;
                $in_msgstr = true;
                continue;
            }
            
            // Continuation line
            if ( $line[0] === '"' ) {
                $str = $this->extract_string( $line );
                if ( $in_msgid ) {
                    $current_msgid .= $str;
                } elseif ( $in_msgstr ) {
                    $current_msgstr .= $str;
                }
            }
        }
        
        // Save last translation
        if ( ! empty( $current_msgid ) && ! empty( $current_msgstr ) ) {
            $translations[ $current_msgid ] = $current_msgstr;
        }
        
        // Remove empty header
        unset( $translations[''] );
        
        return $translations;
    }
    
    private function extract_string( $line ) {
        // Extract string between quotes
        if ( preg_match( '/"(.*)"/', $line, $matches ) ) {
            $str = $matches[1];
            // Unescape
            $str = stripcslashes( $str );
            return $str;
        }
        return '';
    }
    
    private function create_mo( $translations ) {
        // Sort by original string for binary search
        ksort( $translations );
        
        $originals = array_keys( $translations );
        $translations_array = array_values( $translations );
        $count = count( $originals );
        
        // MO file magic number (little-endian)
        $magic = 0x950412de;
        
        // Calculate offsets
        $header_size = 28;
        $originals_table_offset = $header_size;
        $translations_table_offset = $originals_table_offset + ( $count * 8 );
        
        // Calculate string data offset
        $strings_offset = $translations_table_offset + ( $count * 8 );
        
        // Build string data and collect offsets
        $original_offsets = array();
        $translation_offsets = array();
        $strings_data = '';
        $current_offset = $strings_offset;
        
        // Add original strings
        foreach ( $originals as $original ) {
            $original_offsets[] = array(
                'length' => strlen( $original ),
                'offset' => $current_offset
            );
            $strings_data .= $original . "\0";
            $current_offset += strlen( $original ) + 1;
        }
        
        // Add translation strings
        foreach ( $translations_array as $translation ) {
            $translation_offsets[] = array(
                'length' => strlen( $translation ),
                'offset' => $current_offset
            );
            $strings_data .= $translation . "\0";
            $current_offset += strlen( $translation ) + 1;
        }
        
        // Build MO file
        $mo = '';
        
        // Header (28 bytes)
        $mo .= pack( 'V', $magic );                      // Magic number
        $mo .= pack( 'V', 0 );                           // File format revision
        $mo .= pack( 'V', $count );                      // Number of strings
        $mo .= pack( 'V', $originals_table_offset );    // Offset of original strings table
        $mo .= pack( 'V', $translations_table_offset ); // Offset of translation strings table
        $mo .= pack( 'V', 0 );                           // Size of hashing table
        $mo .= pack( 'V', 0 );                           // Offset of hashing table
        
        // Original strings table
        foreach ( $original_offsets as $offset_info ) {
            $mo .= pack( 'V', $offset_info['length'] );
            $mo .= pack( 'V', $offset_info['offset'] );
        }
        
        // Translation strings table
        foreach ( $translation_offsets as $offset_info ) {
            $mo .= pack( 'V', $offset_info['length'] );
            $mo .= pack( 'V', $offset_info['offset'] );
        }
        
        // String data
        $mo .= $strings_data;
        
        return $mo;
    }
}

// Run the generator
$generator = new SimpleMOGenerator();
$po_file = __DIR__ . '/languages/elementor-copier-fa_IR.po';
$mo_file = __DIR__ . '/languages/elementor-copier-fa_IR.mo';

echo "\n=== Elementor Copier Translation Compiler ===\n\n";
$generator->generate_from_po( $po_file, $mo_file );
echo "\n=== Done ===\n\n";
