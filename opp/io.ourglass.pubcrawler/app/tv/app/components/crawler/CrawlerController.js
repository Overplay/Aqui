/*********************************

 File:       crawlerController.js
 Function:   Core of the Pubcrawler App
 Copyright:  Overplay TV
 Date:       6/29/16 12:28 PM
 Author:     mkahn


 **********************************/


app.controller("crawlerController",
    function ($scope, $timeout, $http, $interval, optvModel, $log, $window) {

        console.log("Loading crawlerController");

        $scope.messages = ["Golden State pushes series to decisive Game 7",
            "Try our new Ranch Chicken Salad, $7.99",
            "Don't forget our 4th of July Party!",
            "Try Rheingorold IPA, Hop to It",
            "Bangers and Mash on Special for Happy Hour"];
        $scope.comingUpMessages = ["1:00 Giants vs. DBacks",
            "4:30 GSW Pregame",
            "5:00 Warriors v Cavs"];
        $scope.twitterQueryMessages = [];

        var twitterScraper;

        function modelUpdate(data) {
            $scope.messages = data.messages;
            $scope.comingUpMessages = data.comingUpMessages;

            // Combine Twitter queries into one string and set
            var query = "";
            angular.forEach(data.twitterQueries, function (value) {
                query += value.method + value.query + ' ';
            });
            query = encodeURIComponent(query.trim()) + '&lang=en&result_type=popular&include_entities=false';
            optvModel.setTwitterQuery(query);
            console.log('Twitter query:', query);

            if(twitterScraper) { $interval.cancel(twitterScraper); }
            twitterScraper = $interval(function (){
                optvModel.getTweets().then(function (data) {
                    console.log('Tweets:', data);
                    $scope.twitterQueryMessages = [];
                    angular.forEach(data.statuses, function (value) {
                        $scope.twitterQueryMessages.push(value.text);
                    });
                    console.log($scope.twitterQueryMessages);
                });
            }, 30000);
        }

        function updateFromRemote() {

            optvModel.init({
                appName: "io.ourglass.pubcrawler",
                dataCallback: modelUpdate,
                initialValue: {
                    messages: $scope.messages,
                    comingUpMessages: $scope.comingUpMessages
                }
            });

        }

        // NFC why this is here...oh wait..maybe because of the weird size issue in the emulators
        $scope.$watch(function () {
            return $window.innerWidth;
        }, function (value) {
            console.log(value);
            $scope.screen = {width: $window.innerWidth, height: $window.innerHeight};
        });

        updateFromRemote();

    });


app.directive('pubCrawler', [
    '$log', '$timeout', '$window',
    function ($log, $timeout, $window) {

        console.log('pub-crawler directive working');

        return {
            restrict: 'E',
            scope: {
                messages: '=',
                comingUpMessages: '=',
                twitterQueryMessages: '='
            },
            templateUrl: 'app/components/crawler/pubcrawler.template.html',
            link: function (scope, elem, attrs) {

                var DELAY = 10;

                scope.leftPos = {};

                scope.ui = {
                    scrollin: false,
                    nextUp: '',
                    nidx: 0
                };

                function scroll() {

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;

                    $timeout(function () {

                        scope.ui.nextUp = scope.comingUpMessages[scope.ui.nidx];
                        scope.ui.nidx++;
                        if (scope.ui.nidx >= scope.comingUpMessages.length)
                            scope.ui.nidx = 0;
                        scope.ui.scrollin = true;

                        $timeout(function () {
                            scope.ui.scrollin = false;
                            $timeout(scroll, 250);
                        }, 5000)

                    }, 250)
                }

                scroll();

                var i, dx, left;

                function loop() {
                    if (i++ >= dx) {
                        console.log('Done!');
                        beginScroll();
                        return;
                    }
                    scope.leftPos.left = --left + 'px';
                    $timeout(loop, DELAY);
                }

                function beginScroll() {
                    console.log('Beginning scroll...');
                    i = 1;
                    $timeout(function () {
                        return document.getElementById('scroller-ul').offsetWidth;
                    }).then(function (width) {
                        left = window.innerWidth;
                        scope.leftPos.left = left + 'px';
                        dx = width + left;
                        console.log('Scroll starting. Got width:', width, 'and window width:', window.innerWidth, 'and dx:', dx);
                        loop();
                    });
                }

                beginScroll();

            }
        }
    }]
);





