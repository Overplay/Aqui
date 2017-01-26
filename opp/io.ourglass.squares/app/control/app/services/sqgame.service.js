/**
 * Created by mkahn on 1/19/17.
 */

app.factory( "sqGameService", function ( $http, ogAPI, $log, $timeout, $q, $rootScope ) {

    $log.debug( "Loaded sqGameService" );

    var service = {};

    var _devMode = true;
    var _simulateBackEnd = false;

    var _currentUser;
    var _grid;

    function Square( row, col, inboundJson ) {

        if (inboundJson && inboundJson.hasOwnProperty('email')){
            this.available = false;
            this.ownedBy = inboundJson;
        } else {
            this.available = true;
            this.ownedBy = {};
        }
        
        this.row = row;
        this.col = col;
        
        this.pick = function(playerInfo){

            if (_simulateBackEnd){
                if ( !this.available )
                    return $q.reject( new Error( "Square already owned!" ) );

                this.ownedBy = playerInfo || _currentUser;
                this.available = false;
                return $q.when( 'picked' );

            } else {

                var _this = this;
                return ogAPI.loadModelAndLock()
                    .then( function(data){
                        $log.debug("Got locked data");
                        var cellAvailable = !data.grid[ _this.row ][ _this.col ].hasOwnProperty( 'name' );
                        $log.debug("Cell ["+ _this.row+"]["+ _this.col+"] is " + cellAvailable?"available":"not available");
                        if (!cellAvailable){
                            initGrid( data.grid );
                            throw new Error( "Cell not available any more!" );
                        }

                        _this.ownedBy = playerInfo || _currentUser;
                        _this.available = false;
                        data.grid[ _this.row ][ _this.col ] = playerInfo || _currentUser;
                        return ogAPI.save();
                    })
                    .then( function(resp){
                        initGrid( resp.data.grid );
                        return "picked";
                    });

            }

        }

        this.unpick = function(playerInfo){
            if (this.ownedBy.email!=( playerInfo.email||_currentUser.email ) )
                return $q.reject(new Error("You don't own this square"));
            
            if (_simulateBackEnd){
                this.ownedBy = {};
                this.available = true;
                return $q.when( 'unpicked' );
            } else {

                var _this = this;
                return ogAPI.loadModelAndLock()
                    .then( function ( data ) {
                        $log.debug( "Got locked data for unpick" );
                        var ownedByEmail = data.grid[ _this.row ][ _this.col ].email;
                        // The below should never happen!
                        if (ownedByEmail!=_this.ownedBy.email)
                            throw new Error("MAJOR ERROR!! Remote model has different owner than current user!");

                        _this.ownedBy = {};
                        _this.available = true;
                        data.grid[ _this.row ][ _this.col ] = {};
                        return ogAPI.save();
                    } )
                    .then( function ( resp ) {
                        initGrid( resp.data.grid );
                        return "unpicked";
                    } );

            }

        }
        
        this.toggle = function(playerInfo){
            return this.available ? this.pick(playerInfo || _currentUser ) : this.unpick(playerInfo || _currentUser );
        }

        this.ownedByCurrentUser = function () {
            if (!this.ownedBy.hasOwnProperty('email')) return false;
            return _currentUser.email == this.ownedBy.email;
        }
        
        this.toPostObject = function(){
        
            if (this.available) return {};
            
            return { 
                email: this.ownedBy.email,
                name: this.ownedBy.name
            }
        }

    }

 

    function initGrid(jsonGrid) {

        _grid = [];
        //A little bit of map magic :D
        
        if (!jsonGrid){
            // dev mode without server data
            for ( var row = 0; row < 10; row++ ) {
                _grid.push( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map( function (col) { return new Square(row,col) } ) )
            }
        } else {
            // real mode
            for ( var row = 0; row < 10; row++ ) {
                _grid.push( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map( function (col) { 
                    return new Square(row, col, jsonGrid[row][col]) } ) );
            }
            
            $rootScope.$broadcast('NEW_GRID', _grid);
        }
    }
    
    function postUpdatedGrid(){
    
        var postGrid = _grid.map( function(row){
            return row.map( function ( sq ) { return sq.toPostObject(); } );;
        });
        
        return postGrid;
    
    }

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
        initGrid(newModel.grid);
    }
    
    function unlockedGridUpdate(){
        
        return ogAPI.loadModel()
            .then( function ( model ) {
                $log.debug( "Initial model loaded from AB" );
                modelUpdate( model );
                return _grid;
            } );
    }
    

    function initialize() {

        ogAPI.init( {
            appType:      'mobile',
            appName:      "io.ourglass.squares"
        } );

        // unlockedGridUpdate()
        //     .catch( function ( err ) {
        //         $log.error( "FAIL Initial model load from AB" );
        //     } );

    }

    if ( !_simulateBackEnd ) {
        initialize();
    } else {
        initGrid();
    }
    
    service.resetGameModel = function(){
    
        return $http.get('/www/opp/io.ourglass.squares/info/info.json')
            .then(function(data){
                ogAPI.model = data.data.initialValue;
                return ogAPI.save();
            })
            .then(function(val){
                modelUpdate(ogAPI.model);
            })
    
    }


    service.resetCurrentUser = function () {
        _currentUser = {
            name:     undefined,
            email:    undefined,
            numPicks: 0,
            initials: undefined
        };
    }

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
        
        if (_simulateBackEnd)
            return $q.when(_grid);    
        
        return unlockedGridUpdate();
        
    };
    
    service.getRawGrid = function() { return _grid };

    service.isDevelopmentMode = function(){ return _devMode; };

    if ( !_devMode )
        service.resetCurrentUser();
    else {
        service.setCurrentUser( {
            name:     "Demo McDemogame",
            email:    "mcdemo@demoface.net",
            numPicks: 4
        } );
    }

    service.startGame =function() {
        // starts the game and locks future square sales, sets `InProgress` flag to true
    };

    service.newGame =function() {
        // clears the grid and allows square purchases, sets `done` and `inProgress` flags to true
    };

    service.finishGame =function() {
        // ends the game (for use when the quarter is over), grid holds all values until newGame() is called, sets `done` to true
    };

    service.abortGame =function() {
        // releases the lock from startGame and clears the grid
    };

    service.gameInProgress =function() {
        // returns true if the game is in progress. false otherwise
    };

    service.gameDone =function() {
        // returns true if the game is done, false otherwise
    };

    service.setTeams =function( teams ) {
        // parameter: {"team1": "team1name", "team2": "team2name"}
    };

    service.getTeams =function() {
        // returns the same object as above
    };

    service.getCurrentScore =function() {
        // returns object with current score
    };

    service.getFinalScore =function( quarter ) {
        // returns object with final score from the specified `qtr`
    };

    service.getScoreMap =function() {
        // returns an object with arrays of the mapped scores {rowMap: [], colMap: []}
    };

    return service;

} );

