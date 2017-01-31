/**
 * Created by mkahn on 1/25/17.
 */

app.controller( "playingController", function ( $scope, $log, sqGame, $timeout, $rootScope ) {

    $log.debug( "playingController has loaded" );

    $scope.sequence = [ { label: "GET READY", initials: "!!", color: 'brown' }];
    $scope.seqIdx = 0;
    $scope.gameState = '';
    
    var _latestModel;
    
    function processModel(data){

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

        var qscores = _.cloneDeep( data.perQuarterScores );
        qscores.pop(); // peel off the vestigial [0] entry
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
        $rootScope.$broadcast('SHOW');
        $timeout(function(){
            $log.info( ">> hiding panel " + $scope.seqIdx );
            $rootScope.$broadcast( 'HIDE' );
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
        $rootScope.$broadcast( 'HIDE' );
        $timeout( function () {
            //wait 500ms, then rebuild the sequence
            $log.info( "> processing model" );
            processModel( sqGame.getModel() );
            showNextPanel();
        }, 500 );
    }
    
    startLoop();
    
    
    // $scope.$on('MODEL_UPDATE', function(ev, data){
    //     $log.debug("playingController received a model bcast");
    //     _latestModel = data;
    // });
    //
    // $scope.$on('BLANKING', function(){
    //     $log.debug("Received a blanking interval");
    //     $timeout( function(){
    //         $scope.seqIdx = ($scope.seqIdx + 1) % $scope.sequence.length;
    //     }, 500);
    // });
    //
    

});