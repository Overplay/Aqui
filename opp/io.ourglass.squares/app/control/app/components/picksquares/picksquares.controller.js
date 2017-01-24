/**
 * Created by mkahn on 1/19/17.
 */

app.controller("pickSquaresController", function($scope, $rootScope, $state, uibHelper, $log, sqGameService){

    var demoState = true;
    var skipData = true;

    $log.debug("loading pickSquaresController");

    $scope.rows = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    $scope.cols = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    
    $scope.grid = [];
    $scope.numPicked = 0;
    $scope.picks = [];

    $scope.currentUser = sqGameService.getCurrentUser();

    // Check if there is a current user, if not - go to register page
    if ( !$scope.currentUser ) {
        toastr.warning("No currently registered user!");

        // $state.go("register");

        // use this to demo
        $scope.currentUser = {
            name: "Erik Phillips",
            initials: 'EP',
            email: 'erik.phillips@icloud.com',
            numPicks: 3
        };
    }

    var updateScopeGrid = function () {

        sqGameService.getCurrentGrid()
            .then( function(grid){
                $scope.grid = grid;
            });

        // sqGameService.getCurrentGrid()
        //     .then(function(modelGrid) {
        //         $scope.grid = [];
        //
        //         for (var r = 0; r < 10; r++){
        //             var row = [];
        //             for (var c = 0; c < 10; c++) {
        //                 row.push(modelGrid[r][c]);
        //             }
        //             $scope.grid.push(row);
        //         }
        //     })
    };

    updateScopeGrid();

    $scope.clicked = function(r, c){
        if ($scope.numPicked >= $scope.currentUser.numPicks) {
            toastr.warning("You cannot select any more squares!");
            return;
        }

        if ( !$scope.grid[r][c].available() ) {
            toastr.warning("This square is already taken!");
            return;
        }

        picks.push({row: r, col: c}); // push the user's pick to the array

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
    }

});