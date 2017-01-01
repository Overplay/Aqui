app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );

    $urlRouterProvider.otherwise( '/dashboard' );

    $stateProvider


        .state( 'dashboard', {
            url:         '/dashboard',
            templateUrl: 'app/components/dashboard/dashboard.template.html',
            controller: 'dashboardController',
            resolve:     {
                ogDevice: function ( ogNet ) {
                    return ogNet.getDeviceInfo();
                }
            }

        } )

        .state( 'guide', {
            url:         '/guide',
            templateUrl: 'app/components/guide/guide.template.html',
            controller:  'guideController',
            resolve:     {
                ogDevice: function ( ogNet ) {
                    return ogNet.getDeviceInfo();
                }
            }

        } )

        .state( 'settings', {
            url:         '/settings',
            templateUrl: 'app/components/settings/settings.template.html',
            controller:  'settingsController',
            resolve:     {
                ogDevice: function ( ogNet ) {
                    return ogNet.getDeviceInfo();
                }
            }

        } )

        .state( 'register', {
            url:         '/register',
            templateUrl: 'app/components/register/register.template.html',
            controller:  'registerController',
            resolve:     {
                ogDevice: function ( ogNet ) {
                    return ogNet.getDeviceInfo();
                }
            }

        } )

        

});