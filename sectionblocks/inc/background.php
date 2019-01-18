<?php

namespace sectionblock\background;

use \sectionblock\util as UTIL;

/**
 * Background classes string creator.
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return string
 */
function classes( $BG ) {
	
	global $SBLCK;
	
	$typ = type( $BG );
	$ret = '';
	
	if ( $typ ) {
		
		$ret .= ' has-bg';
		$ret .= 'blend' === $typ ? ' has-bg-image has-bg-blend has-bg-color' : '';
		$ret .= 'image' === $typ ? ' has-bg-image' : '';
		$ret .= 'color' === $typ ? ' has-bg-color' : '';
		
		if ( ! empty( $BG['color'] ) ) {
			
			$bgcolorclass = '';
			$colors       = apply_filters( 'sectionblock_background_color_array', $SBLCK->get( 'colors' ), $BG );
			
			if ( ! empty( $colors ) ) {
				foreach ( $colors as $col ) {
					if ( $BG['color']['hex'] === $col['color'] ) {
						$bgcolorclass = '-' . $col['slug'];
						break;
					}
				}
			} else {
				$bgcolorclass = '-' . str_replace( '#', '', $BG['color']['hex'] );
			}
			
			$ret .= $bgcolorclass;
		}
	}
	
	$filtered = apply_filters( 'sectionblock_background_classes', $ret, $BG );
	
	return is_string( $filtered ) ? $filtered : $ret;
}

/**
 * Should return the ghost background chosen. Checks the theme's /ghost/ directory for file if passed path
 * does not work.
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return string
 */
function ghost( $BG ) {
	
	$h = '';
	$S = 'sectionblock_ghost';
	
	$ghost = apply_filters( 'sectionblock_ghost_attr', $BG['ghost'], $BG );
	
	if ( empty( $ghost['img'] ) ) {
		return $h;
	}
	
	$i = file_exists( $ghost['img'] ) ? $ghost['img'] : '';
	
	$i = ! $i && file_exists( get_stylesheet_directory() . '/ghost/' . $BG['ghost']['img'] ) ?
		get_stylesheet_directory() . '/ghost/' . $BG['ghost']['img'] : $i;
	
	$i = apply_filters( 'sectionblock_ghost_img_path', $i, $ghost );
	
	if ( ! $i ) {
		return $h;
	}
	
	$where = ! empty( $BG['ghost']['pos'] ) ? $BG['ghost']['pos'] : 'right';
	
	$cls = (string) apply_filters( 'sectionblock_ghost_classes', $S . ' ' . $S . '-' . $where, $ghost );
	
	$h .= '<div class="' . $cls . '">';
	$h .= (string) apply_filters( 'sectionblock_ghost_img_tag', '<img src="' . $i . '">', $ghost );
	$h .= '</div>';
	
	return $h;
}


/**
 * Create CSS background-size string
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return string
 */
function size( $BG ) {
	
	$ret = '';
	
	if ( empty( $BG['size']['keyword'] ) || empty( $BG['size']['x'] ) ) {
		return $ret;
	}
	
	$x = $BG['size']['x'];
	$y = ! empty( $BG['size']['y'] ) ? $BG['size']['y'] : 'auto';
	
	$ret = $x && $y ? $x . ' ' . $y : $ret;
	$ret = $x ? $x : $ret;
	
	return $ret;
}

/**
 * Background inline styles, contingent on there being a BG image.
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return string
 */
