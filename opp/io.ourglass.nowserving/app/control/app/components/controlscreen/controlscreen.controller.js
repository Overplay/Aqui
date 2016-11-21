/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogNowServingController", function ( $scope, $log, ogControllerModel ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.ticketNumber = 12456;


    function saveModel() {
        ogControllerModel.save()
            .then( function ( response ) {
                $log.debug( "Save was cool" );
            } )
            .catch( function ( err ) {
                $log.error( "WTF?!?!?" );
                $scope.ticketNumber = "Error Talking to AB";
            } );
    }

    $scope.clear = function () {
    
        $log.debug( "Clear pressed" );
        $scope.ticketNumber = 0;
        ogControllerModel.model = { ticketNumber: 0 };
        saveModel();

    }

    $scope.incrementTicket = function () {
    
        $log.debug( "Increment pressed" );
        $scope.ticketNumber += 1;
        ogControllerModel.model.ticketNumber = $scope.ticketNumber;
        saveModel();

    }

    function initialize() {

        ogControllerModel.init( { appName: "io.ourglass.nowserving" } );
        ogControllerModel.loadModel()
            .then( function ( latestData ) {
                $scope.ticketNumber = latestData.ticketNumber;
            } )
            .catch( function ( err ) {
                $log.error( "WTF?!?!?" );
                $scope.ticketNumber = "Error Talking to AB";
            } )

    }

    initialize();

} );