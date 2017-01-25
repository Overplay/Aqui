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
        $state.go("register");
    }

    var updateScopeGrid = function () {

        sqGameService.getCurrentGrid()
            .then( function(grid){
                $scope.grid = grid;
            });
    };


    $scope.clicked = function(r, c){

        var gridsSame = $scope.grid === sqGameService.getRawGrid();

        if (($scope.numPicked >= $scope.currentUser.numPicks) && !$scope.grid[r][c].ownedByCurrentUser()) {
            toastr.warning("You cannot select any more squares!");
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
                // TODO also check for network error
                if (err.status==409){
                    toastr.warning( "Someone else is picking, please try again" );
                }
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

    $scope.$on('NEW_GRID', function(ev, newGrid){
        $log.debug('New grid broadcast received');
        $scope.grid = newGrid;
    });

    $scope.clearModel = function(){
        sqGameService.resetGameModel();
    }

});