/**
 * Created by mkahn on 4/28/15.
 */

// Really does nothing much in this version
app.controller("conController",
    function ( $scope, $log, $cookies, $state ) {

        $log.info("Loading conController");

        //Here for testing passing cookies to AB http server for security later
        $cookies.put("ourglass", "yoyoy");

        $state.go("dashboard");

    });
