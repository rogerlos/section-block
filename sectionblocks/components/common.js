/**
 * @typedef {Object} SBLCK
 */

/**
 * Some values used unaltered by all items, plus a common method to get images from WP
 */
function SBLCK_COMMON() {

    const EL                        = wp.element.createElement;
    const { IconButton, PanelBody } = wp.components;
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
const SBLCK_BUCKET = new SBLCK_BUCK();

SBLCK_BUCKET.init();