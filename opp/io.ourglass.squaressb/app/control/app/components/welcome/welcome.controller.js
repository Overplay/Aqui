/**
 * Created by erikphillips on 1/27/17.
 */

app.controller("welcomeController", function($scope, uibHelper, $log, ogAPI, toastr) {

    $log.debug("loading welcome controller");

    ogAPI.init( {
        appType: 'mobile',
        appName: "io.ourglass.squaressb"
    });
    
    ogAPI.loadModel()
        .then( function(data){
            $scope.host = data.dataSource;
        });
        
    $scope.setHost = function(){
        ogAPI.model.dataSource = $scope.host;
        uibHelper.curtainModal('Updating');
        ogAPI.save()
            .finally(uibHelper.dismissCurtain);
    }

    $scope.testRemote = function () {
    
        ogAPI.proxyGet($scope.host, 'io.ourglass.squares')
            .then(function(resp){
                $log.debug("Response: "+resp);
                toastr.success("We're good!");
            })
            .catch( function ( err ) {
                $log.error( "Error: " + err );
                toastr.error( "Can't make connection" );
            })
    }

});
