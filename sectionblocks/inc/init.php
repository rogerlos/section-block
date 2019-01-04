<?php

namespace sectionblock;

/**
 * Adds search category to blocks
 *
 * @param $categories
 *
 * @return mixed
 */
function block_categories( $categories ) {
	
	global $SBLCK;
	$cats = $SBLCK->get( 'blockcategories' );
	
	if ( ! function_exists( 'register_block_type' ) || empty( $cats ) ) {
		return null;
	}
	
	return array_merge( $categories, $cats );
}

/**
 * Registers blocks and all scripts
 */
function blocks() {
	
	global $SBLCK;
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	foreach ( $SBLCK->get( 'common' ) as $common ) {
		wp_register_script(
			$common['handle'],
			plugins_url( $common['script'], SECTIONBLOCK_FILE ),
			$common['dependencies'],
			$common['version'] == '{{filemtime}}' ? filemtime( SECTIONBLOCK_PATH . $common['script'] ) : $common['version']
		);
		if ( ! empty( $common['local'] ) ) {
			wp_localize_script(
				$common['handle'],
				$common['local']['var'],
				$common['local']['data'] == '{{global}}' ? $SBLCK->get() : $common['local']['data']
			);
		}
	}
	
	foreach ( $SBLCK->get( 'sidebars' ) as $sidebar ) {
		foreach ( $sidebar['scripts'] as $type => $scripts ) {
			foreach ( $scripts as $script ) {
				wp_register_script(
					$script['handle'],
					plugins_url( $script['script'], SECTIONBLOCK_FILE ),
					$script['dependencies'],
					$script['version'] == '{{filemtime}}' ?
						filemtime( SECTIONBLOCK_PATH . $script['script'] ) : $script['version']
				);
			}
		}
	}
	
	foreach ( $SBLCK->get( 'blocks' ) as $block ) {
		
		$register_arguments = [];
		
		foreach ( $block['scripts'] as $type => $scripts ) {
			foreach ( $scripts as $key => $script ) {
				wp_register_script(
					$script['handle'],
					plugins_url( $script['script'], SECTIONBLOCK_FILE ),
					$script['dependencies'],
					$script['version'] == '{{filemtime}}' ?
						filemtime( SECTIONBLOCK_PATH . $script['script'] ) : $script['version']
				);
			}
		}
		foreach ( $block['styles'] as $type => $styles ) {
			foreach ( $styles as $key => $style ) {
				wp_register_style(
					$style['handle'],
					$style['script'],
					$style['dependencies'],
					$style['version']
				);
			}
		}
		
		foreach ( $block['callbacks'] as $call => $cb ) {
			$register_arguments[ $call ] = $cb;
		}
		
		register_block_type( SECTIONBLOCK_SLUG . '/' . $block['id'], $register_arguments );
	}
}

/**
 * Enqueue editor scripts
 */
function editor_scripts() {
	
	global $SBLCK;
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	foreach ( $SBLCK->get( 'common' ) as $script ) {
		wp_enqueue_script( $script['handle'] );
	}
	
	foreach ( $SBLCK->get( 'sidebars' ) as $sidebar ) {
		foreach ( $sidebar['scripts']['editor_script'] as $script ) {
			wp_enqueue_script( $script['handle'] );
		}
		foreach ( $sidebar['styles']['editor_style'] as $style ) {
			wp_enqueue_style( $style['handle'] );
		}
	}
	
	foreach ( $SBLCK->get( 'blocks' ) as $block ) {
		foreach ( $block['scripts']['editor_script'] as $script ) {
			wp_enqueue_script( $script['handle'] );
		}
		foreach ( $block['styles']['editor_style'] as $style ) {
			wp_enqueue_style( $style['handle'] );
		}
	}
}

/**
 * Enqueues scripts on front end
 */
function front_scripts() {
	
	global $SBLCK;
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	foreach ( $SBLCK->get( 'blocks' ) as $block ) {
		foreach ( $block['scripts']['script'] as $script ) {
			wp_enqueue_script( $script['handle'] );
		}
		foreach ( $block['styles']['style'] as $style ) {
			wp_enqueue_style( $style['handle'] );
		}
	}
	
}

/**
 * @param $id
 *
 * @return mixed
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
	
	return (object) [
		'id'        => $id,
		'slug'      => $post->post_name,
		'type'      => $post->post_type,
		'title'     => $post->post_title,
		'img'       => (object) [
			'id'  => $thumb ? intval( $thumb ) : 0,
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
}

/**
 * Handles any PHP includes needed
 */
function includes() {
	
	global $SBLCK;
	
	foreach ( $SBLCK->get() as $array ) {
		foreach ( $array as $item ) {
			if ( ! empty( $item['includes'] ) ) {
				foreach ( $item['includes'] as $inc ) {
					include( SECTIONBLOCK_PATH . $inc );
				}
			}
		}
	}
}

/**
 * Modifies script tags to allow modules
 *
 * @param $tag
 * @param $handle
 * @param $src
 *
 * @return string
 */
function module( $tag, $handle, $src ) {
	
	global $SBLCK;
	
	foreach ( $SBLCK->get( 'common' ) as $array ) {
		
		if ( empty( $array['module'] ) || $handle != $array['handle'] ) {
			continue;
		}
		
		$tag = '<script type="module" src="' . $src . '"></script>';
	}
	
	return $tag;
}