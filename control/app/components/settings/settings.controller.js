/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "settingsController",
    function ( $scope, ogDevice, $log, uibHelper, $cookies, ogNet, $timeout ) {

        $log.info( "Loading settingsController" );
        $scope.ui = { loading: true, loadError: false };
        
        $scope.system = { name: ogDevice.name, locationWithinVenue: ogDevice.locationWithinVenue };

        $scope.updateSystemName = function () {
            uibHelper.confirmModal( "Update?", "Are you sure you want to update the name and location?", true )
                .then( function ( resp ) {
                    $log.debug( "Responded yes..." );
                    var hud = uibHelper.curtainModal('Updating...');
                    ogNet.updateSystemNameLocation( $scope.system.name, $scope.system.locationWithinVenue )
                        .then( function ( response ) {
                            hud.dismiss();
                            uibHelper.headsupModal('Settings Changed', 'Name and or location successfully updated.');
                        } )
                } )
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