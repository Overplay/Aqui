/**
 * Created by noah on 6/28/16.
 */

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: 'app/components/routes/home.html'
        })
        .state('add', {
            url: "/add",
            templateUrl: 'app/components/routes/add.html'
        });
});
