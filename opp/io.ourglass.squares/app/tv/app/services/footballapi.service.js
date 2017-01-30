/**
 * Created by mkahn on 1/27/17.
 */

app.factory("footballAPI", function($http, $q, $log){

    var service ={};

    $log.debug("Loading footballAPI service.");

    var _simulated = true;
    var _apiKey = "UnFOwpdclyCiIfPqDN4LHK1tJrESaWs9";

    service.getLatestGameInfo = function(gameId){

        return $http.post("https://profootballapi.com/game?api_key="+_apiKey+"&game_id="+gameId, {});

    }

    service.getScheduleForMonthAndSeason = function( month, season ) {

        return $http.post( "https://profootballapi.com/schedule?api_key=" + _apiKey + "&year=" + season + "&month=" + month, {} );

    }

    return service;

});