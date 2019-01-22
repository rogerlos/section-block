/**
 * @typedef  {Object}  SBLCK
 * @property {Object}  CFG
 * @property {Object}  CFG.blocks
 * @property {Object}  CFG.blocks.section
 * @property {Object}  CFG.blocks.section.cfg
 * @property {Object}  CFG.blocks.section.cfg.attributes
 * @property {Object}  CFG.blocks.section.cfg.attributes.alignment
 * @property {Object}  CFG.blocks.section.cfg.attributes.background
 * @property {Object}  CFG.blocks.section.cfg.attributes.bClass
 * @property {Object}  CFG.blocks.section.cfg.attributes.bItems
 * @property {Array}   CFG.blocks.section.cfg.attributes.bItems.allowed
 * @property {Object}  CFG.blocks.section.cfg.attributes.bLimit
 * @property {Object}  CFG.blocks.section.cfg.attributes.bFlex
 * @property {Object}  CFG.blocks.section.cfg.attributes.bFlexSmall
 * @property {Object}  CFG.blocks.section.cfg.attributes.bFlexMedium
 * @property {Object}  CFG.blocks.section.cfg.attributes.bFlexTablet
 * @property {Object}  CFG.blocks.section.cfg.attributes.bFlexDesktop
 * @property {Object}  CFG.blocks.section.inspector
 * @property {Object}  CFG.blocks.section.inspector.panel
 * @property {SLCT[]}  CFG.selects.bClass
 * @property {SLCT[]}  CFG.selects.iClass
 * @property {Object}  CFG.use
 * @property {Object}  CFG.use.section
 * @property {Boolean} CFG.use.section.bClass
 * @property {Object}  INSPECTOR
 * @property {Object}  PANEL
 * @property {function} Random
 */

/**
 * @typedef  {Object} SLCT
 * @property {String} label
 * @property {String} key
 * @property {String} value
 */

( function ( BLOCK, ED, COMP, EL ) {

    const { registerBlockType }                                               = BLOCK;
    const { PanelBody, SelectControl }                                        = COMP;
    const { AlignmentToolbar, BlockControls, InnerBlocks, InspectorControls } = ED;

    const CFG       = SBLCK.CFG;
    const BKT       = CFG.blocks.section;
    const BKTA      = BKT.cfg.attributes;
    const USE       = CFG.use.section;
    const SEL       = CFG.selects;
    const PANEL     = SBLCK.PANEL;
    const INSPECTOR = SBLCK.INSPECTOR;

    registerBlockType( 'sectionblock/section', {

        ...BKT.cfg,

        edit       : function ( props ) {

            const saveProp = ( key, val ) => {
                props.setAttributes( { [ key ] : val } );
            };

            const saveBG = ( key, val, parent ) => {

                let b = props.attributes.background ? props.attributes.background : bgProps();

                if ( typeof ( parent ) !== 'undefined' ) {

                    if ( ! b[ parent ].hasOwnProperty( key ) ) {
                        let check = bgProps();
                        if ( check[ parent ].hasOwnProperty( key ) ) {
                            b[ parent ] = check[ parent ];
                        }
                    }
                    b[ parent ][ key ] = val;
                } else {
                    b[ key ] = val;
                }
                props.setAttributes( { background : b } );
                props.setAttributes( { updated : Date.now() } );
            };

            let alignment = props.attributes.alignment ? props.attributes.alignment : saveProp( 'alignment', 'center' );

            let bClass = props.attributes.bClass ?
                props.attributes.bClass :
                saveProp( 'bClass', SEL.bClass[ 0 ].value );

            let showB =
                    typeof ( SEL.bClass ) !== 'undefined'
                    && ! ( SEL.bClass.length === 1 && SEL.bClass[ 0 ].value === '' )
                    && USE.bClass;

            let advanced = props.attributes.className ? props.attributes.className : '';

            let bFlex = ! ! props.attributes.bFlex;

            let background = props.attributes.background ? props.attributes.background : bgProps();

            return EL(
                BKT.cfg.tagName,
                {
                    className : SBLCK.BG.Classes( background ) + addClasses( bClass, SEL.bClass, advanced, bFlex ),
                    style     : SBLCK.BG.InlineStyle( 'section', background )
                },

                EL(
                    BlockControls,
                    {},
                    EL(
                        AlignmentToolbar,
                        {
                            value    : alignment,
                            onChange : val => {
                                saveProp( 'alignment', val )
                            }
                        }
                    )
                ),

                EL(
                    InspectorControls,
                    {
                        key       : 'ins-bclass',
                        className : 'sectionblock-inspector'
                    },
                    EL(
                        PanelBody,
                        PANEL.Atts( 'display', BKT ),
                        PANEL.Desc( 'display', BKT ),
                        showB ? EL(
                            SelectControl,
                            {
                                key       : 'ins-bclass-el',
                                className : BKTA.bClass.className,
                                label     : BKTA.bClass.label,
                                help      : BKTA.bClass.help,
                                options   : SEL.bClass,
                                value     : bClass,
                                onChange  : val => {
                                    saveProp( 'bClass', val )
                                }
                            }
                        ) : null,
                        USE.bFlex ? INSPECTOR.Toggle( 'bFlex', bFlex, saveProp, BKT ) : null,
                    ),
                    SBLCK.BG.Inspector( 'background', saveBG, background )
                ),

                USE.background.ghost ? SBLCK.BG.GhostDisplay( background ) : null,

                EL(
                    BKTA.bItems.tagName,
                    {
                        key       : 'items',
                        className : BKTA.bItems.className + innerClasses( alignment )
                    },
                    EL(
                        InnerBlocks,
                        innerblocksParams()
                    )
                )
            )
        },
        save       : function () {
            return EL( InnerBlocks.Content );
        },
        deprecated : []
    } );

    /**
     * Add classes to the items container
     *
     * @param itemType
     * @param showB
     * @param advanced
     * @param bFlex
     * @returns {string}
     */
    function addClasses( itemType, showB, advanced, bFlex ) {

        itemType = typeof ( itemType ) !== 'undefined' && showB ? itemType : '';
        itemType = ! itemType && showB ? SEL.bClass[ 0 ][ 'value' ] : itemType;

        let flex = bFlex ? ' sectionblock-flex' : '';
        let adv  = advanced ? ' ' + advanced : '';

        return ' wp-block-sectionblock-section sectionblock-section ' + itemType + adv + flex;
    }

    /**
     * Adds alignment class to inner wrapper
     *
     * @param alignment
     * @returns {string}
     */
    function innerClasses( alignment ) {

        return typeof ( alignment ) !== 'undefined' ? ' align-items-' + alignment : '';
    }

    /**
     * Because gutenberg takes an empty allowed array as meaning "no blocks allowed" we check for length
     *
     * @returns {{key: string}}
     */
    function innerblocksParams() {

        let i = {
            key : 'items-innerblocks'
        };

        if ( BKTA.bItems.allowed.length ) {
            i.allowed = BKTA.bItems.allowed
        }

        return i;
    }

    /**
     * Method to avoid reference to root bg props across all objects.
     *
     * @returns {any}
     */
    function bgProps() {
        return JSON.parse( JSON.stringify( SBLCK.CFG.background.props ) );
    }

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement );