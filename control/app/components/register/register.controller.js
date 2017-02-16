/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "registerController",
    function ( $scope, ogDevice, $log, uibHelper, ogNet, $state ) {

        $log.info( "Loading registerController" );
        
        var reregister = false;
        
        $scope.showRegistrationPanel = function(){
            return reregister || !ogDevice.venue;
        };
        
        $scope.device = ogDevice;
        
        $scope.system = { regcode: ""};
        
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
            uibHelper.curtainModal('Registering...');
            ogNet.register( $scope.system.regcode )
                .then( function ( resp ) {
                    //We got a good response, so we should be registered
                    uibHelper.headsupModal( "System Registered", "Thanks for using Ourglass!" )
                        .then(function(){
                            $state.transitionTo( 'dashboard' );
                        })
                } )
                .catch( function ( error ) {

                    $log.debug("Got Error with status: " + error.status);

                    switch ( error.status ) {
                        case 406:
                            uibHelper.headsupModal( "Invalid Registration Code", error.data.error);
                            break;
                        case 500:
                            uibHelper.headsupModal( "Internal Server Error", "The server encountered an unexpected condition which prevented it from fulfilling the registration request.");
                            break;
                        default:
                            uibHelper.headsupModal( "Error: Unable to connect", "Unable to connect to the system. Please check wifi connection and try again.");
                            break;
                    }

                } )
                .finally(uibHelper.dismissCurtain);

        };
    });
