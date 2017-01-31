/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller( "mainScreenController", function ( $scope, $log, $interval, fbGameSim, $timeout, $rootScope, $state ) {

    $log.debug( "mainScreenController has loaded" );

    //fbGameSim.startGame();

    $scope.slideIn = false;

    function slideOut() {
        $rootScope.$broadcast( 'BLANKING' );
        $scope.slideIn = false;
    }

    function slideIn() {
        $scope.slideIn = true;
    }

    $scope.$on( "SHOW", function () {
        slideIn();
    } );

    $scope.$on( "HIDE", function () {
        slideOut();
    } );
    
    $scope.$on( "PEEKINOUT", function(){
        slideIn();
        $timeout( slideOut, 5000 );
    });
    
    $scope.$on('MODEL_UPDATE', function(evt, data){
        switch(data.gameState){
            
            case 'picking':
                $state.go("attract");
                break;
                
            case "running":
                $state.go("playing");
                break;
        
        }
        
    });

} );

