/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("scoreManuallyController", function($scope, uibHelper, $log, $state, $timeout, $interval, toastr, sqGameService, grid) {

    $log.debug("loading scoreManuallyController");

    $scope.currentScore = {team1: 0, team2: 0};
    $scope.teamNames = {team1: "team1", team2: "team2"};

    $scope.newScore = {team1: undefined, team2: undefined};

    updateTeamNames();
    updateCurrentScore();

    $scope.settingsPage = function () {
        $state.go("settings");
    };

    $scope.incrementScore = function ( team, by ) {

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
            } );
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

    $scope.setScore = function () {
        var newScore = $scope.newScore;

        if (newScore.team1 == undefined)
            newScore.team1 = $scope.currentScore.team1;
        if (newScore.team2 == undefined)
            newScore.team2 = $scope.currentScore.team2;

        setCurrentScore( newScore );

        $scope.newScore = {team1: undefined, team2: undefined};
    };

    function setCurrentScore( newScore ) {
        sqGameService.setCurrentScore( newScore )
            .then(function () {
                toastr.success("New score set successfully.");
                updateCurrentScore();
            })
            .catch(function () {
                toastr.warning("Unable to set a new score.");
                updateCurrentScore();
            });
    }
});

