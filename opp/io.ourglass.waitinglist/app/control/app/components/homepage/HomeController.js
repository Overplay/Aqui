/**
 * Created by mkahn on 4/28/15.
 */

app.controller("homeController", function ($scope, $log, waitList, currentList, $interval ) {

        $log.info("Loading homeController");
        
        $scope.ui = { firstLoad: true };
        
        $scope.parties = currentList;
        
        var reloadInterval = $interval( function(){
        
            waitList.loadModel()
                .then( function(list){
                    $scope.parties = list;
                    $scope.ui.firstLoad = false;
                })
            
        }, 2000);
    
        // $scope.$on('MODEL_CHANGED', function(){
        //     $scope.parties = waitList.getCurrentList();
        // });
        //
        // $scope.parties = currentList;

    });

