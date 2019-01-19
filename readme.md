# Sectionblock
Two blocks for WordPress:

* Section allows the creation of sections to hold other content
* Feature allows creation of a widget-like block to highlight site content

This is a work in progress and is rapidly changing!

## JSON Config
Themes can place a `sectionblock` directory in root of their theme. Any JSON files within it will 
replace same-named JSON files in the plugin's `cfg` directory.

Do so at your own risk! The plugin will not work if critical JSON is overwritten. 
Of particular interest will be:

* `selects.json`, which contains the values in select dropdowns
* `use.json`, which allows toggling features on and off
* `background.json`, which sets the choices for many background options
* `colors.json`, which allows the plugin to leverage colors you define

## Filters
A list of the filters will hit the wiki at some point.

## To Do
* The posts selector in the Feature block is a simple dropdown, which is kind of garbage. 
I really haven't found a great alternative which doesn't requiring roll up or doesn't 
allow selecting more than one post. If safari supported the HTML `datalist` feature, 
we'd be set...but that's safari for ya...
* I have not created the "out of the box" styles yet.
* A basic "dimensions" panel should probably be added for users who are not theme authors.
* Similarly, there should probably be a "flex" panel. This can be really complex, and so this
plugin will only offer a bare-bones set of configurations.
* Code optimization is so-so at the moment.
* Need to finish language integration.

## Components
I really don't care for JSX or NPM...hence Sectionblock's equivalent to components  are namespaced 
functions. (The global exists as an artifact of localizing some values from WordPress, so I 
figured that was easy enough to piggyback on for my needs.)

* `bg.js` adds all of the inspector background property config tools
* `common.js` handles getting a list of posts from WP
* `editor.js` takes my field JSON and turns it into react components. Except not that magically.
* `image.js` interacts with the media library to get and display an image

## Installation
As a WordPress plugin, just upload to your plugins directory and activate. If you want to use this as 
a library in your own plugin or theme, be sure to include `index.php` in the root and call 
`sectionblock_init()`.