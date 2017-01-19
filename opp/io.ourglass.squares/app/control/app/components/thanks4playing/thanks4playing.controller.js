/**
 * Created by mkahn on 1/19/17.
 */

app.controller("thanks4playingController", function($scope, $log, $state, $timeout){

    $log.debug("loading thanks4playingController");

    $timeout(function(){
        $state.go("welcome");
    }, 5000);


});