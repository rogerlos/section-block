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

    const { registerBlockType }                                                          = BLOCK;
    const { Button, PanelBody, RadioControl, SelectControl, TextControl, ToggleControl } = COMPS;
    const { InspectorControls, RichText }                                                = ED;

    const SB   = SBLCK.blocks.item;
    const SBA  = SB.cfg.attributes;
    const SBIS = SB.inspector.struct;
    const SBIP = SB.inspector.panels;
    const SBIW = SB.inspector.wp;

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

            let itemBackground = typeof( props.attributes.itemBackground) === 'undefined' ?
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
                            key : 'ppablocks-inspector-controls'
                        },
                        EL(
                            PanelBody,
                            panel_atts( 'select' ),
                            panel_desc( 'select' ),
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
                                panel_atts( 'wp' ),
                                panel_desc( 'wp' ),
                                inspector_wp( 'title', onTextChange, SBLCK_STORE[ I ].cm.random, itemPostContent ),
                                inspector_toggle( 'itemLockTitle', itemLockTitle, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                                inspector_wp( 'excerpt', onTextChange, SBLCK_STORE[ I ].cm.random, itemPostContent ),
                                inspector_toggle( 'itemLockText', itemLockText, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                                inspector_wp( 'category', onTextChange, SBLCK_STORE[ I ].cm.random, itemPostContent ),
                                inspector_toggle( 'itemLockLabel', itemLockLabel, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                                inspector_wp( 'permalink', onTextChange, SBLCK_STORE[ I ].cm.random, itemPostContent ),
                                inspector_toggle( 'itemLockLink', itemLockLink, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                                inspector_wp_image( 'img', onImageChange, SBLCK_STORE[ I ].cm.random, itemPostContent ),
                                inspector_toggle( 'itemLockImage', itemLockImage, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                            ) : null,
                        EL(
                            PanelBody,
                            panel_atts( 'image' ),
                            panel_desc( 'image' ),
                            SBLCK_STORE[ I ].cm.image( itemImage, 'itemImage', onImageChange, 'Current Image' ),
                            inspector_radio( 'itemImageV', itemImageV, onTextChange, SBLCK_STORE[ I ].cm.random ),
                            inspector_radio( 'itemImageH', itemImageH, onTextChange, SBLCK_STORE[ I ].cm.random ),
                            inspector_toggle( 'itemImageOverlay', itemImageOverlay, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                        ),
                        EL(
                            PanelBody,
                            panel_atts( 'link' ),
                            panel_desc( 'link' ),
                            inspector_text( 'itemLink', itemLink, onTextChange, SBLCK_STORE[ I ].cm.random ),
                            inspector_toggle( 'itemLinkNew', itemLinkNew, onToggleChange, SBLCK_STORE[ I ].cm.random )
                        ),
                        EL(
                            PanelBody,
                            panel_atts( 'linked' ),
                            panel_desc( 'linked' ),
                            inspector_toggle( 'itemLinkTitle', itemLinkTitle, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                            inspector_toggle( 'itemLinkImage', itemLinkImage, onToggleChange, SBLCK_STORE[ I ].cm.random ),
                            inspector_toggle( 'itemLinkLabel', itemLinkLabel, onToggleChange, SBLCK_STORE[ I ].cm.random )
                        ),
                        SBLCK_STORE[ I ].bg.inspector( 'itemBackground', onTextChange, SBLCK_STORE[ I ].bg.image )
                    ),
                    ghost( itemBackground ),
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
                    path : routes.post + '/' + id
                } ).then(
                    function ( res ) {
                        resolve( res )
                    }
                )
            }
        )
    }

    /**
     * Ghost function...
     * @todo: DRY
     *
     * @param itemBackground
     * @returns {*}
     */
    function ghost( itemBackground ) {

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
                    src : SBLCK[ itemBackground.ghost.img ]
                }
            )
        )
    }

    /**
     * Radio control for the inspector
     *
     * @param key
     * @param field
     * @param change
     * @param ran
     * @returns {any}
     */
    function inspector_radio( key, field, change, ran ) {
        return (
            EL(
                RadioControl,
                {
                    className : SB.cfg.attributes[ key ].className,
                    key       : SB.cfg.attributes[ key ].className + ran,
                    label     : SB.cfg.attributes[ key ].label,
                    help      : SB.cfg.attributes[ key ].help,
                    options   : SB.cfg.attributes[ key ].options,
                    selected  : field,
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    }

    /**
     * Text control to inspector
     *
     * @param key
     * @param field
     * @param change
     * @param ran
     * @returns {any}
     */
    function inspector_text( key, field, change, ran ) {
        return (
            EL(
                TextControl,
                {
                    className : SB.cfg.attributes[ key ].className,
                    key       : SB.cfg.attributes[ key ].className + ran,
                    label     : SB.cfg.attributes[ key ].label,
                    help      : SB.cfg.attributes[ key ].help,
                    value     : field,
                    onChange  : val => {
                        change( key, val );
                    }
                }
            )
        )
    }

    /**
     * Adds toggle to inspector
     *
     * @param key
     * @param field
     * @param change
     * @param ran
     * @returns {any}
     */
    function inspector_toggle( key, field, change, ran ) {

        return (
            EL(
                ToggleControl,
                {
                    className : SB.cfg.attributes[ key ].className,
                    key       : SB.cfg.attributes[ key ].className + ran,
                    label     : SB.cfg.attributes[ key ].label,
                    help      : SB.cfg.attributes[ key ].help,
                    checked   : field,
                    onChange  : checked => {
                        change( key, checked )
                    }
                }
            )
        )
    }

    function inspector_wp( key, change, ran, post ) {

        let val   = post[ SBIW[ key ].dynamic ].length ? post[ SBIW[ key ].dynamic ] : '';
        let label = typeof ( SBIW[ key ].label ) === 'string' ? SBIW[ key ].label : '';

        return (
            EL(
                'p',
                {
                    key       : 'ppablocks-wp-post-value-' + key + ran,
                    className : 'ppablocks-wp-post-value'
                },
                label,
                EL(
                    'span',
                    {
                        key       : SBIW[ key ].className + ran,
                        className : SBIW[ key ].className
                    },
                    val
                ),
                val ?
                    EL(
                        Button,
                        {
                            key       : SBIW[ key ].className + '-button' + ran,
                            className : SBIW[ key ].className + '-button is-button',
                            onClick   : function () {
                                change( SBIW[ key ].item, val )
                            }
                        },
                        'Copy ' + key + ' to editor'
                    ) : null
            )
        )
    }

    /**
     * Adds image to inspector
     *
     * @param key
     * @param change
     * @param ran
     * @param post
     * @returns {ActiveX.IXMLDOMElement}
     */
    function inspector_wp_image( key, change, ran, post ) {

        let val   = post.img.url.length ? post.img : { id : 0, url : '', alt : '' };
        let src   = val.url ? val.url : '';
        let label = typeof ( SBIW[ key ].label ) === 'string' ? SBIW[ key ].label : '';

        return (
            EL(
                'p',
                {
                    key       : 'ppablocks-wp-post-value-' + key + ran,
                    className : 'ppablocks-wp-post-value'
                },
                label,
                src ?
                    EL(
                        'img',
                        {
                            key       : SBIW[ key ].className + ran,
                            className : SBIW[ key ].className,
                            src       : src,
                        }
                    ) : null,
                src ?
                    EL(
                        Button,
                        {
                            key       : SBIW[ key ].className + '-button' + ran,
                            className : SBIW[ key ].className + '-button is-button',
                            onClick   : function () {
                                change( SBIW[ key ].item, val )
                            }
                        },
                        'Copy image to editor'
                    ) : null
            )
        )

    }

    /**
     * Panel attributes
     *
     * @param panel
     * @returns {{initialOpen: *, key: *, className: *, title: *}}
     */
    function panel_atts( panel ) {
        return {
            initialOpen : SBIP[ panel ].initialOpen,
            className   : SBIP[ panel ].className,
            title       : SBIP[ panel ].title
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
            SBIP[ panel ].desc
        )
    }

} )( wp.blocks, wp.editor, wp.components, wp.element.createElement, wp.apiFetch );