/**
 * @typedef {Object} SBLCK
 * @property {Object} background
 * @property {SLCT[]} background.blends
 * @property {SLCT[]} background.ghosts
 * @property {SLCT[]} background.ghostpos
 * @property {SLCT[]} background.overlay
 * @property {SLCT[]} background.attachment
 * @property {CLR[]} background.colors
 * @property {Object} plugin
 * @property {Object} plugin.use
 * @property {Object} plugin.use.item
 * @property {BACKER} plugin.use.item.background
 * @property {Object} plugin.use.section
 * @property {BACKER} plugin.use.section.background
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

function BACKGROUND() {

    const EL                                                      = wp.element.createElement;
    const { PanelBody, RadioControl, SelectControl, TextControl } = wp.components;
    const { PanelColorSettings }                                  = wp.editor;

    const USE = SBLCK.plugin.use;

    this.COMMON = new SBLCK_COMMON();

    this.attachment = 'scroll';
    this.blend      = '';
    this.color      = '';
    this.ghost      = {
        img : '',
        pos : 'right'
    };
    this.image      = {
        src : '',
        alt : '',
        id  : 0
    };
    this.overlay    = {
        alpha : 0,
        color : '#000000',
        start : '',
        type  : ''
    };
    this.position   = {
        x : 0,
        y : 0
    };
    this.repeat     = 'no-repeat';
    this.size       = {
        keyword : 'cover',
        x       : 0,
        y       : 0
    };
    this.vars       = SBLCK.background;

    this.uploader = {
        key    : '',
        change : null
    };

    this.assign = function ( $obj ) {

        if ( typeof( $obj ) !== 'object' ) return;

        if ( $obj.hasOwnProperty( 'attachment' ) ) this.attachment = $obj.attachment;
        if ( $obj.hasOwnProperty( 'blend' ) ) this.blend = $obj.blend;
        if ( $obj.hasOwnProperty( 'color' ) ) this.color = $obj.color;
        if ( $obj.hasOwnProperty( 'ghost' ) ) this.ghost = $obj.ghost;
        if ( $obj.hasOwnProperty( 'image' ) ) this.image = $obj.image;
        if ( $obj.hasOwnProperty( 'overlay' ) ) this.overlay = $obj.overlay;
        if ( $obj.hasOwnProperty( 'position' ) ) this.position = $obj.position;
        if ( $obj.hasOwnProperty( 'repeat' ) ) this.repeat = $obj.repeat;
        if ( $obj.hasOwnProperty( 'size' ) ) this.size = $obj.size;
    };

    this.class = function () {
        return this.Classes();
    };

    this.inspector = function ( key, change, img ) {

        img                  = typeof( img ) === 'undefined' ? false : img;
        let has              = img && img.id > 0;
        this.uploader.key    = key;
        this.uploader.change = change;

        let use = key === 'itemBackground' ? USE.item.background : USE.section.background;

        return (
            EL(
                wp.element.Fragment,
                {
                    key : 'bg-inspector'
                },
                use.color ? this.Color( key, change ) : null,
                use.ghost ? this.Ghost( key, change ) : null,
                use.image && img ? this.Image( img ) : null,
                use.attachment && has ? this.Attachment( key, change ) : null,
                use.position && has ? this.Position( key, change ) : null,
                use.size && has ? this.Size( key, change ) : null,
                use.overlay && has ? this.Overlay( key, change ) : null,
                use.overlay && has ? this.OverlayOther( key, change ) : null,
                use.blend && has ? this.Blend( key, change ) : null,
                use.repeat && has ? this.Repeat( key, change ) : null,
            )
        )
    };

    this.make_object = function () {

        return {
            attachment : this.attachment,
            blend      : this.blend,
            color      : this.color,
            ghost      : this.ghost,
            image      : this.image,
            overlay    : this.overlay,
            position   : this.position,
            repeat     : this.repeat,
            size       : this.size
        }
    };

    this.save = function ( key, change ) {
        change( key, this.make_object() );
    };

    this.setImage = function ( key, val ) {

        this[ key ] = val;
        this.save( this.uploader.key, this.uploader.change );
    };

    this.style = function ( type ) {
        return this.InlineStyle( type );
    };

    this.Attachment = function ( key, change ) {
        if ( this.image.id === 0 ) return;
        return EL(
            PanelBody,
            {
                key         : 'bg-attachment-wrapper',
                className   : 'bg-attachment-wrapper',
                title       : "Attachment",
                initialOpen : false
            },
            EL(
                RadioControl,
                {
                    key      : 'bg-attachment-radio',
                    label    : "When Scrolling Page...",
                    selected : this.attachment,
                    options  : this.vars.attachment,
                    help     : "Default is 'Scroll'",
                    onChange : val => {
                        this.attachment = val;
                        this.save( key, change )
                    }
                }
            )
        )
    };

    this.Blend = function ( key, change ) {
        if ( ! this.image.id || ! this.color ) return;
        return EL(
            PanelBody,
            {
                key         : 'bgblnd',
                className   : "background-blend-wrapper",
                title       : 'Blend',
                initialOpen : false
            },
            EL(
                SelectControl,
                {
                    key      : "background-blend",
                    label    : "Mode",
                    help     : "If a color and an image are both selected, you can add a filter to blend them.",
                    value    : this.blend,
                    options  : this.vars.blends,
                    onChange : val => {
                        this.blend = val;
                        this.save( key, change );
                    }
                }
            )
        )
    };

    this.Classes = function () {
        let typ = this.Type();
        let ret;
        let col = this.color;
        ret     = 'blend' === typ ? ' has-bg has-bg-image has-bg-color has-bg-blend' : '';
        ret     = ! ret && 'image' === typ ? ' has-bg has-bg-image' : ret;
        ret     = ! ret && 'color' === typ ? ' has-bg has-bg-color' : ret;
        if ( ret && ret !== 'image' ) {
            this.vars.colors.forEach( function ( e ) {
                if ( col === e.color ) {
                    ret += ' has-' + e.slug + '-background-color';
                }
            } );
        }
        return ret;
    };

    this.Color = function ( key, change ) {
        return EL(
            PanelColorSettings,
            {
                key           : 'bg-color',
                title         : "Background Color",
                initialOpen   : false,
                colorSettings : [
                    {
                        label    : 'Select a Color',
                        value    : this.color,
                        onChange : val => {
                            this.color = val;
                            this.save( key, change )
                        }
                    }
                ]
            }
        )
    };

    this.Deprecated = function ( what ) {

        let ret = '';
        let typ = this.Type();
        let col = this.color;

        switch ( what ) {

            case 'class':
                ret = 'blend' === typ ? ' has-bg has-bg-image has-bg-color has-bg-blend' : '';
                ret = ! ret && 'image' === typ ? ' has-bg has-bg-image' : ret;
                ret = ! ret && 'color' === typ ? ' has-bg has-bg-color' : ret;
                if ( ret && ret !== 'image' ) {
                    this.vars.colors.forEach( function ( e ) {
                        if ( col === e.color ) {
                            ret += ' sectionblock-bg-' + e.slug;
                        }
                    } );
                }
                break;

            case 'nocolorclass':
                ret = 'blend' === typ ? ' has-bg has-bg-image has-bg-color has-bg-blend' : '';
                ret = ! ret && 'image' === typ ? ' has-bg has-bg-image' : ret;
                ret = ! ret && 'color' === typ ? ' has-bg has-bg-color' : ret;
                if ( ret && ret !== 'image' ) {
                    this.vars.colors.forEach( function ( e ) {
                        if ( col === e.color ) {
                            ret += ' sectionblock-bg-' + e.slug;
                        }
                    } );
                }
        }

        return ret;
    };

    this.Ghost = function( key, change ) {
        return EL(
            PanelBody,
            {
                key         : 'pdfsmrem',
                className   : "background-ghost",
                title       : "Ornaments",
                initialOpen : false
            },
            EL(
                SelectControl,
                {
                    key      : "background-ghost-image",
                    label    : "Image",
                    help     : "You can add an ornament to the background.",
                    value    : this.ghost.img,
                    options  : this.vars.ghosts,
                    onChange : val => {
                        this.ghost.img = val;
                        this.save( key, change )
                    }
                }
            ),
            EL(
                RadioControl,
                {
                    key      : 'background-ghost-pos',
                    label    : "Position",
                    help     : "Choose where the ornament appears, always at the bottom of the container.",
                    selected : this.ghost.pos,
                    options  : this.vars.ghostpos,
                    onChange : val => {
                        this.ghost.pos = val;
                        this.save( key, change )
                    }
                }
            )
        )
    };

    this.Image = function ( img ) {
        this.setImage = this.setImage.bind( this );
        return this.COMMON.image( img, 'image', this.setImage )
    };

    this.InlineStyle = function ( type ) {

        let use = USE[ type ].background;

        let size = this.SizeCalc();
        size     = ! size && this.size.keyword ? this.size.keyword : size;

        let over = '';

        if ( this.overlay.type ) {
            let alpha  = ! this.overlay.alpha ? 0 : parseInt( this.overlay.alpha );
            let type   = this.overlay.type;
            let start  = ! this.overlay.start ? 'top' : this.overlay.start;
            let color  = ! this.overlay.color ? '#000000' : this.overlay.color;
            alpha      = alpha < 0 ? 0 : alpha;
            alpha      = alpha > 100 ? 100 : alpha;
            let half   = Math.floor( alpha / 2 );
            let color1 = this.to_rgba( color, alpha );
            let color2 = type === 'cover' ? color1 : this.to_rgba( color, half );
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

        return {
            backgroundColor      : use.color && use.colorinline && this.color ? this.color : null,
            backgroundImage      : use.image && this.image.url ? over + 'url(' + this.image.url + ')' : null,
            backgroundSize       : use.size && this.image.url && size ? size : null,
            backgroundRepeat     : use.repeat && this.image.url && this.repeat ? this.repeat : null,
            backgroundAttachment : use.attachment && this.image.url && this.attachment ? this.attachment : null,
            backgroundBlendMode  : use.blend && this.image.url && this.blend ? this.blend : null
        };
    };

    this.Overlay = function ( key, change ) {
        if ( ! this.image.id ) return;
        return EL(
            PanelColorSettings,
            {
                key           : 'bg-overlay-color',
                title         : "Overlay Color",
                initialOpen   : false,
                colorSettings : [
                    {
                        label    : 'Select a color',
                        value    : this.overlay.color,
                        onChange : val => {
                            this.overlay.color = val;
                            this.save( key, change );
                        }
                    }
                ]
            }
        )
    };

    this.OverlayOther = function ( key, change ) {
        if ( ! this.image.id ) return;
        return EL(
            PanelBody,
            {
                key         : 'pdfskdfsiuemrem',
                className   : "background-overlay-wrapper",
                title       : "Overlay Options",
                initialOpen : false
            },
            EL(
                SelectControl,
                {
                    key      : "background-overlay-type",
                    label    : "Type",
                    help     : "You can add an overlay to the background image to help reduce contrast.",
                    value    : this.overlay.type,
                    options  : this.vars.overlay,
                    onChange : val => {
                        this.overlay.type = val;
                        this.save( key, change )
                    }
                }
            ),
            EL(
                TextControl,
                {
                    key      : 'backgroundoverlaytc1',
                    label    : "Transparency",
                    help     : "Number from 1 to 100, as a percentage of how transparent the overlay will be; "
                        + "gradients always use half this value as the lighter color.",
                    value    : this.overlay.alpha,
                    onChange : val => {
                        this.overlay.alpha = val;
                        this.save( key, change )
                    }
                }
            ),
            EL(
                RadioControl,
                {
                    key      : 'backgroundoverlaytc2',
                    label    : "Start Position",
                    help     : "Used for gradients",
                    selected : this.overlay.start,
                    options  : this.vars.start,
                    onChange : val => {
                        this.overlay.start = val;
                        this.save( key, change )
                    }
                }
            )
        )
    };

    this.Position = function ( key, change ) {
        if ( this.image.id === 0 ) return;
        return (
            EL(
                PanelBody,
                {
                    key         : 'bgposwrap',
                    className   : "background-position-wrapper",
                    title       : "Position",
                    initialOpen : false
                },
                EL(
                    TextControl,
                    {
                        key      : 'bgposwrapptc1',
                        label    : "Horizontal",
                        help     : "Requires 'left', 'center', 'right' or CSS value (ex: 33%)",
                        value    : this.position.x,
                        onChange : val => {
                            this.position.x = val;
                            this.save( key, change );
                        }
                    }
                ),
                EL(
                    TextControl,
                    {
                        key      : 'bgposwrapptc2',
                        label    : "Vertical",
                        help     : "Requires 'top', 'center', 'bottom' or CSS value",
                        value    : this.position.y,
                        onChange : val => {
                            this.position.y = val;
                            this.save( key, change );
                        }
                    }
                )
            )
        )
    };

    this.Repeat = function ( key, change ) {
        if ( ! this.image.id ) return;
        EL(
            PanelBody,
            {
                key         : 'backgroundrepeat1',
                className   : "background-repeat-wrapper",
                title       : "Repeat",
                initialOpen : false
            },
            EL(
                RadioControl,
                {
                    key      : 'backgroundrepeat3',
                    label    : "Image will...",
                    selected : this.repeat,
                    options  : this.vars.repeat,
                    help     : "Default is 'repeat'",
                    onChange : val => {
                        this.repeat = val;
                        this.save( key, change )
                    }
                }
            )
        )
    };

    this.Size = function ( key, change ) {
        if ( ! this.image.id ) return;
        return EL(
            PanelBody,
            {
                key         : 'backgroundsizeret',
                className   : "background-size-wrapper",
                title       : "Size",
                initialOpen : false
            },
            EL(
                RadioControl,
                {
                    key      : 'backgroundsizeretrc',
                    label    : "Size by Keyword",
                    selected : this.size.keyword,
                    options  : this.vars.size,
                    help     : "If 'None' is selected, you should use the measurement fields below, this field "
                        + "overrides choices below",
                    onChange : val => {
                        this.size.keyword = val;
                        this.save( key, change )
                    }
                }
            ),
            EL(
                TextControl,
                {
                    key      : 'backgroundsizerettc1',
                    label    : "Horizontal Size",
                    help     : "Requires legitimate CSS size value; if Vertical is not filled out, this "
                        + "value is applied to both dimensions",
                    value    : this.size.x,
                    onChange : val => {
                        this.size.x = val;
                        this.save( key, change )
                    }
                }
            ),
            EL(
                TextControl,
                {
                    key      : 'backgroundsizerettc2',
                    label    : "Vertical Size",
                    help     : "Requires legitimate CSS size value; not used if Horizontal is blank",
                    value    : this.size.y,
                    onChange : val => {
                        this.size.y = val;
                        this.save( key, change )
                    }
                }
            )
        )
    };

    this.SizeCalc = function () {
        let ret = '';
        ret     = this.size.x && this.size.y ? this.size.x + ' ' + this.size.y : ret;
        ret     = this.size.x ? this.size.x : ret;
        return ret;
    };

    this.to_rgba = function ( color, opacity, css ) {
        let rgb = color.match( /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i );
        rgb     = ! rgb ?
            color.match( /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i )
                .slice( 1, 4 ).map( function ( x ) {
                return 0x11 * parseInt( x, 16 );
            } ) :
            rgb.slice( 1, 4 ).map( function ( x ) {
                return parseInt( x, 16 );
            } );
        opacity = typeof( opacity ) === 'undefined' ? 1 : parseFloat( opacity );
        opacity = opacity > 100 ? 1 : opacity;
        opacity = opacity > 1 ? opacity / 100 : opacity;
        rgb.push( opacity );
        if ( typeof( css ) === 'undefined' || css ) {
            return 'rgba( ' + rgb.join() + ')';
        } else {
            return rgb;
        }
    };

    this.Type = function () {
        let type = null;
        if ( this.color && this.image.url && this.blend ) {
            type = 'blend';
        } else if ( this.image.url ) {
            type = 'image';
        } else if ( this.color ) {
            type = 'color';
        }
        return type;
    };
}