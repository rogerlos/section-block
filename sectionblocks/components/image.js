( function ( SBLCK ) {

    const EL                       = wp.element.createElement;
    const { IconButton, PanelRow } = wp.components;
    const { MediaUpload }          = wp.editor;

    /**
     * Returns image controls to the inspector. If an image is present, displays with "remove" control.
     *
     * @param img    - image array
     * @param key    - key block is saving under
     * @param change - onChange handler
     * @returns {*|*|ActiveX.IXMLDOMElement|any|HTMLElement}
     */
    SBLCK.Image = function ( img, key, change ) {

        img = typeof ( img ) === 'undefined' ? { id : 0 } : img;

        if ( img.id < 1 ) {
            return (
                EL(
                    PanelRow,
                    {
                        key       : 'image-wrapper',
                        className : 'sectionblock-image image-wrapper',
                    },
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
                PanelRow,
                {
                    key       : 'hasimagewrapper',
                    className : "sectionblock-image-wrapper image-wrapper",
                },
                EL(
                    'img',
                    {
                        key : 'hasimageimg',
                        src : img.url,
                        alt : img.alt
                    }
                ),
                EL(
                    'div',
                    {
                        key       : 'hasimagewrapperdiv',
                        className : "media-button-wrapper"
                    },
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

}( window.SBLCK = window.SBLCK || {} ) );