/**
 * Created by mkahn on 1/19/17.
 */

app.controller("pickSquaresController", function($scope, uibHelper, $log){

    $log.debug("loading pickSquaresController");


    $scope.rows = [ 0, 1,2,3,4,5,6,7,8,9 ];
    $scope.cols = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    
    $scope.grid = [];
    
    for (var col=0; col<10; col++){
        var row = [];
        for (var r=0; r<10; r++){
            row.push(false);
        }
        $scope.grid.push(row);
    }
    
    $scope.clicked = function(row, col){
        $scope.grid[row][col] = !$scope.grid[ row ][ col ];
    }

});