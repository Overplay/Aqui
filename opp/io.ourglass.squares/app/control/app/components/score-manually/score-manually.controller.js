/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("scoreManuallyController", function($scope, uibHelper, $log, $state,
                                                   $timeout, $interval, toastr, sqGameService, model, ogAPI ) {

    $log.debug("loading scoreManuallyController");

    $scope.model = model;
    
    
    $scope.addQuarter = function(){
        $scope.model.perQuarterScores.push({ team1: 0, team2: 0 });
    }
    
    
    $scope.refreshCurrentPage = function () {
        // this is needed for the admin to refresh the page to get new data
        location.reload();
    };

    $scope.finishGame = function(){
        $scope.model.gameState = 'done';
        $scope.model.finalScore = $scope.model.currentScore;
    }


    $scope.update = function(){
        $log.debug("updating");
        ogAPI.model = $scope.model;
        ogAPI.save();
    };



});

