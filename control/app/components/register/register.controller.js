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
        
        $scope.system = { regcode: ""}
        
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
                    var msg = error.data && error.data.error;
                    
                    uibHelper.headsupModal( "Something Bad Happened!", 
                        msg ? msg: 'Lost connection to system. Check WiFi.' );

                } )
                .finally(uibHelper.dismissCurtain);

        }
        
    
    } );