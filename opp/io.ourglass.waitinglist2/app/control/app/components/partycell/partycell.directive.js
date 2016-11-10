/**
 * Created by mkahn on 11/5/16.
 */

app.directive( 'partyCell', function (waitList, $log) {

    return {
        restrict:    'E',
        scope:       {
            party: '='
        },
        templateUrl: 'app/components/partycell/partycell.template.html',
        link:  function ( scope, elem, attrs ) {

            scope.showControls = false;

            scope.tapped = function(){
                $log.debug("Doink");
                scope.showControls = !scope.showControls;
            }
        }
    }

});