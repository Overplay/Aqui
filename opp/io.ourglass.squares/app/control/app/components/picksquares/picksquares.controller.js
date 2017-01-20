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
            fullname: 'Erik Phillips',
            initials: 'DEMO',
            email: 'erik.phillips@icloud.com'
        }
    }

    if (!$rootScope.currentUser) {
        $log.debug("no current user found");
        $state.go("register");
    }


    var initializeGrid = function () {
        for (var col=0; col<10; col++){
            var row = [];
            for (var r=0; r<10; r++){
                row.push(false);
            }
            $scope.grid.push(row);
        }
    };

    initializeGrid();

    $scope.clicked = function(row, col){
        if (!$scope.grid[row][col] && $scope.numPicked >= $rootScope.currentUser.picksAllowed) {
            alert("No more picks allowed.");
            return;
        }

        $scope.grid[row][col] = !$scope.grid[ row ][ col ];

        if ($scope.grid[row][col]) {
            $scope.numPicked += 1;
        } else {
            $scope.numPicked -= 1;
        }
    };

    $scope.clearSelections = function () {
        $log.debug("clearing all selections");

        // uibHelper.confirmModal("Clear All Selections?", "Would you like to clear all your current selections?", true)
        //     .then(function(){
        //         $scope.grid = [];
        //         initializeGrid();
        //     });

        $scope.grid = [];
        $scope.numPicked = 0;
        initializeGrid();
    };

    $scope.submitSelection = function () {
        if ($scope.numPicked != $rootScope.currentUser.picksAllowed) {
            alert("Please select " + $rootScope.currentUser.picksAllowed + " squares.");
        }

        $log.debug("submit now!")
    };

});