<?php

namespace sectionblock\background;

use \sectionblock\util as UTIL;

/**
 * Background class.
 *
 * @param array $background
 *
 * @return string
 */
function classes( $background ) {
	
	global $SBLCK;
	
	$typ = type( $background );
	$ret = '';
	
	if ( $typ ) {
		
		$ret .= ' has-bg';
		
		$ret .= 'blend' === $typ ? ' has-bg-image has-bg-blend has-bg-color' : '';
		$ret .= 'image' === $typ ? ' has-bg-image' : '';
		$ret .= 'color' === $typ ? ' has-bg-color' : '';
		
		// apply a background color class
		if ( ! empty( $background['color'] ) ) {
			
			$bgcolorclass = '';
			$colors       = apply_filters( 'sectionblock_background_color_array', $SBLCK->get( 'colors' ), $background );
			
			if ( ! empty( $colors ) ) {
				
				foreach ( $colors as $col ) {
					if ( $background['color']['hex'] === $col['color'] ) {
						$bgcolorclass = '-' . $col['slug'];
					}
				}
				
			} else {
				$bgcolorclass = '-' . str_replace( '#', '', $background['color']['hex'] );
			}
			
			$ret .= $bgcolorclass;
		}
	}
	
	// allow filtering the class string
	$filtered = apply_filters( 'sectionblock_background_classes', $ret, $background );
	
	// catch bad filtering
	return is_string( $filtered ) ? $filtered : $ret;
}

/**
 * Should return the ghost background chosen
 *
 * @param array $background
 *
 * @return string
 */
function ghost( $background ) {
	
	$h = '';
	$S = 'sectionblock_ghost';
	
	$ghost = apply_filters( 'sectionblock_ghost_attr', $background['ghost'], $background );
	
	if ( empty( $ghost['img'] ) ) {
		return $h;
	}
	
	$i = file_exists( $ghost['img'] ) ? $ghost['img'] : '';
	$i = ! $i && file_exists( get_stylesheet_directory() . '/ghost/' . $background['ghost']['img'] ) ?
		get_stylesheet_directory() . '/ghost/' . $background['ghost']['img'] : $i;
	
	$i = apply_filters( 'sectionblock_ghost_img_path', $i, $ghost );
	
	if ( ! $i ) {
		return $h;
	}
	
	$where = ! empty( $background['ghost']['pos'] ) ? $background['ghost']['pos'] : 'right';
	
	
	$cls = (string) apply_filters( 'sectionblock_ghost_classes', $S . ' ' . $S . '-' . $where, $ghost );
	
	// return HTML, allows filtering
	$h .= '<div class="' . $cls . '">';
	$h .= (string) apply_filters( 'sectionblock_ghost_img_tag', '<img src="' . $i . '">', $ghost );
	$h .= '</div>';
	
	return $h;
}


/**
 * Size of background image
 *
 * @param array $background
 *
 * @return string
 */
function size( $background ) {
	
	$ret = '';
	
	if ( empty( $background['size']['keyword'] ) || empty( $background['size']['x'] ) ) {
		return $ret;
	}
	
	$x = $background['size']['x'];
	$y = ! empty( $background['size']['y'] ) ? $background['size']['y'] : 'auto';
	
	$ret = $x && $y ? $x . ' ' . $y : $ret;
	$ret = $x ? $x : $ret;
	
	return $ret;
}

/**
 * Background inline styles, contingent on there being a BG image.
 *
 * @param array $background
 *
 * @return string
 */
function style( $background ) {
	
	$ret = '';
	$over = style_overlay( $background );
	$blend = [];
	$overlay = [];
	$B = $background;
	
	/*
	 * Fix blend if wrong
	 */
	
	if ( is_string( $B['blend'] ) ) {
		$B['blend'] = [
			'type' => $B['blend'],
			'desaturate' => 0,
		];
	}
	
	/*
	 * Sizing
	 */
	
	$size = size( $B );
	$size = ! $size && ! empty( $B['size']['keyword'] ) ? $B['size']['keyword'] : $size;
	
	/*
	 * Image
	 */
	
	$img  = ! empty( $B['image'] ) ? $B['image'] : [ 'url' => '' ];
	
	/*
	 * Overlay
	 */
	
	$overlay = ! empty( $B['overlay']['type'] ) && ! empty( $img['url'] ) && ! empty( $over['over'] ) ?
		$overlay + $over['over'] : $overlay;
	$blend = ! empty( $B['overlay']['type'] ) && ! empty( $img['url'] ) && ! empty( $over['over'] ) ?
		$blend + $over['blend'] : $blend;
	
	/*
	 * Color
	 */
	
	$color = ! empty( $B['colorinline'] ) ? $B['colorinline'] : null;
	$color = is_array( $color ) && ! empty( $color['hex'] ) ?
		UTIL\to_rgba( $color['hex'], $color['alpha'] ) : $color;
	
	if ( $color && ! empty( $img['url'] ) && ! empty( $B['blend']['type'] ) ) {
		$overlay[] = 'linear-gradient( ' . $color . ', ' . $color . ')';
		$blend[] = ! empty( $B['blend']['type'] )  && ! empty( $img['url'] ) ? $B['blend']['type'] : 'normal';
	}
	
	/*
	 * Desaturate
	 */
	if ( ! empty( $B['blend']['desaturate'] ) && ! empty( $img['url'] ) ) {
		$overlay[] = 'linear-gradient( rgba(0,0,0,' . intval( $B['blend']['desaturate'] )
		             . '), rgba(0,0,0,' . intval( $B['blend']['desaturate'] ) . '))';
		$blend[] = 'color';
	}
	
	/*
	 * Image
	 */
	
	if ( ! empty( $img['url'] ) ) {
		$overlay[] = 'url(' . $img['url'] . ')';
		$blend[] = 'normal';
	}
	
	/*
	 * Returned properties
	 */
	
	$ret .= ! empty( $overlay ) ? 'background-image:' . implode( ',', $overlay ) . ';' : '';
	
	$ret .= $size ? 'background-size:' . $size . ';' : '';
	
	$ret .= ! empty( $B['repeat'] ) ? 'background-repeat:' . $B['repeat'] . ';' : '';
	
	$ret .= ! empty( $B['attachment'] ) ? 'background-attachment:' . $B['attachment'] . ';' : '';
	
	$ret .= ! empty( $B['position'] ) ? 'background-position:' . $B['position']['x'] . ' ' . $B['position']['y'] . ';' : '';
	
	$ret .= ! empty( $blend ) ? 'background-blend-mode:' . implode( ',', $blend ) . ';' : '';
	
	$ret .= ! empty( $color ) ? 'background-color:' . $color . ';' : '';
	
	$filtered = apply_filters( 'sectionblock_background_inline_styles', $ret, $B );
	
	return $filtered ? ' style="' . $filtered . '"' : '';
}

