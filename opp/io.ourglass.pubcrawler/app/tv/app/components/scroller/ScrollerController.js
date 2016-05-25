/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading scrollerController" );

        $scope.messageArray = [ "Don't forget St. Patrick's at O'Flaherty's", "2 for 1 shots of Jameson from 3 to 6", "Try our Bangers and Mash" ];

        function logLead() { return "scrollerController: "; }

        function modelUpdate( data ) {

            $log.debug( logLead() + " got a model update: " + angular.toJson( data ) );
            if ( data.messages ){
                $scope.messageArray = data.messages;
            }



        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.pubcrawler",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }


        $scope.logo = "assets/img/Overplay_Logo_361_WHT.png";

        updateFromRemote();


    } );



app.directive( 'leftScrollerSp', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '=',
                logo: '='
            },
            templateUrl: 'app/components/scroller/leftscrollerguinness.template.html',
            link:        function ( scope, elem, attrs ) {

                var idx = 0;
                var leftPixel = $window.innerWidth + 20;
                var messageWidth = 0;
                var PIXELS_PER_FRAME = 10;
                var FPS = 15;
                var PIXELS_PER_CHAR = 30;

                var clen = 0;
                var lastLeft;

                var spd = new Date('3/17/2016');

                function updateTime(){

                    var delta = spd - new Date();
                    scope.timeToSP = Math.floor( (delta) / (1000 * 60 * 60 * 24) ) + " days to St. Patty's!";
                }

                function restart(){
                    scope.slider = { leftPos: $window.innerWidth};
                }

                function slide(){

                    scope.slider.leftPos-=PIXELS_PER_FRAME;
                    //$log.info( "leftScroller: position " + scope.slider.leftPos );

                    if ( scope.slider.leftPos < ( -1*lastLeft)){
                        restart();
                    }

                    $timeout( slide, 1000/FPS );

                }

                function getWidth(){
                    var sliderWidth = document.getElementById( 'slider' ).clientWidth;
                    $log.debug("Slider div width: "+sliderWidth);
                    clen = 0;

                    scope.messageArray.forEach( function(m){
                        clen+=m.length;
                    })

                    lastLeft = clen * PIXELS_PER_CHAR;
                    $log.debug("Char len: "+clen);


                }

                restart();
                $log.info("leftScroller: position "+scope.slider.leftPos);


                scope.$watch('messageArray', function(nval){

                    $log.debug("Message Array changed: "+nval);
                    getWidth();

                })

                slide();

                //$interval(updateTime, 15000);

            }
        }
    } ]
);
