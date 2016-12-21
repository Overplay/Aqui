/**
 * Created by mkahn on 4/28/15.
 */

// app.controller( "oktoberfestController",
//     function ($scope, $timeout, $http, $interval, ogTVModel, $log, $window ) {
//
//         console.log( "Loading shuffleController" );
//
//         $scope.position = { corner: 0 };
//         $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };
//
//         var _remoteScore = {};
//
//         function logLead() { return "ShuffleController: "; }
//
//         $scope.$on( 'CPANEL', function () {
//
//             $scope.position.corner++;
//             if ( $scope.position.corner > 3 ) $scope.position.corner = 0;
//
//         } );
//
//         function updateLocalScore() {
//
//             var animRed = $scope.score.red != _remoteScore.red;
//             var animBlue = $scope.score.blue != _remoteScore.blue;
//
//             $scope.score.red = _remoteScore.red;
//             $scope.score.blue = _remoteScore.blue;
//
//
//             if ( animRed ) {
//                 $scope.score.redHighlight = true;
//                 $timeout( function () { $scope.score.redHighlight = false}, 500 );
//             }
//
//             if ( animBlue ) {
//                 $scope.score.blueHighlight = true;
//                 $timeout( function () { $scope.score.blueHighlight = false}, 500 );
//             }
//         }
//
//         function modelUpdate( data ) {
//             //$scope.$apply(function () {
//             $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
//             _remoteScore = data;
//
//             $scope.$apply( function(){
//                 updateLocalScore();
//
//             });
//
//             //});
//
//             $log.debug( logLead() + "Model update callback..." )
//
//         }
//
//         function inboundMessage( msg ) {
//             $log.debug( logLead() + "Inbound message..." );
//         }
//
//         function updateFromRemote() {
//
//             ogTVModel.init( {
//                 appName:         "io.ourglass.shuffleboard",
//                 dataCallback:    modelUpdate
//             } );
//
//         }
//
//         // Honk Hionk beep!
//
//         updateFromRemote();
//
//     } );

