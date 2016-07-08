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

        function dataChanged( data ) {

        }

        function inboundMessage( data ) {
            $log.info( "ShuffleCon: got inbound message." );
        }

        $scope.redScore = function () { return optvModel.model.red; }
        $scope.blueScore = function () { return optvModel.model.blue; }

        function initialize() {

            optvModel.init( {
                appName:         "io.ourglass.shuffleboard",
                endpoint:        "control",
                initialValue:    { red: 0, blue: 0 },
                dataCallback:    dataChanged,
                messageCallback: inboundMessage
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
            optvModel.save();

        }


        $scope.resetScores = function () {
            optvModel.model.red = 0;
            optvModel.model.blue = 0;
            optvModel.save();

        }

        $scope.home = function () {

            optvModel.postMessage( { dest: "io.overplay.mainframe", data: { dash: 'toggle' } } );

        }

        $scope.move = function () {

            optvModel.moveApp()
                .then( function ( newSlot ) {
                    $log.info( "ShuffleControl. Moved to slot: " + numSlot );

                }, function ( err ) {
                    $log.info( "ShuffleControl. FAIL moving app: " + err );

                } );

            //optvModel.postMessage({
            //    to: "io.overplay.mainframe",
            //    data: {move: {spot: "next", app: "io.overplay.shuffleboard"}}
            //});

        }


        initialize();

    } );
