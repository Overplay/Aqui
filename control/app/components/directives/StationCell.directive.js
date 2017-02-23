/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell',
    function ( $log, ogProgramGuide, uibHelper, $http, $rootScope, $timeout ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '=',
                search: '=',
                nowPlaying: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {

                if (attrs.nowPlaying) {
                    $log.debug("nowPlaying is defined!!");
                    scope.nowPlaying = attrs.nowPlaying;
                }

                scope.changeChannel = function () {
                    // uibHelper.confirmModal("Change Channel?", "Would you like to change to channel " +
                    // scope.grid.channel.channelNumber + "?", true) .then(function(){ $log.debug( "Changing channel
                    // to: " + scope.grid.channel.channelNumber ); ogProgramGuide.changeChannel(
                    // scope.grid.channel.channelNumber ); $rootScope.currentChannel = scope.grid; })

                    var hud = uibHelper.curtainModal( 'Changing...' );
                    $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                    ogProgramGuide.changeChannel( scope.grid.channel.channelNumber )
                        .then( function () {
                            return $timeout(5000);
                        })
                        .then( function () {
                            return ogProgramGuide.getCurrentChannel();
                        })
                        .then( function( channel ) {
                            if ( scope.grid.channel.channelNumber != channel.channelNumber ) {
                                $log.debug("channel numbers do NOT match!");
                                hud.dismiss();
                                uibHelper.headsupModal('Unable to Change Channel', 'The channel change was unsuccessful. You are not subscribed to the channel.');
                            } else {
                                $log.debug("channel change successful");
                                $rootScope.currentChannel = scope.grid; // ERIK: is this allowed? will scope.grid be preserved in the async call?
                                hud.dismiss();
                            }
                        })
                        .catch( function ( err ) {
                            hud.dismiss();
                            switch ( err.status ) {
                                case 406:
                                    uibHelper.headsupModal( "Problem Changing Channel", "There was an issue with changing the channel and your request could not be completed.");
                                    break;
                                case 500:
                                    uibHelper.headsupModal( "Internal Server Error", "The device was not able to change the channel.");
                                    break;
                                default:
                                    uibHelper.headsupModal( "Error: Unable to connect", "Unable to connect to the system. Please check wifi connection and try again.");
                                    break;
                            }
                        });

                    // $rootScope.tempCurrentChannel = scope.grid;
                    // $timeout(function() {
                    //     ogProgramGuide.getCurrentChannel()
                    //         .then(function ( channel ) {
                    //             if ($rootScope.tempCurrentChannel.channel.channelNumber != channel.data.channelNumber) {
                    //                 $log.debug("channel numbers do NOT match!");
                    //                 hud.dismiss();
                    //                 uibHelper.headsupModal('Unable to Change Channel', 'The channel change was unsuccessful. You are not subscribed to the channel.');
                    //             } else {
                    //                 $log.debug("channel change successful");
                    //                 $rootScope.currentChannel = $rootScope.tempCurrentChannel;
                    //                 hud.dismiss();
                    //             }
                    //         })
                    //         .catch(function ( err ) {
                    //             hud.dismiss();
                    //             uibHelper.headsupModal('Error', 'An error has occurred while getting the current channel.');
                    //         })
                    // }, 5000);

                };

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