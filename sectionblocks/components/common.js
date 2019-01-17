( function ( SBLCK ) {

    const get_posts = function () {
        let gettem = [];
        return new Promise(
            function ( resolve ) {
                wp.apiFetch( { path : '/wp/v2/types' } ).then(
                    function ( types ) {
                        SBLCK.CFG.posts.types.forEach(
                            function ( el ) {
                                if ( typeof ( types[ el ] ) !== 'undefined' )
                                    gettem.push( el );
                            }
                        )
                    }
                ).then(
                    wp.apiFetch( { path : SBLCK.CFG.plugin.routes.posts } ).then(
                        function ( res ) {
                            resolve( res )
                        }
                    )
                )
            }
        )
    };

    const post_selector_opts = function () {
        return new Promise(
            function ( resolve ) {
                get_posts().then(
                    function ( posts ) {
                        let opts = [ { key : 'postnone', label : 'Select a Post', value : 0 } ];
                        for ( const P of posts ) {
                            opts.push( { key : P.slug, label : P.title, value : P.id } );
                        }
                        resolve( opts );
                    }
                )
            }
        )
    };

    const init = function () {
        post_selector_opts().then( opts => {
            SBLCK.posts = opts;
        } )
    };

    init();

}( window.SBLCK = window.SBLCK || {} ) );