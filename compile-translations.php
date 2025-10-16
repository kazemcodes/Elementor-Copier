<?php
/**
 * Compile .po files to .mo files
 * 
 * This script compiles Persian translation files for the Elementor Widget Copier plugin.
 * Run this script from the command line: php compile-translations.php
 */

/**
 * Simple PO to MO compiler
 */
class PoToMoCompiler {
    
    /**
     * Compile a .po file to .mo format
     *
     * @param string $po_file Path to .po file
     * @param string $mo_file Path to output .mo file
     * @return bool Success status
     */
    public function compile( $po_file, $mo_file ) {
        if ( ! file_exists( $po_file ) ) {
            echo "Error: PO file not found: $po_file\n";
            return false;
        }

        $translations = $this->parse_po_file( $po_file );
        
        if ( empty( $translations ) ) {
            echo "Error: No translations found in PO file\n";
            return false;
        }

        $mo_content = $this->generate_mo_content( $translations );
        
        if ( file_put_contents( $mo_file, $mo_content ) === false ) {
            echo "Error: Could not write MO file: $mo_file\n";
            return false;
        }

        echo "Successfully compiled: $po_file -> $mo_file\n";
        echo "Total translations: " . count( $translations ) . "\n";
        return true;
    }

    /**
     * Parse a .po file and extract translations
     *
     * @param string $po_file Path to .po file
     * @return array Array of translations
     */
    private function parse_po_file( $po_file ) {
        $content = file_get_contents( $po_file );
        $translations = array();
        
        // Split by empty lines to get each translation block
        $blocks = preg_split( '/\n\n+/', $content );
        
        foreach ( $blocks as $block ) {
            $msgid = '';
            $msgstr = '';
            
            // Extract msgid
            if ( preg_match( '/msgid\s+"(.*)"/s', $block, $matches ) ) {
                $msgid = $this->unescape_string( $matches[1] );
            }
            
            // Extract msgstr
            if ( preg_match( '/msgstr\s+"(.*)"/s', $block, $matches ) ) {
                $msgstr = $this->unescape_string( $matches[1] );
            }
            
            // Only add if both msgid and msgstr exist and msgstr is not empty
            if ( ! empty( $msgid ) && ! empty( $msgstr ) ) {
                $translations[ $msgid ] = $msgstr;
            }
        }
        
        return $translations;
    }

    /**
     * Unescape a string from PO format
     *
     * @param string $str String to unescape
     * @return string Unescaped string
     */
    private function unescape_string( $str ) {
        $str = str_replace( '\n', "\n", $str );
        $str = str_replace( '\r', "\r", $str );
        $str = str_replace( '\t', "\t", $str );
        $str = str_replace( '\"', '"', $str );
        $str = str_replace( '\\\\', '\\', $str );
        return $str;
    }

    /**
     * Generate MO file content from translations
     *
     * @param array $translations Array of translations
     * @return string Binary MO file content
     */
    private function generate_mo_content( $translations ) {
        // MO file format constants
        $magic = 0x950412de; // Magic number for MO files
        $revision = 0;
        $count = count( $translations );
        
        // Build the hash table
        $originals = array();
        $translations_array = array();
        
        foreach ( $translations as $original => $translation ) {
            $originals[] = $original;
            $translations_array[] = $translation;
        }
        
        // Calculate offsets
        $header_size = 28; // Size of MO file header
        $hash_table_size = 0; // We're not using hash table
        $originals_offset = $header_size;
        $translations_offset = $originals_offset + ( $count * 8 );
        
        // Calculate string offsets
        $current_offset = $translations_offset + ( $count * 8 );
        $original_offsets = array();
        $translation_offsets = array();
        
        foreach ( $originals as $original ) {
            $original_offsets[] = array(
                'length' => strlen( $original ),
                'offset' => $current_offset
            );
            $current_offset += strlen( $original ) + 1; // +1 for null terminator
        }
        
        foreach ( $translations_array as $translation ) {
            $translation_offsets[] = array(
                'length' => strlen( $translation ),
                'offset' => $current_offset
            );
            $current_offset += strlen( $translation ) + 1; // +1 for null terminator
        }
        
        // Build the MO file
        $mo = '';
        
        // Header
        $mo .= pack( 'V', $magic );                    // Magic number
        $mo .= pack( 'V', $revision );                 // Revision
        $mo .= pack( 'V', $count );                    // Number of strings
        $mo .= pack( 'V', $originals_offset );         // Offset of original strings table
        $mo .= pack( 'V', $translations_offset );      // Offset of translation strings table
        $mo .= pack( 'V', $hash_table_size );          // Size of hash table
        $mo .= pack( 'V', 0 );                         // Offset of hash table (not used)
        
        // Original strings table
        foreach ( $original_offsets as $offset_data ) {
            $mo .= pack( 'V', $offset_data['length'] );
            $mo .= pack( 'V', $offset_data['offset'] );
        }
        
        // Translation strings table
        foreach ( $translation_offsets as $offset_data ) {
            $mo .= pack( 'V', $offset_data['length'] );
            $mo .= pack( 'V', $offset_data['offset'] );
        }
        
        // Original strings
        foreach ( $originals as $original ) {
            $mo .= $original . "\0";
        }
        
        // Translation strings
        foreach ( $translations_array as $translation ) {
            $mo .= $translation . "\0";
        }
        
        return $mo;
    }
}

// Run the compiler
$compiler = new PoToMoCompiler();

// Compile Persian translation
$po_file = __DIR__ . '/languages/elementor-copier-fa_IR.po';
$mo_file = __DIR__ . '/languages/elementor-copier-fa_IR.mo';

echo "Compiling Persian translations...\n";
echo "Source: $po_file\n";
echo "Target: $mo_file\n\n";

if ( $compiler->compile( $po_file, $mo_file ) ) {
    echo "\n✓ Compilation successful!\n";
    exit( 0 );
} else {
    echo "\n✗ Compilation failed!\n";
    exit( 1 );
}
