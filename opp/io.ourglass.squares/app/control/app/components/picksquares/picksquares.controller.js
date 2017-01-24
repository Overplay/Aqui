/**
 * Created by mkahn on 1/19/17.
 */

app.controller("pickSquaresController", function($scope, $rootScope, $state, uibHelper, $log, toastr, sqGameService, grid){

    var demoState = true;
    var skipData = true;

    $log.debug("loading pickSquaresController");

    $scope.rows = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    $scope.cols = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    
    $scope.grid = grid;
    $scope.numPicked = 0;

    $scope.currentUser = sqGameService.getCurrentUser();

    // Check if there is a current user, if not - go to register page
    if ( !$scope.currentUser || !$scope.currentUser.name ) {
        toastr.warning("No currently registered user!");

        // $state.go("register");

        // use this to demo
        $scope.currentUser = {
            name: "Erik Phillips",
            initials: 'EP',
            email: 'erik.phillips@icloud.com',
            numPicks: 3
        };

        sqGameService.setCurrentUser($scope.currentUser);
    }

    var updateScopeGrid = function () {

        sqGameService.getCurrentGrid()
            .then( function(grid){
                $scope.grid = grid;
            });
    };


    $scope.clicked = function(r, c){
        if ($scope.numPicked >= $scope.currentUser.numPicks) {
            toastr.warning("You cannot select any more squares!");
            return;
        }

        $scope.grid[r][c].toggle()
            .then(function () {
                toastr.success("Square Picked!");
            })
            .catch(function () {
                // TODO also check for network error
                toastr.warning("This square is already taken or you don't own it!");
            })
    };

    $scope.clearSelections = function () {
        $log.debug("clearing all selections");

        // uibHelper.confirmModal("Clear All Selections?", "Would you like to clear all your current selections?", true)
        //     .then(function(){
        //         $scope.grid = [];
        //         $scope.numPicked = 0;
        //         updateScopeGrid(); // call this to reset the grid and pull any new mopves
        //     });

        if (confirm("Clear all selections?")) {
            $scope.numPicked = 0;
            $scope.picks = [];
            updateScopeGrid();
        }
    };

    $scope.submitSelection = function () {
        if ($scope.numPicked != $scope.currentUser.numPicks) {
            toastr.warning("Please select " + $scope.currentUser.numPicks + " squares.");
            return;
        }

        sqGameService.submitPicksForCurrentUser( picks );

        $state.go("thanks4playing");
    };

    $scope.registration = function () {
        $state.go("register");
    };

    $scope.squareClass = function (square) {
        if (square.available)
            return 'free';
        return square.ownedByCurrentUser() ? 'chosen' : 'taken';
    };

});