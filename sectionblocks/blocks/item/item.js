/**
 * @typedef {Object} SBLCK
 * @property {Object} blocks
 * @property {Object} blocks.item
 * @property {Object} blocks.item.cfg
 * @property {Object} blocks.item.cfg.attributes
 * @property {Object} blocks.item.cfg.attributes.itemButton
 * @property {Object} blocks.item.cfg.attributes.itemLabel
 * @property {Object} blocks.item.cfg.attributes.itemText
 * @property {Object} blocks.item.cfg.attributes.itemName
 * @property {Object} blocks.item.cfg.attributes.itemTitle
 * @property {Object} blocks.item.cfg.attributes.itemBackground
 * @property {Object} blocks.item.cfg.attributes.itemImage
 * @property {Object} blocks.item.cfg.attributes.itemImageV
 * @property {Object} blocks.item.cfg.attributes.itemImageH
 * @property {Object} blocks.item.cfg.attributes.itemImageOverlay
 * @property {Object} blocks.item.cfg.attributes.itemLink
 * @property {Object} blocks.item.cfg.attributes.itemLinkNew
 * @property {Object} blocks.item.cfg.attributes.itemLinkTitle
 * @property {Object} blocks.item.cfg.attributes.itemLinkImage
 * @property {Object} blocks.item.cfg.attributes.itemLinkLabel
 * @property {Object} blocks.item.cfg.attributes.itemLockTitle
 * @property {Object} blocks.item.cfg.attributes.itemLockImage
 * @property {Object} blocks.item.cfg.attributes.itemLockText
 * @property {Object} blocks.item.cfg.attributes.itemLockLabel
 * @property {Object} blocks.item.cfg.attributes.itemLockLink
 * @property {Object} blocks.item.cfg.attributes.itemPost
 * @property {Object} blocks.item.cfg.attributes.itemPostContent
 * @property {String} blocks.item.cfg.tagName
 * @property {Object} blocks.item.inspector
 * @property {Object} blocks.item.inspector.panels
 * @property {Object} blocks.item.inspector.panels.select
 * @property {Object} blocks.item.inspector.panels.wp
 * @property {Object} blocks.item.inspector.panels.image
 * @property {Object} blocks.item.inspector.panels.link
 * @property {Object} blocks.item.inspector.panels.linked
 * @property {Object} blocks.item.inspector.panels.lock
 * @property {Object} blocks.item.inspector.struct
 * @property {Object} blocks.item.inspector.struct.wrap
 * @property {Object} blocks.item.inspector.struct.inner
 * @property {Object} blocks.item.inspector.struct.imageWrap
 * @property {Object} blocks.item.inspector.struct.imageInner
 * @property {Object} blocks.item.inspector.struct.image
 * @property {Object} blocks.item.inspector.struct.text
 * @property {Object} blocks.item.inspector.struct.headline
 * @property {Object} blocks.item.inspector.struct.label
 * @property {Object} blocks.item.inspector.struct.excerpt
 * @property {Object} blocks.item.inspector.struct.button
 * @property {Object} blocks.item.inspector.wp
 * @property {INWP} blocks.item.inspector.wp.title
 * @property {INWP} blocks.item.inspector.wp.excerpt
 * @property {INWP} blocks.item.inspector.wp.category
 * @property {INWP} blocks.item.inspector.wp.img
 * @property {INWP} blocks.item.inspector.wp.permalink
 * @property {Object} posts
 * @property {Object} posts.DY
 * @property {Object} posts.emptypost
 */

/**
 * @typedef {Object} SLCT
 * @property {String} label
 * @property {String} key
 * @property {String} value
 */

/**
 * @typedef {Object} INWP
 * @property {String} className
 * @property {String} label
 * @property {String} dynamic
 * @property {String} lock
 * @property {String} item
 */

