/**
 * Created by mkahn on 1/19/17.
 */

app.controller("resultsController", function($scope, uibHelper, $log, $state, $timeout, $interval, sqGameService, grid){

    $log.debug("loading resultsController");


    $scope.grid = grid;

    $scope.currentScore = {team1: 0, team2: 0};
    $scope.q1Score = {team1: 0, team2: 0};
    $scope.q2Score = {team1: 0, team2: 0};
    $scope.q3Score = {team1: 0, team2: 0};
    $scope.q4Score = {team1: 0, team2: 0};
    $scope.finalScore = {team1: 0, team2: 0};

    $scope.q1Winner = {};
    $scope.q2Winner = {};
    $scope.q3Winner = {};
    $scope.q4Winner = {};
    $scope.finalWinner = {};
    $scope.currentWinner = {};

    $scope.teamNames = {team1: "team1", team2: "team2"};

    updateScopeGrid();
    getAllScores();
    updateTeamNames();
    getAllWinners();

    $scope.emptyArray = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 11 elements for the ng-repeat

    $scope.cancel = function () {
        $state.go("welcome");
    };

    $scope.refresh = function () {
        location.reload();
    };

    $scope.squareboardPage = function () {
        $state.go("squareboard");
    };

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

    function updateScopeGrid() {
        $log.debug("update to grid");
        $scope.grid = sqGameService.getRawGrid();
    }

    function findWinner( scores) {
        return sqGameService.getScoreMap()
            .then( function ( map ) {
                var row = map.rowScoreMap.indexOf( scores.team2 % 10 );
                var col = map.colScoreMap.indexOf( scores.team1 % 10 );
                var winner = $scope.grid[row][col];

                return winner.available ? "Empty Square" : winner.ownedBy.name;
            });
    }

    function getAllWinners() {
        findWinner( $scope.q1Score )
            .then(function ( winner ) {
                $scope.q1Winner = winner;
            });

        findWinner( $scope.q2Score )
            .then(function ( winner ) {
                $scope.q2Winner = winner;
            });

        findWinner( $scope.q3Score )
            .then(function ( winner ) {
                $scope.q3Winner = winner;
            });

        findWinner( $scope.q4Score )
            .then(function ( winner ) {
                $scope.q4Winner = winner;
            });

        findWinner( $scope.finalScore )
            .then(function ( winner ) {
                $scope.finalWinner = winner;
            });

        findWinner( $scope.currentScore )
            .then(function ( winner ) {
                $scope.currentWinner = winner;
            })
    }

    function getAllScores() {
        sqGameService.getQuarterScore( 1 )
            .then(function (score) {
                $scope.q1Score = score;
            });

        sqGameService.getQuarterScore( 2 )
            .then(function (score) {
                $scope.q2Score = score;
            });

        sqGameService.getQuarterScore( 3 )
            .then(function (score) {
                $scope.q3Score = score;
            });

        sqGameService.getQuarterScore( 4 )
            .then(function (score) {
                $scope.q4Score = score;
            });

        sqGameService.getFinalScore()
            .then(function (score) {
                $scope.finalScore = score;
            });

        sqGameService.getCurrentScore()
            .then(function( scores ) {
                $scope.currentScore = scores;
            })
    }
});
