/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell', 
    function ( $log, $http, $rootScope ) {
        return {
            restrict:    'E',
            scope:       {
                station: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {

                scope.running = attrs.running;

                scope.openController = function () {
                    window.location.href = "/www/opp/" + app.appId + '/app/control/index.html?name=' + app.appName;
                };
                
                scope.launch = function(){
                    $http.post( "/api/app/" + scope.app.appId + '/launch', {} )
                        .then( function ( data ) {
                            $log.debug('Launch done')
                            $rootScope.$broadcast('RELOAD_APPS')
                        } );
                }

                scope.move = function () {
                    $http.post( "/api/app/" + scope.app.appId + '/move', {} )
                        .then( function ( data ) {
                            $log.debug( 'Move done' )
                        } );
                }

                scope.kill = function () {
                    $http.post( "/api/app/" + scope.app.appId + '/kill', {} )
                        .then( function ( data ) {
                            $log.debug( 'Move done' )
                            $rootScope.$broadcast( 'RELOAD_APPS' )
                        } );
                }
                
                scope.control = function(){
                    window.location.href = "/www/opp/" + scope.app.appId + '/app/control/index.html?name=' + scope.app.appName;
                }
                
            }
        }
    } 
);