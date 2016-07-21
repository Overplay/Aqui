/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Overplay TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller("crawlerController",
    function ($scope, $timeout, $http, $interval, optvModel, $log, $window) {

        var TWEET_COUNT = 7; // If tweets received is lower than this number, code will automatically use the tweet count to prevent crashing

        console.log("Loading crawlerController");

        $scope.messages = ["Try Budweiser Crown, $1.99 with Ourglass discount", "Get Ready for Rio", "3 for 1 appetizers till 7"];
        $scope.comingUpMessages = ["1:00 Giants vs. DBacks",
            "4:30 GSW Pregame",
            "5:00 Warriors v Cavs"];
        $scope.twitterQueries = [];

        $scope.oldTwitterQuery = "";

        $scope.newMessageArray = [];

        function modelUpdate(data) {
            $scope.messages = data.messages;
            if (!$scope.newMessageArray) $scope.newMessageArray = $scope.messages;
            $scope.comingUpMessages = data.comingUpMessages;

            // Combine Twitter queries into one string and set
            var query = "";
            angular.forEach(data.twitterQueries, function (value) {
                query += value.method + value.query + ' ';
            });
            query = encodeURIComponent(query.trim()) + '&lang=en&result_type=popular&include_entities=false';
            if ($scope.oldTwitterQuery != query) {
                $scope.oldTwitterQuery = query;
                optvModel.setTwitterQuery(query);
                console.log('New twitter query:', query);
            }
        }

        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        function processTweetsAndAdd(data) {
            console.log('Tweets:', data);
            if (data != undefined && data.statuses != undefined) {
                // Put tweets into array
                var tweets = [];
                for (var i = 0; i < (TWEET_COUNT <= data.statuses.length ? TWEET_COUNT : data.statuses.length); i++) {
                    tweets.push(data.statuses[i].text.replace(/&amp;/g, '&').replace(/(?:https?|ftp):\/\/[\n\S]+/g, ''));
                }
                // Randomly combine tweets and messages
                $scope.newMessageArray = $scope.newMessageArray.concat(tweets);
            }
            $scope.newMessageArray = shuffleArray($scope.newMessageArray);
        }

        function reloadTweets() {
            $scope.newMessageArray = $scope.messages;
            optvModel.getTweets().then(function (data) {
                console.log('User selected tweets processing');
                processTweetsAndAdd(data);
                console.log('Channel tweets next');
                optvModel.getChannelTweets().then(processTweetsAndAdd);
            });
        }

        function updateFromRemote() {

            optvModel.init({
                appName: "io.ourglass.pubcrawler",
                dataCallback: modelUpdate,
                initialValue: {
                    messages: $scope.messages,
                    comingUpMessages: $scope.comingUpMessages
                },
                pollInterval: 10000
            });

            $interval(reloadTweets, 30000);
            reloadTweets();

        }

        // NFC why this is here...oh wait..maybe because of the weird size issue in the emulators
        // $scope.$watch(function () {
        //     return $window.innerWidth;
        // }, function (value) {
        //     console.log(value);
        //     $scope.screen = {width: $window.innerWidth, height: $window.innerHeight};
        // });

        updateFromRemote();

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
    '$log', '$timeout', '$window', '$interval', 'optvModel',
    function ($log, $timeout, $window, $interval, optvModel) {
        return {
            restrict: 'E',
            scope: {
                logo: '=',
                comingUpArray: '=',
                newMessageArray: '=',
                bannerAd: '=',
                speed: '=?'
            },
            templateUrl: 'app/components/crawler/pubcrawler.template.html',
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
                scope.screen = {width: $window.innerWidth, height: $window.innerHeight};

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
                                    optvModel.getChannelInfo().then(function (data) {
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

