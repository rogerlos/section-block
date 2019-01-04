<?php

namespace sectionblock\util;

/**
 * Adds a screen from customizer
 *
 * @param string $prefix
 *
 * @return string
 */
function screen( $prefix = 'bg_screen' ) {
	
	$color = get_theme_mod( $prefix . '_color', '#000000' );
	
	$op = [
		intval( get_theme_mod( $prefix . '_start', 30 ) ),
		intval( get_theme_mod( $prefix . '_middle', 0 ) ),
		intval( get_theme_mod( $prefix . '_end', 30 ) ),
	];
	
	return 'linear-gradient( to bottom, ' . to_rgba( $color, $op[0] ) . ', '
	       . to_rgba( $color, $op[1] ) . ', '
	       . to_rgba( $color, $op[2] ) . ''
	       . '),';
}

/**
 * Converts hex to rgba
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