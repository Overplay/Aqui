/**
 * Created by mkahn on 1/19/17.
 */

app.controller("settingsController", function($scope, uibHelper, $log, $state, sqGameService, grid ){

    $log.debug("loading settingsController");

    var DEMOSTATE = true;

    if (DEMOSTATE) {
        $scope.gameDone = false;
        $scope.gameInProgress = false;
        $scope.tilesPicked = getTotalTilesPicks();
        $scope.teamNames = {team1: "Broncos", team2: "49ers"};
    } else {
        // gameDone = true if the game is finished
        // gameInProgress = true if the game is currently in progress
        $scope.gameDone = sqGameService.gameDone();
        $scope.gameInProgress = sqGameService.gameInProgress();
        $scope.tilesPicked = getTotalTilesPicks();
        $scope.teamNames = getTeams();
    }

    $scope.viewResultsPage = function () {
        $state.go('results');
    };

    $scope.refreshCurrentPage = function () {
        // this needs to be here for the user to refresh the page to get new data
        location.reload();
    };

    $scope.startGame = function () {
        // starts current game after picking is done
    };

    $scope.newGame = function () {
        // clears the grid
    };

    $scope.finishGame = function () {
        // finished the game when the quarter is over
    };

    $scope.abortGame = function () {
        // stops the game mid-session
    };

    $scope.setTeams = function () {
        // set the teams from the form
    };

    function getTeams () {
        // gets an object with the current teams playing
    }

    function getTotalTilesPicks() {
        var count = 0;
        for (var row = 0; row < 10; row++)
            for (var col = 0; col < 10; col++)
                if (!grid[row][col].available)
                    count += 1;
        return count;
    }

});