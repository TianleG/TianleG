class Game {
    constructor() {
        this.board = document.getElementById('game-board');
        this.stepsElement = document.getElementById('steps');
        this.resetButton = document.getElementById('reset-btn');
        this.sizeSelect = document.getElementById('size-select');
        this.tiles = [];
        this.emptyIndex = null;
        this.steps = 0;
        this.currentSize = 4;

        this.init();
        this.addEventListeners();
    }

    init() {
        this.currentSize = parseInt(this.sizeSelect.value);
        this.emptyIndex = this.currentSize ** 2 - 1;
        this.createTiles();
        this.shuffleTiles();
        this.updateGridLayout();
    }

    createTiles() {
        this.board.innerHTML = '';
        this.tiles = [];
        
        const totalTiles = this.currentSize ** 2 - 1;
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = i + 1;
            tile.dataset.index = i;
            this.tiles.push(tile);
        }
        
        const emptyTile = document.createElement('div');
        emptyTile.className = 'tile empty';
        emptyTile.dataset.index = totalTiles;
        this.tiles.push(emptyTile);
    }

    updateGridLayout() {
        this.board.style.gridTemplateColumns = `repeat(${this.currentSize}, 1fr)`;
        this.board.style.gridTemplateRows = `repeat(${this.currentSize}, 1fr)`;
        this.board.replaceChildren(...this.tiles);
    }

    shuffleTiles() {
        let shuffleSteps = this.currentSize * 20;
        while (shuffleSteps--) {
            const neighbors = this.getNeighbors(this.emptyIndex);
            const randomIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.swapTiles(randomIndex, this.emptyIndex);
            this.emptyIndex = randomIndex;
        }
        this.steps = 0;
        this.stepsElement.textContent = this.steps;
    }

    getNeighbors(index) {
        const neighbors = [];
        const size = this.currentSize;
        const row = Math.floor(index / size);
        const col = index % size;
        
        if (row > 0) neighbors.push(index - size);
        if (row < size - 1) neighbors.push(index + size);
        if (col > 0) neighbors.push(index - 1);
        if (col < size - 1) neighbors.push(index + 1);
        
        return neighbors;
    }

    swapTiles(index1, index2) {
        [this.tiles[index1], this.tiles[index2]] = [this.tiles[index2], this.tiles[index1]];
        this.tiles[index1].dataset.index = index1;
        this.tiles[index2].dataset.index = index2;
    }

    moveTile(index) {
        if (this.getNeighbors(this.emptyIndex).includes(index)) {
            this.swapTiles(index, this.emptyIndex);
            this.emptyIndex = index;
            this.steps++;
            this.stepsElement.textContent = this.steps;
            this.updateGridLayout();
            
            if (this.checkWin()) {
                setTimeout(() => {
                    alert(`恭喜你赢了！步数: ${this.steps}`);
                }, 100);
            }
        }
    }

    checkWin() {
        return this.tiles.every((tile, index) => {
            if (index === this.tiles.length - 1) return true;
            return tile.textContent === String(index + 1);
        });
    }

    addEventListeners() {
        this.board.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile:not(.empty)');
            if (tile) {
                const index = parseInt(tile.dataset.index);
                this.moveTile(index);
            }
        });

        this.resetButton.addEventListener('click', () => {
            this.init();
        });

        this.sizeSelect.addEventListener('change', () => {
            this.init();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});