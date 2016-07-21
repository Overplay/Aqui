/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ($scope, $timeout, $http, $log, ogControllerModel ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { show: false };

        function ready() {
            $scope.ui.show = true;
        }


        $scope.redScore = function () { return ogControllerModel.model.red; }
        $scope.blueScore = function () { return ogControllerModel.model.blue; }

        function initialize() {

            ogControllerModel.init( {
                appName:         "io.ourglass.shuffleboard",
                initialValue:    { red: 0, blue: 0 },
                dataCallback:    function(data){}
            } );

        }

        $scope.changeBlue = function ( by ) {

            ogControllerModel.model.blue = ogControllerModel.model.blue + by;
            if ( ogControllerModel.model.blue < 0 ) ogControllerModel.model.blue = 0;
            ogControllerModel.save();

        }

        $scope.changeRed = function ( by ) {
            ogControllerModel.model.red = ogControllerModel.model.red + by;
            if ( ogControllerModel.model.red < 0 ) ogControllerModel.model.red = 0;
            ogControllerModel.save()
                .then( function(d){
                    console.log(d);
                })
                .catch( function(err){
                    console.log(err);
                });

        }


        $scope.resetScores = function () {
            ogControllerModel.model.red = 0;
            ogControllerModel.model.blue = 0;
            ogControllerModel.save();

        }


        $scope.move = function () {

            ogControllerModel.move();


        }


        initialize();

    } );
