/**
 * @typedef  {Object}  SBLCK
 * @property {Object}  blocks
 * @property {Object}  blocks.section
 * @property {Object}  blocks.section.cfg
 * @property {Object}  blocks.section.cfg.attributes
 * @property {Object}  blocks.section.cfg.attributes.alignment
 * @property {Object}  blocks.section.cfg.attributes.background
 * @property {Object}  blocks.section.cfg.attributes.bClass
 * @property {Object}  blocks.section.cfg.attributes.bItems
 * @property {Array}   blocks.section.cfg.attributes.bItems.allowed
 * @property {Object}  blocks.section.inspector
 * @property {Object}  blocks.section.inspector.panel
 * @property {SLCT[]}  selects.bClass
 * @property {SLCT[]}  selects.iClass
 * @property {Object}  plugin
 * @property {Object}  plugin.use
 * @property {Object}  plugin.use.section
 * @property {Boolean} plugin.use.section.bClass
 */

/**
 * @typedef  {Object} SLCT
 * @property {String} label
 * @property {String} key
 * @property {String} value
 */

( function ( BLOCK, ED, COMP, EL ) {

    const { registerBlockType }                                               = BLOCK;
    const { SelectControl }                                                   = COMP;
    const { AlignmentToolbar, BlockControls, InnerBlocks, InspectorControls } = ED;

    const BKT  = SBLCK.blocks.section;
    const BKTA = BKT.cfg.attributes;
    const USE  = SBLCK.plugin.use.section;

    registerBlockType( 'sectionblock/section', {

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

            let bClass = props.attributes.bClass ?
                props.attributes.bClass :
                onTextChange( 'bClass', SBLCK.selects.bClass[ 0 ][ 'value' ] );

            if ( ! background.hasOwnProperty( 'image' ) ) {
                SBLCK_STORE[ I ].bg.save( 'background', onTextChange );
            }

            if ( typeof ( background ) === 'object' ) {
                SBLCK_STORE[ I ].bg.assign( background );
            }

            return EL(
                BKT.cfg.tagName,
                {
                    className : 'sectionblock-section'
                        + SBLCK_STORE[ I ].bg.class()
                        + itemsClasses( bClass, SBLCK.selects.bClass ),
                    style     : SBLCK_STORE[ I ].bg.style( 'section' )
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
                    {
                        key: 'ins-bclass'
                    },
                    USE.bClass ?
                        EL(
                            SelectControl,
                            {
                                key      : 'ins-bclass-el',
                                label    : BKTA.bClass.label,
                                help     : BKTA.bClass.help,
                                options  : SBLCK.selects.bClass,
                                value    : bClass,
                                onChange : val => {
                                    onTextChange( 'bClass', val )
                                }
                            }
                        ) : null,
                    SBLCK_STORE[ I ].bg.inspector( 'background', onTextChange, SBLCK_STORE[ I ].bg.image )
                ),
                SBLCK_STORE[ I ].cm.ghost( background ),
                EL(
                    BKTA.bItems.tagName,
                    {
                        key: 'items',
                        className : BKTA.bItems.className
                    },
                    EL(
                        InnerBlocks,
                        {
                            key           : 'items-innerblocks'
                        }
                    )
                )
            )
        },
        save       : function () {
            return EL ( InnerBlocks.Content );
        },
        deprecated : []
    } );

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

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement );