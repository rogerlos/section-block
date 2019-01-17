<?php

namespace sectionblock\rest;

/**
 * Callback for REST requests for posts list.
 *
 * @return array
 */
function callback_posts() {
	
	global $SBLCK;
	$P = $SBLCK->get( 'posts' );
	
	$posts_data = [];
	
	$args = [
			'post__not_in'   => get_option( 'sticky_posts' ),
			'posts_per_page' => - 1,
			'post_type'      => $P['types'],
			'orderby'        => [ 'type' => 'ASC', 'menu_order' => 'ASC', 'date' => 'DESC' ],
		];
	
	$posts = get_posts( apply_filters( 'sectionblock_posts_args', $args ) );
	
	foreach ( $posts as $post ) {
		
		$posts_data[] = (object) [
			'id'    => $post->ID,
			'slug'  => $post->post_name,
			'type'  => $post->post_type,
			'title' => $post->post_title,
		];
	}
	
	return apply_filters( 'sectionblock_posts_list', $posts_data );
}


/**
 * @param \WP_Rest_Request $request
 *
 * @return object
 */
function callback_post( $request ) {
	
	$id = $request->get_param( 'id' );
	
	if ( $id < 1 ) {
		return (object) [ 'error' => 'invalid id' ];
	}
	
	return get_post( $id );
}

/**
 * Rest endpoints
 */
function endpoints() {
	
	global $SBLCK;
	$rests = $SBLCK->get( 'rest' );
	
	foreach ( $rests as $rest ) {
		register_rest_route( $rest['namespace'], $rest['route'], [
				'methods'  => $rest['methods'],
				'callback' => $rest['callback'],
			//	'args'     => $rest['args'],
			]
		);
	}
}

/**
 * Registers rest fields
 */
function field() {
	
	global $SBLCK;
	$rests = $SBLCK->get( 'rest' );
	
	foreach ( $rests as $rest ) {
		if ( empty( $rest['meta'] ) ) {
			continue;
		}
		foreach ( $rest['meta'] as $meta ) {
			register_meta( 'post', $meta['name'], [
				'type'              => $meta['type'],
				'single'            => $meta['single'],
				'show_in_rest'      => $meta['show_in_rest'],
				'sanitize_callback' => $meta['sanitize_callback'],
			] );
		}
	}
}

/**
 * Gets post and sets useful-to-us properties on the object
 *
 * @param string|int $id Post ID from rest controller
 *
 * @return object
 */
function get_post( $id ) {
	
	$post = \get_post( $id );
	
	if ( ! $post ) {
		return (object) [ 'error' => 'post does not exist' ];
	}
	
	$thumb   = get_post_thumbnail_id( $id );
	$cats    = get_the_category( $id );
	$excerpt = ! empty( $post->post_excerpt ) ?
		$post->post_excerpt : wp_trim_words( wp_strip_all_tags( $post->post_content ) );
	
	$ret = (object) [
		'id'        => $id,
		'slug'      => $post->post_name,
		'type'      => $post->post_type,
		'title'     => $post->post_title,
		'img'       => (object) [
			'id'  => $thumb ? intval( $thumb ) : 0,
			'thumb' => $thumb ? get_the_post_thumbnail_url( $id, 'post-thumbnail' ) : '',
			'medium' => $thumb ? get_the_post_thumbnail_url( $id, 'medium' ) : '',
			'large' => $thumb ? get_the_post_thumbnail_url( $id, 'large' ) : '',
			'url' => $thumb ? get_the_post_thumbnail_url( $id ) : '',
			'alt' => $thumb ? get_post_meta( $thumb, '_wp_attachment_image_alt', TRUE ) : '',
		],
		'category'  => [
			'term' => ! empty( $cats ) ? $cats[0]->name : '',
			'slug' => ! empty( $cats ) ? $cats[0]->slug : '',
			'id'   => ! empty( $cats ) ? intval( $cats[0]->term_id ) : '',
			'tax'  => ! empty( $cats ) ? intval( $cats[0]->term_taxonomy_id ) : '',
		],
		'permalink' => get_the_permalink( $id ),
		'excerpt'   => $excerpt,
	];
	
	// allow filtering of object
	return apply_filters( 'sectionblock_rest_post_object', $ret, $id );
}

/**
 * Sanitizes integer values
 *
 * @param $meta_value
 *
 * @return int
 */
function sanitize_integer( $meta_value ) {
	
	return empty( $meta_value ) ? 0 : absint( $meta_value );
}