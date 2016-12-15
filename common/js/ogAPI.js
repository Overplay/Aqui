/**
 * Created by ethan on 8/31/16.
 */

var GLOBAL_UPDATE_TARGET;

(function (window, angular, undefined) {

    'use strict';

    var API_PATH = '/api/';
    var DATA_UPDATE_METHOD = 'objectEquality';

    var TWITTER_LANGUAGE = 'en';
    var TWITTER_RESULT_TYPE = 'popular';
    var TWITTER_INCLUDE_ENTITIES = 'false';
    
    angular.module('ourglassAPI', [])

        .factory( 'ogAds', function ( $http, $log, $q ) {

            var _currentAd;
            var service = {};
            
            service.getNextAd = function () {

                return $http.get( API_PATH + "ad" )
                    .then( function ( data ) {
                        _currentAd = data.data;
                        return _currentAd;
                    } )

            }

            service.getCurrentAd = function () {

                if ( _currentAd ) {
                    return $q.resolve( _currentAd )
                } else {
                    return service.getNextAd();
                }

            }

            service.getImgUrl = function(adType){

                if (_currentAd && _currentAd[adType+'Url']){
                    return _currentAd[ adType + 'Url' ]
                } else {

                    switch (adType){

                        case "crawler":
                            return "/www/common/img/oglogo_crawler_ad.png";

                        case "widget":
                            return "/www/common/img/oglogo_widget_ad.png";

                        default:
                            throw Error("No such ad type: "+adType);

                    }

                }

            }

            service.getCurrentAd()
                .then( function( ca ){
                    $log.debug("ogAds: advert loaded during startup")
                })
            
            return service;
            
        })

    /***************************
     *
     * TV-Side app service
     *
     ***************************/
        .factory('ogTVModel', function ($http, $log, $q) {

            //local variables
            var _appName;
            var _dataCb;
            var _currentAd;

            var service = {model: {}};

            service.init = function (params) {
                _appName = params.appName;
                _dataCb = params.dataCallback;

                if (!_appName || !_dataCb) {
                    errorPrint("missing either appName or dataCallback, initialization failure");
                    _appName = _dataCb = undefined;
                    return false;
                }

                //get the current state of the data
                var prom = $http.get(API_PATH + 'appdata/' + _appName).then(function (data) {
                    data = data.data;
                    service.model = data;
                    _dataCb(service.model);
                });

                GLOBAL_UPDATE_TARGET = updateIfChanged;
                console.log(GLOBAL_UPDATE_TARGET);

                return prom;
            };

            service.getTweets = function () {
                var endpoint = API_PATH + 'scrape/' + _appName;
                return $http.get(endpoint)
                    .then(stripData);
            };

            service.getChannelTweets = function () {
                return $http.get(API_PATH + 'scrape/io.ourglass.core.channeltweets')
                    .then(stripData);
            };

            service.getChannelInfo = function () {
                return $http.get(API_PATH + 'system/channel')
                    .then(stripData);
            };

            service.updateTwitterQuery = function (paramsArr) {
                var query = "";

                paramsArr.forEach(function (param) {
                    query += param.method + param.query + " OR ";
                })
                query = encodeURIComponent(query.trim());
                query += '&lang=' + TWITTER_LANGUAGE;
                query += '&result_type=' + TWITTER_RESULT_TYPE;
                query += '&include_entities=' + TWITTER_INCLUDE_ENTITIES;

                return $http.post(API_PATH + 'scrape/' + _appName, {query: query});
            }

            function stripData(response) {
                return response.data;
            }

            /**
             * function which updates the model in service if the newData passes the criteria of the DATA_UPDATE_METHOD
             * @param newData - data to compare to the service.model and potentially replace it
             */
            function updateIfChanged(newData) {
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

            function debugPrint(args) {
                $log.debug("ogTVAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
            }

            function errorPrint(args) {
                $log.error("ogTVAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
            }

            service.save = function () {
                return $http.post( API_PATH + 'appdata/' + _appName, service.model );
            }


            return service;
        })

        /**
         * Control App Side
         */
        .factory('ogControllerModel', function ($http, $log, $interval) {
        
            //local variables
            var _appName;
            var _pollInterval;
            var _dataCb;
            var _intervalRef;

            var DEFAULT_POLL_INTERVAL = 500;
            var service = {model: {}};

            /**
             * function to initialize the service model,
             * TV's should never, never poll since the device handles this automatically
             * Controllers on the other hand should poll if there is information in their view which needs to be updated
             * @param params
             * @param [noPoll] pass in true to disable polling
             */
            service.init = function (params, poll) {
                
                if (params.initialValue) {
                    $log.error("initialValue is deprecated, set this field in the info.json instead");
                    throw new Error( "initialValue is deprecated, set this field in the info.json instead");
                }

                _appName = params.appName;
                _pollInterval = params.pollInterval || DEFAULT_POLL_INTERVAL;
                _dataCb = params.dataCallback;

                if (poll) {
                    startPolling();
                }

            }

            /**
             * saves the current state of the application
             * @returns {HttpPromise}
             */
            service.save = function () {
                return $http.post(API_PATH + 'appdata/' + _appName, service.model);
            }

            /**
             * 
             */
             service.loadModel = function(){
                 return $http.get( API_PATH + 'appdata/' + _appName )
                    .then( function ( response ) {
                        service.data = response.data;
                        return service.data;
                    });
             }

            /**
             * performs a post to the move endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.move = function (appid) {
                appid = appid || _appName;
                return $http.post(API_PATH + 'app/' + appid + '/move');
            }

            /**
             * performs a post to the launch endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}         */
            service.launch = function (appid) {
                appid = appid || _appName;
                return $http.post(API_PATH + 'app/' + appid + '/launch');
            }

            /**
             * performs a post to the kill endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.kill = function (appid) {
                appid = appid || _appName;
                //should be able to return the promise object and act on it
                return $http.post(API_PATH + 'app/' + appid + '/kill').then(function (data) {
                    //kill the poll
                    $interval.cancel(_intervalRef);
                });
            }

            /**
             * posts up an SMS message request
             * @param args
             */
            service.sendSms = function (phoneNumber, message){
                //TODO need to implement the endpoint in AB and need some security...
                return $http.post(API_PATH + 'app/' + appid + '/notify', { phoneNumber: phoneNumber, message: message });

            }


            //convenience methods
            function debugPrint(args) {
                $log.debug("ogControllerAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
            }

            function errorPrint(args) {
                $log.error("ogControllerAPI (" + _appName + "): ", Array.prototype.slice.call(arguments));
            }

            /**
             * function which controls the polling for the associated model
             * records the intervalReference so that it can be cancelled later in kill()
             */
            function startPolling() {
                debugPrint("beginning polling");
                _intervalRef = $interval(function () {
                    $http.get(API_PATH + 'appdata/' + _appName).then(function (data) {
                        data = data.data;
                        updateIfChanged(data);
                    }, errorPrint);
                }, _pollInterval);
            }

            /**
             * function which updates the model in service if the newData passes the criteria of the DATA_UPDATE_METHOD
             * @param newData - data to compare to the service.model and potentially replace it
             */
            function updateIfChanged(newData) {
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

            service.updateTwitterQuery = function (paramsArr) {

                var query = "";

                query = paramsArr.join('+OR+');

                //query = encodeURIComponent(query.trim());
                // query += '&lang=' + TWITTER_LANGUAGE;
                // query += '&result_type=' + TWITTER_RESULT_TYPE;
                // query += '&include_entities=' + TWITTER_INCLUDE_ENTITIES;

                return $http.post(API_PATH + 'scrape/' + _appName, {query: query});
            }




            return service;
        })

        .factory( 'ogProgramGuide', function ( $http, $log, $interval ) {

            var service = {};

            service.getNext4Listings = function(){

            }

            service.changeChannel = function ( channelNum ) {
                return $http.post( API_PATH + 'tv/change/'+channelNum );
            }

            return service;
        })

        .directive('ogAdvert', function( $log, ogAds, $interval, $timeout ) {
            return {
                restrict: 'E',
                template: '<img width="100%" height="100%" style="-webkit-transition: opacity 0.5s; transition: opacity 0.5s;" ' +
                          'ng-style="adstyle" ng-src=\"{{adurl}}\"/>',
                link: function( scope, elem, attrs ){
                
                    var interval = parseInt(attrs.interval) || 15000;
                    var adType = attrs.type || 'widget';
                    var intervalPromise;

                    scope.adstyle = { opacity: 0.0 };
                    
                    if (adType!='widget' && adType!='crawler'){
                        throw Error("Unsupported ad type. Must be widget or crawler")
                    }
                    
                    function update(){

                        scope.adstyle.opacity = 0;
                        $timeout(function(){ 
                            scope.adurl = ogAds.getImgUrl( adType ); 
                            scope.adstyle.opacity = 1;
                            // HACK ALERT...let's trigger a new ad load
                            $timeout( ogAds.getNextAd, 200 );

                        }, 1200);

                    }

                    update();

                    intervalPromise = $interval(update, interval);

                }
            }
        
        })

        .directive('ogAdvertisement', function () {
            return {
                restrict: 'E',
                scope: {
                    type: '@'
                },
                template: '<img width="100%" ng-src=\"{{adurl}}\">',
                controller: function ($scope, $http) {

                    var ipAddress = "http://localhost";

                    try {
                        console.log($scope.type);
                    } catch (e){}
                    try {
                        console.log(scope.type);
                    } catch (e){}

                    if (!currentAd) {
                        $http.get(ipAddress + ":9090" + "/api/ad").then(function (retAd) {
                            currentAd = retAd.data;
                            console.log(currentAd);
                            setCurrentAdUrl();
                        })
                    } else {
                        setCurrentAdUrl();
                    }
                    function setCurrentAdUrl(){
                        console.log($scope);
                        console.log($scope.type);
                        if($scope.type == 'widget'){
                            console.log('1');
                            console.log(ipAddress + " " + ":9090" + " " + currentAd.widgetUrl);
                            $scope.adurl = ipAddress + ":9090" + currentAd.widgetUrl;
                        }
                        else if($scope.type == 'crawler'){
                            $scope.adurl = ipAddress + ":9090" + currentAd.crawlerUrl;
                        }

                        console.log($scope.adurl);
                    }
                }
            }
        })

        .directive('ogAppHeader', function () {
            return {
                link: function (scope, elem, attr) {
                    scope.name = attr.name || "Missing Name Attribute";
                },
                templateUrl: 'ogdirectives/appheader.html'
            };
        })
        
        .directive('ogFallbackImg', function($log) {
                return {
                    restrict: 'A',
                    link:     function( scope, element, attrs ) {
                    
                        element.bind( 'error', function () {
                            $log.debug("Source not found for image, using fallback");
                            attrs.$set( "src", attrs.ogFallbackImg );
                         } );
                         
                    }
                }
            })

        .directive('ogHud', ["$log", "$timeout", function($log, $timeout){
            return {
                scope: {
                    message: '=',
                    dismissAfter: '@',
                    issue: '='
                },
                link: function ( scope, elem, attr ) {

                    scope.ui = { show: false };
                    
                    scope.$watch('issue', function(nval){
                        if (nval){
                            $log.debug('firing HUD');
                            scope.ui.show = true;
                            $timeout( function(){
                                scope.ui.show = false;
                                scope.issue = false;
                            }, scope.dismissAfter || 2000 );
                        }
                    });

                },
                templateUrl: 'ogdirectives/hud.html'
            };
        }])

        .controller('Controller', ['$scope', function($scope) {
        }]);
    var currentAd;
})(window, window.angular);

angular.module( "ourglassAPI" ).run( [ "$templateCache",
    function ( $templateCache ) {

        // HUD
        $templateCache.put( 'ogdirectives/hud.html',
        '<div ng-if="ui.show" style="width: 100vw; height: 100vh; background-color: rgba(30,30,30,0.25);">' +
        // '<div style="margin-top: 30vh; width: 100vw;"> <img src="/www/common/img/box.gif"/></div>' +
        '<div style="margin-top: 40vh; width: 100vw; text-align: center;"> {{ message }}</div>' +
        '</div>');
        
        $templateCache.put( 'ogdirectives/appheader.html','<style>.ogappheader{display:table;' +
            'font-size:2em;font-weight:bold;height:60px;margin:0 0 10px 0}' +
            '.ogappheadertext{display:table-cell;vertical-align:middle}' +
            '.ogappheaderside{height:60px;width:20px;background-color:#21b9e6;float:left;margin-right:10px}</style>' +
            '<div class="ogappheader"><div class="ogappheaderside"></div>' +
            '<div class="ogappheadertext">{{name | uppercase}}</div></div>' );
        
    }]);