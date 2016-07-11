/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Overplay TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller( "crawlerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading crawlerController" );

        $scope.messages = [ "Mitch Kahn Version", "Everybody Wang Chung Tonight!" ];
        $scope.comingUpMessages = [ "1:00 Giants vs. DBacks",
            "4:30 GSW Pregame",
            "5:00 Warriors v Cavs" ];
        $scope.twitterQueries = [];

        function modelUpdate( data ) {
            $scope.messages = data.messages;
            $scope.comingUpMessages = data.comingUpMessages;

            // Combine Twitter queries into one string and set
            var query = "";
            angular.forEach( data.twitterQueries, function ( value ) {
                query += value.method + value.query + ' ';
            } );
            optvModel.setTwitterQuery( query.trim() );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:      "io.ourglass.pubcrawler",
                dataCallback: modelUpdate,
                initialValue: {
                    messages:         $scope.messages,
                    comingUpMessages: $scope.comingUpMessages
                },
                pollInterval: 10000
            } );

        }

        // NFC why this is here...oh wait..maybe because of the weird size issue in the emulators
        $scope.$watch( function () {
            return $window.innerWidth;
        }, function ( value ) {
            console.log( value );
            $scope.screen = { width: $window.innerWidth, height: $window.innerHeight };
        } );

        updateFromRemote();

    } );


/**
 *
 * This directive uses Google's recommendations for removing "janks" in HTML/CSS animations.
 * Only transforms are used with CSS transitions. This improves performance by:
 * - Preventing the layout and paint rendering pipeline steps that happen with other changes (like position)
 * - By using transitions, we only need a callback and the end of the transition, not once per frame
 *
 * Performance using this technique is excellent and looks nearly as good as a CNN/ESPN scroller.
 *
 */
app.directive( 'pubCrawlerXs', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray:  '=',
                logo:          '=',
                comingUpArray: '=',
                bannerAd:      '=',
                speed:         '=?'
            },
            templateUrl: 'app/components/crawler/pubcrawler.template.html',
            link:        function ( scope, elem, attrs ) {


                /*
                   Speed needs to be implemented
                   scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

                   scope.logo should be the path to the logo to show on the left side
                   scope.bannerAd should be the path to a full banner add to be shown periodically

                   none of these are implemented yet


                   */

                var crawlerVelocity = 50;
                var scrollerWidth;
                var nextUpIndex = 0;
                var scrollerUl = document.getElementById( 'scroller-ul' );

                // This is on a scope var for debugging on Android
                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };

                // Dump crawler off screen
                function resetCrawlerTransition(){

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + $window.innerWidth + 'px, 0px)',
                        'transform': "translate(" + $window.innerWidth + 'px, 0px)',
                        'transition': 'all 0s'
                    };

                }

                function startCrawlerTransition() {

                    var tranTime = scrollerWidth / crawlerVelocity;
                    //$log.debug( "Tranny time: " + tranTime );
                    // Let the DOM render real quick then start transition
                    $timeout( function () {

                        scope.leftPos = {
                            '-webkit-transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transition': "all " + tranTime + "s linear"
                        }

                    }, 100 );

                    // And when tran is done, start again.
                    $timeout( doScroll, tranTime * 1000 );

                }


                scope.ui = {
                    scrollin: false,
                    nextUp:   ''
                };


                function scrollNextUp() {

                    if ( scope.comingUpArray.length == 0 )
                        return;

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;

                    $timeout( function () {

                        scope.ui.nextUp = scope.comingUpArray[ nextUpIndex ];
                        nextUpIndex++;
                        if ( nextUpIndex == scope.comingUpArray.length )
                            nextUpIndex = 0;
                        scope.ui.scrollin = true;

                        $timeout( function () {
                            scope.ui.scrollin = false;
                            $timeout( scrollNextUp, 250 );
                        }, 5000 )


                    }, 250 )
                }

                scrollNextUp();


                // This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
                function loadWidth() {
                    return $timeout( function () {
                        return scrollerUl.offsetWidth;
                    } )
                }


                function doScroll() {

                    loadWidth()
                        .then( function ( width ) {
                            $log.debug( "Scroller width: " + width );
                            scrollerWidth = width;
                            resetCrawlerTransition();
                            startCrawlerTransition();
                        } );

                }

                doScroll();

            }
        }
    } ]
);

