/**
 * Created by mkahn on 11/5/16.
 */

app.factory('waitList', function($log, $http, $timeout, $rootScope, ogControllerModel){

    $log.debug("Loading waitlist service.");
    
    var _currentList = [];
    
    
    function handleUpdate(newModel){
        $log.debug("Got a remote model update");
        // TODO merge with local model
        
        $rootScope.$broadcast('MODEL_CHANGED');
    }

    function initialize() {

        ogControllerModel.init( {
            appName:      "io.ourglass.waitinglist",
            dataCallback: handleUpdate
        } );
        
    }
    
    function updateRemoteModel(){
        ogControllerModel.model.parties = _currentList;
        ogControllerModel.save();
    }

    /**
     * Adds a party to the waiting list.  Returns true is added, false if that same name is in
     * the list.
     * @param name
     * @param size
     */
    function addParty(name, size){
    
        // TODO: Erik, add a check to make sure no Party with the same name gets added 
        // Use Lodash
        
        _currentList.push({ name: name, 
                            partySize: size,
                            dateCreated: new Date(),
                            phone: undefined,
                            tableReady: false });
                            
        updateRemoteModel();
        
        return true;  // should return false if it fails
        
    }

    /**
     * Removes a party from the waiting list.  Returns true is success, false if that same name is not in
     * the list.
     * @param name
     */
    function removeParty( name ) {

        // TODO: Erik, test. If there is no such name it should return false
        // Use Lodash

        _currentList = _.without(_currentList, { name: name });

        updateRemoteModel();
        return true;
    }
    
    function loadTestData(persistRemote){
    
        addParty("John", 5);
        addParty( "Joe", 4 );
        addParty( "Frank", 2 );
        addParty( "Jane", 3 );
        
        if (persistRemote) updateRemoteModel();

    }
    
    initialize();
    
    return {
        currentList: _currentList,
        addParty: addParty,
        removeParty: removeParty,
        loadTestData: loadTestData
    }

});