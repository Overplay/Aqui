/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, $timeout, $http, optvModel, $ionicTabsDelegate) {

        $scope.getMessages = function () {
            return optvModel.model.messages;
        };
        $scope.getUpNextMessages = function () {
            return optvModel.model.upNextMessages;
        };

        $scope.tabs = ['Messages', 'Up Next', 'Twitter'];

        $scope.getSelectedTabTitle = function () {
            return $scope.tabs[$ionicTabsDelegate.selectedIndex()];
        }
        $scope.getTabURI = function (tab) {
            return tab.toLowerCase().replace(' ', '');
        }

        function modelUpdate(data) {
            optvModel.model.messages = data.messages;
            optvModel.model.upNextMessages = data.upNextMessages;
        }

        function initialize() {

            optvModel.init({
                appName: "io.overplay.pubcrawler",
                endpoint: "control",
                dataCallback: modelUpdate,
                initialValue: {messages: [], upNextMessages: []}
            });

        }

        $scope.newMessage = function () {
            optvModel.model.messages.push("");
        };
        $scope.newUpNextMessage = function () {
            optvModel.model.upNextMessages.push("");
        };

        $scope.delMessage = function (index) {
            optvModel.model.messages.splice(index, 1);
        };
        $scope.delUpNextMessage = function (index) {
            optvModel.model.upNextMessages.splice(index, 1);
        };

        $scope.update = function () {
            optvModel.save();
        };

        initialize();

    });
