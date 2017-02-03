/**
 * Created by mkahn on 1/19/17.
 */

app.controller( "resultsController", function ( $scope, uibHelper, $log, $state, $timeout, $interval, sqGameService, model ) {

    $log.debug( "loading resultsController" );

    $scope.model = model;

    $scope.refresh = function () {
        location.reload();
    };
    

    $scope.winnerForScore = function ( scores ) {

        var row = model.rowScoreMap.indexOf( scores.team2 % 10 );
        var col = model.colScoreMap.indexOf( scores.team1 % 10 );
        var winner = $scope.model.grid[ row ][ col ];
        return winner.hasOwnProperty('name') ?  winner : { name: "Empty Square", email:"" };

    }



} );
