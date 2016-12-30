/**
 * Created by mkahn on 12/27/16.
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
                
                var crawlerVelocity = attrs.speed || 110;
                var scrollerWidth;
                var scrollerUl = document.getElementById( 'scroller-ul' );
                var isResetTransition = true;
                var useTransitionListener = attrs.xlisten;

                var transitions = {
                    "transition":       "transitionend",
                    "OTransition":      "oTransitionEnd",
                    "MozTransition":    "transitionend",
                    "WebkitTransition": "webkitTransitionEnd"
                };

                var whichTransitionEvent = function () {

                    for ( var t in transitions ) {
                        if ( scrollerUl.style[ t ] !== undefined ) {
                            return transitions[ t ];
                        }
                    }
                };

                var transitionEvent = whichTransitionEvent();
                
                if (useTransitionListener){
                    scrollerUl.addEventListener( transitionEvent, function ( evt ) {
                        console.debug( isResetTransition ? "RESET transition done event" : "CRAWL transition done event" );
                        if ( !isResetTransition )
                            scope.$apply( doScroll );
                    } );
                
                }
                
                
                function updateModel() {


                }

                // Dump crawler off screen
                function resetCrawlerTransition() {

                    isResetTransition = true;
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
                    
                    $timeout( function () {

                        isResetTransition = false;
                        scope.leftPos = {
                            '-webkit-transform': "translate(-" + scrollerWidth + "px, 0px)",
                            'transform':         "translate(-" + scrollerWidth + "px, 0px)",
                            'transition':        "all " + tranTime + "s linear"
                        }

                    }, 10 );

                    // And when tran is done, start again.
                    if (!useTransitionListener)
                        $timeout( doScroll, (tranTime-0.5) * 1000 );

                }
                

                // This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
                function loadWidth() {
                    return $timeout( function () {
                        return scrollerUl.offsetWidth;
                    } )
                }

                function doScroll() {

                    resetCrawlerTransition();
                    scope.displayMessages = _.cloneDeep( scope.messages );
                    loadWidth()
                        .then( function ( width ) {
                            $log.debug( "Scroller width: " + width );
                            scrollerWidth = width;
                            startCrawlerTransition();
                            $rootScope.$broadcast( 'HZ_CRAWLER_START' );
                        } );

                }
                
               doScroll();

            }
        }
    } 
);