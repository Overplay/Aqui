/**
 * Created by mkahn on 4/28/15.
 */

app.controller("conController",
    function ($scope, $timeout, $http, $log, $interval, uibHelper, $cookies, $location) {

        $log.info("Loading conController");

        $cookies.put("ourglass", "yoyoy");
        
        $scope.ui = { showApps: true, mode: 'admin', showAdvanced: false, showHud: false, tab: 'apps' };
        $scope.hudMessage = "";

        $scope.runningApps = [];
        $scope.sleepingApps = [];

        $scope.system = {};
        $scope.stations = [];

        function getSysInfo(){

            $http.get("/api/system/device")
                .then( function(data){

                    $scope.system = data.data;
                    // $scope.system.name = data.data.name;
                    // $scope.system.locationWithinVenue = data.data.locationWithinVenue;

                })

            $http.get( "/api/program/channels" )
                .then( function ( data ) {

                    $scope.stations = data.data;
                    // $scope.system.name = data.data.name;
                    // $scope.system.locationWithinVenue = data.data.locationWithinVenue;

                } )

        }

        function updateSysInfo(){

            return $http.post("/api/system/device", $scope.sysInfo);

        }

        $scope.callApiEndpoint = function (appId, apiEndpoint) {
            $http.post("/api/app/" + appId + apiEndpoint)
                .then(function (data) {
                    if (apiEndpoint != '/move' && data.status == 200) {
                        reloadAppList();
                    }
                });
        };

        $scope.openController = function (appId, appName) {
            window.location.href = "/www/opp/" + appId + '/app/control/index.html?name=' + appName;
        };

        function reloadAppList() {
            
            
            $http.get("/api/system/apps")
                .then(function (data) {
                        $scope.runningApps = [];
                        $scope.sleepingApps = [];
                        angular.forEach(data.data, function (app) {
                            if (app.running) {
                                $scope.runningApps.push(app);
                            } else {
                                $scope.sleepingApps.push(app);
                            }
                        });
                    }
                );
        }

        reloadAppList();

       
       $scope.updateSystemName = function(){
        uibHelper.confirmModal("Update?", "Are you sure you want to update the name and location?", true)
            .then(function(resp){
                $log.debug("Responded yes...");
                $scope.hudMessage = "Updating...";
                $scope.ui.showHud = true;
                
                $http.post('/api/system/device', { name: $scope.system.name,
                    locationWithinVenue: $scope.system.locationWithinVenue})
                    .then(function(response){
                    "use strict";
                        $scope.ui.showHud = false;
                    })
            })
       }

       $scope.register = function(){
            $log.debug("Registering using code.");

       }
       
        $interval(reloadAppList, 1000);
        getSysInfo();

    });

app.dir