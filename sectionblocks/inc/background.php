<?php

namespace sectionblock\background;

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
	
	$ret = 'blend' === $typ ? ' has-bg has-bg-image has-bg-color has-bg-blend' : '';
	$ret = ! $ret && 'image' === $typ ? ' has-bg has-bg-image' : $ret;
	$ret = ! $ret && 'color' === $typ ? ' has-bg has-bg-color' : $ret;
	
	// apply a background color class
	if ( $ret && $ret !== 'image' ) {
		
		$bgcolorclass = '';
		$colors       = apply_filters( 'sectionblock_background_color_array', $SBLCK->get( 'colors' ), $background );
		
		if ( ! empty( $colors ) ) {
			
			foreach ( $colors as $hex => $class ) {
				if ( $background['color'] === $hex ) {
					$bgcolorclass = $class;
				}
			}
			
		} else {
			$bgcolorclass = ' has-' . str_replace( '#', '', $background['color'] ) . '-background-color';
		}
		
		$ret .= $bgcolorclass;
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
	$y = ! empty( $background['size']['y'] ) ? $background['size']['y'] : '';
	
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
	
	$size = size( $background );
	$size = ! $size && ! empty( $background['size']['keyword'] ) ? $background['size']['keyword'] : $size;
	
	$img  = ! empty( $background['image'] ) ?
		$background['image'] : [ 'url' => '' ];
	
	$overlay = ! empty( $background['overlay']['type'] ) && ! empty( $img['url'] ) ?
		style_overlay( $background ) : '';
	
	$color = ! empty( $background['colorinline'] ) ? $background['colorinline'] : null;
	$color = is_array( $color ) && ! empty( $color['hex'] ) ?
		\sectionblock\util\to_rgba( $color['hex'], $color['alpha'] ) : $color;
	
	$ret .= ! empty( $color ) ?
		'background-color:' . $color . ';' : '';
	
	$ret .= $ret && ! empty( $img['url'] ) ?
		'background-image:' . $overlay . 'url(' . $img['url'] . ');' : '';
	
	$ret .= $ret && $size ?
		'background-size:' . $size . ';' : '';
	
	$ret .= $ret && ! empty( $background['repeat'] ) ?
		'background-repeat:' . $background['repeat'] . ';' : '';
	
	$ret .= $ret && ! empty( $background['attachment'] ) ?
		'background-attachment:' . $background['attachment'] . ';' : '';
	
	$ret .= $ret && ! empty( $background['position'] ) ?
		'background-position:' . $background['position']['x'] . ' ' . $background['position']['y'] . ';' : '';
	
	$ret .= $ret && ! empty( $background['blend'] ) ?
		'background-blend-mode:' . $background['blend'] . ';' : '';
	
	$filtered = apply_filters( 'sectionblock_background_inline_styles', $ret, $background );
	
	return $filtered ? ' style="' . $filtered . '"' : '';
}

/**
 * Create gradient to go over background image
 *
 * @param $background
 *
 * @return string
 */
function style_overlay( $background ) {
	
	global $SBLCK;
	
	$types = $SBLCK->get( 'background.overlays' );
	
	$params = [
		'alpha'        => empty( $background['overlay']['alpha'] ) ? 100 : intval( $background['overlay']['alpha'] ),
		'beta'        => empty( $background['overlay']['beta'] ) ? 0 : intval( $background['overlay']['beta'] ),
		'colors'       => [
			'original' => empty( $background['overlay']['color'] ) ? '#000000' : $background['overlay']['color'],
			'a'        => '',
			'b'        => '',
		],
		'deg'          => '180deg',
		'edge_opacity' => '20%',
		'start'        => empty( $background['overlay']['start'] ) ? 'top' : $background['overlay']['start'],
		'type'         => empty( $background['overlay']['type'] ) ? '' : $background['overlay']['type'],
	];
	
	$params['type'] = empty( $params['type'] ) || ! in_array( $params['type'], $types ) ? '' : $params['type'];
	
	$params['alpha'] = $params['alpha'] < 0 ? 0 : $params['alpha'];
	$params['alpha'] = $params['alpha'] > 100 ? 100 : $params['alpha'];
	
	$params['colors']['a'] = \sectionblock\util\to_rgba( $params['colors']['original'], $params['alpha'] );
	$params['colors']['b'] = $params['type'] === 'cover' ?
		$params['colors']['a'] : \sectionblock\util\to_rgba( $params['colors']['original'], $params['beta'] );
	
	switch ( $params['start'] ) {
		case 'bottom':
			$params['deg'] = '0deg';
			break;
		case 'left':
			$params['deg'] = '90deg';
			break;
		case 'right':
			$params['deg'] = '270deg';
			break;
	}
	
	$params = apply_filters( 'sectionblock_overlay_params', $params, $background );
	
	$ret = '';
	
	switch ( $params['type'] ) {
		
		case 'cover':
		case 'gradient':
			$ret = 'linear-gradient(' . $params['deg'] . ',' . $params['colors']['a'] . ','
			       . $params['colors']['b'] . '),';
			break;
		
		case 'edges':
			$ret = 'linear-gradient(0deg,' . $params['colors']['a'] . ',' . $params['colors']['b']
			       . ' ' . $params['edge_opacity'] . ',' . $params['colors']['b'] . '),';
			$ret .= 'linear-gradient(90deg,' . $params['colors']['a'] . ',' . $params['colors']['b']
			        . ' ' . $params['edge_opacity'] . ',' . $params['colors']['b'] . '),';
			$ret .= 'linear-gradient(180deg,' . $params['colors']['a'] . ',' . $params['colors']['b']
			        . ' ' . $params['edge_opacity'] . ',' . $params['colors']['b'] . '),';
			$ret .= 'linear-gradient(270deg,' . $params['colors']['a'] . ',' . $params['colors']['b']
			        . ' ' . $params['edge_opacity'] . ',' . $params['colors']['b'] . '),';
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