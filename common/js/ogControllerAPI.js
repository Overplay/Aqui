/****************************************************************************

 File:       ogControllerAPI.js
 Function:   Provides an angular service wrapper for inter-app communication
 Copyright:  Ourglass TV
 Date:       July 2016
 Author:     eadams

 This is an overhaul of the original optvAPILime.js that will not be based on polling
 Instead, the Android will interact directly with the client side javascript on the TV

 Readthrough determined API functionality
   1. layer over the app control interface
     a. launch
     b. move
     c. kill
   2. save functionality - post to appdata endpoint
     note: this will also trigger the TV update through AmstelBright
   3. polling functionality
     a. polling is active by default, and it ensures that the controller contains the correct information
 ****************************************************************************/
const DEFAULT_POLL_INTERVAL = 2000;
const API_PATH = '/api/';
var DATA_UPDATE_METHOD = 'objectEquality';
var TWITTER_LANGUAGE = 'en';
var TWITTER_RESULT_TYPE = 'popular';
var TWITTER_INCLUDE_ENTITIES = 'false';

angular.module('ngOgControllerApi', [])
    .factory('ogControllerModel', function($http, $log, $interval){
        //local variables
        var _appName;
        var _pollInterval;
        var _dataCb;
        var _intervalRef;

        var service = {model: {}};

        /**
         * function to initialize the service model,
         * TV's should never, never poll since the device handles this automatically
         * Controllers on the other hand should poll if there is information in their view which needs to be updated
         * @param params
         * @param [noPoll] pass in true to disable polling
         */
        service.init = function(params, noPoll){
            var toPoll = !noPoll;
            if(params.initialValue){
                $log.warn("initialValue is deprecated, set this field in the info.json instead");
            }

            _appName = params.appName;
            _pollInterval = params.pollInterval || DEFAULT_POLL_INTERVAL;
            _dataCb = params.dataCallback;

            if(toPoll){
                startPolling();
            }

        }

        /**
         * saves the current state of the application
         * @returns {HttpPromise}
         */
        service.save = function(){
            return $http.post(API_PATH + 'appdata/' + _appName, service.model);
        }

        /**
         * performs a post to the move endpoint for either the current app or the appid that is passed in
         * @param [appid] the app to move, if not included, then move the _appName
         * @returns {HttpPromise}
         */
        service.move = function(appid){
            appid = appid || _appName;
            return $http.post(API_PATH + 'app/' + appid + '/move' );
        }

        /**
         * performs a post to the launch endpoint for either the current app or the appid that is passed in
         * @param [appid] the app to move, if not included, then move the _appName
         * @returns {HttpPromise}         */
        service.launch = function(appid){
            appid = appid || _appName;
            return $http.post(API_PATH + 'app/' + appid + '/launch');
        }

        /**
         * performs a post to the kill endpoint for either the current app or the appid that is passed in
         * @param [appid] the app to move, if not included, then move the _appName
         * @returns {HttpPromise}
         */
        service.kill = function(appid){
            appid = appid || _appName;
            //should be able to return the promise object and act on it
            return $http.post(API_PATH + 'app/' + appid + '/kill').then(function(data){
                //kill the poll
                $interval.cancel(_intervalRef);
            });
        }

 
        //convenience methods
        function debugPrint(args){
            $log.debug("ogControllerAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
        }

        function errorPrint(args){
            $log.error("ogControllerAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
        }
        /**
         * function which controls the polling for the associated model
         * records the intervalReference so that it can be cancelled later in kill()
         */
        function startPolling(){
            debugPrint("beginning polling");
            _intervalRef = $interval(function(){
                $http.get(API_PATH + 'appdata/' + _appName).then(function(data){
                    data = data.data;
                    updateIfChanged(data);
                }, errorPrint);
            }, _pollInterval);
        }

        /**
         * function which updates the model in service if the newData passes the criteria of the DATA_UPDATE_METHOD
         * @param newData - data to compare to the service.model and potentially replace it
         */
        function updateIfChanged(newData){
            switch (DATA_UPDATE_METHOD) {
                case 'lastUpdated':
                    if (!service.model.lastUpdated || newData.lastUpdated > service.model.lastUpdated) {
                        debugPrint("service has old data, updating");
                        service.model = newData;
                        _dataCb(service.model);
                    }
                    else {
                        debugPrint("service still has the most recent, not updating");
                    }
                    break;
                case 'objectEquality':
                    //need to first make copies with no lastUpdated
                    var tempCurrent = JSON.parse(JSON.stringify(service.model));
                    delete tempCurrent.lastUpdated;
                    var tempNew = JSON.parse(JSON.stringify(newData));
                    delete tempNew.lastUpdated;
                    if (!_.isEqual(tempCurrent, tempNew)) {
                        debugPrint('tempCurrent is outdated, updating');
                        service.model = newData;
                        _dataCb(service.model);
                    }
                    else {
                        debugPrint("service still has the most recent, not updating");
                    }
                    break;
            }
        }

        service.updateTwitterQuery = function(paramsArr){
            var query = "";

            paramsArr.forEach(function(param){
                query += param.method + param.query + " OR ";
            })
            query = encodeURIComponent(query.trim());
            query += '&lang=' + TWITTER_LANGUAGE;
            query += '&result_type=' + TWITTER_RESULT_TYPE;
            query += '&include_entities=' + TWITTER_INCLUDE_ENTITIES;

            return $http.post( API_PATH + 'scrape/'+ _appName, { query: query });
        }

        return service;
    }
);