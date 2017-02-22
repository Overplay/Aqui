/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffleController",
    function ($scope, $timeout, $http, $interval, ogAPI, $log ) {

        console.log( "Loading shuffleController(TV)" );

        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        var _remoteScore = {};

        function updateLocalScore() {

            var animRed = $scope.score.red != _remoteScore.red;
            var animBlue = $scope.score.blue != _remoteScore.blue;

            $scope.score.red = _remoteScore.red || 0;
            $scope.score.blue = _remoteScore.blue || 0;


            if ( animRed ) {
                $scope.score.redHighlight = true;
                $timeout( function () { $scope.score.redHighlight = false}, 500 );
            }

            if ( animBlue ) {
                $scope.score.blueHighlight = true;
                $timeout( function () { $scope.score.blueHighlight = false}, 500 );
            }
        }

        function modelUpdate( data ) {

            $log.info( "Got a model update: " + angular.toJson( data ) );
            _remoteScore = data;
            
            updateLocalScore();

        }

        function updateFromRemote() {
            ogAPI.init( {
                appType:        "tv",
                appName:        "io.ourglass.shuffleboard",
                modelCallback:  modelUpdate
            });
        }

        updateFromRemote();

    });
