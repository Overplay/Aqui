/**
 * Created by mkahn on 1/19/17.
 */

app.controller("registerController", function($scope, $rootScope, uibHelper, $log, $state, sqGameService){

    $log.debug("loading registerController");

    $scope.clearForm = function () {
        $scope.fullname = undefined;
        $scope.email = undefined;
        $scope.picks = undefined;
    };

    $scope.clearForm();

    $scope.register = function () {
        $log.debug("register button clicked");

        if (sqGameService.isGameRunning()){
            toastr.warning("Game already running!");
            //TODO go to scoreboard screen
            $stats.go('welcome');
        }

        if ($scope.picks <= 0 || !$scope.email || !$scope.fullname) {
            alert("Please complete form");
            return;
        }

        var initals = "";

        sqGameService.setCurrentUser({
            numPicks:     $scope.picks,
            name:     $scope.fullname,
            email:        $scope.email
        });

        $state.go("picksquares");

    };

    $scope.cancel = function () {
        $state.go("welcome");
    }

});

