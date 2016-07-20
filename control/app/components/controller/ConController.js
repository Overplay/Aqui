/**
 * Created by mkahn on 4/28/15.
 */

app.controller("conController",
    function ($scope, $timeout, $http, $log, $ionicModal) {

        $log.info("Loading conController");

        $scope.runningApps = [];
        $scope.sleepingApps = [];

        $scope.sysInfo = {};

        function getSysInfo(){

            $http.get("/api/system/device")
                .then( function(data){

                    $scope.sysInfo.name = data.data.name;
                    $scope.sysInfo.locationWithinVenue = data.data.locationWithinVenue;

                })
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

        $scope.openController = function (appId) {
            window.location.href = "/www/opp/" + appId + '/app/control/index.html';
        };

        function reloadAppList() {
            $scope.runningApps = [];
            $scope.sleepingApps = [];
            $http.get("/api/system/apps")
                .then(function (data) {
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

        $ionicModal.fromTemplateUrl( 'templates/modal.html', {
            scope: $scope
        } ).then( function ( modal ) {
            $scope.modal = modal;
        } );

        $scope.updateSystem = function () {
            $log.debug("Updating and Hiding modal");
            $scope.modal.hide();
            updateSysInfo();
        };


    });
