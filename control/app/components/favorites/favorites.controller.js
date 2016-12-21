/**
 * Created by erikphillips on 12/21/16.
 */

app.controller( "favoritesController",
    function ( $scope, $timeout, $log, $interval, $http, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading favoritesController" );
        $scope.ui = { loading: true, loadError: false, refineSearch: 'all'};


        function loadListings(){
            ogNet.getGrid(false)
                .then( function ( g ) {
                    $scope.gridListing = g;
                    $scope.ui.loading = false;
                } );
        }

        // Functions (2) to update the listings grid automatically
        // Erik - don't forget to inject $interval
        var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 15 sec

        loadListings();

        $scope.$on( "$destroy",
            function ( event ) {
                $interval.cancel( refreshListings );
                $log.debug( "destroy called - canceled listings refresh $interval" );
            }
        );

        $scope.favoriteChannel = function ( channel ) {
            if (channel.favorite) {
                uibHelper.confirmModal("Remove from favorites?", "Would you like to remove this channel from your favorites?", true)
                        .then(function(){
                            removeFavorite(channel.channelNumber);
                        })
            } else {
                uibHelper.confirmModal("Add to favorites?", "Would you like to add this channel to your favorites?", true)
                    .then(function(){
                        addFavorite(channel.channelNumber);
                    })
            }
        };

        var addFavorite = function ( channelNum ) {
            $http.post( "/api/channel/favorite/" + channelNum )
                .then( function successCallback() {
                    $log.info('channel added to favorites');
                }, function errorCallback() {
                    $log.error('error adding channel to favorites');
                });
        };

        var removeFavorite = function ( channelNum ) {
            $http.post( "/api/channel/favorite/" + channelNum + "?clear=true" )
                .then( function successCallback() {
                    $log.info('channel removed from favorites');
                }, function errorCallback() {
                    $log.error('error removing channel from favorites');
                });
        };

    } );
