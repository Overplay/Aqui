/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "luckyLepController",
    function ( $scope, $timeout, $http, $interval, ogTVModel, $log, $window ) {

        $log.debug("Loading controller...");

        $scope.lep = { winner: "treb", show: true };
        var guests = ['Sally', 'Jenny', 'Craig', 'Treb', 'Mitch', 'Ethan', 'Katrina', 'Bubba']

    
        $interval( function(){
        
            $scope.lep.show = !$scope.lep.show;
            var rando = Math.floor( Math.random() * 8 );
            $scope.lep.winner = guests[rando];
            ogTVModel.move("io.ourglass.luckylep");
            
        }, 5000)
        
        
        // function getGuests(){
        //
        //     $http.get("http://162.243.133.57:1337/api/v2/guest")
        //         .then( function(data){
        //
        //             $scope.guests = data.data;
        //
        //         }, function(err){
        //
        //         })
        // }
        //
        // function pickVictim(){
        //
        //     if ($scope.guests.length){
        //
        //         var rn = Math.floor( Math.random() * ($scope.guests.length) );
        //         $scope.lep.winner = $scope.guests[rn].firstName+" "+ $scope.guests[ rn ].lastName;
        //         $scope.lep.show = true;
        //         getGuests();
        //         $timeout(function(){
        //             $scope.lep.show = false;
        //         }, 30*1000);
        //     }
        //
        // }
        //
        // function modelUpdate( data ) {
        //
        //
        // }
        //
        // function inboundMessage( msg ) {
        //     pickVictim()
        // }
        //
        // function updateFromRemote() {
        //
        //     ogTVModel.init( {
        //         appName:         "io.overplay.luckylep",
        //         endpoint:        "tv",
        //         dataCallback:    modelUpdate,
        //         messageCallback: inboundMessage,
        //         initialValue:    { lepData: {} },
        //     } );
        //
        // }
        //
        // updateFromRemote();

        // $interval(pickVictim, 1.5*60*1000)
        // getGuests()

    } );
