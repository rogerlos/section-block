<?php

namespace sectionblock\background;

use \sectionblock\util as UTIL;

/**
 * Background classes string creator.
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return array
 */
function classes( $BG, $ATTS ) {
	
	global $SBLCK;
	
	$typ = type( $BG, $ATTS );
	$ret = [];
	
	if ( $typ ) {
		
		$ret[] = 'has-bg';
		
		switch( $typ ) {
			case 'blend':
				$ret[] = 'has-bg-image';
				$ret[] = 'has-bg-blend';
				$ret[] = 'has-bg-color';
				break;
			case 'image':
				$ret[] = 'has-bg-image';
				break;
			case 'color':
				$ret[] = 'has-bg-color';
				break;
		}
		
		if ( ! empty( $BG['color'] ) ) {
			
			$bgcolorclass = '';
			$colors       = apply_filters( 'sectionblock_background_color_array', $SBLCK->get( 'colors' ), $BG, $ATTS );
			
			if ( ! empty( $colors ) ) {
				foreach ( $colors as $col ) {
					if ( $BG['color']['hex'] === $col['color'] ) {
						$bgcolorclass = '-' . $col['slug'];
						break;
					}
				}
			}
			
			if ( empty ( $bgcolorclass ) ) {
				$bgcolorclass = '-' . str_replace( '#', '', $BG['color']['hex'] );
			}
			
			$ret[] = 'has-bg-color' . $bgcolorclass;
		}
	}
	
	$filtered = apply_filters( 'sectionblock_background_classes_array', $ret, $BG, $ATTS );
	$ret = is_array( $filtered ) ? $filtered : $ret;
	
	return $ret;
}

/**
 * Should return the ghost background chosen. Checks the theme's /ghost/ directory for file if passed path
 * does not work.
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return string
 */
function ghost( $BG, $ATTS ) {
	
	$h = '';
	$S = 'sectionblock_ghost';
	
	$ghost = apply_filters( 'sectionblock_ghost_array', $BG['ghost'], $BG, $ATTS );
	
	if ( empty( $ghost['img'] ) ) {
		return $h;
	}
	
	$i = file_exists( $ghost['img'] ) ? $ghost['img'] : '';
	
	$i = ! $i && file_exists( get_stylesheet_directory() . '/ghost/' . $BG['ghost']['img'] ) ?
		get_stylesheet_directory() . '/ghost/' . $BG['ghost']['img'] : $i;
	
	$i = apply_filters( 'sectionblock_ghost_img_path', $i, $ghost, $BG, $ATTS );
	
	if ( ! $i ) {
		return $h;
	}
	
	$where = ! empty( $BG['ghost']['pos'] ) ? $BG['ghost']['pos'] : 'right';
	
	$cls = apply_filters( 'sectionblock_ghost_classes', [ $S,  $S . '-' . $where ], $ghost, $BG, $ATTS );
	
	$h .= '<div class="' . implode( ' ', $cls ) . '">';
	$h .= (string) apply_filters( 'sectionblock_ghost_img_tag', '<img src="' . $i . '">', $ghost, $BG, $ATTS );
	$h .= '</div>';
	
	return $h;
}


/**
 * Create CSS background-size string
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return string
 */
function size( $BG, $ATTS ) {
	
	$ret = '';
	
	if ( empty( $BG['size']['keyword'] ) || empty( $BG['size']['x'] ) ) {
		return $ret;
	}
	
	$x = $BG['size']['x'];
	$y = ! empty( $BG['size']['y'] ) ? $BG['size']['y'] : 'auto';
	
	$ret = $x && $y ? $x . ' ' . $y : $ret;
	$ret = $x ? $x : $ret;
	
	return apply_filters( 'sectionblock_background_size', $ret, $BG, $ATTS );
}

/**
 * Background inline styles, contingent on there being a BG image.
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return array
 */
function style( $BG, $ATTS ) {
	
	$over    = style_overlay( $BG, $ATTS );
	$blend   = [];
	$overlay = [];
	$img     = ! empty( $BG['image'] ) ? $BG['image'] : [ 'url' => '' ];
	
	/*
	 * Fix blend configuration if a string
	 */
	if ( is_string( $BG['blend'] ) ) {
		$BG['blend'] = [ 'type' => $BG['blend'], 'desaturate' => 0 ];
	}
	
	/*
	 * Sizing
	 */
	$size = size( $BG, $ATTS );
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
	 * Inline styles array
	 */
	$ret = [
		'background-image' => $overlay,
		'background-size' => $size,
		'background-repeat' => $BG['repeat'],
		'background-attachment' => $BG['attachment'],
		'background-blend-mode' => $blend,
		'background-color' => $color,
		'background-position' => $BG['position']['x'] . ' ' . $BG['position']['y'],
	];
	
	$filtered = apply_filters( 'sectionblock_background_style_array', $ret, $BG, $ATTS );
	
	return is_array( $filtered ) ? $filtered  : $ret;
}

/**
 * Create gradient overlay to go over background image, if configured
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return array
 */
function style_overlay( $BG, $ATTS ) {
	
	global $SBLCK;
	
	$ret = [
		'over'  => [],
		'blend' => [],
	];
	
	if ( empty( $BG['overlay'] ) ) {
		return $ret;
	}
	
	$O = $BG['overlay'];
	
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
	
	$P = apply_filters( 'sectionblock_overlay_params', $P, $BG, $ATTS );
	
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
	
	return apply_filters( 'sectionblock_image_overlay_styles', $ret, $BG, $ATTS );
}

/**
 * Background Type, determined by chosen options
 *
 * @param array $BG   - PROPS array, as seen in BG.js
 * @param array $ATTS - Attributes array from WP
 *
 * @return null|string
 */
function type( $BG, $ATTS ) {
	
	$type = NULL;
	
	if ( ! empty( $BG['color']['hex'] ) && ! empty( $BG['image']['url'] ) && ! empty( $BG['blend'] ) ) {
		$type = 'blend';
	} else if ( ! empty( $BG['image']['url'] ) ) {
		$type = 'image';
	} else if ( ! empty( $BG['color']['hex'] ) ) {
		$type = 'color';
	}
	
	return apply_filters( 'sectionblock_background_type', $type, $BG, $ATTS );
}