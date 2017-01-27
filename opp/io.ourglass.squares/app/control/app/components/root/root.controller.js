/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller( "rootController", function ( $scope, $log, sqGameService, $timeout ) {

    $log.debug( "loaded rootController" );

    var RUN_TESTS = true;
    
    function logTeams(t){
        $log.debug( "Team1: " + t.team1 + " Team 2: " + t.team2 );
    }
    
    function logGameInProgress(isGameRunning){
        $log.debug( "Game is: " + (isGameRunning ? "running!" : "not running") );
    }

    if (RUN_TESTS){
    
    sqGameService.resetGameModel()
        .then( function(){

            $log.debug("Starting tests");
            sqGameService.getTeams()
                .then( logTeams )
                .then( function () {
                    return sqGameService.setTeams( { team1: "49ers", team2: "Cardinals" } )
                        .then( sqGameService.getTeams );
                } )
                .then( logTeams )
                .catch( function(err){
                    $log.error("Unexpected rejection changing teams")
                    $log.error( err.message );
                });


            sqGameService.isGameInProgress()
                .then( logGameInProgress )
                .then( sqGameService.startGame )
                .then( sqGameService.isGameInProgress )
                .then( logGameInProgress )
                .catch( function ( err ) {
                    $log.error( "Unexpected rejection changing game inprogress state" )
                    $log.error( err.message );
                } );
        
        
        
        
        })

        

    }


});