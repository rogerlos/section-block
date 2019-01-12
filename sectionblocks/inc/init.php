<?php

namespace sectionblock;

/**
 * Adds search category to blocks
 *
 * @param $categories
 *
 * @return array
 */
function block_categories( $categories ) {
	
	global $SBLCK;
	$cats = $SBLCK->get( 'blockcategories' );
	
	if ( ! function_exists( 'register_block_type' ) || empty( $cats ) ) {
		return $categories;
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
	
	// registers the shared JS scripts (equivalent to a component)
	foreach ( $SBLCK->get( 'common' ) as $common ) {
		wp_register_script(
			$common['handle'],
			plugins_url( $common['script'], SECTIONBLOCK_FILE ),
			$common['dependencies'],
			$common['version'] == '{{filemtime}}' ?
				filemtime( SECTIONBLOCK_PATH . $common['script'] ) : $common['version']
		);
		if ( ! empty( $common['local'] ) ) {
			wp_localize_script(
				$common['handle'],
				$common['local']['var'],
				$common['local']['data'] == '{{global}}' ? $SBLCK->get() : $common['local']['data']
			);
		}
	}
	
	// adds plugin sidebars, if configured
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
	
	// add blocks
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
					plugins_url( $style['script'], SECTIONBLOCK_FILE ),
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
 * Enqueue editor scripts. Checks to be sure plugin stylesheets were asked for
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
		
		if ( $SBLCK->get('plugin.use.sidebar.css' ) ) {
			foreach ( $sidebar['styles']['editor_style'] as $style ) {
				wp_enqueue_style( $style['handle'] );
			}
		}
	}
	
	foreach ( $SBLCK->get( 'blocks' ) as $type => $block ) {
		
		foreach ( $block['scripts']['editor_script'] as $script ) {
			wp_enqueue_script( $script['handle'] );
		}
		
		if ( $SBLCK->get('plugin.use.' . $type . '.css' ) ) {
			foreach ( $block['styles']['editor_style'] as $style ) {
				wp_enqueue_style( $style['handle'] );
			}
		}
	}
}

/**
 * Enqueues scripts on front end. Styles can be turned off via config
 */
function front_scripts() {
	
	global $SBLCK;
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	foreach ( $SBLCK->get( 'blocks' ) as $type => $block ) {
		
		foreach ( $block['scripts']['script'] as $script ) {
			wp_enqueue_script( $script['handle'] );
		}
		
		// checks to be sure the use of plugin stylesheets was desired
		if ( $SBLCK->get('plugin.use.' . $type . '.css' ) ) {
			foreach ( $block['styles']['style'] as $style ) {
				wp_enqueue_style( $style['handle'] );
			}
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
 * Adds PHP includes as set in config.
 */
function includes() {
	
	global $SBLCK;
	
	includes_add( $SBLCK->get() );
}

/**
 * Recursively looks for 'includes' keys in array and includes any files listed. It can find both files relative to
 * SECTIONBLOCK_PATH and files with the entire include path already added.
 *
 * [
 *   'includes' => 'my/file.php'
 * ]
 *
 * [
 *   'includes' => [
 *      '/path/to/my/file.php',
 *      'my/file.php'
 *   ]
 * ]
 *
 * @param $array
 */
function includes_add( $array ) {
	
	foreach ( $array as $key => $val ) {
		
		if ( $key === 'includes' ) {
			
			$val = is_array( $val ) ? $val : [ $val ];
			
			foreach ( $val as $inc ) {
				if ( file_exists( SECTIONBLOCK_PATH . $inc ) && is_file( SECTIONBLOCK_PATH . $inc ) ) {
					include( SECTIONBLOCK_PATH . $inc );
				} else if ( file_exists( $inc ) && is_file( $inc ) ) {
					include( $inc );
				}
			}
			
		} else if ( is_array( $val ) ) {
			
			includes_add( $val );
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