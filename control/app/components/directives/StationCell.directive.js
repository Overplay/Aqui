/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell',
    function ( $log, ogProgramGuide, uibHelper, $http ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '=',
                search: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {


                scope.changeChannel = function () {
                    uibHelper.confirmModal("Change Channel?", "Would you like to change to channel " + scope.grid.channel.channelNumber + "?", true)
                        .then(function(){
                            $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                            ogProgramGuide.changeChannel( scope.grid.channel.channelNumber );
                        })

                }

                scope.displayTime = function ( timeStr) {

                    var date = new Date(Date.parse(timeStr));
                    var hour = (date.getHours() > 12 ? date.getHours() - 12 : date.getHours());
                    var min = date.getMinutes();

                    return hour + ':' + (min < 10 ? '0' + min : min);
                }


                scope.favoriteChannel = function ( channel ) {
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
                    var localGrid = JSON.parse( localStorage.getItem("grid") );

                    if ( localGrid ) {
                        for (var i = 0; i < localGrid.length; i++) {
                            if (localGrid[i].channel.channelNumber == channel.channelNumber) {
                                localGrid[i].channel.favorite = changeTo;
                                scope.grid.channel.favorite = changeTo;
                                $log.debug('channel favorite changed locally');

                                localStorage.setItem('grid', JSON.stringify( localGrid ));

                                return true;
                            }
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

            }
        }
    }
);