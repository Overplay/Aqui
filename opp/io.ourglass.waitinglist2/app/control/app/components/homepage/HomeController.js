/**
 * Created by mkahn on 4/28/15.
 */

app.controller("homeController", function ($scope, $log, waitList, $timeout ) {

        $log.info("Loading homeController");
    
        waitList.loadTestData();

        function loadFromService(){
            $scope.parties = waitList.currentList;
        }

        $timeout( loadFromService, 500);


    });

