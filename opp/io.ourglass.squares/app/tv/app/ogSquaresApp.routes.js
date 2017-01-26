app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    $urlRouterProvider.otherwise( '/attract' );

    $stateProvider

        .state( 'attract', {
            url:         '/attract',
            templateUrl: 'app/components/attract/attract.partial.html',
            controller: 'attractController'
        })

        .state( 'playing', {
            url:         '/playing',
            templateUrl: 'app/components/picksquares/picksquares.partial.html',
            controller:  'pickSquaresController',
            resolve:     {
                grid: function (sqGameService) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

        //TODO abstract states for winners
        .state( 'currentwinner', {
            url:         '/currentwinner',
            templateUrl: 'app/components/register/register.partial.html',
            controller:  'registerController',
            resolve:     {
            }

        })
    

});
