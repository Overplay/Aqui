/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller( "rootController", function ( $scope, $log, sqGameService, footballAPI, ogAPI ) {

    $log.debug( "loaded rootController" );

    ogAPI.sendSpam({ emailbody: "This is coming from Aqui/ogAPI", to: "mitch@ourglass.tv"})
        .then(function(resp){
            $log.debug(resp);
        })
        .catch(function(err){
            $log.error(err);
        })

    var RUN_TESTS = false;

    function logTeams( t ) {
        $log.debug( "Team1: " + t.team1 + " Team 2: " + t.team2 );
    }

    function logGameInProgress( isGameRunning ) {
        $log.debug( "Game is: " + (isGameRunning ? "running!" : "not running") );
    }

    function logCurrentScore( scores ) {
        $log.debug( "Current Scores - team1: " + scores.team1 + ", team 2: " + scores.team2 );
    }

    function logScoreMap( scoreMap ) {
        $log.debug( "Score Map Col: " + scoreMap.colScoreMap );
        $log.debug( "Score Map Row: " + scoreMap.rowScoreMap );
    }

    function testSetTeams() {
        return sqGameService.getTeams()
            .then( logTeams )
            .then( function () {
                return sqGameService.setTeams( { team1: "49ers", team2: "Cardinals" } )
                    .then( sqGameService.getTeams );
            } )
            .then( logTeams )
            .catch( function ( err ) {
                $log.error( "Unexpected rejection changing teams" )
                $log.error( err.message );
            } );
    }

    function testStartGame() {

        return sqGameService.isGameInProgress()
            .then( logGameInProgress )
            .then( sqGameService.startGame )
            .then( sqGameService.isGameInProgress )
            .then( logGameInProgress )
            .catch( function ( err ) {
                $log.error( "Unexpected rejection changing game inprogress state" )
                $log.error( err.message );
            } );
    }

        if ( RUN_TESTS ) {

            sqGameService.resetGameModel()
                .then( function () {

                    $log.debug( "Starting tests" );

                    testSetTeams()
                        .then( testStartGame );

                } );
            
  
            // this is the actual code for the superbowl
            footballAPI.getLatestGameInfo( 2017020500 )
                .then( function ( stats ) {
                    $log.debug( stats );
                } )

            footballAPI.getScheduleForMonthAndSeason( 2, 2016 )
                .then( function ( stats ) {
                    $log.debug( stats );
                } )

        }


    });