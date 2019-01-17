/**
 * @typedef {Object} SBLCK
 * @property {Object} CFG
 * @property {Object} CFG.background
 * @property {SLCT[]} CFG.background.blends
 * @property {SLCT[]} CFG.background.ghosts
 * @property {SLCT[]} CFG.background.ghostpos
 * @property {SLCT[]} CFG.background.overlay
 * @property {SLCT[]} CFG.background.attachment
 * @property {CLR[]} CFG.background.colors
 * @property {Object} CFG.use
 * @property {Object} CFG.use.item
 * @property {BACKER} CFG.use.item.background
 * @property {Object} CFG.use.section
 * @property {BACKER} CFG.use.section.background
 */

/**
 * @typedef {Object} SLCT
 * @property {String} key
 * @property {String} label
 * @property {String} value
 */

/**
 * @typedef {Object} CLR
 * @property {String} slug
 * @property {String} name
 * @property {String} color
 */

/**
 * @typedef {Object} BACKER
 * @property {Boolean} color
 * @property {Boolean} colorinline
 * @property {Boolean} ghost
 * @property {Boolean} image
 * @property {Boolean} position
 * @property {Boolean} attachment
 * @property {Boolean} size
 * @property {Boolean} overlay
 * @property {Boolean} repeat
 * @property {Boolean} blend
 */

