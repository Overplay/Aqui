/**
 * Created by mkahn on 11/17/16.
 */

app.controller("mainScreenController", function($scope, $log, ogTVModel, $interval){

    $log.debug( "mainScreenController has loaded");

    $scope.ticketNumber = 0;
    
    function modelChanged(newValue){
        
        $log.info( "Model changed, yay!" );
        $scope.ticketNumber = newValue.ticketNumber;
        $scope.$apply();
    }

    function updateFromRemote() {

        ogTVModel.init( {
            appName:      "io.ourglass.nowserving",
            dataCallback: modelChanged
        } );

    }
    
    updateFromRemote();

});

