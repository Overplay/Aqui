/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "registerController",
    function ( $scope, ogDevice, $log, uibHelper, ogNet, $state ) {

        $log.info( "Loading registerController" );
        
        var reregister = false;
        
        $scope.showRegistrationPanel = function(){
            return reregister || !ogDevice.venue;
        }
        
        $scope.device = ogDevice;
        
        if (ogDevice.venue){
            $log.debug("Already regged");
            uibHelper.confirmModal("Re-Register?", 
                "This system is already registered to a venue. Do you want to re-register?", 
                true)
                .then(function(){
                    reregister = true;
                })
                .catch(function(val){
                    $state.transitionTo('settings');
                })
        }

        $scope.register = function () {
            $log.debug( "Registering using code." );
            ogNet.register( $scope.system.regCode )
                .then( function ( resp ) {
                    //We got a good response, so we should be registered
                    uibHelper.headsupModal( "System Registered", "Thanks for using Ourglass!" );
                } )
                .catch( function ( err ) {
                    uibHelper.headsupModal( "Something Bad Happened!", "Could not register Ourglass system. Please try again!" );

                } )

        }
        
    
    } );