/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("welcomeController", function($scope, uibHelper, $log, $state, sqGameService) {

    $log.debug("loading welcome controller");

    $scope.clicked = function () {
        sqGameService.isGamePicking()
            .then(function ( picking) {
                if ( picking )
                    $state.go( 'register' );
                else
                    $state.go( 'results' );
            });
    };

    $scope.logoClicked = function () {
        sqGameService.isGamePicking()
            .then(function ( picking ) {
                if ( !picking )
                    $state.go( 'register' )
            });
    }

});
