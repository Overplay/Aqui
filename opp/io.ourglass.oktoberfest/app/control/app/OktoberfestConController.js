/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "okConController",
    function ($scope, $timeout, $http, $log, ogControllerModel ) {

        $log.info( "Loading okConController" );
        $scope.hideStart = false;
        $scope.done = false;
        
        function initialize() {

            ogControllerModel.init( {
                appName:         "io.ourglass.oktoberfest",
                dataCallback:    function(data){}
            }, true );

            //$scope.message( 'reset' );

        }

        $scope.start = function(){
            
            $scope.message('reset');
            $timeout(function () {
                $scope.message( 'start' );
            }, 1000);
            $scope.hideStart = true;
            $timeout( function(){
                $scope.done = true;
            
            }, 31000 );
        
        }
        
        $scope.message = function(msg){
            // the Date bit always forces an update
            ogControllerModel.model = { message: msg, tz: new Date().getTime() };
            ogControllerModel.save();
        }

        initialize();

    } );
