/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, $timeout, $http, optvModel, $ionicTabsDelegate) {

        $scope.getMessages = function () {
            return optvModel.model.messages;
        };
        $scope.getComingUpMessages = function () {
            return optvModel.model.comingUpMessages;
        };
        $scope.getTwitterQueries = function () {
            return optvModel.model.twitterQueries;
        };

        $scope.tabs = ['Messages', 'Coming Up', 'Twitter'];

        $scope.getSelectedTabTitle = function () {
            return $scope.tabs[$ionicTabsDelegate.selectedIndex()];
        };
        $scope.getTabURI = function (tab) {
            return tab.toLowerCase().replace(' ', '');
        };

        function modelUpdate(data) {
            optvModel.model.messages = data.messages;
            optvModel.model.comingUpMessages = data.comingUpMessages;
            optvModel.model.twitterQueries = data.twitterQueries;
        }

        function initialize() {

            optvModel.init({
                appName: "io.overplay.pubcrawler",
                endpoint: "control",
                dataCallback: modelUpdate,
                initialValue: {messages: [], comingUpMessages: [], twitterQueries: []}
            });

        }

        $scope.newMessage = function () {
            optvModel.model.messages.push("");
        };
        $scope.newComingUpMessage = function () {
            optvModel.model.comingUpMessages.push("");
        };
        $scope.newTwitterQuery = function () {
            optvModel.model.twitterQueries.push("");
        };

        $scope.delMessage = function (index) {
            optvModel.model.messages.splice(index, 1);
        };
        $scope.delComingUpMessage = function (index) {
            optvModel.model.comingUpMessages.splice(index, 1);
        };
        $scope.delTwitterQuery = function (index) {
            optvModel.model.twitterQueries.splice(index, 1);
        };

        $scope.update = function () {
            optvModel.save();
        };

        initialize();

    });
