/**
 * Created by mkahn on 1/19/17.
 */

app.controller("resultsController", function($scope, uibHelper, $log, $state){

    $log.debug("loading resultsController");

    $scope.grid = JSON.parse(localStorage.getItem("squares_grid"));
    $scope.gridScores = JSON.parse(localStorage.getItem("gridScores"));

    $scope.numPicked = countTiles();
    $scope.emptyArray = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    $scope.settings = function () {
        $state.go("settings");
    };

    $scope.displayInfo = function(row, col) {
        if (!$scope.grid[row][col].taken) {
            alert("This square is not taken");
            return;
        }

        alert("Owner of Square: " + $scope.grid[row][col].user.fullname + "\n" +
            "Email of Owner: " + $scope.grid[row][col].user.email);
    };

    function countTiles () {
        if (!$scope.grid) return 0;

        var count = 0;

        for (var r = 0; r < 10; r++) {
            for (var c = 0; c < 10; c++) {
                if ($scope.grid[r][c].taken) {
                    count++;
                }
            }
        }

        return count;
    }
});
