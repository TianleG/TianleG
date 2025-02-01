class LatinSquareGame {
    constructor(size) {
        this.size = size;
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.init();
    }

    init() {
        this.generateSolution();
        this.createBoard();
        this.renderBoard();
    }

    generateSolution() {
        // Create base row
        const baseRow = Array.from({ length: this.size }, (_, i) => i + 1);

        // Generate complete solution
        this.solution = Array.from({ length: this.size }, (_, i) => {
            const rotated = [...baseRow];
            for (let j = 0; j < i; j++) {
                rotated.push(rotated.shift());
            }
            return rotated;
        });

        // Shuffle rows
        for (let i = 0; i < this.size; i++) {
            const j = Math.floor(Math.random() * this.size);
            [this.solution[i], this.solution[j]] = [this.solution[j], this.solution[i]];
        }

        // Shuffle columns
        for (let i = 0; i < this.size; i++) {
            const j = Math.floor(Math.random() * this.size);
            for (let k = 0; k < this.size; k++) {
                [this.solution[k][i], this.solution[k][j]] = [this.solution[k][j], this.solution[k][i]];
            }
        }

        // Create initial board with some numbers revealed
        this.board = this.solution.map(row => row.map(cell => ({
            value: null,
            fixed: false
        })));

        // Reveal some numbers randomly
        const cellsToReveal = Math.floor(this.size * this.size * 0.3);
        for (let i = 0; i < cellsToReveal; i++) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (!this.board[row][col].fixed) {
                this.board[row][col] = {
                    value: this.solution[row][col],
                    fixed: true
                };
            }
        }
        console.log(this.solution);
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        const numberSelector = document.getElementById('numberSelector');
        gameBoard.innerHTML = '';
        numberSelector.innerHTML = '';

        // Create number selector
        for (let i = 1; i <= this.size; i++) {
            const numBtn = document.createElement('div');
            numBtn.className = 'number-btn';
            numBtn.textContent = i;
            numBtn.addEventListener('click', () => this.handleNumberSelect(i));
            numberSelector.appendChild(numBtn);
        }

        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'row';

            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.board[i][j].fixed) {
                    const content = document.createElement('span');
                    content.className = 'cell-content';
                    content.textContent = this.board[i][j].value;
                    cell.classList.add('fixed');
                    cell.appendChild(content);
                } else {
                    cell.classList.add('selectable');
                    const content = document.createElement('span');
                    content.className = 'cell-content';
                    cell.appendChild(content);
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    cell.addEventListener('click', (e) => this.handleCellClick(e));
                }

                row.appendChild(cell);
            }
            gameBoard.appendChild(row);
        }
    }

    handleCellClick(event) {
        const cell = event.currentTarget;
        if (cell.classList.contains('fixed')) return;

        // Remove previous selection
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        // Select new cell
        this.selectedCell = cell;
        cell.classList.add('selected');
    }

    handleNumberSelect(number) {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        this.board[row][col].value = number;
        this.selectedCell.querySelector('.cell-content').textContent = number;
        this.selectedCell.classList.remove('selected');
        this.selectedCell = null;
    }

    handleInput(event) {
        const input = event.target;
        const value = parseInt(input.value);
        if (value >= 1 && value <= this.size) {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            this.board[row][col].value = value;
        } else {
            input.value = '';
        }
    }

    checkSolution() {
        // 检查是否所有格子都已填写
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j].value === null) {
                    return false;
                }
            }
        }

        // 检查每一行
        for (let i = 0; i < this.size; i++) {
            const rowNumbers = new Set();
            for (let j = 0; j < this.size; j++) {
                const num = this.board[i][j].value;
                // 检查数字是否在有效范围内
                if (num < 1 || num > this.size) {
                    return false;
                }
                // 检查是否重复
                if (rowNumbers.has(num)) {
                    return false;
                }
                rowNumbers.add(num);
            }
        }

        // 检查每一列
        for (let j = 0; j < this.size; j++) {
            const colNumbers = new Set();
            for (let i = 0; i < this.size; i++) {
                const num = this.board[i][j].value;
                // 检查是否重复
                if (colNumbers.has(num)) {
                    return false;
                }
                colNumbers.add(num);
            }
        }

        return true;
    }

    renderBoard() {
        const cells = document.querySelectorAll('#gameBoard .cell.selectable');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.board[row][col].value;
            cell.querySelector('.cell-content').textContent = value || '';
        });
    }

    showSolution() {
        // 临时保存当前状态
        const currentState = this.board.map(row => row.map(cell => ({ ...cell })));

        // 显示完整解答
        this.board = this.solution.map(row => row.map(value => ({
            value: value,
            fixed: true
        })));

        this.renderBoard();

        // 2.5秒后开始淡出动画，只针对非预设的数字
        setTimeout(() => {
            const contents = document.querySelectorAll('.cell:not(.fixed) .cell-content');
            contents.forEach(content => content.classList.add('fade-out'));

            // 等待淡出动画完成后恢复原状态
            setTimeout(() => {
                this.board = currentState;
                this.renderBoard();
                contents.forEach(content => content.classList.remove('fade-out'));
            }, 2000);
        }, 1000);
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    let game = new LatinSquareGame(3);
    const nextLevelDialog = document.getElementById('nextLevelDialog');

    // 添加对话框按钮事件监听
    document.getElementById('continueGame').addEventListener('click', () => {
        const currentSize = parseInt(document.getElementById('sizeSelect').value);
        if (currentSize < 5) {  // 最大限制为5x5
            const nextSize = currentSize + 1;
            document.getElementById('sizeSelect').value = nextSize;
            game = new LatinSquareGame(nextSize);
        }
        nextLevelDialog.style.display = 'none';
    });

    document.getElementById('stayHere').addEventListener('click', () => {
        nextLevelDialog.style.display = 'none';
    });

    document.getElementById('newGame').addEventListener('click', () => {
        const size = parseInt(document.getElementById('sizeSelect').value);
        game = new LatinSquareGame(size);
        const message = document.getElementById('message');
        message.textContent = '';
        message.className = '';
    });

    document.getElementById('checkSolution').addEventListener('click', () => {
        const message = document.getElementById('message');
        if (game.checkSolution()) {
            message.textContent = '拉丁方补全成功！';
            message.className = 'success';

            // 显示继续闯关对话框
            nextLevelDialog.style.display = 'flex';
            nextLevelDialog.querySelector('.dialog').classList.add('active');
        } else {
            message.textContent = '拉丁方有错误，请检查！';
            message.className = 'error';
        }
    });

    document.getElementById('showSolution').addEventListener('click', () => {
        if (confirm('确定要查看答案吗？这可能会降低游戏的乐趣。')) {
            if (confirm('60秒广告解锁答案')) {
                game.showSolution();
            }
        }
    });
});
