class Farm extends Phaser.Scene {
    constructor() {
        super("farmScene");
    }

    preload() {
        //any loading not done in Load.js goes here
    }

    init() {
        //any initialization of global variables go here

        this.eventEmitter = new Phaser.Events.EventEmitter();

        // this.brambleberry = new plantType(.7, 2.5, 1.5, plant1Imgs);
        // this.wheat = new plantType(1, 2, 1, plant2Imgs);
        // this.gilderberry = new plantType(.4, 4, 2.5, plant3Imgs); 

        // plantTypes = new Map([["Brambleberry", brambleberry], ["Wheat", wheat], ["Gilderberry", gilderberry]]);
        // seedPacket = Array.from(plantTypes.keys());
      
        // for(let plantType of plantTypes.keys()) {
        //   inventory.setPlantCount(plantType, 0);
        // }

        this.frame = 0;
    }

    create() {
        //creation of world objects goes here
        this.board = new Board(6, 6);

        this.drawBoard();

        this.input.keyboard.on('keydown-SPACE', () => {this.sunUpdate(0, 1, 5)}, this);

        //my.player = this.add.image(0, 0, "player");
        my.player = new Player(this, 0, 0, "player", null);
        //my.player.setScale(0.3, 0.3);
    }

    tick() {
        //no update, only our turn-based tick
        this.frame++;
    }

    update() {
    }

    //helper functions go here
    drawBoard() {
        let tileWidth = game.config.width/this.board.width;
        let tileHeight = game.config.height/this.board.height;
        for (let i = 0; i < this.board.width; i++) {
            for (let j = 0; j < this.board.height; j++) {
                let newRect = this.add.rectangle(i*tileWidth, j*tileHeight, tileWidth, tileHeight, 0x118c13, 1);
                newRect.setOrigin(0)
                newRect.setStrokeStyle(3, 0x000000);
                let fontSize = 14;
                let padding = 6;
                let fontSettings = {
                    fontFamily: 'utf-8',
                    fontSize: `${fontSize}px`,
                    padding: {
                        left: padding,
                        top: padding,
                    }}
                let sunText = this.add.text(i*tileWidth, j*tileHeight, "☀️: " + this.board.getEntry(i, j).sunlight, fontSettings).setOrigin(0);
                this.eventEmitter.on("sunUpdate" + i + j, (newSun) => {
                    sunText.text = "☀️: " + newSun;
                }, this)
                let waterText = this.add.text(i*tileWidth + 2, j*tileHeight + fontSize + padding, "💧: " + this.board.getEntry(i, j).moisture, fontSettings).setOrigin(0);
                //if(this.board.getEntry(i, j)["crop"] != null) {
                //drawPlant(board, i, j);
                //}
            }
        }
    }

    sunUpdate(x, y, newSun) {
        this.eventEmitter.emit("sunUpdate" + x + y, newSun);
    }
}