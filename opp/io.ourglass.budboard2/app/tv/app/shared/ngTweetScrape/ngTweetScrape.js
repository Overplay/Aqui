/****************************************************************************

 File:       ngTweetScrape.js
 Function:   Provides an angular service wrapper for Twitter scraping
 Copyright:  Mitch Kahn
 Date:       2/17/2016
 Author:     mkahn

 ****************************************************************************/


angular.module( 'ngTweetScrape', [] )
    .factory( 'tweetScrape', function ( $http, $log, $q ) {


            var LIBRARY = 'codebird';

            var _apiKey, _apiSecret, _apiConcat, _apiB64;
            var _bearerToken;
            var _authorized = false;

            var service = { name: 'tweetScrape', delink: true };

            service.init = function ( initObj ) {

                _apiKey = initObj.apiKey;
                _apiSecret = initObj.apiSecret;
                _apiConcat = _apiKey + ':' + _apiSecret;
                _apiB64 = Base64.encode( _apiConcat );


            };

            //Use Codebird until we do out own proxy
            if ( LIBRARY == 'codebird') {

                var cb = new Codebird;

                service.authorize = function(){

                    cb.setConsumerKey(_apiKey, _apiSecret);

                    return $q( function(res, rej){

                        cb.__call(
                            "oauth2_token",
                            {},
                            function ( reply, err ) {

                                if ( err ) {
                                    $log.error( "Codebird error response or timeout exceeded on getting bearer token." + err.error );
                                    rej( "Codebird error response or timeout exceeded on getting bearer token." + err.error);
                                }
                                if ( reply ) {
                                    _bearerToken = reply.access_token;
                                    $log.debug( "Codebird got a bearer token." );
                                    res(true);
                                }
                            }
                        );


                    })

                }


                service.searchTweets = function( params ){

                    return $q(function(res, rej){

                        cb.__call(
                            "search_tweets",
                            params,
                            function ( reply, rate, err ) {

                                $log.debug('Inbound tweet struct: ');
                                $log.debug( angular.toJson(reply, true));


                                if (!err){
                                    if (!reply.statuses || reply.statuses.length == 0){
                                        res([]);
                                    } else {
                                        var rval = [];
                                        reply.statuses.forEach( function(t){
                                            var cleaned = t.text.replace( /&amp;/g, '&' );
                                            if (service.delink){
                                                cleaned = cleaned.replace( /(?:https?|ftp):\/\/[\n\S]+/g, '');
                                            }
                                            rval.push(cleaned);
                                        });
                                        res(rval);
                                    }

                                } else {
                                    $log.error("Codebird flew into the window getting tweets: "+err);
                                    rej(err);
                                }
                                res(reply);
                            }
                        );

                    });

                }


            } else {

                //this will not work due to Twitter CORS

                service.authorize = function () {

                    var req = {
                        method:  "POST",
                        url:     "https://api.twitter.com/oauth2/token",
                        headers: {
                            "Content-Type":  "application/x-www-form-urlencoded;charset=UTF-8",
                            "Authorization": "Basic " + _apiB64
                        },
                        data:    { grant_type: "client_credentials" }
                    }

                    return $http( req )
                        .then( function ( data ) {

                                $log.debug( "TweetScrape authorized ok" );
                                _authorized = true;
                                return true;
                            },
                            function ( err ) {

                                $log.error( "TweetScrape could not authorize" );
                                _authorized = false;
                                return false;

                            } );

                }



            }



            return service;

        }
    )

