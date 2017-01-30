/**
 * Created by mkahn on 1/19/17.
 */

app.controller("settingsController", function($scope, uibHelper, $log, $state, $interval, toastr, sqGameService, grid ){

    $log.debug( "loading settingsController" );

    var DEMOSTATE = false;
    updateStatusMarkers();
    updateTotalTilesPicked();
    updateTeamNames();

    if ( DEMOSTATE ) {
        $scope.gameDone = false;
        $scope.gameInProgress = false;
        $scope.tilesPicked = getTotalTilesPicks();
        $scope.teamNames = { team1: "Broncos", team2: "49ers" };
    } else {
        // gameDone = true if the game is finished
        // gameInProgress = true if the game is currently in progress
        //$scope.gameDone = sqGameService.gameDone();
        //$scope.gameInProgress = sqGameService.gameInProgress();
        $scope.tilesPicked = getTotalTilesPicks();
        $scope.teamNames = getTeams();
    }
    $interval(function () {
        updateTotalTilesPicked();
        updateTeamNames();
        updateStatusMarkers();
    }, 5000); // updates every 5 seconds

    $scope.viewResultsPage = function () {
        $state.go( 'results' );
    };

    // TODO ERIK this is broken. WHY?
    $scope.getGameStatusText = function () {
        if ($scope.gameDone) return 'Game Completed';
        if ($scope.gameInProgress) return 'Game in Progress';
        return 'Game Not Yet Started';
    };

    $scope.refreshCurrentPage = function () {
        // this is needed for the admin to refresh the page to get new data
        location.reload();
    };

    $scope.startGame = function () {
        // starts current game after picking is done
        sqGameService.startGame();
        uibHelper.confirmModal("Start Game?", "Would you like to start the game?")
            .then(function () {
                sqGameService.startGame();
                $scope.gameDone = false;
                $scope.gameInProgress = true;
            });
    };

    $scope.newGame = function () {
        // clears the grid
        sqGameService.resetGameModel();
        // clears the grid and starts a new game
        uibHelper.confirmModal("Create New Game?", "Do you want to create a new game? All current data will be lost.")
            .then(function () {
                sqGameService.resetGameModel();
                $scope.gameDone = false;
                $scope.gameInProgress = false;
            });
    };

    $scope.finishGame = function () {
        // finished the game when the quarter is over
        uibHelper.confirmModal("Finish Game?", "Do you want to finish the current game?")
            .then(function () {
                sqGameService.finishGame();
                $scope.gameDone = true;
                $scope.gameInProgress = false;
            });
    };

    $scope.simGame = function () {
        sqGameService.resetGameModel()
            .then(function(){
                sqGameService.fillGridSimPlayers();
                return sqGameService.startGame();

            });

        
    $scope.manuallySetScores = function () {
        $state.go("score-manually");
    };

    $scope.setTeams = function () {
        // set the teams from the form
        if (!$scope.teamNames.team1 || !$scope.teamNames.team2) {
            uibHelper.confirmModal("No Team Names Entered", "Please enter both team names into the form.");
            return;
        }

        sqGameService.setTeams( $scope.teamNames )
            .then( function() {
                toastr.success( "Teams names updated!" );
                sqGameService.getTeams()
                    .then( logTeams )
            })
            .catch( function() {
                toastr.warning( "Unable to update team names." );
                $log.error("Unexpected rejection changing teams");
                updateTeamNames();
            })
    };

    function getTeams() {
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

    function updateTotalTilesPicked() {
        grid = sqGameService.getRawGrid();

        var count = 0;
        for ( var row = 0; row < 10; row++ )
            for ( var col = 0; col < 10; col++ )
                if ( !grid[ row ][ col ].available )
                    count += 1;
        $scope.tilesPicked = count;
    }

    function updateStatusMarkers() {
        sqGameService.isGameDone()
            .then(function ( done ) {
                $scope.gameDone = done;
            });
        sqGameService.isGameInProgress()
            .then(function ( running ) {
                $scope.gameInProgress = running;
            })
    }

    function logTeams( t ){
        $log.debug( "Team 1: " + t.team1 + ", Team 2: " + t.team2 );
    }

});

 

} );