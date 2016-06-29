/**
 * Created by logansaso on 6/23/16.
 */


//PARTY JSON OBJECT
// {
// 	    'name' : 'Name of El Partay',
// 		'members' : 5,
// 		'dateCreated': new Date()
// }

app.controller('waitingListController', ['$scope', 'optvModel', '$log', function ($scope, optvModel, $log) {

	//Make dynamic in the future?
	$scope.partyLimit = 5;

	//$scope.parties = function() { return optvModel.model.parties };

	$scope.parties = [{
		'name' : 'Logan Saso',
		'partySize' : 5,
		'dateCreated': new Date()
	},{
		'name': 'Another One',
		'partySize' : 12,
		'dateCreated' : new Date()
	},{
		'name': 'And Another One',
		'partySize' : 9,
		'dateCreated' : new Date()
	},{
		'name': 'And Another REALLYREALLYREALLYREALLYREALLYFUKINLONGONE Jimbo sherbert One',
		'partySize' : 9,
		'dateCreated' : new Date()
	}];

	function handleDataCallback(newParties) {

		/*var oldParties = $scope.parties;

		var pDifference = _.differenceWith(newParties, oldParties, _.isEqual);
		//remove or add animation for new party

		//console.log(pDifference, newParties, oldParties);

		$scope.parties = newParties;*/

	}

	function updateFromRemote() {

		optvModel.init({
			appName: "io.ourglass.shuffleboard",
			endpoint: "tv",
			dataCallback: handleDataCallback(),
			initialValue: {parties: $scope.parties}
		});
	}

	function logLead() {
		return "waitingListController:";
	}

	updateFromRemote();

}]);

app.filter('nameMaximum', function(){

	return function(data){

		var splitName = data.split(" ");
		var CHARLIMIT = 12;
		var computedLength = 0;
		var numWords = 0;
		var returnMe = "";


		for(var word = 0; word < splitName.length; word++){

			if(computedLength > CHARLIMIT){
				numWords = word;
				break;
			}
			computedLength+=splitName[word].length;

		}
		if(numWords == 0){
			return data;
		}

		for(var i = 0; i < numWords-2; i++){

			returnMe += splitName[i] + " ";

		}
		returnMe += splitName[numWords-2];

		return returnMe;


	}

});