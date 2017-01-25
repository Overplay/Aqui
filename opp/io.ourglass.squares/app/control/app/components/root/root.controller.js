/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller( "rootController", function ( $scope, $log, $interval, toastr, $rootScope ) {

    $log.debug( "loaded rootController" );
    //toastr.success("Yeah baby!");

    // var makeNewGrid = function () {
    //     var grid = [];
    //
    //     for (var col=0; col<10; col++){
    //         var row = [];
    //         for (var r=0; r<10; r++){
    //             row.push({taken: false, user: undefined});
    //         }
    //         grid.push(row);
    //     }
    //
    //     $log.debug("localStorage set");
    //     localStorage.setItem('squares_grid', JSON.stringify(grid));
    // };
    //
    // var grid = JSON.parse(localStorage.getItem('squares_grid'));
    //
    // if (!grid) {
    //     $log.debug("waiting for admin to start game");
    // } else {
    //     $log.info('grid found');
    // }

});