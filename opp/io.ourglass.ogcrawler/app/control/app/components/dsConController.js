/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dsConController",
    function ($scope, ogAPI, uibHelper) {

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

            ogAPI.init({
                appType: 'mobile',
                appName: "io.ourglass.ogcrawler",
                endpoint: "control",
                dataCallback: modelUpdate
            });

            ogAPI.loadModel()
                .then( modelUpdate );

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
            ogAPI.model.messages = $scope.messages;
            ogAPI.model.comingUpMessages = $scope.comingUpMessages;

            ogAPI.model.twitterQueries = $scope.twitterQueries;
            
            uibHelper.curtainModal('Saving...');
            ogAPI.save()
                .then( function(){
                    return ogAPI.updateTwitterQuery( ogAPI.model.twitterQueries );
                })
                .finally( uibHelper.dismissCurtain );
            
        };

        // $scope.$watch('messageForm.dirty', function(nval){
        //
        //     if (nval){
        //         $scope.update();
        //     }
        //
        // });

        initialize();

    });
