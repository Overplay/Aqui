/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffleController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading shuffleController" );

        $scope.position = { corner: 0 };
        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        var _remoteScore = {};

        function logLead() { return "ShuffleController: "; }

        $scope.$on( 'CPANEL', function () {

            $scope.position.corner++;
            if ( $scope.position.corner > 3 ) $scope.position.corner = 0;

        } );

        function updateLocalScore() {

            var animRed = $scope.score.red < _remoteScore.red;
            var animBlue = $scope.score.blue < _remoteScore.blue;

            $scope.score.red = _remoteScore.red;
            $scope.score.blue = _remoteScore.blue;


            if ( animRed ) {
                $scope.score.redHighlight = true;
                $timeout( function () { $scope.score.redHighlight = false}, 500 );
            }

            if ( animBlue ) {
                $scope.score.blueHighlight = true;
                $timeout( function () { $scope.score.blueHighlight = false}, 500 );
            }
        }

        var demoScore = [
            { red: 0, blue: 0 },
            { red: 0, blue: 1 },
            { red: 0, blue: 2 },
            { red: 1, blue: 2 },
            { red: 1, blue: 3 },
            { red: 2, blue: 3 },
            { red: 3, blue: 3 },
            { red: 4, blue: 3 }
        ];

        var scoreIdx = 0;

        $interval( function(){
            _remoteScore = demoScore[scoreIdx];
            updateLocalScore();
            if (scoreIdx++>demoScore.length) scoreIdx = 0;
        }, 4000);

        // function modelUpdate( data ) {
        //     //$scope.$apply(function () {
        //     $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
        //     _remoteScore = data;
        //     updateLocalScore();
        //
        //     //});
        //
        //     $log.debug( logLead() + "Model update callback..." )
        //
        // }
        //
        // function inboundMessage( msg ) {
        //     $log.debug( logLead() + "Inbound message..." );
        // }
        //
        // function updateFromRemote() {
        //
        //     optvModel.init( {
        //         appName:         "io.ourglass.shuffleboard",
        //         endpoint:        "tv",
        //         dataCallback:    modelUpdate,
        //         initialValue:    { red: 0, blue: 0 }
        //     } );
        //
        // }
        //
        // // Honk Hionk beep!
        //
        // updateFromRemote();

    } );
