<?php

namespace sectionblock\util;

/**
 * Converts hex to rgba when sent with an alpha value
 *
 * @param      $color
 * @param      $opacity
 * @param bool $css
 *
 * @return array|string|string[]|null
 */
function to_rgba( $color, $opacity, $css = TRUE ) {
	
	$opacity = intval( $opacity );
	
	if ( $opacity <= 0 ) {
		return 'transparent';
	} else if ( $opacity >= 100 ) {
		return $color;
	}
	
	$color   = preg_replace( "/[^0-9A-Fa-f]/", '', $color );
	$opacity = $opacity <= 1 ? (string) $opacity : (string) ( $opacity / 100 );
	$opacity = str_replace( '0', '', $opacity );
	$rgb     = [];
	
	if ( strlen( $color ) == 6 ) {
		$colorVal = hexdec( $color );
		$rgb[]    = 0xFF & ( $colorVal >> 0x10 );
		$rgb[]    = 0xFF & ( $colorVal >> 0x8 );
		$rgb[]    = 0xFF & $colorVal;
	} elseif ( strlen( $color ) == 3 ) {
		$rgb[] = hexdec( str_repeat( substr( $color, 0, 1 ), 2 ) );
		$rgb[] = hexdec( str_repeat( substr( $color, 1, 1 ), 2 ) );
		$rgb[] = hexdec( str_repeat( substr( $color, 2, 1 ), 2 ) );
	}
	
	$rgb[] = floatVal( $opacity );
	
	return $css ? 'rgba(' . implode( ',', $rgb ) . ')' : $rgb;
}

/**
 * Create inline style string.
 *
 * @param string $where  - section or item
 * @param array  $styles - keys are props, vals which are arrays imploded with ','
 * @param array  $atts
 *
 * @return string
 */
function inline_style_string( $styles, $atts, $where = 'section' ) {
	
	if ( ! is_array( $styles ) || empty( $styles ) ) {
		return '';
	}
	
	$ret = '';
	
	foreach( $styles as $prop => $val ) {
		
		if ( empty( $val ) ) {
			continue;
		}
		
		if ( is_array( $val ) ) {
			$val = implode( ',', $val );
		}
		
		$ret .= $prop . ':' . $val . ';';
	}
	
	$ret      = ' style="' . $ret . '"';
	$filtered = apply_filters( 'sectionblock_' . $where . '_inline_style_string', $ret, $styles, $atts );
	
	return is_string( $filtered ) ? $filtered : $ret;
}

/**
 * Removes background properties which are not allowed via the 'use' array
 *
 * @param array  $atts
 * @param string $content
 * @param array  $USE
 * @param string $where
 *
 * @return array
 */
function background_props( $atts, $USE, $content = '', $where = 'section' ) {
	
	global $SBLCK;
	
	$atts['background'] = empty( $atts['background'] ) ? $SBLCK->get( 'background.props' ) : $atts['background'];
	
	$BG  = apply_filters( 'sectionblock_' . $where . '_background_array_raw', $atts['background'], $atts, $content );
	
	foreach ( $USE['background'] as $prop => $use ) {
		
		if ( $prop === 'colorinline' && $use && ! empty( $BG['color'] ) && $USE['background']['color'] ) {
			$BG['colorinline'] = $BG['color'];
		} else if ( ! $use ) {
			$BG[ $prop ] = NULL;
		}
	}
	
	$filtered = apply_filters( 'sectionblock_' . $where .'_background_array_final', $BG, $atts );
	
	return is_array( $filtered ) ? $filtered : $BG;
}