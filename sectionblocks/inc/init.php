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
 * Removes blocks disabled with 'use'
 */
function block_use() {
	
	global $SBLCK;
	
	$blocks = $SBLCK->get('blocks');

	foreach( $blocks as $key => $cfg ) {
		if ( ! $SBLCK->get( 'use.' . $key . '.use' ) ) {
			$SBLCK->remove( 'blocks', $key );
		}
	}
}

/**
 * Registers blocks and all scripts
 */
function blocks() {
	
	global $SBLCK;
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	// add any configured colors to the background vars colors
	if ( ! empty( $SBLCK->get( 'colors' ) ) ) {
		$SBLCK->set( 'background.colors', $SBLCK->get( 'colors' ) );
	}
	
	$SCR = scripts_array( 'all' );
	
	register_scripts( $SCR['scripts'] );
	register_styles( $SCR['styles'] );
	
	foreach ( $SBLCK->get( 'blocks' ) as $block ) {
		
		$register_arguments = [];
		
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
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	enqueue( 'editor' );
}

/**
 * Enqueues registered scripts.
 *
 * @param string $where
 */
function enqueue( $where = '' ) {
	
	$SCR = scripts_array( $where );
	
	foreach ( $SCR['scripts'] as $script ) {
		wp_enqueue_script( $script['handle'] );
	}
	
	foreach ( $SCR['styles'] as $style ) {
		wp_enqueue_style( $style['handle'] );
	}
}

/**
 * Enqueues scripts on front end. Styles can be turned off via config
 */
function front_scripts() {
	
	if ( ! function_exists( 'register_block_type' ) ) {
		return;
	}
	
	enqueue();
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

function lang( $paths ) {
	
	global $SBLCK;
	
	if ( empty( $paths ) ) {
		return;
	}
	
}

/**
 * Registers scripts. $cfg is an array as below, can also be empty.
 *
 * [
 *   'script' => [
 *      [], [], [] ... script config arrays
 *   ],
 *   'editor_script' => [
 *      [], [], [] ... script config arrays
 *   ]
 * ]
 *
 * @param $scripts
 */
function register_scripts( $scripts ) {
	
	global $SBLCK;
	
	foreach ( $scripts as $script ) {
		
		wp_register_script(
			$script['handle'],
			plugins_url( $script['script'], SECTIONBLOCK_FILE ),
			$script['dependencies'],
			$script['version'] == '{{filemtime}}' ?
				filemtime( SECTIONBLOCK_PATH . $script['script'] ) : $script['version']
		);
		
		if ( ! empty( $script['local'] ) ) {
			wp_localize_script(
				$script['handle'],
				$script['local']['var'],
				$script['local']['data'] == '{{global}}' ? [ 'CFG' => $SBLCK->get() ] : $script['local']['data']
			);
		}
	}
}

/**
 * Registers styles. $cfg is an array as below, can also be empty.
 *
 * [
 *   'style' => [
 *      [], [], [] ... script config arrays
 *   ],
 *   'editor_style' => [
 *      [], [], [] ... script config arrays
 *   ]
 * ]
 *
 * @param $styles
 */
function register_styles( $styles ) {
	
	foreach ( $styles as $style ) {
		
		wp_register_style(
			$style['handle'],
			plugins_url( $style['script'], SECTIONBLOCK_FILE ),
			$style['dependencies'],
			$style['version']
		);
	}
}

/**
 * Builds array of scripts to be registered or enqueued
 *
 * @param string $where empty for public, 'editor' for editor, 'all' returns all
 *
 * @return array
 */
function scripts_array( $where = '' ) {
	
	global $SBLCK;
	
	$ret = [
		'scripts' => [],
		'styles'  => [],
	];
	
	if ( $where == 'all' ) {
		$ret   = scripts_array( 'editor' );
		$where = '';
	}
	
	$prefix = $where ? $where . '_' : '';
	
	$find = [
		'scripts' => scripts_find( $SBLCK->get(), $prefix . 'script' ),
		'styles'  => scripts_find( $SBLCK->get(), $prefix . 'style' ),
	];
	
	$ret = array_merge_recursive( $ret, $find );
	
	return $ret;
}

/**
 * Finds scripts in array, looking for the 'key'. $required contains keys which must be present in found script
 * config array.
 *
 * @param $array
 * @param $key
 *
 * @return array
 */
function scripts_find( $array, $key ) {
	
	$ret      = [];
	$required = [ 'handle', 'script' ];
	
	foreach ( $array as $array_key => $value ) {
		
		if ( $array_key === $key && is_array( $value ) ) {
			
			foreach ( $value as $k => $v ) {
				foreach ( $required as $req ) {
					if ( empty( $v[ $req ] ) ) {
						unset( $value[ $k ] );
					}
					break;
				}
			}
			
			if ( ! empty( $value ) ) {
				$ret = array_merge( array_values( $value ), $ret );
			}
			
		} else if ( is_array( $value ) ) {
			
			$recurse = scripts_find( $value, $key );
			
			if ( ! empty( $recurse ) ) {
				$ret = array_merge( $recurse, $ret );
			}
		}
	}
	
	return $ret;
}