# Section Blocks
Adds blocks which allow creation of sections.

## JSON Config
Themes can place `sectionblock` directory in root of their theme. Any JSON files within it will 
replace similarly-named JSON files in the plugin `cfg` directory.

Do so at your own risk! The plugin will not work if critical JSON is overwritten. 
Of particular interest will be:

* `selects.json`, which contains the values in select dropdowns
* `use.json`, which allows toggling features on and off
* `background.json`, which sets the choices for many background options

## Filters
A list of the filters will hit the wiki at some point.

## Needs Work
The posts selector is a simple dropdown, which is kind of garbage. I really haven't found a
great alternative which doesn't requiring roll up or doesn't allow selecting more than one
post. If safari supported the HTML `datalist` feature, we'd be set...but it is safari.

## Components
I really don't care for JSX or NPM...hence Sectionblock's equivalent to components  are namespaced 
functions. (The global exists as an artifact of localizing some values from WordPress, so I 
figured that was easy enough to piggyback on for my needs.)

* `bg.js` adds all of the inspector background property config tools
* `common.js` handles getting a list of posts from WP
* `editor.js` takes my field JSON and turns it into react components. Except not that magically.
* `image.js` interacts with the media library to get and display an image

## Installation
Just like a normal WordPress plugin.