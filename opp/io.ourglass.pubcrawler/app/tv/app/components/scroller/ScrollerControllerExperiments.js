/**
 * Created by mkahn on 4/28/15.
 */

/*********************************

 File:       ScrollerControllerExperiments.js
 Function:   This is kept around to document experiements
 Copyright:  Overplay TV
 Date:       6/29/16 12:23 PM
 Author:     mkahn

We experimented with a number of solutions to make a smooth scroller. This file is kept around for
historical interest. The other ScrollerController is the clean one.

 **********************************/


app.controller("scrollerController",
    function ($scope, $timeout, $http, $interval, optvModel, $log, $window) {

        console.log("Loading scrollerController");


        $scope.messageArray = [ "Golden State pushes series to decisive Game 7",
            //"Try our new Ranch Chicken Salad, $7.99",
            //"Don't forget our 4th of July Party!",
            //"Try Rheingold IPA, Hop to It",
            "Bangers and Mash on Special for Happy Hour" ];

        function logLead() {
            return "scrollerController: ";
        }

        function modelUpdate(data) {

            $log.debug(logLead() + " got a model update: " + angular.toJson(data));
            if (data.messages) {
                $scope.messageArray = data.messages;
            }


        }

        function inboundMessage(msg) {
            $log.debug(logLead() + "Inbound message...");
        }

        function updateFromRemote() {

            optvModel.init({
                appName: "io.overplay.pubcrawler",
                endpoint: "tv",
                dataCallback: modelUpdate,
                messageCallback: inboundMessage,
                initialValue: {messages: $scope.messageArray}
            });

        }

        $scope.$watch(function () {
            return $window.innerWidth;
        }, function (value) {
            console.log(value);
            $scope.screen = {width: $window.innerWidth, height: $window.innerHeight};
        });

        $scope.logo = "assets/img/brand.png";

        updateFromRemote();


    });


app.directive('leftScroller2t', [
    '$log', '$timeout', '$window',
    function ($log, $timeout, $window) {
        return {
            restrict: 'E',
            scope: {
                messageArray: '=',
                logo: '='
            },
            templateUrl: 'app/components/scroller/leftscroller2.template.html',
            link: function (scope, elem, attrs) {

                scope.leftPos = {left: '200px'};

                scope.screen = {width: $window.innerWidth, height: $window.innerHeight};

                var scrollerUl = document.getElementById('scroller-ul');

                scrollerUl.addEventListener("transitionend", function () {

                    doScroll();

                }, false);

                function doScroll() {

                    $timeout(function () {
                        var width = scrollerUl.offsetWidth;
                        $log.debug("Scroller width: " + width);
                        scope.leftPos = {
                            '-webkit-transform': 'translate(' + (width - 400) + 'px,0)',
                            transition: '-webkit-transform 0s'
                        };
                        var destXform = -width + 'px';
                        $timeout(function () {
                            scope.leftPos = {
                                '-webkit-transform': 'translate(' + destXform + ',0)',
                                transition: '-webkit-transform 30s linear'
                            };

                        }, 100);
                    }, 100);

                }

                doScroll();

            }
        }
    }]
);

app.directive('leftScroller2', [
    '$log', '$timeout', '$window',
    function ($log, $timeout, $window) {
        return {
            restrict: 'E',
            scope: {
                messageArray: '=',
                logo: '='
            },
            templateUrl: 'app/components/scroller/leftscroller2.template.html',
            link: function (scope, elem, attrs) {

                scope.leftPos = {left: '1280px'};

                scope.ui = {
                    scrollin: false,
                    scrollout: false,
                    nextUpArr: ["1:00 Giants vs. DBacks", "4:30 GSW Pregame", "5:00 Warriors v Cavs"],
                    nextUp: '',
                    nidx: 0
                };

                $timeout(function () {
                }, 5000);

                var scrollerWidth;
                var currentLeft = 1280;
                var FPS = 480;
                var PPF = 0.5;

                function scroll() {

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;

                    $timeout(function () {

                        scope.ui.nextUp = scope.ui.nextUpArr[scope.ui.nidx];
                        scope.ui.nidx++;
                        if (scope.ui.nidx == scope.ui.nextUpArr.length)
                            scope.ui.nidx = 0;
                        scope.ui.scrollin = true;

                        $timeout(function () {
                            scope.ui.scrollin = false;
                            $timeout(scroll, 250);
                        }, 5000)


                    }, 250)
                }

                scroll();

                scope.screen = {width: $window.innerWidth, height: $window.innerHeight};

                var scrollerUl = document.getElementById('scroller-ul');

                scrollerUl.addEventListener("transitionend", function () {

                    doScroll();

                }, false);

                function loadWidth() {

                    return $timeout(function () {
                        return scrollerUl.offsetWidth;
                    })

                }

                function assignLeft() {
                    scope.leftPos.left = currentLeft + "px";
                }

                function renderNext() {

                    assignLeft();
                    currentLeft = currentLeft - PPF;
                    if (currentLeft < -scrollerWidth)
                        doScroll();
                    else
                        $timeout(renderNext, 1000 / FPS);


                }

                function doScroll() {

                    loadWidth()
                        .then(function (width) {
                            $log.debug("Scroller width: " + width);
                            scrollerWidth = width;
                            currentLeft = 1280;
                            renderNext();
                        });

                }

                doScroll();

            }
        }
    }]
);

