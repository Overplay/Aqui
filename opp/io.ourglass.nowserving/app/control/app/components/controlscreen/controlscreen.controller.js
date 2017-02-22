/**
 * Created by mkahn on 11/18/16.
 */

app.controller( "ogNowServingController", function ( $scope, $log, ogAPI ) {

    $log.debug( "loaded ogNowServingController" );

    $scope.ticketNumber = 12456;

    function saveModel() {
        ogAPI.save()
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
        ogAPI.model = { ticketNumber: 0 };
        saveModel();

    };

    $scope.incrementTicket = function () {
    
        $log.debug( "Increment pressed" );
        $scope.ticketNumber += 1;
        ogAPI.model.ticketNumber = $scope.ticketNumber;
        saveModel();

    };

    function initialize() {

        $log.debug( "initializing app and data" );

        ogAPI.init( {
            appType: "mobile",
            appName: "io.ourglass.nowserving"
        });

        ogAPI.loadModel()
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

// function init() {
//
//     ogAPI.init( {
//         appType:       'tv',
//         appName:       "io.ourglass.squares",
//         modelCallback: modelUpdate
//     } );
//
//     ogAPI.loadModel(); //this will automatically call the modelUpdate
//
// }
//
// init();