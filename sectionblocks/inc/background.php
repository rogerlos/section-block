<?php

namespace sectionblock\background;

/**
 * Background class.
 *
 * @param $background
 *
 * @return string
 */
function classes( $background ) {
	
	$typ = type( $background );
	
	$ret = 'blend' === $typ ? ' has-bg has-bg-image has-bg-color has-bg-blend' : '';
	$ret = ! $ret && 'image' == $typ ? ' has-bg has-bg-image' : $ret;
	$ret = ! $ret && 'color' == $typ ? ' has-bg has-bg-color' : $ret;
	
	if ( $ret && $ret !== 'image' ) {
		switch ( $background['color'] ) {
			case '#BFCDC3':
				$ret .= ' has-lightsage-background-color';
				break;
			case '#71A087':
				$ret .= ' has-sage-background-color';
				break;
			case '#00665E':
				$ret .= ' has-green-background-color';
				break;
			case '#513628':
				$ret .= ' has-brown-background-color';
				break;
			case '#31251C':
				$ret .= ' has-darkbrown-background-color';
				break;
			case '#E27C00':
				$ret .= ' has-gold-background-color';
				break;
			case '#EBEEEC':
				$ret .= ' has-gray-background-color';
				break;
			case '#FFFFFF':
				$ret .= ' has-white-background-color';
				break;
			case '#000000':
				$ret .= ' has-black-background-color';
				break;
		}
	}
	
	return $ret;
}

/**
 * Should return the ghost background chosen
 *
 * @param $background
 *
 * @return string
 */
function ghost( $background ) {
	
	$h = '';
	
	if ( empty( $background['ghost']['img'] ) ) {
		return $h;
	}
	
	$i = get_stylesheet_directory() . '/ghost/' . $background['ghost']['img'];
	
	if ( ! file_exists( $i ) ) {
		return $h;
	}
	
	$where = ! empty( $background['ghost']['pos'] ) ? $background['ghost']['pos'] : 'right';
	
	$h .= '<div class="ppa-ghost ppa-ghost-' . $where . '">';
	$h .= '<img src="' . $i . '">';
	$h .= '</div>';
	
	return $h;
}


/**
 * Size of background image
 *
 * @param $background
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
 * @param $background
 *
 * @return string
 */
function style( $background ) {
	
	$size    = size( $background );
	$size    = ! $size && ! empty( $background['size']['keyword'] ) ? $background['size']['keyword'] : $size;
	$img     = ! empty( $background['image'] ) ? $background['image'] : [ 'url' => '' ];
	$overlay = '';
	
	if ( ! empty( $background['overlay']['type'] ) && ! empty( $img['url'] ) ) {
		$overlay = style_overlay( $background );
	}
	
	$ret = ! empty( $img['url'] ) ? 'background-image:' . $overlay . 'url(' . $img['url'] . ');' : '';
	$ret .= $ret && $size ? 'background-size:' . $size . ';' : $ret;
	$ret .= $ret && ! empty( $background['repeat'] ) ? 'background-repeat:' . $background['repeat'] . ';' : $ret;
	$ret .= $ret && ! empty( $background['attachment'] ) ? 'background-attachment:' . $background['attachment'] . ';' : $ret;
	$ret .= $ret && ! empty( $background['blend'] ) ? 'background-blend-mode:' . $background['blend'] . ';' : $ret;
	
	return $ret ? ' style="' . $ret . '"' : '';
}

/**
 * Create gradient to go over background image
 *
 * @param $background
 *
 * @return string
 */
function style_overlay( $background ) {
	
	$alpha = empty( $background['overlay']['alpha'] ) ? 0 : intval( $background['overlay']['alpha'] );
	$type  = empty( $background['overlay']['type'] ) ? '' : $background['overlay']['type']; // cover, gradient, edges
	$start = empty( $background['overlay']['start'] ) ? 'top' : $background['overlay']['start'];
	$color = empty( $background['overlay']['color'] ) ? '#000000' : $background['overlay']['color'];
	
	if ( ! $type ) {
		return '';
	}
	
	$alpha = $alpha < 0 ? 0 : $alpha;
	$alpha = $alpha > 100 ? 100 : $alpha;
	$half  = intval( $alpha / 2 );
	
	$color1 = \sectionblock\util\to_rgba( $color, $alpha );
	$color2 = $type == 'cover' ? $color1 : \sectionblock\util\to_rgba( $color, $half );
	
	$deg = '180deg';
	
	switch ( $start ) {
		case 'bottom':
			$deg = '0deg';
			break;
		case 'left':
			$deg = '90deg';
			break;
		case 'right':
			$deg = '270deg';
			break;
	}
	
	$ret = '';
	
	switch ( $type ) {
		case 'cover':
		case 'gradient':
			$ret = 'linear-gradient(' . $deg . ',' . $color1 . ',' . $color2 . '),';
			break;
		case 'edges':
			$ret = 'linear-gradient(0deg,' . $color1 . ',' . $color2 . ' 20%,' . $color2 . '),';
			$ret .= 'linear-gradient(90deg,' . $color1 . ',' . $color2 . ' 20%,' . $color2 . '),';
			$ret .= 'linear-gradient(180deg,' . $color1 . ',' . $color2 . ' 20%,' . $color2 . '),';
			$ret .= 'linear-gradient(270deg,' . $color1 . ',' . $color2 . ' 20%,' . $color2 . '),';
			break;
	}
	
	return $ret;
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