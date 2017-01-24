/**
 * Created by mkahn on 1/19/17.
 */

app.factory( "sqGameService", function ( $http, ogAPI, $log, $timeout, $q ) {

    $log.debug( "Loaded sqGameService" );

    var service = {};

    var devMode = true;
    var simulateBackEnd = true;

    var _currentUser;
    var _grid;


    function Square() {

        this.available = true;
        this.ownedBy = {};
        
        this.pick = function(playerInfo){
            if (!this.available)
                return $q.reject(new Error("Square already owned!"));

            this.ownedBy = playerInfo;
            this.available = false;
            
            return $q.when(true);
        }

        this.unpick = function(playerInfo){
            if (this.ownedBy.email!=playerInfo.email)
                return $q.reject(new Error("You don't own this square"));

            this.ownedBy = {};
            this.available = false;

            return $q.when(true);

        }
        
        this.toggle = function(playerInfo){
            return this.available ? this.pick(playerInfo) : this.unpick(playerInfo);
        }

        this.ownedByCurrentUser = function () {
            if (!this.ownedBy.hasOwnProperty('email')) return false;
            return _currentUser.email == this.ownedBy.email;
        }

    }

 

    function initGrid() {

        _grid = [];
        //A little bit of map magic :D
        for ( var rows = 0; rows < 10; rows++ ){
            _grid.push([0,1,2,3,4,5,6,7,8,9].map(function(){ return new Square() }))
        }

    }


    service.isSquareAvailable = function ( x, y ) {
        return !_grid[ x ][ y ].hasOwnProperty( 'name' );
    };

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

    function modelUpdate( newModel ) {
        $log.debug( "Got an model update in gameService" );
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

    if ( !simulateBackEnd ) {
        initialize();
    } else {
        initGrid();
    }


    service.resetCurrentUser = function () {
        _currentUser = {
            name:     undefined,
            email:    undefined,
            numPicks: 0
        };
    }

    service.resetCurrentUser();

    service.getCurrentUser = function () { return _currentUser; };
    service.setCurrentUser = function ( user ) {
        _currentUser = user;
        _currentUser.initials = makeInitials( _currentUser.name );
    };

    service.isGameRunning = function () {
        //TODO pull real game state from shared model
        return false;
    };

    // Return the latest grid
    service.getCurrentGrid = function () {
        //TODO placeholder for testing
        return $q.when(_grid);    
    };

    service.pickSquare = function ( x, y, user ) {

    }

    service.submitPicksForCurrentUser = function () {

    };


    return service;

} );

