/**
 * Created by mkahn on 1/25/17.
 */

app.controller( "attractController", function ( $scope, $log, $interval, sqGame, $rootScope ) {

    $log.debug( "attractController has loaded" );
    
    $scope.stillSelling = true;
    
    $scope.totalSquaresSold = 0;
    
    function refreshPickedTotal(){
        $scope.totalSquaresSold = sqGame.squaresSold;
        if ($scope.totalSquaresSold==30)
            $scope.stillSelling = false;
    }
    
    refreshPickedTotal();
    
    $scope.$on('MODEL_UPDATE', function(ev, data){
        $log.debug("Attract controller received a model bcast");
        refreshPickedTotal();
    });
    
    var intvl = $interval(function(){
        $log.debug( 'attractController PEEKing' );
        $rootScope.$broadcast("PEEKINOUT");
    }, 12000);

    $scope.$on('$destroy', function(){
        $log.warn('attractController canceling $interval');
        $interval.cancel(intvl);
    });

});