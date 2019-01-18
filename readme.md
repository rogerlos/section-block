# Section Blocks
Adds blocks which allow creation of sections.

## JSON Config
Themes can place `sectionblock` directory in root of their theme. Any JSON files within it will 
replace similarly-named JSON files in the plugin `cfg` directory.

Do so at your own risk! The plugin will not work if critical JSON is overwritten.

Of particular interest will be:

* `selects.json`, which contains the values in select dropdowns
* `plugin.json`, which allows toggling some features in the `use` object
* `background.json`, which sets all of the many and varied background options