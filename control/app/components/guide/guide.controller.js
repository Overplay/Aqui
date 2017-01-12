/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "guideController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet, $filter, ogProgramGuide, $rootScope) {

        $log.info( "Loading guideController" );
        $scope.ui = { loadError: false, refineSearch: 'all', isPaired: ogDevice.isPairedToSTB };

        var slideIdx = 0;
        var WINDOW_SIZE = 30;
        var fullGrid = [];
        $scope.displayedGrid = [];
        $scope.scrollLimits = { top: true, bottom: false };

        $rootScope.currentChannel = {};

        function getCurrentChannel() {
            return ogProgramGuide.getNowAndNext()
                .then(function (grid) {
                    $log.debug("Got the grid and channel.");
                    $rootScope.currentChannel = grid.grid.channel;
                });
        }

        getCurrentChannel();

        function loadListings(){
            ogNet.getGrid(false)
                .then( function ( g ) {
                    fullGrid = g;
                    filterGrid();
                } )
                .catch(function(err){
                    $scope.ui.loadError = true;
                })
                .finally( hud.dismiss );
        }

        function refineSearchFilter(inputArray){

            switch ($scope.ui.refineSearch){
            
                case 'favorites':
                    return _.filter( inputArray, function ( gentry ) {
                        return gentry.channel.favorite;
                    } );
                    
                case 'sports':
                    return $filter('filter')(inputArray, 'Sports');

                case 'news':
                    return $filter( 'filter' )( inputArray, 'News' );
            
                case 'all':
                default:
                    return inputArray;
            
            }
        
        
        }

        function filterGrid(){

            var channelFiltered = $filter('filter')(fullGrid, $scope.stationSearch);
            var refineFiltered = refineSearchFilter(channelFiltered);
            $scope.displayedGrid = refineFiltered.slice(slideIdx, WINDOW_SIZE+slideIdx);
            $scope.scrollLimits.top = !slideIdx;  //at top when index is 0
            $scope.scrollLimits.bottom = ( slideIdx >= refineFiltered.length-WINDOW_SIZE );

        }

        $scope.refineSearch = function(searchType){
            $scope.ui.refineSearch = searchType;
            slideIdx = 0;
            filterGrid();
        }

        $scope.atEdge = function(edge){
        
            $log.debug("In controller @ edge: "+edge);
            if (edge=='end'){
                slideIdx = slideIdx + 1;
            } else {
                if (!slideIdx)
                    return;
                slideIdx = slideIdx - 1;
                if (slideIdx<=0){
                    slideIdx = 0;
                }
            }
            filterGrid();

        }

        
        if (ogDevice.isPairedToSTB){
        
            var refreshListings = $interval( loadListings, 15000 ); // $interval to run every 5 min or 300000ms

            var hud = uibHelper.curtainModal( 'Loading Guide' );
            loadListings();

            $scope.$on( "$destroy",
                function ( event ) {
                    $interval.cancel( refreshListings );
                    $log.debug( "destroy called - canceled listings refresh $interval" );
                }
            );
        }
        
        $scope.$watch('stationSearch', filterGrid);

    } );


// Attributes:
//  windowSize is how big a window to maintain (max)
app.directive('scrollWindow', function($log) {

    return {
        restrict: 'A',
        scope:    {
            edgeCallback: "=",
            limits: "="
            },
        link:     function ( scope, element, attrs ) {

            var myElement = element[ 0 ];
            var kickback = attrs.kickback || myElement.offsetHeight/4;

            var edge;
            var developmentMode = true;

            $log.debug( 'inside scroller windower' );


            // scrollTop = distance content has scrolled. 0 means "at top"
            // offsetHeight = on-screen height of element including border and padding (no margin)
            // scrollHeight = read-only property is a measurement of the height of an element's content,
            // including content not visible on the screen due to overflow. This is how tall the scroller
            // would need to be to fit on-screen without a scroll bar.
            //
            // In the downwards direction, scrollTop can never get to scrollHeight because the formula
            // works like so:
            //                              scrollTop---v
            //                                          |<---- offsetHeight -----|
            // |<----------------------------- scrollHeight -------------------->|
            //
            // So to trigger a load at the bottom, you need to do it no later than:
            //    scrollTop = scrollHeight - offsetHeight  (minus a little guardband)
            
            element.bind( 'scroll', function () {
            
                if (developmentMode){
                    $log.debug( 'scrollHeight - ' + myElement.scrollHeight );
                    $log.debug( 'offsetHeight - ' + myElement.offsetHeight );
                    $log.debug( 'scrollTop - ' + myElement.scrollTop );
                    $log.debug( 'Bottom trigger: ' + (myElement.scrollHeight-kickback/2));
                }
               
                if (myElement.scrollTop==0 && !scope.limits.top){
                    edge = 'top';
                    $log.debug("At top");
                    myElement.scrollTop = myElement.scrollTop + kickback;
                    edgeCb();
                } else if (myElement.scrollTop > (myElement.scrollHeight - myElement.offsetHeight - kickback/2) && !scope.limits.bottom){
                    edge = 'end';
                    $log.debug( "At end" );
                    myElement.scrollTop = myElement.scrollTop - kickback;
                    edgeCb();
                }
                
            } );
            
            function edgeCb(){
                if (scope.edgeCallback){
                
                    scope.$apply( function(){

                        scope.edgeCallback( edge );

                    });
                
                }
            }
        }
    }
});

app.filter('smartTitle', function(){
    return function(listing){
    
        var title = listing.showName;
        
        if ( listing.team1 && listing.team2 ) {
            title = title + ": " + listing.team1 + " v " + listing.team2 ;
        }
        
        return title;
        
    }
});