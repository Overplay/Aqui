/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, tweetScrape ) {

        $log.info( "Loading scrollerController (BudBoard2)" );

        var bottoms = [ 229, 231, 620, 233, 249 ]

        var TWITTER = true;
        var _twitterAuthorized = false;
        var _tweetSearchTerm = "ESPN";
        var _latestTweets = [];
        var _tweetScrapePromise;

        tweetScrape.init( {

            apiKey:    "ZKGjeMcDZT3BwyhAtCgYtvrb5",
            apiSecret: "iXnv6zwFfvHzZr0Y8pvnEJM9hPT0mYV1HquNCzbPrGb5aHUAtk"

        } );


        function authorizeTwitter() {

            tweetScrape.authorize()
                .then( function ( res ) {
                    $log.debug( "Callback from Auth OK!" );
                    _twitterAuthorized = true;
                    startScraping();

                }, function ( err ) {
                    $log.debug( "Callback from Auth FAIL!" );
                    _twitterAuthorized = true;

                } );

        }

        function startScraping() {

            if ( _twitterAuthorized ) {

                tweetScrape.searchTweets( { q: _tweetSearchTerm, count: 5, lang: 'en', result_type: "popular" } )
                    .then( function ( tweets ) {

                            _latestTweets = tweets;
                            $log.debug( "Scroller controller, got some tweets! " + tweets );
                            _tweetScrapePromise = $timeout( startScraping, 60000 );
                            interleave();

                        },
                        function ( err ) {

                            _latestTweets = [ "Error getting tweets :(" ];
                            $log.error( "ScrollerController trouble getting tweets" );

                        } )

            } else {

                $timeout( authorizeTwitter, 60000 );

            }

        }


        $scope.tvinfo = undefined;
        $scope.updated = 0;

        $scope.messageArray = [ "BudBoard from Budweiser", "The King of Beers", "Change your messages via Control App" ];

        var tweets = [];
        var localMessages = [];

        function logLead() { return "scrollerController: "; }

        function slotForChannel(channel){

        }

        function getTVInfo() {

            $http.get( "http://10.1.10.38:8080/tv/getTuned" )
                .then( function ( data ) {

                        $log.debug( "Got some info from DTV!" );

                        if ( !$scope.tvinfo || ($scope.tvinfo.major != data.data.major) ) {
                            $scope.tvinfo = data.data;

                            if ( bottoms.indexOf( $scope.tvinfo.major ) > -1 ) {
                                optvModel.moveAppToSlot( 0 ); // Bottom
                            } else {
                                optvModel.moveAppToSlot( 1 ); // TOP
                            }

                            _tweetSearchTerm = $scope.tvinfo.title;

                            $scope.messageArray = [ "Looks like you switched to " + $scope.tvinfo.callsign, "Hold on while I grab some tweetage!" ];
                            $scope.updated = new Date().getTime();

                            //Kill anything pending
                            $timeout.cancel(_tweetScrapePromise);

                            startScraping();

                        }


                    },
                    function ( err ) {

                        $log.error( "Could not contact DTV! Failing in silent agony" );

                    } );

        }

        function shuffle( o ) {
            var j, x, i;
            for ( i = o.length; i; i -= 1 ) {
                j = Math.floor( Math.random() * i );
                x = o[ i - 1 ];
                o[ i - 1 ] = o[ j ];
                o[ j ] = x;
            }

            return o;
        }


        function interleave() {

            $scope.messageArray = [];
            //lodash concat not working for some whacky reason
            _latestTweets.forEach( function ( t ) { $scope.messageArray.push( t )} );
            localMessages.forEach( function ( t ) { $scope.messageArray.push( t )} );
            shuffle( $scope.messageArray );

        }


        function modelUpdate( data ) {

            $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
            localMessages = data.messages;
            interleave();


        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.budboard2",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }

        updateFromRemote();

        $interval( getTVInfo, 2500 );

        authorizeTwitter();


    } );

app.directive( 'marqueeScroller', [
    '$log',
    function ( $log ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '='
            },
            templateUrl: 'app/components/scroller/marqueescroller.template.html',
            link:        function ( scope, elem, attrs ) {
                "use strict";
                var idx = 0;
                scope.currentScroller = scope.messageArray[ idx ];

                elem.bind( 'onfinish', function ( ev ) {
                    idx++;
                    if ( idx >= scope.messageArray.length ) idx = 0;
                    scope.currentScroller = scope.messageArray[ idx ];
                } );

            }
        }
    } ]
);


app.directive( 'cssFader', [
    '$log', '$timeout',
    function ( $log, $timeout ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '='
            },
            templateUrl: 'app/components/scroller/cssfader.template.html',
            link:        function ( scope, elem, attrs ) {
                "use strict";
                var idx = 0;

                scope.message = { text: "", fadein: false };
                scope.message.text = scope.messageArray[ idx ];


                function nextMsg() {
                    idx++;
                    if ( idx == scope.messageArray.length ) idx = 0;
                    scope.message.fadein = false;
                    $timeout( scroll, 2000 );
                }


                function scroll() {
                    scope.message.fadein = true;
                    scope.message.text = scope.messageArray[ idx ];
                    $timeout( nextMsg, 8000 );
                }

                $timeout( scroll, 2000 );

            }
        }
    } ]
);

app.directive( 'leftScroller', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '='
            },
            templateUrl: 'app/components/scroller/leftscroller.bud.template.html',
            link:        function ( scope, elem, attrs ) {

                var idx = 0;
                var leftPixel = $window.innerWidth + 20;
                var messageWidth = 0;
                var PIXELS_PER_FRAME = 4;
                var FPS = 30;
                var PIXELS_PER_CHAR = 7;

                var clen = 0;
                var lastLeft;

                function restart() {
                    scope.slider = { leftPos: $window.innerWidth };
                }

                function slide() {

                    scope.slider.leftPos -= PIXELS_PER_FRAME;
                    //$log.info( "leftScroller: position " + scope.slider.leftPos );

                    if ( scope.slider.leftPos < ( -1 * lastLeft) ) {
                        restart();
                    }

                    $timeout( slide, 1000 / FPS );

                }

                function getWidth() {
                    var sliderWidth = document.getElementById( 'slider' ).clientWidth;
                    $log.debug( "Slider div width: " + sliderWidth );

                    clen = 0;

                    scope.messageArray.forEach( function ( m ) {
                        clen += m.length;
                    } )

                    lastLeft = clen * PIXELS_PER_CHAR;
                    $log.debug( "Char len: " + clen );


                }

                restart();
                $log.info( "leftScroller: position " + scope.slider.leftPos );


                scope.$watch( 'messageArray', function ( nval ) {

                    $log.debug( "Message Array changed: " + nval );
                    getWidth();

                } )

                slide();


            }
        }
    } ]
);
