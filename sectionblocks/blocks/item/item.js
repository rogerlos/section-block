/**
 * @typedef {Object} SBLCK
 * @property {Object} CFG
 * @property {Object} CFG.blocks
 * @property {Object} CFG.blocks.item
 * @property {Object} CFG.blocks.item.cfg
 * @property {Object} CFG.blocks.item.cfg.attributes
 * @property {Object} CFG.blocks.item.cfg.attributes.itemButton
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLabel
 * @property {Object} CFG.blocks.item.cfg.attributes.itemText
 * @property {Object} CFG.blocks.item.cfg.attributes.itemName
 * @property {Object} CFG.blocks.item.cfg.attributes.itemTitle
 * @property {Object} CFG.blocks.item.cfg.attributes.itemBackground
 * @property {Object} CFG.blocks.item.cfg.attributes.itemImage
 * @property {Object} CFG.blocks.item.cfg.attributes.itemImageV
 * @property {Object} CFG.blocks.item.cfg.attributes.itemImageH
 * @property {Object} CFG.blocks.item.cfg.attributes.itemImageOverlay
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLink
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLinkNew
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLinkTitle
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLinkImage
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLinkLabel
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLockTitle
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLockImage
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLockText
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLockLabel
 * @property {Object} CFG.blocks.item.cfg.attributes.itemLockLink
 * @property {Object} CFG.blocks.item.cfg.attributes.itemPost
 * @property {Object} CFG.blocks.item.cfg.attributes.itemPostContent
 * @property {String} CFG.blocks.item.cfg.tagName
 * @property {Object} CFG.blocks.item.inspector
 * @property {Object} CFG.blocks.item.inspector.panels
 * @property {Object} CFG.blocks.item.inspector.panels.select
 * @property {Object} CFG.blocks.item.inspector.panels.wp
 * @property {Object} CFG.blocks.item.inspector.panels.image
 * @property {Object} CFG.blocks.item.inspector.panels.link
 * @property {Object} CFG.blocks.item.inspector.panels.linked
 * @property {Object} CFG.blocks.item.inspector.panels.lock
 * @property {Object} CFG.blocks.item.inspector.struct
 * @property {Object} CFG.blocks.item.inspector.struct.wrap
 * @property {Object} CFG.blocks.item.inspector.struct.inner
 * @property {Object} CFG.blocks.item.inspector.struct.imageWrap
 * @property {Object} CFG.blocks.item.inspector.struct.imageInner
 * @property {Object} CFG.blocks.item.inspector.struct.image
 * @property {Object} CFG.blocks.item.inspector.struct.text
 * @property {Object} CFG.blocks.item.inspector.struct.headline
 * @property {Object} CFG.blocks.item.inspector.struct.label
 * @property {Object} CFG.blocks.item.inspector.struct.excerpt
 * @property {Object} CFG.blocks.item.inspector.struct.button
 * @property {Object} CFG.blocks.item.inspector.wp
 * @property {INWP} CFG.blocks.item.inspector.wp.title
 * @property {INWP} CFG.blocks.item.inspector.wp.excerpt
 * @property {INWP} CFG.blocks.item.inspector.wp.category
 * @property {INWP} CFG.blocks.item.inspector.wp.img
 * @property {INWP} CFG.blocks.item.inspector.wp.permalink
 * @property {Object} CFG.posts
 * @property {Object} CFG.posts.DY
 * @property {Object} CFG.posts.emptypost
 * @property {function} Random
 * @property {object} PANEL
 * @property {object} INSPECTOR
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

    const CFG       = SBLCK.CFG;
    const SB        = CFG.blocks.item;
    const SBA       = SB.cfg.attributes;
    const SBIS      = SB.inspector.struct;
    const USE       = CFG.use.item;
    const DY        = {
        posts    : [],
        selected : '',
        post     : null,
        old      : {},
        fetching : false
    };
    const RND       = SBLCK.Random;
    const PANEL     = SBLCK.PANEL;
    const INSPECTOR = SBLCK.INSPECTOR;

    registerBlockType( 'sectionblock/item', {

        ...SB.cfg,

        edit : ( props ) => {

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

            const saveBG = ( key, val, parent ) => {

                let b = props.attributes.itemBackground ? props.attributes.itemBackground : SBLCK.BG.GetProps();

                if ( typeof( parent ) !== 'undefined' ) {

                    if ( ! b[ parent ].hasOwnProperty( key ) ) {
                        let check = SBLCK.BG.GetProps();
                        if ( check[ parent ].hasOwnProperty( key ) ) {
                            b[ parent ] = check[ parent ];
                        }
                    }
                    b[ parent ][ key ] = val;
                } else  {
                    b[ key ] = val;
                }
                props.setAttributes( { itemBackground: b } );
                props.setAttributes( { updated: Date.now() } );
            };

            const onPostChange = val => {
                let id = val;
                props.setAttributes( { itemPost : id } );
                if ( parseInt( id ) === 0 ) {
                    props.setAttributes( { itemPostContent : CFG.posts.emptypost } );
                    updatePostVals();
                    return;
                }
                if ( DY.selected === id ) return;
                DY.old      = DY.selected;
                DY.selected = id;
                DY.fetching = true;
                get_post( id, CFG.plugin.routes ).then( post => {
                    props.setAttributes( { itemPostContent : post } );
                    itemPostContent = post;
                    DY.fetching     = false;
                    updatePostVals();
                } );
            };

            const updatePostVals = () => {
                props.setAttributes( { itemPost : itemPostContent.id } );
                if ( itemLockLink ) onTextChange( 'itemLink', itemPostContent.permalink );
                if ( itemLockLabel ) onTextChange( 'itemLabel', itemPostContent.category.term );
                if ( itemLockTitle ) onTextChange( 'itemTitle', itemPostContent.title );
                if ( itemLockText ) onTextChange( 'itemText', itemPostContent.excerpt );
                if ( itemLockImage ) onImageChange( 'itemImage', itemPostContent.img );
            };

            let itemPostContent = typeof ( props.attributes.itemPostContent ) === 'undefined' ?
                CFG.posts.emptypost : props.attributes.itemPostContent;

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

            let itemButton = props.attributes.itemButton;
            let itemLabel  = props.attributes.itemLabel;
            let itemText   = props.attributes.itemText;
            let itemTitle  = props.attributes.itemTitle;

            let isSelected = props.isSelected;

            let itemBackground = props.attributes.itemBackground ? props.attributes.itemBackground : SBLCK.BG.GetProps();

            let iClass = props.attributes.iClass ?
                props.attributes.iClass :
                onTextChange( 'iClass', CFG.selects.iClass[ 0 ].value );

            let advanced = props.attributes.className ? props.attributes.className : '';

            DY.posts = SBLCK.posts;

            if ( itemPost && itemPostContent.id !== itemPost && ! DY.fetching ) onPostChange( itemPost );
            if ( typeof ( DY.selected ) === 'undefined' || DY.selected === '' ) DY.selected = itemPost;

            return (
                EL(
                    SBIS.wrap.tagName,
                    {
                        key       : SBIS.wrap.className + RND,
                        className : SBLCK.BG.Classes( itemBackground ) + classes( iClass, advanced ),
                        style     : SBLCK.BG.InlineStyle( 'item', itemBackground )
                    },
                    EL(
                        InspectorControls,
                        {
                            key       : 'sectionblock-inspector-controls',
                            className : 'sectionblock-inspector'
                        },
                        EL(
                            PanelBody,
                            PANEL.Atts( 'select', SB ),
                            PANEL.Desc( 'select', SB ),
                            EL(
                                SelectControl,
                                {
                                    key       : SBA.iClass.className + RND,
                                    className : SBA.iClass.className,
                                    label     : SBA.iClass.label,
                                    help      : SBA.iClass.help,
                                    options   : CFG.selects.iClass,
                                    value     : iClass,
                                    onChange  : val => {
                                        onTextChange( 'iClass', val )
                                    }
                                }
                            ),
                        ),
                        EL(
                            PanelBody,
                            PANEL.Atts( 'wp', SB ),
                            PANEL.Desc( 'wp', SB ),
                            EL(
                                SelectControl,
                                {
                                    key       : SBA.itemPost.className + RND,
                                    className : SBA.itemPost.className,
                                    label     : SBA.itemPost.label,
                                    help      : SBA.itemPost.help,
                                    options   : typeof ( DY.posts ) === 'undefined' || DY.posts.length < 2 ? [ CFG.posts.DY ] : DY.posts,
                                    value     : itemPost,
                                    onChange  : onPostChange
                                }
                            ),
                            INSPECTOR.Wp( 'title', onTextChange, itemPostContent, SB ),
                            INSPECTOR.Toggle( 'itemLockTitle', itemLockTitle, onToggleChange, SB ),
                            INSPECTOR.Wp( 'excerpt', onTextChange, itemPostContent, SB ),
                            INSPECTOR.Toggle( 'itemLockText', itemLockText, onToggleChange, SB ),
                            INSPECTOR.Wp( 'category', onTextChange, itemPostContent, SB ),
                            INSPECTOR.Toggle( 'itemLockLabel', itemLockLabel, onToggleChange, SB ),
                            INSPECTOR.Wp( 'permalink', onTextChange, itemPostContent, SB ),
                            INSPECTOR.Toggle( 'itemLockLink', itemLockLink, onToggleChange, SB ),
                            INSPECTOR.WpImage( 'img', onImageChange, itemPostContent, SB ),
                            INSPECTOR.Toggle( 'itemLockImage', itemLockImage, onToggleChange, SB ),
                        ),
                        EL(
                            PanelBody,
                            PANEL.Atts( 'image', SB ),
                            PANEL.Desc( 'image', SB ),
                            SBLCK.Image( itemImage, 'itemImage', onImageChange ),
                            INSPECTOR.Radio( 'itemImageV', itemImageV, onTextChange, SB ),
                            INSPECTOR.Radio( 'itemImageH', itemImageH, onTextChange, SB ),
                            INSPECTOR.Toggle( 'itemImageOverlay', itemImageOverlay, onToggleChange, SB ),
                        ),
                        EL(
                            PanelBody,
                            PANEL.Atts( 'link', SB ),
                            PANEL.Desc( 'link', SB ),
                            INSPECTOR.Text( 'itemLink', itemLink, onTextChange, SB ),
                            INSPECTOR.Toggle( 'itemLinkNew', itemLinkNew, onToggleChange, SB ),
                            EL(
                                'p',
                                {
                                    className : 'sectionblock-inspector-title'
                                },
                                'Clickable Elements'
                            ),
                            INSPECTOR.Toggle( 'itemLinkTitle', itemLinkTitle, onToggleChange, SB ),
                            INSPECTOR.Toggle( 'itemLinkImage', itemLinkImage, onToggleChange, SB ),
                            INSPECTOR.Toggle( 'itemLinkLabel', itemLinkLabel, onToggleChange, SB ),
                            EL(
                                'p',
                                {
                                    className : 'components-base-control__help'
                                },
                                'Change which elements are linked. (Buttons are always linked.)'
                            )
                        ),
                        SBLCK.BG.Inspector( 'itemBackground', saveBG, itemBackground )
                    ),
                    USE.background.ghost ? SBLCK.BG.GhostDisplay( itemBackground ) : null,
                    EL(
                        SBIS.inner.tagName,
                        {
                            key       : SBIS.inner.className + RND,
                            className : SBIS.inner.className
                        },
                        EL(
                            SBIS.imageWrap.tagName,
                            {
                                key       : SBIS.imageWrap.className + RND,
                                className : SBIS.imageWrap.className,
                            },
                            EL(
                                SBIS.imageInner.tagName,
                                {
                                    key       : SBIS.imageInner.className + RND,
                                    className : SBIS.imageInner.className,
                                },
                                add_editor_image( itemImage )
                            )
                        ),
                //        EL(
                //            SBIS.text.tagName,
                //            {
                //                key       : SBIS.text.className + RND,
                //                className : SBIS.text.className,
                //            },
                            isSelected || itemTitle ?
                                EL(
                                    SBIS.headline.tagName,
                                    {
                                        key       : SBIS.headline.className + RND,
                                        className : SBIS.headline.className,
                                    },
                                    EL(
                                        RichText,
                                        {
                                            tagName                : SBA.itemTitle.tagName,
                                            key                    : SBA.itemTitle.className + RND,
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
                                            key       : SBA.itemLabel.className + RND,
                                            className : SBA.itemLabel.className,
                                        },
                                        EL(
                                            RichText,
                                            {
                                                tagName                : SBA.itemLabel.tagName,
                                                key                    : SBA.itemLabel.className + RND,
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
                                            key                    : SBA.itemText.className + RND,
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
                                            key                    : SBA.itemButton.className + RND,
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
                //        )
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
        if ( typeof ( itemImage ) === 'undefined' || typeof ( itemImage.url ) === 'undefined' || ! itemImage.url ) return null;
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
                    path : routes.post + '?id=' + id
                } ).then(
                    function ( res ) {
                        resolve( res )
                    }
                )
            }
        )
    }

    /**
     * Add classes to wrapper
     *
     * @param iClass
     * @param advanced
     * @returns {*}
     */
    function classes( iClass, advanced ) {

        let l = SBIS.wrap.className;

        l += iClass ? ' '  + iClass : '';
        l += advanced ? ' ' + advanced : '';

        return l;
    }

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement, wp.apiFetch );