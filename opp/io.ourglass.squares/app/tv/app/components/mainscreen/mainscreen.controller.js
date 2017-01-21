/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller("mainScreenController", function($scope, $log, $interval ){

    $log.debug( "mainScreenController has loaded");

    $scope.game = {
        type: 'football',
        status: true, // true for game in session, false if over
        home: {team: 'Broncos', score: 0},
        away: {team: 'SF 49ers', score: 0}
    };

    $scope.currentWinner = "";

    $interval(function () {

        var score = getScore();
        $scope.game.home.score = score.home;
        $scope.game.away.score = score.away;

        $scope.currentWinner = getCurrentWinner();

    }, 5000); // runs every 5sec

    var fakeScore = {home: 0, away: 0};

    var getScore = function () {
        // make the API call here
        fakeScore.home += 2;
        fakeScore.away += 1;
        return fakeScore;
    };

    var getCurrentWinner = function () {
        return "Erik Phillips"
    };

});

