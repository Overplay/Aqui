/**
 * Created by mkahn on 4/28/15.
 */

app.controller("dartsconController",
    function ($scope, $timeout, $http, $log, ogControllerModel) {

        $log.info("Loading cricketconController");

        $scope.ui = {show: false};

        function ready() {
            $scope.ui.show = true;
        }

        function dataChanged(data) {

        }

        function inboundMessage(data) {
            $log.info("ShuffleCon: got inbound message.");
        }

        function playerInfo(){
            this.board = [
                {text: "20", darts:[]},
                {text: "19", darts:[]},
                {text: "18", darts:[]},
                {text: "17", darts:[]},
                {text: "16", darts:[]},
                {text: "15", darts:[]},
                {text: "bull", darts:[]},
            ];
            this.dartsUsed = 0;
        }

        function reinitializePlayer(player){
            var newPlayer = new playerInfo();
            player.board = newPlayer.board;
            player.dartsUsed = 0;
        }

        function addPlayerInfoToTurns(turns, player1, player2){
            var turnObj = {
                player1: player1,
                player2: player2
            };
            
            turns.push(turnObj);
        }

        $scope.useDart = function(player, index, multiplier){
            if(player.dartsUsed == 3){
                reinitializePlayer(player);
            }
            else {
                while(multiplier--) {
                    player.board[index].darts.push(player.dartsUsed);
                }
                player.dartsUsed++;
            }
        }

        $scope.player1 = new playerInfo();
        $scope.player2 = new playerInfo();

        function initialize() {
            ogControllerModel.init({
                appName: "io.ourglass.cricket",
                endpoint: "control",
                dataCallback: dataChanged,
                messageCallback: inboundMessage
            });
            if(!ogControllerModel.turns){
                ogControllerModel.turns = [];
            }
        }

        $scope.finishTurn = function () {
            console.log(ogControllerModel);
            if(!ogControllerModel.model.turns){
                ogControllerModel.model.turns = [];
            }
            addPlayerInfoToTurns(ogControllerModel.model.turns, $scope.player1, $scope.player2);
            ogControllerModel.save();
            $scope.player1 = new playerInfo();
            $scope.player2 = new playerInfo();
        }


        $scope.resetScores = function () {
            ogControllerModel.model.turns = [];
            ogControllerModel.save();
            $scope.player1 = new playerInfo();
            $scope.player2 = new playerInfo();
        }

        $scope.home = function () {
            ogControllerModel.postMessage({dest: "io.ourglass.mainframe", data: {dash: 'toggle'}});
        }

        $scope.move = function () {
            ogControllerModel.move()
                .then(function (newSlot) {
                    $log.info("CricketControl. Moved to slot: " + numSlot);

                }, function (err) {
                    $log.info("CricketControl. FAIL moving app: " + err);

                });
        }
        initialize();
    })
;
