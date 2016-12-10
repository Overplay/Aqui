/**
 * Created by mkahn on 4/28/15.
 */

app.controller("addController", function ($scope, $log, waitList, $state ) {

        $log.info("Loading adController");

 

        $scope.addErrors = { name: false, partySize: false, nameExists: false, phone: false}
  



        function sendTextToParty(party) {
            // var phone = party.phone;
            // console.log('Sending text alert to', phone, '...');
            // // SEND TEXT HERE
            // // Set to false so doesn't send again but it should never get here but just in case
            // party.phone = false;
        }


        function checkAndSendTextAlert() {
            // var currentDate = new Date();
            // for (var i in ogControllerModel.model.parties) {
            //     var party = ogControllerModel.model.parties[i];
            //     if (!party.phone || party.alreadySent) continue;
            //     if ((currentDate - party.dateCreated) / 1000 / 60 >= WAIT_TIME_BEFORE_SEND) {
            //         // Send text
            //         sendTextToParty(party);
            //     }
            // }
            // $timeout(checkAndSendTextAlert, CHECK_INTERVAL);
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


        function verifyPhoneNumber( phone ) {
            phone = phone.toString();
            var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            return phoneRegex.test( phone );
        }

        function formatPhoneNumber( phone ) {
            phone = phone.toString();
            var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            return !phoneRegex.test( phone ) ? null : phone.replace(phoneRegex, "($1) $2-$3");
        }

        $scope.add = function () {
        
            if ($scope.newParty.name == "*Demo"){
                waitList.loadTestData();
                $state.go('home');
                return;
            }

            if ( $scope.newParty.name.trim() && $scope.newParty.partySize > 0 && verifyPhoneNumber($scope.newParty.phone)) {

                $scope.newParty.phone = formatPhoneNumber( $scope.newParty.phone );
                $log.debug("formatted phone number: " + $scope.newParty.phone );

                if ( waitList.addParty( $scope.newParty )){
                    $log.debug("Party added OK");
                    $state.go('home');
                } else {
                    $scope.addErrors.nameExists = true;
                }
                
            } else {
                // Fill in all fields
                if (!$scope.newParty.name.trim()) $scope.addErrors.name = true;
                if (!$scope.newParty.partySize) $scope.addErrors.partySize = true;
                if (!verifyPhoneNumber($scope.newParty.phone)) $scope.addErrors.phone = true;
            }
        }

 
 

    });

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

