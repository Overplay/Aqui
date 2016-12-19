/**
 * Created by mkahn on 12/19/16.
 */

app.controller( "dashboardController",
    function ( $scope, $timeout, ogDevice, $log, $interval, uibHelper, $cookies, ogNet ) {

        $log.info( "Loading dashboardController" );

        //This is here to test communicating with backend thru cookies for later security implementation
        $cookies.put( "ourglass", "yoyoy" );

        function reloadAppList() {
            ogNet.getApps()
                .then( function ( apps ) {
                    angular.extend( $scope, apps );
                } );
        }
        
        reloadAppList();
        
        $scope.$on(
            "RELOAD_APPS",
            function ( event ) {
                $log.debug("Told to reload app list!");
                reloadAppList();
            }
        );

    });