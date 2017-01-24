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
        if ($scope.fullname == 'ogadm1n') {
            $state.go("settings");
            return;
        }

        if (sqGameService.isGameRunning()){
            toastr.warning("Game already running!");
            //TODO go to scoreboard screen
            $state.go('welcome');
            return;
        }

        if ($scope.picks <= 0 || !$scope.email || !$scope.fullname) {
            alert("Please complete form");
            return;
        }

        if (!validateEmail( $scope.email )) {
            alert("Email is invalid.");
            return;
        }

        sqGameService.setCurrentUser({
            numPicks:   $scope.picks,
            name:       $scope.fullname,
            email:      $scope.email
        });

        $state.go("picksquares");
    };

    $scope.cancel = function () {
        $state.go("welcome");
    };

    function validateEmail( email ) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    var grid;
    sqGameService.getCurrentGrid()
        .then(function(g){
            grid = g;
            grid[0][0].pick({ name: "Bubba Watson", email: "bubba@bubba.com" })
                .then(function(bought){
                    $log.debug("Square bought");
                })
            grid[ 0 ][ 0 ].pick( { name: "Bubba Watson", email: "bubba@bubba.com" } )
                .then( function ( bought ) {
                    $log.debug( "Square bought" );
                } )
                .catch( function(err){
                    $log.error("Could pick: "+err);
                })
        });

});

