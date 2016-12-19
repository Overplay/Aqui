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
    service.getGrid = function( useCached ) {

        // Grab local copy, if one exists
        var grid = localStorage.getItem( "grid" );
        
        if ( grid && useCached ) {
            // We had a local copy, so make it JSON and return as an already resolved promise
            return $q.when( JSON.parse( grid ) );
        } else {
            // no local copy or caching is turned off, let's get fresh data
            return $http.get( "http://api.tvmedia.ca/tv/v4/lineups/5266D/listings/grid?api_key=761cbd1955e14ff1b1af8d677a488904&timezone=-08:00" )
                .then( function ( data ) {
                    var inbound = data.data;
                    localStorage.setItem( "grid", JSON.stringify( inbound ) );
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

    return service;

});