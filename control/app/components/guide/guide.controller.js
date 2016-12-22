/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading guideController" );
        $scope.ui = { loading: true, loadError: false, refineSearch: 'all' };


        function loadListings(){
            ogNet.getGrid(true)
                .then( function ( g ) {
                    $scope.gridListing = g;
                    $scope.ui.loading = false;
                } );
        }

        // $scope.$on('$viewContentLoaded', function(){
        //     //Here your view content is fully loaded !!
        //     $scope.ui.loading = false;
        // });
        

        // Functions to update the listings grid automatically
        // var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 5 min or 300000ms

        // $scope.$on( "$destroy",
        //     function ( event ) {
        //         $interval.cancel( refreshListings );
        //         $log.debug( "destroy called - canceled listings refresh $interval" );
        //     }
        // );

        loadListings();

    } );


/**
 * Created by erikphillips on 12/16/16.
 */
