/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "bbConController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading bbConController" );

        var logLead = "BB Control App: ";
        $scope.inboundMessageArray = [];
        $scope.messageArray = [];

        $scope.ui = { json: ""};
        $scope.input = {newMsg: ""};

        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            console.log(data);
            $scope.messageArray = data.messages;
            $scope.ui.json = angular.toJson($scope.messageArray);
            console.log(data);
        }

        function inboundMessage( msg ) {
            $log.debug( logLead + "Inbound message..." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.budboard2",
                endpoint:        "control",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage
            } );

        }

        $scope.add = function () {
            console.log($scope.messageArray);
            if(!$scope.input.newMsg.length){
                return;
            }
            if(!Array.isArray($scope.messageArray)){
                $scope.messageArray = [];
            }
            $scope.messageArray.push( $scope.input.newMsg );
            $scope.input.newMsg = '';
        }

        $scope.update = function () {
            optvModel.model = { messages: $scope.messageArray };
            optvModel.save();
        }

        $scope.del = function(index){
            $scope.messageArray.splice(index, 1);
        }

        initialize();

    } );
