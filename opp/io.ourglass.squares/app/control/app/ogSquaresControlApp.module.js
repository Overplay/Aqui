/**
 * Created by Erik Phillips on 1/18/17.
 */

var app = angular.module( "ogSquaresControlApp", [ 'ui.router', 'ui.bootstrap', 
    'ui.ogMobile', 'ngAnimate', 'toastr', 'ourglassAPI' ] );

app.run(function($state, $rootScope, $log){


    $rootScope.$on( '$stateChangeError', function ( evt, toState, toParams, fromState, fromParams, error ) {
    
        $log.error("$stateChangeError!");
        
        if ( angular.isObject( error ) && angular.isString( error.code ) ) {
            switch ( error.code ) {
                case 'NOT_AUTHENTICATED':
                    // go to the login page
                    $state.go( 'login' );
                    break;
                default:
                    // set the error object on the error state and go there
                    $state.get( 'error' ).error = error;
                    $state.go( 'error' );
            }
        }
        else {
            // unexpected error
            $state.go( 'error' );
        }
    } );




})
