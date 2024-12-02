class Board {
    constructor(gridWidth, gridHeight) {
        this.width = gridWidth;
        this.height = gridHeight;
        this.board = Array(gridWidth*gridHeight).fill().map(u => {
            return ({
              "moisture": 1,
              "sunlight": 0,
              "crop": null,
              "growth": 0,
              "stage": 0,
            })
        });
    }

    toIndex(i, j) {
        return j * this.width + i
    }

    getEntry(i, j) {
        return this.board[this.toIndex(i, j)];
    }

    setEntry(i, j, newEntry) {
        this.board[this.toIndex(i, j)] = newEntry;
    }
}