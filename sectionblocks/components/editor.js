( function ( SBLCK ) {

    const EL                                                   = wp.element.createElement;
    const { Button, RadioControl, TextControl, ToggleControl } = wp.components;

    SBLCK.Random = function ( min, max ) {

        min = typeof ( min ) === 'undefined' ? 1000 : min;
        max = typeof ( max ) === 'undefined' ? 9999 : max;

        return Math.random() * ( max - min ) + min;
    };

    SBLCK.INSPECTOR = {};

    SBLCK.INSPECTOR.Radio = function ( key, field, change, BLK ) {
        return (
            EL(
                RadioControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + SBLCK.Random,
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

    SBLCK.INSPECTOR.Text = function ( key, field, change, BLK ) {
        return (
            EL(
                TextControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + SBLCK.Random,
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

    SBLCK.INSPECTOR.Toggle = function ( key, field, change, BLK ) {

        return (
            EL(
                ToggleControl,
                {
                    className : BLK.cfg.attributes[ key ].className,
                    key       : BLK.cfg.attributes[ key ].className + SBLCK.Random,
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

    SBLCK.INSPECTOR.Wp = function ( key, change, post, BLK ) {

        let val   = post[ BLK.inspector.wp[ key ].dynamic ].length ? post[ BLK.inspector.wp[ key ].dynamic ] : '';
        let label = typeof ( BLK.inspector.wp[ key ].label ) === 'string' ? BLK.inspector.wp[ key ].label : '';
        let ran   = SBLCK.Random;

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

    SBLCK.INSPECTOR.WpImage = function ( key, change, post, BLK ) {

        let val   = post.img.url.length ? post.img : { id : 0, url : '', alt : '' };
        let src   = val.url ? val.url : '';
        let label = typeof ( BLK.inspector.wp[ key ].label ) === 'string' ? BLK.inspector.wp[ key ].label : '';
        let ran   = SBLCK.Random;

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

    SBLCK.PANEL = {};

    SBLCK.PANEL.Atts = function ( panel, BLK ) {
        return {
            initialOpen : BLK.inspector.panels[ panel ].initialOpen,
            className   : BLK.inspector.panels[ panel ].className,
            title       : BLK.inspector.panels[ panel ].title
        }
    };

    SBLCK.PANEL.Desc = function ( panel, BLK ) {

        let d = typeof ( BLK.inspector.panels[ panel ].desc ) !== 'undefined' && BLK.inspector.panels[ panel ].desc ?
            BLK.inspector.panels[ panel ].desc : null;

        return d ? EL( 'p', {}, d ) : d;
    };

}( window.SBLCK = window.SBLCK || {} ) );