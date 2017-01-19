app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    $urlRouterProvider.otherwise( '/welcome' );

    $stateProvider

        .state( 'welcome', {
            url:         '/welcome',
            templateUrl: 'app/components/welcome/welcome.partial.html'
        } )

        .state( 'picksquares', {
            url:         '/picksquares',
            templateUrl: 'app/components/picksquares/picksquares.partial.html',
            controller:  'pickSquaresController',
            resolve:     {
            }

        } )

        .state( 'register', {
            url:         '/register',
            templateUrl: 'app/components/register/register.partial.html',
            controller:  'registerController',
            resolve:     {
            }

        } )

        .state( 'settings', {
            url:         '/register',
            templateUrl: 'app/components/reg/reg.partial.html',
            controller:  'regController',
            resolve:     {}

        } )

        .state( 'thanks4playing', {
            url:         '/thanks',
            templateUrl: 'app/components/thanks4playing/thanks4playing.partial.html',
            controller: 'thanks4playingController'
        } )

        .state( 'results', {
            url:         '/results',
            templateUrl: 'app/components/results/results.partial.html',
            controller:  'resultsController',
            resolve:     {
            }

        } )


} );