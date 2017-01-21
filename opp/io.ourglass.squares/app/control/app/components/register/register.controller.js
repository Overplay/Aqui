/**
 * Created by mkahn on 1/19/17.
 */

app.controller("registerController", function($scope, $rootScope, uibHelper, $log, $state){

    $log.debug("loading registerController");

    $scope.clearForm = function () {
        $scope.fullname = undefined;
        $scope.email = undefined;
        $scope.picks = undefined;
    };

    $scope.clearForm();

    $scope.register = function () {
        $log.debug("register button clicked");

        if ($scope.picks <= 0 || !$scope.email || !$scope.fullname) {
            alert("Please complete form");
            return;
        }

        var initals = "";

        var array = $scope.fullname.split(' ');
        if (array.length == 1) {
            initals = array[0].charAt(0).toUpperCase();
        } else {
            initals = array[0].charAt(0).toUpperCase() + array[array.length - 1].charAt(0).toUpperCase();
        }

        $rootScope.currentUser = {
            picksAllowed: $scope.picks,
            fullname: $scope.fullname,
            email: $scope.email,
            initials: initals
        };


        $log.debug("changing route");
        $state.go("picksquares");
    };

});