document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const resetButton = document.getElementById('reset-button');
    const upButton = document.getElementById('up-button');
    const downButton = document.getElementById('down-button');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const size = 4;
    const board = [];
    let score = 0;
    let moved = false;

    function createBoard() {
        for (let i = 0; i < size * size; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            gameBoard.appendChild(tile);
            board.push(tile);
        }
        generateTile();
        generateTile();
    }

    function generateTile() {
        let emptyTiles = board.filter(tile => tile.innerHTML === '');
        if (emptyTiles.length === 0) return;
        let randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        randomTile.innerHTML = 2;
        randomTile.classList.add('tile-2');
    }


    function leftMergeBoard(board) {
        let newBoard = [];
        moved = false;
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(board[i * size + j].innerHTML);
            }
            let newRow = slide(row);
            for (let j = 0; j < newRow.length - 1; j++) {
                if (newRow[j] === newRow[j + 1]) {
                    newRow[j] = newRow[j] * 2;
                    newRow[j + 1] = 0;
                    score += parseInt(newRow[j]);
                }
            }
            newRow = slide(newRow);
            let missing = size - newRow.length;
            let zeros = Array(missing).fill(0);
            newRow = newRow.concat(zeros);
            if (!moved) {
                moved = !newRow.every((val, index) => val === row[index]);
            }
            newBoard = newBoard.concat(newRow);
        }
        return newBoard;
    }

    function rightMergeBoard(board) {
        let newBoard = [];
        moved = false;
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(board[i * size + j].innerHTML);
            }
            let newRow = slide(row);
            for (let j = newRow.length - 1; j > 0; j--) {
                if (newRow[j] === newRow[j - 1]) {
                    newRow[j] = newRow[j] * 2;
                    newRow[j - 1] = 0;
                    score += parseInt(newRow[j]);
                }
            }
            newRow = slide(newRow);
            let missing = size - newRow.length;
            let zeros = Array(missing).fill(0);
            newRow = zeros.concat(newRow);
            if (!moved) {
                moved = !newRow.every((val, index) => val === row[index]);
            }
            newBoard = newBoard.concat(newRow);
        }
        return newBoard;

    }

    function upMergeBoard(board) {
        let newBoard = Array(size * size).fill(0);
        moved = false;
        for (let i = 0; i < size; i++) {
            let line = [];
            for (let j = 0; j < size; j++) {
                line.push(board[j * size + i].innerHTML);  // 第 i 列
            }
            let newLine = slide(line);
            for (let j = 0; j < newLine.length - 1; j++) {
                if (newLine[j] === newLine[j + 1]) {
                    newLine[j] = newLine[j] * 2;
                    newLine[j + 1] = 0;
                    score += parseInt(newLine[j]);
                }
            }
            newLine = slide(newLine);
            let missing = size - newLine.length;
            let zeros = Array(missing).fill(0);
            newLine = newLine.concat(zeros);
            if (!moved) {
                moved = !newLine.every((val, index) => val === line[index]);
            }
            for (let j = 0; j < size; j++) {
                newBoard[j * size + i] = newLine[j];
            }
        }
        return newBoard;
    }

    function downMergeBoard(board) {
        let newBoard = Array(size * size).fill(0);
        moved = false;
        for (let i = 0; i < size; i++) {
            let line = [];
            for (let j = 0; j < size; j++) {
                line.push(board[j * size + i].innerHTML);  // 第 i 列
            }
            let newLine = slide(line);
            if (!moved) {
                for (let j = 0; j < newLine.length; j++) {
                    if (line[size - j - 1] !== newLine[newLine - j - 1]) {
                        moved = true;
                        break;
                    }
                }
            }
            for (let j = newLine.length - 1; j > 0; j--) {
                if (newLine[j] === newLine[j - 1]) {
                    newLine[j] = newLine[j] * 2;
                    newLine[j - 1] = 0;
                    score += parseInt(newLine[j]);
                }
            }
            newLine = slide(newLine);
            let missing = size - newLine.length;
            let zeros = Array(missing).fill(0);
            newLine = zeros.concat(newLine);
            if (!moved) {
                moved = !newLine.every((val, index) => val === line[index]);
            }
            for (let j = 0; j < size; j++) {
                newBoard[j * size + i] = newLine[j];
            }
        }
        return newBoard;
    }

    function updateBoard(newBoard) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const tile = board[i * size + j];
                const newValue = newBoard[i * size + j] || '';
                const oldValue = tile.innerHTML;

                if (newValue !== oldValue) {
                    tile.innerHTML = newValue;
                    tile.className = 'tile';
                    if (newValue) {
                        tile.classList.add(`tile-${newValue}`);
                    }
                }
            }
        }
    }

    function moveTiles(direction) {
        moved = false;
        let newBoard;
        switch (direction) {
            case 'left':
                newBoard = leftMergeBoard(board);
                break;
            case 'right':
                newBoard = rightMergeBoard(board);
                break;
            case 'up':
                newBoard = upMergeBoard(board);
                break;
            case 'down':
                newBoard = downMergeBoard(board);
                break;
        }
        if (moved) {
            updateBoard(newBoard);
            setTimeout(() => {
                updateScore();
                generateTile();
                let gameStatus = gameOver();
                if (gameStatus.done) {
                    if (gameStatus.win) {
                        alert(`You win! Your score is ${gameStatus.score}`);
                    } else {
                        alert(`Game over! Your score is ${gameStatus.score}`);
                    }
                    resetGame();
                }
            }, 200); // Wait for the animation to complete
        }
    }

    function slide(row) {
        row = row.filter(num => num);
        return row;
    }


    function updateScore() {
        scoreDisplay.innerHTML = score;
    }

    function control(e) {
        if (e.keyCode === 37 || e.target === leftButton) {
            // left
            moveTiles('left');
        } else if (e.keyCode === 38 || e.target === upButton) {
            // up
            moveTiles('up');
        } else if (e.keyCode === 39 || e.target === rightButton) {
            // right
            moveTiles('right');
        } else if (e.keyCode === 40 || e.target === downButton) {
            // down
            moveTiles('down');
        }
    }
    function gameOver() {
        let done = false;
        let win = false;
        let full = true;
        for (let i = 0; i < board.length; i++) {
            if (board[i].innerHTML == '') {
                full = false;
            }

            if (board[i].innerHTML == 2048) {
                done = true;
                win = true;
                return {done: done, score: score, win: win};
            }
        }

        returnObj = {
            done: full,
            score: score,
            win: false
        }

        return returnObj;
    }

    function resetGame() {
        board.forEach(tile => {
            tile.innerHTML = '';
            tile.className = 'tile';
        });
        score = 0;
        updateScore();
        generateTile();
        generateTile();
    }

    document.addEventListener('keyup', control);
    upButton.addEventListener('click', control);
    downButton.addEventListener('click', control);
    leftButton.addEventListener('click', control);
    rightButton.addEventListener('click', control);
    resetButton.addEventListener('click', resetGame);
    createBoard();
});
