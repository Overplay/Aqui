/**
 * Created by mkahn on 1/19/17.
 */

app.factory( "sqGameService", function ( $http, ogAPI, $log, $timeout, $q, $rootScope ) {

    $log.debug( "Loaded sqGameService" );

    var service = {};

    var _devMode = false;
    var _simulateBackEnd = false;

    var _currentUser;
    var _grid;
    var _gameState;
    
    service.picksPerSession = 1; //hard wired for alpha test

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
        return ogAPI.model;

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
            numPicks: 1, //Hard wired for Brit
            initials: undefined
        };
    };

    service.getCurrentUser = function () { return _currentUser; };
    service.setCurrentUser = function ( user ) {
        _currentUser = user;
        _currentUser.initials = makeInitials( _currentUser.name );
    };

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
            return { name: "", email: "", initials: "??" };

        winner[ "initials" ] = makeInitials( winner.name );
        return winner;

    };

    service.getCurrentWinner = function () {
        return service.getWinnerForScore( ogAPI.model.currentScore );
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

        return unlockedGridUpdate();
            // .catch(function(err){
            //     $log.debug(err.message);
            // });

    };

    service.getRawGrid = function () { return _grid };

    service.loadFakeUser = function(){
        service.setCurrentUser( {
            name:     "Demo McDemogame",
            email:    "mcdemo@demoface.net",
            numPicks: 1
        } );
    }

    service.isDevelopmentMode = function () { return _devMode; };

    if ( !_devMode )
        service.resetCurrentUser();
    else {
        service.loadFakeUser();
    }

    //dataSource tells TV where to get it's data updates from
    service.startGame = function (dataSource) {
        // starts the game and locks future square sales, sets `InProgress` flag to true
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.dataSource = dataSource || "local";
                //Starting state only needed when periodically fetching scores
                data.gameState = (dataSource=='sim')?"starting":"running";
                data.currentQuarter = 1;
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
    
    service.getLatestModel = function(){
        return loadModelAndProcess()
            .then(function(m){
                return _.cloneDeep(m);
            });
    }

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
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.perQuarterScores[quarter] = newScores;
                return ogAPI.save();
            })
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "score-updated";
            })
    };

    service.getQuarterScore = function ( quarter ) {
        return fetchModelAndReturnField( 'perQuarterScores' )
            .then(function ( quarterScores ) {
                return quarterScores[quarter];
            });
    };

    service.setFinalScore = function ( newScores ) {
        return ogAPI.loadModelAndLock()
            .then( function ( data ) {
                data.finalScore = newScores;
                return ogAPI.save();
            })
            .then( function ( resp ) {
                processInboundModel( resp.data );
                return "score-updated";
            })
    };

    service.getFinalScore = function () {
        return fetchModelAndReturnField( 'finalScore' );
    };

    service.getScoreMap = function () {
        // returns an object with arrays of the mapped scores {rowMap: [], colMap: []}
        return ogAPI.loadModel()
            .then( function ( data ) {
                return { rowScoreMap: data.rowScoreMap, colScoreMap: data.colScoreMap };
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
        
        return ogAPI.save();
        
    };

    service.sendEmailToAllUsers = function () {
        var grid = _grid; // save a copy of the grid just in case
        var teams = ogAPI.model.teamNames; // team 1 is col, team 2 is rows
        var colScoreMap = ogAPI.model.colScoreMap; // team 1 scores
        var rowScoreMap = ogAPI.model.rowScoreMap; // team 2 scores

        sendEmailToAllUser_aux(grid, 0, 0, teams, colScoreMap, rowScoreMap);
    };

    function sendEmailToAllUser_aux(grid, row, col, teams, colScoreMap, rowScoreMap) {
        if (row >= grid.length || col >= grid[row].length) {
            return;
        }

        var user = grid[row][col].ownedBy;

        if ( user ) {
            var emailString = "Hey " + user.name + ", thanks for playing Squares by Ourglass. " +
                "Your square is " + teams.team1 + " " + colScoreMap[col] + ", " + teams.team2 + " " + rowScoreMap[row] + ".";

            $timeout(function () {

                // TODO MITCH uncomment this line to send to the user's emails and comment out my email
                ogAPI.sendSpam({to: user.email, emailbody: emailString})
                $log.debug("Sent to: "+user.email);
                // ogAPI.sendSpam({to: "erik@ourglass.tv", emailbody: emailString})
                //     .then(function () {
                //         $log.debug("email send success");
                //     })
                //     .catch(function () {
                //         $log.debug("email send FAIL");
                //     });

                // $log.debug("email sent " + row + " " + col);

            }, 1000)
                .then(function () {

                    if (col + 1 == grid[row].length) { // if at the last col, increment the row
                        sendEmailToAllUser_aux(grid, row + 1, 0, teams, colScoreMap, rowScoreMap);
                    } else {
                        sendEmailToAllUser_aux(grid, row, col + 1, teams, colScoreMap, rowScoreMap);
                    }

                })
        }
    }

    service.sendEmailToAdmin = function () {
        var grid = _grid; // save a copy of the grid just in case
        var teams = ogAPI.model.teamNames; // team 1 is col, team 2 is rows
        var colScoreMap = ogAPI.model.colScoreMap; // team 1 scores
        var rowScoreMap = ogAPI.model.rowScoreMap; // team 2 scores
        var emailString = "";

        for (var r = 0; r < grid.length; r++) {
            for (var c = 0; c < grid[r].length; c++) {
                var user = grid[r][c].ownedBy;
                if ( user ) {
                    emailString += "grid[" + r + "][" + c + "] - " +
                        teams.team1 + " " + colScoreMap[c] + ", " + teams.team2 + " " + rowScoreMap[r] +
                        " - owned by: " + user.name + " ( " + user.email + " )\n";
                } else {
                    emailString += "grid[" + r + "][" + c + "] - " +
                        teams.team1 + " " + colScoreMap[c] + ", " + teams.team2 + " " + rowScoreMap[r] +
                        " - free square\n";
                }
            }
        }

        ogAPI.sendSpam({to: "mitch@ourglass.tv", emailbody: emailString})
            .then(function () {
                $log.debug("email send success");
            })
            .catch(function () {
                $log.debug("email send FAIL");
            });

        ogAPI.sendSpam({to: "erik@ourglass.tv", emailbody: emailString})
            .then(function () {
                $log.debug("email send success");
            })
            .catch(function () {
                $log.debug("email send FAIL");
            });

        $log.debug("email sent to admin.");
    };

    return service;

} );

