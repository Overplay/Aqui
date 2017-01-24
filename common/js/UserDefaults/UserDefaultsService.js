/**
 * Created by mkahn on 1/24/15.
 */
(function (window, angular, undefined) {

    'use strict';

    angular.module('userdefaults.service', [])
        .factory('userDefaults', [
                     '$log', '$q',
                     function ($log, $q) {

                         var service = {};

                         service.debug = true; // for now

                         service._unitFlag = "Hello Jasmine!";

                         function ukey(key){

                            return "UD-"+key;

                         }

                         service.clear = function(key){
                            localStorage.removeItem(ukey(key));
                         }

                         service.setObjectForKey = function(key, obj){

                            var jsonObject = JSON.stringify(obj);
                            localStorage.setItem(ukey(key), jsonObject);

                         }

                         service.getObjectForKey = function(key, defaultValue){

                            var jsonObject = localStorage.getItem(ukey(key));

                            if (jsonObject){
                                return JSON.parse(jsonObject);
                            } else {
                                return defaultValue || undefined;
                            }

                         }

                         service.setBoolForKey = function(key, bool){

                            localStorage.setItem(ukey(key), bool ? '1':'-1');

                         }

                         service.getBoolForKey = function(key, defaultValue){

                            var boolVal = localStorage.getItem(ukey(key));

                            if (boolVal){
                                return parseInt(boolVal)>0;  //not a typo, extracts the truthiness
                            } else {
                                if (defaultValue!==undefined){
                                    return defaultValue;
                                } else {
                                    return undefined;
                                }
                            }

                         }

                         service.setIntForKey = function(key, intVal){

                            localStorage.setItem(ukey(key),intVal);

                         }

                         service.getIntForKey = function(key, defaultValue){

                            var stringObj = localStorage.getItem(ukey(key));

                            if (stringObj){
                                return parseInt(stringObj);
                            } else {
                                return defaultValue || undefined;
                            }

                         }

                         service.setStringForKey = function(key, stringVal){

                            localStorage.setItem(ukey(key),stringVal);

                         }

                         service.getStringForKey = function(key, defaultValue){

                            var stringObj = localStorage.getItem(ukey(key));

                            if (stringObj){
                                return stringObj;
                            } else {
                                return defaultValue || undefined;
                            }

                         }


                         return service;

                     }])

})(window, window.angular);