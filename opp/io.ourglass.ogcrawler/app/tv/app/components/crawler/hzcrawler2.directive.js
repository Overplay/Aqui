/**
 * Created by erikphillips on 2/10/17.
 */


/**
 *
 * This directive uses Google's recommendations for removing "janks" in HTML/CSS animations.
 * Only transforms are used with CSS transitions. This improves performance by:
 * - Preventing the layout and paint rendering pipeline steps that happen with other changes (like position)
 * - By using transitions, we only need a callback and the end of the transition, not once per frame
 *
 * Performance using this technique is excellent and looks nearly as good as a CNN/ESPN scroller.
 *
 * scope.messages is an array of objects like:
 * [ { text: 'Hi There', style: { color: '#FF00A0' }}, ...]
 *
 */

app.directive( 'hzCrawler',
    function ( $log, $timeout, $window, $interval, $rootScope ) {

        return {
            restrict:    'E',
            scope:       {
                messages: '='
            },
            templateUrl: 'app/components/crawler/hzcrawler.template.html',
            link:        function ( scope, elem, attrs ) {


                /*
                 Speed needs to be implemented
                 scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

                 scope.logo should be the path to the logo to show on the left side
                 scope.bannerAd should be the path to a full banner add to be shown periodically

                 none of these are implemented yet
                 */

                var demoVerbose = true;

                var crawlerVelocity = attrs.speed || 50;
                var scroller;
                var scroller2;

                var scrollWindowWidth = document.getElementById("scroll-window").clientWidth;

                var transitions = {
                    "transition":       "transitionend",
                    "OTransition":      "oTransitionEnd",
                    "MozTransition":    "transitionend",
                    "WebkitTransition": "webkitTransitionEnd"
                };

                var whichTransitionEventScroller = function () {
                    for ( var t in transitions ) {
                        if ( scroller.style[ t ] !== undefined ) {
                            return transitions[ t ];
                        }
                    }
                };

                var whichTransitionEventScroller2 = function () {
                    for ( var t in transitions ) {
                        if ( scroller2.style[ t ] !== undefined ) {
                            return transitions[ t ];
                        }
                    }
                };


                function printAllPositionInformation() {
                    if (demoVerbose) {
                        $log.debug("scrollWindowWidth: " + scrollWindowWidth);

                        $log.debug("crawler 1 offsetleft:   " + scroller.offsetLeft);
                        $log.debug("crawler 1 width:        " + scroller.offsetWidth);

                        $log.debug("crawler 2 offsetleft:   " + scroller2.offsetLeft);
                        $log.debug("crawler 2 width:        " + scroller2.offsetWidth);
                    }
                }

                function initCrawlerPositions() {

                    $log.debug("crawler position init");
                    $log.debug("scrollWindowWidth: " + scrollWindowWidth);
                    $log.debug("crawler 1 width: " + scroller.offsetWidth);
                    $log.debug("crawler 2 width: " + scroller2.offsetWidth);

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transform':         "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(" + (scrollWindowWidth + 500) + 'px, 0px)',
                        'transform':         "translate(" + (scrollWindowWidth + 500) + 'px, 0px)',
                        'transition':        'all 0s'
                    };
                }

                function startScrollerTransition() {

                    $log.debug("scroller trans started");

                    var distanceToTravel = scrollWindowWidth + scroller.offsetWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;

                    scope.leftPos = {
                        '-webkit-transform': "translate(-" + scroller.offsetWidth + "px, 0px)",
                        'transform': "translate(-" + scroller.offsetWidth + "px, 0px)",
                        'transition': "all " + tranTime + "s linear"
                    };

                    var transition1Event = whichTransitionEventScroller();
                    scroller.addEventListener( transition1Event, function ( evt ) {
                        $log.debug( "scroller transition event finished");

                        resetScrollerTransition();

                        updateModel( 1 );

                        loadScroller()
                            .then( function ( obj ) {
                                scroller = obj;
                                startScrollerTransition();
                            })
                    } );
                }

                function startScroller2Transition() {

                    $log.debug("scroller 2 trans started");

                    var distanceToTravel = scrollWindowWidth + scroller2.offsetWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(-" + scroller2.offsetWidth + "px, 0px)",
                        'transform':         "translate(-" + scroller2.offsetWidth + "px, 0px)",
                        'transition':        "all " + tranTime + "s linear"
                    };

                    var transition2Event = whichTransitionEventScroller2();
                    scroller.addEventListener( transition2Event, function ( evt ) {
                        $log.debug( "scroller 2 transition event finished");

                        resetScroller2Transition();

                        updateModel( 2 );

                        loadScroller2()
                            .then( function ( obj ) {
                                scroller = obj;
                                startScroller2Transition();
                            })
                    } );
                }

                function resetScrollerTransition() {

                    $log.debug("resetScroller: " + scrollWindowWidth);

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transform':         "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                }

                function resetScroller2Transition() {

                    $log.debug("resetScroller2: " + scrollWindowWidth);

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(" + scrollWindowWidth + 500 + 'px, 0px)',
                        'transform':         "translate(" + scrollWindowWidth + 500 + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                }

                function loadScroller() {
                    return $timeout( function () {
                        return document.getElementById( 'scroller-ul' );
                    })
                }

                function loadScroller2() {
                    return $timeout( function () {
                        return document.getElementById( 'scroller-ul2' );
                    })
                }

                function updateModel( scroller ) {
                    $log.debug("model update called");

                    if (scroller == 1) {
                        scope.displayMessages = _.cloneDeep( scope.messages );
                    } else if (scroller == 2) {
                        scope.displayMessages2 = _.cloneDeep( scope.messages );
                    } else {
                        scope.displayMessages = _.cloneDeep( scope.messages );
                        scope.displayMessages2 = _.cloneDeep( scope.messages );
                    }

                    $rootScope.$broadcast( 'HZ_CRAWLER_START' );
                }

                updateModel();

                loadScroller()
                    .then(function ( obj ) {
                        scroller = obj;

                        loadScroller2()
                            .then(function ( obj2 ) {
                                scroller2 = obj2;

                                initCrawlerPositions();

                                updateModel();
                            })
                    });

                loadScroller()
                    .then(function ( obj ) {
                        scroller = obj;
                        loadScroller2()
                            .then(function ( obj2 ) {
                                scroller2 = obj2;

                                startScrollerTransition();
                                startScroller2Transition();

                                updateModel();

                            })
                    });


            }
        }
    }
);
