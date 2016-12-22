/**
 * Created by erikphillips on 12/21/16.
 */

app.controller( "favoritesController",
    function ( $scope, $timeout, $log, $interval, $http, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading favoritesController" );
        $scope.ui = { loading: true, loadError: false, refineSearch: 'all'};


        function loadListings(){
            ogNet.getGrid(true)
                .then( function ( g ) {
                    $scope.gridListing = g;
                    $scope.ui.loading = false;
                    $log.debug('loading new grid data now');
                } );
        }

        // Functions (2) to update the listings grid automatically
        // Erik - don't forget to inject $interval
        var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 15 sec

        $scope.$on( "$destroy",
            function ( event ) {
                $interval.cancel( refreshListings );
                $log.debug( "destroy called - canceled listings refresh $interval" );
            }
        );

        loadListings();

        $scope.favoriteChannel = function ( channel ) {
            if (channel.favorite) {
                uibHelper.confirmModal("Remove from favorites?", "Would you like to remove this channel from your favorites?", true)
                    .then(function(){
                        removeFavorite(channel.channelNumber);
                        locallyChangeFavorite(channel, false);
                    })
            } else {
                uibHelper.confirmModal("Add to favorites?", "Would you like to add this channel to your favorites?", true)
                    .then(function() {
                        addFavorite(channel.channelNumber);
                        locallyChangeFavorite(channel, true);
                    })
            }
        };

        var locallyChangeFavorite = function (channel, changeTo) {
            for (var i = 0; i < $scope.gridListing.length; i++) {
                if ($scope.gridListing[i].channel.channelNumber == channel.channelNumber) {
                    $scope.gridListing[i].channel.favorite = changeTo;
                    $log.debug('channel favorite changed locally');

                    localStorage.setItem('grid', JSON.stringify( $scope.gridListing ));

                    return true;
                }
            }

            $log.error('unable to find channel to change favorite locally');
            return false;
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
