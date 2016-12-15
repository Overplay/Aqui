/**
 * Created by mkahn on 4/28/15.
 */

app.controller("conController",
    function ($scope, $timeout, $http, $log, $interval, uibHelper, $cookies, $q) {

        $log.info("Loading conController");

        $cookies.put("ourglass", "yoyoy");
        
        $scope.ui = { showApps: true, mode: 'admin', showAdvanced: false, showHud: false, tab: 'apps' };
        $scope.hudMessage = "";

        $scope.runningApps = [];
        $scope.sleepingApps = [];

        $scope.system = {};
        $scope.stations = [];

        var listings = []
        $scope.listHash = {}


        function getGrid(useCached){

            // Grab local copy, if one exists
            var grid = localStorage.getItem( "grid" );


            if (grid && useCached){
                // We had a local copy, so make it JSON and return as an already resolved promise
                return $q.when( JSON.parse(grid));
            } else {
                // no local copy or caching is turned off, let's get fresh data
                return $http.get( "http://api.tvmedia.ca/tv/v4/lineups/5266D/listings/grid?api_key=761cbd1955e14ff1b1af8d677a488904&timezone=-08:00" )
                    .then( function ( data ) {
                        var inbound = data.data;
                        localStorage.setItem("grid", JSON.stringify(inbound));
                        return inbound;
                    } )
            }
        }


        function getSysInfo(){

            $http.get("/api/system/device")
                .then( function(data){

                    $scope.system = data.data;

                })

            // $http.get( "/api/program/channels" )
            //     .then( function ( data ) {
            //
            //         $scope.stations = data.data;
            //
            //     } )
            //
            // $http.get( "/api/program/showsNextHour" )
            //     .then( function ( data ) {
            //
            //         listings = data.data;
            //         listings.forEach(function(l){
            //             $scope.listHash[l.stationID] = l;
            //         })
            //
            //     } )

            getGrid(false)
                .then( function ( data ) {
                    $scope.gridListing = data;
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