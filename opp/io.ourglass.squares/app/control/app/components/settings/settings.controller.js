/**
 * Created by mkahn on 1/19/17.
 */
 
 //TODO Erik, I think this file got badly mangled in the merge!! PLease check.

app.controller( "settingsController", function ( $scope, uibHelper, $log, $state, $interval, toastr, 
    $timeout, sqGameService, grid ) {

    $log.debug( "loading settingsController" );

    updateTotalTilesPicked();
    updateTeamNames();

    $scope.viewResultsPage = function () {
        $state.go( 'results' );
    };

    $scope.manuallySetScores = function () {
        $state.go( "score-manually" );
    };

    $scope.exitPage = function () {
        $state.go("welcome");
    };

    $scope.getGameStatusText = function () {
        var gameState = sqGameService.getGameState();
        if ( gameState ==  'done') return 'Game Completed';
        if ( gameState == 'running' ) return 'Game in Progress';
        if ( gameState == 'picking' ) return "Picking Squares";
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
            } );
    };

    $scope.newGame = function () {
        uibHelper.confirmModal( "Create New Game?", "Do you want to create a new game? All current data will be lost." )
            .then( function () {
                sqGameService.resetGameModel();
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

    function logTeams( t ) {
        $log.debug( "Team 1: " + t.team1 + ", Team 2: " + t.team2 );
    }

    $scope.editTeamNames = function () {
        var fields = [
            {
                type: 'text',
                value: $scope.teamNames.team1,
                field: 'team1field',
                label: 'Team 1 Name',
                placeholder: 'Team 1 Name'
            },
            {
                type: 'text',
                value: $scope.teamNames.team2,
                field: 'team2field',
                label: 'Team 2 Name',
                placeholder: 'Team 2 Name'
            }
        ];

        uibHelper.inputBoxesModal('Edit Team Names', '', fields)
            .then(function ( newvals ) {
                $scope.teamNames.team1 = newvals.team1field;
                $scope.teamNames.team2 = newvals.team2field;

                sqGameService.setTeams( $scope.teamNames )
                    .then( function () {
                        toastr.success( "Teams names updated!" );
                        sqGameService.getTeams()
                            .then( logTeams )
                    })
                    .catch( function () {
                        toastr.warning( "Unable to update team names." );
                        $log.error( "Unexpected rejection changing teams" );
                        updateTeamNames();
                    });
            })
            .catch( updateTeamNames )
    };
});
