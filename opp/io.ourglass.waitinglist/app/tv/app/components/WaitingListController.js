/**
 * Created by logansaso on 6/23/16.
 */


//PARTY JSON OBJECT
// {
// 	    'name' : 'Name of El Partay',
// 		'members' : 5,
// 		'dateCreated': new Date()
// }

app.controller('waitingListController', ['$scope', 'ogTVModel', '$log', '$timeout', function ($scope, ogTVModel, $log, $timeout) {

	var TESTING = false;

	$scope.parties = function() {
		if (TESTING)
			return parties;
		return ogTVModel.model.parties;
	};


	$scope.title = "Waiting List";


	var parties = [
		{
			name: "Logan Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Noah Saso",
			partySize: 1,
			tableReady: true
		}, {
			name: "Frank Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Christopher Saso",
			partySize: 1,
			tableReady: false
		}, {
			name: "Arabella Appleseed Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Jenni Saso",
			partySize: 1,
			tableReady: false
		}, {
			name: "Vivek Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Jimmy Saso",
			partySize: 1,
			tableReady: true
		}, {
			name: "Juan Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Du Saso",
			partySize: 1,
			tableReady: false
		}, {
			name: "Mitch Saso",
			partySize: 12,
			tableReady: false
		},
		{
			name: "Treb Saso",
			partySize: 1,
			tableReady: false
		}
	];


	function handleDataCallback(data) {
		if (data.length != ogTVModel.model.parties.length) {
			ogTVModel.model.parties = data.parties;
		}
	}

	function updateFromRemote() {

		ogTVModel.init({
			appName: "io.ourglass.waitinglist",
			dataCallback: handleDataCallback
			});
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

				var listHeight, windowHeight, cellHeight;

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

				var wasPaused = false;
				var distanceNeeded;
				var currentLocation;
				var transitionTime = 1; //In seconds. MUST BE LOWER THAN stepDelay
				var stepDelay = 2; //In seconds

				// This is on a scope var for debugging on Android
				scope.screen = {height: $window.innerHeight, width: $window.innerWidth};


				function setScrollHeight() {
					var outerFrame = document.getElementById("outer-frame");
					var scrollWindow = document.getElementById("scroll-window");

					var newHeight = Math.floor(outerFrame.offsetHeight / cellHeight) * cellHeight;
					$log.info("newHeight: " + newHeight);
					scrollWindow.setAttribute("style", "height: " + newHeight + "px");
					$log.info("new scroll ht: " + scrollWindow.offsetHeight);
				}

				// Dump crawler off screen
				function resetCrawlerTransition() {
					wasPaused = false;
					scope.topPos = {
						'-webkit-transform': "translate(0px, " + (Math.ceil(windowHeight / cellHeight) * cellHeight) + 'px)',
						'transform': "translate(0px, " + (Math.ceil(windowHeight / cellHeight) * cellHeight) + 'px)',
						'transition': 'all 0s'
					};

				}


				function outerLoop() {


					$timeout(loop, stepDelay * 1000);


				}

				function setNoMovement() {
					wasPaused = true;
					scope.topPos = {
						'-webkit-transform': "translate(0px, 0px)",
						'transform': "translate(0px, 0px)",
						'transition': "all 0s linear"
					};
				}

				function loop() {

					if (scope.parties.length <= Math.floor(windowHeight / cellHeight)) {
						// if the number of parties is less than the available window space
						// then don't scroll
						setNoMovement();
						doScroll();
						return;
					}

					if(wasPaused){
						resetCrawlerTransition();
						doScroll();
						return;
					}

					// $log.info("Doing loop.");


					currentLocation = currentLocation - cellHeight;
					$log.debug( "new currentLocation: " + currentLocation );
					$log.debug( "currLoc / cellHeight: " + (currentLocation / cellHeight));

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
				function loadListHeight() {
					return $timeout(function () {
						return document.getElementById('party-container').offsetHeight;
					})
				}

				function loadWindowHeight(){
					return $timeout( function () {
						return document.getElementById( 'scroll-window' ).offsetHeight;
					} )
				}

				function loadCellHeight(){
					return $timeout( function () {
						var cellHt = 0;
						if (scope.parties.length) {
							var elem = document.getElementById('scroll0'); // should maybe be changed from scroll0 to generic
							var style = elem.currentStyle || window.getComputedStyle(elem);
							cellHt = elem.offsetHeight + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
							$log.debug("loadCellHeight found: " + cellHt);
						} else {
							$log.debug("loadCellHeight not found - no parties");
						}
						return cellHt;
					} )
				}


				function scroll(){

					$log.debug( "List height: " + listHeight );
					$log.debug( "Window height: " + windowHeight);

					currentLocation = windowHeight;
					$log.debug( "currentLocation at start: " + currentLocation );
					distanceNeeded = listHeight + cellHeight;
					try {
						if (scope.parties.length > Math.floor(windowHeight / cellHeight)) {
							resetCrawlerTransition();
						} else {
							setNoMovement();
						}
					} catch ( err ) {
						$log.error( err.message );
						//$timeout(doScroll(), 1000);
						//Due to the fact that scope.parties() probably has nothing in it yet
					}
					outerLoop();
				}


				function doScroll() {

					loadListHeight()
						.then(function (height) {
							listHeight = height;

							return loadCellHeight();
						})
						.then ( function(cell) {
							if ( scope.parties.length ){
								cellHeight = cell;
							} else {
								cellHeight = 0; // no parties
							}

							setScrollHeight();

							$log.debug("Cell height: " + cellHeight);
							return loadWindowHeight();
						})
						.then( function(height){
							windowHeight = height;
							scroll();
						});
					
				}

				doScroll();

			}
		}
	}]
);
