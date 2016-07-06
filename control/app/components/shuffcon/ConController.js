/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "conController",
    function ( $scope, $timeout, $http, $log ) {

        $log.info( "Loading conController" );

        $scope.apps = [];

       $http.get("http://localhost:9090/api/system/apps")
           .then( function(data){
                   $scope.apps = data.data;
               }
           )

    /* AB REST API calls
        
        POST /api/app/io.ourglass.APPNAME/launch to launch
        POST /api/app/io.ourglass.APPNAME/kill to kill
        POST /api/app/io.ourglass.APPNAME/move to move

     */


    } );
