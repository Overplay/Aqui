/**
 * Created by madelineer on 8/1/16.
 */

app.controller("timeController", function($scope, $timeout, $log) {

$log.debug('Loading timeController.');

$scope.time = {hourMSD: 1, hourLSD: 2, minuteMSD: 4, minuteLSD: 8, secondMSD: 5, secondLSD: 3};

});