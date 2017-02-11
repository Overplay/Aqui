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

                var crawlerVelocity = attrs.speed || 50;
                var scroller;
                var scroller2;
                var isResetTransition = true;
                var useTransitionListener = attrs.xlisten;

                var scrollWindowWidth = document.getElementById("scroll-window").clientWidth;


                function initCrawlerPositions() {

                    $log.debug("crawler position init");

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transform':         "translate(" + scrollWindowWidth + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(" + (scroller.offsetLeft + scroller.offsetWidth) + 'px, 0px)',
                        'transform':         "translate(" + (scroller.offsetLeft + scroller.offsetWidth) + 'px, 0px)',
                        'transition':        'all 0s'
                    };
                }

                function startCrawlerTransition() {

                    $log.debug("crawler trans started");

                    var distanceToTravel = scroller.offsetLeft + scroller.offsetWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;

                    scope.leftPos = {
                        '-webkit-transform': "translate(-" + scroller.offsetWidth + "px, 0px)",
                        'transform': "translate(-" + scroller.offsetWidth + "px, 0px)",
                        'transition': "all " + tranTime + "s linear"
                    }
                }

                function startCrawler2Transition() {

                    $log.debug("crawler 2 trans started");

                    var distanceToTravel = scroller2.offsetLeft + scroller2.offsetWidth;
                    var tranTime = distanceToTravel / crawlerVelocity;

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(-" + scroller2.offsetWidth + "px, 0px)",
                        'transform':         "translate(-" + scroller2.offsetWidth + "px, 0px)",
                        'transition':        "all " + tranTime + "s linear"
                    }
                }

                function resetCrawlerTransition() {

                    $log.debug("resetCrawler: " + (scroller2.offsetLeft + scroller2.offsetWidth));

                    scope.leftPos = {
                        '-webkit-transform': "translate(" + (scroller2.offsetLeft + scroller2.offsetWidth) + 'px, 0px)',
                        'transform':         "translate(" + (scroller2.offsetLeft + scroller2.offsetWidth) + 'px, 0px)',
                        'transition':        'all 0s'
                    };

                }

                function resetCrawler2Transition() {

                    $log.debug("resetCrawler2: " + (scroller.offsetLeft + scroller.offsetWidth));

                    scope.leftPos2 = {
                        '-webkit-transform': "translate(" + (scroller.offsetLeft + scroller.offsetWidth) + 'px, 0px)',
                        'transform':         "translate(" + (scroller.offsetLeft + scroller.offsetWidth) + 'px, 0px)',
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


                $rootScope.$broadcast( 'HZ_CRAWLER_START' );
                scope.displayMessages = _.cloneDeep( scope.messages );
                scope.displayMessages2 = _.cloneDeep( scope.messages );

                loadScroller()
                    .then(function ( obj ) {
                        scroller = obj;
                        loadScroller2()
                            .then(function ( obj2 ) {
                                scroller2 = obj2;
                                initCrawlerPositions();
                                $rootScope.$broadcast( 'HZ_CRAWLER_START' );
                                scope.displayMessages = _.cloneDeep( scope.messages );
                                scope.displayMessages2 = _.cloneDeep( scope.messages );
                            })
                    });

                loadScroller()
                    .then(function ( obj ) {
                        scroller = obj;
                        loadScroller2()
                            .then(function ( obj2 ) {
                                scroller2 = obj2;

                                startCrawlerTransition();
                                startCrawler2Transition();

                                $rootScope.$broadcast( 'HZ_CRAWLER_START' );
                                scope.displayMessages = _.cloneDeep( scope.messages );
                                scope.displayMessages2 = _.cloneDeep( scope.messages );

                            })
                    })


            }
        }
    }
);
