/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller("mainScreenController", function($scope, $log ){

    $log.debug( "mainScreenController has loaded");

    $scope.game = {type: 'football', homeTeam: 'Broncos', awayTeam: 'SF 49ers'};
    $scope.score = {home: 35, away: 7};

    $scope.currentWinner = "Erik Phillips";

});

