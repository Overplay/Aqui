/**
 * Created by mkahn on 4/28/15.
 */

app.controller("scrollerController",
	function ($scope, $timeout, $http, $interval, optvModel, $log, $window) {

		console.log("Loading scrollerController");


		// $scope.messageArray = ["Golden State pushes series to decisive Game 7",
		// 	"Try our new Ranch Chicken Salad, $7.99",
		// 	"Don't forget our 4th of July Party!",
		// 	"Try Rheingold IPA, Hop to It",
		// 	"Bangers and Mash on Special for Happy Hour"];
		$scope.messageArray = ["Potatoes",
			"And",
			"This is a super long message to illustrate a point.",
			"Mash",
			"Noah, willl you be my lawfully born brother?",
			"On a scale from 1 to 1 to 1 how much do you love my messages right now?",
			"$log.warning('Inception inbound');",
			"C# is best language. Javascript can come too."];

		function logLead() {
			return "scrollerController: ";
		}

		function modelUpdate(data) {

			$log.debug(logLead() + " got a model update: " + angular.toJson(data));
			if (data.messages) {
				$scope.messageArray = data.messages;
			}


		}

		function inboundMessage(msg) {
			$log.debug(logLead() + "Inbound message...");
		}

		function updateFromRemote() {

			optvModel.init({
				appName: "io.overplay.pubcrawler",
				endpoint: "tv",
				dataCallback: modelUpdate,
				messageCallback: inboundMessage,
				initialValue: {messages: $scope.messageArray}
			});

		}

		$scope.$watch(function () {
			return $window.innerWidth;
		}, function (value) {
			console.log(value);
			$scope.screen = {width: $window.innerWidth, height: $window.innerHeight};
		});

		$scope.logo = "assets/img/brand.png";

		updateFromRemote();


	});


app.directive('leftScroller2t', [
	'$log', '$timeout', '$window',
	function ($log, $timeout, $window) {
		return {
			restrict: 'E',
			scope: {
				messageArray: '=',
				logo: '='
			},
			templateUrl: 'app/components/scroller/leftscroller2.template.html',
			link: function (scope, elem, attrs) {

				scope.leftPos = {left: '200px'};

				scope.screen = {width: $window.innerWidth, height: $window.innerHeight};

				var scrollerUl = document.getElementById('scroller-ul');

				scrollerUl.addEventListener("transitionend", function () {

					doScroll();

				}, false);

				function doScroll() {

					$timeout(function () {
						var width = scrollerUl.offsetWidth;
						$log.debug("Scroller width: " + width);
						scope.leftPos = {
							'-webkit-transform': 'translate(' + (width - 400) + 'px,0)',
							transition: '-webkit-transform 0s'
						};
						var destXform = -width + 'px';
						$timeout(function () {
							scope.leftPos = {
								'-webkit-transform': 'translate(' + destXform + ',0)',
								transition: '-webkit-transform 30s linear'
							};

						}, 100);
					}, 30);

				}

				doScroll();

			}
		}
	}]
);

