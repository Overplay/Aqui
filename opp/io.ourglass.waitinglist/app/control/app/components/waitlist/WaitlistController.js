/**
 * Created by mkahn on 4/28/15.
 */

app.controller("waitlistController", ["$scope", "$interval", "$timeout", "$http", "$log", "$location", "optvModel",
    function ($scope, $interval, $timeout, $http, $log, $location, optvModel) {

        $log.info("Loading waitlistController");

        $scope.addErrors = {
            name: false, partySize: false, nameExists: function () {
                return partiesContainName($scope.newParty.name);
            }
        };

        $scope.partyUIElements = {};
        $scope.getPartyUIElement = function(party, elementName) {
            var key = party.name;
            if(!$scope.partyUIElements[key]) {
                $scope.partyUIElements[key] = {};
                return false;
            }
            return $scope.partyUIElements[key][elementName];
        };
        $scope.setPartyUIElement = function(party, elementName, value) {
            var key = party.name;
            if(!$scope.partyUIElements[key]) {
                $scope.partyUIElements[key] = {elementName: value};
            }else {
                $scope.partyUIElements[key][elementName] = value;
            }
        };

        $scope.$watch(function () {
            return $scope.newParty.name;
        }, function (newVal) {
            if ($scope.addErrors.name && newVal) $scope.addErrors.name = false;
        });
        $scope.$watch(function () {
            return $scope.newParty.partySize;
        }, function (newVal) {
            if ($scope.addErrors.partySize && newVal) $scope.addErrors.partySize = false;
        });

        $scope.parties = function () {
            return optvModel.model.parties;
        }

        function retrieveData(data) {
            console.log('Data Callback! - control', data);
            optvModel.model.parties = data.parties;
        }

        function sendTextToParty(party) {
            var phone = party.phone;
            console.log('Sending text alert to', phone, '...');
        }

        var CHECK_INTERVAL = 1000; // milliseconds
        var WAIT_TIME_BEFORE_SEND = 20; // minutes

        function checkAndSendTextAlert() {
            var currentDate = new Date();
            for (var i in optvModel.model.parties) {
                var party = optvModel.model.parties[i];
                if (!party.phone || party.alreadySent) continue;
                if ((currentDate - party.dateCreated) / 1000 / 60 >= WAIT_TIME_BEFORE_SEND) {
                    // Send text
                    sendTextToParty(party);
                    // Set to false so doesn't send again but it should never get here but just in case
                    party.phone = false;
                }
            }
            $interval(checkAndSendTextAlert, CHECK_INTERVAL);
        }

        function initialize() {

            optvModel.init({
                appName: "io.ourglass.waitinglist",
                initialValue: {
                    parties: [
                        {
                            name: 'Noah',
                            partySize: 5,
                            dateCreated: new Date((new Date()).valueOf() - (60000 * 20)),
                            phone: '4084990902',
                            tableReady: false
                        },
                        {
                            name: 'Logan',
                            partySize: 8,
                            dateCreated: new Date((new Date()).valueOf() - (60000 * 5)),
                            phone: '4088333405',
                            tableReady: false
                        },
                        {
                            name: 'Saso',
                            partySize: 11,
                            dateCreated: new Date((new Date()).valueOf() - (60000 * 50)),
                            phone: '4082672769',
                            tableReady: false
                        }
                    ]
                },
                dataCallback: retrieveData
            });

            checkAndSendTextAlert();

            emptyNewParty();

        }

        function emptyNewParty() {
            $scope.newParty = {
                name: '',
                partySize: undefined,
                dateCreated: undefined,
                phone: undefined,
                tableReady: false
            };
        }

        function partiesContainName(name) {
            for (var i in optvModel.model.parties) {
                var arrParty = optvModel.model.parties[i];
                if (arrParty.name == name) return true;
            }
            return false;
        }

        $scope.cancel = function () {
            $location.path('/home');
            emptyNewParty();
        }

        $scope.add = function () {
            if ($scope.newParty.name && $scope.newParty.partySize) {
                $scope.newParty.name.trim();
                if (partiesContainName($scope.newParty.name)) {
                    // Name already exists. Please enter first or last initial.
                    $scope.addErrors.nameExists = true;
                } else {
                    // Add dateCreated to newParty
                    $scope.newParty.dateCreated = new Date();
                    // Give the array the party object and save/send to tv
                    optvModel.model.parties.push($scope.newParty);
                    optvModel.save();
                    // Return to home
                    $scope.cancel();
                }
            } else {
                // Fill in all fields
                if (!$scope.newParty.name) $scope.addErrors.name = true;
                if (!$scope.newParty.partySize) $scope.addErrors.partySize = true;
            }
        }

        $scope.openAdd = function () {
            emptyNewParty();
            $location.path('/add');
        };

        function partiesAreEqual(party1, party2) {
            return party1.name == party2.name;
        }

        // Calculates index by comparing all 3 fields (name, partySize, dateCreated)
        function indexOfParty(party) {
            for (var i = 0; i < optvModel.model.parties.length; i++) {
                var arrParty = optvModel.model.parties[i];
                if (partiesAreEqual(arrParty, party)) {
                    return i;
                }
            }
            return -1;
        }

        $scope.removeParty = function (party) {
            var index = indexOfParty(party);
            if (index == -1) {
                // ns-transition-end called for a few different things, so this will always happen
                // the above comment is fixed because I limited the end transition to one property
                // console.log("I could not find", party, "in", optvModel.model.parties);
            } else {
                optvModel.model.parties.splice(index, 1);
                optvModel.save();
            }
        };

        $scope.doPartyBnAction = function (party, $event) {
            var label = $event.target.innerHTML;
            switch (label.trim().toLowerCase()) {
                case 'table ready':
                case 'table not ready':
                    party.tableReady = !party.tableReady;
                    optvModel.save();
                    break;
                case 'delete':
                case 'seated':
                    $scope.toggleOptions(party, true);
                    break;
            }
        };

        $scope.toggleOptions = function (party, shouldDelete) {
            $scope.setPartyUIElement(party, 'showOptions', !$scope.getPartyUIElement(party, 'showOptions'));
            // If opening, add class that removes the border
            if ($scope.getPartyUIElement(party, 'showOptions')) {
                $scope.setPartyUIElement(party, 'partyElongated', true);
                // If closing, remove class that sets z index higher for clicking
            } else {
                $scope.setPartyUIElement(party, 'showOptionsZ', false);
                $scope.setPartyUIElement(party, 'partyElongated', false);
                $scope.setPartyUIElement(party, 'isDeleting', shouldDelete);
            }
        };

        initialize();

    }]);

