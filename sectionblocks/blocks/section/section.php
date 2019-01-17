<?php

namespace sectionblock\section;

function render() {
	
	global $SBLCK;
	
	$S = SECTIONBLOCK_SLUG . '-section';
	$S_ = SECTIONBLOCK_SLUG . '_section';
	
	$args = func_get_args();
	
	$atts    = $args[0];
	$content = ! empty( $args[1] ) ? $args[1] : ( ! empty( $atts['bItems'] ) ? $atts['bItems'] : '' );
	
	// discover permissions for display from config, apply to background props
	$USE = apply_filters( $S_ . '_use', $SBLCK->get( 'use.section' ), $atts, $content );
	$BG  = background_props( $S_, $atts, $content, $USE );
	
	// add inline styles
	$STY = \sectionblock\background\style( $BG );
	
	// open wrapper
	$html = '<div class="' . trim( implode( ' ', section_classes( $S, $S_, $BG, $atts, $USE ) ) ) . '"' . $STY . '>';
	
	// filter allowing content to be placed before items
	$html .= apply_filters( $S_ . '_before', '', $atts );
	
	// add ghost(s)
	$html .= $USE['background']['ghost'] ? \sectionblock\background\ghost( $BG ) : '';
	
	// add classes to items wrapper
	$html .= '<div class="' . trim( implode( ' ', item_classes( $S, $S_, $atts ) ) ) . '">';
	
	// add content
	$html .= apply_filters( $S_ . '_content', $content, $atts );
	
	// close items wrapper
	$html .= '</div>';
	
	// filter allowing content to be placed after items
	$html .= apply_filters( $S_ . '_after', '', $atts );
	
	// close wrapper
	$html .= '</div>';
	
	return apply_filters( $S_ . '_html', $html, $atts );
}

/**
 * Built classes array for wrapper
 *
 * @param string $S
 * @param string $S_
 * @param array  $BG
 * @param array  $atts
 * @param array  $USE
 *
 * @return array
 */
function section_classes( $S, $S_, $BG, $atts, $USE ) {
	
	$CLS = [ 'wp-block-' . $S, $S ];
	
	if ( ! empty( $atts['align'] ) ) {
		$CLS[] = ' align' . $atts['align'];
	}
	
	if ( ! empty( $atts['bClass'] ) && $USE['bClass'] ) {
		$CLS[] = $atts['bClass'];
	}
	
	if ( ! empty( $atts['className'] ) ) {
		$CLS[] = $atts['className'];
	}
	
	if ( ! empty( $atts['bFlex'] ) && $atts['bFlex'] && $USE['bFlex'] ) {
		$CLS[] = 'sectionblock-flex';
	}
	
	// add background classes
	$CLS[] = \sectionblock\background\classes( $BG );
	
	// allow classes to be filtered
	$filtered = apply_filters( $S_ . '_wrapper_classes', $CLS, $atts );
	
	// catch bad filters
	return is_array( $filtered ) ? $filtered : $CLS;
}

/**
 * Build classes array for items
 *
 * @param string $S
 * @param string $S_
 * @param array  $atts
 *
 * @return array
 */
function item_classes( $S, $S_, $atts ) {
	
	$ICLS = [ $S . '-items' ];
	
	if ( ! empty( $atts['alignment'] ) ) {
		$ICLS[] = 'align' . $atts['alignment'];
	}
	
	// allow classes to be filtered
	$filtered = apply_filters( $S_ . 'items_classes', $ICLS, $atts );
	
	// catch bad filtering
	return is_array( $filtered ) ? $filtered : $ICLS;
}

/**
 * Removes background properties which are not allowed via the 'use' array
 *
 * @param string $S_
 * @param array $atts
 * @param string $content
 * @param array $USE
 *
 * @return array
 */
function background_props( $S_, $atts, $content, $USE ) {
	
	$BG  = apply_filters( $S_ . '_background_raw', $atts['background'], $atts, $content );
	
	foreach ( $USE['background'] as $prop => $use ) {
		
		if ( $prop === 'colorinline' && $use && ! empty( $BG['color'] ) && $USE['background']['color'] ) {
			$BG['colorinline'] = $BG['color'];
			$BG['color']       = NULL;
		} else if ( ! $use ) {
			$BG[ $prop ] = NULL;
		}
	}
	
	$filtered = apply_filters( $S_ . '_background_final', $BG, $atts );
	
	return is_array( $filtered ) ? $filtered : $BG;
}