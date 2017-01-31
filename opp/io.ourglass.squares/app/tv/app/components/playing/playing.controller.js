/**
 * Created by mkahn on 1/25/17.
 */

app.controller( "playingController", function ( $scope, $log, $interval, sqGame ) {

    $log.debug( "playingController has loaded" );
    
    
    
    $scope.$on('MODEL_UPDATE', function(ev, data){
        $log.debug("Attract controller received a model bcast");
    });

});