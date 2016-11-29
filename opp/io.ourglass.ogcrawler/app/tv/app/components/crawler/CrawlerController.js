/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Ourglass TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller( "crawlerController",
    function ( $scope, $timeout, $http, $interval, ogTVModel, $log, $window, $q, ogAds ) {


        var TWEET_COUNT = 7, //MAGIC NUMBER?
            TWEET_UPDATE_INTERVAL = 30000;

        $scope.displayArr = [ 'Welcome to Ourglass', "Change these messages through our mobile app!" ];
        $scope.comingUpMessages = [ 'GS @ LAC - 7:30', 'OLYMPIC SWIM - 9:30' ]

        //information pertaining to user control of application
        $scope.crawlerModel = {
            user:        [],
            comingUp:    [],
            twitter:     [],
            ads:         [],
            crawlerFeed: [],
            speed:       100,

            //function to set the display messages to the randomized concatenation of user and twitter messages
            //and coming up
            updateDisplay: function () {

                var _this = this;
                ogAds.getCurrentAd()
                    .then( function ( ad ) {

                        var tempArr = _this.user.concat( _this.twitter );
                        tempArr = tempArr.concat( ad.textAds );
                        tempArr.sort( function () { return 0.5 - Math.random() } );

                        tempArr = tempArr.filter( function ( x ) {
                            return (x !== (undefined || ''));
                        } );

                        _this.crawlerFeed = tempArr;
                        return true;
                    } )

            },

            merge: function ( ad ) {
                //TODO transplant code using _this above into here
            }
        };

        function modelUpdate( data ) {
            $scope.crawlerModel.user = data.messages;
            $scope.crawlerModel.comingUp = data.comingUpMessages;
            reloadTweets();
            //ogTVModel.updateTwitterQuery(data.twitterQueries);
            //$scope.crawlerModel.updateDisplay();
        }

        function reloadTweets() {

            $q.all( [ ogTVModel.getTweets(), ogTVModel.getChannelTweets() ] )
                .then( function ( tweets ) {

                    var mergedTweets = _.merge( tweets[ 0 ], tweets[ 1 ] );

                    var tempArr = [];

                    var count = ( mergedTweets.statuses.length > TWEET_COUNT ) ? TWEET_COUNT : mergedTweets.statuses.length;

                    for ( var i = 0; i < count; i++ ) {
                        var usableTweet = mergedTweets.statuses[ i ].text;
                        usableTweet = usableTweet.replace( /(?:https?|ftp):\/\/[\n\S]+/g, '' );
                        usableTweet = usableTweet.replace( /&amp;/g, '&' );
                        tempArr.push( usableTweet );
                    }

                    $scope.crawlerModel.twitter = tempArr;

                    //crawlerMessages.updateDisplay();

                } )
                .catch( function ( err ) {
                    $log.error( "Shat meeself getting tweets!" );
                } )


        }


        ogTVModel.init( {
            appName:      "io.ourglass.ogcrawler",
            dataCallback: modelUpdate
        } ).then( function () {
            $interval( reloadTweets, TWEET_UPDATE_INTERVAL );
        } );

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
    '$log', '$timeout', '$window', '$interval', 'ogTVModel',
    function ( $log, $timeout, $window, $interval, ogTVModel ) {
        return {
            restrict:    'E',
            scope:       {
                logo:     '=',
                ogModel:  '=',
                bannerAd: '='
            },
            templateUrl: 'app/components/crawler/ogcrawler.template.html',
            link:        function ( scope, elem, attrs ) {


                /*
                 Speed needs to be implemented
                 scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

                 scope.logo should be the path to the logo to show on the left side
                 scope.bannerAd should be the path to a full banner add to be shown periodically

                 none of these are implemented yet
                 */

                scope.displayMessages = _.clone( scope.ogModel.crawlerFeed );

                var shouldRefreshMessages = false;

                var crawlerVelocity = scope.ogModel.speed || 110;
                var scrollerWidth;
                var nextUpIndex = 0;
                var scrollerUl = document.getElementById( 'scroller-ul' );

                // This is on a scope var for debugging on Android
                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };


                function updateModel() {

                    scope.displayMessages = _.clone( scope.ogModel.crawlerFeed );
                    scope.comingUpArray = _.clone( scope.ogModel.comingUp );

                }

                // Dump crawler off screen
                function resetCrawlerTransition() {

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + $window.innerWidth + 'px, 0px)',
                        'transform':         "translate(" + $window.innerWidth + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                }

                function startCrawlerTransition() {

                    var distanceToTravel = $window.innerWidth + scrollerWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;
                    $log.debug( "Transition time: " + tranTime );
                    //$log.debug( "Tranny time: " + tranTime );
                    // Let the DOM render real quick then start transition
                    $timeout( function () {

                        scope.leftPos = {
                            '-webkit-transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transform':         "translate(-" + scrollerWidth + "px, 0px)",
                            'transition':        "all " + tranTime + "s linear"
                        }

                    }, 100 );

                    // And when tran is done, start again.
                    $timeout( doScroll, tranTime * 1000 );

                }

                var NEXT_UP_DURATION = 5000;

                scope.ui = {
                    scrollin:       false,
                    nextUp:         '',
                    isNextUp:       true,
                    isChangingName: false
                };


                function scrollNextUp() {

                    if ( scope.comingUpArray && scope.comingUpArray.length == 0 )
                        return;

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;
                    scope.ui.isNextUp = true;
                    scope.ui.isChangingName = false;

                    $timeout( function () {

                        scope.ui.nextUp = scope.comingUpArray[ nextUpIndex ];
                        nextUpIndex++;
                        if ( nextUpIndex == scope.comingUpArray.length ) {
                            nextUpIndex = 0;
                            scope.ui.scrollin = true;

                            $timeout( function () {
                                scope.ui.scrollin = false;
                                $timeout( function () {
                                    ogTVModel.getChannelInfo().then( function ( data ) {
                                        if ( data != undefined && data.programTitle != undefined ) {
                                            scope.ui.isChangingName = true;
                                            $timeout( function () {
                                                scope.ui.nextUp = data.programTitle;
                                                scope.ui.isNextUp = false;
                                                scope.ui.isChangingName = false;
                                                $timeout( function () {
                                                    scope.ui.scrollin = true;
                                                    $timeout( function () {
                                                        scope.ui.scrollin = false;
                                                        $timeout( function () {
                                                            scope.ui.isChangingName = true;
                                                            $timeout( scrollNextUp, 250 );
                                                        }, 500 );
                                                    }, (NEXT_UP_DURATION * 2) );
                                                }, 250 );
                                            }, 250 );
                                        } else {
                                            scope.ui.nextUp = scope.comingUpArray[ nextUpIndex ];
                                            nextUpIndex++;
                                            scope.ui.scrollin = true;

                                            $timeout( function () {
                                                scope.ui.scrollin = false;
                                                $timeout( scrollNextUp, 250 );
                                            }, NEXT_UP_DURATION );
                                        }
                                    } );
                                }, 500 );
                            }, NEXT_UP_DURATION );
                        } else {
                            scope.ui.scrollin = true;

                            $timeout( function () {
                                scope.ui.scrollin = false;
                                $timeout( scrollNextUp, 250 );
                            }, NEXT_UP_DURATION );
                        }
                        // if (nextUpIndex == scope.comingUpArray.length)
                        //     nextUpIndex = 0;
                        // scope.ui.scrollin = true;
                        //
                        // $timeout(function () {
                        //     scope.ui.scrollin = false;
                        //     $timeout(scrollNextUp, 250);
                        // }, NEXT_UP_DURATION);


                    }, 250 )
                }


                // This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
                function loadWidth() {
                    return $timeout( function () {
                        return scrollerUl.offsetWidth;
                    } )
                }

                function doScroll() {

                    scope.ogModel.updateDisplay();
                    updateModel();
                    loadWidth()
                        .then( function ( width ) {
                            $log.debug( "Scroller width: " + width );
                            scrollerWidth = width;
                            resetCrawlerTransition();
                            startCrawlerTransition();
                            scrollNextUp();
                        } );

                }

                var waitToStart = $interval( function () {
                    if ( scope.ogModel ) {
                        doScroll();
                        $interval.cancel( waitToStart );
                    }
                }, 500 );

            }
        }
    } ]
);