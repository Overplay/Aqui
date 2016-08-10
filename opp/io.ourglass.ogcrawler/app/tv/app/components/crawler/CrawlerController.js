/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Overplay TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller("crawlerController",
    function ($scope, $timeout, $http, $interval, ogTVModel, $log, $window) {


        var TWEET_COUNT = 7, //MAGIC NUMBER?
            TWEET_UPDATE_INTERVAL = 30000; 

        $scope.displayArr = [ 'Welcome to Ourglass', "Change these messages through our mobile app!"];
        $scope.comingUpMessages = ['GS @ LAC - 7:30', 'OLYMPIC SWIM - 9:30']

        //information pertaining to user control of application
        var crawlerMessages = {
            user: [],
            comingUp: [],
            twitter: [],

            //function to set the display messages to the randomized concatenation of user and twitter messages
            //and coming up
            updateDisplay: function(){
                var tempArr = this.user.concat(this.twitter);
                tempArr.sort(function() { return 0.5 - Math.random()});
                $scope.displayArr = tempArr;
                $scope.comingUpMessages = this.comingUp;
            }
        };

        function modelUpdate(data){
            crawlerMessages.user = data.messages;
            crawlerMessages.comingUp = data.comingUpMessages;

            crawlerMessages.updateDisplay();
        }

        function reloadTweets(){
            ogTVModel.getTweets().then(function(data){
                if(data && data.data &&  data.data.statuses){
                    data = data.data;
                    var tempArr = [];

                    var count = data.statuses.length > TWEET_COUNT ? TWEET_COUNT : data.statuses.length;
                    for(var i = 0; i < count; i++){
                        var usableTweet = data.statuses[i].text;
                        usableTweet.replace(/&amp;/g, '&').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
                        tempArr.push(usableTweet);
                    }
                    crawlerMessages.twitter = tempArr;

                    crawlerMessages.updateDisplay();
                }
            })
        }
        

        ogTVModel.init({
            appName: "io.ourglass.ogcrawler",
            dataCallback: modelUpdate
        }).then(function(){
            reloadTweets();
            $interval(reloadTweets, TWEET_UPDATE_INTERVAL);
        });

    });

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
app.directive('pubCrawlerXs', [
    '$log', '$timeout', '$window', '$interval', 'ogTVModel',
    function ($log, $timeout, $window, $interval, ogTVModel) {
        return {
            restrict: 'E',
            scope: {
                logo: '=',
                comingUpArray: '=',
                newMessageArray: '=',
                bannerAd: '=',
                speed: '=?'
            },
            templateUrl: 'app/components/crawler/ogcrawler.template.html',
            link: function (scope, elem, attrs) {


                /*
                 Speed needs to be implemented
                 scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

                 scope.logo should be the path to the logo to show on the left side
                 scope.bannerAd should be the path to a full banner add to be shown periodically

                 none of these are implemented yet


                 */

                scope.displayMessages = _.clone(scope.newMessageArray);

                var shouldRefreshMessages = false;

                var crawlerVelocity = 110;
                var scrollerWidth;
                var nextUpIndex = 0;
                var scrollerUl = document.getElementById('scroller-ul');

                // This is on a scope var for debugging on Android
                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };

                // Dump crawler off screen
                function resetCrawlerTransition() {

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + $window.innerWidth + 'px, 0px)',
                        'transform': "translate(" + $window.innerWidth + 'px, 0px)',
                        'transition': 'all 0s'
                    };

                }

                function startCrawlerTransition() {

                    var distanceToTravel = $window.innerWidth + scrollerWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;
                    $log.debug("Transition time: " + tranTime);
                    //$log.debug( "Tranny time: " + tranTime );
                    // Let the DOM render real quick then start transition
                    $timeout(function () {

                        scope.leftPos = {
                            '-webkit-transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transition': "all " + tranTime + "s linear"
                        }

                    }, 100);

                    // And when tran is done, start again.
                    $timeout(doScroll, tranTime * 1000);

                }

                var NEXT_UP_DURATION = 5000;

                scope.ui = {
                    scrollin: false,
                    nextUp: '',
                    isNextUp: true,
                    isChangingName: false
                };


                function scrollNextUp() {

                    if (scope.comingUpArray.length == 0)
                        return;

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;
                    scope.ui.isNextUp = true;
                    scope.ui.isChangingName = false;

                    $timeout(function () {

                        scope.ui.nextUp = scope.comingUpArray[nextUpIndex];
                        nextUpIndex++;
                        if (nextUpIndex == scope.comingUpArray.length) {
                            nextUpIndex = 0;
                            scope.ui.scrollin = true;

                            $timeout(function () {
                                scope.ui.scrollin = false;
                                $timeout(function () {
                                    ogTVModel.getChannelInfo().then(function (data) {
                                        if (data != undefined && data.programTitle != undefined) {
                                            scope.ui.isChangingName = true;
                                            $timeout(function () {
                                                scope.ui.nextUp = data.programTitle;
                                                scope.ui.isNextUp = false;
                                                scope.ui.isChangingName = false;
                                                $timeout(function () {
                                                    scope.ui.scrollin = true;
                                                    $timeout(function () {
                                                        scope.ui.scrollin = false;
                                                        $timeout(function () {
                                                            scope.ui.isChangingName = true;
                                                            $timeout(scrollNextUp, 250);
                                                        }, 500);
                                                    }, (NEXT_UP_DURATION * 2));
                                                }, 250);
                                            }, 250);
                                        } else {
                                            scope.ui.nextUp = scope.comingUpArray[nextUpIndex];
                                            nextUpIndex++;
                                            scope.ui.scrollin = true;

                                            $timeout(function () {
                                                scope.ui.scrollin = false;
                                                $timeout(scrollNextUp, 250);
                                            }, NEXT_UP_DURATION);
                                        }
                                    });
                                }, 500);
                            }, NEXT_UP_DURATION);
                        } else {
                            scope.ui.scrollin = true;

                            $timeout(function () {
                                scope.ui.scrollin = false;
                                $timeout(scrollNextUp, 250);
                            }, NEXT_UP_DURATION);
                        }
                        // if (nextUpIndex == scope.comingUpArray.length)
                        //     nextUpIndex = 0;
                        // scope.ui.scrollin = true;
                        //
                        // $timeout(function () {
                        //     scope.ui.scrollin = false;
                        //     $timeout(scrollNextUp, 250);
                        // }, NEXT_UP_DURATION);


                    }, 250)
                }

                scrollNextUp();


                // This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
                function loadWidth() {
                    return $timeout(function () {
                        return scrollerUl.offsetWidth;
                    })
                }

                // Watch for a change in messages, and then flag to refresh messages if changed
                scope.$watch('newMessageArray', function () {
                    shouldRefreshMessages = true;
                    console.log('Refresh Messages!', scope.newMessageArray);
                });

                function doScroll() {

                    if (shouldRefreshMessages) {
                        scope.displayMessages = _.clone(scope.newMessageArray);
                        shouldRefreshMessages = false;
                    }

                    loadWidth()
                        .then(function (width) {
                            $log.debug("Scroller width: " + width);
                            scrollerWidth = width;
                            resetCrawlerTransition();
                            startCrawlerTransition();
                        });

                }

                var waitToStart = $interval(function () {
                    if (scope.newMessageArray) {
                        doScroll();
                        $interval.cancel(waitToStart);
                    }
                });

            }
        }
    }]
);