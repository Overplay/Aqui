/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading shuffconController" );
        

        function inboundMessage( data ) {
            $log.info( "ShuffleCon: got inbound message." );
        }
        

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.luckylep",
                endpoint:        "control",
                messageCallback: inboundMessage
            } );

        }


        $scope.cheat = function () {

            optvModel.postMessage( { dest: "io.overplay.luckylep.tv", data: { cheat: 'cheating' } } );

        }

        
        initialize();

    } );
