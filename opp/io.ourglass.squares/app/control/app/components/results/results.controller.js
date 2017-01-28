/**
 * Created by mkahn on 1/19/17.
 */

app.controller("resultsController", function($scope, uibHelper, $log, $state, $timeout, $interval, sqGameService, grid){

    $log.debug("loading resultsController");


    $scope.grid = grid;
    $scope.currentScore = {team1: 0, team2: 0};
    $scope.teamNames = {team1: "team1", team2: "team2"};

    updateCurrentScore();
    updateTeamNames();
    updateScoreMapping();

    $interval(function () {
        updateScopeGrid();
        updateTeamNames();
        updateCurrentScore();
        updateScoreMapping();
    }, 5000); // update information every 5 seconds


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

    $scope.cancel = function () {
        $state.go("welcome");
    };

    $scope.getClassType = function (row, col) {
        if (row == 0 && col == 0) return 'empty';
        if (row == 0 || col == 0) return 'header';
        if (!$scope.grid[row - 1][col - 1].available) return 'taken';
        return 'free';
    };

    function updateCurrentScore() {
        // gets the current score of the game
        sqGameService.getCurrentScore()
            .then(function( scores ) {
                $scope.currentScore = scores;
            })
            .catch(function () {
                $log.error("Unexpected rejection getting current scores - using 0-0");
                $scope.currentScore = {team1: 0, team2: 0};
            })
    }

    function updateTeamNames() {
        sqGameService.getTeams()
            .then( function( t ) {
                $scope.teamNames = t;
            })
            .catch(function () {
                $log.error("Unexpected rejection getting teams - using defaults");
                $scope.teamNames = {team1: "team1", team2: "team2"};
            })
    }

    function updateScoreMapping() {
        sqGameService.getScoreMap()
            .then( function ( map ) {
                $scope.scoreMap = map;
                findWinner();
            })
            .catch( function ( err ) {
                $log.error( "Unexpected rejection getting score map" );
            });
    }

    function updateScopeGrid() {
        $log.debug("update grid");
        $scope.grid = sqGameService.getRawGrid();
    }

    function findWinner() {
        var col = $scope.currentScore.team1 % 10;
        var row = $scope.currentScore.team2 % 10;
        var rowMap = $scope.scoreMap.rowScoreMap;
        var colMap = $scope.scoreMap.colScoreMap;

        for (var r = 0; r < 10; r++)
            if (rowMap[r] == row)
                break;

        for (var c = 0; c < 10; c++)
            if (colMap[c] == col)
                break;

        if ($scope.grid[r][c].available) {
            $scope.winner = "free square";
        } else {
            $scope.winner = $scope.grid[r][c].ownedBy.name;
        }

        return {rowIdx: r, colIdx: c};
    }
});
