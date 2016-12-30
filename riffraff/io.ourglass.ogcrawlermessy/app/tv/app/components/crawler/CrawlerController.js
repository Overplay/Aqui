/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Ourglass TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller( "crawlerController",
    function ( $scope, $timeout, $http, $interval, ogTVModel, $log, $window, $q, ogAds, ogProgramGuide ) {


        var TWEET_COUNT = 7, //MAGIC NUMBER?
            TWEET_UPDATE_INTERVAL = 30000;

        $scope.displayArr = [ 'Welcome to Ourglass', "Change these messages through our mobile app!" ];
        $scope.comingUpMessages = [ 'GS @ LAC - 7:30', 'OLYMPIC SWIM - 9:30' ]

        //information pertaining to user control of application
        $scope.crawlerModel = {
            user:        [],
            twitter:     [],
            ads:         [],
            crawlerFeed: [],
            speed:       100,

            //function to set the display messages to the randomized concatenation of user and twitter messages
            //and coming up
            updateDisplay: function () {

                var _this = this;
                ogAds.getCurrentAd()
                    .then( function(currentAd){
                        _this.ads = currentAd.textAds || [];
                     } )
                    .then( reloadTweets )
                    .then( function () {

                        var tempArr = [];
                        _this.user.forEach(function(um){
                            tempArr.push({ message: um, color: { color: '#ffffff'}})
                        });

                        _this.twitter.forEach( function ( um ) {
                            tempArr.push({ message: um, color: { color: '#36bcf9' }})
                        } );

                        _this.ads.forEach( function ( um ) {
                            tempArr.push({ message: um, color: { color: '#ccf936' }})
                        } );
                        
                        tempArr = tempArr.filter( function ( x ) {
                            return (x !== (undefined || !x.message));
                        } );

                        _this.crawlerFeed = _.shuffle(tempArr);
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

            return $q.all( [ ogTVModel.getTweets(), ogTVModel.getChannelTweets() ] )
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
                    return true;
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
            $scope.crawlerModel.updateDisplay();
        } );
        
        $scope.nextUp = {
            nowShowing: "",
            comingUp: []
        }

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
    '$log', '$timeout', '$window', '$interval', 'ogTVModel', 'ogProgramGuide',
    function ( $log, $timeout, $window, $interval, ogTVModel, ogProgramGuide ) {
        return {
            restrict:    'E',
            scope:       {
                logo:     '=',
                ogModel:  '=',
                bannerAd: '=',
                nextUp: '='
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

                var testNextUp = attrs.testNextUp!=undefined;
                var currentGrid = { nowPlaying: "Sum Shit", grid: { listings: [
                    { showName: "Yoga Caliente" }, { showName: "Pervs Watching Yoga" }, { showName: "Ping Pong" }
                ]} };

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
                    //scope.comingUpArray = _.clone( scope.ogModel.comingUp );

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

                scope.nup = {
                    nextUp:         '',
                    isNextUp:       true,
                    isChangingTitle: false,
                    scrollin: false
                }

                function GridAnimator(){

                    this.upcomingIdx = 0;
                    this.mode = 'nowshowing';

                    this.switchTitle = function(title){
                        scope.nup.isChangingTitle = true;
                        $timeout((function(newTitle){
                            return function(){
                                scope.nup.title = newTitle
                                scope.nup.isChangingTitle = false;
                            }
                        })(title), 1000);
                    }

                    this.switchMessage = function ( msg ) {
                        scope.nup.scrollin = false;
                        $timeout( (function ( newMessage ) {
                            return function () {
                                scope.nup.message = newMessage
                                scope.nup.scrollin = true;
                            }
                        })( msg ), 1000 );
                    }
                    
                    this.init = function(){

                        var _this = this;
                        ogProgramGuide.getNowAndNext()
                            .then( function ( data ) {
                                $log.debug("Program guide grid loaded!")
                                currentGrid = data.data
                                _this.start();
                            } )
                            .catch( function ( err ) {
                                $log.debug( "Program guide failed to load" );
                                //TODO reclaim screen real estate
                                $timeout( function(){
                                    _this.init();
                                }, 30000);
                            } )
                            
                    }

                    this.start = function(){

                        this.mode = 'nowshowing';
                        this.upcomingIdx = 0;
                        this.switchTitle("Now Showing");
                        scope.nup.scollin = false;
                        var _this = this;
                        $timeout(function(){
                            _this.switchMessage( currentGrid.nowPlaying )
                        }, 1000);
                        $timeout(function(){
                            _this.switchMessage("");
                            _this.switchTitle("Coming Up")
                            $timeout(function(){
                                _this.nextUp();
                            }, 1000);
                        }, NEXT_UP_DURATION*1.5);
                    }

                    this.nextUp = function () {

                        var listings = currentGrid.grid.listings;

                        var _this = this;
                        if (listings.length == 0){
                            this.switchMessage("No Lisitings");
                        } else {
                            if (this.upcomingIdx<listings.length){
                                this.switchMessage(this.makeSensibleMessageFrom(listings[this.upcomingIdx++]));
                                $timeout(function(){
                                    _this.nextUp();
                                }, NEXT_UP_DURATION);
                            } else {
                                this.switchMessage( "" );
                                $timeout(function(){ _this.init() }, 500);
                            }
                        }
                    }

                    // The listings have REDONCULOUS exceptions to what is in show name, teams, etc.
                    this.makeSensibleMessageFrom = function(listing){

                        //First, look for team names
                        if (listing.team1 && listing.team2){
                            return listing.team1 + " v "+ listing.team2;
                        }

                        return listing.showName;
                    }

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
                        } );

                }
                
                var ga = new GridAnimator();
                ga.init();

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