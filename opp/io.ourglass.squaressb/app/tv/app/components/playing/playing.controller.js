/**
 * Created by mkahn on 1/25/17.
 */

app.controller( "playingController", function ( $scope, $log, sqGame, $timeout, $rootScope ) {

    $log.debug( "playingController has loaded" );
    
    var looping = false;
    var localModel;

    $scope.sequence = [ { label: "GET READY", initials: "!!", color: 'brown' }];
    $scope.seqIdx = 0;
    $scope.gameState = '';
    
    var ANIMATE = true;
    
    
    var _latestModel;
    
    function hideBox(){
        if (ANIMATE) $rootScope.$broadcast( 'HIDE' );
    }

    function showBox() {
        if ( ANIMATE ) $rootScope.$broadcast( 'SHOW' );
    }
    
    function processModel(data){

        $log.debug("Processing current state");
        $scope.sequence = [];
        $scope.seqIdx = 0;
        $scope.gameState = (data.gameState == 'running') ? "IN PROGRESS" : "FINAL";

        var currentWinner = sqGame.getCurrentWinner();
        var lbl = (data.gameState=='running')? data.currentQuarter + "Q LEADER":"WINNER!";
        $scope.sequence.push( {
            label:    lbl,
            initials: currentWinner.initials,
            name:     currentWinner.name,
            color:    'brown'
        } );

        //TODO: should only build panels based on currentQuarter
        var qscores = _.cloneDeep( data.perQuarterScores );
        //qscores.pop(); // peel off the vestigial [0] entry
        qscores.forEach( function ( qscore, idx ) {
            var qwinner = sqGame.getWinnerForScore( qscore );
            $scope.sequence.push( {
                label:    (idx + 1) + "Q WINNER",
                initials: qwinner.initials,
                name:     qwinner.name,
                color:    'blue'
            } );
        } );

    }
    
    function showNextPanel(){
        $log.info( ">> showing panel "+$scope.seqIdx );
        //showBox();
        $timeout(function(){
            $log.info( ">> hiding panel " + $scope.seqIdx );
            //hideBox();
            $timeout(function(){
                $scope.seqIdx = ($scope.seqIdx + 1) % $scope.sequence.length;
                $log.info( ">>>  Ending loop with seqIdx " + $scope.seqIdx );
                if ( $scope.seqIdx )
                    showNextPanel();
                else
                    startLoop();
            }, 5000);
        }, 5000);
    }
    
    function startLoop(){
        $log.info("Starting loop");
        processModel(localModel);
        showNextPanel();
       
    }
    
    showBox();

    $scope.$on('MODEL_UPDATE', function(evt, data){
        localModel = data;
        if (!looping){
            looping = true;
            startLoop();
        }
    });

});