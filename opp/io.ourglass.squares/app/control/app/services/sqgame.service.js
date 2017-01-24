/**
 * Created by mkahn on 1/19/17.
 */

app.factory("sqGameService", function ( $http, ogAPI, $log, $timeout, $q ) {

    $log.debug("Loaded sqGameService");

    var service = {};

    var devMode = true;
    var simulateBackEnd = true;

    var _currentUser;
    
    function makeInitials(name){
    
        var initials;
        var array = name.split( ' ' );
        if ( array.length == 1 ) {
            initials = array[ 0 ].charAt( 0 ).toUpperCase();
        } else {
            initials = array[ 0 ].charAt( 0 ).toUpperCase() + array[ array.length - 1 ].charAt( 0 ).toUpperCase();
        }
        
        return initials;
    
    }

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

    if (!simulateBackEnd){
        initialize();
    }

    service.resetCurrentUser = function(){
        _currentUser = {
            name:       undefined,
            email:      undefined,
            numPicks:   0
        };
    }

    service.resetCurrentUser();
    
    service.getCurrentUser = function(){ return _currentUser; };
    service.setCurrentUser = function(user){ 
        _currentUser = user;
        _currentUser.initials = makeInitials(_currentUser.name);
    };
    
    service.isGameRunning = function(){
        //TODO pull real game state from shared model
        return false;
    };
    
    // Return the latest grid
    service.getCurrentGrid = function(){
    };
    
    service.submitPicksForCurrentUser = function(){
    
    };

    return service;
    
});

