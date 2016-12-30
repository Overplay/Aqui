/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, $timeout, $interval, $http, ogControllerModel) {

        $scope.messages = [];
        $scope.comingUpMessages = [];
        $scope.twitterQueries = [];
        $scope.ui = { tab: "MESSAGES" };

        $scope.tabs = ['Messages', 'Coming Up', 'Twitter'];

        $scope.getSelectedTabTitle = function () {
            return $scope.tabs[$ionicTabsDelegate.selectedIndex()];
        };
        $scope.getTabURI = function (tab) {
            return tab.toLowerCase().replace(' ', '');
        };

        function modelUpdate(data) {
            if(data.messages && data.messages.length != $scope.messages.length) {
                $scope.messages = data.messages || [];
            }
            if(data.comingUpMessages && data.comingUpMessages.length != $scope.comingUpMessages.length) {
                $scope.comingUpMessages = data.comingUpMessages || [];
            }
            if(data.twitterQueries && data.twitterQueries.length != $scope.twitterQueries.length) {
                $scope.twitterQueries = data.twitterQueries || [];
            }
        }

        function initialize() {

            ogControllerModel.init({
                appName: "io.ourglass.ogcrawler",
                endpoint: "control",
                dataCallback: modelUpdate
            });
            
            ogControllerModel.loadModel()
                .then( function(data){
                    modelUpdate(data);
                });

        }

        $scope.newMessage = function () {
            $scope.messages.push("");
            $scope.update();
        };
        $scope.newComingUpMessage = function () {
            $scope.comingUpMessages.push("");
            $scope.update();
        };
        $scope.newTwitterQuery = function () {
            $scope.twitterQueries.push("");
            //$scope.update();
        };

        $scope.delMessage = function (index) {
            $scope.messages.splice(index, 1);
            $scope.update();
        };
        $scope.delComingUpMessage = function (index) {
            $scope.comingUpMessages.splice(index, 1);
            $scope.update();
        };
        $scope.delTwitterQuery = function (index) {
            $scope.twitterQueries.splice(index, 1);
            $scope.update();
        };

        $scope.update = function () {
            ogControllerModel.model.messages = $scope.messages;
            ogControllerModel.model.comingUpMessages = $scope.comingUpMessages;

            ogControllerModel.model.twitterQueries = $scope.twitterQueries;
            ogControllerModel.save();

            ogControllerModel.updateTwitterQuery(ogControllerModel.model.twitterQueries);
        };

        initialize();

    });
