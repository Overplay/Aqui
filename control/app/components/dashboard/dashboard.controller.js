/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "dashboardController",
    function ( $scope, ogDevice, $log, uibHelper,ogNet, $state ) {

        $log.info( "Loading dashboardController" );
        
        function reloadAppList() {
            ogNet.getApps()
                .then( function ( apps ) {
                    angular.extend( $scope, apps );
                } )
                .catch( function( err ){
                    uibHelper.headsupModal( "We Have a Problem!", "We seem to have lost communication with your Ourglass system. Please check your WiFi connection and make sure the Ourglass is turned on." );
                })
        }
        
        reloadAppList();
        
        $scope.$on(
            "RELOAD_APPS",
            function ( event ) {
                $log.debug("Told to reload app list!");
                reloadAppList();
            }
        );

        if (!ogDevice.venue){
            uibHelper.confirmModal("Register?", "This Ourglass device has not been registered with a venue. Would you like to do that now?", true)
                .then(function(){
                    $state.transitionTo( 'register', { arg: 'arg' } );
                })
        }

    });