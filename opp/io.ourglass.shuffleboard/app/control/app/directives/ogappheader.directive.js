/**
 * Created by erikphillips on 11/11/16.
 */

app.directive('ogAppHeader', function () {
    return {
        scope: {
            name: "="
        },
        link: function (scope, elem, attr) {
            scope.name = undefined;

            if (attr.name !== undefined) {
                scope.name = attr.name;
            }
        },
        templateUrl: 'app/directives/ogappheader.template.html'
    };
});