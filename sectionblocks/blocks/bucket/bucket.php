<?php

namespace sectionblock\section;

function render() {
	
	$args = func_get_args();
	
	$atts = $args[0];
	
	global $SBLCK;
	
	$S = SECTIONBLOCK_SLUG . '-bucket';
	
	$slg = ' ' . $S;
	$agn = ! empty( $atts['align'] ) ? ' align' . $atts['align'] : '';
	$bg  = ! empty( $atts['background'] ) ? \sectionblock\background\classes( $atts['background'] ) : '';
	$itm = ! empty( $atts['itemType'] ) ? ' ' . $atts['itemType'] : ' ' . $SBLCK->get( 'selects.itemstyles' );
	$tit = ! empty( $atts['itemHeader'] ) ? ' ' . $atts['itemHeader'] : ' ' . $SBLCK->get( 'selects.titlestyles' );
	
	$html = '<div class="wp-block-' . $S . $agn . $slg . $bg . $itm . $tit . '">';
	
	// optional title
	if ( ! empty( $atts['textTitle'] ) ) {
		$html .= '<h2 class="' . SECTIONBLOCK_SLUG . '-bucket-title">' . $atts['textTitle'] . '</h2>';
	}
	
	// optional desc
	if ( ! empty( $atts['textDesc'] ) ) {
		$html .= '<p class="' . SECTIONBLOCK_SLUG . '-bucket-desc">' . '<p>' . $atts['textDesc'] . '</p>';
	}
	
	if ( ! empty( $atts['bItems'] ) ) {
		
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-bucket-items">';
		
		// @todo I assume items go here...not sure how passed
		
		
		$html .= '</div>';
	}
	
	$html .= '</div>';
	
	return $html;
}