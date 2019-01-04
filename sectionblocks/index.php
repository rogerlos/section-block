<?php
/*
Plugin Name: Section Blocks
Plugin URI:
Description: Adds section and item blocks to editor
Version: 1.3
Author: Roger Los
Author URI:
License: GPL2
*/

defined( 'ABSPATH' ) || exit;

global $SBLCK;

define( 'SECTIONBLOCK_SLUG', 'sectionblock' );
define( 'SECTIONBLOCK_FILE', __FILE__ );
define( 'SECTIONBLOCK_PATH', __DIR__ . '/' );

include SECTIONBLOCK_PATH . 'cfg/CFG.php';
include SECTIONBLOCK_PATH . 'inc/background.php';
include SECTIONBLOCK_PATH . 'inc/init.php';
include SECTIONBLOCK_PATH . 'inc/rest.php';
include SECTIONBLOCK_PATH . 'inc/util.php';

// allows themes to set JSON config, usually for "selects"
$paths = [
	SECTIONBLOCK_PATH . 'cfg/',
	get_stylesheet_directory() . '/sectionblock/',
];

$SBLCK = new \sectionblock\CFG( SECTIONBLOCK_PATH . 'cfg/' );

\sectionblock\includes();

add_action( 'enqueue_block_assets', '\\sectionblock\\editor_scripts' );
add_action( 'init', '\\sectionblock\\blocks' );
add_action( 'init', '\\sectionblock\\rest\\field' );
add_action( 'rest_api_init', '\\sectionblock\\rest\\endpoints' );
add_action( 'wp_enqueue_scripts', '\\sectionblock\\front_scripts' );

add_filter( 'block_categories', '\\sectionblock\\block_categories', 10, 2 );
add_filter( 'script_loader_tag', '\\sectionblock\\module', 10, 3 );