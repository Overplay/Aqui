/**
 * Created by logansaso on 6/23/16.
 */


//PARTY JSON OBJECT
// {
// 	    'name' : 'Name of El Partay',
// 		'members' : 5,
// 		'dateCreated': new Date()
// }

app.controller('waitingListController', ['$scope', 'optvModel', '$log', '$timeout', function ($scope, optvModel, $log, $timeout) {

	$scope.parties = function() { return optvModel.model.parties; };


	function handleDataCallback(data) {
		if (data.length != optvModel.model.parties.length) {
			optvModel.model.parties = data.parties;
		}
	}

	function updateFromRemote() {

		optvModel.init({
			appName: "io.ourglass.waitinglist",
			endpoint: "tv",
			dataCallback: handleDataCallback,
			initialValue: {parties: []}
		});
	}

	function logLead() {
		return "waitingListController:";
	}


	updateFromRemote();


}]);


app.directive('topScroller', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			parties: '='
		},
		templateUrl: 'app/components/directives/topscroller.template.html',
		link: function (scope, elem, attrs) {
			scope.topPos = {};

			function loadHeight() {
				return $timeout(function () {
					return document.getElementById('party-container').offsetHeight;
				})
			}

			var i, dx, delay = 20, top;

			function loop() {
				if (i >= dx) {
					console.log('Done!');
					beginScroll();
					return;
				}
				i++;
				scope.topPos.top = --top + 'px';
				$timeout(loop, delay);
			}

			function beginScroll() {
				console.log('Beginning scroll...');
				i = 1;
				loadHeight().then(function (height) {
					dx = height + window.innerHeight;
					top = window.innerHeight;
					scope.topPos.top = top + 'px';
					console.log('Scroll starting. Got height:', height, 'and window height:', window.innerHeight, 'and dx:', dx);
					loop();
				});
			}

			beginScroll();

		}
	}
});

app.filter('nameMaximum', function () {

	return function (data) {

		var words = data.split(" ");
		var countedLetters = 0;
		var CHARLIMIT = 6;
		var returnMe = data;


		for (var word = 0; word < words.length; word++) {

			for (var letter = 0; letter < words[word].length; letter++) {

				countedLetters++

			}

			if (countedLetters > CHARLIMIT) {

				if (word == 0)
					word++;

				returnMe = words.splice(0, word).join(" ");

				if (word == 1)
					return returnMe;

				break;
			}

		}

		return returnMe;


	}

});























