/*********************************

 File:       ogConApp.module
 Function:   Base Control App
 Copyright:  Ourglass
 Date:       4/10/15
 Author:     mkahn

 **********************************/


var app = angular.module('ogConApp', [ 'ui.router', 'ui.bootstrap', 'ui.ogMobile', 'ngAnimate', 'toastr', 'ourglassAPI', 'ngCookies']);


app.config( [ '$cookiesProvider', function ( $cookiesProvider ) {
    // Set $cookies defaults

    // This ensures cookie will be sent with all accesses to the OG
    $cookiesProvider.defaults.path = '/';
    // $cookiesProvider.defaults.secure = true;
    // $cookiesProvider.defaults.expires = exp_date;
    // $cookiesProvider.defaults.domain = my_domain;

    
    
} ] );



app.run( function ( $rootScope, $log ) {

    $rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
        event.preventDefault();
        $log.error( error );
    } );

} );