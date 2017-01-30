/**
 * Created by mkahn on 1/25/17.
 */

app.factory( 'sqGame', function ( $log, $rootScope, ogAPI, fbGameSim, $timeout ) {

    $log.debug( "sqGame service loaded" );

    var service = {};

    service.gameMode = 'attract';
    service.dataSource = 'sim';  //api, asahi, sim
    service.localGameState = "picking";
    service.squaresSold = 0;
    service.currentQ = 0;

    function resetGame() {

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

    function updateFromSimulator(){

        var status = fbGameSim.getStatus();
        // You can't get here pre-running (picking) so no need to check?
        ogAPI.model.gameState = status.inProgress ? "running" : "done";
        
        var winner = service.getCurrentWinner();
        $log.warn("Current winner is: "+winner.email || "no one");

        if (status.quarter > ogAPI.model.currentQuarter ){
            $log.debug("Changed from Q"+ ogAPI.model.currentQuarter +" to Q"+status.quarter);
            ogAPI.model.perQuarterScores.push( _.cloneDeep(ogAPI.model.currentScore));
        }

        if (status.done){
            ogAPI.model.finalScore = status.currentScore;
            ogAPI.model.gameState = 'done'; // redundant?
        }

        ogAPI.model.currentScore = status.currentScore;
        ogAPI.model.currentQuarter = status.quarter;

        ogAPI.save();

        if (ogAPI.model.gameState!="done")
            $timeout(updateFromSimulator, 2000);

    }

    function startGameUpdates() {
        ogAPI.model.gameState = 'running';
        switch (service.dataSource){
            case 'sim':
                fbGameSim.startGame(5000);
                service.currentQ = 1;
                updateFromSimulator();
                break;

            default:
                throw new Error("Not implemented");

        }

        ogAPI.save();
    }

    function modelUpdate( newModel ) {
        $log.debug( "Got a model update!" );

        if ( newModel.colScoreMap.length == 0 )
            initRowColMap();

        // See if game is starting
        if ( ogAPI.model.gameState == 'starting' ) {
            $log.debug( "sqCentral: Game starting!" );
            //resetGame();
            $timeout(startGameUpdates, 5000); // allow model to unlock
        } else if (ogAPI.model.gameState=='picking') {
            service.localGameState = 'picking';
            totalSquaresSold();
        }

        $log.debug( "Game state is: " + newModel.gameState );
        $rootScope.$broadcast( 'MODEL_UPDATE', newModel );


    }
    

    function init() {

        ogAPI.init( {
            appType:       'tv',
            appName:       "io.ourglass.squares",
            modelCallback: modelUpdate
        } );

        ogAPI.loadModelAndLock(); //this will automatically call the modelUpdate

    }

    init();

    service.getCurrentWinner = function(){
        
        var col = ogAPI.model.colScoreMap.indexOf(ogAPI.model.currentScore.team1);
        var row = ogAPI.model.rowScoreMap.indexOf(ogAPI.model.currentScore.team2);
        var winner = ogAPI.model.grid[row][col];
        if (!winner.hasOwnProperty('email'))
            return { name: "", email: ""}
        
        return winner;
        
    }

    return service;

});