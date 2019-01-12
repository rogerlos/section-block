/**
 * @typedef {Object} SBLCK
 */

/**
 * Some values used unaltered by all items, plus a common method to get images from WP
 */
function SBLCK_COMMON() {

    const EL                        = wp.element.createElement;
    const { IconButton, PanelBody, RadioControl, TextControl, ToggleControl } = wp.components;
    const { MediaUpload }           = wp.editor;

    this.image = function ( img, key, change, label ) {
        label = typeof( label ) === 'undefined' ? 'Background Image' : label;
        img   = typeof( img ) === 'undefined' ? { id : 0 } : img;
        if ( img.id < 1 ) {
            return (
                EL(
                    PanelBody,
                    { key : 'image-wrapper', className : 'image-wrapper', title : label, initialOpen : true },
                    EL(
                        MediaUpload,
                        {
                            key         : 'image-mediaupload',
                            buttonProps : {
                                className : "components-button button button-large"
                            },
                            onSelect    : function ( val ) {
                                change( key, val )
                            },
                            type        : "image",
                            value       : "",
                            render      : function ( { open } ) {
                                return [
                                    EL(
                                        IconButton,
                                        {
                                            key     : 'image-buttonopen',
                                            icon    : 'format-image',
                                            label   : 'Upload Image',
                                            onClick : open
                                        }
                                    )
                                ]
                            }
                        }
                    )
                )
            )
        }
        return (
            EL(
                PanelBody,
                { key : 'hasimagewrapper', className : "image-wrapper", initialOpen : true, title : label },
                EL(
                    'img',
                    { key : 'hasimageimg', src : img.url, alt : img.alt }
                ),
                EL(
                    'div',
                    { key : 'hasimagewrapperdiv', className : "media-button-wrapper" },
                    EL(
                        IconButton,
                        {
                            key     : 'hasimagebutton',
                            icon    : 'no',
                            label   : 'Remove Image',
                            onClick : function () {
                                change( key, { id : 0, url : '', alt : '' } )
                            }
                        }
                    )
                )
            )
        )
    };

    this.random = function ( min, max ) {

        min = typeof( min ) === 'undefined' ? 1000 : min;
        max = typeof( max ) === 'undefined' ? 9999 : max;

        return Math.random() * ( max - min ) + min;
    };

    this.ghost = function ( itemBackground ) {

        if ( typeof ( itemBackground ) === 'undefined' || typeof ( itemBackground.ghost ) === 'undefined' ) {
            return null
        }

        let where = typeof ( itemBackground.ghost.pos ) === 'undefined' ? 'right' : itemBackground.ghost.pos;

        if ( ! itemBackground.ghost.img ) {
            return null
        }

        return EL(
            'div',
            {
                className : 'sectionblock-ghost sectionblock-ghost-' + where
            },
            EL(
                'img',
                {
                    src : SBLCK_STORE[ itemBackground.ghost.img ]
                }
            )
        )
    };

    this.inspector_radio = function ( key, field, change, BLK ) {
        return (
            EL(
                RadioControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + this.random,
                    label     : BLK.cfg.attributes[ key ].label,
                    help      : BLK.cfg.attributes[ key ].help,
                    options   : BLK.cfg.attributes[ key ].options,
                    selected  : field,
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    };

    this.inspector_text = function ( key, field, change, BLK ) {
        return (
            EL(
                TextControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + this.random,
                    label     : BLK.cfg.attributes[ key ].label,
                    help      : BLK.cfg.attributes[ key ].help,
                    value     : field,
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    };

    this.inspector_toggle = function ( key, field, change, BLK ) {

        return (
            EL(
                ToggleControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + this.random,
                    label     : BLK.cfg.attributes[ key ].label,
                    help      : BLK.cfg.attributes[ key ].help,
                    checked   : field,
                    onChange  : checked => {
                        change( key, checked )
                    }
                }
            )
        )
    };

    this.inspector_wp = function ( key, change, post, BLK ) {

        let val   = post[ BLK.inspector.wp[ key ].dynamic ].length ? post[ BLK.inspector.wp[ key ].dynamic ] : '';
        let label = typeof ( BLK.inspector.wp[ key ].label ) === 'string' ? BLK.inspector.wp[ key ].label : '';
        let ran   = this.random;

        return (
            EL(
                'p',
                {
                    key       : 'sectionblock-wp-post-value-' + key + ran,
                    className : 'sectionblock-wp-post-value'
                },
                label,
                EL(
                    'span',
                    {
                        key       : BLK.inspector.wp[ key ].className + ran,
                        className : BLK.inspector.wp[ key ].className
                    },
                    val
                ),
                val ?
                    EL(
                        Button,
                        {
                            key       : BLK.inspector.wp[ key ].className + '-button' + ran,
                            className : BLK.inspector.wp[ key ].className + '-button is-button',
                            onClick   : function () {
                                change( BLK.inspector.wp[ key ].item, val )
                            }
                        },
                        'Copy ' + key + ' to editor'
                    ) : null
            )
        )
    };

    this.inspector_wp_image = function ( key, change, post, BLK ) {

        let val   = post.img.url.length ? post.img : { id : 0, url : '', alt : '' };
        let src   = val.url ? val.url : '';
        let label = typeof ( BLK.inspector.wp[ key ].label ) === 'string' ? BLK.inspector.wp[ key ].label : '';
        let ran   = this.random;

        return (
            EL(
                'p',
                {
                    key       : 'sectionblock-wp-post-value-' + key + ran,
                    className : 'sectionblock-wp-post-value'
                },
                label,
                src ?
                    EL(
                        'img',
                        {
                            key       : BLK.inspector.wp[ key ].className + ran,
                            className : BLK.inspector.wp[ key ].className,
                            src       : src,
                        }
                    ) : null,
                src ?
                    EL(
                        Button,
                        {
                            key       : BLK.inspector.wp[ key ].className + '-button' + ran,
                            className : BLK.inspector.wp[ key ].className + '-button is-button',
                            onClick   : function () {
                                change( BLK.inspector.wp[ key ].item, val )
                            }
                        },
                        'Copy image to editor'
                    ) : null
            )
        )
    };

    this.panel_atts = function ( panel, BLK ) {
        return {
            initialOpen : BLK.inspector.panels[ panel ].initialOpen,
            className   : BLK.inspector.panels[ panel ].className,
            title       : BLK.inspector.panels[ panel ].title
        }
    };

    this.panel_desc = function ( panel, BLK ) {
        return EL(
            'p',
            {},
            BLK.inspector.panels[ panel ].desc
        )
    };
}

/**
 * Does a pre-grab of the posts which can populate the posts drop-down
 *
 * @constructor
 */
function SBLCK_BUCK() {

    this.BUCK   = this;
    this.get_posts = function () {
        let gettem = [];
        return new Promise(
            function ( resolve ) {
                wp.apiFetch( { path : '/wp/v2/types' } ).then(
                    function ( types ) {
                        SBLCK.posts.types.forEach(
                            function ( el ) {
                                if ( typeof( types[ el ] ) !== 'undefined' )
                                    gettem.push( el );
                            }
                        )
                    }
                ).then(
                    wp.apiFetch( { path : SBLCK.plugin.routes.posts } ).then(
                        function ( res ) {
                            resolve( res )
                        }
                    )
                )
            }
        )
    };

    this.post_selector_opts = function () {
        let BUCK = this.BUCK;
        return new Promise(
            function ( resolve ) {
                BUCK.get_posts().then(
                    function ( posts ) {
                        let opts = [ { key : 'postnone', label : 'Select a Post', value : 0 } ];
                        for ( const P of posts ) {
                            opts.push( { key : P.slug, label : P.title, value : P.id } );
                        }
                        resolve( opts );
                    }
                )
            }
        )
    };

    this.init = function () {
        this.post_selector_opts().then( opts => {
            SBLCK_POSTS.posts = opts;
        } )
    }
}

/**
 * Holds the posts list
 *
 */
const SBLCK_POSTS = {
    posts : []
};

/**
 * Data store for items blocks to use for their "constant" values
 *
 * @type {{}}
 */
const SBLCK_STORE = {};

/**
 * Triggers the fetching of the posts list
 * @type {SBLCK_BUCK}
 */
const SBLCK_SECTION = new SBLCK_BUCK();

SBLCK_SECTION.init();