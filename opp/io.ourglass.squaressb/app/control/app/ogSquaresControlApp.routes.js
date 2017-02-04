app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    $urlRouterProvider.otherwise( '/welcome' );

    $stateProvider

        .state( 'welcome', {
            url:         '/welcome',
            templateUrl: 'app/components/welcome/welcome.partial.html',
            controller:  'welcomeController'
        })

       
});
