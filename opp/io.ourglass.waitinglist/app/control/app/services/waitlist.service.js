/**
 * Created by mkahn on 11/5/16.
 */

app.factory( 'waitList', function ( $log, $http, $timeout, $rootScope, ogControllerModel, $q ) {

    $log.debug( "Loading waitlist service." );
    
    var _fetched = false;
    
    var service = {};

    var _currentList;

    /**
     * Factory method for generic party object. Don't use new Party()!
     * @param params
     * @returns {{name: (*|string), partySize: *, phone: (*|boolean), dateCreated: (*|Date), tableReady: (*|boolean)}}
     * @constructor
     */
    function Party(params){

        // Check if called with name, size
        if (arguments.length > 1 && _.isString(arguments[0])){
            params = { name: arguments[0], partySize: arguments[1] };
        }
        
        return {
            name: params && params.name,
            partySize: params && params.partySize,
            phone: params && params.phone, 
            dateCreated: ( params && params.dateCreated ) || new Date(),
            tableReady : ( params && params.tableReady ) || false
        }
        
    }
    
    service.newParty = function(params){
        return Party(params);
    }

    function notify() {
        $rootScope.$broadcast( 'MODEL_CHANGED' );
    }

    function handleUpdate( newModel ) {
        $log.debug( "Got a remote model update" );
        // TODO merge with local model
    }


    function updateRemoteModel() {
        ogControllerModel.model.parties = _currentList;
        ogControllerModel.save();
        notify();
    }

    /**
     * Adds a party to the waiting list.  Returns true is added, false if that same name is in
     * the list.
     * @param party
     */
     service.addParty = function( party ) {
         
         var idx = _.findIndex(_currentList, { name: party.name });
         
         if ( idx< 0 ){
             _currentList.push( Party( party ) );
             updateRemoteModel();
             return true;  // should return false if it fails
         }
        
        return false;
         
    }

    /**
     * Removes a party from the waiting list.  Returns true is success, false if that same name is not in
     * the list.
     * @param party
     */
     service.removeParty = function( party ) {

         _.remove( _currentList, function(p){
            return p.name == party.name;
        });

        updateRemoteModel();
        return true;
    }
    
    service.sitParty = function( party ) {
        
        if ( party.tableReady ){
            service.removeParty( party );
        } else {
            party.tableReady = new Date();
        }
        
        updateRemoteModel();
    }

    service.loadTestData = function( persistRemote ) {

        service.addParty( Party("John", 5) );
        service.addParty( Party("José", 4 ) );
        service.addParty( Party("Frank", 2 ));
        service.addParty( Party("Jane", 3 ) );
        service.addParty( Party( "Calvin", 5 ) );
        service.addParty( Party( "Vivek", 4 ) );
        service.addParty( Party( "Robin", 2 ) );
        service.addParty( Party( "Jill", 3 ) );

        if ( persistRemote ) updateRemoteModel();

    }
    
    service.getCurrentList = function (){
        return _currentList;
    }

    ogControllerModel.init( {
        appName:      "io.ourglass.waitinglist",
        dataCallback: handleUpdate
    } );

    service.loadModel = function(){
    
        if (!_currentList){
            return ogControllerModel.loadModel()
                .then( function ( modelData ) {
                    _currentList = modelData.parties;
                    notify();
                    return _currentList;
                } );
        } else {
            return $q.when(_currentList);
        }
        
    }

    return service;

} );