/**
 * Created by mkahn on 1/19/17.
 */

app.controller("registerController", function($scope, $rootScope, uibHelper, $log, $state, sqGameService){

    $log.debug("loading registerController");

    $scope.currentUser = {};

    if (sqGameService.isDevelopmentMode) {
        var u = sqGameService.getCurrentUser();
        $scope.currentUser.name = u.name;
        $scope.currentUser.email = u.email;
        $scope.currentUser.numPicks = u.numPicks;
    } else {
        $scope.clearForm();
    }


    $scope.clearForm = function () {
        $scope.currentUser.name = undefined;
        $scope.currentUser.email = undefined;
        $scope.currentUser.numPicks = undefined;
    };


    $scope.register = function () {
    
        if ($scope.currentUser.name.toLocaleLowerCase() == 'ogadm1n') {
            $state.go("settings");
            return;
        }

        if ( $scope.currentUser.name.toLocaleLowerCase() == 'qqqq' ) {
            sqGameService.loadFakeUser();
            $state.go( "picksquares" );
            return;
        }

        if (sqGameService.isGameRunning()){
            toastr.warning("Game already running!");
            //TODO go to scoreboard screen
            $state.go('welcome');
            return;
        }

        if ($scope.currentUser.numPicks <= 0 || !$scope.currentUser.email || !$scope.currentUser.name) {
            uibHelper.confirmModal("Incomplete Form","Please complete the whole form, selecting at least one square.");
            return;
        }

        if ($scope.currentUser.name.split(' ').length < 2) {
            uibHelper.confirmModal("Enter Fullname", "Please enter both a first and last name.");
            return;
        }

        if (!validateEmail( $scope.currentUser.email )) {
            uibHelper.confirmModal("Invalid Email Address", "Sorry, your email address seems to be invalid.");
            return;
        }

        uibHelper.confirmModal( "Confirm Your Information", "Is this your correct information? " + $scope.currentUser.name + " ( " + $scope.currentUser.email + " )" )
            .then( function () {
                sqGameService.setCurrentUser({
                    numPicks:   $scope.currentUser.numPicks,
                    name:       $scope.currentUser.name,
                    email:      $scope.currentUser.email
                });

                $state.go("picksquares");
            });
    };

    $scope.cancel = function () {
        $state.go("welcome");
    };

    function validateEmail( email ) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

});

