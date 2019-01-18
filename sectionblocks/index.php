<?php
/*
Plugin Name: Section & Feature Blocks
Plugin URI: https://github.com/rogerlos/section-block
Description: Adds "Section" and "Feature" blocks to WordPress editor. Work in Progress!
Version: 1.3.4
Author: Roger Los
Author URI: http://rogerlos.com
License: GPL2
*/

defined( 'ABSPATH' ) || exit;

global $SBLCK;

define( 'SECTIONBLOCK_SLUG', 'sectionblock' );
define( 'SECTIONBLOCK_FILE', __FILE__ );
define( 'SECTIONBLOCK_PATH', __DIR__ . '/' );

include SECTIONBLOCK_PATH . 'inc/index.php';

/*
 * Paths to JSON configuration arrays
 */
$paths = apply_filters( 'sectionblock_cfg_paths', [
	SECTIONBLOCK_PATH . 'cfg/',
	get_stylesheet_directory() . '/sectionblock/',
] );

// global configuration object, allows access to all configured JSON
$SBLCK = new \sectionblock\CFG( $paths );

// @todo: lang file

// filters blocks.json to check SBLCK->get( 'use' ) at the block level; needs to be done before anything else
\sectionblock\block_use();

// checks for PHP includes within cfg and, well, includes them
\sectionblock\includes();

// kick the whole thing off
sectionblock_init();

/**
 * Wordpress actions and filters.
 */
function sectionblock_init() {
	
	add_action( 'enqueue_block_assets', '\\sectionblock\\editor_scripts' );
	add_action( 'init', '\\sectionblock\\blocks' );
	add_action( 'init', '\\sectionblock\\rest\\field' );
	add_action( 'rest_api_init', '\\sectionblock\\rest\\endpoints' );
	add_action( 'wp_enqueue_scripts', '\\sectionblock\\front_scripts' );
	
	add_filter( 'block_categories', '\\sectionblock\\block_categories', 10, 2 );
}

