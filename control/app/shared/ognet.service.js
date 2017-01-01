app.factory('ogNet', function($log, $http, $q){

    var service = {};

    function stripData(response){
        return response.data;
    }

    service.getDeviceInfo = function(){
        return $http.get( "/api/system/device" )
            .then( stripData )
    }

    //The caching is probably no longer needed since AB does the caching too...and it's better at it.
    service.getGrid = function() {

        // Grab local copy, if one exists
        var grid = localStorage.getItem( "grid" );

        var now = Date.now();
        var lastGetTime = parseInt(localStorage.getItem("lastGetTime"), 10);
        var useCached = false;

        if (lastGetTime && now < lastGetTime + 300000) {
            useCached = true;
        }
        
        if ( grid && useCached ) {
            // We had a local copy, so make it JSON and return as an already resolved promise
            $log.debug("using cached grid data");
            return $q.when( JSON.parse( grid ) );
        } else {
            // no local copy or caching is turned off, let's get fresh data
            return $http.get( "/api/program/grid" )
                .then( function ( data ) {
                    var inbound = data.data;
                    localStorage.setItem( "grid", JSON.stringify( inbound ) );
                    localStorage.setItem( "lastGetTime", Date.now());
                    $log.debug("using new data via API call from AmstelBright");
                    return inbound;
                } )
        }
    }
    
    service.updateSystemNameLocation = function(name, location){
       return $http.post( "/api/system/device", { name: name, locationWithinVenue: location } );
    }
    
    
    service.getApps  = function reloadAppList() {
        
        return $http.get( "/api/system/apps" )
            .then( function ( data ) {
                var rval = { runningApps:[], sleepingApps: []};
                angular.forEach( data.data, function ( app ) {
                    app.running ? rval.runningApps.push( app ) : rval.sleepingApps.push( app );
                });
                return rval;
            });
    }
    
    
    service.register = function(regcode){
        return $http.post( '/api/system/regcode?regcode=' + regcode.toUpperCase() );
    }

    return service;

});