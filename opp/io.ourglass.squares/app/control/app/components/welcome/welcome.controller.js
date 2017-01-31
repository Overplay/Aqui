/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("welcomeController", function($scope, uibHelper, $log, $state, sqGameService) {

    $log.debug("loading welcome controller");

    $scope.clicked = function () {
        //TODO Erik, this blocks be getting to the adm1n panel....
        
        // sqGameService.isGameInProgress()
        //     .then(function ( running ) {
        //         if (!running) {
        //             $state.go('register');
        //         } else {
        //             $state.go('results');
        //         }
        //     });

        $state.go( 'register' );
    };

});
