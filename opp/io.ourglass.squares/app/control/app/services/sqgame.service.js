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
    var _gameState;

    function Square( row, col, inboundJson ) {

        if ( inboundJson && inboundJson.hasOwnProperty( 'email' ) ) {
            this.available = false;
            this.ownedBy = inboundJson;
        } else {
            this.available = true;
            this.ownedBy = {};
        }

        this.row = row;
        this.col = col;

        this.pick = function ( playerInfo ) {

            if ( _simulateBackEnd ) {
                if ( !this.available )
                    return $q.reject( new Error( "Square already owned!" ) );

                this.ownedBy = playerInfo || _currentUser;
                this.available = false;
                return $q.when( 'picked' );

            } else {

                var _this = this;
                return ogAPI.loadModelAndLock()
                    .then( function ( data ) {
                        $log.debug( "Got locked data" );
                        var cellAvailable = !data.grid[ _this.row ][ _this.col ].hasOwnProperty( 'name' );
                        $log.debug( "Cell [" + _this.row + "][" + _this.col + "] is " + cellAvailable ? "available" : "not available" );
                        if ( !cellAvailable ) {
                            initGrid( data.grid );
                            throw new Error( "Cell not available any more!" );
                        }

                        _this.ownedBy = playerInfo || _currentUser;
                        _this.available = false;
                        data.grid[ _this.row ][ _this.col ] = playerInfo || _currentUser;
                        return ogAPI.save();
                    } )
                    .then( function ( resp ) {
                        initGrid( resp.data.grid );
                        return "picked";
                    } );

            }

        }

        this.unpick = function ( playerInfo ) {
            if ( this.ownedBy.email != ( playerInfo.email || _currentUser.email ) )
                return $q.reject( new Error( "You don't own this square" ) );

            if ( _simulateBackEnd ) {
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
                        if ( ownedByEmail != _this.ownedBy.email )
                            throw new Error( "MAJOR ERROR!! Remote model has different owner than current user!" );

                        _this.ownedBy = {};
                        _this.available = true;
                        data.grid[ _this.row ][ _this.col ] = {};
                        return ogAPI.save();
                    } )
                    .then( function ( resp ) {
                        processInboundModel( resp.data );
                        return "unpicked";
                    } );

            }

        }

        this.toggle = function ( playerInfo ) {
            return this.available ? this.pick( playerInfo || _currentUser ) : this.unpick( playerInfo || _currentUser );
        }

        this.ownedByCurrentUser = function () {
            if ( !this.ownedBy.hasOwnProperty( 'email' ) ) return false;
            return _currentUser.email == this.ownedBy.email;
        }

        this.toPostObject = function () {

            if ( this.available ) return {};

            return {
                email: this.ownedBy.email,
                name:  this.ownedBy.name
            }
        }

    }


    function processInboundModel( newModelJson ) {

        _gameState = newModelJson.gameState;
        initGrid( newModelJson.grid );

    }


    function initGrid( jsonGrid ) {

        _grid = [];
        //A little bit of map magic :D

        if ( !jsonGrid ) {
            // dev mode without server data
            for ( var row = 0; row < 10; row++ ) {
                _grid.push( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map( function ( col ) { return new Square( row, col ) } ) )
            }
        } else {
            // real mode
            for ( var row = 0; row < 10; row++ ) {
                _grid.push( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map( function ( col ) {
                    return new Square( row, col, jsonGrid[ row ][ col ] )
                } ) );
            }

            $rootScope.$broadcast( 'NEW_GRID', _grid );
        }
    }

    function loadModelAndProcess() {
        return ogAPI.loadModel()
            .then( processInboundModel );
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
        processInboundModel( newModel );
    }

    function unlockedGridUpdate() {

        return ogAPI.loadModel()
            .then( function ( model ) {
                $log.debug( "Initial model loaded from AB" );
                modelUpdate( model );
                return _grid;
            } );
    }


    function initialize() {

        ogAPI.init( {
            appType: 'mobile',
            appName: "io.ourglass.squares"
        } );
        
    }

    if ( !_simulateBackEnd ) {
        initialize();
    } else {
        initGrid();
    }

    service.resetGameModel = function () {

        _gameInProgress = false;
        _gameOver = false;

        return $http.get( '/www/opp/io.ourglass.squares/info/info.json' )
            .then( function ( data ) {
                // TODO MITCH - is this okay that I added the following two lines?
                _gameInProgress = false;
                _gameOver = false;

                ogAPI.model = data.data.initialValue;
                return ogAPI.save();
            } )
            .then( function ( val ) {
                modelUpdate( ogAPI.model );
            } )

    };


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

    service.getGameState = function () {
        return _gameState;
    };

    // Return the latest grid
    service.getCurrentGrid = function () {
        //TODO placeholder for testing

        if ( _simulateBackEnd )
            return $q.when( _grid );

        return unlockedGridUpdate()
            .catch(function(err){
                $log.debug(err.message);
            });

    };

    service.getRawGrid = function () { return _grid };

    service.isDevelopmentMode = function () { return _devMode; };

    if ( !_devMode )
        service.resetCurrentUser();
    else {
        service.setCurrentUser( {
            name:     "Demo McDemogame",
            email:    "mcdemo@demoface.net",
            numPicks: 4
        } );
    }

    //dataSource tells TV where to get it's data updates from
    service.startGame = function (dataSource) {
        // starts the game and locks future square sales, sets `InProgress` flag to true
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.gameState = "starting";
                data.dataSource = dataSource || "local";
                return ogAPI.save();
            } )
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "game-started";
            } );
    };

    service.finishGame = function () {
        // ends the game (for use when the quarter is over), grid holds all values until newGame() is called, sets
        // `done` to true
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.gameState = "done"; //this should really only be done by the head end
                return ogAPI.save();
            } )
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "game-done";
            } );
    };


    //TODO the comment below doesn't make sense?

    //TODO: Don't understand what these two methods will do
    service.newGame = function () {
        // clears the grid and allows square purchases, sets `done` and `inProgress` flags to true
    };

    service.abortGame = function () {
        // releases the lock from startGame and clears the grid
    };


    service.isGameInProgress = function () {
        // returns true if the game is in progress. false otherwise
        return loadModelAndProcess()
            .then( function () {
                return _gameState=="running";
            } )
    };

    service.isGamePicking = function () {
        // returns true if the game is picking squares, false otherwise
        return loadModelAndProcess()
            .then(function () {
                return _gameState == "picking";
            })
    };

    service.isGameDone = function () {
        // returns true if the game is done, false otherwise
        return loadModelAndProcess()
            .then( function () {
                return _gameState == "done";
            } )
    };

    service.setTeams = function ( teams ) {
        // parameter: {"team1": "team1name", "team2": "team2name"}
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.teamNames = teams;
                return ogAPI.save();
            } )
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "team-named";
            } );
    };

    function fetchModelAndReturnField(fieldname){
        return ogAPI.loadModel()
            .then( function ( data ) {
                return data[ fieldname ];
            } )
    }

    //TODO should these process the model too?
    service.getTeams = function () {
        // returns the same object as above
        return fetchModelAndReturnField('teamNames');
    };

    service.getCurrentScore = function () {
        // returns object with current score
        return fetchModelAndReturnField( 'currentScore' );
    };

    service.setCurrentScore = function ( scores ) {
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.currentScore = scores;
                return ogAPI.save();
            } )
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "score-updated";
            } );
    };

    service.setQuarterScore = function ( quarter, newScores ) {
        // gets a quarter, and new scores to set for that quarter
        // {team1: score, team2: score}
    };

    service.getQuarterScore = function ( quarter ) {
        // returns the score for the specified quarter
        // {team1: score, team2: score}
    };

    service.getFinalScore = function ( quarter ) {
        // returns object with final score from the specified `qtr`
        return fetchModelAndReturnField( 'q'+quarter+'FinalScore' );

    };

    service.getScoreMap = function () {
        // returns an object with arrays of the mapped scores {rowMap: [], colMap: []}
        return ogAPI.loadModel()
            .then( function ( data ) {
                // TODO fix this when the TV model is working
                return {
                    rowScoreMap: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                    colScoreMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                };
                // return { rowScoreMap: data.rowScoreMap, colScoreMap: data.colScoreMap };
            } )
    };
    
    
    service.fillGridSimPlayers = function(){
    
        var names = [ {
            name:  "Alan Amber",
            email: "aa@test.com"
        },
            {
                name:  "Bob Black",
                email: "bb@test.com"
            },
            {
                name:  "Chalre Cooperston",
                email: "cc@test.com"
            },
            {
                name:  "Dick Doobie",
                email: "dd@test.com"
            },
            {
                name:  "Elber Eddy",
                email: "ee@test.com"
            },
            {
                name:  "Frank Fillers",
                email: "ff@test.com"
            },
            {
                name:  "Gerry Gambles",
                email: "gg@test.com"
            },
            {
                name:  "Hank Harley",
                email: "hh@test.com"
            },
            {
                name:  "Ithan Indigo",
                email: "ii@test.com"
            } ];
        
        for ( var row = 0; row < 10; row++ )
            for ( var col = 0; col < 10; col++ ) {
                ogAPI.model.grid[ row ][ col ] =  _.sample( names );
            }
            
        
        ogAPI.save()
            .then(service.getCurrentGrid);
        
    
    }

    return service;

} );

