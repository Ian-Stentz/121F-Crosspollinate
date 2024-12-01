class Farm extends Phaser.Scene {
    constructor() {
        super("farmScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        //any initialization of global variables go here
        this.board = new Board(6, 6);
    }

    create() {
        //creation of world objects goes here
    }

    update() {
        //update function goes here
    }

    draw() {
        this.drawBoard();
    }

    //helper functions go here
    drawBoard() {
        let width = game.config.width/this.board.width;
        let height = game.config.height/this.board.height;
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                stroke("black");
                strokeWeight(3);
                //in future, fill could change given certain factors or be replaced with a sprite/tile
                fill("#118c13");
                rect(i*width, j*height, width, height);
                stroke("white");
                text("☀️: " + this.board.getEntry(i, j).sunlight, i*width + width/12, j*height + height/8);
                text("💧: " + this.board.getEntry(i, j).moisture, i*width + width/12, j*height + height/3);
                if(this.board.getEntry(i, j)["crop"] != null) {
                //fill("#1e833b");
                //rect(i*width+3*width/5, j*height+height/2,width/5, height/3);
                //drawPlant(board, i, j);
                }
            }
        }
    }
}