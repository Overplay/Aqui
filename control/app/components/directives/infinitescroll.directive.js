/**
 * Created by erikphillips on 12/23/16.
 */

app.directive('infiniteScroll', function ($timeout, $log) {
    return {
        restrict: 'A',
        scope: {
            add: "=",
            masterGrid: "=",
            currGrid: "="
        },
        link: function (scope, element, attrs) {

            $log.debug('inside infinite scroller');

            var myElement = element[0];
            var TRIGGER_POINT = 450;
            var HEIGHT_OF_ONE_DIV = 400;

            var position = 0;

            element.bind('scroll', function() {
                $log.debug('scrolled - ' + myElement.scrollHeight);

                if ( myElement.scrollHeight ) {

                }

            });


            // var myElement = element[0];
            // var _HEIGHT_ABOVE_BOTTOM_TO_TRIGGER = attrs.triggerDist || 600;
            // var _HEIGHT_OF_ONE_DIV = attrs.divHeight || 25;
            //
            // element.bind('scroll', function () {
            //     if ( (scope.addbeginning!==undefined) && (myElement.scrollTop <= _HEIGHT_ABOVE_BOTTOM_TO_TRIGGER) ){
            //         scope.addbeginning().then(function(shouldReset){
            //             if(shouldReset){
            //                 $timeout(function(){
            //                     myElement.scrollTop = myElement.scrollHeight / 2;
            //                 }) //in lieu of calling $scope.$apply() which throws error
            //             }
            //         })
            //     }
            //
            //     if (myElement.scrollTop + myElement.offsetHeight > myElement.scrollHeight - _HEIGHT_ABOVE_BOTTOM_TO_TRIGGER) {
            //         scope.add().then(function(shouldReset){
            //             if(shouldReset){
            //                 $log.debug('infinteScroll shouldReset true');
            //                 $timeout(function(){
            //                     myElement.scrollTop = myElement.scrollHeight / 2 - _HEIGHT_ABOVE_BOTTOM_TO_TRIGGER - _HEIGHT_OF_ONE_DIV;
            //                 }) //in lieu of calling $scope.$apply() which throws error
            //             }
            //         });
            //     }
            // });
        }
    };
});