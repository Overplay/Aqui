/*********************************

 File:       optvBudBordApp.module
 Function:   ShuffleBoard App
 Copyright:  OverplayTV
 Date:       10.2.2015
 Author:     mkahn

 **********************************/


var app = angular.module('optvBudBoardApp', [
    'ngOpTVApi', 'ngTweetScrape'
]);

app.config( [ '$logProvider', function ( $logProvider ) {
    $logProvider.debugEnabled( false );
} ] )
