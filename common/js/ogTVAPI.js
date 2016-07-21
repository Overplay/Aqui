/****************************************************************************

 File:       ogControllerAPI.js
 Function:   Provides an angular service wrapper for inter-app communication
 Copyright:  Ourglass TV
 Date:       July 2016
 Author:     eadams

 This is an overhaul of the original optvAPILime.js that will not be based on polling
 Instead, the Android will interact directly with the client side javascript on the TV

 Functionality:
 1. There will be a global function that will be accessible to the Android box which will recieve updated information
 2. There will be a variety of convenience endpoints that coincide with TV application functionality
 ****************************************************************************/
const API_PATH = '/api';
var GLOBAL_UPDATE_TARGET = updateIfChanged;
var DATA_UPDATE_METHOD = 'objectEquality';

angular.module('ngOgTVApi', [])
    .factory('ogTVModel', function($http){
        //local variables
        var _appName;
        var _dataCb;

        var service = {model:{}};

        service.init = function(params){
            _appName = params.appName;
            _dataCb = params.dataCallback;

            if(!_appName || !_dataCb){
                errorPrint("missing either appName or dataCallback, initialization failure");
                _appName = _dataCb = undefined;
                return false;
            }
            //get the current state of the data
            $http.get(API_PATH + 'appdata/' + _appName).then(function(data){
                data = data.data;
                service.model = data;
                _dataCb(service.model);
            })
            
        };

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
        
        function debugPrint(args){
            $log.debug("ogTVAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
        }

        function errorPrint(args){
            $log.error("ogTVAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
        }
        return service;
    });