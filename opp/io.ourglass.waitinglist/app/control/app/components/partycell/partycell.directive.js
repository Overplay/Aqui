/**
 * Created by mkahn on 11/5/16.
 */

app.directive( 'partyCell', function (waitList, $log, uibHelper) {

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
            
            scope.sit = function(){
                $log.debug("Sitting...");
                waitList.sitParty( scope.party );
            }
            
            scope.remove = function(){
                uibHelper.confirmModal( "Remove?", "Are you sure you want to remove "+scope.party.name+" from the waiting list?", true )
                    .then( function(){
                        $log.debug( "Removing..." );
                        waitList.removeParty( scope.party );
                    })
                
            }
        }
    }

});