/**
 * Created by mkahn on 1/19/17.
 */

app.factory("sqGameService", function ( $http, ogAPI, $log, $timeout ) {

    function modelUpdate(newModel){
        $log.debug("Got an model update in gameService");
    }

    function initialize() {

        ogAPI.init( {
            appType:      'mobile',
            appName:      "io.ourglass.squares",
            dataCallback: modelUpdate
        } );

        ogAPI.loadModel()
            .then( modelUpdate );

    }
    
});