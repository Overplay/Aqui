/**
 * Created by mkahn on 1/19/17.
 */
 
 //TODO Erik, I think this file got badly mangled in the merge!! PLease check.

app.controller( "settingsController", function ( $scope, uibHelper, $log, $state, $interval, toastr, 
    $timeout, sqGameService, grid ) {

    $log.debug( "loading settingsController" );
    
    updateStatusMarkers();
    updateTotalTilesPicked();
    updateTeamNames();
    
    //TODO Erik, reason for this, and $intervals must be killed on $scope end
    $interval( function () {
        updateTotalTilesPicked();
        updateTeamNames();
        updateStatusMarkers();
    }, 5000 ); // updates every 5 seconds

    $scope.viewResultsPage = function () {
        $state.go( 'results' );
    };

    // TODO ERIK this is broken. WHY? MAK: don't think this is my note
    $scope.getGameStatusText = function () {
        if ( $scope.gameDone ) return 'Game Completed';
        if ( $scope.gameInProgress ) return 'Game in Progress';
        return 'Game Not Yet Started';
    };

    $scope.refreshCurrentPage = function () {
        // this is needed for the admin to refresh the page to get new data
        location.reload();
    };

    $scope.startGame = function () {
        // starts current game after picking is done
        uibHelper.confirmModal( "Start Game?", "Would you like to start the game?" )
            .then( function () {
                sqGameService.startGame();
                //TODO Erik: the two bools are replaced with gameState now (string) "picking", "running", "done"
                //$scope.gameDone = false;
                //$scope.gameInProgress = true;
            } );
    };

    $scope.newGame = function () {
        // clears the grid
        // clears the grid and starts a new game
        uibHelper.confirmModal( "Create New Game?", "Do you want to create a new game? All current data will be lost." )
            .then( function () {
                sqGameService.resetGameModel();
                //TODO Erik: the two bools are replaced with gameState now (string) "picking", "running", "done"
                // $scope.gameDone = false;
                // $scope.gameInProgress = false;
            } );
    };

    $scope.finishGame = function () {
        // finished the game when the quarter is over
        uibHelper.confirmModal( "Finish Game?", "Do you want to finish the current game?" )
            .then( function () {
                sqGameService.finishGame();
                //TODO Erik: the two bools are replaced with gameState now (string) "picking", "running", "done"

                // $scope.gameDone = true;
                // $scope.gameInProgress = false;
            } );
    };

    function wait2(){
        // Let's the model unlock between blasts
        return $timeout(function(){ $log.warn("...WAITING 2 SECONDS...")}, 2000);
    }

    $scope.simGame = function () {
        sqGameService.resetGameModel()
            .then(wait2)
            .then( function () {
                sqGameService.fillGridSimPlayers();
                return wait2();
            })
            .then( sqGameService.startGame );
    };


    $scope.manuallySetScores = function () {
        $state.go( "score-manually" );
    };

    $scope.setTeams = function () {
        // set the teams from the form

        //TODO Erik, there is a uibHelper that you can use to collect the team names modally. Ask me about it.
        if ( !$scope.teamNames.team1 || !$scope.teamNames.team2 ) {
            uibHelper.confirmModal( "No Team Names Entered", "Please enter both team names into the form." );
            return;
        }

        sqGameService.setTeams( $scope.teamNames )
            .then( function () {
                toastr.success( "Teams names updated!" );
                sqGameService.getTeams()
                    .then( logTeams )
            } )
            .catch( function () {
                toastr.warning( "Unable to update team names." );
                $log.error( "Unexpected rejection changing teams" );
                updateTeamNames();
            } )
    };

    //function getTeams() {
    function updateTeamNames() {
        // gets an object with the current teams playing
        sqGameService.getTeams()
            .then( function ( t ) {
                $scope.teamNames = t;
            } )
            .catch( function () {
                $log.error( "Unexpected rejection getting teams - using defaults" );
                $scope.teamNames = { team1: "team1", team2: "team2" };
            } );
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
            .then( function ( done ) {
                $scope.gameDone = done;
            } );
        sqGameService.isGameInProgress()
            .then( function ( running ) {
                $scope.gameInProgress = running;
            } )
    }

    function logTeams( t ) {
        $log.debug( "Team 1: " + t.team1 + ", Team 2: " + t.team2 );
    }


});