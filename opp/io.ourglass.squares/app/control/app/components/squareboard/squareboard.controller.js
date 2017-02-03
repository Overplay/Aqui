/**
 * Created by erikphillips on 2/1/17.
 */

app.controller("squareboardController", function($scope, uibHelper, $log, $state,
               $timeout, $interval, toastr, sqGameService, model) {

    $log.debug("squareboardController loaded");

    $scope.model = model;
    
    $scope.emptyArray = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 11 elements for the ng-repeat

    $scope.displayInfo = function(row, col) {
        if (row < 0 || row > 10 || col < 0 || col > 10) return;

        if ($scope.grid[row][col].available) {
            uibHelper.confirmModal("Unpurchased Square", "This square has not been taken.");
            return;
        }

        uibHelper.confirmModal("This Square is Taken",
            "Owner Name: " + $scope.grid[row][col].ownedBy.name + "\n" +
            "Owner Email: " + $scope.grid[row][col].ownedBy.email);

        // TODO make the confirm box above have a line break
    };
    
    //TODO: EP, is this the right way to reload for angular?
    $scope.refresh = function () {
        location.reload();
    };

    $scope.resultsPage = function () {
        $state.go("results");
    };

    $scope.getClassType = function (row, col) {
        if (row == 0 && col == 0) return 'empty';
        if (row == 0 || col == 0) return 'header';
        return 'taken';
    };

    function updateTeamNames() {
        sqGameService.getTeams()
            .then( function( t ) {
                $scope.teamNames = t;
            })
            .catch(function () {
                $log.error("Unexpected rejection getting teams - using defaults");
                $scope.teamNames = {team1: "team1", team2: "team2"};
            })
    }

    function updateScoreMapping() {
        sqGameService.getScoreMap()
            .then( function ( map ) {
                $scope.scoreMap = map;
            })
            .catch( function ( err ) {
                $log.error( "Unexpected rejection getting score map" );
            });
    }

    function updateScopeGrid() {
        $log.debug("update to grid");
        $scope.grid = sqGameService.getRawGrid();
    }
    
    $scope.squareDeets = function(entry){
        
        uibHelper.confirmModal("Square Details", "Square owned by "+entry.name+" ( "+entry.email+" )");
    
    }

});
