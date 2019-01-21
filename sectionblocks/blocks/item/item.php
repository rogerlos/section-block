<?php

namespace sectionblock\item;

use \sectionblock\util as UTIL;

function render() {
	
	global $SBLCK;
	
	$args = func_get_args();
	$atts = $args[0];
	
	$atts['background'] = ! empty( $atts['itemBackground'] ) ? $atts['itemBackground'] : [];
	
	// discover permissions for display from config, apply to background props
	$USE = apply_filters( 'sectionblock_feature_use', $SBLCK->get( 'use.item' ), $atts );
	$BG  = UTIL\background_props( $atts, $USE, '', 'feature' );
	
	// add inline styles
	$styles_array = \sectionblock\background\style( $BG, $atts );
	$STY          = UTIL\inline_style_string( $styles_array, $atts, 'section' );
	
	// set values from atts
	$A = feature_vals( $atts );
	
	$html = '<div class="' . implode( ' ', item_wrapper_classes( $BG, $atts ) ) . '"' . $STY . '>';
	$html .= ! empty( $BG ) ? \sectionblock\background\ghost( $BG, $atts ) : '';
	$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner">';
	
	// image
	$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-image">';
	$html .= ! empty( $A['con']['img']['url'] ) ? image_html( $atts, $A ) : '';
	$html .= '</div>';
	
	// text content
	$html .= $A['con']['title'] ? title_html( $atts, $A ) : '';
	$html .= $A['con']['label'] ? label_html( $atts, $A ) : '';
	$html .= $A['con']['text'] ? excerpt_html( $atts, $A ) : '';
	$html .= $A['con']['button'] ? button_html( $atts, $A ) : '';
	
	$html .= '</div>';
	$html .= '</div>';
	
	return $html;
}

/**
 * Sorts out values used to build the feature.
 *
 * @param array $atts
 *
 * @return array
 */
function feature_vals( $atts ) {
	
	$A = [];
	
	$A['id'] = ! empty( $atts['id'] ) ? $atts['id'] : 0;
	
	$A['posted'] = intval( $A['id'] ) > 0 ? \sectionblock\rest\get_post( $A['id'] ) : [];
	
	$A['lock'] = [
		'img'   => ! empty( $atts['itemLockImage'] ),
		'title' => ! empty( $atts['itemLockTitle'] ),
		'label' => ! empty( $atts['itemLockLabel'] ),
		'text'  => ! empty( $atts['itemLockText'] ),
		'link'  => ! empty( $atts['itemLockLink'] ),
	];
	
	$A['edit'] = [
		'img'    => ! empty( $atts['itemImage'] ) ? $atts['itemImage'] : '',
		'title'  => ! empty( $atts['itemTitle'] ) ? $atts['itemTitle'] : '',
		'label'  => ! empty( $atts['itemLabel'] ) ? $atts['itemLabel'] : '',
		'text'   => ! empty( $atts['itemText'] ) ? $atts['itemText'] : '',
		'link'   => ! empty( $atts['itemLink'] ) ? $atts['itemLink'] : '',
		'button' => ! empty( $atts['itemButton'] ) ? $atts['itemButton'] : '',
	];
	
	$A['post'] = [
		'img'   => ! empty( $A['posted']->img ) ? $A['posted']->img : '',
		'title' => ! empty( $A['posted']->title ) ? $A['posted']->title : '',
		'label' => ! empty( $A['posted']->category ) ? $A['posted']->category['term'] : '',
		'text'  => ! empty( $A['posted']->excerpt ) ? $A['posted']->excerpt : '',
		'link'  => ! empty( $A['posted']->permalink ) ? $A['posted']->permalink : '',
	];
	
	$A['con'] = [
		'img'    => ! $A['lock']['img'] ? $A['edit']['img'] : $A['post']['img'],
		'title'  => ! $A['lock']['title'] ? $A['edit']['title'] : $A['post']['title'],
		'label'  => ! $A['lock']['label'] ? $A['edit']['label'] : $A['post']['label'],
		'text'   => ! $A['lock']['text'] ? $A['edit']['text'] : $A['post']['text'],
		'link'   => ! $A['lock']['link'] ? $A['edit']['link'] : $A['post']['link'],
		'button' => $A['edit']['button'],
	];
	
	$A['link'] = [
		'img'   => empty( $atts['itemLinkImage'] ),
		'label' => empty( $atts['itemLinkLabel'] ),
		'title' => empty( $atts['itemLinkTitle'] ),
	];
	
	
	$A['a']        = [ 'target' => ! empty( $atts['itemLinkNew'] ) ? ' target="_blank"' : '', ];
	$A['a']['tag'] = '<a href="' . $A['con']['link'] . '"' . $A['a']['target'] . '>';
	
	return apply_filters( 'sectionblock_feature_vals', $A, $atts );
}

/**
 * Adds classes to feature wrapper.
 *
 * @param array $BG
 * @param array $atts
 *
 * @return array
 */
function item_wrapper_classes( $BG, $atts ) {
	
	$ret = [
		'wp-blocks-' . SECTIONBLOCK_SLUG . '-feature',
		SECTIONBLOCK_SLUG . '-feature',
	];
	
	if ( ! empty( $atts['className'] ) ) {
		$ret = array_merge( $ret, explode( ' ', $atts['className'] ) );
	}
	
	if ( ! empty( $atts['iClass'] ) ) {
		$ret = array_merge( $ret, explode( ' ', $atts['iClass'] ) );
	}
	
	$ret      = array_merge( $ret, \sectionblock\background\classes( $BG, $atts ) );
	$filtered = apply_filters( 'sectionblock_feature_wrap_classes_array', $ret, $atts );
	
	return is_array( $filtered ) ? $filtered : $ret;
}

/**
 * Image HTML
 *
 * @param array $atts
 * @param array $A
 *
 * @return string
 */
function image_html( $atts, $A ) {
	
	global $SBLCK;
	
	$S = SECTIONBLOCK_SLUG;
	
	$imgclass = ! empty( $atts['itemImageV'] ) ? ' ' . $S . '-align-v-' . $atts['itemImageV'] : '';
	$imgclass .= ! empty( $atts['itemImageH'] ) ? ' ' . $S . '-align-h-' . $atts['itemImageH'] : '';
	
	$img_html = '<span class="' . $S . '-main-inner-image-inner' . $imgclass . '">';
	$img_html .= $A['link']['img'] ? $A['a']['tag'] : '';
	
	$img      = apply_filters( 'sectionblock_feature_img_array', $A['con']['img'], $atts, $A );
	$img_html .= '<img src="' . $img['url'] . '" alt="' . $img['alt'] . '">';
	
	// adds a div with the gradient overlay if selected
	if ( ! empty( $atts['itemImageOverlay'] ) ) {
		
		$sty = call_user_func( $SBLCK->get( 'plugin.image_overlay_call' ) );
		
		if ( $sty ) {
			$sty      = substr( $sty, 0, - 1 );
			$img_html .= '<div class="' . $S . '-image-overlay" style="background:' . $sty . ';"></div>';
		}
	}
	
	$img_html .= $A['link']['img'] ? '</a>' : '';
	$img_html .= '</span>';
	
	return apply_filters( 'sectionblock_feature_img_html', $img_html, $atts, $A );
}

/**
 * Title HTML
 *
 * @param array $atts
 * @param array $A
 *
 * @return string
 */
function title_html( $atts, $A ) {
	
	$S   = SECTIONBLOCK_SLUG;
	$tit = apply_filters( 'sectionblock_feature_title_text', $A['con']['title'], $atts, $A );
	
	$tit_html = '<div class="' . $S . '-main-inner-text-headline">';
	$tit_html .= $A['link']['title'] ? $A['a']['tag'] : '';
	$tit_html .= '<h4 class="' . $S . '-item-title">' . $tit . '</h4>';
	$tit_html .= $A['link']['title'] ? '</a>' : '';
	$tit_html .= '</div>';
	
	return apply_filters( 'sectionblock_feature_title_html', $tit_html, $atts, $A );
}

/**
 * Label HTML
 *
 * @param array $atts
 * @param array $A
 *
 * @return string
 */
function label_html( $atts, $A ) {
	
	$S   = SECTIONBLOCK_SLUG;
	$lab = apply_filters( 'sectionblock_feature_label_text', $A['con']['label'], $atts, $A );
	
	$label_html = '<div class="' . $S . '-main-inner-text-label">';
	$label_html .= $A['link']['label'] ? $A['a']['tag'] : '';
	$label_html .= '<div class="' . $S . '-item-label"><p>' . $lab . '</p></div>';
	$label_html .= $A['link']['label'] ? '</a>' : '';
	$label_html .= '</div>';
	
	return apply_filters( 'sectionblock_feature_label_html', $label_html, $atts, $A );
}

/**
 * Excerpt HTML
 *
 * @param array $atts
 * @param array $A
 *
 * @return string
 */
function excerpt_html( $atts, $A ) {
	
	$S   = SECTIONBLOCK_SLUG;
	$txt = apply_filters( 'sectionblock_feature_excerpt_text', $A['con']['text'], $atts, $A );
	
	$text_html = '<div class="' . $S . '-main-inner-text-excerpt">';
	$text_html .= '<p class="' . $S . '-item-text">' . $txt . '</p>';
	$text_html .= '</div>';
	
	return apply_filters( 'sectionblock_feature_excerpt_html', $text_html, $atts, $A );
}

/**
 * Button HTML
 *
 * @param array $atts
 * @param array $A
 *
 * @return string
 */
function button_html( $atts, $A ) {
	
	$S = SECTIONBLOCK_SLUG;
	
	$butt_html = '<div class="' . $S . '-main-inner-text-button">';
	$butt_html .= '<a href="' . $A['con']['link'] . '"' . $A['a']['target'] . ' class="' . $S . '-item-button">';
	$butt_html .= apply_filters( 'sectionblock_feature_button_text', $A['con']['button'], $atts, $A );
	$butt_html .= '</a>';
	$butt_html .= '</div>';
	
	return apply_filters( 'sectionblock_feature_button_html', $butt_html, $atts, $A );
}