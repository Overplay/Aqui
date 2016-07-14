/**
 * Created by mkahn on 4/28/15.
 */

app.controller("conController",
    function ($scope, $timeout, $http, $log) {

        $log.info("Loading conController");

        $scope.runningApps = [{screenName: 'Waiting List', appId: 'io.ourglass.waitinglist'}];
        $scope.sleepingApps = [{screenName: 'Shuffleboard', appId: 'io.ourglass.shuffleboard'}];

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
            $scope.runningApps = [{screenName: 'Waiting List', appId: 'io.ourglass.waitinglist'}];
            $scope.sleepingApps = [{screenName: 'Shuffleboard', appId: 'io.ourglass.shuffleboard'}];
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

    });
