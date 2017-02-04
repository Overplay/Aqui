/**
 * Created by mkahn on 1/25/17.
 */

app.factory( 'sqGame', function ( $log, $rootScope, ogAPI, $timeout, $q ) {

    $log.debug( "sqGame service loaded" );

    var service = {};

    service.gameMode = 'attract';
    service.dataSource = 'sim';  //api, asahi, sim, local
    service.localGameState = "picking";
    service.squaresSold = 0;
    service.currentQ = 0;
    
    service.model = {};
    
    var _initialized = false;


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

        var squares = service.model.grid;
        service.squaresSold = 0;
        for ( var r = 0; r < 10; r++ )
            for ( var c = 0; c < 10; c++ ) {
                if ( squares[ r ][ c ].hasOwnProperty( 'email' ) )
                    service.squaresSold++;
            }
    }


     function updateRemoteModel(model){
        _initialized = true;
        service.model = model;
        $log.debug( "sqCentral: Game state is: " + model.gameState );
        if (service.model.gameState=='picking')
            totalSquaresSold();
        $rootScope.$broadcast( 'MODEL_UPDATE', model );
        if (model.gameState!='done'){
            $timeout( remoteUpdate, 15000 );
        }
    }
    
    
    function remoteUpdate(){
        ogAPI.proxyGet(ogAPI.model.dataSource, 'io.ourglass.squares')
            .then(updateRemoteModel);
    }

    function modelUpdate(newData){
        $log.debug("Got a SB model update, starting remote updates.");
        remoteUpdate();
    }

    function init() {

        ogAPI.init( {
            appType:       'tv',
            appName:       "io.ourglass.squaressb",
            modelCallback: modelUpdate
        } );

        ogAPI.loadModel(); //this will automatically call the modelUpdate

    }

    init();
    
    service.getWinnerForScore = function ( score ) {

        if (!score) return;
        var team1LastDigit = score.team1 % 10;
        var team2LastDigit = score.team2 % 10;
        
        var col = service.model.colScoreMap.indexOf( team1LastDigit );
        var row = service.model.rowScoreMap.indexOf( team2LastDigit );
        var winner = service.model.grid[ row ][ col ];
        if ( !winner ) {
            $log.error( "MISS in grid on row: " + row + " col: " + col );
        }
        if ( !winner || !winner.hasOwnProperty( 'email' ) )
            return { name: "", email: "", initials: "??" }

        winner[ "initials" ] = makeInitials( winner.name );
        return winner;

    }

    service.getCurrentWinner = function () {
        return service.getWinnerForScore( service.model.currentScore );
    };
    
    service.getModel = function(){
        if (_initialized)
            return $q.when( service.model );
            
        return ogAPI.loadModel();
    };

    return service;

} );