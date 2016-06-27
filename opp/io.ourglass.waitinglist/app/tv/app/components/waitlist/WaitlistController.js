/**
 * Created by mkahn on 4/28/15.
 */

app.controller("waitlistController",
    function ($scope, $timeout, $http, $interval, optvModel) {

        console.log("Loading waitlistController");

        $scope.parties = function () {
            return optvModel.model.parties;
        }

        function modelUpdate(data) {
            console.log('Data Callback! - tv', data);
            optvModel.model.parties = data.parties;
        }

        function updateFromRemote() {

            optvModel.init({
                appName: "io.ourglass.waitinglist",
                endpoint: "tv",
                dataCallback: modelUpdate,
                initialValue: {parties: []}
            });

        }

        // Honk Hionk beep!

        updateFromRemote();

    });
