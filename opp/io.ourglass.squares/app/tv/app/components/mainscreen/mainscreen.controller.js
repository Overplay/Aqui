/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller("mainScreenController", function($scope, $log, $interval ){

    $log.debug( "mainScreenController has loaded");

    $scope.slideIn = false;

    $interval( function () {
        $scope.slideIn = !$scope.slideIn;
        //$log.debug( "Slide in is: " + $scope.slideIn );
    }, 5000 );
    

});

