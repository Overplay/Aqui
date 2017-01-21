/**
 * Created by mkahn on 1/19/17.
 */

app.controller("settingsController", function($scope, uibHelper, $log, $rootScope, $interval, $state){

    $log.debug("loading settingsController");

    $scope.status = localStorage.getItem("gameActive") == "true" ? "Game Active" :
        localStorage.getItem("gameActive") == "picking" ? "Picking Squares" : "No Game Started";

    $scope.createNewGame = function () {
        localStorage.removeItem("squares_grid");
        localStorage.removeItem("gridScores");
        localStorage.setItem("gameActive", "picking");
        makeNewGrid();
        $scope.status = "Picking Squares"
    };

    $scope.startGame = function () {
        assignScores();
        localStorage.setItem("gameActive", "true");
        $scope.status = "Game Active";
        $log.debug("game now active");
        $scope.viewResult();
    };

    $scope.stopGame = function () {
        localStorage.removeItem("gameActive");
        localStorage.removeItem("squares_grid");
        localStorage.removeItem("gridScores");
        $scope.status = "No Game Started";
    };

    $scope.viewResult = function () {
        $state.go("results");
    };

    var makeNewGrid = function () {
        var grid = [];

        for (var col=0; col<10; col++){
            var row = [];
            for (var r=0; r<10; r++){
                row.push({taken: false, user: undefined});
            }
            grid.push(row);
        }

        $log.debug("localStorage set");
        localStorage.setItem('squares_grid', JSON.stringify(grid));
    };



    $scope.tilesPicked = countTiles();

    $interval(function () {
        countTiles();
    }, 5000);

    function countTiles () {
        var grid = JSON.parse(localStorage.getItem("squares_grid"));
        if (!grid) return 0;

        var count = 0;

        for (var r = 0; r < 10; r++) {
            for (var c = 0; c < 10; c++) {
                if (grid[r][c].taken) {
                    count++;
                }
            }
        }

        return count;
    }



    function assignScores() {
        var teamV = "";
        var teamH = "";

        if (Math.random() > Math.random()) {
            teamV = "home team";
            teamH = "away team";
        } else {
            teamV = "away team";
            teamH = "home team";
        }

        var orderV = [0 ,1, 2, 3, 4, 5, 6, 7, 8, 9];
        var orderH = [0 ,1, 2, 3, 4, 5, 6, 7, 8, 9];

        orderV = knuthShuffle(orderV);
        orderH = knuthShuffle(orderH);

        var gridScores = {
            vertical: {
                team: teamV,
                order: orderV
            },
            horizontal: {
                team: teamH,
                order: orderH
            }
        };

        localStorage.setItem("gridScores", JSON.stringify(gridScores));
        $log.debug("grid scrores set and pushed to local storage");
        $log.debug("order V: " + orderV);
        $log.debug("order H: " + orderH);
    }

    function knuthShuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

});