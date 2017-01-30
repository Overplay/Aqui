/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller("mainScreenController", function($scope, $log, $interval, fbGameSim, $timeout ){

    $log.debug( "mainScreenController has loaded");

    //fbGameSim.startGame();

    $scope.slideIn = false;
    
    function slideOut(){
        $scope.slideIn = false;
    }
    
    function slideIn(){
        
        $scope.slideIn = true;
        $timeout(slideOut, 5000);
    }

    $interval( slideIn, 10000 );

    // This wasn't working right...
    //$scope.$on('MODEL_UPDATE', slideIn);

});

