/**
 * Created by mkahn on 1/19/17.
 */

app.controller("pickSquaresController", function($scope, $rootScope, $state, uibHelper, $log, 
    toastr, sqGameService, grid){

    var demoState = true;
    var skipData = true;

    $log.debug("loading pickSquaresController");

    $scope.rows = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    $scope.cols = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    
    $scope.grid = grid;
    $scope.currentUser = sqGameService.getCurrentUser();
    
    $scope.picksPerSession = sqGameService.picksPerSession;

    // Check if there is a current user, if not - go to register page
    if ( !$scope.currentUser || !$scope.currentUser.name ) {
        toastr.warning("No currently registered user!");
        $state.go("register");
    }

    function getTotalUserPicks() {
        var count = 0;
        for (var row = 0; row < 10; row++)
            for (var col = 0; col < 10; col++)
                if (!$scope.grid[row][col].available && $scope.grid[row][col].ownedBy.email == $scope.currentUser.email)
                    count += 1;
        return count;
    }

    function getTotalPicks() {
        var count = 0;
        for ( var row = 0; row < 10; row++ )
            for ( var col = 0; col < 10; col++ )
                if ( !$scope.grid[ row ][ col ].available )
                    count += 1;
        return count;
    }

    $scope.numPicked = getTotalUserPicks();
    $scope.picksAllowed = $scope.currentUser.numPicks + $scope.numPicked;

    // var updateScopeGrid = function () {
    //
    //     sqGameService.getCurrentGrid()
    //         .then( function(grid){
    //             $scope.grid = grid;
    //         });
    // };


    $scope.clicked = function(r, c){

        var gridsSame = $scope.grid === sqGameService.getRawGrid();

        if (($scope.numPicked >= $scope.picksAllowed) && !$scope.grid[r][c].ownedByCurrentUser()) {
            uibHelper.confirmModal("Out of Picks","Sorry " + $scope.currentUser.name + ", you are out of picks. If you want to change one of your picks, tap on it.");
            return;
        }

        $scope.grid[r][c].toggle()
            .then(function (action) {
                if (action=='picked'){
                    toastr.success( "Square Picked!" );
                    $scope.numPicked++;
                } else {
                    toastr.success( "Square Dumped!" );
                    $scope.numPicked--;
                }
            })
            .catch(function (err) {
                // TODO MITCH - also check for network error
                if (err.status == 409){
                    uibHelper.confirmModal("Unable To Pick Square", "Someone else is picking, please try again.");
                }
                
                
                uibHelper.confirmModal("Unable To Pick Square", "This square is already taken or you don't own it.");
                
            })
    };


    $scope.registration = function () {
        $state.go("register");
    };

    $scope.squareClass = function (square) {
        if (square.available)
            return 'free';
        return square.ownedByCurrentUser() ? 'chosen' : 'taken';
    };

    $scope.$on('NEW_GRID', function(ev, newGrid){
        $log.debug('New grid broadcast received');
        $scope.grid = newGrid;
        if (getTotalPicks()==100){
            $log.error("Out of picks!!!");
            $scope.soldOut = true;
            uibHelper.confirmModal( "Sold Out!", "Uh-oh, looks like we're sold out!" );
        }
    });

    $scope.clearModel = function(){
        sqGameService.resetGameModel();
    }
    
    $scope.backToReg = function(){
    
        uibHelper.confirmModal( "Abandon Pick?", "Are you sure you want to go back to the registration page?" )
            .then(function(){
                $state.go("register");
            });

    }

});