/**
 * Created by mkahn on 1/25/17.
 */

app.factory( 'sqGame', function ( $log, $rootScope, ogAPI, $state ) {

    $log.debug( "sqGame service loaded" );

    var gameMode = 'attract';

    var service = {};
    
    service.squaresSold = 0;
    
    function totalSquaresSold(){
    
        var squares = ogAPI.model.grid;
        service.squaresSold = 0;
        for (var r=0; r<10; r++)
            for (var c=0; c<10; c++){
                if (squares[r][c].hasOwnProperty('email'))
                    service.squaresSold++;
            }
            
    }

    function modelUpdate(newModel){
        $log.debug("Got a model update!");

        gameMode = newModel.inProgress ? ( newModel.done ? 'done':'playing' ) : 'attract';
        $log.debug("Game mode is: "+gameMode);
        
        totalSquaresSold();

        $rootScope.$broadcast('MODEL_UPDATE', newModel);
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
    
    return service;

} );