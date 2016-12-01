/**
 * Created by noah on 6/28/16.
 */

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
        .state('home', {
            url: "/home",
            templateUrl: 'app/components/homepage/home.html',
            controller: 'homeController',
            resolve: {
                currentList:
                    function ( waitList ) {
                         return waitList.loadModel();
                    }
            }
        })
        .state('add', {
            url: "/add",
            templateUrl: 'app/components/addpage/add.html',
            controller: 'addController'
        });
});
