<?php

namespace sectionblock\section;

function render() {
	
	global $SBLCK;
	
	$S = SECTIONBLOCK_SLUG . '-section';
	$S_ = SECTIONBLOCK_SLUG . '_section';
	
	$args = func_get_args();
	
	$atts    = $args[0];
	$content = ! empty( $args[1] ) ? $args[1] : ( ! empty( $atts['bItems'] ) ? $atts['bItems'] : '' );
	
	$USE = apply_filters( $S_ . '_use', $SBLCK->get( 'plugin.use.section' ), $atts, $content );
	$BG  = apply_filters( $S_ . '_background_raw', $atts['background'], $atts, $content );
	
	// sort out which background attributes are allowed
	foreach ( $USE['background'] as $prop => $use ) {
		
		if ( $prop === 'colorinline' && $use && ! empty( $BG['color'] ) && $USE['background']['color'] ) {
			$BG['colorinline'] = $BG['color'];
			$BG['color']       = NULL;
		}
		
		if ( ! $use ) {
			$BG[ $prop ] = NULL;
		}
	}
	
	// add inline styles
	$STY = \sectionblock\background\style( $BG );
	
	// open wrapper
	$html = '<div class="' . implode( ' ', section_classes( $S, $BG, $atts, $USE ) ) . '"' . $STY . '>';
	
	// add ghost(s)
	$html .= $USE['background']['ghost'] ? \sectionblock\background\ghost( $BG ) : '';
	
	// add classes to items wrapper; add items
	$html .= '<div class="' . implode( ' ', item_classes( $S, $atts ) ) . '">';
	
	// add content
	$html .= apply_filters( 'sectionblock_items', $content, $atts );
	
	// close items wrapper
	$html .= '</div>';
	
	// close wrapper
	$html .= '</div>';
	
	return $html;
}

/**
 * Built classes array for wrapper
 *
 * @param string $S
 * @param array $BG
 * @param array $atts
 * @param array $USE
 *
 * @return array
 */
function section_classes( $S, $BG, $atts, $USE ) {
	
	$CLS = [ 'wp-block-' . $S, $S ];
	
	if ( ! empty( $atts['align'] ) ) {
		$CLS[] = ' align' . $atts['align'];
	}
	
	if ( ! empty( $atts['bClass'] ) && $USE['bClass'] ) {
		$atts['bClass'];
	}
	
	// add background classes
	$CLS[] = \sectionblock\background\classes( $BG );
	
	// allow classes to be filtered
	$filtered = apply_filters( 'sectionblock_wrapper_classes', $CLS, $atts );
	
	// catch bad filters
	return is_array( $filtered ) ? $filtered : $CLS;
}

/**
 * Build classes array for items
 *
 * @param string $S
 * @param array $atts
 *
 * @return array
 */
function item_classes( $S, $atts ) {
	
	$ICLS = [ $S . '-items' ];
	
	if ( ! empty( $atts['alignment'] ) ) {
		$ICLS[] = 'align' . $atts['alignment'];
	}
	
	// allow classes to be filtered
	$filtered = apply_filters( 'sectionblock_items_classes', $ICLS, $atts );
	
	// catch bad filtering
	return is_array( $filtered ) ? $filtered : $ICLS;
}