/**
 * Created by Erik Phillips on 1/18/17.
 */

app.controller( "rootController", function ( $scope, $log, toastr ) {

    $log.debug( "loaded rootController" );
    toastr.success("Yeah baby!");

});