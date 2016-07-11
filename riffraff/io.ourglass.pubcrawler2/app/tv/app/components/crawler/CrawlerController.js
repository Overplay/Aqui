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

        var VERBOSE = true;

        // TODO: This data should be coming from the AB server thru the model API
        $scope.messageArray = [ "Golden State pushes series to decisive Game 7",
            "Try our new Ranch Chicken Salad, $7.99",
            "Don't forget our 4th of July Party!",
            "Try Rheingold IPA, Hop to It",
            "Bangers and Mash on Special for Happy Hour" ];

        // TODO: This data should be coming from the AB server thru the model API
        $scope.comingUpArray = [ "1:00 Giants vs. DBacks", "4:30 GSW Pregame", "5:00 Warriors v Cavs" ];

        function dblog( msg ) {
            if ( VERBOSE )
                $log.debug( "scrollerController: " + msg );
        }

        // TODO this be broke
        function modelUpdate( data ) {

            if ( data.messages ) {
                $scope.messageArray = data.messages;
                $scope.comingUpArray = data.comingUp;
            }


        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.ourglass.pubcrawler2",
                dataCallback:    modelUpdate,
                initialValue:    { messages: $scope.messageArray, comingUp: $scope.comingUpArray }
            } );

        }

        // NFC why this is here...oh wait..maybe because of the weird size issue in the emulators
        $scope.$watch( function () {
            return $window.innerWidth;
        }, function ( value ) {
            console.log( value );
            $scope.screen = { width: $window.innerWidth, height: $window.innerHeight };
        } );

        $scope.logo = "assets/img/brand.png";

        updateFromRemote();

        // Set up Twitter scraping. Static as an example, the query should be kept in the optvModel.
        // optvModel.setTwitterQuery('brexit')
        //     .then( function(data){
        //         $log.debug("Twitter query set");
        //     })
        //     .catch( function(err){
        //         $log.error("Twitter query could not be set");
        //     })
            
        



    } );


app.directive( 'pubCrawler', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray:  '=',
                logo:          '=',
                comingUpArray: '=',
                bannerAd:      '='
            },
            templateUrl: 'app/components/crawler/pubcrawler.template.html',
            link:        function ( scope, elem, attrs ) {

                var SCREEN_WIDTH = window.innerWidth;
                var _nextUpIndex = 0;

                scope.leftPos = { left: SCREEN_WIDTH + 'px' };

                scope.ui = {
                    scrollin:  false,
                    nextUp:    ''
                };

                $timeout( function () {
                }, 5000 );

                var scrollerWidth;
                var currentLeft = SCREEN_WIDTH;
                var FPS = 60;
                var PPF = 2;


                function scroll() {

                    if (scope.comingUpArray.length==0)
                        return;
                        
                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;

                    $timeout( function () {

                        scope.ui.nextUp = scope.comingUpArray[ _nextUpIndex ];
                        _nextUpIndex++;
                        if ( _nextUpIndex == scope.comingUpArray.length )
                            _nextUpIndex = 0;
                        scope.ui.scrollin = true;

                        $timeout( function () {
                            scope.ui.scrollin = false;
                            $timeout( scroll, 250 );
                        }, 5000 )


                    }, 250 )
                }

                scroll();

                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };

                var scrollerUl = document.getElementById( 'scroller-ul' );

                scrollerUl.addEventListener( "transitionend", function () {

                    doScroll();

                }, false );

                // This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
                function loadWidth() {
                    return $timeout( function () {
                        return scrollerUl.offsetWidth;
                    } )
                }

                function assignLeft() {
                    scope.leftPos.left = currentLeft + "px";
                }

                function renderNext() {

                    assignLeft();
                    currentLeft = currentLeft - PPF;
                    if ( currentLeft < -scrollerWidth )
                        doScroll();
                    else
                        $timeout( renderNext, 1000 / FPS );


                }

                function doScroll() {

                    loadWidth()
                        .then( function ( width ) {
                            $log.debug( "Scroller width: " + width );
                            scrollerWidth = width;
                            currentLeft = SCREEN_WIDTH;
                            renderNext();
                        } );

                }

                doScroll();

            }
        }
    } ]
);





