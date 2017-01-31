/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("scoreManuallyController", function($scope, uibHelper, $log, $state,
                                                   $timeout, $interval, toastr, sqGameService, grid) {

    $log.debug("loading scoreManuallyController");

    $scope.currentScore = {team1: 0, team2: 0};
    $scope.teamNames = {team1: "team1", team2: "team2"};

    $scope.newScore = {team1: undefined, team2: undefined};

    updateTeamNames();
    updateCurrentScore();

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

    $scope.setScore = function ( qtr ) {
        promptForScore(qtr == 0 ? 'Set Final Score' : ('Set Score for Quarter ' + qtr))
            .then(function (newScore) {
                $log.debug('got new score: team1=' + newScore.team1 + " team2=" + newScore.team2);
            });
    };

    //TODO this needs to send back an object with the score for specified qtr, qtr == 0 for final score
    $scope.getQuarterScore = function ( qtr ) {
        return {team1: 0, team2: 0};
    };

    $scope.setCurrentScore = function () {

        promptForScore("Set Current Score")
            .then(function ( newScore ) {
                sqGameService.setCurrentScore( newScore )
                    .then(function () {
                        toastr.success("New score set successfully.");
                        updateCurrentScore();
                    })
                    .catch(function () {
                        toastr.warning("Unable to set a new score.");
                        updateCurrentScore();
                    });
            });


    };

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

