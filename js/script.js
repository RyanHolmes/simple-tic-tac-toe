'use strict';

$(document).ready(function() {
    // Variables
    var gameState = {
        bFirstPlayer: true,
        movesMade: 0,
        score: {
            x: 0,
            o: 0
        },
        board: [[],[],[]]
    }

    var lineWidth = 12;
    var gridColour = "#BDC3C7"; //gray
    var xColour = "#E74C3C"; //red
    var oColour = "#3498DB"; //blue
    var gridLength = 3; //3x3 grid
    var gridLineStart = 10; // gives lines room to be rounded

    // canvad setup/variables
    var canvas = document.getElementById('game-board-canvas');
    var context = canvas.getContext('2d');
    var canvasSize = 510;
    var xoSize = 100;
    var tileSize = canvasSize / gridLength;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // DOM Elements
    var xPlayerTurn = $('#x-player-turn');
    var oPlayerTurn = $('#o-player-turn');
    var xPlayerScore = $('#x-player-score');
    var oPlayerScore = $('#o-player-score');
    var swapPlayerTurnBtn = $('#player-start-swap-btn');
    var clearBoardBtn = $("#clear-board-btn");
    var resetScoreBtn = $("#reset-scores-btn");

    // button event handlers
    clearBoardBtn.click(function () {
        resetBoard();
    });

    resetScoreBtn.click(function () {
        gameState.score.x = 0;
        gameState.score.o = 0;
        updateScoreLabels();
    });

    swapPlayerTurnBtn.click(function() {
        // change which player starts, if game isn't in progress
        if(gameState.movesMade === 0) gameState.bFirstPlayer = !gameState.bFirstPlayer;
        updateScoreLabels();
    })

    canvas.addEventListener('mouseup', function (e) {
        // check for mouse click in canvas
        var canvasMousePos = getCanvasMousePosition(e);
        addXO(canvasMousePos);
        drawGrid();
    });

    function updateScoreLabels () {
        if(gameState.bFirstPlayer) {
            oPlayerTurn.show();
            xPlayerTurn.hide();
        } else {
            xPlayerTurn.show();
            oPlayerTurn.hide();
        }
        
        xPlayerScore.text(gameState.score.x);
        oPlayerScore.text(gameState.score.o);
    }

    function resetBoard () {
        gameState.board = [
            [ "", "", "" ],
            [ "", "", "" ],
            [ "", "", "" ]
        ];

        // clear context
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        gameState.movesMade = 0;
        swapPlayerTurnBtn.prop('disabled', false);
        canvas.classList.remove("disable-canvas");
        updateScoreLabels();
    }

    resetBoard();

    function addXO (mousePos) {
        for (var x = 0; x < gridLength; x++) {
            for (var y = 0; y < gridLength; y++) {
                var xCord = x * tileSize;
                var yCord = y * tileSize;

                // if mouse clicked within a tile
                if ( mousePos.x >= xCord && mousePos.x <= xCord + tileSize &&
                    mousePos.y >= yCord && mousePos.y <= yCord + tileSize ) {
                    
                    // no duplicate moves
                    if(gameState.board[x][y] !== "") return;

                    // switch player turn
                    gameState.bFirstPlayer = (gameState.bFirstPlayer) ? false : true;

                    clearBoard(xCord, yCord);

                    if (gameState.bFirstPlayer) {
                        drawX(xCord, yCord);
                        gameState.board[x][y] = "X";
                    } else {
                        drawO(xCord, yCord);
                        gameState.board[x][y] = "O";
                    }
                }
            }
        }

        // don't allow changing starting player after first move has been made
        swapPlayerTurnBtn.prop('disabled', (gameState.movesMade >= 0));

        updateScoreLabels();
        checkForWinner();
    }

    function drawX (xCord, yCord) {
        context.strokeStyle = xColour;
        context.beginPath();
        
        var offset = xoSize/2;
        context.moveTo(xCord + offset, yCord + offset);
        context.lineTo(xCord + tileSize - offset, yCord + tileSize - offset);

        context.moveTo(xCord + offset, yCord + tileSize - offset);
        context.lineTo(xCord + tileSize - offset, yCord + offset);
        
        context.stroke();
        gameState.movesMade++;
    }

    function drawO (xCord, yCord) {
        var halfTileSize = (0.5 * tileSize);
        var centerX = xCord + halfTileSize;
        var centerY = yCord + halfTileSize;
        var radius = (xoSize / 2) - lineWidth;
        var startAngle = 0; 
        var endAngle = 2 * Math.PI; // 2*pi*r

        context.lineWidth = lineWidth;
        context.strokeStyle = oColour;
        context.beginPath();
        context.arc(centerX, centerY, radius, startAngle, endAngle);
        
        context.stroke();
        gameState.movesMade++;
    }

    function drawGrid () {
        var lineStart = gridLineStart;
        var lineLength = canvasSize - (gridLineStart *2 );
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        context.strokeStyle = gridColour;
        context.beginPath();

        // 2 Horizontal lines 
        for (var y = 1; y <= 2; y++) {  
            context.moveTo(lineStart, y * tileSize);
            context.lineTo(lineLength, y * tileSize);
        }

        // 2 Vertical lines 
        for (var x = 1; x <= 2; x++) {
            context.moveTo(x * tileSize, lineStart);
            context.lineTo(x * tileSize, lineLength);
        }

        context.stroke();
    }

    function clearBoard (xCord, yCord) {
        context.fillStyle = "#fff";
        context.fillRect(xCord, yCord, tileSize, tileSize); 
    }

    drawGrid();

    function getCanvasMousePosition (e) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    function checkForWinner () {
        // check for vertical winner
        for(var i = 0; i < gridLength; i++) {
            var empty = (gameState.board[i][0] === "" || gameState.board[i][1] === "" || gameState.board[i][2] === "" );
            if( !empty && (gameState.board[i][0] === gameState.board[i][1]) && (gameState.board[i][0] === gameState.board[i][2]) ) {
                updateScores(gameState.board[i][0]);
                alert("Player " + gameState.board[i][0] + " Wins! (Vertical)");
                return;
            }
        }

        // check for horizontal winner
        for(var i = 0; i < gridLength; i++) {
            var empty = (gameState.board[0][i] === "" || gameState.board[1][i] === "" || gameState.board[2][i] === "" );
            if( !empty && (gameState.board[0][i] === gameState.board[1][i]) && (gameState.board[0][i] === gameState.board[2][i]) ) {
                updateScores(gameState.board[0][i]);
                alert("Player " + gameState.board[0][i] + " Wins! (Horizontal)");
                return;
            }
        }

        // check for diagonal winner  
        var empty = (gameState.board[0][0] === "" || gameState.board[1][1] === "" || gameState.board[2][2] === "" );
        if( !empty && (gameState.board[0][0] === gameState.board[1][1]) && (gameState.board[0][0] === gameState.board[2][2]) ) {
            updateScores(gameState.board[0][0]);
            alert("Player " + gameState.board[0][0] + " Wins! (Diagonal)");
            return;
        }

        //other diagonal
        empty = (gameState.board[2][0] === "" || gameState.board[1][1] === "" || gameState.board[0][2] === "" );
        if( !empty && (gameState.board[2][0] === gameState.board[1][1]) && (gameState.board[2][0] === gameState.board[0][2]) ) {
            updateScores(gameState.board[2][0]);
            alert("Player " + gameState.board[2][0] + " Wins! (Diagonal)");
            return;
        }

        //if all tiles are filled but no winner it's a tie
        if( gameState.movesMade === 9 ) alert("Game is a tie!");
    }

    // called on a win condition
    function updateScores (winner) {
        if(winner === "X") gameState.score.x++;
        if(winner === "O") gameState.score.o++;
        updateScoreLabels();

        // disable canvas when game ends
        canvas.classList.add("disable-canvas");
    }
});