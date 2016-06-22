/*********************************

 File:       optvShuffleApp.module
 Function:   ShuffleBoard App
 Copyright:  OverplayTV
 Date:       10.2.2015
 Author:     mkahn

 **********************************/


var app = angular.module('optvDailySpecialsApp', [
    'ngOpTVApi',
    'angular-velocity'
]);


function fCheckAlive()
{
	console.log("fCheckAlive called, homey!");
	return true;
}

function fButtonPress(button){a
    console.log("BUtton pushed: "+button);
    angular.element(document.getElementById('docbody')).scope().buttonPushed(button);
}
