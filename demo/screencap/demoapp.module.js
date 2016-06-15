
var app = angular.module('demoapp', []);

app.controller('demoCtrlr', function($scope, $log, $interval){

    $log.debug("Loading democtrlr");

    var pos = [
        { top: true, left: true },
        { top: true, left: false },
        { top: false, left: false },
        { top: false, left: true }
    ];

    var pidx = 0;

    $scope.position = pos[pidx];

    $interval( function(){

        pidx++;
        if (pidx>3) pidx=0;
        $scope.position = pos[ pidx ];


    }, 5000);

});