( function ( BLOCK, ED, COMPS, EL, FETCH ) {

    const { registerBlockType }           = BLOCK;
    const { PanelBody, SelectControl }    = COMPS;
    const { InspectorControls, RichText } = ED;

    const SB   = SBLCK.blocks.item;
    const SBA  = SB.cfg.attributes;
    const SBIS = SB.inspector.struct;

    registerBlockType( 'sectionblock/item', {

        ...SB.cfg,

        edit : ( props ) => {

            const I = props.clientId;

            SBLCK_STORE[ I ] = typeof ( SBLCK_STORE[ I ] ) !== 'undefined' ? SBLCK_STORE[ I ] : {
                bg : new BACKGROUND(),
                cm : new SBLCK_COMMON(),
                dy : {
                    posts    : [],
                    selected : '',
                    post     : null,
                    old      : {},
                    fetching : false
                }
            };

            const onTextChange = ( key, val ) => {
                props.setAttributes( { [ key ] : val } );
            };

            const onToggleChange = ( key, checked ) => {
                props.setAttributes( { [ key ] : checked } );
            };

            const onImageChange = ( key, val ) => {

                let img = {
                    id  : typeof ( val.id ) !== 'undefined' && val.id ? val.id : 0,
                    url : typeof ( val.url ) !== 'undefined' && val.url ? val.url : '',
                    alt : typeof ( val.alt ) !== 'undefined' && val.alt ? val.alt : '',
                };

                props.setAttributes( { [ key ] : img } );
            };

            const onPostChange = val => {

                let id = val;

                props.setAttributes( { itemPost : id } );

                if ( parseInt( id ) === 0 ) {
                    props.setAttributes( { itemPostContent : SBLCK.posts.emptypost } );
                    updatePostVals();
                    return;
                }

                if ( SBLCK_STORE[ I ].dy.selected === id ) return;

                SBLCK_STORE[ I ].dy.old      = SBLCK_STORE[ I ].dy.selected;
                SBLCK_STORE[ I ].dy.selected = id;
                SBLCK_STORE[ I ].dy.fetching = true;

                get_post( id, SBLCK.plugin.routes ).then( post => {

                    props.setAttributes( { itemPostContent : post } );
                    itemPostContent = post;

                    SBLCK_STORE[ I ].dy.fetching = false;

                    updatePostVals();
                } );
            };

            const updatePostVals = () => {
                props.setAttributes( { itemPost : itemPostContent.id } );
                if ( itemLockLink ) {
                    onTextChange( 'itemLink', itemPostContent.permalink );
                }
                if ( itemLockLabel ) {
                    onTextChange( 'itemLabel', itemPostContent.category.term );
                }
                if ( itemLockTitle ) {
                    onTextChange( 'itemTitle', itemPostContent.title );
                }
                if ( itemLockText ) {
                    onTextChange( 'itemText', itemPostContent.excerpt );
                }
                if ( itemLockImage ) {
                    onImageChange( 'itemImage', itemPostContent.img );
                }
            };

            let itemPostContent = typeof ( props.attributes.itemPostContent ) === 'undefined' ?
                SBLCK_STORE[ I ].cm.emptypost : props.attributes.itemPostContent;

            let iClass = props.attributes.iClass;
            let itemPost = props.attributes.itemPost;

            let itemLink    = props.attributes.itemLink;
            let itemLinkNew = ! ! props.attributes.itemLinkNew;

            let itemLinkTitle = ! ! props.attributes.itemLinkTitle;
            let itemLinkLabel = ! ! props.attributes.itemLinkLabel;
            let itemLinkImage = ! ! props.attributes.itemLinkImage;

            let itemLockTitle = ! ! props.attributes.itemLockTitle;
            let itemLockText  = ! ! props.attributes.itemLockText;
            let itemLockImage = ! ! props.attributes.itemLockImage;
            let itemLockLabel = ! ! props.attributes.itemLockLabel;
            let itemLockLink  = ! ! props.attributes.itemLockLink;

            let itemImage = props.attributes.itemImage;

            let itemImageV       = props.attributes.itemImageV ?
                props.attributes.itemImageV : onTextChange( 'itemImageV', 'center' );
            let itemImageH       = props.attributes.itemImageH ?
                props.attributes.itemImageH : onTextChange( 'itemImageH', 'center' );
            let itemImageOverlay = props.attributes.itemImageOverlay;

            let itemBackground = typeof ( props.attributes.itemBackground ) === 'undefined' ?
                {} : props.attributes.itemBackground;

            let itemButton = props.attributes.itemButton;
            let itemLabel  = props.attributes.itemLabel;
            let itemText   = props.attributes.itemText;
            let itemTitle  = props.attributes.itemTitle;

            let isSelected = props.isSelected;

            if ( typeof ( itemBackground ) === 'object' ) {
                SBLCK_STORE[ I ].bg.assign( itemBackground );
            }

            if ( ! itemBackground.hasOwnProperty( 'image' ) ) {
                SBLCK_STORE[ I ].bg.save( 'itemBackground', onTextChange );
            }

            SBLCK_STORE[ I ].dy.posts = SBLCK_POSTS.posts;

            if ( itemPost && itemPostContent.id !== itemPost && ! SBLCK_STORE[ I ].dy.fetching ) {
                onPostChange( itemPost );
            }

            if ( typeof ( SBLCK_STORE[ I ].dy.selected ) === 'undefined' || SBLCK_STORE[ I ].dy.selected === '' ) {
                SBLCK_STORE[ I ].dy.selected = itemPost;
            }

            return (
                EL(
                    SBIS.wrap.tagName,
                    {
                        key       : SBIS.wrap.className + SBLCK_STORE[ I ].cm.random,
                        className : SBIS.wrap.className + ' ' + SBLCK_STORE[ I ].bg.class(),
                        style     : SBLCK_STORE[ I ].bg.style( 'item' )
                    },
                    EL(
                        InspectorControls,
                        {
                            key : 'sectionblock-inspector-controls'
                        },
                        EL(
                            PanelBody,
                            SBLCK_STORE[ I ].cm.panel_atts( 'select', SB ),
                            SBLCK_STORE[ I ].cm.panel_desc( 'select', SB ),
                            EL(
                                SelectControl,
                                {
                                    key       : SBA.iClass.className + SBLCK_STORE[ I ].cm.random,
                                    className : SBA.iClass.className,
                                    label     : SBA.iClass.label,
                                    help      : SBA.iClass.help,
                                    options   : SBLCK.selects.iClass,
                                    value     : iClass,
                                    onChange : val => {
                                        onTextChange( 'iClass', val )
                                    }
                                }
                            ),
                            EL(
                                SelectControl,
                                {
                                    key       : SBA.itemPost.className + SBLCK_STORE[ I ].cm.random,
                                    className : SBA.itemPost.className,
                                    label     : SBA.itemPost.label,
                                    help      : SBA.itemPost.help,
                                    options   : typeof ( SBLCK_STORE[ I ].dy.posts ) === 'undefined' ||
                                    SBLCK_STORE[ I ].dy.posts.length < 2 ? [ SBLCK.posts.DY ] : SBLCK_STORE[ I ].dy.posts,
                                    value     : itemPost,
                                    onChange  : onPostChange
                                }
                            ),
                        ),
                        itemPost ?
                            EL(
                                PanelBody,
                                SBLCK_STORE[ I ].cm.panel_atts( 'wp', SB ),
                                SBLCK_STORE[ I ].cm.panel_desc( 'wp', SB ),
                                SBLCK_STORE[ I ].cm.inspector_wp( 'title', onTextChange, itemPostContent, SB ),
                                SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLockTitle', itemLockTitle, onToggleChange, SB ),
                                SBLCK_STORE[ I ].cm.inspector_wp( 'excerpt', onTextChange, itemPostContent, SB ),
                                SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLockText', itemLockText, onToggleChange, SB ),
                                SBLCK_STORE[ I ].cm.inspector_wp( 'category', onTextChange, itemPostContent, SB ),
                                SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLockLabel', itemLockLabel, onToggleChange, SB ),
                                SBLCK_STORE[ I ].cm.inspector_wp( 'permalink', onTextChange, itemPostContent, SB ),
                                SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLockLink', itemLockLink, onToggleChange, SB ),
                                SBLCK_STORE[ I ].cm.inspector_wp_image( 'img', onImageChange, itemPostContent, SB ),
                                SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLockImage', itemLockImage, onToggleChange, SB ),
                            ) : null,
                        EL(
                            PanelBody,
                            SBLCK_STORE[ I ].cm.panel_atts( 'image', SB ),
                            SBLCK_STORE[ I ].cm.panel_desc( 'image', SB ),
                            SBLCK_STORE[ I ].cm.image( itemImage, 'itemImage', onImageChange, 'Current Image' ),
                            SBLCK_STORE[ I ].cm.inspector_radio( 'itemImageV', itemImageV, onTextChange, SB ),
                            SBLCK_STORE[ I ].cm.inspector_radio( 'itemImageH', itemImageH, onTextChange, SB ),
                            SBLCK_STORE[ I ].cm.inspector_toggle( 'itemImageOverlay', itemImageOverlay, onToggleChange, SB ),
                        ),
                        EL(
                            PanelBody,
                            SBLCK_STORE[ I ].cm.panel_atts( 'link', SB ),
                            SBLCK_STORE[ I ].cm.panel_desc( 'link', SB ),
                            SBLCK_STORE[ I ].cm.inspector_text( 'itemLink', itemLink, onTextChange, SB ),
                            SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLinkNew', itemLinkNew, onToggleChange, SB )
                        ),
                        EL(
                            PanelBody,
                            SBLCK_STORE[ I ].cm.panel_atts( 'linked', SB ),
                            SBLCK_STORE[ I ].cm.panel_desc( 'linked', SB ),
                            SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLinkTitle', itemLinkTitle, onToggleChange, SB ),
                            SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLinkImage', itemLinkImage, onToggleChange, SB ),
                            SBLCK_STORE[ I ].cm.inspector_toggle( 'itemLinkLabel', itemLinkLabel, onToggleChange, SB )
                        ),
                        SBLCK_STORE[ I ].bg.inspector( 'itemBackground', onTextChange, SBLCK_STORE[ I ].bg.image )
                    ),
                    SBLCK_STORE[ I ].cm.ghost( itemBackground ),
                    EL(
                        SBIS.inner.tagName,
                        {
                            key       : SBIS.inner.className + SBLCK_STORE[ I ].cm.random,
                            className : SBIS.inner.className
                        },
                        EL(
                            SBIS.imageWrap.tagName,
                            {
                                key       : SBIS.imageWrap.className + SBLCK_STORE[ I ].cm.random,
                                className : SBIS.imageWrap.className,
                            },
                            EL(
                                SBIS.imageInner.tagName,
                                {
                                    key       : SBIS.imageInner.className + SBLCK_STORE[ I ].cm.random,
                                    className : SBIS.imageInner.className,
                                },
                                add_editor_image( itemImage )
                            )
                        ),
                        EL(
                            SBIS.text.tagName,
                            {
                                key       : SBIS.text.className + SBLCK_STORE[ I ].cm.random,
                                className : SBIS.text.className,
                            },
                            isSelected || itemTitle ?
                                EL(
                                    SBIS.headline.tagName,
                                    {
                                        key       : SBIS.headline.className + SBLCK_STORE[ I ].cm.random,
                                        className : SBIS.headline.className,
                                    },
                                    EL(
                                        RichText,
                                        {
                                            tagName                : SBA.itemTitle.tagName,
                                            key                    : SBA.itemTitle.className + SBLCK_STORE[ I ].cm.random,
                                            className              : props.className + ' ' + SBA.itemTitle.className,
                                            value                  : itemTitle,
                                            placeholder            : SBA.itemTitle.placeholder,
                                            multiline              : SBA.itemTitle.multiline,
                                            keepPlaceholderOnFocus : true,
                                            onChange               : val => {
                                                onTextChange( 'itemTitle', val )
                                            }
                                        }
                                    )
                                ) : null,
                            isSelected || itemLabel ?
                                EL(
                                    SBIS.label.tagName,
                                    {
                                        key       : SBIS.label.className,
                                        className : SBIS.label.className,
                                    },
                                    EL(
                                        'div',
                                        {
                                            key       : SBA.itemLabel.className + SBLCK_STORE[ I ].cm.random,
                                            className : SBA.itemLabel.className,
                                        },
                                        EL(
                                            RichText,
                                            {
                                                tagName                : SBA.itemLabel.tagName,
                                                key                    : SBA.itemLabel.className + SBLCK_STORE[ I ].cm.random,
                                                className              : props.className,
                                                value                  : itemLabel,
                                                placeholder            : SBA.itemLabel.placeholder,
                                                multiline              : SBA.itemLabel.multiline,
                                                keepPlaceholderOnFocus : true,
                                                onChange               : val => {
                                                    onTextChange( 'itemLabel', val )
                                                }
                                            }
                                        )
                                    )
                                ) : null,
                            isSelected || itemText ?
                                EL(
                                    SBIS.excerpt.tagName,
                                    {
                                        key       : SBIS.excerpt.className,
                                        className : SBIS.excerpt.className,
                                    },
                                    EL(
                                        RichText,
                                        {
                                            tagName                : SBA.itemText.tagName,
                                            key                    : SBA.itemText.className + SBLCK_STORE[ I ].cm.random,
                                            className              : props.className + ' ' + SBA.itemText.className,
                                            placeholder            : SBA.itemText.placeholder,
                                            keepPlaceholderOnFocus : true,
                                            value                  : itemText,
                                            multiline              : SBA.itemText.multiline,
                                            onChange               : val => {
                                                onTextChange( 'itemText', val )
                                            }
                                        },
                                    )
                                ) : null,
                            isSelected || itemButton ?
                                EL(
                                    SBIS.button.tagName,
                                    {
                                        key       : SBIS.button.className,
                                        className : SBIS.button.className,
                                    },
                                    EL(
                                        RichText,
                                        {
                                            tagName                : SBA.itemButton.tagName,
                                            key                    : SBA.itemButton.className + SBLCK_STORE[ I ].cm.random,
                                            className              : SBA.itemButton.className,
                                            value                  : itemButton,
                                            placeholder            : SBA.itemButton.placeholder,
                                            multiline              : SBA.itemButton.multiline,
                                            keepPlaceholderOnFocus : true,
                                            onChange               : val => {
                                                onTextChange( 'itemButton', val )
                                            }
                                        }
                                    )
                                ) : null
                        )
                    )
                )
            )
        },
        save : function () {
            return null;
        }
    } );

    /**
     * Adds image to editor
     *
     * @param itemImage
     * @returns {*}
     */
    function add_editor_image( itemImage ) {

        if ( typeof ( itemImage ) === 'undefined' || typeof ( itemImage.url ) === 'undefined' || ! itemImage.url )
            return null;

        return (
            EL(
                SBIS.image.tagName,
                {
                    key       : SBIS.image.className,
                    className : SBIS.image.className,
                    src       : itemImage.url,
                    alt       : typeof ( itemImage ) !== 'undefined' ? itemImage.alt : ''
                },
            )
        )
    }

    /**
     * Gets post
     *
     * @param id
     * @param routes
     * @returns {Promise<any>}
     */
    function get_post( id, routes ) {

        return new Promise(
            function ( resolve ) {
                FETCH( {
                    path : routes.post + '/' + id
                } ).then(
                    function ( res ) {
                        resolve( res )
                    }
                )
            }
        )
    }

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement, wp.apiFetch );