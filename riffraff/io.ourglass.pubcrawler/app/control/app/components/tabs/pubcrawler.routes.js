/**
 * Created by noah on 6/30/16.
 */

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/messages');
    $stateProvider
        .state('messages', {
            url: "/messages",
            templateUrl: 'app/components/tabs/messages.html'
        })
        .state('comingup', {
            url: "/comingup",
            templateUrl: 'app/components/tabs/comingup.html'
        })
        .state('twitter', {
            url: "/twitter",
            templateUrl: 'app/components/tabs/twitter.html'
        });
});