app.directive('leftcssScroller2', [
    '$log', '$timeout',
    function ($log, $timeout) {
        return {
            restrict: 'E',
            scope: {
                messageArray: '=',
                logo: '='
            },
            templateUrl: 'app/components/scroller/leftscroller2.template.html',
            link: function (scope, elem, attrs) {

                scope.leftPos = { left: window.innerWidth+'px' };
                scope.ui = { shouldScroll: false, isCSSScroller: true };

                var scrollerUl = document.getElementById('scroller-ul');
                scrollerUl.addEventListener("transitionend", function () {
                    loop();
                });

                function loadWidth() {
                    return $timeout(function () {
                        return scrollerUl;
                    })
                }

                var SPEED = 125;

                function setup() {
                    loadWidth().then(function (element) {
                        var width = element.offsetWidth;
                        var distance = width + window.innerWidth;
                        var time = (distance / SPEED);
                        scope.leftPos.transitionDuration = time + 's';
                        scope.leftPos.left = window.innerWidth + 'px';
                        scope.ui.shouldScroll = true;
                        elem.append(angular.element(
                            '<style>' +
                            '.scrolling {' +
                            'left: ' + (-width) + 'px;' +
                            '}' +
                            '</style>'
                        ));
                        loop();
                    });
                }

                function loop() {
                    console.log('Looping');
                    $timeout(function () {
                        scope.ui.shouldScroll = false;
                        scope.leftPos.left = window.innerWidth + 'px';
                        scope.ui.shouldScroll = true;
                        scope.leftPos.left = '';
                    });
                    // elem.append(angular.element(
                    //     '<style>' +
                    //     '@keyframes scrollit {' +
                    //     'from { left: 100%; }' +
                    //     'to { left: -' + width + 'px; }' +
                    //     '}' +
                    //     '@-webkit-keyframes scrollit {' +
                    //     'from { left: 100%; }' +
                    //     'to { left: -' + width + 'px; }' +
                    //     '}' +
                    //     '.scroller {' +
                    //     'transition: all '+time+'s' +
                    //     'left: '+width+'px;' +
                    //     '-webkit-animation-name: scrollit;' +
                    //     '-webkit-animation-iteration-count: infinite;' +
                    //     '-webkit-animation-timing-function: linear;' +
                    //     '-webkit-animation-duration: '+time+'s;' +
                    //     'animation-name: scrollit;' +
                    //     'animation-iteration-count: infinite;' +
                    //     'animation-timing-function: linear;' +
                    //     'animation-duration: '+time+'s;' +
                    //     '}' +
                    //     '</style>'
                    // ));
                }

                setup();

            }
        }
    }]
);

app.directive('leftnsScroller2', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            messageArray: '=',
            logo: '='
        },
        templateUrl: 'app/components/scroller/leftscroller2.template.html',
        link: function (scope) {

            var DELAY = 10;

            scope.leftPos = {};

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

            scope.ui = {
                nextUpArr: ["1:00 Giants vs. DBacks", "4:30 GSW Pregame", "5:00 Warriors v Cavs"],
                nextUp: '',
                nidx: 0
            };

            function scroll() {

                scope.ui.nextUp = '';
                scope.ui.scrollin = false;

                $timeout(function () {

                    scope.ui.nextUp = scope.ui.nextUpArr[scope.ui.nidx];
                    scope.ui.nidx++;
                    if (scope.ui.nidx == scope.ui.nextUpArr.length)
                        scope.ui.nidx = 0;
                    scope.ui.scrollin = true;

                    $timeout(function () {
                        scope.ui.scrollin = false;
                        $timeout(scroll, 250);
                    }, 5000)

                }, 250)
            }

            scroll();

        }
    }
}]);

app.directive('leftvScroller2', ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            messageArray: '=',
            logo: '='
        },
        templateUrl: 'app/components/scroller/leftscroller2.template.html',
        link: function (scope) {
            var SPEED = 125;

            scope.leftPos = {};

            function loop() {
                console.log("Looping");
                scope.leftPos.left = window.innerWidth+'px';

                $timeout(function () {
                    return document.getElementById('scroller-ul');
                }).then(function (elem) {
                    var width = elem.offsetWidth;
                    var distance = width + window.innerWidth;
                    var time = (distance / SPEED);
                    Velocity(elem, {left: (-width)+"px"}, {
                        duration: time*1000,
                        easing: "linear",
                        complete: function() {
                            Velocity(elem, {left: window.innerWidth+'px'},0);
                            loop();
                        }
                    });
                });
            }

            loop();
        }
    }
}]);

app.directive('lefttmScroller2', function($timeout){
    return {
        restrict: 'E',
        scope: {
            messageArray: '=',
            logo: '='
        },
        templateUrl: 'app/components/scroller/leftscroller2.template.html',
        link: function (scope, elem, attrs) {

            scope.leftPos = { left: window.innerWidth+'px' };
            
            var DELAY = 8;

            function loadWidth() {
                return $timeout(function () {
                    return     document.getElementById('scroller-ul').offsetWidth;
                })
            }

            var i, dx, left;

            var lastUpdated = (new Date).getTime();

            function loop() {
                if (i >= dx) {
                    console.log('Done!');
                    beginScroll();
                    return;
                }
                //Move based on time since last update
                var dTime = (new Date).getTime() - lastUpdated;
                lastUpdated = (new Date).getTime();
                i+=(dTime/DELAY);
                left -= dTime / DELAY;
                scope.leftPos.left = left + 'px';
                $timeout(loop);
            }

            function beginScroll() {
                console.log('Beginning scroll...');
                i = 1;
                loadWidth().then(function (width) {
                    dx = width + window.innerWidth;
                    left = window.innerWidth;
                    scope.leftPos.left = left + 'px';
                    console.log('Scroll starting. Got width:', width, 'and window width:', window.innerWidth, 'and dx:', dx);
                    loop();
                });
            }

            beginScroll();

        }
    }
});