( function ( SBLCK ) {

    const EL                                                                              = wp.element.createElement;
    const { PanelBody, PanelRow, RadioControl, RangeControl, SelectControl, TextControl } = wp.components;
    const { PanelColorSettings }                                                          = wp.editor;
    const { Fragment }                                                                    = wp.element;

    const USE = SBLCK.CFG.use;
    const PFX = 'sectionblock-';

    const VARS = SBLCK.CFG.background;

    let PROPS = {
        attachment : 'scroll',
        blend      : '',
        color      : {
            hex   : '',
            alpha : 100
        },
        ghost      : {
            img : '',
            pos : 'right'
        },
        image      : {
            src : '',
            alt : '',
            id  : 0
        },
        overlay    : {
            alpha : 100,
            beta  : 0,
            color : '',
            start : '',
            type  : ''
        },
        position   : {
            x : 0,
            y : 0
        },
        repeat     : 'no-repeat',
        size       : {
            keyword : 'cover',
            x       : 0,
            y       : 0
        },
        uploader   : {
            key    : '',
            change : null
        }
    };

    SBLCK.BG = {};

    SBLCK.BG.Attachment = function ( key, change, val ) {

        return EL(
            PanelRow,
            {
                key       : PFX + 'attachment-row',
                className : PFX + 'attachment-row ' + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-attachment-title',
                    className : PFX + 'overlay-attachment-title ' + PFX + 'inspector-title'
                },
                "Attachment"
            ),
            EL(
                RadioControl,
                {
                    key       : PFX + 'attachment-radio',
                    className : PFX + 'attachment ' + PFX + 'inspector-radio',
                    label     : "When Scrolling Page...",
                    selected  : val,
                    options   : VARS.attachment,
                    help      : "Default is 'Scroll'",
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    };

    SBLCK.BG.Blend = function ( key, change, val ) {

        return EL(
            PanelRow,
            {
                key       : 'bgblnd',
                className : PFX + "blend-row " + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-blend-title',
                    className : PFX + 'overlay-blend-title ' + PFX + 'inspector-title'
                },
                'Blend'
            ),
            EL(
                SelectControl,
                {
                    key       : "background-blend",
                    label     : "Mix Color and Image",
                    className : PFX + 'blend ' + PFX + 'inspector-select',
                    help      : "If a color and an image are both selected, you can add a filter to blend them.",
                    value     : val,
                    options   : VARS.blends,
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    };

    SBLCK.BG.Classes = function ( bg ) {
        let typ = SBLCK.BG.Type( bg );
        let ret;
        let col = bg.color;
        ret     = 'blend' === typ ? ' has-bg has-bg-image has-bg-color has-bg-blend ' : '';
        ret     = ! ret && 'image' === typ ? ' has-bg has-bg-image ' : ret;
        ret     = ! ret && 'color' === typ ? ' has-bg has-bg-color ' : ret;
        if ( ret && ret !== 'image' ) {
            VARS.colors.forEach( function ( e ) {
                if ( col === e.color ) {
                    ret += ' has-' + e.slug + '-background-color ';
                }
            } );
        }
        return ret;
    };

    SBLCK.BG.Color = function ( key, change, val ) {
        return EL(
            PanelColorSettings,
            {
                key           : 'bg-color',
                className     : PFX + 'color-panel ' + PFX + 'inspector-panel ' + PFX + 'inspector-color',
                title         : 'Background Color',
                initialOpen   : false,
                colorSettings : [
                    {
                        label    : 'Select a Color',
                        value    : val.hex,
                        onChange : val => {
                            change( 'hex', val, key )
                        }
                    }
                ]
            },
            EL(
                RangeControl,
                {
                    key       : 'bg-color-alp',
                    label     : "Transparency",
                    className : PFX + 'color-alpha ' + PFX + 'inspector-range',
                    help      : "Transparency of background color",
                    value     : val.alpha,
                    min       : 0,
                    max       : 100,
                    onChange  : val => {
                        change( 'alpha', val, key )
                    }
                }
            )
        )
    };

    SBLCK.BG.GetProps = function () {
        return PROPS;
    };

    SBLCK.BG.Ghost = function ( key, change, val ) {
        return EL(
            PanelRow,
            {
                key       : 'ghost-row',
                className : PFX + 'ghost-row ' + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-ghost-title',
                    className : PFX + 'overlay-ghost-title ' + PFX + 'inspector-title'
                },
                'Ornaments'
            ),
            EL(
                SelectControl,
                {
                    key       : "background-ghost-image",
                    className : PFX + 'ghost-image ' + PFX + 'inspector-select',
                    label     : "Image",
                    help      : "You can add an ornament to the background.",
                    value     : val.img,
                    options   : VARS.ghosts,
                    onChange  : val => {
                        change( 'img', val, key )
                    }
                }
            ),
            EL(
                RadioControl,
                {
                    key       : 'background-ghost-pos',
                    className : PFX + 'ghost-postion ' + PFX + 'radio-grid',
                    label     : "Position",
                    help      : "Choose where the ornament appears, always at the bottom of the container.",
                    selected  : val.pos,
                    options   : VARS.ghostpos,
                    onChange  : val => {
                        change( 'pos', val, key )
                    }
                }
            )
        )
    };

    SBLCK.BG.GhostDisplay = function ( bg ) {
        let where = typeof ( bg.ghost.pos ) === 'undefined' ? 'right' : bg.ghost.pos;
        if ( ! bg.ghost.img ) {
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
                    src : bg.ghost.img
                }
            )
        )
    };

    SBLCK.BG.Image = function ( key, val, change ) {
        return SBLCK.Image( val, key, change )
    };

    SBLCK.BG.InlineStyle = function ( type, bg ) {
        let use  = USE[ type ].background;
        let size = SBLCK.BG.SizeCalc( bg.size );
        size     = ! size && bg.size.keyword ? bg.size.keyword : size;
        let over = '';
        if ( bg.overlay.type ) {
            let alpha  = ! bg.overlay.alpha ? 0 : parseInt( bg.overlay.alpha );
            let beta   = ! bg.overlay.beta ? 0 : parseInt( bg.overlay.beta );
            let type   = bg.overlay.type;
            let start  = ! bg.overlay.start ? 'top' : bg.overlay.start;
            let color  = ! bg.overlay.color ? '#000000' : bg.overlay.color;
            alpha      = alpha < 0 ? 0 : alpha;
            alpha      = alpha > 100 ? 100 : alpha;
            beta       = beta < 0 ? 0 : beta;
            beta       = beta > 100 ? 100 : beta;
            let color1 = SBLCK.BG.ToRgba( color, alpha );
            let color2 = type === 'cover' ? color1 : SBLCK.BG.ToRgba( color, beta );
            let deg    = '180deg';
            switch ( start ) {
                case 'bottom':
                    deg = '0deg';
                    break;
                case 'left':
                    deg = '90deg';
                    break;
                case 'right':
                    deg = '270deg';
                    break;
            }
            switch ( type ) {
                case 'cover':
                case 'gradient':
                    over = 'linear-gradient(' + deg + ',' + color1 + ',' + color2 + '),';
                    break;
                case 'edges':
                    over = 'linear-gradient(0deg,' + color1 + ',' + color2 + ' 20%,' + color2 + '),';
                    over += 'linear-gradient(90deg,' + color1 + ',' + color2 + ' 20%,' + color2 + '),';
                    over += 'linear-gradient(180deg,' + color1 + ',' + color2 + ' 20%,' + color2 + '),';
                    over += 'linear-gradient(270deg,' + color1 + ',' + color2 + ' 20%,' + color2 + '),';
                    break;
            }
        }

        let c = bg.color.hex ? SBLCK.BG.ToRgba( bg.color.hex, bg.color.alpha ) : null;

        return {
            backgroundImage      : use.image && bg.image.url ? over + 'url(' + bg.image.url + ')' : null,
            backgroundSize       : use.size && bg.image.url && size ? size : null,
            backgroundRepeat     : use.repeat && bg.image.url && bg.repeat ? bg.repeat : null,
            backgroundAttachment : use.attachment && bg.image.url && bg.attachment ? bg.attachment : null,
            backgroundPosition   : use.position && bg.image.url && bg.position ? bg.position.x + ' ' + bg.position.y : null,
            backgroundBlendMode  : use.blend && bg.image.url && bg.blend ? bg.blend : null,
            backgroundColor      : use.color && use.colorinline && c ? c : null,
        };
    };

    SBLCK.BG.Inspector = function ( key, change, bg, I ) {

        let has            = bg.image.id > 0;
        bg.uploader.key    = key;
        bg.uploader.change = change;
        let use            = key === 'itemBackground' ? USE.item.background : USE.section.background;
        return (
            EL(
                Fragment,
                {
                    key : PFX + 'inspector',
                },
                use.color ? SBLCK.BG.Color( 'color', change, bg.color ) : null,
                use.ghost ? SBLCK.BG.Ghost( 'ghost', change, bg.ghost ) : null,
                EL(
                    PanelBody,
                    {
                        key         : PFX + 'inspector-background-image',
                        className   : PFX + 'inspector-background-image',
                        title       : 'Background Image',
                        initialOpen : false
                    },
                    use.image ? SBLCK.BG.Image( 'image', bg.image, change ) : null,
                    use.attachment && has ? SBLCK.BG.Attachment( 'attachment', change, bg.attachment ) : null,
                    use.position && has ? SBLCK.BG.Position( 'position', change, bg.position, I ) : null,
                    use.size && has ? SBLCK.BG.Size( 'size', change, bg.size ) : null,
                    use.blend && has ? SBLCK.BG.Blend( 'blend', change, bg.blend ) : null,
                    use.repeat && has ? SBLCK.BG.Repeat( 'repeat', change, bg.repeat ) : null,
                    use.overlay && has ? SBLCK.BG.Overlay( 'overlay', change, bg.overlay, bg ) : null,
                )
            )
        )
    };

    SBLCK.BG.Overlay = function ( key, change, val, bg ) {

        return EL(
            PanelColorSettings,
            {
                key           : 'bg-overlay-color',
                className     : PFX + 'overlay-panel ' + PFX + 'inspector-panel ' + PFX + 'inspector-color',
                title         : "Overlay Color",
                help          : "An overlay is laid on top of the background rather than being mixed with it, Iut will"
                    + " still be affected by the blend mode. The result can be use to decrease contrast or provide a"
                    + " gradient to fade the image in one direction.",
                initialOpen   : false,
                colorSettings : [
                    {
                        label    : 'Select a color',
                        value    : val,
                        onChange : val => {
                            change( key, val )
                        }
                    }
                ]
            },
            SBLCK.BG.OverlayOther( bg, change )
        )
    };

    SBLCK.BG.OverlayOther = function ( bg, change ) {

        if ( ! bg.image.id ) return;
        return EL(
            PanelRow,
            {
                key       : 'overlay-other-row',
                className : PFX + 'overlay-other-row ' + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-other-title',
                    className : PFX + 'overlay-other-title ' + PFX + 'inspector-title'
                },
                "Overlay Options"
            ),
            EL(
                SelectControl,
                {
                    key       : "background-overlay-type",
                    className : PFX + 'overlay-type ' + PFX + 'inspector-select',
                    label     : "Type",
                    help      : "Cover adds the chosen color over the entire image. Gradients apply the color at the "
                        + "chosen side and fade to transparent. Edges bring the gradient in from the edges to trasparent in the center.",
                    value     : bg.overlay.type,
                    options   : VARS.overlay,
                    onChange  : val => {
                        change( 'type', val, 'overlay' )
                    }
                }
            ),
            EL(
                RangeControl,
                {
                    key       : 'backgroundoverlaytc1',
                    label     : "Starting Transparency",
                    className : PFX + 'overlay-alpha-start ' + PFX + 'inspector-range',
                    help      : "Number from 0 to 100, as a percentage of how transparent the overlay will be.",
                    value     : bg.overlay.alpha,
                    min       : 0,
                    max       : 100,
                    onChange  : val => {
                        change( 'alpha', val, 'overlay' )
                    }
                }
            ),
            EL(
                RangeControl,
                {
                    key       : 'backgroundoverlaytc55',
                    label     : "Ending Transparency",
                    className : PFX + 'overlay-alpha-beta ' + PFX + 'inspector-range',
                    help      : "Gradient and Edge use this second value to set the end transparency of the gradient",
                    value     : bg.overlay.beta,
                    min       : 0,
                    max       : 100,
                    onChange  : val => {
                        change( 'beta', val, 'overlay' )
                    }
                }
            ),
            EL(
                RadioControl,
                {
                    key       : 'backgroundoverlaytc2',
                    className : PFX + 'overlay-start ' + PFX + 'inspector-radio',
                    label     : "Start Position",
                    help      : "Used for gradients, dictates the gradient start position",
                    selected  : bg.overlay.start,
                    options   : VARS.start,
                    onChange  : val => {
                        change( 'start', val, 'overlay' )
                    }
                }
            )
        )
    };

    SBLCK.BG.Position = function ( key, change, val ) {
        return (
            EL(
                PanelRow,
                {
                    key       : 'overlay-position-row',
                    className : PFX + 'overlay-position-row ' + PFX + 'inspector-row',
                },
                EL(
                    'p',
                    {
                        key       : 'overlay-position-title',
                        className : PFX + 'overlay-position-title ' + PFX + 'inspector-title'
                    },
                    "Position"
                ),
                EL(
                    TextControl,
                    {
                        key       : 'bgposwrapptc1',
                        label     : "Horizontal",
                        className : PFX + 'overlay-position-h ' + PFX + 'inspector-text',
                        help      : "Requires 'left', 'center', 'right' or CSS value (ex: 33%)",
                        value     : val.x,
                        onChange  : val => {
                            change( 'x', val, key )
                        }
                    }
                ),
                EL(
                    TextControl,
                    {
                        key       : 'bgposwrapptc2',
                        className : PFX + 'overlay-position-y ' + PFX + 'inspector-text',
                        label     : "Vertical",
                        help      : "Requires 'top', 'center', 'bottom' or CSS value",
                        value     : val.y,
                        onChange  : value => {
                            change( 'y', value, key )
                        }
                    }
                )
            )
        )
    };

    SBLCK.BG.Repeat = function ( key, change, val ) {

        EL(
            PanelRow,
            {
                key       : 'overlay-repeat-row',
                className : PFX + 'overlay-repeat-row ' + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-repeat-title',
                    className : PFX + 'overlay-repeat-title ' + PFX + 'inspector-title'
                },
                "Repeat"
            ),
            EL(
                RadioControl,
                {
                    key       : 'backgroundrepeat3',
                    className : PFX + 'overlay-repeat ' + PFX + 'inspector-radio',
                    label     : "Image will...",
                    selected  : val,
                    options   : VARS.repeat,
                    help      : "Default is 'repeat'",
                    onChange  : val => {
                        change( key, val )
                    }
                }
            )
        )
    };

    SBLCK.BG.Size = function ( key, change, val ) {
        return EL(
            PanelRow,
            {
                key       : 'size-row',
                className : PFX + 'size-row ' + PFX + 'inspector-row',
            },
            EL(
                'p',
                {
                    key       : 'overlay-size-title',
                    className : PFX + 'overlay-size-title ' + PFX + 'inspector-title'
                },
                "Size"
            ),
            EL(
                RadioControl,
                {
                    key       : 'backgroundsizeretrc',
                    className : PFX + 'size-keyword ' + PFX + 'inspector-radio',
                    label     : "Size by Keyword",
                    selected  : val.keyword,
                    options   : VARS.size,
                    help      : "If 'None' is selected, you should use the measurement fields below, this field "
                        + "overrides choices below",
                    onChange  : val => {
                        change( 'size', val, key )
                    }
                }
            ),
            EL(
                TextControl,
                {
                    key       : 'backgroundsizerettc1',
                    className : PFX + 'size-x ' + PFX + 'inspector-text',
                    label     : "Horizontal Size",
                    help      : "Requires legitimate CSS size value; if Vertical is not filled out, this "
                        + "value is applied to both dimensions",
                    value     : val.x,
                    onChange  : val => {
                        change( 'x', val, key )
                    }
                }
            ),
            EL(
                TextControl,
                {
                    key       : 'backgroundsizerettc2',
                    className : PFX + 'size-y ' + PFX + 'inspector-text',
                    label     : "Vertical Size",
                    help      : "Requires legitimate CSS size value; not used if Horizontal is blank",
                    value     : val.y,
                    onChange  : val => {
                        change( 'y', val, key )
                    }
                }
            )
        )
    };

    SBLCK.BG.SizeCalc = function ( size ) {
        let ret = '';
        ret     = size.x && size.y ? size.x + ' ' + size.y : ret;
        ret     = size.x ? size.x : ret;
        return ret;
    };

    SBLCK.BG.ToRgba = function ( color, opacity, css ) {
        let rgb = color.match( /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i );
        rgb     = ! rgb ?
            color.match( /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i )
                .slice( 1, 4 ).map( function ( x ) {
                return 0x11 * parseInt( x, 16 );
            } ) :
            rgb.slice( 1, 4 ).map( function ( x ) {
                return parseInt( x, 16 );
            } );
        opacity = typeof ( opacity ) === 'undefined' ? 1 : parseFloat( opacity );
        opacity = opacity > 100 ? 1 : opacity;
        opacity = opacity > 1 ? opacity / 100 : opacity;
        rgb.push( opacity );
        if ( typeof ( css ) === 'undefined' || css ) {
            return 'rgba( ' + rgb.join() + ')';
        } else {
            return rgb;
        }
    };

    SBLCK.BG.Type = function ( bg ) {
        let type = null;
        if ( bg.color && bg.image.url && bg.blend ) {
            type = 'blend';
        } else if ( bg.image.url ) {
            type = 'image';
        } else if ( bg.color ) {
            type = 'color';
        }
        return type;
    };


}( window.SBLCK = window.SBLCK || {} ) );