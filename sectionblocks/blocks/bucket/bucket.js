/**
 * @typedef {Object} SBLCK
 * @property {Object} blocks
 * @property {Object} blocks.bucket
 * @property {Object} blocks.bucket.cfg
 * @property {Object} blocks.bucket.cfg.attributes
 * @property {Object} blocks.bucket.cfg.attributes.alignment
 * @property {Object} blocks.bucket.cfg.attributes.background
 * @property {Object} blocks.bucket.cfg.attributes.bTitle
 * @property {Object} blocks.bucket.cfg.attributes.bDesc
 * @property {Object} blocks.bucket.cfg.attributes.bItems
 * @property {Array} blocks.bucket.cfg.attributes.bItems.allowed
 * @property {Object} blocks.bucket.cfg.attributes.itemType
 * @property {Object} blocks.bucket.cfg.attributes.itemHeader
 * @property {Object} blocks.bucket.cfg.attributes.itemPad
 * @property {Object} blocks.bucket.cfg.attributes.pad
 * @property {Object} blocks.bucket.inspector
 * @property {Object} blocks.bucket.inspector.panel
 * @property {SLCT[]} selects.itempaddingstyles
 * @property {SLCT[]} selects.itemstyles
 * @property {SLCT[]} selects.paddingstyles
 * @property {SLCT[]} selects.titlestyles
 * @property {Object} plugin
 * @property {Object} plugin.use
 * @property {Object} plugin.use.bucket
 * @property {Boolean} plugin.use.bucket.title
 * @property {Boolean} plugin.use.bucket.desc
 * @property {Boolean} plugin.use.bucket.padding
 * @property {Boolean} plugin.use.bucket.itempadding
 */

/**
 * @typedef {Object} SLCT
 * @property {String} label
 * @property {String} key
 * @property {String} value
 */

