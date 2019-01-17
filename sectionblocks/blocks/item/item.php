<?php

namespace sectionblock\item;

function render() {
	
	global $SBLCK;
	
	$args = func_get_args();
	$atts = $args[0];
	$id   = ! empty( $atts['id'] ) ? $atts['id'] : 0;
	
	$posted = intval( $id ) > 0 ? \sectionblock\rest\get_post( $id ) : [];
	
	$lock = [
		'img'   => ! empty( $atts['itemLockImage'] ),
		'title' => ! empty( $atts['itemLockTitle'] ),
		'label' => ! empty( $atts['itemLockLabel'] ),
		'text'  => ! empty( $atts['itemLockText'] ),
		'link'  => ! empty( $atts['itemLockLink'] ),
	];
	
	$edit = [
		'img'    => ! empty( $atts['itemImage'] ) ? $atts['itemImage'] : '',
		'title'  => ! empty( $atts['itemTitle'] ) ? $atts['itemTitle'] : '',
		'label'  => ! empty( $atts['itemLabel'] ) ? $atts['itemLabel'] : '',
		'text'   => ! empty( $atts['itemText'] ) ? $atts['itemText'] : '',
		'link'   => ! empty( $atts['itemLink'] ) ? $atts['itemLink'] : '',
		'button' => ! empty( $atts['itemButton'] ) ? $atts['itemButton'] : '',
	];
	
	$post = [
		'img'   => ! empty( $posted->img ) ? $posted->img : '',
		'title' => ! empty( $posted->title ) ? $posted->title : '',
		'label' => ! empty( $posted->category ) ? $posted->category['term'] : '',
		'text'  => ! empty( $posted->excerpt ) ? $posted->excerpt : '',
		'link'  => ! empty( $posted->permalink ) ? $posted->permalink : '',
	];
	
	$con = [
		'img'    => ! $lock['img'] ? $edit['img'] : $post['img'],
		'title'  => ! $lock['title'] ? $edit['title'] : $post['title'],
		'label'  => ! $lock['label'] ? $edit['label'] : $post['label'],
		'text'   => ! $lock['text'] ? $edit['text'] : $post['text'],
		'link'   => ! $lock['link'] ? $edit['link'] : $post['link'],
		'button' => $edit['button'],
	];
	
	$link = [
		'img'   => empty( $atts['itemLinkImage'] ),
		'label' => empty( $atts['itemLinkLabel'] ),
		'title' => empty( $atts['itemLinkTitle'] ),
	];
	
	$a_target = ! empty( $atts['itemLinkNew'] ) ? ' target="_blank"' : '';
	$a        = '<a href="' . $con['link'] . '"' . $a_target . '>';
	
	$tag = [
		'class' => [
			'gut' => 'wp-blocks-' . SECTIONBLOCK_SLUG . '-item',
			'slg' => SECTIONBLOCK_SLUG . '-item',
			'bg'  => ! empty( $atts['itemBackground'] ) ? \sectionblock\background\classes( $atts['itemBackground'] ) : '',
		],
		'style' => ! empty( $atts['itemBackground'] ) ? \sectionblock\background\style( $atts['itemBackground'] ) : '',
	];
	
	$html = '<div class="' . implode( ' ', $tag['class'] ) . '"' . $tag['style'] . '>';
	
	// adds the ghosted image
	$html .= ! empty( $atts['itemBackground'] ) ? \sectionblock\background\ghost( $atts['itemBackground'] ) : '';
	
	$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner">';
	
	$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-image">';
	
	if ( ! empty( $con['img']['url'] ) ) {
		
		$imgclass = ! empty( $atts['itemImageV'] ) ? ' ' . SECTIONBLOCK_SLUG . '-align-v-' . $atts['itemImageV'] : '';
		$imgclass .= ! empty( $atts['itemImageH'] ) ? ' ' . SECTIONBLOCK_SLUG . '-align-h-' . $atts['itemImageH'] : '';
		
		$html .= '<span class="' . SECTIONBLOCK_SLUG . '-main-inner-image-inner' . $imgclass . '">';
		
		$html .= $link['img'] ? $a : '';
		$html .= '<img src="' . $con['img']['url'] . '" alt="' . $con['img']['alt'] . '">';
		
		// adds a div with the gradient overlay if selected
		if ( ! empty( $atts['itemImageOverlay'] ) ) {
			
			$sty = call_user_func( $SBLCK->get('plugin.image_overlay_call' ) );
			
			if ( $sty ) {
				$sty = substr( $sty, 0, -1 );
				$html .= '<div class="' . SECTIONBLOCK_SLUG . '-image-overlay" style="background:' . $sty . ';"></div>';
			}
		}
		
		$html .= $link['img'] ? '</a>' : '';
		
		$html .= '</span>';
	}
	
	$html .= '</div>';
	
	$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-text">';
	
	if ( $con['title'] ) {
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-text-headline">';
		$html .= $link['title'] ? $a : '';
		$html .= '<h4 class="' . SECTIONBLOCK_SLUG . '-item-title">' . $con['title'] . '</h4>';
		$html .= $link['title'] ? '</a>' : '';
		$html .= '</div>';
	}
	
	if ( $con['label'] ) {
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-text-label">';
		$html .= $link['label'] ? $a : '';
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-item-label"><p>' . $con['label'] . '</p></div>';
		$html .= $link['label'] ? '</a>' : '';
		$html .= '</div>';
	}
	
	
	if ( $con['text'] ) {
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-text-excerpt">';
		$html .= '<p class="' . SECTIONBLOCK_SLUG . '-item-text">' . $con['text'] . '</p>';
		$html .= '</div>';
	}
	
	if ( $con['button'] ) {
		$html .= '<div class="' . SECTIONBLOCK_SLUG . '-main-inner-text-button">';
		$html .= '<a href="' . $con['link'] . '"' . $a_target . ' class="' . SECTIONBLOCK_SLUG . '-item-button">';
		$html .= $con['button'];
		$html .= '</a>';
		$html .= '</div>';
	}
	
	$html .= '</div>';
	$html .= '</div>';
	$html .= '</div>';
	
	return $html;
}