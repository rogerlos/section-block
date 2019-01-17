<?php
/*
Plugin Name: Section Blocks
Plugin URI:
Description: Adds "section" and "item" blocks to editor
Version: 1.3.2
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

$paths = apply_filters( 'sectionblock_cfg_paths', [
	SECTIONBLOCK_PATH . 'cfg/',
	get_stylesheet_directory() . '/sectionblock/',
] );

$SBLCK = new \sectionblock\CFG( $paths );

// @todo: lang file


\sectionblock\block_use();
\sectionblock\includes();

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

sectionblock_init();