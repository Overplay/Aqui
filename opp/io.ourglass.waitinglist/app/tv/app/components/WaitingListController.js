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

	// var parties = [
	// 	{
	// 		name: "Logan Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Noah Saso",
	// 		partySize: 1,
	// 		tableReady: true
	// 	}, {
	// 		name: "Logan Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Christopher Saso",
	// 		partySize: 1,
	// 		tableReady: false
	// 	}, {
	// 		name: "Arabella Appleseed Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Noah Saso",
	// 		partySize: 1,
	// 		tableReady: false
	// 	}, {
	// 		name: "Logan Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Noah Saso",
	// 		partySize: 1,
	// 		tableReady: true
	// 	}, {
	// 		name: "Logan Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Noah Saso",
	// 		partySize: 1,
	// 		tableReady: false
	// 	}, {
	// 		name: "Logan Saso",
	// 		partySize: 12,
	// 		tableReady: false
	// 	},
	// 	{
	// 		name: "Noah Saso",
	// 		partySize: 1,
	// 		tableReady: false
	// 	}
	// ];
    //
	// $scope.parties = function () {
	// 	return parties;
	// };

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

			var i, dx, delay = 35, top;

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
					top = 300;
					dx = height + top;
					scope.topPos.top = top + 'px';
					console.log('Scroll starting. Got height:', height, 'and window height:', window.innerHeight, 'and dx:', dx);
					loop();
				});
			}

			beginScroll();

		}
	}
});


app.directive('topScrollerSteps', function ($timeout, $interval) {
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

			var i, dx, delay = 500, topOfContent, heightOfOne = 50;


			function outerLoop() {

				if (i >= dx) {
					console.log('Done!');
					beginScroll();
					return;
				}
				i += heightOfOne;
				loop();
			}


			function loop() {

				var j = 0;
				var interval = $interval(function () {
					j++;
					scope.topPos.top = --topOfContent + 'px';
					if (j >= heightOfOne) {
						$interval.cancel(interval);
						$timeout(outerLoop, delay);
					}
				}, 20);

			}

			function beginScroll() {
				console.log('Beginning scroll...');
				i = 1;
				loadHeight().then(function (heightOfPartyContainer) {
					topOfContent = 300;
					dx = heightOfPartyContainer + topOfContent;
					scope.topPos.top = topOfContent + 'px';
					console.log('Scroll starting. Got height:', heightOfPartyContainer, 'and window height:', window.innerHeight, 'and dx:', dx);
					outerLoop();
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
		var CHARLIMIT = 12;
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