app.directive('loganScroller', ['$timeout', '$log', '$q', function ($timeout, $log, $q) {
	return {
		restrict: 'E',
		scopep: {
			messageArrray: '=',
			logo: '='
		},
		templateUrl: 'app/components/scroller/leftscroller2.template.html',
		link: function (scope, elem, attrs) {

			// scope.location = {left: 1280};
			//
			// var scrollerUl = document.getElementById('scroller-ul');
			// $log.info(scrollerUl);
			//
			// //Current width of the window
			// scrollerUl.style.left = scope.location.left + 'px';
			//
			// //Should hypothetically run whenever the dom is changed, therefore changing it again
			// scrollerUl.addEventListener("transitionend", function () {
			//
			// 	doScroll();
			//
			// }, false);
			//
			//
			// //Not yet actually running
			// function doScroll() {
			// 	// $log.info("Do scroll fired.")
			// 	// $timeout(function () {
			// 	//
			// 	// 	$log.info(scrollerUl.style.left)
			// 	// }, 15);
			//
			// 	setStyle(1200);
			// 	for (var i = 1200; i > -1200; i--) {
			// 		$timeout(setStyle(i), 20)
			// 	};
			//
			// }
			//
			// function setStyle(value) {
			// 	scrollerUl.style.left = value + 'px';
			// 	$log.log(value);
			// }
			//
			// doScroll();


			/*END ATTEMPT ONE - FINAL DIAGNOSIS: ULTIMATE FAILURE - BEGIN ATTEMPT TWO*/


			//Distance = speed / time
			//2400px
			//
			// scope.travelMetrics = {
			// 	distance: 0,
			// 	speed: 120, //fasts
			// 	timeInSeconds: 0
			// };
			//
			// var scrollerUl = document.getElementById('scroller-ul');
			//
			// $timeout(function () {
			// 	scope.travelMetrics.distance = scrollerUl.offsetWidth + window.innerWidth;
			// 	scope.travelMetrics.timeInSeconds = scope.travelMetrics.distance / scope.travelMetrics.speed;
			// 	assignCSS();
			// 	$log.info(scrollerUl.offsetWidth);
			// });
			//
			// function assignCSS() {
			// 	//Give the thing a dynamic css shits and stuff
			// 	//scrollerUl.style = "@-webkit-keyframes moveLeft {from \{left: " + scope.travelMetrics.distance + "px;\}to \{left: " + -scope.travelMetrics.distance + "px;\}\}"
			//
			// 	var css = angular.element(
			// 		'<style>' +
			// 		'@-webkit-keyframes moveLeft {' +
			// 		'from {left: 100%;}' +
			// 		'to {left: ' + -scrollerUl.offsetWidth + 'px;}' +
			// 		'}' +
			// 		'.scroll-left {' +
			// 		'-webkit-animation: moveLeft;' +
			// 		'-webkit-animation-duration: ' + scope.travelMetrics.timeInSeconds + 's;' +
			// 		'-webkit-animation-iteration-count: infinite;' +
			// 		'-webkit-animation-timing-function: linear;' +
			// 		'}' +
			// 		'</style>');
			// 	elem.append(css);
			// }


			/*END ATTEMPT TWO - FINAL DIAGNOSIS: MEDIUM SUCCESS - BEGIN ATTEMPT THREE*/

			scope.travelMetrics = {
				distance: 0,
				speed: 120, //fasts
				timeInSeconds: 0
			};

			var scrollerUl = document.getElementById('scroller-ul');

			$timeout(function () {
				scope.travelMetrics.distance = scrollerUl.offsetWidth + window.innerWidth;
				scope.travelMetrics.timeInSeconds = scope.travelMetrics.distance / scope.travelMetrics.speed;
				assignCSS();
				$log.info(scrollerUl.offsetWidth);
			});

			function assignCSS() {
				var css = angular.element(
					'<style>' +
					'.scroll-left{' +
					'transform: translateX(' + -scope.travelMetrics.distance + 'px);' +
					'transition-timing-function: linear;' +
					'left: ' + window.innerWidth + 'px;' +
					'}</style>');
				elem.append(css);
			}

			//Stackoverflow:

		}
	}
}]);


app.directive('leftnsScroller2', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			messageArray: '=',
			logo: '='
		},
		templateUrl: 'app/components/scroller/leftscroller2.template.html',
		link: function (scope, elem, attrs) {

			scope.leftPos = {};

			function loadWidth() {
				return $timeout(function () {
					return document.getElementById('scroller-ul').offsetWidth;
				})
			}

			var i, dx, delay = 5, left;

			function loop() {
				if (i >= dx) {
					console.log('Done!');
					beginScroll();
					return;
				}
				i++;
				scope.leftPos.left = --left + 'px';
				$timeout(loop, delay);
			}

			function beginScroll() {
				console.log('Beginning scroll...');
				i = 1;
				loadWidth().then(function (width) {
					dx = width + window.innerWidth;
					left = window.innerWidth;
					scope.leftPos.left = left + 'px';
					console.log('Scroll starting. Got width:', width, 'and window width:', window.innerWidth, 'and dx:', dx);
					loop();
				});
			}

			beginScroll();

		}
	}
});

app.directive("leftnsScroller2Min", function (n) {
	return {
		restrict: "E",
		scope: {messageArray: "=", logo: "="},
		templateUrl: "app/components/scroller/leftscroller2.template.html",
		link: function (t, e, o) {
			function l() {
				var t = document.getElementById("scroller-ul");
				return n(function () {
					return t.offsetWidth
				})
			}

			function r() {
				return c >= s ? (console.log("Done!"), void i()) : (c++, t.leftPos.left = --f + "px", void n(r, u))
			}

			function i() {
				console.log("Beginning scroll..."), c = 1, l().then(function (n) {
					d = n, s = d + window.innerWidth, f = window.innerWidth, t.leftPos.left = f + "px", console.log("Scroll starting. Got width:", n, "and window width:", window.innerWidth, "and dx:", s), r()
				})
			}

			t.leftPos = {};
			var c, d, s, f, u = 5;
			i()
		}
	}
});

