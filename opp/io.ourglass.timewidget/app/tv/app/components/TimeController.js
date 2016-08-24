/**
 * Created by madelineer on 8/1/16.
 */

app.controller("timeController", function ($scope, $interval, $log, clockService) {

    $log.debug('Loading timeController.');

    $scope.digits = ['0','0','0','0','0','0'];
    
    $scope.flip = true;

    // $scope.flip = false;
    
    clockService.countUp(true);

    function setTime() {

        $scope.digits = clockService.update();

    };

    setTime();

    $interval(setTime, 1000);


});

app.directive('flippingDigit', function ($log, $timeout) {
    return {
        restrict: 'E',
        scope: {
            digit: '=',
            flip: '='
        },
        link: function (scope, elem, attr) {

            scope.showStatic = true;

            scope.$watch('digit', function(newVal, oldVal){
                $log.debug('Things are changing ' + oldVal + '>' + newVal);
                $log.debug('This is the original ' + scope.flip);
                $log.debug('This is the new ' + scope.flip);
                scope.frontDigit = oldVal;
                scope.backDigit = newVal;
                $timeout(function(){
                    scope.flip = !scope.flip;
                }, 500);

            });

        },
        templateUrl: 'app/components/flipDigit.template.html'
    }
});

