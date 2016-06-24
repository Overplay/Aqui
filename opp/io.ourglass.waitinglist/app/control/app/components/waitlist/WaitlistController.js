/**
 * Created by mkahn on 4/28/15.
 */

app.controller("waitlistController", ["$scope", "$timeout", "$http", "$log", "$ionicPopup", "optvModel",
    function ($scope, $timeout, $http, $log, $ionicPopup, optvModel) {

        $log.info("Loading waitlistController");

        $scope.parties = function() { return optvModel.model.parties; }

        function initialize() {

            optvModel.init({
                appName: "io.ourglass.waitinglist",
                initialValue: {parties: [
                    {
                        name:'Noah',
                        members:5,
                        dateCreated: new Date()
                    },
                    {
                        name:'Logan',
                        members:4,
                        dateCreated: new Date()
                    }
                ]},
                dataCallback: function (data) {
                    console.log('Data Callback!', data);
                }
            });

            $scope.newParty = {name: '', members: undefined, dateCreated: undefined};

        }

        function partiesContainName(name) {
            var flag = false;
            angular.forEach(optvModel.model.parties, function(party) {
                flag = party.name == name;
                if(flag) return;
            });
            return flag;
        }

        $scope.openAdd = function () {
            $ionicPopup.show({
                templateUrl: 'app/components/waitlist/waitlist.add.html',
                cssClass: 'add-popup',
                title: 'Create New Party',
                scope: $scope,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'button-light',
                        onTap: function () {
                            $scope.newParty = {name: '', members: undefined, dateCreated: undefined};
                        }
                    },
                    {
                        text: '<b>Add</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                            // Missing one of the inputs
                            if (!$scope.newParty.name || !$scope.newParty.members) {
                                // Prevent closing and give user error message
                                e.preventDefault();
                                $ionicPopup.alert({
                                    title: 'Please fill in all fields.'
                                });
                            // Pressed add button with valid information
                            } else {
                                $scope.newParty.name.trim();
                                if(partiesContainName($scope.newParty.name)) {
                                    // Prevent closing and give user error message
                                    e.preventDefault();
                                    $ionicPopup.alert({
                                        title: 'Name already exists! Please enter a first or last initial.'
                                    });
                                } else {
                                    // Add dateCreated to newParty
                                    $scope.newParty.dateCreated = new Date();
                                    // Give the array the party object and save/send to tv
                                    optvModel.model.parties.push($scope.newParty);
                                    optvModel.save();
                                    // Empty out array so popup is empty next time
                                    $scope.newParty = {name: '', members: undefined, dateCreated: undefined};
                                }
                            }
                        }
                    }
                ]
            });
        };

        function removeParty(party) {
            optvModel.model.parties.splice(optvModel.model.parties.indexOf(party), 1);
            optvModel.save();
        }

        $scope.openOptions = function($event, party) {
            $ionicPopup.show({
                title: $event.target.innerText,
                cssClass: 'open-options',
                scope: $scope,
                buttons: [
                    { text: 'Cancel', type: 'button-light' },
                    {
                        text: 'Seated',
                        type: 'button-dark',
                        onTap: function (e) {
                            removeParty(party);
                        }
                    },
                    {
                        text: 'Left',
                        type: 'button-dark',
                        onTap: function (e) {
                            removeParty(party);
                        }
                    },
                    {
                        text: '<b>Delete</b>',
                        type: 'button-assertive',
                        onTap: function(e) {
                            $ionicPopup.show({
                                title: 'Are you sure you want to delete this party?',
                                buttons: [
                                    { text: 'No', type: 'button-light' },
                                    {
                                        text: 'Yes, Delete',
                                        type: 'button-assertive',
                                        onTap: function(e) {
                                            removeParty(party);
                                        }
                                    }
                                ]
                            });
                        }
                    }
                ]
            });
        };

        initialize();

    }]);
