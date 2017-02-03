app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    $urlRouterProvider.otherwise( '/welcome' );

    $stateProvider

        .state( 'welcome', {
            url:         '/welcome',
            templateUrl: 'app/components/welcome/welcome.partial.html',
            controller:  'welcomeController'
        })

        .state( 'picksquares', {
            url:         '/picksquares',
            templateUrl: 'app/components/picksquares/picksquares.partial.html',
            controller:  'pickSquaresController',
            resolve:     {
                grid: function (sqGameService) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

        .state( 'register', {
            url:         '/register',
            templateUrl: 'app/components/register/register.partial.html',
            controller:  'registerController',
            resolve:     {
            }

        })

        .state( 'settings', {
            url:         '/settings',
            templateUrl: 'app/components/settings/settings.partial.html',
            controller:  'settingsController',
            resolve:     {
                grid: function (sqGameService) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

        .state( 'advsettings', {
            url:         '/advsettings',
            templateUrl: 'app/components/settings/advancedsettings.partial.html',
            controller:  'settingsController',
            resolve:     {
                grid: function ( sqGameService ) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        } )

        .state( 'thanks4playing', {
            url:         '/thanks',
            templateUrl: 'app/components/thanks4playing/thanks4playing.partial.html',
            controller: 'thanks4playingController'
        })

        .state( 'results', {
            url:         '/results',
            templateUrl: 'app/components/results/results.partial.html',
            controller:  'resultsController',
            resolve:     {
                model: function( sqGameService ){
                    return sqGameService.getLatestModel();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

        .state( 'score-manually', {
            url:         '/score-manually',
            templateUrl: 'app/components/score-manually/score-manually.partial.html',
            controller:  'scoreManuallyController',
            resolve:     {
                grid: function (sqGameService) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

        .state( 'squareboard', {
            url:         '/squareboard',
            templateUrl: 'app/components/squareboard/squareboard.partial.html',
            controller:  'squareboardController',
            resolve:     {
                grid: function (sqGameService) {
                    return sqGameService.getCurrentGrid();
                }
                // TODO MITCH catch routing error somewhere
            }
        })

});
