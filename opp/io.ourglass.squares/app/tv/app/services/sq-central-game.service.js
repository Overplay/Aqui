/**
 * Created by mkahn on 1/25/17.
 */

app.factory( 'sqGame', function ( $log, $rootScope, ogAPI, fbGameSim, $timeout, $state ) {

    $log.debug( "sqGame service loaded" );

    var service = {};

    service.gameMode = 'attract';
    service.dataSource = 'sim';  //api, asahi, sim, local
    service.localGameState = "picking";
    service.squaresSold = 0;
    service.currentQ = 0;


    function makeInitials( name ) {

        var initials;
        var array = name.split( ' ' );
        if ( array.length == 1 ) {
            initials = array[ 0 ].charAt( 0 ).toUpperCase();
        } else {
            initials = array[ 0 ].charAt( 0 ).toUpperCase() + array[ array.length - 1 ].charAt( 0 ).toUpperCase();
        }

        return initials;

    }

    function totalSquaresSold() {

        var squares = ogAPI.model.grid;
        service.squaresSold = 0;
        for ( var r = 0; r < 10; r++ )
            for ( var c = 0; c < 10; c++ ) {
                if ( squares[ r ][ c ].hasOwnProperty( 'email' ) )
                    service.squaresSold++;
            }
    }

    function initRowColMap() {

        $log.debug( "Fresh model, creating score maps..." );
        ogAPI.model.colScoreMap = _.shuffle( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
        ogAPI.model.rowScoreMap = _.shuffle( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] );
        ogAPI.save();

    }

    function updateFromSimulator() {

        var status = fbGameSim.getStatus();
        // You can't get here pre-running (picking) so no need to check?
        ogAPI.model.gameState = status.inProgress ? "running" : "done";

        var winner = service.getCurrentWinner();
        $log.warn( "Current winner is: " + winner.email || "no one" );

        if ( status.quarter > ogAPI.model.currentQuarter ) {
            $log.debug( "Changed from Q" + ogAPI.model.currentQuarter + " to Q" + status.quarter );
            ogAPI.model.perQuarterScores.push( _.cloneDeep( ogAPI.model.currentScore ) );
        }

        if ( status.done ) {
            ogAPI.model.finalScore = status.currentScore;
            ogAPI.model.gameState = 'done'; // redundant?
        }

        ogAPI.model.currentScore = status.currentScore;
        ogAPI.model.currentQuarter = status.quarter;

        ogAPI.save();

        if ( ogAPI.model.gameState != "done" )
            $timeout( updateFromSimulator, 15000 );

    }

    function doUpdate() {

        switch ( service.dataSource ) {
            case 'sim':
                updateFromSimulator();
                break;

            default:
                throw new Error( "Not implemented" );
        }
    }

    function startGameUpdates() {
        ogAPI.model.gameState = 'running';
        service.localGameState = 'running';
        switch ( service.dataSource ) {
            case 'sim':
                fbGameSim.startGame( 3000 );
                service.currentQ = 1;
                doUpdate();
                break;

            case 'local':
                $log.warning('sqCentral: dataSource is local, so no fetch loop!');
                break;

            default:
                throw new Error( "Not implemented" );

        }


        ogAPI.save();
    }

    function modelUpdate( newModel ) {

        $log.debug( "sqCentral: Got a model update!" );

        if ( newModel.colScoreMap.length == 0 )
            initRowColMap();

        service.dataSource = newModel.dataSource;

        // See if game is starting
        if ( ogAPI.model.gameState == 'starting' ) {
            $log.debug( "sqCentral: Game starting!" );
            $timeout( startGameUpdates, 5000 ); // allow model to unlock
            //$state.go( 'playing' );
        } else if ( ogAPI.model.gameState == 'picking' ) {
            service.localGameState = 'picking';
            totalSquaresSold();
        } else if ( ogAPI.model.gameState == 'running' && service.localGameState != 'running' ) {
            $log.debug( "sqCentral: woke up picking, but it looks like I am running." );
            //resetGame();
            $timeout( doUpdate, 5000 ); // allow model to unlock
            //$state.go( 'playing' );
        }

        $log.debug( "sqCentral: Game state is: " + newModel.gameState );
        $rootScope.$broadcast( 'MODEL_UPDATE', newModel );


    }


    function init() {

        ogAPI.init( {
            appType:       'tv',
            appName:       "io.ourglass.squares",
            modelCallback: modelUpdate
        } );

        ogAPI.loadModel(); //this will automatically call the modelUpdate

    }

    init();


    service.getWinnerForScore = function ( score ) {

        var team1LastDigit = score.team1 % 10;
        var team2LastDigit = score.team2 % 10;
        
        var col = ogAPI.model.colScoreMap.indexOf( team1LastDigit );
        var row = ogAPI.model.rowScoreMap.indexOf( team2LastDigit );
        var winner = ogAPI.model.grid[ row ][ col ];
        if ( !winner ) {
            $log.error( "MISS in grid on row: " + row + " col: " + col );
        }
        if ( !winner || !winner.hasOwnProperty( 'email' ) )
            return { name: "", email: "", initials: "??" }

        winner[ "initials" ] = makeInitials( winner.name );
        return winner;

    }

    service.getCurrentWinner = function () {
        return service.getWinnerForScore( ogAPI.model.currentScore );
    };
    
    service.getModel = function(){
        return ogAPI.model;
    };

    return service;

} );