function style( $BG ) {
	
	$ret     = '';
	$over    = style_overlay( $BG );
	$blend   = [];
	$overlay = [];
	$img     = ! empty( $BG['image'] ) ? $BG['image'] : [ 'url' => '' ];
	
	/*
	 * Fix blend if wrong
	 */
	if ( is_string( $BG['blend'] ) ) {
		$BG['blend'] = [
			'type'       => $BG['blend'],
			'desaturate' => 0,
		];
	}
	
	/*
	 * Sizing
	 */
	$size = size( $BG );
	$size = ! $size && ! empty( $BG['size']['keyword'] ) ? $BG['size']['keyword'] : $size;
	
	/*
	 * Overlay
	 */
	$overlay = ! empty( $BG['overlay']['type'] ) && ! empty( $img['url'] ) && ! empty( $over['over'] ) ?
		$overlay + $over['over'] : $overlay;
	$blend   = ! empty( $BG['overlay']['type'] ) && ! empty( $img['url'] ) && ! empty( $over['over'] ) ?
		$blend + $over['blend'] : $blend;
	
	/*
	 * Color
	 */
	$color = ! empty( $BG['colorinline'] ) ? $BG['colorinline'] : NULL;
	$color = is_array( $color ) && ! empty( $color['hex'] ) ?
		UTIL\to_rgba( $color['hex'], $color['alpha'] ) : $color;
	
	if ( $color && ! empty( $img['url'] ) && ! empty( $BG['blend']['type'] ) ) {
		$overlay[] = 'linear-gradient( ' . $color . ', ' . $color . ')';
		$blend[]   = ! empty( $BG['blend']['type'] ) && ! empty( $img['url'] ) ? $BG['blend']['type'] : 'normal';
	}
	
	/*
	 * Desaturate
	 */
	if ( ! empty( $BG['blend']['desaturate'] ) && ! empty( $img['url'] ) ) {
		$overlay[] = 'linear-gradient( rgba(0,0,0,' . intval( $BG['blend']['desaturate'] )
		             . '), rgba(0,0,0,' . intval( $BG['blend']['desaturate'] ) . '))';
		$blend[]   = 'color';
	}
	
	/*
	 * Image
	 */
	if ( ! empty( $img['url'] ) ) {
		$overlay[] = 'url(' . $img['url'] . ')';
		$blend[]   = 'normal';
	}
	
	/*
	 * Returned properties
	 */
	$ret .= ! empty( $overlay ) ? 'background-image:' . implode( ',', $overlay ) . ';' : '';
	$ret .= $size ? 'background-size:' . $size . ';' : '';
	$ret .= ! empty( $BG['repeat'] ) ? 'background-repeat:' . $BG['repeat'] . ';' : '';
	$ret .= ! empty( $BG['attachment'] ) ? 'background-attachment:' . $BG['attachment'] . ';' : '';
	$ret .= ! empty( $blend ) ? 'background-blend-mode:' . implode( ',', $blend ) . ';' : '';
	$ret .= ! empty( $color ) ? 'background-color:' . $color . ';' : '';
	$ret .= ! empty( $BG['position'] ) ?
		'background-position:' . $BG['position']['x'] . ' ' . $BG['position']['y'] . ';' : '';
	
	$filtered = apply_filters( 'sectionblock_background_inline_styles', $ret, $BG );
	
	return $filtered ? ' style="' . $filtered . '"' : '';
}

/**
 * Create gradient overlay to go over background image, if configured
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return array
 */
function style_overlay( $BG ) {
	
	global $SBLCK;
	
	$O = $BG['overlay'];
	
	$ret = [
		'over'  => [],
		'blend' => [],
	];
	
	if ( empty( $O['type'] ) || empty( $O['color'] ) ) {
		return $ret;
	}
	
	$types = $SBLCK->get( 'background.overlays' );
	
	$P = [
		'alpha'        => empty( $O['alpha'] ) ? 100 : intval( $O['alpha'] ),
		'beta'         => empty( $O['beta'] ) ? 0 : intval( $O['beta'] ),
		'clr'          => [
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
	
	$P = apply_filters( 'sectionblock_overlay_params', $P, $BG );
	
	switch ( $P['type'] ) {
		
		case 'cover':
		case 'gradient':
			$ret['over'][]  = 'linear-gradient(' . $P['deg'] . ',' . $P['clr']['a'] . ',' . $P['clr']['b'] . ')';
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
			$ret['blend']  = [ 'normal', 'normal', 'normal', 'normal', ];
			break;
	}
	
	return apply_filters( 'sectionblock_image_overlay_styles', $ret, $BG );
}

/**
 * Background Type, determined by chosen options
 *
 * @param array $BG - PROPS array, as seen in BG.js
 *
 * @return null|string
 */
function type( $BG ) {
	
	$type = NULL;
	if ( ! empty( $BG['color'] ) && ! empty( $BG['image']['url'] ) && ! empty( $BG['blend'] ) ) {
		$type = 'blend';
	} else if ( ! empty( $BG['image']['url'] ) ) {
		$type = 'image';
	} else if ( ! empty( $BG['color'] ) ) {
		$type = 'color';
	}
	
	return $type;
}