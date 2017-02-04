/**
 *
 * ogAPI2, a refactor of ogAPO
 * Based on work created by ethan on 8/31/16.
 *
 *
 * USAGE:
 *  import source
 *  inject 'ourglassAPI' intot he root app module
 *
 */


// This variable has to be in the global namespace so that the TV-side
// Javascript injection for updates works.
var GLOBAL_UPDATE_TARGET;

(function ( window, angular, undefined ) {

    var API_PATH = '/api/';
    var DATA_UPDATE_METHOD = 'objectEquality';

    var TWITTER_LANGUAGE = 'en';
    var TWITTER_RESULT_TYPE = 'popular';
    var TWITTER_INCLUDE_ENTITIES = 'false';

    //Helper with chaining Angular $http
    function stripData( response ) {
        return response.data;
    }


    angular.module( 'ourglassAPI', [] )

    // Advertising service
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

            service.getImgUrl = function ( adType ) {

                if ( _currentAd && _currentAd[ adType + 'Url' ] ) {
                    return _currentAd[ adType + 'Url' ]
                } else {

                    switch ( adType ) {

                        case "crawler":
                            return "/www/common/img/oglogo_crawler_ad.png";

                        case "widget":
                            return "/www/common/img/oglogo_widget_ad.png";

                        default:
                            throw Error( "No such ad type: " + adType );

                    }

                }

            }

            // Pre-load the first ad
            service.getCurrentAd()
                .then( function () {
                    $log.debug( "ogAds: advert loaded during startup" )
                } )

            return service;

        } )

        /***************************
         *
         * TV-Side app service
         *
         ***************************/
        .factory( 'ogAPItv', function ( $http, $log, $q ) {

            //local variables

            // unique name, like io.ourglass.cralwer
            var _appName;

            // Data callback when data on AB has changed
            var _dataCb;

            var service = { model: {} };

            service.init = function ( params ) {

                $log.debug( "Init called on TV side." );

                if ( !params.appName ) {
                    throw new Error( "appName parameter missing and is required." );
                }

                _appName = params.appName;
                $log.debug( "Init for app: " + _appName );


                if ( !params.modelCallback ) {
                    throw new Error( "modelCallback parameter missing and is required." );
                }
                _dataCb = params.modelCallback;

                // Set the global update target in the global namespace. This is called by JS injected from Android.
                // NOTE: This used to check for the model actually changing before doing the callback. But with the
                // JS injection technique, this method is only called in response to a POST by another app on AB.
                GLOBAL_UPDATE_TARGET = function ( newData ) {
                    service.model = newData;
                    _dataCb( service.model );
                };

                $log.debug( "Setting global update target: " + GLOBAL_UPDATE_TARGET );

                //get the current state of the data
                return getDataForApp( _appName )
                    .then( function ( model ) {
                        service.model = model;
                        $log.debug( "Got initial model value from AB: " + JSON.stringify( model ) + " for app " + _appName );
                        _dataCb( service.model );
                    } );

            };

            service.getTweets = function () {
                return getTweetsForApp( _appName );
            }

            service.getChannelTweets = function () {
                return getTweetsForChannel();
            };

            service.updateTwitterQuery = function ( paramsArr ) {
                return updateTwitterQueryForApp( _appName, paramsArr );
            };

            service.save = function () {
                return $http.post( API_PATH + 'appdata/' + _appName, service.model );
            };

            return service;

        } )

        /***************************
         *
         * Common (mobile and TV) app service
         *
         ***************************/
        .factory( 'ogAPI', function ( $http, $log, $interval ) {

            //local variables

            // unique name, like io.ourglass.cralwer
            var _appName;
            var _appType;
            
            var _lockKey;

            // Data callback when data on AB has changed
            var _dataCb;

            // Used for control side only, if it wants polling
            var _pollInterval;
            var _intervalRef;
            var DEFAULT_POLL_INTERVAL = 500;

            var service = { model: {} };

            function updateModel( newData){
                service.model = newData;
                if (_dataCb) _dataCb( service.model );
                return service.model;
            }

            function getDataForApp() {
                return $http.get( API_PATH + 'appdata/' + _appName )
                    .then( stripData );
            }

            function getDataForAppAndLock() {
                return $http.get( API_PATH + 'appdata/' + _appName + "?lock")
                    .then( stripData );
            }

            service.init = function ( params, poll ) {

                if (!params.appType){
                    throw new Error( "appType parameter missing and is required." );
                }

                _appType = params.appType;
                $log.debug( "Init called for app type: "+ _appType);

                if ( !params.appName ) {
                    throw new Error( "appName parameter missing and is required." );
                }

                _appName = params.appName;
                $log.debug( "Init for app: " + _appName );

                _dataCb = params.modelCallback;

                if ( _appType=='tv'){

                    if ( !params.modelCallback ) {
                        throw new Error( "modelCallback parameter missing and is required for tv mode." );
                    }

                    // Set the global update target in the global namespace. This is called by JS injected from Android.
                    // NOTE: This used to check for the model actually changing before doing the callback. But with the
                    // JS injection technique, this method is only called in response to a POST by another app on AB.
                    GLOBAL_UPDATE_TARGET = updateModel;
                    $log.debug( "Setting global update target: " + GLOBAL_UPDATE_TARGET );


                } else if ( _appType=='mobile'){

                    if ( poll && !params.modelCallback ) {
                        throw new Error( "modelCallback parameter missing and is required for polling." );
                    }

                    _pollInterval = params.pollInterval || DEFAULT_POLL_INTERVAL;

                    if ( poll ) {
                        startPolling();
                    } else {
                        $log.debug( "Not going to poll for data changes, that's on you!" );
                    }

                } else {
                    throw new Error("Illegal app type. Must be 'mobile' or 'tv'");
                }

            };

            service.getTweets = function(){
                return $http.get( API_PATH + 'scrape/' + _appName )
                    .then( stripData );
            }

            service.getChannelTweets = function () {
                return $http.get( API_PATH + 'scrape/io.ourglass.core.channeltweets' )
                    .then( stripData );
            };

            service.updateTwitterQuery = function ( paramsArr ) {
                var query = paramsArr.join( '+OR+' );
                return $http.post( API_PATH + 'scrape/' + _appName, { query: query } );
            };

            service.save = function () {
                var postModel = _.cloneDeep(service.model);
                postModel.lockKey = _lockKey || 0;
                return $http.post( API_PATH + 'appdata/' + _appName, postModel );
            };

            service.loadModel = function () {
                return getDataForApp()
                    .then( updateModel);
            };
            
            service.loadModelAndLock = function(){
                return getDataForAppAndLock()
                    .then( function(model){
                        if (!model.hasOwnProperty('lockKey'))
                            throw new Error("Could not acquire lock");
                            
                        _lockKey = model.lockKey;
                        model.lockKey = undefined;
                        return model;
                    })
                    .then(updateModel);
            };

            /**
             * performs a post to the move endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.move = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/move' );
            }

            /**
             * performs a post to the launch endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}         */
            service.launch = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/launch' );
            }

            /**
             * performs a post to the kill endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.kill = function ( appid ) {
                appid = appid || _appName;
                //should be able to return the promise object and act on it
                return $http.post( API_PATH + 'app/' + appid + '/kill' );
            }

            /**
             * posts up an SMS message request
             * @param args
             */
            service.sendSms = function ( phoneNumber, message ) {
                //TODO need to implement the endpoint in AB and need some security...
                return $http.post( API_PATH + 'app/' + appid + '/notify', {
                    phoneNumber: phoneNumber,
                    message:     message
                } );
            }

            /**
             * 
             * @param email should be { to: emailAddr, emailbody: text }
             * @returns {HttpPromise}
             */
            service.sendSpam = function(email){
                return $http.post( API_PATH + 'spam', email );
            }

            /**
             * function which controls the polling for the associated model
             * records the intervalReference so that it can be cancelled later in kill()
             */
            function startPolling() {
                $log.debug( "Beginning data polling" );
                _intervalRef = $interval( function () {
                    $http.get( API_PATH + 'appdata/' + _appName )
                        .then(stripData)
                        .then( updateIfChanged )
                        .catch( function ( err ) {
                            $log.error( "Error polling model data!" );
                        } );
                }, _pollInterval );
            }

            /**
             * function which updates the model in service if the newData passes the criteria of the DATA_UPDATE_METHOD
             * @param newData - data to compare to the service.model and potentially replace it
             */
            function updateIfChanged( newData ) {
                switch ( DATA_UPDATE_METHOD ) {
                    case 'lastUpdated':
                        if ( !service.model.lastUpdated || newData.lastUpdated > service.model.lastUpdated ) {
                            $log.debug( "service has old data, updating" );
                            service.model = newData;
                            _dataCb( service.model );
                        }
                        else {
                            $log.debug( "service still has the most recent, not updating" );
                        }
                        break;
                    case 'objectEquality':
                        //need to first make copies with no lastUpdated
                        var tempCurrent = JSON.parse( JSON.stringify( service.model ) );
                        delete tempCurrent.lastUpdated;
                        var tempNew = JSON.parse( JSON.stringify( newData ) );
                        delete tempNew.lastUpdated;
                        if ( !_.isEqual( tempCurrent, tempNew ) ) {
                            $log.debug( 'tempCurrent is outdated, updating' );
                            service.model = newData;
                            _dataCb( service.model );
                        }
                        else {
                            $log.debug( "service still has the most recent, not updating" );
                        }
                        break;
                }
            }


            return service;

        } )

        /**
         * Control App Side
         */
        .factory( 'ogAPIMobile', function ( $http, $log, $interval ) {

            //local variables
            var _appName;
            var _pollInterval;
            var _dataCb;
            var _intervalRef;

            var DEFAULT_POLL_INTERVAL = 500;
            var service = { model: {} };

            /**
             * function to initialize the service model,
             * @param params
             * @param [poll] pass in true to start polling
             */
            service.init = function ( params, poll ) {

                $log.debug( "Init called on Mobile side." );

                if ( !params.appName ) {
                    throw new Error( "appName parameter missing and is required." );
                }

                _appName = params.appName;
                $log.debug( "Init for app: " + _appName );


                if ( !params.modelCallback ) {
                    throw new Error( "modelCallback parameter missing and is required." );
                }

                _dataCb = params.modelCallback;

                _pollInterval = params.pollInterval || DEFAULT_POLL_INTERVAL;

                if ( poll ) {
                    startPolling();
                } else {
                    $log.debug("Not going to poll for data changes, that's on you!");
                }

            }

            /**
             * saves the current state of the application
             * @returns {HttpPromise}
             */
            service.save = function () {
                return $http.post( API_PATH + 'appdata/' + _appName, service.model );
            }

            /**
             *
             */
            service.loadModel = function () {
                return getDataForApp( _appName )
                    .then( function ( response ) {
                        service.data = response.data;
                        return service.data;
                    } );
            };

            /**
             * performs a post to the move endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.move = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/move' );
            }

            /**
             * performs a post to the launch endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}         */
            service.launch = function ( appid ) {
                appid = appid || _appName;
                return $http.post( API_PATH + 'app/' + appid + '/launch' );
            }

            /**
             * performs a post to the kill endpoint for either the current app or the appid that is passed in
             * @param [appid] the app to move, if not included, then move the _appName
             * @returns {HttpPromise}
             */
            service.kill = function ( appid ) {
                appid = appid || _appName;
                //should be able to return the promise object and act on it
                return $http.post( API_PATH + 'app/' + appid + '/kill' );
            }

            /**
             * posts up an SMS message request
             * @param args
             */
            service.sendSms = function ( phoneNumber, message ) {
                //TODO need to implement the endpoint in AB and need some security...
                return $http.post( API_PATH + 'app/' + appid + '/notify', {
                    phoneNumber: phoneNumber,
                    message:     message
                } );

            }

            /**
             * function which controls the polling for the associated model
             * records the intervalReference so that it can be cancelled later in kill()
             */
            function startPolling() {
                $log.debug( "Beginning data polling" );
                _intervalRef = $interval( function () {
                    $http.get( API_PATH + 'appdata/' + _appName )
                        .then( function ( data ) {
                            data = data.data;
                            updateIfChanged( data );
                        })
                        .catch(function(err){
                            $log.error("Error polling model data!");
                        });
                }, _pollInterval );
            }

            /**
             * function which updates the model in service if the newData passes the criteria of the DATA_UPDATE_METHOD
             * @param newData - data to compare to the service.model and potentially replace it
             */
            function updateIfChanged( newData ) {
                switch ( DATA_UPDATE_METHOD ) {
                    case 'lastUpdated':
                        if ( !service.model.lastUpdated || newData.lastUpdated > service.model.lastUpdated ) {
                            $log.debug( "service has old data, updating" );
                            service.model = newData;
                            _dataCb( service.model );
                        }
                        else {
                            $log.debug( "service still has the most recent, not updating" );
                        }
                        break;
                    case 'objectEquality':
                        //need to first make copies with no lastUpdated
                        var tempCurrent = JSON.parse( JSON.stringify( service.model ) );
                        delete tempCurrent.lastUpdated;
                        var tempNew = JSON.parse( JSON.stringify( newData ) );
                        delete tempNew.lastUpdated;
                        if ( !_.isEqual( tempCurrent, tempNew ) ) {
                            $log.debug( 'tempCurrent is outdated, updating' );
                            service.model = newData;
                            _dataCb( service.model );
                        }
                        else {
                            $log.debug( "service still has the most recent, not updating" );
                        }
                        break;
                }
            }

            service.updateTwitterQuery = function ( paramsArr ) {

                return updateTwitterQueryForApp( _appName, paramsArr );

            }


            return service;
        } )

        .factory( 'ogProgramGuide', function ( $http, $log, $interval ) {

            var service = {};

            service.getNowAndNext = function () {
                return $http.get( API_PATH + 'tv/currentgrid' )
                    .then(stripData);
            }

            service.changeChannel = function ( channelNum ) {
                return $http.post( API_PATH + 'tv/change/' + channelNum );
            }

            return service;
        } )

        .directive( 'ogAdvert', function ( $log, ogAds, $interval, $timeout ) {
            return {
                restrict: 'E',
                template: '<img width="100%" height="100%" style="-webkit-transition: opacity 0.5s; transition: opacity 0.5s;" ' +
                          'ng-style="adstyle" ng-src=\"{{adurl}}\"/>',
                link:     function ( scope, elem, attrs ) {

                    var interval = parseInt( attrs.interval ) || 15000;
                    var adType = attrs.type || 'widget';
                    var intervalPromise;

                    scope.adstyle = { opacity: 0.0 };

                    if ( adType != 'widget' && adType != 'crawler' ) {
                        throw Error( "Unsupported ad type. Must be widget or crawler" )
                    }

                    function update() {

                        scope.adstyle.opacity = 0;
                        $timeout( function () {
                            scope.adurl = ogAds.getImgUrl( adType );
                            scope.adstyle.opacity = 1;
                            // HACK ALERT...let's trigger a new ad load
                            $timeout( ogAds.getNextAd, 200 );

                        }, 1200 );

                    }

                    update();

                    intervalPromise = $interval( update, interval );

                }
            }

        } )

        .directive( 'ogAdvertisement', function () {
            return {
                restrict:   'E',
                scope:      {
                    type: '@'
                },
                template:   '<img width="100%" ng-src=\"{{adurl}}\">',
                controller: function ( $scope, $http ) {

                    var ipAddress = "http://localhost";

                    try {
                        console.log( $scope.type );
                    } catch ( e ) {
                    }
                    try {
                        console.log( scope.type );
                    } catch ( e ) {
                    }

                    if ( !currentAd ) {
                        $http.get( ipAddress + ":9090" + "/api/ad" ).then( function ( retAd ) {
                            currentAd = retAd.data;
                            console.log( currentAd );
                            setCurrentAdUrl();
                        } )
                    } else {
                        setCurrentAdUrl();
                    }
                    function setCurrentAdUrl() {
                        console.log( $scope );
                        console.log( $scope.type );
                        if ( $scope.type == 'widget' ) {
                            console.log( '1' );
                            console.log( ipAddress + " " + ":9090" + " " + currentAd.widgetUrl );
                            $scope.adurl = ipAddress + ":9090" + currentAd.widgetUrl;
                        }
                        else if ( $scope.type == 'crawler' ) {
                            $scope.adurl = ipAddress + ":9090" + currentAd.crawlerUrl;
                        }

                        console.log( $scope.adurl );
                    }
                }
            }
        } )

        .directive( 'ogAppHeader', function () {
            return {
                link:        function ( scope, elem, attr ) {
                    scope.name = attr.name || "Missing Name Attribute";
                },
                templateUrl: 'ogdirectives/appheader.html'
            };
        } )

        .directive( 'ogFallbackImg', function ( $log ) {
            return {
                restrict: 'A',
                link:     function ( scope, element, attrs ) {

                    element.bind( 'error', function () {
                        $log.debug( "Source not found for image, using fallback" );
                        attrs.$set( "src", attrs.ogFallbackImg );
                    } );

                }
            }
        } )

        .directive( 'ogHud', [ "$log", "$timeout", function ( $log, $timeout ) {
            return {
                scope:       {
                    message:      '=',
                    dismissAfter: '@',
                    issue:        '='
                },
                link:        function ( scope, elem, attr ) {

                    scope.ui = { show: false };

                    scope.$watch( 'issue', function ( nval ) {
                        if ( nval ) {
                            $log.debug( 'firing HUD' );
                            scope.ui.show = true;
                            $timeout( function () {
                                scope.ui.show = false;
                                scope.issue = false;
                            }, scope.dismissAfter || 2000 );
                        }
                    } );

                },
                templateUrl: 'ogdirectives/hud.html'
            };
        } ] )

        .controller( 'Controller', [ '$scope', function ( $scope ) {
        } ] );
    var currentAd;
})( window, window.angular );

angular.module( "ourglassAPI" ).run( [ "$templateCache",
    function ( $templateCache ) {

        // HUD
        $templateCache.put( 'ogdirectives/hud.html',
            '<div ng-if="ui.show" style="width: 100vw; height: 100vh; background-color: rgba(30,30,30,0.25);">' +
            // '<div style="margin-top: 30vh; width: 100vw;"> <img src="/www/common/img/box.gif"/></div>' +
            '<div style="margin-top: 40vh; width: 100vw; text-align: center;"> {{ message }}</div>' +
            '</div>' );

        $templateCache.put( 'ogdirectives/appheader.html', '<style>.ogappheader{display:table;' +
            'font-size:2em;font-weight:bold;height:60px;margin:0 0 10px 0}' +
            '.ogappheadertext{display:table-cell;vertical-align:middle}' +
            '.ogappheaderside{height:60px;width:20px;background-color:#21b9e6;float:left;margin-right:10px}</style>' +
            '<div class="ogappheader"><div class="ogappheaderside"></div>' +
            '<div class="ogappheadertext">{{name | uppercase}}</div></div>' );

    } ] );