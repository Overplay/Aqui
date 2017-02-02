/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("scoreManuallyController", function($scope, uibHelper, $log, $state,
                                                   $timeout, $interval, toastr, sqGameService, grid) {

    $log.debug("loading scoreManuallyController");

    $scope.currentScore = {team1: 0, team2: 0};
    $scope.q1Score = {team1: 0, team2: 0};
    $scope.q2Score = {team1: 0, team2: 0};
    $scope.q3Score = {team1: 0, team2: 0};
    $scope.q4Score = {team1: 0, team2: 0};
    $scope.finalScore = {team1: 0, team2: 0};

    $scope.teamNames = {team1: "team1", team2: "team2"};

    $scope.newScore = {team1: undefined, team2: undefined};

    updateTeamNames();
    getAllScores();

    $scope.settingsPage = function () {
        $state.go("settings");
    };

    $scope.refreshCurrentPage = function () {
        // this is needed for the admin to refresh the page to get new data
        location.reload();
    };

    $scope.finishGame = function () {
        // finished the game when the quarter is over
        uibHelper.confirmModal( "Finish Game?", "Do you want to finish the current game?" )
            .then( function () {
                sqGameService.finishGame();
            });
    };

    $scope.setQuarterScore = function ( qtr ) {
        promptForScore('Set Score for Quarter ' + qtr)
            .then(function ( newScore ) {
                sqGameService.setQuarterScore(qtr, newScore)
                    .then(getAllScores);
            });
    };

    $scope.setFinalScore = function () {
        promptForScore('Set Final Score')
            .then(function ( newScore ) {
                sqGameService.setFinalScore(newScore)
                    .then(getAllScores);
            });
    };

    $scope.setCurrentScore = function () {
        promptForScore("Set Current Score")
            .then(function ( newScore ) {
                sqGameService.setCurrentScore( newScore )
                    .then(getAllScores);
            });
    };

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

    function updateTeamNames() {
        // gets an object with the current teams playing
        sqGameService.getTeams()
            .then( function( t ) {
                $scope.teamNames = t;
            })
            .catch(function () {
                $log.error("Unexpected rejection getting teams - using defaults");
                $scope.teamNames = {team1: "team1", team2: "team2"};
            })
    }

    function promptForScore( infotext ) {
        var fields = [
            {
                type: 'text',
                value: $scope.newScore.team1,
                field: 'team1field',
                label: 'Team 1 Score',
                placeholder: 'Team 1 Score'
            },
            {
                type: 'text',
                value: $scope.newScore.team2,
                field: 'team2field',
                label: 'Team 2 Score',
                placeholder: 'Team 2 Score'
            }
        ];

        return uibHelper.inputBoxesModal(infotext, '', fields)
            .then(function ( newvals ) {
                return {team1: newvals.team1field, team2: newvals.team2field};
            });
    }
});

