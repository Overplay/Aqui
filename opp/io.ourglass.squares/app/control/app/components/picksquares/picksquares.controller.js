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
    $scope.currentUser = sqGameService.getCurrentUser();

    // Check if there is a current user, if not - go to register page
    if ( !$scope.currentUser || !$scope.currentUser.name ) {
        toastr.warning("No currently registered user!");
        $state.go("register");
    }

    function getTotalUserPicks() {
        var count = 0;
        for (var row = 0; row < 10; row++)
            for (var col = 0; col < 10; col++)
                if (!grid[row][col].available && grid[row][col].ownedBy.email == $scope.currentUser.email)
                    count += 1;
        return count;
    }

    $scope.numPicked = getTotalUserPicks();
    $scope.picksAllowed = $scope.currentUser.numPicks + $scope.numPicked;

    // var updateScopeGrid = function () {
    //
    //     sqGameService.getCurrentGrid()
    //         .then( function(grid){
    //             $scope.grid = grid;
    //         });
    // };


    $scope.clicked = function(r, c){

        var gridsSame = $scope.grid === sqGameService.getRawGrid();

        if (($scope.numPicked >= $scope.picksAllowed) && !$scope.grid[r][c].ownedByCurrentUser()) {
            uibHelper.confirmModal("Out of Picks","Sorry " + $scope.currentUser.name + ", you are out of picks. If you want to change one of your picks, tap on it.");
            return;
        }

        $scope.grid[r][c].toggle()
            .then(function (action) {
                if (action=='picked'){
                    toastr.success( "Square Picked!" );
                    $scope.numPicked++;
                } else {
                    toastr.success( "Square Dumped!" );
                    $scope.numPicked--;
                }
            })
            .catch(function (err) {
                // TODO MITCH - also check for network error
                if (err.status == 409){
                    uibHelper.confirmModal("Unable To Pick Square", "Someone else is picking, please try again.");
                }
                uibHelper.confirmModal("Unable To Pick Square", "This square is already taken or you don't own it.");
            })
    };

    // $scope.clearSelections = function () {
    //     $log.debug("clearing all selections");
    //
    //     uibHelper.confirmModal("Clear All Selections?", "Would you like to clear all your current selections?", true)
    //         .then(function(){
    //             $scope.grid = [];
    //             $scope.numPicked = 0;
    //             updateScopeGrid(); // call this to reset the grid and pull any new moves
    //         });
    //
    //     if (confirm("Clear all selections?")) {
    //         $scope.numPicked = 0;
    //         $scope.picks = [];
    //         updateScopeGrid();
    //     }
    // };

    // $scope.submitSelection = function () {
    //     if ($scope.numPicked != $scope.currentUser.numPicks) {
    //         toastr.warning("Please select " + $scope.currentUser.numPicks + " squares.");
    //         return;
    //     }
    //
    //     sqGameService.submitPicksForCurrentUser( picks );
    //
    //     $state.go("thanks4playing");
    // };

    $scope.registration = function () {
        $state.go("register");
    };

    $scope.squareClass = function (square) {
        if (square.available)
            return 'free';
        return square.ownedByCurrentUser() ? 'chosen' : 'taken';
    };

    $scope.$on('NEW_GRID', function(ev, newGrid){
        $log.debug('New grid broadcast received');
        $scope.grid = newGrid;
    });

    $scope.clearModel = function(){
        sqGameService.resetGameModel();
    }

});