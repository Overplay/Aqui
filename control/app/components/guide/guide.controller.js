/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading guideController" );
        $scope.ui = { loadError: false, refineSearch: 'all', isPaired: ogDevice.isPairedToSTB };

        var gridListing = [];

        function loadListings(){
            ogNet.getGrid(false)
                .then( function ( g ) {
                    $scope.gridListing = g;
                } )
                .catch(function(err){
                    $scope.ui.loadError = true;
                })
                .finally( hud.dismiss );
        }
        

        // Functions (2) to update the listings grid automatically
        // Erik - don't forget to inject $interval
        
        if (ogDevice.isPairedToSTB){
        
            var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 5 min or 300000ms

            var hud = uibHelper.curtainModal( 'Loading Guide' );
            loadListings();

            $scope.$on( "$destroy",
                function ( event ) {
                    $interval.cancel( refreshListings );
                    $log.debug( "destroy called - canceled listings refresh $interval" );
                }
            );
        }
       


    } );


/**
 * Created by erikphillips on 12/16/16.
 */
