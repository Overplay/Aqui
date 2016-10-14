/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "okConController",
    function ($scope, $timeout, $http, $log, ogControllerModel ) {

        $log.info( "Loading okConController" );

        
        function initialize() {

            ogControllerModel.init( {
                appName:         "io.ourglass.oktoberfest",
                dataCallback:    function(data){}
            }, true );

        }

        
        $scope.message = function(msg){
            // the Date bit always forces an update
            ogControllerModel.model = { message: msg, tz: new Date().getTime() };
            ogControllerModel.save();
        }

        initialize();

    } );