app.factory('ge', function($http, ogTVModel, $log, $timeout){

    $log.debug("Game Engine Loaded");

    var startingBalls = 20;
    var startingTime = 30;

    var isInitialized = false;
    
    var ballcount, gameTime, gameState, score = 0;
    
    var updateCallback;

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Events = Matter.Events;

    // create an engine
    var engine = Engine.create();
    var render;
    var ballArray = [];

    // Game elements

    var stein, steinLeft, steinRight, steinBottom;

    var service = {}


    service.initEngine = function(elem, callback){

        updateCallback = callback;

        render = Render.create( {
            element: elem,
            engine:  engine,
            options: {
                width:               300,
                height:              400,
                pixelRatio:          1,
                background:          'rgba(0,0,0,0)',
                wireframeBackground: '#222',
                hasBounds:           true,
                enabled:             true,
                wireframes:          false,
                showSleeping:        false,
                showDebug:           false,
                showBroadphase:      false,
                showBounds:          false,
                showVelocity:        false,
                showCollisions:      false,
                showSeparations:     false,
                showAxes:            false,
                showPositions:       false,
                showAngleIndicator:  false,
                showIds:             false,
                showShadows:         false,
                showVertexNumbers:   false,
                showConvexHulls:     false,
                showInternalEdges:   false,
                showMousePosition:   false
            }
        } );


        var mouseConstraint = Matter.MouseConstraint.create( engine, {
            element: render.canvas
        } );

        Events.on( mouseConstraint, "mousedown", function () {
                console.log("Click");
                mouseClicked()
            } )

        engine.world.gravity.y = 1.0;
        buildWorld();
        goToState('ready');

    }

    function mouseClicked(){
        $log.debug("Mouse clicked");
        
        switch (gameState){
            case 'ready':
                goToState('running');
                break;
                
            case 'running':
                dropBall();
                break;
                
            case 'finished':
                goToState('ready');
                break;
        }
    }

    function goToState(newState){

        switch(newState){

            case 'ready':
                gameState = 'ready';
                resetGame();
                break;
                
            case 'running':
                gameState = 'running';
                gameTimer();
                break;
                
            case 'finished':
                gameState = 'finished';
                gameTime = 0;
                break;

        }

        issueUpdate();

    }
    


    function resetGame(){

        // Resetting game
        ballcount = startingBalls;
        gameTime = startingTime;
        score = 0;

        ballArray.forEach( function ( ball ) {

            Matter.Composite.remove( engine.world, ball );

        });

        ballArray = [];
        
    }
    
    function ogDataCallback(newDataModel){
        $log.debug("New data: "+newDataModel);
        
        var msg = newDataModel.message;
        
        switch (msg){
        
            case 'start':
                goToState('running');
                break;
                
            case  'reset':
                goToState('ready');
                break;
                
            case 'drop':
                if ( gameState == 'running' )
                    dropBall();
        
        }
        
    }

    function buildWorld(){

        var ground = Bodies.rectangle( -100, 390, 900, 30, {
                isStatic: true,
                restitution: 0.95,
                render: {
                    sprite: {
                        texture: 'assets/img/table.png'
                    }
                } } );


        var steinTranslation = { x: 100, y: 330 };

        steinLeft = Bodies.rectangle(0, 0, 5, 100, { isStatic: true, restitution: 0.95,
            render: {
                sprite: {
                    texture: 'assets/img/beermug2.png'
                }
            },
            label: 'steinLeft'
            } );

        steinRight = Bodies.rectangle( 50, 0, 5, 100, { render: { visible: false },
            isStatic: true, restitution: 0.95
        } );

        steinBottom = Bodies.rectangle( 25, 50, 50, 20, {
            render: { visible: false }, isStatic: true, restitution: 0.95
        } );

        stein = {
            composite: Matter.Composite.create(),
            xtrans: 0,
            transAmt: 2.5,  //roughly speed
            direction: 1,
            update: function(){

                this.xtrans += this.transAmt*this.direction;

                if ( this.xtrans >= 100 ){
                    this.direction = -1;
                } else if ( this.xtrans <= -90 ){
                    this.direction = 1;
                }

                Matter.Composite.translate( this.composite, { x: this.transAmt * this.direction, y: 0 });
            }
        }

        Matter.Composite.add(stein.composite, [steinLeft, steinRight, steinBottom]);
        Matter.Composite.translate( stein.composite, steinTranslation);

        // add all of the bodies to the world
        World.add( engine.world, [ ground, stein.composite ] );

        Render.run( render );
        Engine.run( engine );

        Events.on( engine, 'afterUpdate', gameUpdate );

    }
    
    function gameTimer(){
        $timeout( function(){
        
            gameTime--;
            
            if ( gameTime > 0 ){
                issueUpdate();
                gameTimer();
            } else {
                gameTime = 0;
                goToState('finished');
            }
            
            
        }, 1000);
    }
    
    function endGame() { goToState('finished') }

    function dropBall(){


        if ( ballArray.length < ballcount ){
            
            var ball = Bodies.circle( 65, 5, 10, {
                restitution: 0.8, density: 1, isStatic: false, friction: 1.0,
                render:      {
                    sprite: {
                        texture: 'assets/img/pingpong32.png'
                    }
                },
                label:       "Ball#" + ballArray.length
            } );
            Matter.Body.setPosition( ball, { x: 150, y: 0 } );
            World.add( engine.world, ball )
            ballArray.push( ball );
            issueUpdate();
            if (ballArray.length == ballcount) {
                $timeout(endGame, 1000);
            }
        } else {
            endGame()
        }

    }

    function calcScore(){
    
        if (!ballArray || ballArray.length==0 ){
            return;
        }

        var leftX = steinLeft.position.x;
        var rightX = steinRight.position.x;
        var top = steinLeft.position.y - 50;
        var bot = steinBottom.position.y;

        var newScore = 0;

        
        ballArray.forEach( function(b){

            if ( ( b.position.x > leftX ) && ( b.position.x < rightX ) &&
                ( b.position.y > top ) && ( b.position.y < bot ) )
                {
                    newScore +=  5;
                }
        });
        
        if ( newScore != score ){
            score = newScore;
            issueUpdate();
        }

    }

    function issueUpdate(){

        if ( updateCallback ) {
            updateCallback( {
                gameState:      gameState,
                gameTime:       gameTime,
                ballsRemaining: ballcount - ballArray.length,
                score:          score
            } );
        }
    }

    function gameUpdate(){

        stein.update();
        calcScore();
        
    }

    service.yip = function(){
        $log.debug("Yip!");
    }
    
    service.setUpdateCallback = function(cb){
        updateCallback = cb;
    }


    ogTVModel.init( { appName: 'io.ourglass.oktoberfest', dataCallback: ogDataCallback } );
    //resetGame();
    
    return service


})

app.directive('gameWorld', function (ge, $log, $timeout) {
    return {
        restrict:    'E',
        scope:       {},
        templateUrl: 'app/world.template.html',
        link:        function ( scope, elem, attrs ) {

            var lastState = '';
            
            scope.hideMessage = false;
            
            function hideMsg(){
                scope.hideMessage = true;
            }

            function showMsg() {
                scope.hideMessage = false;
            }

            function onUpdate( gameData ) {
                $log.debug( "Got game update: " + gameData.gameState );
                scope.ballsRemaining = gameData.ballsRemaining;
                scope.timeRemaining = gameData.gameTime;
                scope.score = gameData.score;

                if ( !gameData.gameTime ) {
                    scope.timeRemaining = '--';
                }

                if ( lastState != gameData.gameState ) {

                    switch ( gameData.gameState ) {

                        case 'ready':
                            showMsg()
                            scope.message = "Ready?";
                            break;

                        case 'running':
                            scope.message = "Go!";
                            $timeout( hideMsg, 500 );
                            break;

                        case 'finished':
                            showMsg()
                            scope.message = "Game Over"
                            break;


                    }


                }


                scope.$apply();

            }

            ge.initEngine( document.querySelector( '#game' ), onUpdate );


        }
    }
})