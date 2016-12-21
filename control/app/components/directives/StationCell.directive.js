/**
 * Created by mkahn on 9/22/16.
 */

app.directive( 'stationCell',
    function ( $log, ogProgramGuide ) {
        return {
            restrict:    'E',
            scope:       {
                grid: '=',
                search: '='
            },
            templateUrl: 'app/components/directives/stationcell.template.html',
            link:        function ( scope, elem, attrs ) {


                scope.changeChannel = function () {
                    $log.debug( "Changing channel to: " + scope.grid.channel.channelNumber );
                    ogProgramGuide.changeChannel( scope.grid.channel.channelNumber );
                }

                scope.displayTime = function ( timeStr) {

                    var date = new Date(Date.parse(timeStr));
                    var hour = (date.getHours() > 12 ? date.getHours() - 12 : date.getHours());
                    var min = date.getMinutes();

                    return hour + ':' + (min < 10 ? '0' + min : min);
                }


            }
        }
    }
);