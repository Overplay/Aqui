/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dsConController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading dsConController" );

        var logLead = "DS Control App: ";
        $scope.inboundMessageArray = [];
        $scope.messageArray = [];

        function modelUpdate( data ) {
            $log.info( logLead + " got a model update: " + angular.toJson( data ) );

            //changed this to shallow copy so that the update does not occur when local copy is changed
            $scope.messageArray = data.messages.slice();
        }

        function inboundMessage( msg ) {
            $log.debug( logLead + "Inbound message..." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.ourglass.pubcrawler2",
                endpoint:        "control",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage
            } );

        }

        $scope.add = function () {
            $scope.messageArray.push( "Enter new message" );
        }

        $scope.update = function () {
            //also changed to shallow copy
            optvModel.model.messages = $scope.messageArray.slice();
            optvModel.save();
        }

        $scope.del = function(index){
            $scope.messageArray.splice(index, 1);
        }


        initialize();

    } );
