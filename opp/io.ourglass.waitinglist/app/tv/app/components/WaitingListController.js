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

	$scope.title = "Waiting List";

	$scope.parties = function() {
		return optvModel.model.parties;
	};

	//
	// $scope.parties = function () {
	// 	$scope.title = "Num: " + parties.length;
	// 	return parties;
	// };
	//
	// var parties = [
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
	// 	}];
		// {
		// 	name: "Noah Saso",
		// 	partySize: 1,
		// 	tableReady: true
		// }, {
		// 	name: "Logan Saso",
		// 	partySize: 12,
		// 	tableReady: false
		// },
		// {
		// 	name: "Noah Saso",
		// 	partySize: 1,
		// 	tableReady: false
		// }, {
		// 	name: "Logan Saso",
		// 	partySize: 12,
		// 	tableReady: false
		// },
		// {
		// 	name: "Noah Saso",
		// 	partySize: 1,
		// 	tableReady: false
		// }
	//];

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
					console.log('Scroll starting. Got height:', height, 'and window height:', window.innerWidth, 'and dx:', dx);
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
					console.log('Scroll starting. Got height:', heightOfPartyContainer, 'and window height:', window.innerWidth, 'and dx:', dx);
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


app.directive('topScrollerJankFree', [
	'$log', '$timeout', '$window', '$interval',
	function ($log, $timeout, $window, $interval) {
		return {
			restrict: 'E',
			scope: {
				parties: '=',
				title: '='
			},
			templateUrl: 'app/components/directives/topscroller.template.html',
			link: function (scope, elem, attrs) {

				try{
					if (scope.parties.length <= 5) {
						setNoMovement();
					} else {
						resetCrawlerTransition();
					}
				} catch (err)
				{
					resetCrawlerTransition();
				}

				/*
				 Speed needs to be implemented
				 scope.speed should be passed as { crawlerVelocity: 50, nextUpVelocity: 20 } as an example

				 scope.logo should be the path to the logo to show on the left side
				 scope.bannerAd should be the path to a full banner add to be shown periodically

				 none of these are implemented yet


				 */

				var distanceNeeded;
				var currentLocation;
				var heightOfOne = 50;
				var transitionTime = 1; //In seconds. MUST BE LOWER THAN stepDelay
				var stepDelay = 2; //In seconds

				// This is on a scope var for debugging on Android
				scope.screen = {height: $window.innerHeight, width: $window.innerWidth};

				// Dump crawler off screen
				function resetCrawlerTransition() {

					scope.topPos = {
						'-webkit-transform': "translate(0px, " + 300 + 'px)',
						'transform': "translate(0px, " + 300 + 'px)',
						'transition': 'all 0s'
					};

				}


				function outerLoop() {


					$timeout(loop, stepDelay * 1000);


				}

				function setNoMovement() {
					scope.topPos = {
						'-webkit-transform': "translate(0px, 0px)",
						'transform': "translate(0px, 0px)",
						'transition': "all 0s linear"
					};
				}

				function loop() {

					if (scope.parties.length <= 5) {
						setNoMovement();
						doScroll();
						return;
					}

					// $log.info("Doing loop.");


					currentLocation -= heightOfOne;

					scope.topPos = {
						'-webkit-transform': "translate(0px, " + currentLocation + "px)",
						'transform': "translate(0px, " + currentLocation + "px)",
						'transition': "all " + transitionTime + "s linear"
					};

					if (-currentLocation >= distanceNeeded) {
						console.log('Done!');
						doScroll();
						return;
					}

					outerLoop();

				}


				// This promise weirdness is necessary to allow the DOM to be compiled/laid out outside of angular
				function loadHeight() {
					return $timeout(function () {
						return document.getElementById('party-container').offsetHeight-197;
					})
				}


				function doScroll() {


					loadHeight()
						.then(function (height) {
							currentLocation = 250;
							distanceNeeded = height + 250;
							$log.debug("Scroller height: " + height);
							try{
								if (scope.parties.length > 5) {
									resetCrawlerTransition();
								} else {
									setNoMovement();
								}
							} catch (err) {
								$log.error(err.message);
								//$timeout(doScroll(), 1000);
								//Due to the fact that scope.parties() probably has nothing in it yet
							}
							outerLoop();
						});

				}

				doScroll();

			}
		}
	}]
);