app.directive('phoneInput', function ($filter, $browser) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function ($scope, $element, $attrs, ngModelCtrl) {
            var listener = function () {
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('tel')(value, false));
            };

            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function (viewValue) {
                return viewValue.replace(/[^0-9]/g, '').slice(0, 10);
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function () {
                $element.val($filter('tel')(ngModelCtrl.$viewValue, false));
            };

            $element.bind('change', listener);
            $element.bind('keydown', function (event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                    return;
                }
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });

            $element.bind('paste cut', function () {
                $browser.defer(listener);
            });
        }

    };
});

app.filter('tel', function () {

    var lastValueLength = 0;

    return function (tel) {
        // console.log(tel);
        if (!tel) {
            return '';
        }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 1:
            case 2:
            case 3:
                city = value;
                break;

            default:
                city = value.slice(0, 3);
                number = value.slice(3);
        }

        var lastValue = lastValueLength;
        lastValueLength = value.length;

        if (number) {
            if (number.length > 3) {
                number = number.slice(0, 3) + '-' + number.slice(3, 7);
            } else {
                number = number;
            }

            return ("(" + city + ") " + number).trim();
        } else if (value.length == 3 && lastValue == 2) {
            return "(" + city + ")";
        } else {
            return "(" + city;
        }

    };
});

app.directive('nsTransitionEnd', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            party: '=',
        },
        link: function (scope, element, attrs) {
            element.bind('transitionend', function (e) {
                var controller = scope.$parent.$parent.$parent.$parent;
                // Verify it's the element we want
                if (e.target.className.includes('button') && e.target.className.includes('party') && e.propertyName == 'border-bottom-width') {
                    scope.$apply(function () {
                        // If is deleting, remove after animations finish
                        if (controller.getPartyUIElement(scope.party, 'isDeleting')) {
                            console.log('Removing', scope.party, '...');
                            controller.removeParty(scope.party);
                        } else {
                            // If opening, set z-index of buttons high so user can click on them
                            if (controller.getPartyUIElement(scope.party, 'showOptions')) {
                                controller.setPartyUIElement(scope.party, 'showOptionsZ', true);
                            }
                        }
                    });
                }
            });
        }
    };
});
