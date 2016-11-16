/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ($scope, $timeout, $http, $log, ogControllerModel ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { localRed: 0, localBlue: 0 };

        function initialize() {

            ogControllerModel.init( {
                appName:         "io.ourglass.shuffleboard",
                dataCallback:    function(data){
                    $log.debug("New data: "+data);
                }
            } );

        }

        $scope.changeBlue = function ( by ) {

            $scope.ui.localBlue += by;
            if ( $scope.ui.localBlue < 0 ) $scope.ui.localBlue = 0;
            ogControllerModel.model.blue = $scope.ui.localBlue;
            ogControllerModel.save();

        }

        $scope.changeRed = function ( by ) {
            $scope.ui.localRed += by;
            if ( $scope.ui.localRed < 0 ) $scope.ui.localRed = 0;
            ogControllerModel.model.red = $scope.ui.localRed;
            ogControllerModel.save();

        }


        $scope.resetScores = function () {
            ogControllerModel.model.red = 0;
            ogControllerModel.model.blue = 0;
            ogControllerModel.save();
            $scope.ui = { localRed: 0, localBlue: 0 };

        }


        $scope.move = function () {

            ogControllerModel.move();


        }


        initialize();

    } );
