/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "shuffconController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { show: false };

        function ready() {
            $scope.ui.show = true;
        }


        $scope.redScore = function () { return optvModel.model.red; }
        $scope.blueScore = function () { return optvModel.model.blue; }

        function initialize() {

            optvModel.init( {
                appName:         "io.ourglass.shuffleboard",
                initialValue:    { red: 0, blue: 0 },
                dataCallback:    function(data){}
            } );

        }

        $scope.changeBlue = function ( by ) {

            optvModel.model.blue = optvModel.model.blue + by;
            if ( optvModel.model.blue < 0 ) optvModel.model.blue = 0;
            optvModel.save();

        }

        $scope.changeRed = function ( by ) {
            optvModel.model.red = optvModel.model.red + by;
            if ( optvModel.model.red < 0 ) optvModel.model.red = 0;
            optvModel.save()
                .then( function(d){
                    console.log(d);
                })
                .catch( function(err){
                    console.log(err);
                });

        }


        $scope.resetScores = function () {
            optvModel.model.red = 0;
            optvModel.model.blue = 0;
            optvModel.save();

        }


        $scope.move = function () {

            optvModel.moveApp();


        }


        initialize();

    } );
