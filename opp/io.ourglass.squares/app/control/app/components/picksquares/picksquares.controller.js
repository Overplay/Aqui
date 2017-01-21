/**
 * Created by mkahn on 1/19/17.
 */

app.controller("pickSquaresController", function($scope, $rootScope, $state, uibHelper, $log){

    var demoState = true;


    $log.debug("loading pickSquaresController");

    $scope.rows = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    $scope.cols = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    
    $scope.grid = [];
    $scope.numPicked = 0;

    if (!$rootScope.currentUser && demoState) {
        $rootScope.currentUser = {
            picksAllowed: 3,
            fullname: 'Demo Phillips',
            initials: 'DEMO',
            email: 'erik.phillips@icloud.com'
        }
    }

    if (!$rootScope.currentUser) {
        $log.debug("no current user found");
        $state.go("register");
    }

    var initializeLocalGrid = function () {
        var masterGrid = JSON.parse(localStorage.getItem('squares_grid'));
        if (!masterGrid) {
            alert("Unable to load an active game. Please contact an admin to start a game.");
            $state.go("welcome");
            return;
        }

        for (var r = 0; r < 10; r++){
            var row = [];
            for (var c = 0; c < 10; c++) {
                row.push(masterGrid[r][c]);
            }
            $scope.grid.push(row);
        }
    };

    initializeLocalGrid();

    $scope.clicked = function(row, col){
        if (!$scope.grid[row][col].taken || $scope.grid[row][col].user && $scope.grid[row][col].user.email != $rootScope.currentUser.email) {
            if ($scope.grid[row][col].taken && $scope.grid[row][col].user.email != $rootScope.currentUser.email) {
                alert("Square is already taken");
                return;
            }

            if ($scope.numPicked >= $rootScope.currentUser.picksAllowed) {
                alert("No more picks allowed.");
                return;
            }
        }

        $scope.grid[row][col].taken = !$scope.grid[row][col].taken;

        if ($scope.grid[row][col].taken) {
            $scope.numPicked += 1;
            $scope.grid[row][col].user = $rootScope.currentUser;
        } else {
            $scope.numPicked -= 1;
            $scope.grid[row][col].user = undefined;
        }
    };

    $scope.clearSelections = function () {
        $log.debug("clearing all selections");

        // uibHelper.confirmModal("Clear All Selections?", "Would you like to clear all your current selections?", true)
        //     .then(function(){
        //         $scope.grid = [];
        //         $scope.numPicked = 0;
        //         initializeGrid();
        //     });

        if (confirm("Clear all selections?")) {
            $scope.grid = [];
            $scope.numPicked = 0;
            initializeLocalGrid();
        }
    };

    $scope.submitSelection = function () {
        if ($scope.numPicked != $rootScope.currentUser.picksAllowed) {
            alert("Please select " + $rootScope.currentUser.picksAllowed + " squares.");
            return;
        }

        if (localStorage.getItem("gameActive") != "picking") {
            alert("The game is currently active or has not been started, you cannot select any squares.");
            return;
        }

        localStorage.setItem('squares_grid', JSON.stringify($scope.grid));

        $state.go("thanks4playing");
    };

    $scope.registration = function () {
        $state.go("register");
    }

});