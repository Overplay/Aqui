/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dartsController",
    function ($scope, $timeout, $http, $interval, optvModel, $log, $window) {

        console.log("Loading cricketController");

        $scope.position = {corner: 0};
        $scope.score = {red: 0, blue: 0};

        var scoreReference = [20, 19, 18, 17, 16, 15, 25];

        $scope.turns = [];
        $scope.turnsSkip = 0;

        $scope.rows = [
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
            {
                p1: {numHits: 0, score: 0},
                p2: {numHits: 0, score: 0},
                closed: false
            },
        ];


        var _remoteScore = {};

        function logLead() {
            return "DartsController: ";
        }

        $scope.$on('CPANEL', function () {

            $scope.position.corner++;
            if ($scope.position.corner > 3) $scope.position.corner = 0;

        });

        function updateLocalScore() {
            console.log(_remoteScore);
        }

        function modelUpdate(data) {
            $log.info(logLead() + " got a model update: " + angular.toJson(data));
            _remoteScore = data;
            updateLocalScore();

            //game logic
            $scope.score.red = 0;
            $scope.score.blue = 0;

            $scope.rows = [
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                },
                {
                    p1: {numHits: 0, score: 0},
                    p2: {numHits: 0, score: 0},
                    closed: false
                }
            ];

            _remoteScore.turns.forEach(function(turn){
                for (var i = 0; i < turn.player1.board.length; i++) {
                    var redHits = 0, blueHits = 0;
                    $scope.rows[i].p1.numHits += turn.player1.board[i].darts.length;
                    redHits += turn.player1.board[i].darts.length;

                    if ($scope.rows[i].p1.numHits >= 3 && $scope.rows[i].p2.numHits >= 3) {
                        $scope.rows[i].closed = true;
                    }
                    if (!$scope.rows[i].closed && $scope.rows[i].p1.numHits > 3) {
                        $scope.rows[i].p1.score += scoreReference[i] * (redHits < 3 ? 0 : redHits - 3);
                    }
                    $scope.rows[i].p2.numHits += turn.player2.board[i].darts.length;
                    blueHits += turn.player2.board[i].darts.length;
                    if ($scope.rows[i].p1.numHits >= 3 && $scope.rows[i].p2.numHits >= 3) {
                        $scope.rows[i].closed = true;
                    }
                    if (!$scope.rows[i].closed && $scope.rows[i].p2.numHits > 3) {
                        $scope.rows[i].p2.score += scoreReference[i] * (blueHits < 3 ? 0 : blueHits - 3);
                    }
                }
            });

            $scope.rows.forEach(function(row){
                $scope.score.red += row.p1.score;
                $scope.score.blue += row.p2.score;
            })

            $log.debug(logLead() + "Model update callback...")

        }

        function inboundMessage(msg) {
            $log.debug(logLead() + "Inbound message...");
        }

        function updateFromRemote() {
            optvModel.init({
                    appName: "io.ourglass.cricket",
                    endpoint: "tv",
                    dataCallback: modelUpdate,
                    messageCallback: inboundMessage,
                    initialValue: {
                        rows: [
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            },
                            {
                                p1: {numHits: 0, score: 0},
                                p2: {numHits: 0, score: 0},
                                closed: false
                            }
                        ], turns: []
                    }
                }
            )
            ;
        }

        updateFromRemote();
    })
;