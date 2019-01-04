<?php

namespace sectionblock\rest;

/**
 * Callback for REST requests
 *
 */
function callback_posts() {
	
	global $SBLCK;
	$P = $SBLCK->get( 'posts' );
	
	$posts_data = [];
	
	$posts = get_posts( [
			'post__not_in'   => get_option( 'sticky_posts' ),
			'posts_per_page' => - 1,
			'post_type'      => $P['types'],
			'orderby'        => [ 'type' => 'ASC', 'menu_order' => 'ASC', 'date' => 'DESC' ],
		]
	);
	
	$type = '';
	
	foreach ( $posts as $post ) {
		
		$this_type = $post->post_type;
		
		if ( $type != $this_type ) {
			$posts_data[] = (object) [
				'id'    => 0,
				'slug'  => '',
				'type'  => '',
				'title' => ucfirst( $this_type ),
			];
			$type         = $this_type;
		}
		
		$posts_data[] = (object) [
			'id'    => $post->ID,
			'slug'  => $post->post_name,
			'type'  => $post->post_type,
			'title' => $post->post_title,
		];
	}
	
	return $posts_data;
}


/**
 * @param \WP_Rest_Request $request
 *
 * @return mixed|object
 */
function callback_post( $request ) {
	
	$id = $request->get_param( 'id' );
	
	if ( $id < 1 ) {
		return (object) [ 'error' => 'invalid id' ];
	}
	
	return \sectionblock\get_post( $id );
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
				'args'     => $rest['args'],
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
 * Sanitizes integer values
 *
 * @param $meta_value
 *
 * @return int
 */
function sanitize_integer( $meta_value ) {
	
	return empty( $meta_value ) ? 0 : absint( $meta_value );
}