/**
 * Created by mkahn on 11/17/16.
 */

app.controller("mainScreenController", function($scope, $log, ogAPI){

    $log.debug( "mainScreenController has loaded");

    $scope.ticketNumber = 0;
    
    function modelChanged( newValue ){
        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        $scope.$apply();
    }

    function init() {
        ogAPI.init( {
            appType: "tv",
            appName: "io.ourglass.nowserving",
            modelCallback: modelChanged
        });
    }
    
    init();

});
