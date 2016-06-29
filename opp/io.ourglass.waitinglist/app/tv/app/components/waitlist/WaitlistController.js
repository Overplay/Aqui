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
                initialValue: {parties: [
                    {
                        name: 'Noah',
                        partySize: 5,
                        dateCreated: new Date((new Date()).valueOf() - (60000 * 20))
                    },
                    {
                        name: 'Logan',
                        partySize: 3,
                        dateCreated: new Date((new Date()).valueOf() - (60000 * 40))
                    },
                    {
                        name: 'Chris',
                        partySize: 9,
                        dateCreated: new Date((new Date()).valueOf() - (60000 * 5))
                    },
                    {
                        name: 'Mitch',
                        partySize: 11,
                        dateCreated: new Date((new Date()).valueOf() - (60000 * 75))
                    }
                ]}
            });

        }

        // Honk Hionk beep!

        updateFromRemote();

    });
