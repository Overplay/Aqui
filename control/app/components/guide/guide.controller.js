/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading guideController" );
        $scope.ui = { loading: true, loadError: false, refineSearch: 'all' };


        function loadListings(){
            ogNet.getGrid()
                .then( function ( g ) {
                    $scope.gridListing = g;
                    $scope.ui.loading = false;
                } );
        }
        

        // Functions (2) to update the listings grid automatically
        // Erik - don't forget to inject $interval
        var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 5 min or 300000ms
        
        loadListings();

        $scope.$on( "$destroy",
            function ( event ) {
                $interval.cancel( refreshListings );
                $log.debug( "destroy called - canceled listings refresh $interval" );
            }
        );


    } );


/**
 * Created by erikphillips on 12/16/16.
 */

app.directive( 'listingsCell',
    function ( $log, ogProgramGuide ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '='
            },
            templateUrl: 'app/components/guide/listingscell.template.html',
            link:        function ( scope, elem, attrs ) {


                scope.changeChannel = function () {
                    $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                    ogProgramGuide.changeChannel( scope.grid.channel.channelNumber );
                };

                scope.getPrintableStartTime = function ( listingDate ) {
                    var date = new Date( Date.parse( listingDate ) );
                    var hour = (date.getHours() > 12 ? date.getHours() - 12 : date.getHours());
                    var min = date.getMinutes();

                    return hour + ":" + (min < 10 ? '0' + min : min);
                };

                var getCurrentListingTime = function () {
                    var now = new Date( Date.now() );
                    var min = now.getMinutes() < 30 ? 0 : 30;

                    now.setMinutes( min );
                    now.setSeconds( 0 );
                    now.setMilliseconds( 0 );

                    return now;
                };

                scope.getShowableDurationWidth = function ( listing ) {
                    var currListingStart = getCurrentListingTime().valueOf();
                    var currListingEnd = currListingStart.valueOf() + 3.5 * 60 * 60 * 1000; // 3.5 hrs max => convert
                                                                                            // to ms

                    var listingStart = Date.parse( listing.listDateTime ).valueOf();
                    var listingEnd = Date.parse( listing.endDateTime ).valueOf(); // get end time of the the show

                    var timeLeft = listing.duration; // timeLeft unit => minutes

                    var diff = currListingStart - listingStart;
                    if ( diff >= 0 ) { // the show started before the current listing time
                        timeLeft = listing.duration - (diff / 1000 / 60); // change the time left for the current view
                    }

                    if ( currListingEnd <= listingStart ) { // the the show starts after currListingEnd
                        timeLeft = 0;
                    } else if ( currListingStart >= listingEnd ) {
                        timeLeft = 0;
                    } else if ( currListingEnd < listingEnd ) {
                        timeLeft = listing.duration - ((listingEnd - currListingEnd) / 1000 / 60); // take difference
                                                                                                   // and convert to
                                                                                                   // min
                    }

                    return (50 * timeLeft) / 30; // 50vw for 30 min show blocks
                }

            }
        }
    }
);