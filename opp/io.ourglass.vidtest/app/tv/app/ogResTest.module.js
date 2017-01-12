/*********************************

 File:       ogResTest.module.js
 Function:   Test TV App to See Resolution of TV
 Copyright:  Ourglass TV
 Date:       10/26/16 8:26 AM
 Author:     mkahn
 
 **********************************/


var app = angular.module('ogResTestApp', [
	'ourglassAPI'
]);

app.controller( 'ogResTestController', 
	function ( $scope, ogTVModel, $log, $timeout, $window ) {

		$scope.wres = {
			iheight: $window.innerHeight, iwidth: $window.innerWidth,
			oheight: $window.outerHeight, owidth: $window.outerWidth
		};

		$timeout( function(){

			$scope.wres = { iheight: $window.innerHeight, iwidth: $window.innerWidth,
						oheight: $window.outerHeight, owidth: $window.outerWidth };

		}, 2000);


	});