( function ( BLOCK, ED, COMP, EL ) {

    const { registerBlockType }                                                         = BLOCK;
    const { PanelBody, SelectControl }                                                  = COMP;
    const { AlignmentToolbar, BlockControls, InnerBlocks, InspectorControls, RichText } = ED;

    const BKT  = SBLCK.blocks.bucket;
    const BKTA = BKT.cfg.attributes;
    const USE  = SBLCK.plugin.use.bucket;

    registerBlockType( 'sectionblock/bucket', {

        ...BKT.cfg,

        edit       : function ( props ) {

            const I = props.clientId;

            SBLCK_STORE[ I ] = typeof ( SBLCK_STORE[ I ] ) !== 'undefined' ?
                SBLCK_STORE[ I ] :
                { bg : new BACKGROUND(), cm : new SBLCK_COMMON() };

            const onTextChange = ( key, val ) => {
                props.setAttributes( { [ key ] : val } );
            };

            let alignment = props.attributes.alignment ?
                props.attributes.alignment :
                onTextChange( 'alignment', 'center' );

            let background = props.attributes.background ?
                props.attributes.background :
                {};

            let bTitle = props.attributes.bTitle ?
                props.attributes.bTitle :
                '';

            let bDesc = props.attributes.bDesc ?
                props.attributes.bDesc :
                '';

            let itemType = props.attributes.itemType ?
                props.attributes.itemType :
                onTextChange( 'itemType', SBLCK.selects.itemstyles[ 0 ][ 'value' ] );

            let itemHeader = props.attributes.itemHeader ?
                props.attributes.itemHeader :
                onTextChange( 'itemHeader', SBLCK.selects.titlestyles[ 0 ][ 'value' ] );

            let pad = props.attributes.pad ?
                props.attributes.pad :
                onTextChange( 'pad', '' );

            let itemPad = props.attributes.itemPad ?
                props.attributes.itemPad :
                onTextChange( 'itemPad', '' );

            let isSelected = props.isSelected;

            if ( ! background.hasOwnProperty( 'image' ) ) {
                SBLCK_STORE[ I ].bg.save( 'background', onTextChange );
            }

            if ( typeof ( background ) === 'object' ) {
                SBLCK_STORE[ I ].bg.assign( background );
            }

            return EL(
                BKT.cfg.tagName,
                {
                    className : 'ppablocks-bucket'
                        + SBLCK_STORE[ I ].bg.class()
                        + itemsClasses( itemType, SBLCK.selects.itemstyles )
                        + titleClasses( itemHeader, SBLCK.selects.titlestyles )
                        + paddingClasses( pad )
                        + itemPaddingClasses( itemPad ),
                    style     : SBLCK_STORE[ I ].bg.style( 'bucket' )
                },
                EL(
                    BlockControls,
                    {},
                    EL(
                        AlignmentToolbar,
                        {
                            value    : alignment,
                            onChange : val => {
                                onTextChange( 'alignment', val )
                            }
                        }
                    )
                ),
                EL(
                    InspectorControls,
                    {},
                    USE.title ?
                        EL(
                            SelectControl,
                            {
                                label    : BKTA.itemType.label,
                                help     : BKTA.itemType.help,
                                options  : SBLCK.selects.itemstyles,
                                value    : itemType,
                                onChange : val => {
                                    onTextChange( 'itemType', val )
                                }
                            }
                        ) : null,
                    USE.desc ?
                        EL(
                            SelectControl,
                            {
                                label    : BKTA.itemHeader.label,
                                help     : BKTA.itemHeader.help,
                                options  : SBLCK.selects.titlestyles,
                                value    : itemHeader,
                                onChange : val => {
                                    onTextChange( 'itemHeader', val )
                                }
                            }
                        ) : null,
                    USE.padding || USE.itempadding ?
                        EL(
                            PanelBody,
                            panel_atts( 'pad' ),
                            panel_desc( 'pad' ),
                            USE.padding ?
                                EL(
                                    SelectControl,
                                    {
                                        label    : BKTA.pad.label,
                                        help     : BKTA.pad.help,
                                        options  : SBLCK.selects.paddingstyles,
                                        value    : pad,
                                        onChange : val => {
                                            onTextChange( 'pad', val )
                                        }
                                    }
                                ) : null,
                            USE.itempadding ?
                                EL(
                                    SelectControl,
                                    {
                                        label    : BKTA.itemPad.label,
                                        help     : BKTA.itemPad.help,
                                        options  : SBLCK.selects.itempaddingstyles,
                                        value    : itemPad,
                                        onChange : val => {
                                            onTextChange( 'itemPad', val )
                                        }
                                    }
                                ) : null
                        ) : null,
                    SBLCK_STORE[ I ].bg.inspector( 'background', onTextChange, SBLCK_STORE[ I ].bg.image )
                ),
                ghost( background ),
                ( isSelected || bTitle ) && USE.title ?
                    EL(
                        RichText,
                        {
                            className              : BKTA.bTitle.className,
                            keepPlaceholderOnFocus : BKTA.bTitle.keepPlaceholderOnFocus,
                            multiline              : BKTA.bTitle.multiline,
                            placeholder            : BKTA.bTitle.placeholder,
                            tagName                : BKTA.bTitle.tagName,
                            value                  : bTitle,
                            onChange               : val => {
                                onTextChange( 'bTitle', val )
                            }
                        }
                    ) : null,
                ( isSelected || bDesc ) && USE.desc ?
                    EL(
                        RichText,
                        {
                            className              : BKTA.bDesc.className,
                            keepPlaceholderOnFocus : BKTA.bDesc.keepPlaceholderOnFocus,
                            multiline              : BKTA.bDesc.multiline,
                            placeholder            : BKTA.bDesc.placeholder,
                            tagName                : BKTA.bDesc.tagName,
                            value                  : bDesc,
                            onChange               : val => {
                                onTextChange( 'bDesc', val )
                            }
                        }
                    ) : null,
                EL(
                    BKTA.bItems.tagName,
                    {
                        className : BKTA.bItems.className
                    },
                    EL(
                        InnerBlocks,
                        {
                      //      allowedBlocks : BKTA.bItems.allowed
                        }
                    )
                )
            )
        },
        save       : function ( props ) {

            const I = props.clientId;

            SBLCK_STORE[ I ] = typeof ( SBLCK_STORE[ I ] ) !== 'undefined' ?
                SBLCK_STORE[ I ] :
                { bg : new BACKGROUND(), cm : new SBLCK_COMMON(), };

            let background = props.attributes.background;
            let bDesc      = props.attributes.bDesc;
            let bTitle     = props.attributes.bTitle;
            let itemType   = props.attributes.itemType;
            let itemHeader = props.attributes.itemHeader;
            let pad        = props.attributes.pad;
            let itemPad    = props.attributes.itemPad;

            SBLCK_STORE[ I ].bg.assign( background );

            return EL(
                BKTA.tagName,
                {
                    className : 'sectionblock-bucket'
                        + SBLCK_STORE[ I ].bg.class()
                        + itemsClasses( itemType, SBLCK_STORE[ I ].cm.itemstyles )
                        + titleClasses( itemHeader, SBLCK_STORE[ I ].cm.titlestyles )
                        + paddingClasses( pad )
                        + itemPaddingClasses( itemPad ),
                    style     : SBLCK_STORE[ I ].bg.style( 'bucket' ),
                },
                ghost( background ),
                renderTitle( bTitle ),
                renderDesc( bDesc ),
                EL(
                    BKTA.bItems.tagName,
                    {
                        className : BKTA.bItems.className
                    },
                    EL(
                        InnerBlocks.Content
                    )
                )
            )
        },
        deprecated : []
    } );

    /**
     * Ghost function...
     *
     * @param background
     * @returns {*}
     */
    function ghost( background ) {

        if ( typeof ( background.ghost ) === 'undefined' || ! USE.background.ghost ) {
            return null
        }

        let where = typeof ( background.ghost.pos ) === 'undefined' ? 'right' : background.ghost.pos;

        if ( ! background.ghost.img ) {
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
                    src : SBLCK_STORE[ background.ghost.img ]
                }
            )
        )
    }

    /**
     * Add classes to the items container
     *
     * @param itemType
     * @param stys
     * @returns {string}
     */
    function itemsClasses( itemType, stys ) {

        itemType = typeof ( itemType ) !== 'undefined' ? itemType : stys[ 0 ];

        return ' ' + itemType;
    }

    function paddingClasses( pad ) {

        pad = typeof ( pad ) !== 'undefined' ? pad : '';

        return pad && USE.padding ? ' ' + pad : '';
    }

    function itemPaddingClasses( itemPad ) {

        itemPad = typeof ( itemPad ) !== 'undefined' ? itemPad : '';

        return itemPad && USE.itempadding ? ' ' + itemPad : '';
    }

    /**
     * Add classes to the items container
     *
     * @param itemHeader
     * @param stys
     * @returns {string}
     */
    function titleClasses( itemHeader, stys ) {

        itemHeader = typeof ( itemHeader ) !== 'undefined' ? itemHeader : stys[ 0 ];

        return ' ' + itemHeader;
    }

    /**
     * Render the title
     *
     * @param bTitle
     * @returns {*}
     */
    function renderTitle( bTitle ) {

        if ( typeof ( bTitle ) === 'undefined' || ! bTitle || bTitle === '<br>' || ! USE.title ) {
            return null;
        }

        return EL(
            RichText.Content,
            {
                className : BKTA.bTitle.className,
                tagName   : BKTA.bTitle.tagName,
                value     : bTitle
            }
        );
    }

    /**
     * Render the description
     *
     * @param bDesc
     * @returns {*}
     */
    function renderDesc( bDesc ) {

        if ( typeof ( bDesc ) === 'undefined' || ! bDesc || bDesc === '<br>' || ! USE.desc ) {
            return null;
        }

        return EL(
            RichText.Content,
            {
                className : BKTA.bDesc.className,
                tagName   : BKTA.bDesc.tagName,
                value     : bDesc
            }
        );
    }

    /**
     * Panel attributes
     *
     * @param panel
     * @returns {{initialOpen: *, key: *, className: *, title: *}}
     */
    function panel_atts( panel ) {
        return {
            initialOpen : BKT.inspector.panels[ panel ].initialOpen,
            className   : BKT.inspector.panels[ panel ].className,
            title       : BKT.inspector.panels[ panel ].title
        }
    }

    /**
     * Description paragraph for the inspector
     *
     * @param panel
     * @returns {ActiveX.IXMLDOMElement}
     */
    function panel_desc( panel ) {
        return EL(
            'p',
            {},
            BKT.inspector.panels[ panel ].desc
        )
    }

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement );