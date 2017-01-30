/**
 * Created by mkahn on 1/28/17.
 */

app.factory( 'fbGameSim', function ( $timeout, $log ) {

    var pts = [ 2, 3, 6, 7, 3, 6, 7, 3, 6, 7, 3, 6, 7, 8 ];
    var clock = 0;
    var quarter = 1;
    var team1Score = 0;
    var team2Score = 0;
    var team1Possession = true;
    var inProgress = false;
    var done = false;
    var timeoutDelay;
    
    var FORCE_TIE = false;

    function getRandomPoints() {

        return (Math.random()>0.9)?_.sample( pts ):0;
    }

    function scoringDrive() {

        if (FORCE_TIE && quarter<5){
            team1Score++;
            team2Score++;
            $log.debug("SSS forcing tie");
            return;
        }

        if ( FORCE_TIE && quarter == 5 ) {
            team1Score++;
            $log.debug( "SSS resolving tie" );
            return;
        }
        
        if ( team1Possession )
            team1Score += getRandomPoints();
        else
            team2Score += getRandomPoints();

        team1Possession = !team1Possession;
    }

    function updateGame() {

        $log.debug( "SSS ======= " + quarter + "Q =========" )
        $log.debug( "SSS Team1: " + team1Score + " Team2: " + team2Score );
        clock -= 1;
        $log.debug( "SSS Quarter clock is: " + clock );

        if ( clock == 0 && ( quarter <= 3 ) ) {
            $log.debug( "SSS End of quarter " + quarter );
            quarter++;
            clock = 15;
        } else if ( ( clock == 0 && ( quarter == 4 )) || (quarter == 5) ) {  //end 4th or in OT quarter

            var gameOver = team1Score != team2Score;

            if ( gameOver ) {
                $log.debug( "SSS Game over, final score: Team1 - " + team1Score + ' Team2 - ' + team2Score );
                done = true;
                inProgress = false;
            } else if ( !gameOver && quarter == 4 ) {
                $log.debug( "SSS Going to OT" );
                quarter++;
                clock = 5000; //run till done
            }
        }

        if ( !gameOver ) {
            scoringDrive();
            $timeout( updateGame, timeoutDelay );
        }

    }

    function startGame( msPerMinute ) {
        timeoutDelay = msPerMinute || 100; // 500ms per minute of game time
        team1Score = 0;
        team2Score = 0;
        team1Possession = true;
        inProgress = true;
        done = false;
        quarter = 1;
        clock = 15; //min
        updateGame();
    }

    return {
        startGame: startGame,
        gameInProgress: function(){ return inProgress; },
        gameOver: function(){ return done },
        getStatus: function () {
            return {
                currentScore: { team1: team1Score, team2: team2Score },
                quarter: quarter,
                clock: clock,
                inProgress: inProgress,
                done: done
            }

        }
    }

} );