app.directive('leftScroller2', [
	'$log', '$timeout', '$window',
	function ($log, $timeout, $window) {
		return {
			restrict: 'E',
			scope: {
				messageArray: '=',
				logo: '='
			},
			templateUrl: 'app/components/scroller/leftscroller2.template.html',
			link: function (scope, elem, attrs) {

				scope.leftPos = {left: '1280px'};

				// scope.ui = {
				//     scrollin: false,
				//     scrollout: false,
				//     nextUpArr: ["1:00 Giants vs. DBacks", "4:30 GSW Pregame", "5:00 Warriors v Cavs"],
				//     nextUp: '',
				//     nidx: 0
				// };
				//
				// $timeout(function () {
				// }, 5000);
				//
				var scrollerWidth;
				var currentLeft = 1280;
				//frames per second
				var FPS = 120;
				//Pixels per frame
				var PPF = 1;
				//
				// function scroll() {
				//
				//     scope.ui.nextUp = '';
				//     scope.ui.scrollin = false;
				//
				//     $timeout(function () {
				//
				//         scope.ui.nextUp = scope.ui.nextUpArr[scope.ui.nidx];
				//         scope.ui.nidx++;
				//         if (scope.ui.nidx == scope.ui.nextUpArr.length)
				//             scope.ui.nidx = 0;
				//         scope.ui.scrollin = true;
				//
				//         $timeout(function () {
				//             scope.ui.scrollin = false;
				//             $timeout(scroll, 250);
				//         }, 5000)
				//
				//
				//     }, 250)
				// }
				//
				// scroll();

				scope.screen = {width: $window.innerWidth, height: $window.innerHeight};

				var scrollerUl = document.getElementById('scroller-ul');

				scrollerUl.addEventListener("transitionend", function () {

					doScroll();

				}, false);

				function loadWidth() {

					return $timeout(function () {
						return scrollerUl.offsetWidth;
					})

				}

				function assignLeft() {
					scope.leftPos.left = currentLeft + "px";
				}

				function renderNext() {

					assignLeft();
					currentLeft = currentLeft - PPF;
					if (currentLeft < -scrollerWidth)
						doScroll();
					else
						$timeout(renderNext, 1000 / FPS);


				}

				function doScroll() {

					loadWidth()
						.then(function (width) {
							$log.debug("Scroller width: " + width);
							scrollerWidth = width;
							currentLeft = 1280;
							renderNext();
						});

				}

				doScroll();

			}
		}
	}]
);

app.directive('timeBased', function ($timeout) {
	return {
		restrict: 'E',
		scope: {
			messageArray: '=',
			logo: '='
		},
		templateUrl: 'app/components/scroller/leftscroller2.template.html',
		link: function (scope, elem, attrs) {

			var MS_PER_PIXEL = 5;

			scope.leftPos = {left: window.innerWidth};

			function loadWidth() {
				return $timeout(function () {
					return document.getElementById('scroller-ul').offsetWidth;
				})
			}

			var i,
			    dx,
			    left,
			    lastUpdated = (new Date).getTime();

			function loop() {
				if (i >= dx) {
					console.log('Done!');
					beginScroll();
					return;
				}

				//Move based on time since last update
				var dTime = (new Date).getTime() - lastUpdated;
				lastUpdated = (new Date).getTime();
				i += (dTime / MS_PER_PIXEL);
				scope.leftPos.left = left - (dTime / MS_PER_PIXEL) + 'px';
				left = left - (dTime / MS_PER_PIXEL);
				$timeout(loop, 1000/30);
			}

			function beginScroll() {
				console.log('Beginning scroll...');
				i = 1;
				loadWidth().then(function (width) {
					dx = width + window.innerWidth;
					left = window.innerWidth;
					scope.leftPos.left = left + 'px';
					console.log('Scroll starting. Got width:', width, 'and window width:', window.innerWidth, 'and dx:', dx);
					loop();
				});
			}

			beginScroll();

		}
	}
});