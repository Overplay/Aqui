/**
 * Created by Erik Phillips on 1/18/17.
 */

var app = angular.module( "ogSquaresControlApp", [ 'ui.router', 'ui.bootstrap', 
    'ui.ogMobile', 'ngAnimate', 'toastr', 'ourglassAPI' ] );

app.config( function ( toastrConfig ) {
    angular.extend( toastrConfig, {
        maxOpened:             1,
        newestOnTop:           true,
        positionClass:         'toast-bottom-center',
        preventDuplicates:     true,
        preventOpenDuplicates: true
    } );
} );

app.run(function($state, $rootScope, $log){

    //TODO this was transplanetd and is wrong for this app
    $rootScope.$on( '$stateChangeError', function ( evt, toState, toParams, fromState, fromParams, error ) {
    
        $log.error("$stateChangeError!");
        
        if ( angular.isObject( error ) && angular.isString( error.code ) ) {
            switch ( error.code ) {
                case 'NOT_AUTHENTICATED':
                    // go to the login page
                    $state.go( 'welcome' );
                    break;
                default:
                    // set the error object on the error state and go there
                    $state.get( 'error' ).error = error;
                    $state.go( 'welcome' );
            }
        }
        else {
            // unexpected error
            $state.go( 'welcome' );
        }
    } );

});

app.filter('makeInitials', function(){
    return function(name){
        var initials;
        var array = name.split( ' ' );
        if ( array.length == 1 ) {
            initials = array[ 0 ].charAt( 0 ).toUpperCase();
        } else {
            initials = array[ 0 ].charAt( 0 ).toUpperCase() + array[ array.length - 1 ].charAt( 0 ).toUpperCase();
        }

        return initials;
    }
})
