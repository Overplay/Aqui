/**
 * Created by mkahn on 1/19/17.
 */

app.controller("resultsController", function($scope, uibHelper, $log, $state, sqGameService, grid){

    $log.debug("loading resultsController");

    var DEMOSTATE = true;

    $scope.grid = grid;

    if (DEMOSTATE) {
        $scope.teamNames = {team1: "Broncos", team2: "49ers"};
        $scope.currentScore = {team1: 10, team2: 3};
    } else {
        $scope.teamNames = sqGameService.getTeams();
        $scope.currentScore = sqGameService.getCurrentScore();
    }

    $scope.numPicked = countTiles();
    $scope.emptyArray = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 11 elements for the ng-repeat

    $scope.displayInfo = function(row, col) {
        if ($scope.grid[row][col].available) {
            uibHelper.confirmModal("Unpurchased Square", "This square has not been taken.");
            return;
        }

        uibHelper.confirmModal("This Square is Taken",
            "Owner Name: " + $scope.grid[row][col].ownedBy.name + "\n" +
            "Owner Email: " + $scope.grid[row][col].ownedBy.email);

        // TODO make the confirm box above have a line break
    };

    function countTiles () {
        if (!$scope.grid) return 0;

        var count = 0;

        for (var r = 0; r < 10; r++) {
            for (var c = 0; c < 10; c++) {
                if (!$scope.grid[r][c].available) {
                    count++;
                }
            }
        }

        return count;
    }

    $scope.cancel = function () {
        $state.go("welcome");
    };

    function getCurrentScore() {
        // gets the current score of the game
        $scope.currentScore = sqGameService.getCurrentScore();
    }

    function getFinalScore( quarter ) {
        // gets the score of the specified quarter
    }

    function findWinner () {
        var team1 = $scope.currentScore.team1;
        var team2 = $scope.currentScore.team2;

        var row = team2 % 10;
        var col = team1 % 10;

        $log.debug("Current Winner: row=" + row + ", col=" + col);
        //TODO this needs to get the column maps
    }

    findWinner();

});