/**
 * Create gradient to go over background image
 *
 * @param $background
 *
 * @return array
 */
function style_overlay( $background ) {
	
	global $SBLCK;
	
	$O = $background['overlay'];
	
	$ret = [
		'over' => [],
		'blend' => [],
	];
	
	if ( empty( $O['type'] ) || empty( $O['color'] ) ) {
		return $ret;
	}
	
	$types = $SBLCK->get( 'background.overlays' );
	
	$P = [
		'alpha'        => empty( $O['alpha'] ) ? 100 : intval( $O['alpha'] ),
		'beta'        => empty( $O['beta'] ) ? 0 : intval( $O['beta'] ),
		'clr'       => [
			'original' => empty( $O['color'] ) ? 'transparent' : $O['color'],
			'a'        => '',
			'b'        => '',
		],
		'deg'          => '180deg',
		'edge_opacity' => '20%',
		'start'        => empty( $O['start'] ) ? 'top' : $O['start'],
		'type'         => empty( $O['type'] ) ? '' : $O['type'],
	];
	
	$P['type'] = empty( $P['type'] ) || ! in_array( $P['type'], $types ) ? '' : $P['type'];
	
	$P['alpha'] = $P['alpha'] < 0 ? 0 : $P['alpha'];
	$P['alpha'] = $P['alpha'] > 100 ? 100 : $P['alpha'];
	
	$P['clr']['a'] = UTIL\to_rgba( $P['clr']['original'], $P['alpha'] );
	$P['clr']['b'] = $P['type'] === 'cover' ? $P['clr']['a'] : UTIL\to_rgba( $P['clr']['original'], $P['beta'] );
	
	switch ( $P['start'] ) {
		case 'bottom':
			$P['deg'] = '0deg';
			break;
		case 'left':
			$P['deg'] = '90deg';
			break;
		case 'right':
			$P['deg'] = '270deg';
			break;
	}
	
	$P = apply_filters( 'sectionblock_overlay_params', $P, $background );
	
	switch ( $P['type'] ) {
		
		case 'cover':
		case 'gradient':
			$ret['over'][] = 'linear-gradient(' . $P['deg'] . ',' . $P['clr']['a'] . ',' . $P['clr']['b'] . ')';
			$ret['blend'][] = 'normal';
			break;
		
		case 'edges':
			$ret['over'][] = 'linear-gradient(0deg,' . $P['clr']['a'] . '' . $P['clr']['b']
			       . ' ' . $P['edge_opacity'] . ',' . $P['clr']['b'] . ')';
			$ret['over'][] .= 'linear-gradient(90deg,' . $P['clr']['a'] . ',' . $P['clr']['b']
			        . ' ' . $P['edge_opacity'] . ',' . $P['clr']['b'] . ')';
			$ret['over'][] .= 'linear-gradient(180deg,' . $P['clr']['a'] . ',' . $P['clr']['b']
			        . ' ' . $P['edge_opacity'] . ',' . $P['clr']['b'] . ')';
			$ret['over'][] .= 'linear-gradient(270deg,' . $P['clr']['a'] . ',' . $P['clr']['b']
			        . ' ' . $P['edge_opacity'] . ',' . $P['clr']['b'] . ')';
			$ret['blend'] = [ 'normal', 'normal','normal','normal', ];
			break;
	}
	
	return apply_filters( 'sectionblock_image_overlay_styles', $ret, $background );
}

/**
 * Background Type, determined by chosen options
 *
 * @param $background
 *
 * @return null|string
 */
function type( $background ) {
	
	$type = NULL;
	if ( ! empty( $background['color'] ) && ! empty( $background['image']['url'] ) && ! empty( $background['blend'] ) ) {
		$type = 'blend';
	} else if ( ! empty( $background['image']['url'] ) ) {
		$type = 'image';
	} else if ( ! empty( $background['color'] ) ) {
		$type = 'color';
	}
	
	return $type;
}