/**
 * Created by mkahn on 4/28/15.
 */

app.controller("conController",
    function ($scope, $timeout, $http, $log, $interval, uibHelper, $cookies, ogNet) {

        $log.info("Loading conController");

        $cookies.put("ourglass", "yoyoy");
        
        $scope.ui = { showApps: true, mode: 'admin', showAdvanced: false, showHud: false, tab: 'apps' };
        $scope.hudMessage = "";

        $scope.system = {};
        $scope.stations = [];

        var listings = []
        $scope.listHash = {}
        

        

        $scope.callApiEndpoint = function (appId, apiEndpoint) {
            $http.post("/api/app/" + appId + apiEndpoint)
                .then(function (data) {
                    if (apiEndpoint != '/move' && data.status == 200) {
                        reloadAppList();
                    }
                });
        };

        

       
       $scope.updateSystemName = function(){
        uibHelper.confirmModal("Update?", "Are you sure you want to update the name and location?", true)
            .then(function(resp){
                $log.debug("Responded yes...");
                $scope.hudMessage = "Updating...";
                $scope.ui.showHud = true;
                ogNet.updateSystemNameLocation( $scope.system.name, $scope.system.locationWithinVenue)
                    .then(function(response){
                    "use strict";
                        $scope.ui.showHud = false;
                    })
            })
       }

       $scope.register = function(){
            $log.debug("Registering using code.");
            $http.post('/api/system/regcode?regcode='+$scope.system.regCode)    
                .then( function(resp){
                    //We got a good response, so we should be registered
                    uibHelper.headsupModal("System Registered", "Thanks for using Ourglass!");
                })
                .catch( function(err){
                    uibHelper.headsupModal( "Something Bad Happened!", "Could not register Ourglass system. Please try again!" );
                    
                })

       }
       

    });
