/****************************************************************************

 File:       optvAPILime.js
 Function:   Provides an angular service wrapper for inter-app communication
 Copyright:  Overplay TV
 Date:       May 2016
 Author:     mkahn

 This version talks to AmstelBrightServer on Android ONLY

 ****************************************************************************/


angular.module( 'ngOpTVApi', [] )
    .factory( 'optvModel', function ( $http, $log, $timeout ) {

        var POLL_INTERVAL_MS = 2000;  //medium
        var apiPath = '/api/';
        var DATA_UPDATE_METHOD = "objectEquality";
        var DEBUG = true;

        var service = { model: {} };

        //EA - if running in FourLoko, then modify the apiPath
        if(window && window.process && window.process.execPath && window.process.execPath.includes("FourLoko")){
            apiPath = 'http://localhost:4000' + apiPath;
        }

        service.apiPath = apiPath;

        //Callback for AppData updates
        var _dataCb;
        var _appName;
        var _initialValue;
        var _pollInterval;

        //HTTP Mode stuff
        var appWatcher;

        function logLead() { return "optvAPILime (" + _appName + "): " };

        function dbout(msg){
            if (DEBUG){
                $log.debug( logLead() + msg);
            }
        }
            
        function setInitialAppDataValueHTTP() {

            service.model = _initialValue;

            $http.post( apiPath + 'appdata/' + _appName, _initialValue )
                .then( function ( data ) {
                    $log.debug( logLead() + " initial value POSTed via HTTP." )
                    startDataPolling();
                })
                .catch( function ( err ){
                    $log.error( logLead() + " initial value POSTed via HTTP FAILED!!!! [FATAL]" );
                });

        }
        
        function AppDataWatcher() {

            this.running = true;
            this.lastUpdated = 0;
            var _this = this;

            function updateIfChanged( data ) {

                switch (DATA_UPDATE_METHOD){

                    case "lastUpdated":
                        if ( data.lastUpdated > _this.lastUpdated ) {
                            _this.lastUpdated = data.lastUpdated;
                            service.model = data;
                            _dataCb( service.model );
                        }
                    break;

                    case "objectEquality":
                        dbout("checking for data model change");
                        if( !_.isEqual(service.model, data) ) { // Returns false when angular.equals returns true... suspicious -- $$hashKey is added by angular -- to fix, add
  // 'track by $index' in your ngRepeat
                        // if( !angular.equals(service.model, data) ) {
                            service.model = data;
                            _dataCb( service.model );
                        }
                    break;

                }
            }

            // TODO should probably replace with $interval
            this.poll = function () {

                $timeout( function () {

                    dbout("wasteful model poll starting");
                    $http.get( apiPath + 'appdata/' + _appName+"?dt="+new Date().getTime(), { cache: false } )
                        .then( function ( data ) {
                            updateIfChanged( data.data );
                            if ( _this.running ) _this.poll();
                        })
                        .catch( function (err){
                            $log.error( logLead() + " couldn't poll model!" );
                            if ( _this.running ) _this.poll();
                        });


                }, _pollInterval );

            }
        }


        function startDataPolling() {
            $log.info( logLead() + " starting data polling." );
            appWatcher = new AppDataWatcher();
            appWatcher.poll();
        }

        service.init = function ( params ) {

            _appName = params.appName;
            _dataCb = params.dataCallback;
            _initialValue = params.initialValue || {};
            _pollInterval = params.pollInterval || POLL_INTERVAL_MS;

            if (params.pollInterval){
                $log.debug("Non-default poll interval set: "+_pollInterval);
            }

            $log.debug( "optvAPILime init for app: " + _appName );

            if ( _dataCb || _initialValue ) {

                $http.get( apiPath + 'appdata/' + _appName )
                    .then( function ( data ) {


                        if ( _.isEmpty( data.data ) && !_.isEmpty( _initialValue )){
                            dbout( "got an empty object response on initial read of model" );
                            setInitialAppDataValueHTTP();
                        }
                        else {
                            dbout( "model data (appData) already existed via http." + data.data );
                            service.model = data.data;
                            _dataCb(service.model);
                            startDataPolling();
                        }
                    })
                    .catch( function(err){
                        dbout("model data not in DB, creating via http" );
                        setInitialAppDataValueHTTP();
                    });

                $log.debug( "optvAPILime init app: " + _appName + " subscribing to data" );

            }

        }

        
        service.save = function () {

            // This is a POST because NanoHTTPD seems to hide PUT verb data
            return $http.post( apiPath + 'appdata/' + _appName, service.model );

        };

        /**
         * Request app be moved between slots
         * @returns {promise that returns slot Id}
         */
        service.moveApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + 'app/' + appid +"/move");

        };
        
        /**
         * Request app be launched
         * @returns {promise}
         */
        service.launchApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + 'app/' + appid + '/launch');

        };

        /**
         * Request app be killed
         * @returns {promise}
         */
        service.killApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + 'app/' + appid + '/kill' );

        };


        service.setTwitterQuery = function(twitterQuery){

            return $http.post( apiPath + 'scrape/'+ _appName, { query: twitterQuery });

        }

        function stripData( response  ) {
            return response.data;
        }

        service.getTweets = function ( ) {

            return $http.get( apiPath + 'scrape/' + _appName )
                .then(stripData);

        }

        return service;

    }
)

