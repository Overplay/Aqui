/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading guideController" );
        $scope.ui = { loading: true, loadError: false };

        ogNet.getGrid()
            .then( function ( g ) {
                $scope.gridListing = g;
                $scope.ui.loading = false;
            } );
        
    
    } );