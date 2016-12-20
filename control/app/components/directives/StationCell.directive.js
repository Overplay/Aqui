/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell',
    function ( $log, ogProgramGuide ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {


                scope.changeChannel = function () {
                    $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                    ogProgramGuide.changeChannel( scope.grid.channel.channelNumber );
                }


            }
        }
    }
);